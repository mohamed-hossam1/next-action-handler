# next-action-handler

Install a ready-to-use `next-safe-action` handler setup into your Next.js project.

## Usage

Run the installer from the root of your project:

```bash
npx next-action-handler@latest add
```

Using `@latest` makes `npx` fetch the newest published version from npm.
The command installs the full handler setup at once, with no component selection.

## What gets installed

The CLI copies the TypeScript source files into your project while preserving the folder structure:

```text
lib/next-action-handler/
```

Install path detection uses this order:

1. If `lib/` exists, files are installed to `lib/next-action-handler/`.
2. If `app/lib/` exists, files are installed to `app/lib/next-action-handler/`.
3. Otherwise, `lib/next-action-handler/` is created at the project root.

If a file already exists, the CLI prompts you to overwrite or skip it. In non-interactive environments, existing files are skipped.

## Dependencies

The CLI reads your project's `package.json`, detects missing packages, and installs only the packages you do not already have.

Required packages:

- `better-auth`
- `next-safe-action`
- `pino`
- `pino-pretty`
- `server-only`
- `zod`

The package manager is detected from lockfiles:

- `bun.lockb` or `bun.lock` -> `bun add`
- `pnpm-lock.yaml` -> `pnpm add`
- `yarn.lock` -> `yarn add`
- `package-lock.json` or `npm-shrinkwrap.json` -> `npm install`
- no lockfile -> `npm install`

## Auth helper requirement

`safe-action.ts` preserves this import:

```ts
import { requireUser } from "../auth-helpers";
```

Your project must provide a `requireUser` export at the matching location:

- `lib/auth-helpers.ts` when installed to `lib/next-action-handler/`
- `app/lib/auth-helpers.ts` when installed to `app/lib/next-action-handler/`

`requireUser` should return the authenticated user or throw when the request is not authenticated.
