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

## Render deployment

Render is a good fit for this PHP app because it can host the web service and a MySQL database.

1. Push this repo to GitHub.
2. In Render, click `New` → `Web Service`.
3. Connect your GitHub repository.
4. Use the project root as the service root.
5. Set the start command to:

```bash
php -S 0.0.0.0:$PORT -t .
```

6. Create a Render MySQL database and copy the connection values into the service environment variables.
7. Add these variables in Render:

```bash
APP_ENV=production
DB_HOST=your-render-db-host
DB_PORT=3306
DB_NAME=familyhub
DB_USER=your-db-user
DB_PASS=your-db-password
```

8. Run the SQL from `database/familyhub.sql` against the Render database once.
9. Deploy the service.
10. Render will generate a live URL such as `https://familyhub.onrender.com`.

The app can then be shared with family members or testers using that link.

## Project structure

- `index.html` – main front-end entry point
- `js/` – JavaScript modules for dashboard functionality
- `php/` – PHP API and auth endpoints
- `database/familyhub.sql` – database schema
- `uploads/` – runtime-generated files such as chat attachments
