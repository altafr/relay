# Relay — Multi-agent Content Studio

A polished demo product that turns one topic, URL, or block of source text into channel-ready social content using a visible team of specialist AI agents.

## The agent team

- **Scout** extracts useful claims, facts, and angles from the source.
- **Muse** chooses the narrative and channel strategy.
- **Scribe** creates platform-native drafts for LinkedIn, X, and Instagram.
- **Pulse** reviews clarity, tone, and quality before publishing.
- **Orchestrator** coordinates the handoffs and assembles the final outputs.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env`, add an [OpenRouter API key](https://openrouter.ai/keys), then run the app. `OPENROUTER_MODEL` accepts any model slug from the [OpenRouter catalog](https://openrouter.ai/models); `openrouter/auto` lets OpenRouter choose a suitable model for each agent call.

Open `http://localhost:3000`, change the input, and press **Create content**. With a key, Relay runs a real research → strategy → parallel writing → quality-review pipeline. Without a key, its built-in engine still creates source-specific LinkedIn, X, and Instagram drafts so the full product remains usable during a live demonstration.

### Input behavior

- **Topic** sends the exact typed topic into the research and strategy brief.
- **URL** fetches the page server-side, removes scripts/styles/markup, and uses the extracted title and readable text as agent context. Local/private network URLs, unsafe redirects, non-text responses, and oversized pages are rejected.
- **Paste text** normalizes the supplied material and instructs Scout to synthesize it before downstream writing.
- Each tab preserves its own unfinished draft when you switch between input modes.

## Tests

```bash
npm test
```

The automated suite covers topic context, pasted-text synthesis context, URL extraction, redirects, HTML cleanup, unsafe URL rejection, and per-tab draft preservation.

## 90-second demo script

1. Explain that one large prompt is being replaced by four focused specialists.
2. Switch between **Topic**, **URL**, and **Paste text** to show the supported inputs.
3. Press **Create content** and narrate the agent handoffs as they animate.
4. Switch between LinkedIn, X, and Instagram to show channel-native outputs.
5. Use **Copy** to demonstrate the final publish-ready handoff.

## How the live agent pipeline works

The server runs Scout first, passes its research to Muse, fans out three Scribe workers in parallel, and finishes with Pulse as a shared evaluator. API keys remain server-side and are never sent to the browser. The model badge shows whether the current run used OpenRouter or the deterministic fallback.
