# DesignGate Award Typography Contract — 2026 Edition

You are operating under DesignGate quality rules. This contract is the 2026 refresh of the typography rules, grounded in what actually won awards in 2025–2026. The **Awwwards Site of the Year 2025 (Lando Norris by OFF+BRAND.)** won on bold typography plus a single electric accent (neon #D2FF00 on black). Sites of the Month in 2026 (Oryzo AI by Lusion, Floema, Son Daven, Lama Lama) and finalists like Mat Voyce, Uncommon Studio, and By-Kin all share one trait: **the type does the heavy lifting — letterforms are the art**, and type performs rather than sits still. Typography is no longer a neutral carrier; it is the hero image. This contract enforces that.

## The rule

Every site must declare a **Type System** at the start of the build. Choose exactly ONE of the five systems below (A–E) and apply it across the whole page. Systems A–D carry over from the base contract; **System E is the new 2026 award-grade system** modeled on SOTY-grade kinetic-type sites. Never mix systems, and never fall back to a single generic sans (Inter alone, system-ui, Arial) unless the brand brief explicitly demands neutrality.

## The five approved type systems

### System A — Editorial Luxury (serif display + mono details)

Use this for agencies, portfolios, studios, luxury brands, and editorial products. This is the "museumcore / heritage reimagined" look that won heavily in 2025–2026 (Pentagram's Guggenheim identity, Wolff Olins' NYBG).

| Token | Value |
| --- | --- |
| Display font | **Fraunces** (Google Fonts, weights 300–900, optical size axis on) |
| Body font | **Fraunces** 400 for long copy, or **Spline Sans Mono** 400 for captions/labels |
| H1 | Fraunces 500–600, `clamp(2.8rem, 8vw, 7rem)`, line-height 0.95–1.05, tight letter-spacing (-0.03em) |
| Eyebrow/label | Spline Sans Mono 12–13px, uppercase, letter-spacing 0.15em, weight 500 |
| Body | 17–18px, line-height 1.6–1.7, max-width 62ch |
| Accent device | Italic Fraunces on one keyword per headline ("Make momentum *visible*.") |

### System B — Swiss Precision (neo-grotesque display + warm serif body)

Use this for SaaS, fintech, product sites, and brands wanting modern authority. Matches the "Swiss grid-native" trend (Perplexity/Smith & Diction, Guggenheim).

| Token | Value |
| --- | --- |
| Display font | **Söhne-lookalike via "Instrument Sans"** or **"Public Sans"** — bold 700–800 |
| Body font | **Source Serif 4** 400, or Public Sans 400 for UI-heavy pages |
| H1 | 700–800 weight, `clamp(2.6rem, 7vw, 6rem)`, line-height 1.0, tracking -0.02em |
| Eyebrow/label | Uppercase sans 12px, tracking 0.12em |
| Signature device | Oversized numerals (section numbers 01–09 in 10rem+ weight 800) and hairline rules |

### System C — Warm Humanist (characterful serif display + clean sans body)

Use this for lifestyle, wellness, food, culture, and storytelling brands. Matches the "warm serif comeback" trend — serifs are rising as a counter-reaction to the sterile AI-look aesthetic (Flamingo Estate/Exposure VAR, LittleBird/Meraki).

| Token | Value |
| --- | --- |
| Display font | **Playfair Display**, **Cormorant Garamond**, or **Libre Caslon** 500–700 |
| Body font | **Outfit** or **DM Sans** 400–500 |
| H1 | `clamp(2.8rem, 8vw, 6.5rem)`, line-height 1.05, gentle tracking (-0.01em) |
| Eyebrow/label | Outfit uppercase 12px, tracking 0.18em |
| Signature device | Large italic serif pull-quotes and drop caps on long-form sections |

### System D — Tech Brutalist (mono display + grotesque body)

Use this for developer tools, web3, gaming-adjacent, and anti-template brands. Matches the "elevated brutalism / code-crafted systems" trend (Stripe Press/Outlanders, OpenAI/Studio Dumbar).

| Token | Value |
| --- | --- |
| Display font | **JetBrains Mono** 700 or **IBM Plex Mono** 700, uppercase, tight |
| Body font | **Space Grotesk** 400–500 |
| H1 | Mono 700 uppercase, `clamp(2.4rem, 7vw, 5.5rem)`, line-height 1.0 |
| Eyebrow/label | Mono 11–12px, with `>` or `/` prefix tokens |
| Signature device | Code-annotation styling (numbered line labels, status chips) on every section |

### System E — Kinetic Maximalist (the 2026 award-grade system)

Use this for brands that must win rooms: flagship launches, athlete/creator platforms, campaign sites, portfolio showpieces — the Lando Norris / Mat Voyce / Bose / OutSystems register. Type is the hero image: oversized, in-motion, with exaggerated hierarchy (giant display type against tiny micro-labels).

| Token | Value |
| --- | --- |
| Display font | **Clash Display** 600–700 (Fontshare) or **"Big Shoulders Display"** 800 (Google Fonts); alternative: **Galgo Condensed** (Awwwards free-font pick) |
| Body font | **General Sans** 400 (Fontshare) or **Instrument Sans** 400–500 (Google Fonts) |
| H1 | Display 600–800, `clamp(3.5rem, 12vw, 11rem)`, line-height 0.9–1.0, tracking -0.04em; may be lowercase for a contemporary read |
| Eyebrow/label | Body font uppercase 11px, tracking 0.2em — deliberately tiny against the giant H1 (exaggerated hierarchy) |
| Body | 16–17px, line-height 1.55–1.65, max-width 60ch |
| Accent device | Kinetic behavior: split-text/word reveal on scroll, letter-spacing animation (letters breathe from 0.05em to -0.02em), or one rotating/marquee word per section |

System E requires at least one kinetic-type behavior (from the motion catalog: split-text reveal, letter-spacing breathe, marquee, or text scramble) on the H1, and one secondary text moment — pull-quote, oversized numeral, or word-in-loop — elsewhere on the page. Without motion, System E downgrades to System B.

## Hard requirements (all systems)

1. **Font loading**: preconnect to `https://fonts.googleapis.com` and `https://fonts.gstatic.com`; use `&display=swap` and set `font-display: swap`; preload the display font.
2. **Variable-first**: prefer variable fonts (variable-weight single file) where the family offers them — better performance and smooth weight animation — load only the weight range the design actually uses (e.g., `wght@300..800`), never the entire family.
3. **Scale**: use a modular type scale — ratio 1.25 (Major Third) or 1.333 (Perfect Fourth). Never pick sizes by eye.
4. **Two, never three**: maximum two font families (display + body). If a mono is used, it counts as the body family.
5. **Optical sizing**: enable `font-optical-sizing: auto` on serif displays.
6. **Hierarchy rule**: every section must show three visible levels (eyebrow → display → body). No section with only one level passes.
7. **No type crimes**: never full-paragraph uppercase sans body copy; never center-align more than one headline; never exceed 75ch body width; never use default link underline without styling it (animated underline or offset underline required).
8. **2026 flavor rule**: every build must carry at least ONE of: a tight-display headline (-0.03em or tighter), an italic-serif accent word, an oversized section numeral, or a marquee/looping text element. A page with none of these reads as 2021 and fails the flavor check.

## Reference typeface library (approved free sources)

The following families are vetted, free-to-use, and appear on awarded 2025–2026 sites. Draw only from this list unless the brief mandates otherwise.

| Family | Source | Character | Best role |
| --- | --- | --- | --- |
| Fraunces | Google Fonts | Warm high-contrast serif, optical axis | Editorial luxury display |
| Instrument Sans / Serif | Google Fonts | Söhne/Serif Söhne lookalikes | Swiss display + warm body |
| Public Sans | Google Fonts | Neutral grotesque | Authority display |
| Newsreader / Libre Caslon | Google Fonts | Refined editorial serif | Luxury body/display |
| Big Shoulders Display | Google Fonts | Condensed poster sans | Kinetic display |
| Spline Sans Mono | Google Fonts | Clean mono | Labels, captions |
| JetBrains Mono / IBM Plex Mono | Google Fonts | Engineer mono | Brutalist display |
| Space Grotesk | Google Fonts | Characterful grotesque | Brutalist body |
| Playfair / Cormorant / Libre Caslon | Google Fonts | Classical serif | Warm humanist display |
| Outfit / DM Sans | Google Fonts | Modern geometric sans | Humanist body |
| Clash Display / General Sans | Fontshare | Premium neo-grotesques | Kinetic Swiss display/body |
| Galgo Condensed / Geist | Awwwards free fonts | Award-circuit picks | Condensed display / UI |

Sources for vetting new typefaces: [Typewolf](https://www.typewolf.com/recommendations) (hand-curated site-of-the-day pairings), [Fonts in Use](https://fontsinuse.com) (real-world typeface applications), and the [Awwwards free fonts collection](https://www.awwwards.com/awwwards/collections/free-fonts/).

## Verification

The designer/agent must state which system (A–E) it chose, list the chosen fonts with sources in the build report, and confirm the 2026 flavor rule. Tier B `typography` grading checks contrast of weight between display and body, scale consistency, the eyebrow/display/body three-level hierarchy, and — for System E builds — kinetic-type evidence and exaggerated hierarchy.
