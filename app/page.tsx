'use client';

import { useRef, useState } from 'react';

type Channel = 'LinkedIn' | 'X / Twitter' | 'Instagram';
type InputMode = 'Topic' | 'URL' | 'Paste text';
type ContentResult = { eyebrow: string; body: string; meta: string };

const agents = [
  { name: 'Scout', role: 'Research', icon: '⌕', color: 'lime' },
  { name: 'Muse', role: 'Strategy', icon: '◇', color: 'blue' },
  { name: 'Scribe', role: 'Writer', icon: '✎', color: 'orange' },
  { name: 'Pulse', role: 'Quality', icon: '✓', color: 'pink' },
];

const fallbackResults: Record<Channel, ContentResult> = {
  LinkedIn: {
    eyebrow: 'Thought leadership · 176 words',
    body: `Your best marketing team might not be a team at all.\n\nWe gave 4 AI agents one brief and watched them work:\n\n→ Scout found the sharpest angle\n→ Muse shaped the narrative\n→ Scribe adapted it for every channel\n→ Pulse challenged every weak claim\n\nThe result wasn't just faster content. It was more considered content — because each agent had one job and a clear standard for success.\n\nThe future of content isn't one giant prompt. It's a small, focused team that never loses the thread.`,
    meta: 'Professional · Insight-led · 5 hashtags',
  },
  'X / Twitter': {
    eyebrow: 'Thread · 5 posts',
    body: `1/ Your best marketing team might be made of agents.\n\nWe gave 4 AI specialists one brief. Here's what happened 🧵\n\n2/ One researched. One found the story. One wrote for the channel. One tried to break the draft.\n\n3/ The unlock wasn't more AI. It was clearer roles.\n\n4/ Every handoff added context instead of losing it.\n\n5/ Stop asking one prompt to do five jobs. Build a tiny team.`,
    meta: 'Punchy · Educational · Thread format',
  },
  Instagram: {
    eyebrow: 'Carousel · 6 slides',
    body: `SLIDE 1\nYour new content team never sleeps.\n\nSLIDE 2\nOne topic. Four specialist agents.\n\nSLIDE 3\nSCOUT finds the signal.\n\nSLIDE 4\nMUSE finds the story.\n\nSLIDE 5\nSCRIBE writes. PULSE makes it better.\n\nSLIDE 6\nDon't write more. Orchestrate better.`,
    meta: 'Bold · Visual · Carousel-ready',
  },
};

export default function Home() {
  const [topic, setTopic] = useState('Why multi-agent AI teams are the future of creative work');
  const [active, setActive] = useState<Channel>('LinkedIn');
  const [inputMode, setInputMode] = useState<InputMode>('Topic');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generatedResults, setGeneratedResults] = useState(fallbackResults);
  const [qualityScore, setQualityScore] = useState(94);
  const [runMode, setRunMode] = useState('OpenRouter ready');
  const resultsRef = useRef<HTMLElement>(null);

  async function generate() {
    if (!topic.trim()) return;
    setProgress(4);
    setRunning(true);
    setHasGenerated(false);
    setCopied(false);
    setRunMode('Agents running via OpenRouter');

    const timer = window.setInterval(() => setProgress((value) => Math.min(88, value + 3)), 300);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: topic, inputMode, audience: 'Tech leaders', tone: 'Smart and bold' }),
      });
      const data = await response.json() as { outputs?: Record<Channel, ContentResult>; score?: number; model?: string; error?: string };
      if (!response.ok || !data.outputs) throw new Error(data.error || 'Generation failed');
      setGeneratedResults(data.outputs);
      setQualityScore(data.score || 90);
      setRunMode(`Live · ${data.model || 'OpenRouter'}`);
    } catch {
      setGeneratedResults(fallbackResults);
      setQualityScore(94);
      setRunMode('Demo fallback · add OpenRouter key for live AI');
    } finally {
      window.clearInterval(timer);
      setProgress(100);
      setRunning(false);
      setHasGenerated(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }

  async function copyResult() {
    await navigator.clipboard?.writeText(generatedResults[active].body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  const activeAgent = running ? Math.min(3, Math.floor(progress / 25)) : 4;
  const placeholders: Record<InputMode, string> = {
    Topic: 'What should your content team write about?',
    URL: 'Paste an article, launch page, or source URL…',
    'Paste text': 'Paste notes, a transcript, or a rough draft…',
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Relay home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>relay</span>
        </a>
        <div className="top-actions">
          <span className="model-badge">✦ {runMode}</span>
          <span className="demo-badge"><span /> Demo workspace</span>
          <button className="icon-button" aria-label="Open settings">☼</button>
          <span className="avatar">AK</span>
        </div>
      </header>

      <div className="app-shell">
        <aside className="sidebar">
          <nav aria-label="Main navigation">
            <p className="nav-label">Workspace</p>
            <a className="nav-item active" href="#"><span>✦</span> Create</a>
            <a className="nav-item" href="#"><span>◴</span> Library <b>12</b></a>
            <a className="nav-item" href="#"><span>▫</span> Templates</a>
          </nav>
          <div className="side-bottom">
            <div className="tip-card">
              <span className="tip-icon">✳</span>
              <strong>Built with Codex</strong>
              <p>4 agents collaborated on this content run.</p>
              <a href="#pipeline">See the workflow →</a>
            </div>
            <a className="nav-item" href="#"><span>?</span> Help & shortcuts</a>
          </div>
        </aside>

        <section className="workspace">
          <div className="hero-row">
            <div>
              <p className="kicker">MULTI-AGENT CONTENT STUDIO</p>
              <h1>One idea. Every channel.<br/><em>Made together.</em></h1>
              <p className="subtitle">Drop in a topic, URL, or raw text. Your AI content team researches, strategizes, writes, and polishes — in parallel.</p>
            </div>
            <div className="agent-orbit" aria-label="Four specialist agents">
              <div className="orbit-core"><span>✦</span><small>ORCHESTRATOR</small></div>
              {agents.map((agent, index) => (
                <div className={`orbit-agent orbit-${index + 1} ${agent.color}`} key={agent.name}>
                  <span>{agent.icon}</span><small>{agent.name}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="composer">
            <div className="input-tabs">
              {(['Topic', 'URL', 'Paste text'] as InputMode[]).map((mode) => (
                <button key={mode} className={inputMode === mode ? 'selected' : ''} onClick={() => { setInputMode(mode); setTopic(''); }}>{mode}</button>
              ))}
            </div>
            <textarea value={topic} placeholder={placeholders[inputMode]} onChange={(event) => setTopic(event.target.value)} aria-label={`Content source: ${inputMode}`} />
            <div className="composer-footer">
              <div className="options"><button>Audience: <strong>Tech leaders</strong> ⌄</button><button>Tone: <strong>Smart & bold</strong> ⌄</button></div>
              <button className="generate" onClick={generate} disabled={running || !topic.trim()}><span>✦</span>{running ? 'Agents working…' : 'Create content'}</button>
            </div>
          </div>

          <section className="pipeline" id="pipeline">
            <div className="section-heading"><div><span className="live-dot" /> AGENT WORKFLOW</div><p>{running ? `${progress}% complete` : hasGenerated ? 'Run complete' : 'Ready to run'}</p></div>
            <div className="agent-grid">
              {agents.map((agent, index) => {
                const state = running ? (index < activeAgent ? 'done' : index === activeAgent ? 'working' : 'waiting') : 'done';
                return <article className={`agent-card ${agent.color} ${state}`} key={agent.name}>
                  <div className="agent-icon">{agent.icon}</div>
                  <div><strong>{agent.name}</strong><p>{agent.role}</p></div>
                  <span className="status">{state === 'done' ? '✓ Done' : state === 'working' ? '• Working' : 'Waiting'}</span>
                  <small>{['Extracted key insights', 'Built content angle', 'Drafted 3 formats', `Quality score: ${qualityScore}`][index]}</small>
                </article>;
              })}
            </div>
          </section>

          {hasGenerated && <section className="results results-revealed" ref={resultsRef}>
            <div className="ready-banner"><span>✓</span><div><strong>3 channel drafts are ready</strong><small>Reviewed by Pulse · Quality score {qualityScore} · {runMode}</small></div></div>
            <div className="result-top"><div><span>OUTPUTS</span><h2>Ready to publish</h2></div><button className="more-button">•••</button></div>
            <div className="channel-tabs">
              {(Object.keys(generatedResults) as Channel[]).map((channel) => <button key={channel} onClick={() => setActive(channel)} className={active === channel ? 'active' : ''}><span>{channel === 'LinkedIn' ? 'in' : channel === 'X / Twitter' ? '𝕏' : '◉'}</span>{channel}</button>)}
            </div>
            <div className="output-card">
              <div className="output-header"><span>{generatedResults[active].eyebrow}</span><div><button aria-label="Edit content">✎</button><button onClick={copyResult}>{copied ? '✓ Copied' : '▣ Copy'}</button></div></div>
              <p className="output-copy">{generatedResults[active].body}</p>
              <div className="output-footer"><span>{generatedResults[active].meta}</span><button onClick={generate}>Regenerate ↻</button></div>
            </div>
          </section>}
        </section>
      </div>
    </main>
  );
}
