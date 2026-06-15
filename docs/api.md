# API Reference

All routes are under `/api/`. Route handlers live in `app/api/`. Authentication uses the `session` HTTP-only cookie.

## Auth endpoints

### `POST /api/login`
Authenticate a user.
- **Body:** `{ username: string, password: string }`
- **Response 200:** `{ user: { id, username } }` + sets `session` cookie
- **Response 401:** `{ error: 'invalid_credentials' }`

### `POST /api/logout`
Destroy the session.
- **Response 200:** clears `session` cookie

### `POST /api/register`
Create a new account.
- **Body:** `{ username: string, password: string }`
- **Response 201:** `{ user: { id, username } }` + sets `session` cookie
- **Response 409:** `{ error: 'username_taken' }`

### `GET /api/me`
Return the current authenticated user.
- **Response 200:** `{ user: { id, username, role, locale, theme } }`
- **Response 401:** `{ error: 'unauthenticated' }`

### `GET /api/check`
Lightweight session validity check.
- **Response 200:** `{ ok: true }` or `{ ok: false }`

## Articles

### `GET /api/articles`
List published articles.
- **Query params:** `locale`, `tag`, `featured`, `limit`, `offset`
- **Response 200:** `{ articles: Article[] }`

### `POST /api/articles`
Create an article. Requires `CONTRIBUTOR` or `ADMIN` role.
- **Body:** `{ tag, cover, defaultLocale, translations: [{ locale, title, content }] }`
- **Response 201:** `{ article: Article }`

### `GET /api/articles/[id]`
Get a single article with translations.

### `PATCH /api/articles/[id]`
Update article. Requires author or `ADMIN`.

### `DELETE /api/articles/[id]`
Delete article. Requires author or `ADMIN`.

## Admin

### `GET /api/admin/health`
Health check. Requires `ADMIN`.
- **Response 200:** `{ status: 'ok', db: 'ok' }`

### `GET /api/admin/users`
List all users. Requires `ADMIN`.

### `PATCH /api/admin/users/[id]`
Update user role. Requires `ADMIN`.

## Error format

All error responses follow: `{ error: string, details?: unknown }`

HTTP status codes:
- `400` — validation error
- `401` — unauthenticated
- `403` — unauthorized (wrong role)
- `404` — not found
- `409` — conflict
- `500` — internal server error
