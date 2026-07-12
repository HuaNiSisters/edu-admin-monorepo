# EduAdmin-backend

Ensure you are on nvm v22.12.0

You can do that by running: 
`nvm use`

## Update Prisma Schema
`npm run prisma-migrate`

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
