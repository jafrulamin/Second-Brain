# Second Brain

A lightweight, file-based Second Brain for capturing notes, ideas, and project context. Designed to be simple, portable, and tool-agnostic (plain Markdown + folders).

## Goals
- Capture thoughts quickly
- Make ideas discoverable later
- Keep notes small, atomic, and linkable
- Work offline with simple sync/backups

## Features
- Plain Markdown notes
- Consistent file/folder structure
- Templates for quick capture
- Tags + backlinks for discovery
- Simple search and export workflows

## Getting started
1. Clone or create this folder on your device.
2. Create notes in Markdown inside the `notes/` folder.
3. Use the provided templates for new notes.

## Folder layout
```
/README.md
/notes/         # core notes (chronological or topic-based)
/projects/      # active project folders
/archives/      # older notes and completed projects
/templates/     # note and metadata templates
/assets/        # images and attachments
/scripts/       # optional helpers (sync, build, export)
```

## Note conventions
- File names: `YYYY-MM-DD-title.md` for daily/atomic notes or `topic-subtopic.md` for evergreen notes.
- Frontmatter (optional):
```yaml
---
title: Short title
date: 2025-01-01
tags: [tag1, tag2]
links: []
---
```
- Keep notes focused: one idea per note when possible.
- Use backlinks: `[[other-note]]` or explicit links to connect ideas.

## Tags and links
- Tags: `#topic` inline for ad-hoc filtering.
- Links: use relative links or wiki-style links for quick navigation.
- Maintain an index or MOC (map of content) note to surface key topics.

## Templates
Create new notes from templates in `/templates/`:
- `daily.md` — timestamp, quick log, MITs (most important tasks)
- `literature.md` — citation, highlights, takeaways
- `project.md` — goals, milestones, next actions

## Tools & workflows
- Edit with any text editor (VS Code, Obsidian, Notepad++).
- Use simple search (ripgrep, spotlight, Windows search) or an app with indexing.
- Sync: Git, cloud folder (OneDrive/Dropbox), or backup scripts in `/scripts/`.

## Backup & Sync
- Keep a remote backup (Git + private repo or cloud).
- Run periodic exports (PDF/HTML) if needed for sharing.

## Contributing
- Keep notes small and self-contained.
- Add or update templates when useful.
- Submit improvements via PRs if this repo is shared.

## License
Choose a permissive license (e.g., MIT) if you plan to share this repo publicly.

## Quick commands
- Create a new daily note:
```
cp templates/daily.md notes/$(date +%F)-daily.md
```
- Search:
```
rg "search-term" notes/
```

---

For questions about structure or templates, create an issue or add a note to `/notes/00-system.md`.