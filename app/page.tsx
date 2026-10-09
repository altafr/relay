'use client';

import { useRef, useState } from 'react';
import { buildFallbackResults, type ContentResult, type PostBanner } from '../lib/fallback-content';
import { initialSourceDrafts, updateSourceDraft } from '../lib/input-drafts';

type Channel = 'LinkedIn' | 'X / Twitter' | 'Instagram';
type InputMode = 'Topic' | 'URL' | 'Paste text';
type AgentState = 'idle' | 'waiting' | 'working' | 'done';
type IconName = 'relay' | 'search' | 'strategy' | 'write' | 'image' | 'check' | 'copy' | 'download' | 'refresh';

const agents: Array<{ name: string; role: string; icon: IconName; stage: number }> = [
  { name: 'Scout', role: 'Research', icon: 'search', stage: 0 },
  { name: 'Muse', role: 'Strategy', icon: 'strategy', stage: 1 },
  { name: 'Scribe', role: 'Channel copy', icon: 'write', stage: 2 },
  { name: 'Frame', role: 'LinkedIn visual', icon: 'image', stage: 3 },
  { name: 'Pulse', role: 'Final review', icon: 'check', stage: 4 },
];

const channelLabels: Record<Channel, string> = {
  LinkedIn: 'LinkedIn',
  'X / Twitter': 'X',
  Instagram: 'Instagram',
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'relay') return <svg {...common}><path d="M5 7.5h4v9H5zM10.5 4h4v16h-4zM16 9.5h3v7h-3z" /></svg>;
  if (name === 'search') return <svg {...common}><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4.2 4.2"/></svg>;
  if (name === 'strategy') return <svg {...common}><path d="m12 3 2.2 5.1L19 10l-4.8 1.9L12 17l-2.2-5.1L5 10l4.8-1.9L12 3Z"/><path d="m18.5 16 .8 1.7L21 18.5l-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8.8-1.7Z"/></svg>;
  if (name === 'write') return <svg {...common}><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>;
  if (name === 'image') return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 5"/></svg>;
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
  if (name === 'copy') return <svg {...common}><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>;
  if (name === 'download') return <svg {...common}><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></svg>;
  return <svg {...common}><path d="M20 7v5h-5"/><path d="M18.2 16.5A8 8 0 1 1 20 12"/></svg>;
}

export default function Home() {
  const [active, setActive] = useState<Channel>('LinkedIn');
  const [inputMode, setInputMode] = useState<InputMode>('Topic');
  const [sources, setSources] = useState<Record<InputMode, string>>({ ...initialSourceDrafts });
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<Record<Channel, ContentResult>>(() => buildFallbackResults('multi-agent content creation'));
  const [qualityScore, setQualityScore] = useState(0);
  const [runMode, setRunMode] = useState('OpenRouter ready');
  const [sourceLabel, setSourceLabel] = useState('');
  const [banner, setBanner] = useState<PostBanner | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLElement>(null);
  const source = sources[inputMode];

  async function generate() {
    if (!source.trim()) return;
    setProgress(4);
    setRunning(true);
    setHasGenerated(false);
    setCopied(false);
    setError('');
    setBanner(null);
    setRunMode('Agents working');

    const timer = window.setInterval(() => setProgress((value) => Math.min(92, value + 2)), 400);
    let shouldShowResults = true;
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, inputMode, audience: 'Tech leaders', tone: 'Smart and bold' }),
      });
      const data = await response.json() as { outputs?: Record<Channel, ContentResult>; banner?: PostBanner; score?: number; model?: string; error?: string; source?: { label?: string } };
      if (!response.ok || !data.outputs) {
        if (response.status >= 400 && response.status < 500 && response.status !== 503) throw new Error(`SOURCE_ERROR:${data.error || 'The source could not be processed.'}`);
        if (response.status === 503) throw new Error('USE_FALLBACK');
        throw new Error(`RUN_ERROR:${data.error || 'The live agent run failed. Please try again.'}`);
      }
      setGeneratedResults(data.outputs);
      setQualityScore(data.score || 0);
      setRunMode(data.model || 'OpenRouter');
      setSourceLabel(data.source?.label || source.slice(0, 80));
      setBanner(data.banner || null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '';
      if (message.startsWith('SOURCE_ERROR:') || message.startsWith('RUN_ERROR:')) {
        shouldShowResults = false;
        setError(message.replace(/^(SOURCE_ERROR|RUN_ERROR):/, ''));
        setRunMode('Run failed');
      } else if (message === 'USE_FALLBACK') {
        setGeneratedResults(buildFallbackResults(source));
        setQualityScore(0);
        setRunMode('Built-in mode');
        setSourceLabel(source.slice(0, 80));
        setBanner(null);
      } else {
        shouldShowResults = false;
        setError(message || 'The live agent run failed. Please try again.');
        setRunMode('Run failed');
      }
    } finally {
      window.clearInterval(timer);
      setProgress(100);
      setRunning(false);
      setHasGenerated(shouldShowResults);
      if (shouldShowResults) window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }

  async function copyResult() {
    await navigator.clipboard?.writeText(generatedResults[active].body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function agentState(stage: number): AgentState {
    if (!running) return hasGenerated ? 'done' : 'idle';
    const currentStage = progress < 18 ? 0 : progress < 36 ? 1 : progress < 56 ? 2 : progress < 76 ? 3 : 4;
    if (stage < currentStage) return 'done';
    if (stage === currentStage) return 'working';
    return 'waiting';
  }

  const placeholders: Record<InputMode, string> = {
    Topic: 'What should your content team write about?',
    URL: 'Paste a public article or product URL',
    'Paste text': 'Paste notes, a transcript, or source material',
  };

  return (
    <main className="app">
      <header className="app-header">
        <div className="header-inner">
          <a className="brand" href="#workspace" aria-label="Relay home"><span className="brand-icon"><Icon name="relay" size={17}/></span><span>Relay</span></a>
          <div className="header-status" aria-live="polite"><span className={`status-light ${running ? 'is-running' : hasGenerated ? 'is-complete' : ''}`}/><span>{runMode}</span><span className="header-divider"/><span>Demo workspace</span></div>
        </div>
      </header>

      <div className="workspace" id="workspace">
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">Create once.<br/><span>Publish everywhere.</span></h1>
          <p>Give Relay a topic or source. Five specialists research, shape, write, illustrate, and review one consistent social story.</p>
        </section>

        <section className="composer" aria-label="Create social content">
          <div className="source-tabs" role="tablist" aria-label="Source type">
            {(['Topic', 'URL', 'Paste text'] as InputMode[]).map((mode) => (
              <button key={mode} type="button" role="tab" aria-selected={inputMode === mode} className={inputMode === mode ? 'is-selected' : ''} onClick={() => setInputMode(mode)}>{mode}</button>
            ))}
          </div>
          <textarea value={source} placeholder={placeholders[inputMode]} onChange={(event) => setSources((current) => updateSourceDraft(current, inputMode, event.target.value))} aria-label={`${inputMode} source`} />
          <div className="composer-footer">
            <div className="brief-details" aria-label="Content settings"><span>Tech leaders</span><span>Smart &amp; bold</span></div>
            <button className="primary-action" type="button" onClick={generate} disabled={running || !source.trim()}><span>{running ? 'Creating' : 'Create content'}</span><svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          </div>
          {running && <div className="progress-track" role="progressbar" aria-label="Agent workflow progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ transform: `scaleX(${progress / 100})` }}/></div>}
        </section>

        {error && <div className="error-message" role="alert"><span><Icon name="relay" size={16}/></span><div><strong>Relay couldn’t complete this run.</strong><p>{error}</p></div><button type="button" onClick={generate}>Try again</button></div>}

        <section className="workflow" aria-labelledby="workflow-title">
          <div className="section-title"><h2 id="workflow-title">Your content team</h2><span>{running ? `${progress}%` : hasGenerated ? 'Complete' : 'Ready'}</span></div>
          <ol className="agent-rail">
            {agents.map((agent) => {
              const state = agentState(agent.stage);
              return <li className={`agent-step ${state}`} key={agent.name} aria-label={`${agent.name}, ${agent.role}: ${state}`}>
                <span className="agent-symbol"><Icon name={agent.icon} size={17}/></span>
                <span className="agent-copy"><strong>{agent.name}</strong><small>{agent.role}</small></span>
                <span className="agent-state">{state === 'working' ? 'Working' : state === 'done' ? 'Done' : state === 'waiting' ? 'Waiting' : 'Ready'}</span>
              </li>;
            })}
          </ol>
        </section>

        {hasGenerated && <section className="results" ref={resultsRef} aria-labelledby="results-title">
          <div className="result-heading">
            <div><h2 id="results-title">Ready to publish</h2><p>{sourceLabel}{qualityScore > 0 ? ` · Pulse ${qualityScore}` : ''}</p></div>
            <div className="completion-mark" aria-label="Generation complete"><Icon name="check" size={19}/></div>
          </div>

          <div className="channel-tabs" role="tablist" aria-label="Social channel">
            {(Object.keys(generatedResults) as Channel[]).map((channel) => <button type="button" role="tab" aria-selected={active === channel} key={channel} onClick={() => setActive(channel)} className={active === channel ? 'is-active' : ''}>{channelLabels[channel]}</button>)}
          </div>

          <article className="output-panel">
            <div className="output-toolbar">
              <span>{generatedResults[active].eyebrow}</span>
              <button type="button" onClick={copyResult}><Icon name={copied ? 'check' : 'copy'} size={15}/>{copied ? 'Copied' : 'Copy'}</button>
            </div>
            {active === 'LinkedIn' && banner && <figure className="linkedin-banner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.dataUrl} alt={banner.alt}/>
              <figcaption><span>Frame · Monochrome banner</span><a href={banner.dataUrl} download={`relay-linkedin-banner.${banner.fileExtension}`}><Icon name="download" size={15}/>Download</a></figcaption>
            </figure>}
            <p className="output-copy">{generatedResults[active].body}</p>
            <div className="output-footer"><span>{generatedResults[active].meta}</span><button type="button" onClick={generate}><Icon name="refresh" size={14}/>Regenerate</button></div>
          </article>
        </section>}
      </div>
    </main>
  );
}
