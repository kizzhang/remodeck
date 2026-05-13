#!/usr/bin/env node
/**
 * remodeck single-file bundler.
 *
 * Pipeline:
 *   1. assert dist/ exists (caller must run `npm run build` first)
 *   2. mirror dist/ → exports/__TOPIC__-html/ with portable URL rewrites
 *   3. inline CSS / JS into a single HTML file with base64 assets
 *
 * The `__TOPIC__` slot is replaced by the bootstrap script with the deck slug.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const exportDir = path.join(root, "exports");
const htmlDir = path.join(exportDir, "__TOPIC__-html");
const outFile = path.join(exportDir, "__TOPIC__-single-file.html");
const ASSETS_GLOBAL = "__REMODECK_ASSETS__";

const mimeByExt = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function mimeFor(file) {
  return mimeByExt[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function makeBuildPortable(dir) {
  const files = await walk(dir);
  const textFiles = files.filter((file) => /\.(html|js|css)$/.test(file));
  for (const file of textFiles) {
    const original = await fsp.readFile(file, "utf8");
    const portable = original
      .replace(/(["'`])\/(assets|images|videos)\//g, "$1./$2/")
      .replace(/url\(\s*\/(assets|images|videos)\//g, "url(./$1/");
    if (portable !== original) await fsp.writeFile(file, portable);
  }
}

function toDataUri(file) {
  const bytes = fs.readFileSync(file);
  return `data:${mimeFor(file)};base64,${bytes.toString("base64")}`;
}

function replaceQuotedAssetStrings(source, assetRels) {
  let next = source;
  for (const rel of assetRels) {
    const escaped = escapeRegExp(rel);
    for (const prefix of ["./", "/"]) {
      const quoted = new RegExp(`(["'\`])${escapeRegExp(prefix)}${escaped}\\1`, "g");
      next = next.replace(quoted, `window.${ASSETS_GLOBAL}[${JSON.stringify(rel)}]`);
    }
  }
  return next;
}

function replaceCssAssetUrls(source, assetMap) {
  let next = source;
  for (const [rel, dataUri] of Object.entries(assetMap)) {
    const escaped = escapeRegExp(rel);
    for (const prefix of ["./", "/"]) {
      const urlPattern = new RegExp(
        `url\\(\\s*(["']?)${escapeRegExp(prefix)}${escaped}\\1\\s*\\)`,
        "g"
      );
      next = next.replace(urlPattern, `url("${dataUri}")`);
    }
  }
  return next;
}

function patchRemotionStaticFile(source) {
  // Remotion's minified staticFile helper inlines paths at build time.
  // Patch the published shape to read from our embedded asset map first.
  const needle = "Hi=e=>{";
  const replacement =
    `Hi=e=>{if(typeof window<"u"&&window.${ASSETS_GLOBAL}&&window.${ASSETS_GLOBAL}[e])return window.${ASSETS_GLOBAL}[e];`;
  if (!source.includes(needle)) {
    return source;
  }
  return source.replace(needle, replacement);
}

async function main() {
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error(`Missing dist/index.html. Run \`npm run build\` first.`);
  }

  await fsp.rm(htmlDir, { recursive: true, force: true });
  await fsp.mkdir(exportDir, { recursive: true });
  await fsp.cp(distDir, htmlDir, { recursive: true });
  await makeBuildPortable(htmlDir);

  const files = await walk(htmlDir);
  const assetFiles = files.filter((file) => {
    const rel = path.relative(htmlDir, file).replaceAll(path.sep, "/");
    return (
      /^(assets|images|videos)\//.test(rel) &&
      !/\.(css|js)$/.test(rel) &&
      !rel.includes("/.")
    );
  });

  const assetMap = {};
  for (const file of assetFiles) {
    const rel = path.relative(htmlDir, file).replaceAll(path.sep, "/");
    assetMap[rel] = toDataUri(file);
  }

  const indexPath = path.join(htmlDir, "index.html");
  let html = await fsp.readFile(indexPath, "utf8");

  html = html.replace(/<link rel="preconnect"[^>]+>\s*/g, "");
  html = html.replace(
    /<link\s+href="https:\/\/fonts\.googleapis\.com\/[^"]+"\s+rel="stylesheet"\s*\/?>\s*/g,
    ""
  );

  const cssLinks = [...html.matchAll(/<link rel="stylesheet" crossorigin href="([^"]+)">/g)];
  for (const match of cssLinks) {
    const href = match[1];
    const cssPath = path.join(htmlDir, href.replace(/^\.\//, ""));
    let css = await fsp.readFile(cssPath, "utf8");
    css = replaceCssAssetUrls(css, assetMap);
    html = html.replace(match[0], () => `<style>\n${css}\n</style>`);
  }

  const scriptTags = [
    ...html.matchAll(/<script type="module" crossorigin src="([^"]+)"><\/script>/g),
  ];
  for (const match of scriptTags) {
    const src = match[1];
    const jsPath = path.join(htmlDir, src.replace(/^\.\//, ""));
    let js = await fsp.readFile(jsPath, "utf8");
    js = patchRemotionStaticFile(js);
    js = replaceQuotedAssetStrings(js, Object.keys(assetMap));
    html = html.replace(
      match[0],
      () =>
        `<script>\nwindow.${ASSETS_GLOBAL}=${JSON.stringify(assetMap)};\n</script>\n<script type="module">\n${js.replaceAll("</script", "<\\/script")}\n</script>`
    );
  }

  await fsp.writeFile(outFile, html);
  const stat = await fsp.stat(outFile);
  process.stdout.write(`Single file HTML: ${outFile}\n`);
  process.stdout.write(`Size: ${(stat.size / 1024 / 1024).toFixed(1)} MB\n`);
  process.stdout.write(`Embedded assets: ${assetFiles.length}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
