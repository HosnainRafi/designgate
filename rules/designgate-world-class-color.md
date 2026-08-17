# DesignGate World-Class Color & Material Contract

You are operating under DesignGate quality rules. This contract gives **exact palettes and material rules** used by top-tier studios. Vague guidance ("pick harmonious colors") is banned here — declare one palette and one material direction, then enforce it with tokens.

## The rule

Choose exactly ONE palette from the approved set below and ONE material direction. Export the palette as CSS custom properties on `:root` (and `@media (prefers-color-scheme: dark)` where noted). Every color in the site must come from these tokens. No token-less hex literals in styles.

## Approved palettes

### Palette 1 — Ink & Ivory (editorial luxury)

The most-used palette on award sites of 2025–2026. Warm paper, near-black ink, one electric accent.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#f7f4ee` (warm ivory) | Page background |
| `--ink` | `#141210` (soft black) | Text, primary surfaces |
| `--accent` | `#d9ff00` (acid lime) or `#e85d2f` (burnt orange) — pick one | CTAs, highlights, numerals |
| `--line` | `rgba(20,18,16,0.14)` | Hairlines, borders |
| `--muted` | `#6b665e` | Secondary text |

Dark variant: swap `--bg` → `#0d0c0a`, `--ink` → `#f7f4ee`, adjust `--line` to `rgba(247,244,238,0.14)`.

### Palette 2 — Midnight Electric (dark premium tech)

For SaaS, AI products, dev tools, and futuristic brands. Replaces the banned "generic navy + neon purple."

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0a0e12` (blue-black) | Page background |
| `--ink` | `#f2f6fa` (cool white) | Text |
| `--accent` | `#4cc9ff` (sky electric) — or `#7c5cff` violet, pick exactly one | CTAs, glows, links |
| `--glow` | same as accent at 12–20% opacity | Radial glows, hover states |
| `--line` | `rgba(242,246,250,0.12)` | Hairlines |
| `--muted` | `#8a97a3` | Secondary text |

### Palette 3 — Clay & Sand (warm modern human)

For lifestyle, wellness, food, culture brands. Warm, human, never sterile.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#faf6f1` | Page background |
| `--ink` | `#2b2319` (espresso) | Text |
| `--accent` | `#c2410c` (terracotta) or `#166534` (deep green) — pick one | CTAs, highlights |
| `--sand` | `#efe7da` | Section alternation |
| `--line` | `rgba(43,35,25,0.12)` | Hairlines |
| `--muted` | `#7d705e` | Secondary text |

### Palette 4 — Monochrome Signal (brutalist/tech)

For developer tools, web3, and anti-template brands.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#ffffff` (light) / `#0e0e0e` (dark) | Page background |
| `--ink` | opposite of bg | Text |
| `--accent` | `#ff3b00` (signal red) — exactly one | CTAs, status, numerals |
| `--grid` | `rgba(14,14,14,0.06)` / `rgba(255,255,255,0.06)` | Grid lines, section rules |
| `--muted` | `#6e6e6e` | Secondary text |

## Material direction (pick one)

**Paper**: Palette 1 or 3, with SVG `feTurbulence` grain overlay at 3–5% opacity covering the whole viewport (`pointer-events: none`, `mix-blend-mode: multiply`). Feels printed, premium, tactile.

**Glass**: Palette 1 or 2, frosted glass cards (`backdrop-filter: blur(16px)`, `rgba` fill 4–8%, 1px line border), layered over one large soft radial glow in the accent at 8–15%.

**Ink void**: Palette 2 or 4, near-black voids, single radial spotlight gradient per viewport that follows scroll slowly, accent reserved for ≤10% of pixels.

**Grid**: Palette 4, visible hairline grid (1px, every 80–120px), section numbers in huge type, status chips, mono annotations everywhere.

## Hard requirements

1. **60/30/10 balance**: background ~60–70%, ink/text ~25–35%, accent ≤10% of visible pixels.
2. **One accent, one meaning**: the accent color is used ONLY for interactive/significant things (CTAs, links, active states, key numerals). Never for decoration.
3. **Contrast floor**: body text ≥ 4.5:1 against its background; large text ≥ 3:1. Check with a contrast tool, not by eye.
4. **Gradient ban list**: no purple-to-pink diagonal gradient hero, no rainbow text, no default Tailwind gradient presets unmodified.
5. **Dark mode**: if a dark palette is chosen, dark is the *default* — do not ship light mode as a bolt-on with poor contrast.
6. **Glow physics**: glow opacity 8–20%, blur ≥ 60px, never hard-edged colored shadows.

## Verification

The designer/agent must state the chosen palette (1–4) and material direction in the build report, and the tier-A verifier checks that body text meets contrast floors and the accent ratio is respected (accent color must not appear in more than 10% of large surface areas).
