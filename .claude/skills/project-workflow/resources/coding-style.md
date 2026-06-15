# Coding style

## TypeScript
- Prefer `type` over `interface` for object shapes
- No `any` — use `unknown` and narrow explicitly
- Exported functions must have explicit return types
- Use `satisfies` when you want type checking without widening

## React / Next.js
- Server Components are the default. Add `"use client"` only when you need browser APIs, event handlers, or hooks
- Push `"use client"` as far down the component tree as possible
- Do not import server-only modules (Prisma, `lib/session.ts`, `lib/currentUser.ts`) in client components
- Co-locate a `*Client.tsx` file next to a `page.tsx` when the page needs a client island

## Components
- Use `cn()` from `lib/utils.ts` for all conditional class merging
- shadcn components live in `components/ui/` — do not modify generated primitives unless necessary
- New shared components go in `components/`
- Auth-related components go in `components/auth/`

## API routes
- Authenticate first: `const user = await getCurrentUser()`, return 401 if null
- Check roles explicitly: `if (user.role !== 'ADMIN') return Response.json({ error: 'forbidden' }, { status: 403 })`
- Return `Response.json(...)`, not `NextResponse.json(...)`
- Validate request body before using it — never trust `request.json()` shape

## Database
- Always use `lib/prisma.ts` singleton
- Prefer `select` over `include` when you don't need all fields
- Use `$transaction` for multi-step mutations
- Never raw-query unless Prisma cannot express it

## Naming
- Files: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- React components: `PascalCase`
- Database-facing functions: noun + verb, e.g. `getUserById`, `createArticle`
- API route files are always `route.ts`

## Comments
- Write no comments by default
- One short line max when the WHY is non-obvious (hidden constraint, timing issue, known bug workaround)
- Never describe what the code does — good names do that
