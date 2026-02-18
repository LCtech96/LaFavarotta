-- ============================================
-- Enable Row Level Security (RLS) on all public tables
-- Fixes Supabase linter: rls_disabled_in_public + sensitive_columns_exposed
-- ============================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor).
-- Your app uses Prisma with the connection string (pooler); that role typically
-- bypasses RLS, so reads/writes via Next.js API will continue to work.
-- Enabling RLS blocks direct PostgREST/API access for anon/authenticated roles
-- unless you add policies (we add none here = full lockout for API, safe).
-- ============================================

-- Enable RLS on each table (no row is visible/editable via PostgREST anon/authenticated until you add policies)
ALTER TABLE "public"."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Customization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Content" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."HolidayMenu" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."HolidayMenuVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."HolidayMenuItemVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."HolidayMenuItem" ENABLE ROW LEVEL SECURITY;

-- Optional: explicit "deny all" policies for anon/authenticated (makes intent clear; default is already no access)
-- Uncomment if you want to be explicit. With RLS enabled and no policies, anon/authenticated already get no rows.

-- CREATE POLICY "deny_anon_authenticated_category" ON "public"."Category"
--   FOR ALL TO anon USING (false) WITH CHECK (false);
-- CREATE POLICY "deny_anon_authenticated_menu_item" ON "public"."MenuItem"
--   FOR ALL TO anon USING (false) WITH CHECK (false);
-- ... (same for other tables)

-- Verification (run after): RLS should be on for all
-- SELECT relname, relrowsecurity FROM pg_class
-- WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
--   AND relkind = 'r'
--   AND relname IN ('Category','MenuItem','Staff','Customization','Admin','Content','Post','HolidayMenu','CartItem','HolidayMenuVariant','HolidayMenuItemVariant','HolidayMenuItem');
