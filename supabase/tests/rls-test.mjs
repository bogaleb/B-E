// Applies the ETHIO migration + seed to an EMPTY throwaway Postgres database with
// Supabase-like roles and checks the Row Level Security rules.
//   PGTEST_URL=postgres://postgres:pw@localhost:54329/postgres npm run test:db
// Never point this at your real Supabase project.
import pg from "pg";
import fs from "node:fs";

const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
if (!process.env.PGTEST_URL) { console.error("Set PGTEST_URL to an empty throwaway Postgres database."); process.exit(2); }
const c = new pg.Client({ connectionString: process.env.PGTEST_URL });
await c.connect();

const stubs = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth; create schema storage;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema public, auth, storage to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
grant all on all tables in schema storage to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
`;
await c.query(stubs);
await c.query(fs.readFileSync(`${root}/migrations/20261027000001_initial_schema.sql`, "utf8"));
await c.query(fs.readFileSync(`${root}/seed.sql`, "utf8"));

const ADMIN = "11111111-1111-1111-1111-111111111111", VIEWER = "22222222-2222-2222-2222-222222222222";
await c.query(`insert into auth.users (id, email) values ('${ADMIN}', 'owner@example.com'), ('${VIEWER}', 'someone@example.com')`);
await c.query(`update public.user_profiles set role = 'admin' where id = '${ADMIN}'`);

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) pass++; else fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}`); };
async function as(role, uid, sql, params) {
  await c.query("begin");
  try {
    await c.query(`set local role ${role}`);
    await c.query(`select set_config('request.jwt.claim.sub', $1, true)`, [uid ?? ""]);
    const r = await c.query(sql, params);
    await c.query("commit");
    return { rows: r.rows, rowCount: r.rowCount };
  } catch (e) {
    await c.query("rollback");
    return { error: e.message };
  }
}

// Catalog
ok((await as("anon", null, "select * from products")).rows?.length === 5, "anon can read the 5 seeded products");
ok((await as("anon", null, "select * from product_images")).rows?.length === 8, "anon can read product images");
ok((await as("anon", null, "select * from site_settings")).rows?.length === 4, "anon can read public settings");
await c.query("update products set is_active = false where slug = 'beans'");
ok((await as("anon", null, "select * from products")).rows?.length === 4, "hidden products are not public");
ok((await as("authenticated", ADMIN, "select * from products")).rows?.length === 5, "admin still sees hidden products");
ok((await as("anon", null, "update products set name = 'x'")).rowCount === 0, "anon cannot edit products");
ok(!!(await as("anon", null, "insert into products (slug, name) values ('hack', 'Hack')")).error, "anon cannot create products");
ok(!!(await as("authenticated", VIEWER, "insert into products (slug, name) values ('hack', 'Hack')")).error, "signed-in non-admin cannot create products");
ok(!(await as("authenticated", ADMIN, "insert into products (slug, name) values ('new-item', 'New item')")).error, "admin can create products");

// Submissions
const ins = await as("service_role", null, `insert into inquiries (reference, buyer_type, name, email, phone, delivery_zip) values ('ETH-261027-ABCDE', 'household', 'Abeba', 'a@example.com', '5715550134', '20164') returning id`);
ok(!ins.error, "server (service role) can store an inquiry");
const inqId = ins.rows?.[0]?.id;
ok(!(await as("service_role", null, `insert into inquiry_items (inquiry_id, product_name, quantity) values ($1, 'Red Lentils', 2)`, [inqId])).error, "server can store inquiry items");
ok(!!(await as("service_role", null, `insert into inquiries (reference, buyer_type, name, email, phone, delivery_zip) values ('BAD', 'household', 'Abeba', 'a@example.com', '5715550134', '20164')`)).error, "reference format is enforced");
ok(!!(await as("service_role", null, `insert into inquiry_items (inquiry_id, product_name, quantity) values ($1, 'Red Lentils', 0)`, [inqId])).error, "quantity must be at least 1");
ok(!!(await as("anon", null, `insert into inquiries (reference, buyer_type, name, email, phone, delivery_zip) values ('ETH-261027-ZZZZZ', 'household', 'Bot', 'b@example.com', '5715550134', '20164')`)).error, "anon cannot write inquiries directly");
ok((await as("anon", null, "select * from inquiries")).rows?.length === 0, "anon cannot read inquiries");
ok((await as("anon", null, "select * from inquiry_items")).rows?.length === 0, "anon cannot read inquiry items");
ok((await as("authenticated", VIEWER, "select * from inquiries")).rows?.length === 0, "signed-in non-admin cannot read inquiries");
ok((await as("authenticated", ADMIN, "select * from inquiries")).rows?.length === 1, "admin can read inquiries");
ok((await as("authenticated", ADMIN, "update inquiries set status = 'contacted', internal_notes = 'Called' where id = $1", [inqId])).rowCount === 1, "admin can update status");
ok(!!(await as("authenticated", ADMIN, "update inquiries set status = 'paid' where id = $1", [inqId])).error, "invalid status rejected");
ok((await as("authenticated", VIEWER, "update inquiries set status = 'cancelled'")).rowCount === 0, "non-admin cannot update inquiries");
ok((await as("anon", null, "select * from wholesale_inquiries")).rows?.length === 0, "anon cannot read wholesale inquiries");
ok((await as("anon", null, "select * from contact_messages")).rows?.length === 0, "anon cannot read contact messages");

// Roles
ok((await as("authenticated", VIEWER, `update user_profiles set role = 'admin' where id = '${VIEWER}'`)).rowCount === 0, "a user cannot promote themselves");
ok((await as("authenticated", VIEWER, "select * from user_profiles")).rows?.length === 1, "a user only sees their own profile");
ok((await as("authenticated", ADMIN, "select * from user_profiles")).rows?.length === 2, "admin sees all profiles");

// Audit log
ok(!(await as("authenticated", ADMIN, `insert into admin_activity_logs (actor_id, action, entity_type) values ('${ADMIN}', 'test', 'x')`)).error, "admin can append to the audit log");
ok(!!(await as("authenticated", ADMIN, `insert into admin_activity_logs (actor_id, action, entity_type) values ('${VIEWER}', 'spoof', 'x')`)).error, "audit entries cannot be attributed to someone else");
ok((await as("authenticated", ADMIN, "delete from admin_activity_logs")).rowCount === 0, "audit log cannot be deleted");

// Rate limit
ok(!!(await as("anon", null, "select check_rate_limit('x', 2, 60)")).error, "anon cannot call the rate limiter");
const r1 = await as("service_role", null, "select check_rate_limit('ip1', 2, 60) a, check_rate_limit('ip1', 2, 60) b, check_rate_limit('ip1', 2, 60) c");
ok(r1.rows?.[0]?.a === true && r1.rows?.[0]?.b === true && r1.rows?.[0]?.c === false, "rate limiter blocks the third hit in a window");

// Storage
ok((await as("anon", null, "insert into storage.objects (bucket_id, name) values ('product-images', 'x.png')")).error !== undefined, "anon cannot upload product images");
ok(!(await as("authenticated", ADMIN, "insert into storage.objects (bucket_id, name) values ('product-images', 'x.png')")).error, "admin can upload product images");

console.log(`\n${pass} passed, ${fail} failed`);
await c.end();
process.exit(fail ? 1 : 0);
