---
name: vendored-repositories
description: Use this skill when the user wants to add or update a vendored repository
---

# Vendored repositories

A vendored repository is a repository for a third party dependency that is copied into the monorepo under `repos/` as a git subtree. Vendored repositories are read-only and should **never** be modified. They are used as reference material for AI agents when writing code that uses the dependency.

## Adding a vendored repository

To add a vendored repository, use this command from the root of the monorepo:

```bash
git subtree add --prefix=repos/<repo-name> <git-url> <branch> --squash
```

## Updating a vendored repository

To update a vendored repository, use this command from the root of the monorepo:

```bash
git subtree pull --prefix=repos/<repo-name> <git-url> <branch> --squash
```
