# Contributing

Use this repo like a production project: keep secrets out of Git, make changes on short-lived branches, and verify before pushing.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

## Editor Setup

This project includes VS Code workspace settings that hide generated files such as `.next`, `node_modules`, local Python environments, and deployment metadata from Explorer and search.

Recommended extensions are listed in `.vscode/extensions.json`.

For the cleanest personal setup, open `enlift-hub.code-workspace` in VS Code instead of opening the folder directly. It includes Explorer nesting, search ignores, and project-specific defaults.

Use `WORKSPACE_MAP.md` as the quick guide for where admin, student app, Firebase, Jest, env, package, and deployment files live.

Useful VS Code tasks:

```bash
dev
lint
test
build
```

## Branch Workflow

Create a new branch for each feature or fix:

```bash
git checkout -b feature/profile-page
```

Before opening a pull request, run:

```bash
npm run lint
npm test
npm run build
```

## Commit Style

Keep commits small and readable:

```bash
git add .
git commit -m "Improve profile form layout"
git push origin feature/profile-page
```

Good commit messages start with a clear verb, such as `Add`, `Fix`, `Improve`, `Refactor`, or `Remove`.

## Security

Do not commit local secrets, service account JSON files, `.env.local`, `.vercel`, `node_modules`, `.next`, or local virtual environments.

If a secret was committed in the past, rotate it in the provider dashboard before continuing development.
