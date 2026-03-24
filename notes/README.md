# Zensical Template

A documentation template powered by [Zensical](https://zensical.org/).

## Quick Start

with uv:

```bash
uv init
uv add --dev zensical
uv run zensical serve --open
```

## Structure

```
.
├── docs/
│   ├── images/
│   ├── stylesheets/
│   └── index.md
├── overrides/
│   └── partials/
├── zensical.toml
├── .gitignore
└── README.md
```

## Configuration

Edit `zensical.toml` to customize your site:

- `site_name` — your site title
- `site_url` — your deployment URL
- `repo_url` — link to your repository

See [Zensical documentation](https://zensical.org/) for full configuration reference.
