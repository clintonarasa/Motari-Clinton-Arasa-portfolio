# Deployment Runbook

This project uses a Vite client, a Node server, and PostgreSQL/Neon.

## Contact form email

The public contact form always saves submissions in Neon. To deliver each submission to the recipient configured in Admin Settings, add these Vercel Production environment variables:

- `RESEND_API_KEY`: API key from Resend.
- `RESEND_FROM_EMAIL`: a verified Resend sender, for example `Portfolio <hello@your-domain.com>`.

The recipient is the admin user's email under **Admin Settings > Contact Form Recipient**. Redeploy after adding or changing these variables. Without the Resend variables, submissions are saved but email delivery is not enabled.

## Staging first

1. Create a separate staging database. Do not point staging at production.
2. Copy `.env.staging.example` to the staging host as `.env`.
3. Generate a unique secret:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

4. Build and start staging:

```sh
pnpm install --frozen-lockfile
pnpm run lint
pnpm test -- --run
pnpm run build
pnpm start
```

5. Run smoke checks:

```sh
curl -fsS https://staging.example.com/api/health
curl -I https://staging.example.com/
```

6. Test login, logout, admin authorization, CRUD, uploads, resume PDF export, mobile layout, and invalid form/file inputs before promotion.

## HTTPS

Terminate TLS at the hosting provider, load balancer, or reverse proxy. Forward only HTTPS traffic to the Node process on its private port. The application sets HSTS and secure session cookies in the production server.

Example Nginx shape:

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

Use the hosting provider's managed certificate when available. Do not commit certificate files or private keys.

## Database backup

Run backups from a protected machine with `DATABASE_URL` set to the production connection string. Store the output in encrypted, access-controlled storage, not in the repository.

```sh
mkdir -p backups
pg_dump "$DATABASE_URL" --format=custom --no-owner --file "backups/portfolio-$(Get-Date -Format yyyyMMdd-HHmmss).dump"
```

On Linux/macOS, replace the filename expression with `$(date +%Y%m%d-%H%M%S)`.

Keep an encrypted copy in a second location. Retain daily backups for at least 14 days and weekly backups for at least 8 weeks, according to the hosting policy.

## Restore verification

Never test a restore against production. Create a fresh restore database, then run:

```sh
createdb portfolio_restore_test
pg_restore --clean --if-exists --no-owner --dbname "$RESTORE_DATABASE_URL" backups/portfolio-YYYYMMDD-HHMMSS.dump
psql "$RESTORE_DATABASE_URL" -c "SELECT count(*) FROM users;"
psql "$RESTORE_DATABASE_URL" -c "SELECT count(*) FROM portfolio_assets;"
```

Start the application against the restored database and verify `/api/health`, admin login, the home page, uploads, and resume rendering. Record the restore date and result.

## Monitoring

Monitor these checks after deployment:

- `GET /api/health` returns HTTP 200 and `{ "status": "ok" }`.
- HTTP 5xx rate and response latency.
- Database connection/pool errors.
- Failed login bursts and HTTP 429 responses.
- Upload failures and disk/database storage growth.
- Backup job success and restore-test success.

Send application stdout/stderr to the hosting provider's log service. Add uptime monitoring for `/api/health` and alert on two consecutive failures.

## Rate limiting

Login attempts are limited to five attempts per client address per 15-minute window. This is an in-memory protection for a single Node process. If the service is scaled horizontally, move the counter to a shared Redis or provider rate-limit service.

## Promotion checklist

- Staging smoke tests pass.
- Production secrets are configured outside source control.
- Database backup completed and restore test is recent.
- HTTPS certificate is active and HTTP redirects to HTTPS.
- Health monitoring and alerts are active.
- `pnpm run lint`, `pnpm test -- --run`, and `pnpm run build` pass.
- Run one post-deployment smoke test before announcing the release.
