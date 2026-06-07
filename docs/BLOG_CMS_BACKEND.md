# Blog CMS Backend

This project includes a Next.js API-route backend for an authenticated blog CMS.

## Stack

- Next.js API routes
- PostgreSQL through Prisma
- Google/Gmail login through server-side Google ID token verification
- HttpOnly database-backed sessions
- Cloudinary media upload support
- Zod request validation
- HTML sanitization for rich-text editor output

## Environment

Copy `.env.example` and set:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/amittech_blog?schema=public"
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
SESSION_COOKIE_NAME="amittech_session"
SESSION_DAYS="30"
SUPER_ADMIN_EMAILS="you@example.com"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

## Database

Generate Prisma client:

```bash
npm run db:generate
```

Create and apply migrations locally:

```bash
npx prisma migrate dev --name init_blog_cms
```

Apply migrations in production:

```bash
npm run db:migrate
```

## Auth Flow

The dashboard UI is available at:

```text
/admin
```

It loads the Google client ID through:

```http
GET /api/auth/config
```

The frontend should use Google Identity Services to get a Google ID token, then call:

```http
POST /api/auth/google
Content-Type: application/json

{ "credential": "<google-id-token>" }
```

The server verifies the token, creates or updates the user, creates a DB session, and sets an HttpOnly cookie.

## Endpoints

Auth:

- `POST /api/auth/google`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Posts:

- `POST /api/posts`
- `GET /api/posts`
- `GET /api/posts/:slugOrId`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `PATCH /api/posts/:id/publish`
- `PATCH /api/posts/:id/unpublish`
- `PATCH /api/posts/:id/archive`
- `GET /api/my/posts`

Admin:

- `GET /api/admin/users`
- `GET /api/admin/posts`
- `GET /api/admin/media`
- `PUT /api/admin/posts/:id`
- `DELETE /api/admin/posts/:id`
- `PATCH /api/admin/posts/:id/feature`
- `PATCH /api/admin/users/:id/role`
- `PATCH /api/admin/users/:id/status`

Media:

- `POST /api/media/upload`
- `GET /api/media/my`
- `DELETE /api/media/:id`

## Authorization

- `USER` can create posts, edit/delete own posts, and manage own media.
- `SUPER_ADMIN` can manage all users, posts, media, ownership, role/status, and featured state.
- Soft deletes are used for posts and media.

## Rich Text Content

APIs accept either JSON editor content through `content` or sanitized HTML through `html`.

Supported rich content includes headings, paragraphs, lists, code blocks, blockquotes, tables, images, YouTube/Vimeo iframes, links, and callout-style HTML blocks.

## Media Rules

Allowed uploads:

- Images: `jpg`, `jpeg`, `png`, `webp`, max 5MB
- GIF: `gif`, max 10MB
- Video: `mp4`, `webm`, max 50MB

Uploads require Cloudinary environment variables. Without them, the upload endpoint returns a clear `MEDIA_STORAGE_NOT_CONFIGURED` response instead of writing unsafe temporary production files.
