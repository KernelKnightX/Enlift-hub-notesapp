# Workspace Map

This project keeps framework files in the places expected by Next.js, npm, Firebase, Jest, and Vercel.

Use `enlift-hub.code-workspace` for a cleaner Explorer view.

## Main Areas

```text
pages/admin/                Admin dashboard and admin tools
pages/student-desk/         Student application screens
pages/api/                  Next.js API routes
components/                 Shared React UI components
contexts/                   React context providers
firebase/                   Firebase client/service modules
hooks/                      Reusable React hooks
utils/                      Shared utility functions
styles/                     Global and feature CSS
public/                     Static assets
scripts/                    Local admin and seed scripts
__tests__/                  Jest tests
__mocks__/                  Jest mocks
```

## Root Config Files

These should stay at the project root:

```text
package.json                npm scripts and dependencies
package-lock.json           npm dependency lockfile
yarn.lock                   yarn dependency lockfile
next.config.mjs             Next.js configuration
firebase.json               Firebase project configuration
firestore.rules             Firestore security rules
firestore.indexes.json      Firestore indexes
jest.config.js              Jest test configuration
jest.setup.js               Jest setup file
eslint.config.mjs           ESLint configuration
.env.example                Safe environment template
.env.local                  Local secrets, never commit
```

## Private Local Files

Do not commit these:

```text
.env.local
firebase-service-account.json
.vercel/
.next/
node_modules/
abc/
env/
venv/
.venv/
```
