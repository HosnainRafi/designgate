# External Research Notes

## AutoClaw Desktop

The official AutoClaw website describes AutoClaw as a desktop AI agent that can operate local files, browsers, and built-in skills. It supports Windows 10 or later and macOS, offers browser automation and web-product-building workflows, and can use multiple models such as GLM and DeepSeek. These capabilities make it suitable for using DesignGate as a project-local quality-gate command after AutoClaw has generated or modified a web project.

Source: [AutoClaw official site](https://autoclaw.z.ai/)

## OpenClaw Skills Compatibility

OpenClaw documents skills as directories containing a `SKILL.md` file with YAML frontmatter and Markdown guidance. It gives workspace skills the highest precedence at `<workspace>/skills`, then project-agent skills at `<workspace>/.agents/skills`, and explains installation from a Git repository with `openclaw skills install git:owner/repo@ref`. It also advises treating third-party skills as untrusted code and reviewing them before enabling.

Source: [OpenClaw Skills documentation](https://docs.openclaw.ai/tools/skills)


## Current Dashboard Visual Evidence

A fresh managed-preview capture verified the DesignGate dashboard is rendering at the restored stable checkpoint. The visible product framing includes the quality-enforcement headline, run metrics, installable-agent panel, and supported harness adapters. This capture is suitable as authentic README evidence after the updated feature work is validated.

Preview route: `/` at the managed DesignGate development URL captured on 2026-08-16.

## Updated Brief Implementation Notes

The additive implementation scaffold now includes `rules/extensions/immersive3d.json`, `config/goal-categories.json`, a `gaming-3d` preset, extension-aware browser evidence, conditional Tier B immersiveness scoring, and Goal Mode planner/build command paths. Legacy projects continue to use the original base manifest and five Tier B dimensions when immersive3d is disabled.

The next validation focus is the renderer/browser contract, CLI tests for the new commands, documentation coverage, and end-to-end package behavior.

Source: `/home/ubuntu/upload/designgate-my-project-idea(1).md`.

## Award-Circuit Design Sources (2026 typography and award-standard refresh)

The 2026 refresh of the DesignGate typography and award-craft rules is grounded in the official Awwwards award record and jury-level analysis. **Awwwards Site of the Year 2025 went to Lando Norris by OFF+BRAND.** (landonorris.com), winning 43 votes alongside the Users' Choice (596 votes), with FWA of the Day and CSSDA Site of the Month awards; its craft signature is bold condensed typography, a single neon accent (#D2FF00), cinematic scrolling, and Rive/WebGL motion engineered for performance. The 2026 Annual Awards record confirms Lando Norris as Site of the Year again by vote, Messenger as Developer Site of the Year, Scout Motors as E-commerce of the Year, Immersive Garden as Agency of the Year, and Malvah as Studio of the Year. Jury member Hon Tran's 2026 breakdown identifies the three pillars that separate a 6.5 from a 9: a single art-direction point of view, directed motion rather than decorative effects, and ~60fps performance under CPU 4× / Fast 3G throttling.

Typography direction for the 2026 contract draws on Creative Bloq's 2026 trends review (type that tells a story, mutant heritage, the return of photo-lettering, and the serif comeback as a counter-reaction to the polished AI aesthetic), Fontfabric's 2026 design-trends review (typographic maximalism, code-crafted systems, atmospheric gradients, perfectly imperfect texture), Kettle's typography-now review (variable fonts going mainstream, breaking the sans-serif default, kinetic letterforms), and Figma's 2026 web design trends (bold typography center stage, oversized kinetic headlines, variable fonts responding to interaction). The approved free typeface library was vetted against the Awwwards free-fonts collection (Galgo Condensed, Geist), Google Fonts, and Fontshare.

Study references for agents are catalogued in docs/award-winners-2025-2026.md, with Godly.website, SiteInspire, and Land-book for full-site craft; Typewolf and Fonts in Use for typography pairings; Brand New and Identity Designed for branding; Motionographer and LottieFiles Featured for motion; and Subtraction.com for long-form criticism.

Sources: [Awwwards Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/), [Awwwards Annual Awards winners](https://www.awwwards.com/annual-awards/winners), [Awwwards Sites of the Month](https://www.awwwards.com/websites/sites_of_the_month/), [OFF+BRAND. Lando Norris case study](https://www.itsoffbrand.com/our-work/lando-norris), [Hon Tran — Best Award-Winning Websites of 2026](https://www.hontran.dev/blog/best-award-winning-websites-2026), [Creative Bloq typography trends 2026](https://www.creativebloq.com/design/fonts-typography/breaking-rules-and-bringing-joy-top-typography-trends-for-2026), [Fontfabric 10 design trends 2026](https://www.fontfabric.com/blog/10-design-trends-shaping-the-visual-typographic-landscape-in-2026/), [Kettle — Typography now 2025](https://www.wearekettle.com/blog/typography-now-trends-shaping-2025), [Figma web design trends 2026](https://www.figma.com/resource-library/web-design-trends/), [Wix web design trends 2026](https://www.wix.com/blog/web-design-trends), [Social Script design inspiration sites 2026](https://www.socialscript.in/blog/design-inspiration-sites-for-2026), [Awwwards free fonts](https://www.awwwards.com/awwwards/collections/free-fonts/), [Godly.website](https://godly.website), [Typewolf recommendations](https://www.typewolf.com/recommendations).
