# Remodeck Skill · 重写设计 spec

**Date**: 2026-05-13
**Target skill path**: `~/.claude/skills/remodeck/`
**Scope**: 完整重写 SKILL.md / references / agents / templates 内部，**保留 `remodeck` 名字**

---

## 0 · Motivation

现版 `remodeck`（14KB SKILL.md + 4 subagent + 8 契约 + 5-phase）对"做个有动画的 talk deck"这件事来说太重。痛点：

- 8 契约 + plan-checker 中间挡板对 brainstorm-driven 的小型 talk 工程是 overhead
- 美学完全交给用户在 Phase 0 自己抽取（design-extractor），落地成本高
- subagent 数量多 → 主线程上下文反复换手
- 没有 "先生几张 representative slide 让用户审" 这个 gate，容易一次性出 30 页才发现风格不对

重写目标：**direction 预设固化美学 → brainstorm 对话产 prose spec → 先生 3 代表页给用户审 → 通过才量产 → 用户授权才 bundle 单 HTML**。

---

## 1 · Workflow（5 步）

```
Step 0 ─ 选 direction（一开始就定，全程不换）
         magazine（再选 Monocle/WIRED/Kinfolk/Domus/Lab）/ swiss / editorial-dark
         选完立即 bootstrap 工程骨架（拷 templates）→ 后续所有 step 在这个工程里跑

Step 1 ─ Brainstorm 对话（主线程逐题问）
         · 主题 + 受众 + 时长 + 场景
         · 硬约束（必须包含 X / 不能出现 Y）
         · 大纲叙事弧 → 估 slide_count
         · 是否需要 Remotion 帧精动画？要的话动画规划是什么
           （哪几页、每个动画的目的与时长、是否复用 codex 的 A*）
         → 输出 docs/brainstorm/<topic>-spec.md（大纲段 + 动画规划段）

Step 2 ─ 每页 prose spec（5 行人话格式，见 §2）
         主线程逐页产出，用户在 spec.md 上审 / 改
         → 追加进同一份 spec.md

Step 3 ─ 3 张 representative slides（实代码 + dev server）
         · 封面 P01
         · 中段高密度页（带图 或 带 Remotion）
         · quote / 总结页
         dev server 跑起来，用户浏览器现场审 layout / 字号 / 动画
         反馈 → 主线程改 spec + 改 3 张 slide → 反复直到全过

Step 4 ─ 批量生剩余 slide（dev server 继续看）
         全部 slide 写完且用户初步过目后，spawn visual-reviewer
         （6 轴截图打分，一次性批量跑，不在量产中段跑）
         不过的页面回炉重改 → 再 spawn 直到全过

Step 5 ─ ✋ 等用户明确说"全部 OK，导出 portable HTML"
         才执行 npm run build && node scripts/make-single-html.mjs
         → exports/<topic>-single-file.html
```

**两个 user gate**：
- **Gate A**（Step 3 → Step 4）：3 代表页用户审过才进量产
- **Gate B**（Step 4 → Step 5）：用户明确说要导出才 bundle，绝不自动跑

---

## 2 · 每页 prose spec 格式

**不用 YAML**。每页一段 5 行人话，字段固定：

```markdown
### P01 · Cover · "AI Productivity Plan"

- **文字**：hero "AI Productivity Plan" + 副标 "Field Note 01" + 元数据 "Spring 2026 · AI Club"
- **图片**：无
- **Remotion 动画**：无（motion stagger 入场即可）
- **排版**：左半屏大字 hero，右半屏让给背景，底部 chrome 1/30
- **stages**：1 stage 一次性入场 / 念稿 ~45 秒
```

```markdown
### P15 · 对齐失败 · Summer Yue · "AI 也会失控"

- **文字**：kicker "ALIGNMENT FAILURE" + headline "Summer Yue 的 1,847 封删信" + 引文一段
- **图片**：无（动画占视觉重心）
- **Remotion 动画**：有 · 15 秒 5 场景 · 指令邮件 → 收件箱涌入 80 封 + 计数器 12→1847 → 自动删信 pulsing 红 → STOP 按钮 → 引言定格。复用 codex `A06_AlignmentFailure` 思路
- **排版**：上半屏 headline + kicker，下半屏整个让给 Remotion composition
- **stages**：1 stage（动画自播） / 念稿 ~60 秒
```

```markdown
### P22 · 三档生产力 · 高密度对比页

- **文字**：3 张 stat 卡 · "10× 倍" / "3 类岗位重塑" / "65% 渗透率" + 每卡一行注释
- **图片**：splash https://images.unsplash.com/photo-... (3:2)，放右下角占 30% 宽
- **Remotion 动画**：无
- **排版**：12 列 grid，左 4 列大 kicker + headline，右 8 列横排 3 张 stat 卡
- **stages**：4 stages 逐张点出来（先框架→1→2→3）/ 念稿 ~90 秒
```

**字段语义**：

| 字段 | 内容 | 不存在时 |
|---|---|---|
| 文字 | headline / subhead / body / 列表 / 引文 / kicker | 写"无（纯视觉页）" |
| 图片 | "AI 生成 + prompt 描述" 或 "splash URL" 或 "本地 path" + 位置占比 | 写"无" |
| Remotion 动画 | 是否需要 + 几秒 + 几场景 + 大致情节 + 是否复用 A* | 写"无" |
| 排版 | 一句话描述大致摆位（不画 grid 坐标） | 必填 |
| stages | 几 stages（点几次出现）+ 念稿秒数估算 | 必填 |

**硬规则**：
- 文字字段：headline ≤ 12 字（中）/ 8 字（英）；body 每段 ≤ 60 字；list ≤ 5 item（超 5 强制分 stage）
- 排版描述**不画**坐标，只一句话——具体看 Step 3 真 slide
- stages 行最后顺手挂念稿秒数（防超时）

---

## 3 · Direction 系统（多方向核心）

每个 direction = 1 个自包含 markdown 文件（references/directions/<name>.md），含：

- 1 套 :root tokens.css（多 theme preset 之间切换）
- 8–10 个 layout 骨架代码块（直接可粘的 React 组件 / className 名）
- 该方向擅长的 motion recipe 列表
- chrome（顶部 meta）/ foot（底部 meta）样式
- 推荐的 Remotion 动画使用密度（默认偏好）

```
references/directions/
├── magazine.md
│   · 5 子方向：Monocle / WIRED / Kinfolk / Domus / Lab
│   · 共享：衬线标题 + 非衬线正文 + 等宽元数据 + 横向翻页感
│   · 各子方向：1 套主题色 :root + layout 偏好 + 推荐 slide_count
│   · 动画密度：motion 主，Remotion 少（杂志感不靠帧精动画）
│
├── swiss.md
│   · 单方向，Inter + Klein 蓝 IKB + Carbon 2x grid + ASCII 呼吸场
│   · theme preset：IKB / Field Yellow / Sumi 黑 / Walnut（4 套）
│   · 动画密度：motion 主，Remotion 中等（数据可视化偶尔用）
│
└── editorial-dark.md
    · 暖深底 + 铜 rule + Serif Display + 复古印刷感
    · theme preset：标准暖深 / 沉深紫 / 海军蓝（3 套）
    · 动画密度：Remotion 多（A* 风的小视频穿插是这风格的灵魂）
```

**Step 0 选定 direction 后**：
- 主线程读对应 direction 文件
- 拷对应 `_tokens/<direction-preset>.template.css` 进 src/styles/tokens.css
- 后续 brainstorm + spec + slide 都在确定的工程里跑
- **全程不换 direction**——半路换 = 前面 slide 全废

**扩展**：加 direction = 加 1 个 markdown 文件 + 加 1–N 个 `_tokens/<...>.template.css`。SKILL.md 不动。

---

## 4 · 仓库布局 + Bootstrap + Build gate

### 4.1 · Skill 目录结构

```
~/.claude/skills/remodeck/
├── SKILL.md                          # ~6KB，4 段 workflow + cutoff
├── agents/
│   └── visual-reviewer.md             # 唯一 subagent · 6 轴 pair scoring
├── references/
│   ├── BRAINSTORM.md                  # Step 1 的 5 题对话模板 + 大纲叙事弧
│   ├── SPEC.md                        # §2 prose 5 行格式 + 写法示例库
│   ├── ARCHITECTURE.md                # Slide / DeckStage / animationBus 详解
│   ├── ANIMATIONS.md                  # motion recipe 字典 + Remotion 何时启用 + A* 复用
│   ├── ASSETS.md                      # Vertex AI prompt 模板 + splash 引入 + 轻 manifest
│   └── directions/
│       ├── magazine.md
│       ├── swiss.md
│       └── editorial-dark.md
└── templates/
    ├── package.template.json          # react/vite/motion/remotion/google-fonts
    ├── vite.config.template.ts
    ├── App.template.tsx               # 拷自 codex（键控 + AnimatePresence）
    ├── DeckStage.template.tsx
    ├── Slide.template.tsx
    ├── animationBus.template.ts       # ← → 键先喂当前 stage，再换 slide
    ├── make-single-html.template.mjs  # 拷自 codex
    └── _tokens/
        ├── magazine-monocle.template.css
        ├── magazine-wired.template.css
        ├── magazine-kinfolk.template.css
        ├── magazine-domus.template.css
        ├── magazine-lab.template.css
        ├── swiss-ikb.template.css
        ├── swiss-yellow.template.css
        ├── swiss-sumi.template.css
        ├── swiss-walnut.template.css
        ├── editorial-dark-standard.template.css
        ├── editorial-dark-plum.template.css
        └── editorial-dark-navy.template.css
```

### 4.2 · Bootstrap（Step 0 选完 direction 后跑一次）

```bash
SKILL=~/.claude/skills/remodeck
npm create vite@latest <topic> -- --template react-ts
cd <topic>
mkdir -p src/{slides,animations,deck,styles} public/{images,videos} assets docs/brainstorm scripts exports
cp $SKILL/templates/App.template.tsx           src/App.tsx
cp $SKILL/templates/DeckStage.template.tsx     src/deck/DeckStage.tsx
cp $SKILL/templates/Slide.template.tsx         src/deck/Slide.tsx
cp $SKILL/templates/animationBus.template.ts   src/deck/animationBus.ts
cp $SKILL/templates/make-single-html.template.mjs scripts/make-single-html.mjs
cp $SKILL/templates/_tokens/<chosen-preset>.template.css src/styles/tokens.css
npm install remotion @remotion/player @remotion/google-fonts motion
npm run dev
```

### 4.3 · Build gate（Step 5，用户授权后才跑）

```bash
npm run build
node scripts/make-single-html.mjs
# → exports/<topic>-single-file.html
```

`make-single-html.mjs` 拷自 ai-club-talk codex，把 dist/ 下的 JS/CSS/字体/图片全 base64 内联成单文件。

---

## 5 · Cutoff（边界，避免和别的 skill 重叠）

| 场景 | 走 | 不走 |
|---|---|---|
| Brainsorm-first + 多 direction + click-driven stage + Remotion 帧精动画 + 单 HTML 导出 | ✅ `remodeck`（本 skill） | |
| 录音旁白 + Whisper 对齐 + pixel-diff | | → `narrated-deck` |
| 出 MP4 留档 | | 用户自己 `npx remotion render` |
| 单镜头一个 animation | | → `remotion-best-practices` |
| 纯静态 HTML 单文件 deck | | → `guizang-ppt` / `html-ppt-*` |
| 纯海报 / 单张 | | → `image-poster` / `magazine-poster` |

---

## 6 · 跟现版 remodeck 的 diff（迁移要点）

| 现版 | 新版 |
|---|---|
| 8 契约硬约束 + plan-checker subagent | 软约束写进 references/，不当 gate；plan-checker 删除 |
| 4 phase（Brainstorm / Plan / Asset / Implement / Verify） | 5 step（Direction / Brainstorm / Spec / Repr Slide / Build），删除 Plan 这一层 |
| 4 subagent（deck-brainstormer / design-extractor / plan-checker / visual-reviewer） | 1 subagent（visual-reviewer） |
| design-extractor 抽取美学 | 砍掉 —— direction 预设包覆盖 |
| Phase 0 brainstorm 自审 4 项 | 砍 deck-brainstormer，主线程对话直接产 spec |
| ajv schema 校验 manifest | 砍 —— 改成 references/ASSETS.md 里的轻量 manifest 约定（人审） |
| 必须 `assertManifested(path)` runtime guard | 软约束，不强制（用户决定） |
| Phase 0 spec.md → spec → Phase 1 plan → Phase 2 asset → ... | spec.md 直接 → 3 代表页 → 全 slide |
| 没有 user-gated 中段审 | 加 Gate A（3 代表页审）+ Gate B（bundle 授权） |
| 没有 "make-single-html" 概念 | Step 5 明确 build-bundle 流 |
| 没有多 direction，靠 design-extractor 抽 | 3 个起步 direction（magazine + swiss + editorial-dark） |

**保留**：Slide.tsx 壳 / DeckStage / animationBus / ← → 键控 / visual-reviewer 6 轴 pair scoring / Vertex AI 生图。

---

## 7 · References / Templates 详细规格（实现时填）

下面列每份 reference / template 应包含什么，写实现 plan 时按这个对照：

- `references/BRAINSTORM.md`：Step 1 的 5 题模板逐题样例 + 大纲叙事弧 5 段（Hook/Context/Core/Shift/Takeaway）
- `references/SPEC.md`：§2 prose 5 行格式 + 10 种典型页的写法示例（cover / quote / stat / pipeline / image-split / animation / chapter / question / comparison / closing）
- `references/ARCHITECTURE.md`：Slide.tsx 接受的 props / DeckStage 责任 / animationBus.tryAnimationNav 协议 / URL ?slide= 持久化
- `references/ANIMATIONS.md`：
  - motion recipe 字典（stagger-list / pipeline / counter / fade-in-stack 等 8–12 个，含可拷的代码块）
  - Remotion 何时启用决策树（"motion 做不了什么 → 必须 Remotion"）
  - codex A01–A13 的复用 / 二改方法
- `references/ASSETS.md`：
  - Vertex AI Imagen prompt 模板（含 style descriptor slot）
  - splash 引入约定（unsplash / 本地）+ 命名 `{页号}-{语义}.{ext}`
  - 轻 manifest 约定（assets/_manifest.json，但只是文件清单，不上 ajv）
- `references/directions/magazine.md`：5 子方向各 1 套 :root + 5 推荐 layout + 共享 chrome 样式
- `references/directions/swiss.md`：4 theme preset + Carbon 2x grid + ASCII 呼吸场代码 + Klein 蓝 motion recipe 列表
- `references/directions/editorial-dark.md`：3 theme preset + 铜 rule 用法 + Remotion-friendly layout（让位给 composition）

`templates/` 文件实现时按 4.1 列表逐个对齐 codex 现成实现，做最小化抽象（去掉项目专属字符串，留 TODO slot）。

---

## 8 · Plan-stage decisions（已带默认 lean）

下面 4 项不阻塞 spec，但实现 plan 时需要拍板，括号里是建议默认：

- `make-single-html.mjs` 处理图片：base64 内联 vs 同级 `images/` 子目录 → **跟 codex 现有实现保持一致**（读 codex/scripts/make-single-html.mjs 后决定）
- direction 文件里 layout 骨架格式：React 组件代码 vs className 配方 + 简短 props → **className 配方**（轻，方向间易对齐）
- `agents/visual-reviewer.md`：fork 现版 6 轴 rubric vs 重写 → **fork**（减少改动面）
- 大纲叙事弧 5 段（Hook/Context/Core/Shift/Takeaway）模板：默认套用 vs 仅用户没大纲时启用 → **仅没大纲时启用**（有大纲不强加结构）
