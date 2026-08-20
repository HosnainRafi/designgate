# DesignGate Vercel Web Interface Guidelines Skill

This file distills the latest official **Vercel Web Interface Guidelines** (published by Vercel via `vercel-labs/agent-skills` and `vercel-labs/web-interface-guidelines`, fetched from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`) into the DesignGate contract. Treat it as an executable design and engineering contract, not optional inspiration.

## Source and freshness

The canonical Vercel rule set is maintained upstream by Vercel. Before running `designgate vercel-review` or declaring compliance, fetch the fresh upstream rules with `designgate vercel:fetch-rules` (or `curl -sL https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`) and compare against this bundled copy; flag any drift in the build report. The rules below are the latest snapshot at bundle time.

## Accessibility (required)

Icon-only buttons must carry an `aria-label`. Every form control needs a `<label>` or an `aria-label`. Interactive elements need keyboard handlers (`onKeyDown`/`onKeyUp`). Use `<button>` for actions and `<a>`/`<Link>` for navigation; never `<div onClick>`. Images need `alt` (or `alt=""` when decorative), and decorative icons need `aria-hidden="true"`. Async updates such as toasts and validation messages need `aria-live="polite"`. Prefer semantic HTML (`<button>`, `<a>`, `<label>`, `<table>`) before reaching for ARIA. Keep headings hierarchically ordered from `<h1>` to `<h6>` and include a skip link for the main content. Heading anchors need `scroll-margin-top`. Meaningful media needs captions, transcripts, or descriptions as applicable.

## Focus states (required)

Interactive elements need a visible focus indicator, such as `focus-visible:ring-*` or an equivalent. Never use `outline:none` without a focus replacement. Prefer `:focus-visible` over `:focus` so the ring does not appear on click. Group focus with `:focus-within` for compound controls. Sticky headers, footers, and overlays must never cover the focused element.

## Forms

Inputs need `autocomplete` and a meaningful `name`. Use the correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`. Never block paste with `onPaste` plus `preventDefault`. Labels must be clickable via `htmlFor` or by wrapping the control. Disable spellcheck on emails, codes, and usernames with `spellCheck={false}`. Checkbox and radio labels must share a single hit target with the control. The submit button stays enabled until the request starts, then shows a spinner. Errors render inline next to fields, and the first error receives focus on submit. Placeholders end with an ellipsis `…` and show an example pattern. Use `autocomplete="off"` on non-auth fields to avoid password-manager conflicts. Warn before navigation when changes are unsaved.

## Animation

Honor `prefers-reduced-motion` with a reduced variant or by disabling motion entirely. Animate only `transform` and `opacity` (compositor-friendly properties); never use `transition: all`; list properties explicitly. Set the correct `transform-origin`. For SVG, apply transforms to a `<g>` wrapper with `transform-box: fill-box` and `transform-origin: center`. Animations must be interruptible and respond to user input mid-animation. Autoplaying motion longer than five seconds alongside other content needs pause, stop, or hide controls, and muted decorative loops must stop under `prefers-reduced-motion`.

## Typography and content craft

Use the typographic ellipsis `…` instead of three periods, curly quotes `“` `”` instead of straight quotes, and non-breaking spaces for units, shortcuts, and brand names (`10&nbsp;MB`, `⌘&nbsp;K`). Loading states end with an ellipsis: `"Loading…"`. Use `font-variant-numeric: tabular-nums` for number columns and comparisons. Apply `text-wrap: balance` or `text-pretty` on headings to prevent widows. Write active-voice copy ("Install the CLI"), use title case for headings and buttons, use numerals for counts ("8 deployments"), give buttons specific labels ("Save API Key" rather than "Continue"), include a fix or next step in every error message, write in the second person, and prefer `&` over "and" where space is constrained.

## Content handling and images

Text containers must handle long content with `truncate`, `line-clamp-*`, or `break-words`, and flex children need `min-w-0` to allow truncation. Handle empty states deliberately; never render broken UI for empty strings or arrays. Anticipate short, average, and very long user-generated content. Every `<img>` needs explicit `width` and `height` to prevent layout shift; below-fold images use `loading="lazy"` and above-fold critical images use `priority` or `fetchpriority="high"`.

## Performance

Virtualize lists larger than roughly fifty items (with `virtua` or `content-visibility: auto`). Avoid layout reads during render (`getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop`); batch DOM reads and writes and avoid interleaving. Prefer uncontrolled inputs; when controlled inputs are required, they must stay cheap per keystroke. Add `<link rel="preconnect">` for CDN and asset domains. Preload critical fonts with `<link rel="preload" as="font">` and `font-display: swap`. Prefer `<video autoplay muted loop playsinline>` over animated GIFs, with a still alternative, and use compressed H.264 video with a `prefers-reduced-motion` media condition for short decorative loops.

## Navigation, state, and interaction

The URL must reflect state: filters, tabs, pagination, and expanded panels live in query parameters, and links use `<a>`/`<Link>` so command-click and middle-click work. Deep-link all stateful UI. Destructive actions require a confirmation modal or an undo window; never delete immediately. Add `touch-action: manipulation` to prevent the double-tap zoom delay, set `-webkit-tap-highlight-color` intentionally, and use `overscroll-behavior: contain` in modals, drawers, and sheets. During drag, disable text selection and mark dragged elements `inert`. Drag, swipe, pinch, and path gestures need tap/click and keyboard alternatives unless the gesture is essential. Use `autoFocus` sparingly and only for a single primary desktop input.

## Layout, theming, locale, and hydration

Full-bleed layouts need `env(safe-area-inset-*)` for notches; avoid unwanted scrollbars with `overflow-x-hidden` on containers and fix content overflow. Prefer flex/grid over JavaScript measurement for layout. Set `color-scheme: dark` on `<html>` for dark themes and match `<meta name="theme-color">` to the page background; give native `<select>` elements explicit `background-color` and `color`. Format dates and numbers with `Intl.DateTimeFormat` and `Intl.NumberFormat`, detect language via `Accept-Language` or `navigator.languages`, and wrap brand names and identifiers with `translate="no"`. Inputs with `value` need `onChange` (or use `defaultValue` for uncontrolled inputs); guard date/time rendering against hydration mismatch, and reserve `suppressHydrationWarning` for genuinely necessary cases.

## Interactive states

Buttons and links need a visible `hover:` state. Interactive states must increase contrast: hover, active, and focus states are more prominent than the resting state.

## Anti-patterns (flag and fix)

Never disable zoom with `user-scalable=no` or `maximum-scale=1`. Never combine `onPaste` with `preventDefault`, never write `transition: all`, and never use `outline:none` without a `focus-visible` replacement. Navigation must never rely on inline `onClick` handlers; clickable surfaces must be `<button>` or `<a>`. Never ship images without dimensions, never render large arrays with `.map()` without virtualization, never leave form inputs unlabeled or icon buttons unlabeled, never hardcode date or number formats, never use `autoFocus` without clear justification, never prefer animated GIFs over compressed video, and never expose gesture-only actions without tap/click and keyboard alternatives.
