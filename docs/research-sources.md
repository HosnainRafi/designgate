# External Research Notes

## AutoClaw Desktop

The official AutoClaw website describes AutoClaw as a desktop AI agent that can operate local files, browsers, and built-in skills. It supports Windows 10 or later and macOS, offers browser automation and web-product-building workflows, and can use multiple models such as GLM and DeepSeek. These capabilities make it suitable for using DesignGate as a project-local quality-gate command after AutoClaw has generated or modified a web project.

Source: [AutoClaw official site](https://autoclaw.z.ai/)

## OpenClaw Skills Compatibility

OpenClaw documents skills as directories containing a `SKILL.md` file with YAML frontmatter and Markdown guidance. It gives workspace skills the highest precedence at `<workspace>/skills`, then project-agent skills at `<workspace>/.agents/skills`, and explains installation from a Git repository with `openclaw skills install git:owner/repo@ref`. It also advises treating third-party skills as untrusted code and reviewing them before enabling.

Source: [OpenClaw Skills documentation](https://docs.openclaw.ai/tools/skills)

