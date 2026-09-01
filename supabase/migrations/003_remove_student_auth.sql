-- ============================================================
-- Prospherum Student Portal
-- Migration 003: Remove student account authentication model
-- ============================================================
--
-- Students do not have Prospherum accounts.
-- They submit applications publicly and receive a reference
-- number. Supabase Auth is reserved for staff access.
-- ============================================================

-- ============================================================
-- REMOVE STUDENT-SPECIFIC RLS POLICIES FIRST
-- ============================================================

drop policy if exists "students_can_view_own_applications"
  on public.applications;

drop policy if exists "students_can_view_own_documents"
  on public.application_documents;

-- ============================================================
-- REMOVE STUDENT APPLICATION RELATIONSHIP
-- ============================================================

drop index if exists public.applications_applicant_user_id_idx;

alter table public.applications
  drop column if exists applicant_user_id;

-- ============================================================
-- SECURITY MODEL
-- ============================================================
--
-- Applications:
--   Public submission is handled through controlled
--   server-side application endpoints.
--
-- Documents:
--   Uploads are handled through controlled server-side
--   operations.
--
-- Staff:
--   Supabase Auth + staff_profiles + RLS.
--
-- Students:
--   No Supabase Auth account.
--   No student login.
--   No student dashboard.
--
-- ============================================================
