# References · Per-page Spec (Step 2)

Each slide gets one 5-line prose block appended to `docs/brainstorm/<topic>-spec.md` under `## Per-page spec`. **No YAML.** Five fields, one line each.

## The format

```markdown
### P<NN> · <slot> · <name>

- **文字**: <headline / subhead / list / quote / kicker> 或 "无 (纯视觉页)"
- **图片**: "AI 生成 + <prompt>" 或 "splash <URL>" 或 "本地 <path>" + <位置 / 占比>; 或 "无"
- **Remotion 动画**: "是 · <Ns> · <N 场景> · <情节>" 或 "是 · 复用 <A* 名>" 或 "无"
- **排版**: 一句话描述大致摆位 (不画 grid 坐标; layout 在 Step 3 直观验)
- **stages**: <N stages> / <念稿秒数估算>
```

## Hard rules (the spec spec)

- Headlines ≤ 12 Chinese chars or ≤ 8 English words; body paragraphs ≤ 60 chars each; list items ≤ 5 per slide (split into multiple stages otherwise)
- The 排版 line is **prose only** — no `top: 200px` or `cols 1-4` numbers. Visual layout is verified at Step 3, not specified here.
- `stages` is the # of click-to-reveal layers + estimated narration seconds. Surface seconds catches over-stuffed slides early.
- Use 中文 if the talk is 中文, 英文 if 英文 — match the talk language.

## 10 typical-page examples (copy-paste templates)

### 1. Cover (P01)

```markdown
### P01 · Cover · "AI Productivity Plan"

- **文字**: hero "AI Productivity Plan" + 副标 "Field Note 01" + 元数据 "Spring 2026 · AI Club"
- **图片**: 无
- **Remotion 动画**: 无 (motion stagger 入场即可)
- **排版**: 左半屏大字 hero, 右半屏让给背景, 底部 chrome 1/30
- **stages**: 1 stage 一次性入场 / 念稿 ~45 秒
```

### 2. Quote / pull-quote

```markdown
### P07 · Quote · Karpathy on agents

- **文字**: 引文 "An agent doesn't reason, it iterates." · 署名 Andrej Karpathy · 出处 2024 talk
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 引文居中放大, 署名右下角斜体小, 上下细分隔线
- **stages**: 1 stage / 念稿 ~30 秒
```

### 3. Stat-card row

```markdown
### P22 · 三档生产力 · 高密度对比页

- **文字**: 3 张 stat 卡 · "10× 倍" / "3 类岗位重塑" / "65% 渗透率" + 每卡一行注释
- **图片**: splash https://images.unsplash.com/photo-... (3:2), 放右下角占 30% 宽
- **Remotion 动画**: 无
- **排版**: 12 列 grid, 左 4 列大 kicker + headline, 右 8 列横排 3 张 stat 卡
- **stages**: 4 stages 逐张点出来 (先框架→1→2→3) / 念稿 ~90 秒
```

### 4. Pipeline / process flow

```markdown
### P11 · Agent loop · "感知 → 规划 → 行动 → 反思"

- **文字**: 4 步标签 + 每步一行说明
- **图片**: 无
- **Remotion 动画**: 无 (motion pipeline recipe 就够)
- **排版**: 横向 4 节, 节间细 accent rule 连接, 念到哪节哪节亮起
- **stages**: 5 stages (框架 + 逐节) / 念稿 ~75 秒
```

### 5. Image-split (image + copy)

```markdown
### P05 · 起源 · Hinton 的 1986

- **文字**: kicker "ORIGIN" + headline "Hinton 1986" + 引文一段
- **图片**: splash https://upload.wikimedia.org/.../hinton.jpg (4:5 portrait), 占左 5 列
- **Remotion 动画**: 无
- **排版**: 左 5 列竖排人像, 右 7 列上 kicker 中 headline 下 引文
- **stages**: 1 stage / 念稿 ~50 秒
```

### 6. Full-Remotion (narrative inside one slide)

```markdown
### P15 · 对齐失败 · Summer Yue · "AI 也会失控"

- **文字**: kicker "ALIGNMENT FAILURE" + headline "Summer Yue 的 1,847 封删信" + 引文一段
- **图片**: 无 (动画占视觉重心)
- **Remotion 动画**: 是 · 15s · 5 场景 · 指令邮件 → 收件箱涌入 80 封 + 计数器 12→1847 → 自动删信 pulsing 红 → STOP 按钮 → 引言定格. 复用 codex A06_AlignmentFailure 思路
- **排版**: 上半屏 headline + kicker, 下半屏整个让给 Remotion composition
- **stages**: 1 stage (动画自播) / 念稿 ~60 秒
```

### 7. Chapter divider

```markdown
### P13 · Part II · "代理人"

- **文字**: 大字 chapter number "02" + chapter title "代理人" + 副标 "Agents"
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 左下角巨型 02, 右上 chapter title, 中间一条 accent rule
- **stages**: 1 stage / 念稿 ~15 秒
```

### 8. Question slide

```markdown
### P20 · 提问 · "如果模型真的赢了, 我们会做什么?"

- **文字**: 单一问题 (60-90 字), 无答案
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 问题居中放大, 周围大量留白
- **stages**: 1 stage / 念稿 ~40 秒 (含停顿)
```

### 9. Comparison (vs / vs)

```markdown
### P09 · "用 AI 写代码 vs 让 AI 写代码"

- **文字**: 左栏 "用 AI 写代码" + 4 bullet · 右栏 "让 AI 写代码" + 4 bullet
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 左右两栏对称, 中间一条 vertical accent rule, 上方共享 headline
- **stages**: 5 stages (框架 + 左 1 + 左 2 + 右 1 + 右 2 / 或按行同步) / 念稿 ~75 秒
```

### 10. Closing / takeaway

```markdown
### P28 · 结语 · "三件事"

- **文字**: takeaway list 3 项 + 演讲者署名 + 联系方式
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 居中 takeaway list, 下方 mono 署名 + 链接, accent rule 收尾
- **stages**: 4 stages (框架 + 逐条) / 念稿 ~60 秒
```

## Filling the prose

When unsure of a field, prefer **explicit "无"** over leaving it blank. The reader (you, in Step 3) needs to know "无 图片" is intentional, not a forgotten field.

When the 文字 field is long (e.g. an extended quote), inline the full text — the spec doc is the source of truth for content. Just keep individual lines ≤ 60 chars to keep the prose readable.
