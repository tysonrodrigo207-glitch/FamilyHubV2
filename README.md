# Family Hub

A PHP + vanilla JavaScript family dashboard app for posts, messaging, events, directory, and surveys.

## Local development

1. Copy `.env.example` to `.env` and update the database values for your environment.
2. Create a MySQL database named `familyhub` (or change `DB_NAME` in `.env`).
3. Import `database/familyhub.sql` into MySQL.
4. Make sure the app is served from the repo root using a PHP-enabled web server.
5. Ensure the upload directories are writable:
   - `uploads/chat`
   - `uploads/profile`

Example local server:

```bash
cp .env.example .env
php -S 127.0.0.1:8000
```

Then visit `http://127.0.0.1:8000`.

### Default family-head admin

The database seed creates a default admin account for the family head:

- Username: `admin`
- Email: `admin@familyhub.com`
- Password: `admin123`

Regular sign-up users are created as `Member` by default. Only an existing `Admin` can assign higher privileges.

## Production deployment checklist

- Set real values for `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` in your server environment.
- Keep `.env` out of version control.
- Run the SQL schema in `database/familyhub.sql` once on the target database.
- Ensure uploads are writable by the web server.
- Use HTTPS in production so session cookies are secure.
- Make sure your hosting environment supports PHP and MySQL.

## Project structure

- `index.html` – main front-end entry point
- `js/` – JavaScript modules for dashboard functionality
- `php/` – PHP API and auth endpoints
- `database/familyhub.sql` – database schema
- `uploads/` – runtime-generated files such as chat attachments
