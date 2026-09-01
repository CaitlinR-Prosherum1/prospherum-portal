-- ============================================================
-- Prospherum Student Portal
-- Migration 002: Authentication, user relationships and RLS
-- ============================================================

-- ============================================================
-- APPLICATION -> AUTH USER
-- ============================================================

alter table public.applications
  add column applicant_user_id uuid
  references auth.users(id)
  on delete set null;

create index applications_applicant_user_id_idx
  on public.applications(applicant_user_id);

-- ============================================================
-- SECURITY HELPER FUNCTIONS
-- ============================================================

-- Returns true when the currently authenticated user is an
-- active Prospherum staff member.

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_profiles
    where id = auth.uid()
      and active = true
  );
$$;


-- Returns the role of the currently authenticated staff member.

create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.staff_profiles
  where id = auth.uid()
    and active = true
  limit 1;
$$;


-- Returns true when the current staff member has the
-- requested role.

create or replace function public.staff_has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_profiles
    where id = auth.uid()
      and active = true
      and role = required_role
  );
$$;


-- ============================================================
-- APPLICATION POLICIES
-- ============================================================

-- Students can view only their own application.

create policy "students_can_view_own_applications"
on public.applications
for select
to authenticated
using (
  applicant_user_id = auth.uid()
);


-- Active staff can view all applications.

create policy "staff_can_view_applications"
on public.applications
for select
to authenticated
using (
  public.is_active_staff()
);


-- ============================================================
-- APPLICATION DOCUMENT POLICIES
-- ============================================================

-- Students can view documents belonging to their own application.

create policy "students_can_view_own_documents"
on public.application_documents
for select
to authenticated
using (
  exists (
    select 1
    from public.applications a
    where a.id = application_documents.application_id
      and a.applicant_user_id = auth.uid()
  )
);


-- Active staff can view all application documents.

create policy "staff_can_view_documents"
on public.application_documents
for select
to authenticated
using (
  public.is_active_staff()
);


-- Active staff can create application documents.

create policy "staff_can_insert_documents"
on public.application_documents
for insert
to authenticated
with check (
  public.is_active_staff()
);


-- Active staff can update application documents.

create policy "staff_can_update_documents"
on public.application_documents
for update
to authenticated
using (
  public.is_active_staff()
)
with check (
  public.is_active_staff()
);


-- ============================================================
-- STAFF PROFILE POLICIES
-- ============================================================

-- Staff can view their own profile.

create policy "staff_can_view_own_profile"
on public.staff_profiles
for select
to authenticated
using (
  id = auth.uid()
);


-- ADMIN and MANAGER users can view staff profiles.

create policy "management_can_view_staff_profiles"
on public.staff_profiles
for select
to authenticated
using (
  public.staff_has_role('ADMIN')
  or public.staff_has_role('MANAGER')
);


-- ============================================================
-- APPLICATION NOTES
-- ============================================================

-- Active staff can view application notes.

create policy "staff_can_view_application_notes"
on public.application_notes
for select
to authenticated
using (
  public.is_active_staff()
);


-- Active staff can create notes.

create policy "staff_can_insert_application_notes"
on public.application_notes
for insert
to authenticated
with check (
  public.is_active_staff()
  and staff_id = auth.uid()
);


-- ============================================================
-- AUDIT LOG
-- ============================================================

-- Active staff can view audit history.

create policy "staff_can_view_audit_log"
on public.application_audit_log
for select
to authenticated
using (
  public.is_active_staff()
);


-- Active staff can create audit entries for themselves.

create policy "staff_can_insert_audit_log"
on public.application_audit_log
for insert
to authenticated
with check (
  public.is_active_staff()
  and staff_id = auth.uid()
);


-- ============================================================
-- SECURITY HARDENING
-- ============================================================

-- Prevent ordinary authenticated clients from modifying
-- sensitive application workflow fields directly.
--
-- Application submission and staff workflow operations will
-- eventually be handled through controlled server-side actions.

revoke insert on public.applications from authenticated;
revoke update on public.applications from authenticated;
revoke delete on public.applications from authenticated;


-- Students should not directly create, modify or delete
-- application documents. Controlled server-side operations
-- will handle uploads.

revoke insert on public.application_documents from authenticated;
revoke update on public.application_documents from authenticated;
revoke delete on public.application_documents from authenticated;


-- Staff profiles are managed by controlled administrative
-- operations rather than direct client-side modification.

revoke insert on public.staff_profiles from authenticated;
revoke update on public.staff_profiles from authenticated;
revoke delete on public.staff_profiles from authenticated;


-- Notes and audit entries are append-only from the client.
-- Deletion is deliberately disabled.

revoke update on public.application_notes from authenticated;
revoke delete on public.application_notes from authenticated;

revoke update on public.application_audit_log from authenticated;
revoke delete on public.application_audit_log from authenticated;


-- ============================================================
-- SECURITY NOTES
-- ============================================================
--
-- Authentication is handled by Supabase Auth.
--
-- Students are linked to applications using:
--
--   applications.applicant_user_id -> auth.users.id
--
-- Students can only read their own applications/documents.
--
-- Staff access is determined through staff_profiles.
--
-- Staff roles:
--
--   ADMIN
--   MANAGER
--   REVIEWER
--
-- Sensitive writes will be performed through controlled
-- server-side application actions.
--
-- ============================================================
