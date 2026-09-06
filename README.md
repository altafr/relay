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

Open `http://localhost:3000`, change the input, and press **Create content**. The showcase flow is intentionally deterministic, so it works reliably without API keys during a live demo.

## 90-second demo script

1. Explain that one large prompt is being replaced by four focused specialists.
2. Switch between **Topic**, **URL**, and **Paste text** to show the supported inputs.
3. Press **Create content** and narrate the agent handoffs as they animate.
4. Switch between LinkedIn, X, and Instagram to show channel-native outputs.
5. Use **Copy** to demonstrate the final publish-ready handoff.

## Turning the demo into a live AI product

Connect the orchestrator to a server-side Codex/OpenAI workflow. Run Scout first, pass its structured findings to Muse, fan out Scribe workers by channel, and finish with Pulse as a shared evaluator. Keep the current deterministic data as a graceful demo fallback.
