# EduAdmin-backend

Ensure you are on nvm v22.12.0

You can do that by running: 
`nvm use`

## Update Prisma Schema
`npm run prisma-migrate`

## Troubleshooting 
If you see the error: 
`Could not find the migration file at migration.sql. Please delete the directory or restore the migration file.`

- Navigate to your project's migration directory (usually prisma/migrations/).
- Find the specific folder that is missing the migration.sql file.
- Delete that entire folder (not just the contents).

If you are getting errors like: 
`The table `public.Student` does not exist in the current database.`
Run: 
`npx prisma migrate dev --name init` 
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
