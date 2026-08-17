# DesignGate World-Class Imagery & Art-Direction Contract

You are operating under DesignGate quality rules. This contract defines how imagery must be sourced, generated, and treated so the site never looks like a template with stock photos.

## The rule

Choose exactly ONE image direction from the approved set below and apply it to every image on the site. Mixed directions (e.g., one 3D render next to one corporate photo) fail the `assetDependence` and `brandFidelity` Tier B dimensions.

## Approved image directions

### Direction A — Rendered Abstraction (3D studio)

Hero and card imagery as abstract 3D renders: single sculptural form (torus, ribbon, sphere cluster, fluid blob), matte or glass material, on-brand palette (2–3 colors max), soft studio lighting, generous negative space for headline overlap.

Generation prompt pattern: *"Studio 3D render of a single sculptural [form], [matte porcelain / brushed metal / translucent glass] material in [ink #141210] and [accent], soft diffused studio lighting, subtle grain, large empty background area, centered composition, no text"*

### Direction B — Editorial Photography with Treatment

Real-world photography treated as print: duotone/duotint to brand colors (e.g., ink + accent), strong grain overlay (15–25%), high contrast, tight crops, subject looking at/away from frame deliberately. No untreated stock-style lifestyle photos.

### Direction C — Isometric / Spatial Product

Product or UI shown in isometric or floating-perspective 3D mockups with soft shadows, on the brand background color (never white-on-white). Use drop shadows in accent-tinted black, blur ≥ 24px.

### Direction D — Generative / Motion Still

Backgrounds and section fills as generative art: noise fields, flow fields, mesh gradients in brand tokens, or still frames from motion graphics (blur trails, light painting). Must use ONLY palette tokens.

## Hard requirements

1. **Hero image spec**: min 1920×1080 equivalent, webp/avif, ≤ 400KB, background area ≥ 35% clean for headline text.
2. **No stock-photo energy**: no handshakes, no generic laptops, no smiling models on white backgrounds, no Unsplash-preset looks.
3. **Palette lock**: every image must sit within the chosen palette (± hue tolerance). Run a color check before shipping.
4. **Consistent treatment**: same grain level, same lighting mood, same crop ratio across all images.
5. **Aspect discipline**: hero 16:9 or 21:9; cards 4:3 or 1:1; portraits 3:4 for team/editorial. No mixed aspect ratios within one section.
6. **Real images, real fast**: use `loading="lazy"`, `decoding="async"`, explicit width/height, and an LQIP blur placeholder (≤ 20px blur, palette-tinted).
7. **AI-generated imagery** is allowed and encouraged when Direction A or D is chosen, but must be upscaled to crisp quality (see `rules/designgate-modern-ui.md` asset discipline) and free of text artifacts and malformed anatomy.

## Verification

The designer/agent must state the chosen direction (A–D) and show one palette-locked example per direction in the build report. Tier B `brandFidelity` grading checks palette lock, treatment consistency, and the absence of stock-photo energy.
