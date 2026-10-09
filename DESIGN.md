---
name: Relay
description: A calm, source-first creative workspace for coordinated multi-agent publishing.
colors:
  canvas: "#f5f5f7"
  surface: "#ffffff"
  surface-muted: "#ececf0"
  ink: "#1d1d1f"
  secondary: "#6e6e73"
  tertiary: "#6e6e73"
  line: "#d8d8dc"
  accent: "#0071e3"
  accent-pressed: "#0066cc"
  success: "#248a3d"
  danger: "#c9342f"
  focus: "rgba(0, 113, 227, 0.34)"
typography:
  display:
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(3rem, 7vw, 5rem)"
    fontWeight: 690
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(1.8rem, 4vw, 2.5rem)"
    fontWeight: 680
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.68
    letterSpacing: "normal"
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  compact: "7px"
  control: "10px"
  notice: "14px"
  surface: "16px"
  full: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "72px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 15px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.accent-pressed}"
    textColor: "{colors.surface}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "7px 9px"
  segmented-control:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.control}"
    padding: "3px"
  segmented-control-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.compact}"
  composer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "12px"
  source-input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "24px 10px 18px"
    height: "142px"
  error-notice:
    backgroundColor: "#fff1f0"
    textColor: "#6f1d1b"
    rounded: "{rounded.notice}"
    padding: "12px 14px"
---

# Design System: Relay

## Overview

**Creative North Star: "The Calm Relay Desk"**

Relay is a focused creative work surface: cool, precise, and quietly capable. The source is always the center of gravity, while status, agent activity, and publishing tools recede until they are needed. The interface should feel like a well-resolved native productivity tool rather than a dashboard or a marketing site.

Its Apple-influenced restraint comes from system typography, cool-white tonal layers, graphite text, familiar control geometry, and one carefully rationed cobalt accent. Ambient depth separates the two primary working surfaces; thin dividers organize everything else. Motion communicates state transfer and materialization, never decoration.

**Key Characteristics:**

- Cool-white canvas with crisp white working surfaces and mist-gray control groups.
- Source-first hierarchy with large, tightly set graphite display type.
- Restrained cobalt reserved for selection, progress, focus, and primary action.
- A connected five-agent handoff rail instead of independent dashboard cards.
- Functional translucency confined to the sticky top bar.
- Immediate pressed feedback and short, restrained state transitions.

## Colors

The palette is a cool neutral field with a single cobalt interaction color, supported by quiet semantic green and red states.

### Primary

- **Relay Cobalt:** The sole action and live-state color, used for primary actions, selected affordances, progress, links, and the active agent.
- **Pressed Cobalt:** The darker hover treatment for the primary action.

### Neutral

- **Cool Canvas:** The page ground and the subtle fill behind metadata chips.
- **Clear Surface:** The composer, output panel, and selected segmented controls.
- **Mist Group:** The background for segmented controls and quiet grouping.
- **Graphite Ink:** Primary copy, brand text, and completed agent names.
- **Slate Secondary:** Supporting copy, inactive labels, and subdued headings.
- **Quiet Tertiary:** Placeholder, idle, and waiting-state text; it intentionally shares the secondary value in the default theme.
- **Hairline Gray:** Dividers, rails, and low-emphasis structure.
- **Focus Cobalt Wash:** The visible keyboard focus outline.
- **Success Green:** Completed workflow states and completion marks.
- **Error Red:** Failure icons and retry actions.

**The One Cobalt Rule.** Use cobalt only where the interface is selected, progressing, focused, or actionable; rarity preserves its meaning.

**The Cool Field Rule.** Keep major backgrounds within the cool-white and mist-gray family so content remains the visual artifact.

## Typography

**Display Font:** Native system sans (`-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`, `Helvetica Neue`, Arial, sans-serif)

**Body Font:** The same native system sans stack.

**Character:** Optical sizing, tight display tracking, and compact semibold labels create a native, precise voice. There is no decorative type pairing; hierarchy comes from scale, weight, tone, and line length.

### Hierarchy

- **Display** (690, fluid 3–5rem, 0.98 line-height): The primary workspace statement; tightly tracked and balanced.
- **Headline** (680, fluid 1.8–2.5rem, 1.05 line-height): Result-section headings and moments of completion.
- **Title** (650, 1rem, 1.2 line-height): Compact section headings and brand-level labels.
- **Body** (400, 0.94rem, 1.68 line-height): Generated content, constrained to about 72 characters per line for sustained reading.
- **Label** (600, 0.75rem): Tabs, state labels, compact actions, and metadata; sentence case rather than uppercase.

**The System Voice Rule.** Use the native sans stack everywhere; do not introduce a display face or monospace accent.

**The Tight-Then-Open Rule.** Headlines use tight tracking and compact line-height, while reading copy uses generous leading.

## Layout

Relay uses one centered reading-and-working column. The sticky header spans a wider 1080px container while the workspace is capped at 960px, both with 48px desktop gutters. The main workspace opens with 72px top space and 96px bottom space; major sections separate by 36–72px, while component interiors follow an 8–16px rhythm.

The source composer stays visually dominant above a single connected five-step rail. At 820px the rail wraps to a balanced three-plus-two grid. At 600px it becomes a vertical sequence, outer gutters contract to 14px, controls gain 44px touch targets, and results retain the same reading order without introducing alternate navigation.

**The One-Column Rule.** Extend the centered workspace before adding parallel columns; hierarchy comes from sequence, not dashboard density.

## Elevation & Depth

The system is flat by default and uses a hybrid of tonal layering, hairlines, and two ambient surface shadows. The composer uses a stronger ambient lift (`0 18px 50px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)`), while the result panel uses a slightly quieter lift (`0 16px 46px rgba(0, 0, 0, 0.07), 0 2px 7px rgba(0, 0, 0, 0.04)`). Selected segmented controls use only a compact contact shadow (`0 1px 4px rgba(0, 0, 0, 0.12)`).

The top bar alone uses translucency: a 78% cool-canvas wash with 22px blur and strong saturation. Users who prefer reduced transparency receive an opaque canvas bar.

**The Working-Surface Rule.** Ambient elevation belongs only to the composer and generated-output surface; ordinary groups remain flat and separated by tone or hairlines.

**The Functional Glass Rule.** Translucency is navigation context, never decorative card material.

## Shapes

Corners are softly continuous and compact. Small inline actions and selected tabs use 7–8px corners, icons and primary controls use 9–10px, notices use 14px, and major working surfaces use 16px. Circles are reserved for status lights and the completion mark. Borders are thin and quiet; content surfaces rely on clipping and ambient depth rather than outlined card chrome.

**The Nested Radius Rule.** Inner controls must be visibly tighter than the surface that contains them.

## Components

### Buttons

- **Shape:** Compact, softly rounded controls; primary actions use a 10px radius and a 40px minimum height, increasing to 44px touch targets on mobile where needed.
- **Primary:** White semibold label on Relay Cobalt with 15px horizontal padding and an inline directional icon.
- **Hover / Focus:** Hover deepens to Pressed Cobalt; active state scales to 97%; keyboard focus uses a 3px Focus Cobalt Wash outline with a 3px offset.
- **Quiet:** Transparent cobalt text actions use 7px corners and gain a pale cobalt wash on hover.
- **Disabled:** Preserve shape, remove pressed motion, and reduce opacity to 45%.

### Chips

- **Style:** Brief metadata uses compact 7px-radius chips with Cool Canvas fill and Slate Secondary text.
- **Responsive behavior:** On small screens, chips lose their fill and stack as plain metadata to conserve space.

### Cards / Containers

- **Corner Style:** Major working surfaces use 16px corners; error notices use 14px.
- **Background:** Clear Surface for active work, with very light gray toolbar bands where controls need separation.
- **Shadow Strategy:** Only composer and output panel receive ambient shadows; see Elevation & Depth.
- **Border:** Hairlines separate toolbars and footer rows. The error notice uses a pale red border.
- **Internal Padding:** Composer padding is 12px; output reading copy uses 30–32px desktop insets and 20–24px mobile insets.

### Inputs / Fields

- **Style:** The source textarea is borderless and transparent inside the composer, with large 1.3rem input text and a 142px minimum height.
- **Focus:** The field uses a cobalt caret; its enclosing focus treatment follows the shared 3px keyboard outline rule.
- **Error / Disabled:** Errors appear as a separate semantic notice rather than recoloring the source field.

### Navigation

- The sticky top bar presents only brand and run status. It uses a translucent cool-canvas layer, a single bottom hairline, and no global navigation chrome.
- Source and channel switching use compact segmented controls: Mist Group track, Slate Secondary idle labels, and a white selected segment with Graphite Ink and a contact shadow.

### Connected Agent Rail

The signature component is a single five-step handoff sequence. Each step shares top and bottom rails and thin internal dividers rather than becoming a card. The active specialist carries the cobalt indicator, lifts 2px, and receives a small cobalt ambient shadow; completed steps resolve to quiet green while waiting steps remain gray. On mobile the sequence becomes a vertically connected list without losing order or status visibility.

### Output Panel

Generated work is presented as one white, 16px-radius reading surface with compact toolbars and a maximum 72ch content measure. The LinkedIn banner is deliberately monochrome and framed by a graphite caption bar so it reads as the artifact, not decorative page imagery.

## Do's and Don'ts

### Do:

- **Do** keep each screen source-first, with one obvious primary action and a calm sequential reading order.
- **Do** use Relay Cobalt only for selected, actionable, focused, or live-progress states.
- **Do** preserve 44px touch targets for segmented controls and output actions on narrow screens.
- **Do** support reduced motion, reduced transparency, and increased contrast without changing information hierarchy.
- **Do** use thin dividers and tonal layers for ordinary grouping; reserve ambient shadows for primary working surfaces.

### Don't:

- **Don't** add a sidebar dashboard, fake navigation, metric tiles, or independent cards for each agent.
- **Don't** turn the concise workspace heading into oversized marketing-hero chrome.
- **Don't** stack translucent or glassy cards; translucency belongs only to the sticky top bar.
- **Don't** introduce extra accent hues, gradients, decorative imagery, or a secondary typeface.
- **Don't** animate for spectacle; motion should communicate pressed feedback, handoff progress, or result arrival.
