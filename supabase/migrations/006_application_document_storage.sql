-- ============================================================
-- Prospherum Learner Application Portal
-- Migration 006: Application document storage
-- ============================================================

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'application-documents',
  'application-documents',
  false
)
on conflict (id) do nothing;


-- ============================================================
-- STORAGE SECURITY
-- ============================================================

-- Application documents are private.
-- Public applicants do not receive direct access to the bucket.
-- Uploads will be handled through the controlled server-side
-- application endpoint.

create policy "staff_can_view_application_files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'application-documents'
  and public.is_active_staff()
);


create policy "staff_can_delete_application_files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'application-documents'
  and public.is_active_staff()
);


-- ============================================================
-- NOTES
-- ============================================================
--
-- Bucket:
--   application-documents
--
-- Visibility:
--   PRIVATE
--
-- Students/learners:
--   No direct Storage access.
--
-- Staff:
--   Active authenticated staff may retrieve files.
--
-- Application uploads:
--   Controlled server-side operations.
--
-- ============================================================
