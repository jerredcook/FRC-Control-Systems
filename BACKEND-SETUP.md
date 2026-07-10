# Turning on accounts + progress sync

The site works with **no backend at all** out of the box: progress is saved in each
browser. This guide adds optional accounts so students sign in, their progress
follows them across devices, and mentors see a whole team's progress on one page.

It uses **Supabase** (a hosted Postgres database + login system). The free tier is
plenty for a team. The website itself stays exactly where it is (static, GitHub
Pages); the browser just talks to Supabase directly.

> While the URL/key below are blank in `account-config.js`, nothing changes for
> anyone: the site stays anonymous and local. Accounts switch on the moment you
> fill them in.

---

## 1. Create the project

1. Go to https://supabase.com, sign up, and create a **New project**.
2. Pick a name and a strong database password (save it somewhere). Choose a region
   near you. Wait ~2 minutes for it to finish.

## 2. Create the tables and security rules

1. In the project, open **SQL Editor** -> **New query**.
2. Open `supabase/schema.sql` from this repo, copy all of it, paste it in, and click
   **Run**. You should see "Success". This makes the `teams`, `profiles`, and
   `progress` tables, the row-level-security rules, and the helper functions.

> **Already set up before?** The whole schema file is safe to re-run (everything is
> `create or replace` / `drop policy if exists`). Re-run it whenever this repo adds a
> new function - for example `team_progress()`, which powers the team momentum strip
> on the course hubs. If the strip never appears for signed-in team members, this is
> the step that was missed.

## 3. Connect the website to it

1. In Supabase, open **Project Settings** (gear) -> **API**.
2. Copy two values:
   - **Project URL** (looks like `https://abcdxyz.supabase.co`)
   - **anon public** key (a long string under "Project API keys")
3. Open `account-config.js` in this repo and paste them in:
   ```js
   window.FRC_SUPABASE_URL = "https://abcdxyz.supabase.co";
   window.FRC_SUPABASE_ANON_KEY = "eyJ...the long anon key...";
   ```
4. Commit and push. (The anon key is **meant to be public**. The row-level-security
   rules from step 2 are what actually protect everyone's data.)

## 4. Make yourself the admin

1. Open `login.html` on the live site and **Create account** with your email and a
   password. (Tip for younger students: see "Email confirmation" below.)
2. Back in Supabase **SQL Editor**, run this with your email:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
   ```
3. Reload `mentor.html`. You are now the admin and can create teams.

## 5. Set up teams and people

- On `mentor.html` (as admin), use **Create team** to make a team with a **join
  code** (for example `FALCONS25`). Share that code with your students.
- Students **Create account** on `login.html`, then use **Join a team** with the
  code. Their progress then shows up on your dashboard.
- To make someone a **mentor**, find them in the dashboard table and set their role
  to `mentor` and pick their team (admin-only "Manage" column). Mentors see their
  own team; admins see everyone.

---

## Email confirmation (important for kids)

By default Supabase emails a confirmation link before a new account can sign in.
If your students do not all have easy email access, you can turn that off:

- Supabase -> **Authentication** -> **Providers** -> **Email** -> turn **Confirm
  email** off. Now sign-up logs them straight in.

Trade-off: with it off, anyone with the page can make an account. Since the only
data stored is a display name and lesson progress (no grades, no personal details),
this is usually fine for a team, but it is your call.

## What is stored, and who can see it

- **Stored:** the email you sign up with, a display name you choose, and which
  lessons you have finished. No passwords are ever visible (Supabase handles those).
- **Students** can read and write only their own progress.
- **Mentors** can read (not change) the progress of students on their team.
- **Admins** can see all teams and manage roles.
- These rules are enforced in the database itself (row-level security), not just in
  the page, so they hold even if someone pokes at the API directly.

## Privacy note (minors)

Keep it lean. A display name plus lesson progress is enough for a mentor view. You do
not need real names. If your team has a privacy policy or your school has rules about
storing student data, follow those. You can delete any account from Supabase ->
Authentication -> Users at any time, which also deletes that person's progress.

## Turning it back off

Blank out the two values in `account-config.js`, commit, and push. The site returns
to anonymous, browser-only progress. Your data stays in Supabase until you delete it.
