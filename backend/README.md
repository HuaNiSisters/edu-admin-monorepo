# EduAdmin-backend

To start the BE, just run this on the backend folder: 
`npm run dev`

Ensure you are on nvm v22.12.0

You can do that by running: 
`nvm use`

## Apply existing database migrations

From `backend`, run `npm run prisma-migrate` to apply pending migrations to the
database configured by `DATABASE_URL`. This runs `prisma migrate deploy`, which
uses the existing migration files without creating a shadow database.

The account migrations require a Supabase database with its existing `auth`
schema and database-owner privileges. A plain PostgreSQL database does not
provide those Supabase dependencies.

If `migrate dev` fails with `schema "auth" does not exist` in the shadow database
while you are applying existing migrations, use `npm run prisma-migrate` instead.
Creating new migrations with `migrate dev` is a separate workflow that requires
a shadow database prepared with the Supabase Auth dependencies.

## TypeScript checks

Run `npm run build` from `backend` to regenerate the Prisma client and check
the Fastify backend, scripts, and Prisma configuration. The current TypeScript
configuration uses `noEmit`, so this command does not produce JavaScript files.

Run the reminder tests with
`node --experimental-strip-types --test src/service/smsReminderCore.test.ts`
on Node 22.12 or later.

Supabase Edge Functions run under Deno and are excluded from the Node TypeScript
project. Check them separately with
`deno check supabase/functions/manage-employee-account/index.ts`.

The reminder schema matches the existing
`20261011000000_sms_reminder_tracking` migration. Apply it with
`npm run prisma-migrate` before using reminder tracking. Ordinary template
listing, previews, creation, updates, and sending select only their existing
columns and do not require reminder tracking to be deployed.

## Deploy employee account management

The frontend invokes this Supabase Edge Function to create employee accounts
and reset their passwords. From the `backend` directory, link this project to
the same Supabase project configured in the frontend, then deploy:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy manage-employee-account
```

The function requires a valid signed-in admin and checks the trusted
`app_metadata.role` before using Supabase Auth Admin. Supabase provides the
service-role key in the Edge Function runtime. Keep it out of frontend
environment variables. The function is configured with JWT verification in
`supabase/config.toml`.

See [employee account setup](../frontend/docs/tutor-accounts.md) for the
database migrations, role configuration, and account workflow.

## Troubleshooting 
If you see the error: 
`Could not find the migration file at migration.sql. Please delete the directory or restore the migration file.`

- Navigate to your project's migration directory (usually prisma/migrations/).
- Find the specific folder that is missing the migration.sql file.
- Delete that entire folder (not just the contents).

If you are getting errors like: 
`The table `public.Student` does not exist in the current database.`
Run: 
`npm run prisma-migrate`
Then you can seed your sample data

## Reset Prisma database
`npx prisma migrate reset`

## Sample data

After setting `DATABASE_URL` and running the migrations, switch to Node 22.12
or later (`nvm use v22.12.0`) and create a realistic sample dataset with:

`npm run seed:sample`

The command is repeatable: it replaces only records associated with the
`@sample.eduadmin.test` sample identities. It leaves any real tutors and their
subject offerings unchanged.
It creates 100 students, 120 parents, 10 tutors, 20 classes, 200 enrolments,
2,000 attendance records, payments, 2026 terms, and classes restricted to the
existing subject names. The command generates the Prisma client before it
runs. Remove just this sample dataset with
`npm run clean:sample`.


## Owing SMS sent status

The owings table loads saved SMS templates and successful recipient submissions
from the backend. `OwingSmsSend` records are keyed by enrolment, term, template ID,
and recipient phone number. A new term starts with no sends. Renaming a template
does not lose its history. The checkmark means all current student/parent
recipients were accepted by the provider, not confirmed handset delivery.
Previously sent messages cannot be reconstructed because they were not recorded.

Apply the tracking migration with `npx prisma migrate deploy`, then restart
`npm run dev` to generate the current Prisma client.

### Try mock sending without sending an SMS

Set `SMS_MOCK_SEND=true` in `backend/.env` and restart the backend. Refresh Owings,
select an owing and a template, then click **Simulate send**. The UI displays a
mock-mode banner. The backend skips the provider send and saves the normal sent
history, so the checkmark survives a refresh. Template previews still read the
existing content from Twilio; no text message is submitted.

Set `SMS_MOCK_SEND=false` and restart to resume real sends. Mock checkmarks remain
saved and those recipients will be skipped for that template/enrolment/term, so
use sample enrolments. Mock mode is rejected when `NODE_ENV=production`.
