# References · Brainstorm (Step 1)

Main-thread, one question at a time. No subagent. The output of this step is `docs/brainstorm/<topic>-spec.md` with two sections: **Outline** and **Animation plan**.

## The 5 questions

Ask in order. Wait for an answer before asking the next.

### 1. Topic + audience

> "What's the topic, and who's the audience? Roughly how long is the talk?"

Drives slide_count and lexical register. Examples:
- "AI alignment for an academic CS audience, 45 min" → 18–25 slides, formal, lab/editorial-dark
- "Productivity tools for startup people, 25 min" → 12–18 slides, sharp, swiss-ikb or magazine-wired

### 2. Narrative arc

> "What's the through-line? Got a one-sentence pitch, or do you want me to suggest a 5-act structure?"

If user has a pitch, use it. If user has no arc, **only then** offer the 5-act template (default = opt-in):
1. **Hook** — surprising claim or question
2. **Context** — what's broken / what we know so far
3. **Core** — the new idea or evidence
4. **Shift** — implications / what changes
5. **Takeaway** — single takeaway with action

### 3. Hard constraints

> "Anything that MUST be on a specific slide (a name, an image, a claim)? Anything that absolutely can't appear?"

Capture verbatim. These become invariants the per-page spec must honor.

### 4. Remotion animation plan

> "Do any pages need a frame-precise animation — something CSS/motion can't do? (E.g. 'show 80 emails arrive, then counter ticks 12 → 1847, then a STOP button intervenes — all in one continuous 15s composition.') If yes, roughly which pages and what each does."

Output for each:
- Slide number (P-NN)
- Duration (seconds)
- 1-line plot synopsis
- Whether to reuse a codex `A*` pattern (e.g. "A06_AlignmentFailure")

### 5. Image / asset plan

> "For images — splash URLs you'll provide, AI-generated, or both? Any reference style for AI-generated ones?"

Capture URL list + style descriptor for AI-generated ones (e.g. "warm editorial paper texture, serif typography mood").

## Output template (write to `docs/brainstorm/<topic>-spec.md`)

```markdown
# <Topic> · Brainstorm

**Audience**: ...
**Length**: ... min
**Direction**: <direction>-<preset> (locked in Step 0)
**Estimated slide count**: ...

## Outline

P01 · <name>
P02 · <name>
...

## Hard constraints

- Must include: ...
- Must not include: ...

## Animation plan

- P-NN · <duration>s · <synopsis> · (reuse: <A* name or "new">)
- ...

## Style descriptor (for AI-generated images)

<one-line description, e.g. "warm editorial paper texture, serif typography mood, generous negative space, no stock-photo gloss">
```

## After Step 1

Append **per-page prose specs** in Step 2 to the **same file** (under a `## Per-page spec` heading). See `references/SPEC.md` for the 5-line format.
