---
title: Tools Shape Thinking
excerpt: The software we use every day quietly rewires how we approach problems. A meditation on the invisible influence of our chosen instruments.
status: published
publishedAt: 2026-02-20
tags:
  - thinking
  - craft
---

Marshall McLuhan said the medium is the message. He was talking about television, but the principle applies with even greater force to software. The tools we use to think with become, over time, indistinguishable from the thinking itself.

I noticed this most acutely when switching from a traditional note-taking app to a graph-based one. Within weeks, I was no longer writing linear notes. I was writing nodes. My thoughts began arriving pre-fragmented, sized to fit the tool's preferred unit. The tool had reshaped the thought before the thought was fully formed.

## The spreadsheet mind

Consider what spreadsheets did to business thinking. Before spreadsheets, a financial projection was a narrative argument. After spreadsheets, it became a grid of interdependent cells. The spreadsheet didn't just make calculations faster — it made certain kinds of thinking easier and other kinds nearly impossible.

![A valley where tools and landscape shape each other](/essays/tools-shape-thinking/valley-landscape.jpeg)
*A valley where tools and landscape shape each other*

Try expressing a nuanced competitive analysis in a spreadsheet. Try capturing the emotional tone of a customer interview in rows and columns. The tool resists. And because the tool resists, we stop trying. We start asking only the questions our tools can answer.

This is not a failure of the tools. It is a feature. Every tool is an opinion about what matters. A hammer says nails matter. A database says structured records matter. A kanban board says flow matters. When we adopt a tool, we adopt its opinions.

## The text editor as worldview

Programmers understand this intuitively. The choice between Vim and VS Code is not really about key bindings — it's about whether you believe editing should be a language (composable verbs and nouns) or a visual environment (panels, buttons, hover states). Each choice leads to a different relationship with code.

A Vim user thinks in composable commands:

```vim
ciw       " change inner word
da(       " delete around parentheses
gqip      " reformat inner paragraph
:%s/old/new/g  " replace everywhere
```

A VS Code user reaches for `Cmd+D` to select the next occurrence, `Cmd+Shift+L` to select all. Neither is wrong, but they produce different cognitive habits that extend beyond the editor.

I once paired with a developer who had used Vim exclusively for fifteen years. Watching them think about code was like watching someone think in a different language. They didn't see a file — they saw a series of patterns to be matched and transformed. The editor had become their internal representation of what code _was_.

## Writing tools and writing style

The tool-thought relationship is perhaps most visible in writing. Hemingway wrote standing up, on a typewriter, which enforced short sentences and immediate physicality. Proust wrote in bed, in longhand, which enabled (or perhaps demanded) his endless, recursive sentences.

Modern writing tools have their own opinions. Google Docs encourages collaboration and compromise — the tracked changes, the suggestion mode, the ever-present awareness that someone else might be reading. It produces committee prose.

A plain text editor encourages solitude. Markdown encourages structure. A distraction-free writing app like iA Writer encourages flow at the expense of revision. Each tool leaves fingerprints on the final text.

## Choosing consciously

The lesson is not that tools are bad, or that we should resist their influence. The lesson is that we should choose consciously. When you pick up a tool, ask: what does this tool want me to think? What questions does it make easy to ask? What questions does it make hard to ask?

Here is a simple exercise I do every quarter — a tool audit:

| Tool        | What it encourages       | What it suppresses        |
|-------------|--------------------------|---------------------------|
| Obsidian    | Linking, fragmentation   | Linear narrative          |
| Figma       | Collaboration, polish    | Rough sketching, speed    |
| Linear      | Velocity, throughput     | Ambiguity, exploration    |
| Terminal    | Precision, composability | Discoverability           |

And periodically, put the tool down entirely. Write by hand. Think without software. Not because analog is better — it isn't, necessarily — but because the gap between tool-shaped thinking and unmediated thinking reveals the shape of the tool itself.

The goal is not to escape influence. That's impossible. The goal is to know which influences you've chosen and which have chosen you.

## The compounding effect

Tool choices compound. A team that uses Jira thinks about work differently than a team that uses linear text documents. Not because Jira is worse (or better), but because Jira's structure — epics, stories, points, sprints — becomes the team's ontology. They begin to see all work as stories with points in sprints. Work that doesn't fit the structure becomes invisible.

![The landscape shapes thinking over time](/essays/tools-shape-thinking/valley-landscape.jpeg)
*The landscape shapes thinking over time*

This compounding effect means that tool choices made early in a project's life have outsized influence on its trajectory. The database schema chosen in week one shapes the product's capabilities in year five:

```sql
-- This innocent schema decision in week one...
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  org_id INTEGER REFERENCES orgs(id)
);

-- ...means you can never have a user in two orgs.
-- By year five, this is load-bearing architecture.
```

The communication tool chosen at founding shapes the company's culture at scale.

We tend to evaluate tools on their immediate utility: Is it fast? Is it cheap? Does it integrate with our other tools? But the more important question is: What kind of thinking does this tool produce? And is that the kind of thinking we need?

These are hard questions, and they don't have universal answers. But asking them is the beginning of a more intentional relationship with the instruments of our work.
