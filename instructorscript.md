# Relay: 30-Minute Multi-Agent Codex Demo

> Living instructor guide. Update this file whenever the product flow, agent roles, or demo behavior changes.

## Session promise

By the end of 30 minutes, the audience should understand why multi-agent workflows can outperform a single large prompt, how an orchestrator coordinates specialist agents, and how Codex can rapidly turn the idea into a showcase-ready product.

## Before the session

- Open the deployed Relay site and sign in with ChatGPT if prompted.
- Keep the project folder and this script open in Codex.
- Use the default topic: **Why multi-agent AI teams are the future of creative work**.
- Confirm the **Create content** button starts the animated workflow.
- Confirm the page automatically moves to **3 channel drafts are ready** when generation finishes.
- Confirm Topic, URL, and Paste text each preserve their own draft when switching tabs.
- In URL mode, point out the source label in the green completion banner; it confirms which fetched page grounded the run.
- Add `OPENROUTER_API_KEY` to `.env` for live generation. Set `OPENROUTER_MODEL=openrouter/auto` or choose any OpenRouter model slug.
- Allow roughly 45–90 seconds for a live run: it performs Scout and Muse sequentially, three Scribe calls in parallel, then the Pulse review.
- If a key is unavailable or the provider fails, Relay's built-in engine still creates topic-specific content so the stage demo remains fully interactive.

## 0:00–3:00 — Hook: one prompt is doing too many jobs

Say:

> Most content automation begins with one enormous prompt: research this, find an angle, write three posts, fact-check them, and make everything sound good. That is like hiring one person to be your researcher, strategist, writer, and editor at the same time.

Ask the audience:

> Which of those roles would you least want to combine in a real team?

Teaching point: prompts become brittle when they contain several competing goals. Multi-agent systems turn each goal into a focused responsibility.

## 3:00–7:00 — Introduce the agent team

Point to the agent orbit in Relay.

- **Scout — Research:** extracts claims, facts, themes, and useful source material.
- **Muse — Strategy:** selects the core angle, audience promise, and narrative.
- **Scribe — Writer:** converts the strategy into channel-native drafts.
- **Pulse — Quality:** reviews clarity, tone, repetition, and unsupported claims.
- **Orchestrator:** manages context and decides what each specialist receives next.

Say:

> The key design decision is not the number of agents. It is the contract between them: what each receives, what each must return, and what quality bar allows the work to move forward.

## 7:00–11:00 — Explain the workflow

Sketch or describe this sequence:

```text
Topic / URL / raw text
        ↓
Scout: structured research brief
        ↓
Muse: channel strategy and chosen angle
        ↓
Scribe workers: LinkedIn, X, Instagram
        ↓
Pulse: shared evaluation and revision notes
        ↓
Publish-ready content package
```

Teaching points:

- Agents should exchange structured artifacts, not vague chat history.
- Some work is sequential because it depends on prior context.
- Channel drafts can fan out in parallel once the strategy is stable.
- An evaluator agent should have a rubric, not merely an instruction to “make it better.”
- The orchestrator owns retries, failures, and the final assembled response.

## 11:00–17:00 — Live product demo

### Step 1: Show flexible inputs

Switch between **Topic**, **URL**, and **Paste text**.

Say:

> The interface accepts different sources, but normalizes all of them into the same research brief. That lets every downstream agent use one predictable format.

Return to **Topic** and enter:

> Why multi-agent AI teams are the future of creative work

### Step 2: Start the run

Press **Create content**.

Narrate the cards as they activate:

- “Scout is separating signal from source material.”
- “Muse is choosing one story instead of summarizing everything.”
- “Scribe is adapting the idea to each platform’s native format.”
- “Pulse is applying a consistent quality bar.”

When the run completes, emphasize that Relay reveals the outputs and automatically moves them into view.

### Step 3: Compare channel outputs

Open each tab:

- **LinkedIn:** narrative, credibility, and professional reflection.
- **X / Twitter:** concise hooks and a thread structure.
- **Instagram:** a visual carousel with one idea per slide.

Say:

> Repurposing is not copying. The strategy stays consistent, while the expression changes for the channel.

Use **Copy** once to show the publish-ready handoff.

## 17:00–22:00 — Show how Codex built it

Explain the build process at a high level:

1. Codex translated the idea into a concrete product surface.
2. The interface made the agent roles and handoffs visible.
3. A subagent independently created the social-preview artwork.
4. The app was built, checked, and privately published.
5. A user-observed issue became a product improvement: outputs now reveal and scroll into view after completion.

Teaching point:

> Multi-agent work is useful not only inside the product. It can also help build the product, with the primary agent owning integration and specialists handling bounded tasks.

## 22:00–26:00 — Production architecture

Be explicit about the showcase boundary:

> Relay can run live through OpenRouter or fall back to deterministic outputs. The selected model lives in `.env`, so we can swap models without editing application code.

Describe a production implementation:

- A server endpoint receives the source, audience, tone, and selected channels.
- Scout returns structured JSON containing claims, evidence, themes, and uncertainties.
- Muse returns a strategy object with the central angle and channel guidance.
- Several Scribe workers run in parallel, one per selected channel.
- Pulse scores each draft against a rubric and requests targeted revisions.
- The interface streams agent status events and final drafts back to the user.

Useful safeguards:

- Treat URLs and pasted text as untrusted source material.
- Require citations for factual claims derived from external sources.
- Put limits on retries, runtime, and token usage.
- Keep a human approval step before anything is posted publicly.
- Store intermediate artifacts for observability and debugging.

## 26:00–29:00 — Audience design exercise

Ask:

> If you adapted this system for your own work, what specialists would you create?

Invite two or three examples. Help convert roles into agent contracts:

- What input does the agent receive?
- What exact artifact must it return?
- How is quality evaluated?
- Can it run in parallel, or does it depend on another agent?

Potential examples:

- Sales: account researcher, personalization strategist, email writer, compliance reviewer.
- Learning: curriculum planner, lesson writer, assessment designer, pedagogy reviewer.
- Product: feedback synthesizer, opportunity analyst, spec writer, risk reviewer.

## 29:00–30:00 — Close

Say:

> The future is not a collection of agents talking forever. It is a well-designed workflow where every agent has a job, every handoff has a format, and a human remains in control of the outcome.

Finish with three takeaways:

1. Split work by responsibility, not novelty.
2. Make handoffs structured and observable.
3. Design the demo path before adding production complexity.

## Questions you may get

### Why not use one powerful model?

A single model is often enough for simple tasks. Multiple agents become useful when the work has distinct roles, parallel branches, independent review, or artifacts that benefit from different instructions and context.

### Are these separate models?

They can be, but they do not need to be. An “agent” is mainly a role with its own instructions, context, tools, and output contract. Several agents may use the same underlying model.

### Does more agents mean better results?

No. Each agent adds cost, latency, and coordination overhead. Add an agent only when it creates a meaningful boundary, enables parallel work, or improves verification.

### How do agents share context?

Prefer small structured outputs—research briefs, strategy objects, drafts, and rubric scores—over passing an unlimited transcript to every agent.

### Is the current demo generating live AI content?

If `OPENROUTER_API_KEY` is configured, yes: Scout, Muse, the three parallel Scribe workers, and Pulse all make real model calls through OpenRouter. The model badge shows the model returned by OpenRouter. Without a key, Relay clearly labels the run as a demo fallback.

## Demo recovery plan

If the deployed site asks for authentication, use **Continue with ChatGPT** and return to the home page.

If generation appears stuck, refresh once, keep the default topic, and run it again.

If the network is unavailable, run the project locally and open `http://localhost:3000`.

If time is running short, skip the architecture deep dive and demonstrate the workflow plus the three channel outputs.

## Change log

- Added the complete 30-minute instructor narrative and production architecture notes.
- Updated the demo flow so completed outputs reveal only after generation and automatically scroll into view.
- Added real OpenRouter orchestration with model selection through `.env` and a functional topic-specific built-in engine when no key is configured.
- Verified a complete live OpenRouter run across all six model calls; the Auto Router selected `deepseek/deepseek-v4-flash-0731` for the test run and returned all three channel drafts plus a Pulse score.
- Preserved separate drafts for Topic, URL, and Paste text so switching input modes never clears the presenter’s work.
- Added distinct input processing: exact topic briefs, safe URL fetching and readable-text extraction, and pasted-text normalization for synthesis.
- Tightened the agent contract so all channel drafts must use at least two concrete source details; live URL verification returned source-grounded drafts for “Example Domain.”
- Added a reader fallback for public pages protected by access challenges, including OpenAI article URLs that return `403` to ordinary server-side fetches.
- Updated the reader fallback to use edge-compatible manual redirect handling for hosted Sites.
- Hardened URL ingestion with standard-port enforcement, internal-host blocking, bounded downloads, article-first extraction, Markdown cleanup, and explicit untrusted-source boundaries.
- Expanded source input from 15,000 to 150,000 characters and optimized large-source orchestration so only Scout receives the full payload.
