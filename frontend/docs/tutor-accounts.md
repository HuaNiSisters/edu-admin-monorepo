# Employee accounts

Employees is the single navigation entry for employee records and their login
accounts. The former Users URL redirects here. Only admins see Create employee
and the Actions column (Create account / Reset password); the Supabase Edge
Function also enforces admin authorization.

Employees includes Admin, Reception, and Tutor employees (stored in the existing
`Tutor` directory for compatibility). Class tutor pickers include only Tutor employees. Admins create accounts
with generated temporary passwords; reception can view the list but cannot
manage accounts. Employees sign in with email and password and can change their
password after logging in. No invitation email is needed.

Employees have access to their own personal profile and password changes. Name and
email stay read-only. Employment and payroll fields are visible to their owner but
only editable by admins. Teaching/attendance access is not
enabled until class-specific permissions are defined.

## Deployment

1. Deploy the account-management Edge Function from the `backend` directory:

   ```sh
   supabase functions deploy manage-employee-account
   ```

   Supabase provides the function's service-role environment variable. Do not
   add a service-role or secret key to the frontend environment. The browser
   invokes the function through the Supabase client; it verifies the caller's
   signed-in admin role before using privileged Auth operations.

2. Review existing admin/reception users in Supabase Auth. Assign their trusted
   `app_metadata.role` through the Auth Admin API or reviewed SQL. For example,
   substituting a verified user ID:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
       || '{"role":"admin"}'::jsonb
   where id = 'VERIFIED-ADMIN-USER-UUID';
   ```

   Use `reception` for receptionists. **Do not bulk-copy user_metadata roles**:
   users can edit that metadata themselves. Users without a trusted role are
   denied app access. Existing users should sign out and back in after this change.

3. Apply all pending migrations, in order, using the existing Prisma migration workflow
   (`npx prisma migrate deploy` from `backend`):

   - `20260926000000_tutor_accounts`: account links, profile protection, and RLS.
   - `20260926010000_tutor_password_accounts`: replaces invitation linking with
     admin-created password accounts.
   - `20260926020000_employee_details`: private employee details, creation/saving
     functions, and immutable names/emails.
   - `20260926030000_employee_roles`: the three Job options, linked account role
     synchronization, staff self-profile access, and tutor-only class pickers.
   - `20260927000000_staff_student_data_read`: ensures admin and reception roles
     can read student, class, attendance, enrolment, and payment data when older
     table policies are narrower.
   - `20260930000000_tutor_student_data_read`: lets tutors read student, class,
     enrolment, and attendance data for the search and attendance screens. Tutors
     can search all students; writes to these tables remain limited to admin and
     reception.
   - `20261004000000_tutor_own_class_attendance`: narrows tutors' class,
     enrolment, term, and attendance reads to classes assigned to their account.

   If you already applied the earlier migrations, only apply the pending ones.
   If you apply SQL manually in Supabase, run the new migration's SQL rather
   than rerunning earlier migrations. Keep Prisma's migration history aligned with
   any manually applied migrations. These migrations require Supabase's `auth`
   schema and database-owner privileges. They have not been applied by Codex.
   The external FK and Auth triggers are SQL-managed; review future
   Prisma-generated migrations so they do not remove them.

4. In Supabase Auth, disable **Allow new users to sign up** and keep email/password
   sign-in enabled. SMTP and invitation/magic-link email templates are no longer
   required for this flow. Existing admin/reception role configuration is unchanged.

## Using the app

Employees includes a **Create employee** modal for admins, matching the subject
and class dialogs. Enter first name, last name, email, mobile, and job (which
defaults to Tutor, with Admin and Reception also available). The remaining fields can be completed later. Saving closes
the modal and refreshes the list; click the employee to open their full details.
Creating a login account is a separate action on the Employees list. The selected
Job determines the new account's role. Saving a different Job on an existing
employee also changes their linked account's permissions in the same transaction.
Only admins can change Job. Manage linked roles through this form rather than
editing Auth metadata separately; the SQL example above is for bootstrapping
standalone admin/reception accounts.

The role migration keeps existing trusted Auth roles, normalizes matching old
job labels to lowercase, and maps other legacy job titles to Tutor. It does not
promote existing accounts based solely on old free-text job titles.

Click an employee row or name to open their details. Admins can edit contact,
employment, emergency contact, payroll/bank/super, education, checks, skills,
and HSC subjects. Details initially appear in disabled fields, matching student
details. Click **Edit** to enable permitted fields. **Save changes** persists the
edits and returns to viewing; **Cancel** discards unsaved changes and returns to
viewing. Names and emails stay locked and can only be set during creation.
Existing employees without extra details start with blank optional fields.
Reception can view the employee directory and edit their own personal details,
but cannot create employees, edit anyone else, or view others’ private details.

Private fields live in `TutorDetails`, separate from the `Tutor` directory so
existing class/tutor lookups don't include TFNs or bank details. RLS allows only
admins and the linked employee to read a details row. Non-admin employees can edit their own
contact/education/check information; employment, hourly rate, tax, banking,
and superannuation fields are read-only for them. Database triggers enforce
these restrictions even for direct API calls. Creation and profile saves run
transactionally so directory and private details cannot be partially saved.

### Login accounts

1. An admin opens Employees and clicks **Create account** beside an employee with an
   email address. Confirm creation in the dialog.
2. Copy the email and generated temporary password and share them with the employee.
   The password stays in that dialog until you close it and is not retrievable
   afterwards. It is never stored as plaintext in an app table or browser storage.
3. The employee signs in with the email and password, then opens **My profile →
   Change password**. They enter and confirm their new password. Changing it is
   optional rather than enforced on first login; the temporary password remains
   valid until changed or reset.
4. If the password is lost, an admin can use **Reset password** on the employee’s row
   to generate a replacement. The dialog confirms this will replace the current
   password. Forgotten-password help directs users to an administrator, without
   sending an email. Recovery for standalone accounts without an employee link is managed in Supabase.

Existing linked accounts created by the earlier invitation flow can use **Reset
password** to receive a password without accepting an email invitation. This also
confirms their email through the trusted admin operation. Unrelated Auth accounts
with the same email are not automatically adopted or changed.

If an account was created but the response was lost, refresh Employees and use
**Reset password**. Creation retries never silently change an existing password.
If Supabase secure password change requests reauthentication, sign out and sign
in again before changing the password.

## Security and account lifecycle

- Account creation and resets run in the `manage-employee-account` Edge Function.
  It verifies the signed-in admin with `getUser()` before using the privileged
  Auth client. The email and account ID come from the tutor row,
  not request input. Reset also verifies that the linked user has the selected Job
  role and matching email. Only admins can reset any linked employee account.
- Each temporary password contains cryptographically random bytes and upper/lower
  case, numeric, and symbol characters. Credential responses use `Cache-Control:
  no-store`; passwords are not logged. Clipboard copying happens only when the
  admin clicks **Copy login details**.
- A service-only SQL function validates new accounts. A trigger on Auth metadata
  links the account and tutor within the Auth transaction. A conflicting account
  link or changed tutor email rolls creation back. Trusted `app_metadata` supplies
  the role/link; user-editable metadata cannot do so.
- The follow-up migration disables the old invitation trigger and revokes the
  old reservation RPC. Historical invitation records are retained but unused.
- RLS limits tutors to their own row. A trigger protects IDs/account links and
  email even through direct database API calls. Auth email-change requests are
  blocked for linked tutors, including privileged email changes; there is no
  email-change workflow in this release. Any future admin email workflow must
  update Auth and the tutor record together with explicit safeguards.
- Tutors can search all students, but class, enrolment, term, and attendance
  reads are limited to classes assigned to their linked tutor record. Admins and
  reception retain writes; tutor writes remain denied. Payment data remains
  staff-only. Unknown or missing roles are denied.
- RLS cannot protect routes using the service key, the separate Fastify API, or
  pre-existing `SECURITY DEFINER` RPCs. Before enabling production tutor accounts,
  audit these independently (in particular the deployed `search_students` RPC,
  whose definition is not in this repository). Do not expose an unguarded
  privileged backend to tutor clients.

Reference: [Supabase account creation](https://supabase.com/docs/reference/javascript/auth-admin-createuser),
[admin account updates](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid),
[row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).
