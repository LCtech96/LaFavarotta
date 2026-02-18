-- Fix Supabase linter: function_search_path_mutable
-- Run in Supabase SQL Editor to set immutable search_path on batch_insert_menu_images.

ALTER FUNCTION public.batch_insert_menu_images(jsonb) SET search_path = public;
