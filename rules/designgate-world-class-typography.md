# DesignGate World-Class Typography Contract

You are operating under DesignGate quality rules. This contract replaces vague type guidance with **exact, prescriptive** type systems proven on award-winning and top-billing agency sites. Do not drift from it.

## The rule

Every site must declare a **Type System** at the start of the build. Choose exactly ONE of the four systems below and apply it across the whole page. Never mix systems, and never fall back to a single generic sans (Inter alone, system-ui, Arial) unless the brand brief explicitly demands neutrality.

## The four approved type systems

### System A — Editorial Luxury (serif display + mono details)

Use this for agencies, portfolios, studios, luxury brands, and editorial products.

| Token | Value |
| --- | --- |
| Display font | **Fraunces** (Google Fonts, weights 300–900, optical size axis on) |
| Body font | **Fraunces** 400 for long copy, or **Spline Sans Mono** 400 for captions/labels |
| H1 | Fraunces 500–600, `clamp(2.8rem, 8vw, 7rem)`, line-height 0.95–1.05, tight letter-spacing (-0.03em) |
| Eyebrow/label | Spline Sans Mono 12–13px, uppercase, letter-spacing 0.15em, weight 500 |
| Body | 17–18px, line-height 1.6–1.7, max-width 62ch |
| Accent device | Italic Fraunces on one keyword per headline ("Make momentum *visible*.") |

### System B — Swiss Precision (neo-grotesque display + warm serif body)

Use this for SaaS, fintech, product sites, and brands wanting modern authority.

| Token | Value |
| --- | --- |
| Display font | **Söhne-lookalike via "Instrument Sans"** or **"Public Sans"** — bold 700–800 |
| Body font | **Source Serif 4** 400, or Public Sans 400 for UI-heavy pages |
| H1 | 700–800 weight, `clamp(2.6rem, 7vw, 6rem)`, line-height 1.0, tracking -0.02em |
| Eyebrow/label | Uppercase sans 12px, tracking 0.12em |
| Signature device | Oversized numerals (section numbers 01–09 in 10rem+ weight 800) and hairline rules |

### System C — Warm Humanist (characterful serif display + clean sans body)

Use this for lifestyle, wellness, food, culture, and storytelling brands.

| Token | Value |
| --- | --- |
| Display font | **Playfair Display**, **Cormorant Garamond**, or **Libre Caslon** 500–700 |
| Body font | **Outfit** or **DM Sans** 400–500 |
| H1 | `clamp(2.8rem, 8vw, 6.5rem)`, line-height 1.05, gentle tracking (-0.01em) |
| Eyebrow/label | Outfit uppercase 12px, tracking 0.18em |
| Signature device | Large italic serif pull-quotes and drop caps on long-form sections |

### System D — Tech Brutalist (mono display + grotesque body)

Use this for developer tools, web3, gaming-adjacent, and anti-template brands.

| Token | Value |
| --- | --- |
| Display font | **JetBrains Mono** 700 or **IBM Plex Mono** 700, uppercase, tight |
| Body font | **Space Grotesk** 400–500 |
| H1 | Mono 700 uppercase, `clamp(2.4rem, 7vw, 5.5rem)`, line-height 1.0 |
| Eyebrow/label | Mono 11–12px, with `>` or `/` prefix tokens |
| Signature device | Code-annotation styling (numbered line labels, status chips) on every section |

## Hard requirements (all systems)

1. **Font loading**: preconnect to `https://fonts.googleapis.com` and `https://fonts.gstatic.com`; use `&display=swap` and set `font-display: swap`; preload the display font.
2. **Scale**: use a modular type scale — ratio 1.25 (Major Third) or 1.333 (Perfect Fourth). Never pick sizes by eye.
3. **Two, never three**: maximum two font families (display + body). If a mono is used, it counts as the body family.
4. **Optical sizing**: enable `font-optical-sizing: auto` on serif displays.
5. **Hierarchy rule**: every section must show three visible levels (eyebrow → display → body). No section with only one level passes.
6. **No type crimes**: never full-paragraph uppercase sans body copy; never center-align more than one headline; never exceed 75ch body width; never use default link underline without styling it (animated underline or offset underline required).

## Verification

The designer/agent must state which system (A–D) it chose and list the chosen fonts in the build report. Tier B `typography` grading checks contrast of weight between display and body, scale consistency, and the eyebrow/display/body three-level hierarchy.
