# /review

Review changed code for correctness, security, and consistency with project conventions.

## Checklist

### Security
- [ ] API routes check authentication (`getCurrentUser()`) before mutations
- [ ] Role checks are present where required (`ADMIN`, `CONTRIBUTOR`)
- [ ] No raw SQL that could allow injection
- [ ] No secrets or credentials in code or comments
- [ ] Input from `request.json()` is validated before use

### Correctness
- [ ] Prisma queries use the singleton from `lib/prisma.ts`
- [ ] Server Components do not import client-only code
- [ ] Client Components are marked `"use client"`
- [ ] New DB columns have migrations (no schema drift)
- [ ] Cascade deletes are intentional and documented

### Conventions
- [ ] No unnecessary comments (no "what", only "why")
- [ ] No `console.log` left in production code
- [ ] New API routes follow the error format in `docs/api.md`
- [ ] Tailwind classes use `cn()` from `lib/utils.ts` for conditional merging
- [ ] No direct `PrismaClient` instantiation

### Performance
- [ ] N+1 queries avoided (use `include` or `select` to fetch relations)
- [ ] Images reference allowed domains (see `next.config.ts`)

## Output format

For each finding: **file:line — severity — description — suggested fix**

Severity levels: `critical` | `major` | `minor` | `suggestion`
