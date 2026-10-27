-- Run in the Supabase SQL editor AFTER creating the owner's login
-- (Authentication → Users → Add user → email + password, "Auto confirm" on).
-- Replace the email below, then run once.
update public.user_profiles
set role = 'admin', full_name = coalesce(full_name, 'Owner')
where id = (select id from auth.users where email = 'owner@example.com');

-- Optional: give a staff member editing access (no product deletion or role changes)
-- update public.user_profiles set role = 'editor' where id = (select id from auth.users where email = 'staff@example.com');
