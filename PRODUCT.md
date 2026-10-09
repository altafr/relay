# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Presenters, educators, and content teams demonstrating or using a multi-agent social-content workflow. The primary use scene is a live, time-bounded demonstration in which the operator must enter a source, see specialist handoffs, and show publish-ready results without explaining the interface first.

## Product Purpose

Relay turns a topic, public URL, or pasted source into coordinated LinkedIn, X, and Instagram content. Success means every output remains grounded in the supplied subject, shares one recognizable voice, and is easy to inspect and copy during a live demo.

## Positioning

Relay makes the orchestration visible: Scout researches, Muse selects one strategy, Scribe adapts it by channel, Frame creates a matching LinkedIn banner, and Pulse blocks or repairs drift before results are returned.

## Operating Context

The product runs as a responsive web application and as a published OpenAI Site. A presenter switches between Topic, URL, and Paste text inputs, runs the workflow, narrates agent progress, compares three channel drafts, downloads the LinkedIn banner, and copies final content.

## Capabilities and Constraints

- Topic mode performs live web research through OpenRouter.
- URL and Paste text modes remain bounded to the supplied material.
- OpenRouter text and image models are configured through server-side environment variables.
- Drafts for each input mode persist when switching tabs.
- The interface must represent loading, source errors, model errors, completed outputs, copy confirmation, and responsive layouts.
- API keys must never reach the browser.

## Brand Commitments

The product name is Relay. The user requested a minimal Apple-style interface: familiar controls, system typography, restrained motion, functional translucency, and a calm, precise working surface.

## Evidence on Hand

The repository contains the working multi-agent route, deterministic fallback, source-ingestion tests, topic-fidelity tests, generated social-preview artwork, and a living 30-minute instructor script. No customer claims, testimonials, or performance benchmarks are available and none should be invented.

## Product Principles

- Keep the source and subject visible through every handoff.
- Make agent specialization understandable without adding cognitive load.
- Prefer honest failure states over unrelated fallback content.
- Keep the common demonstration path obvious and fast.
- Adapt format by channel while preserving one thesis and voice.

## Accessibility & Inclusion

The interface must support keyboard focus, reduced motion, reduced transparency, sufficient contrast, clear labels, and responsive operation on desktop and mobile web.
