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
