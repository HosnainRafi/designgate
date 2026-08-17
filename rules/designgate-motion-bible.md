# DesignGate Motion Bible — Every Modern Motion Technique

You are operating under DesignGate quality rules. This is the complete catalog of premium motion techniques used by award-winning studios and the 21st.dev registry in 2025–2026. A build must use **at least six techniques** from Section 1, **three surface states** from Section 2, and **one hero pattern** from Section 3. Every animation obeys the physics in Section 4.

## Section 1 — The technique catalog (pick ≥ 6)

| # | Technique | Engine pattern | Timing |
| --- | --- | --- | --- |
| 1 | Staggered character/word split-text reveal | GSAP SplitText or clip-path word loop with `translateY(110%) → 0` stagger 30–60ms | 600–900ms total |
| 2 | Scroll-pinned storytelling section | GSAP ScrollTrigger `pin: true` + `scrub: 1` timeline | scrubbed, not timed |
| 3 | Parallax layers (3+ depth planes) | `translateY` at different rates on scroll (rate 0.1–0.5) | continuous |
| 4 | Horizontal scroll section inside vertical page | ScrollTrigger horizontal with `containerType: inline-size` | scrubbed |
| 5 | Marquee / infinite ticker | CSS `animation: translateX(-50%) 30s linear infinite` with hover pause | continuous |
| 6 | Number count-up / odometer ticker | IntersectionObserver → RAF counter with `easeOutExpo` | 800–1200ms |
| 7 | Text scramble / decode effect on hover | RAF char-swap loop, 6–10 frames per char | 300–500ms |
| 8 | Magnetic buttons / elements | Pointer → lerp target `(pos + (mouse - pos) * 0.2)` on RAF | continuous |
| 9 | Tilt / 3D perspective cards | `rotateX/Y` from pointer position relative to card center, max ±8° | continuous |
| 10 | Spotlight / glow-follow cursor | Radial gradient at pointer via CSS var updated on pointermove | continuous |
| 11 | Image reveal with mask | `clip-path: inset(100% 0 0 0)` → `inset(0)` or scale 1.4→1 crop | 700–900ms |
| 12 | Page/section transition | Opacity + translateY(24px) fade-up on route/section entry, staggered | 500–700ms |
| 13 | Dock / morphing navigation | Scale neighbors on hover (macOS-dock curve) | 200ms |
| 14 | Shimmer / sweep buttons | Animated gradient sweep `background-position` loop on hover | 600ms |
| 15 | Animated gradient mesh background | 3–4 blurred orbs, slow translate/scale loop (20–40s) | continuous |
| 16 | WebGL ambient hero (Three.js/R3F/Spline) | Idle rotation < 0.5 rad/s, pointer-reactive damping 0.05–0.08 | 60fps |
| 17 | Smooth page scroll (Lenis/ScrollSmoother/Locomotive) | Library default lerp 0.1, RAF-synced | continuous |
| 18 | Custom cursor follower | Lerp follower circle, blend-mode difference, hide over buttons/links on touch | continuous |
| 19 | Progress bar / scroll indicator | Height/width tied to scroll fraction, accent color | continuous |
| 20 | Accordion / details reveal | `grid-template-rows: 0fr → 1fr` with `cubic-bezier(.2,.8,.2,1)` | 300–400ms |
| 21 | Marquee speed shift on hover | `animation-duration` 30s → 60s on hover | instant |
| 22 | Liquid / blob morph | SVG `feTurbulence` + `feDisplacementMap` animated, or canvas metaballs | continuous |
| 23 | Grain/noise animated overlay | Static grain image OR animated feTurbulence `baseFrequency` loop | subtle |
| 24 | Counter/step progress micro-states | Button → loading dots → success check sequence | 400ms each |

## Section 2 — Surface states (pick ≥ 3)

Every interactive surface needs: **hover** (lift, glow, underline draw, or tilt), **press/active** (scale 0.97 or depth collapse, ≤ 120ms), **focus-visible** (2px accent outline offset 3px), **disabled** (opacity 0.4 + cursor not-allowed), and on touch devices: **tap highlight removed** (`-webkit-tap-highlight-color: transparent`).

## Section 3 — Hero patterns (pick exactly 1)

**A. Ambient WebGL**: full-viewport Three.js/Spline scene, slow idle motion, pointer-reactive, text layered above with staggered split-text entrance. **B. Cinematic media**: background video (muted, loop, poster frame) with gradient scrim and centered headline. **C. Kinetic type hero**: giant display type as the art — text fills viewport, letters animated individually, no image. **D. Split composition**: left 55% type stack (eyebrow, H1, CTA staggered), right 45% image/3D with parallax drift.

## Section 4 — Motion physics (non-negotiable)

1. **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)` (expressive), `cubic-bezier(0.4, 0, 0.2, 1)` (neutral), or springs (stiffness 170–300, damping 22–30). Never `linear` for entrances, never `ease` (the CSS default) for anything visible.
2. **Duration bands**: micro 100–200ms (states), standard 200–400ms (UI), entrance 500–900ms (reveal), ambient 15s+ (backgrounds). Nothing between 2s–15s except ambient.
3. **Stagger cap**: stagger children ≤ 80ms apart; total sequence ≤ 1.5s before content is readable.
4. **Jank budget**: animations only on `transform`, `opacity`, `filter`. No animating `top/left/width/height` or layout-triggering properties.
5. **RAF discipline**: all scroll, pointer, and canvas work inside `requestAnimationFrame` (or a RAF-synced library like Lenis/GSAP); never on raw `scroll` events without throttle.
6. **Respect the user**: `@media (prefers-reduced-motion: reduce)` must disable all non-essential motion, keep entrances as instant fades (≤ 200ms), and pause marquees/WebGL idle motion.
7. **60fps proof**: the hero and any WebGL scene must hold 60fps on a mid-range device; cap pixel ratio at 2, pause WebGL when offscreen (`IntersectionObserver`), and lazy-load scenes below the fold.

## Verification

The agent lists its six-plus techniques with engine and timings in the build report. `verify` checks: motion library import, reduced-motion fallback, RAF evidence, and animated pointer states (see the `modern-motion` extension). Tier B `motionCraft` grades sequencing, easing personality, and the absence of jank/over-animation.
