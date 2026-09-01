-- ============================================================
-- Prospherum Student Portal
-- Migration 001: Initial production schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- APPLICATIONS
-- ============================================================

create table public.applications (
  id uuid primary key default gen_random_uuid(),

  reference_number text not null unique,

  -- Applicant identity
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,

  id_number text,
  date_of_birth date,

  -- Address
  address text,
  city text,
  province text,

  -- Education
  highest_qualification text,
  field_of_study text,
  institution text,

  -- Programme
  programme_applied_for text,

  -- Application source
  application_source text not null default 'WEBSITE'
    check (
      application_source in (
        'WEBSITE',
        'REFERRAL',
        'PARTNER',
        'OTHER'
      )
    ),

  -- Application workflow
  status text not null default 'NEW'
    check (
      status in (
        'NEW',
        'UNDER_REVIEW',
        'REQUIRES_INFORMATION',
        'SHORTLISTED',
        'SELECTED',
        'NOT_SELECTED',
        'ARCHIVED'
      )
    ),

  -- Screening
  screening_notes text,
  rejection_reason text,

  -- Staff assignment
  assigned_staff_id uuid,

  -- POPIA / application consent
  consent_given boolean not null default false,
  consent_at timestamptz,

  -- Notification tracking
  confirmation_email_sent boolean not null default false,
  confirmation_email_sent_at timestamptz,

  selection_notification_sent boolean not null default false,
  selection_notification_sent_at timestamptz,

  whatsapp_notification_sent boolean not null default false,
  whatsapp_notification_sent_at timestamptz,

  -- Archive information
  archived_at timestamptz,
  archive_period text
    check (
      archive_period is null
      or archive_period in (
        'WEEK',
        'MONTH',
        'YEAR'
      )
    ),

  -- Timestamps
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- APPLICATION DOCUMENTS
-- ============================================================

create table public.application_documents (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id)
    on delete cascade,

  document_type text not null
    check (
      document_type in (
        'CV',
        'ID',
        'QUALIFICATION',
        'PROOF_OF_ADDRESS',
        'OTHER'
      )
    ),

  original_filename text not null,
  storage_path text not null,

  mime_type text,
  file_size bigint,

  verification_status text not null default 'PENDING'
    check (
      verification_status in (
        'PENDING',
        'VERIFIED',
        'REJECTED'
      )
    ),

  uploaded_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid
);

-- ============================================================
-- STAFF PROFILES
-- ============================================================

create table public.staff_profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  first_name text not null,
  last_name text not null,

  role text not null default 'REVIEWER'
    check (
      role in (
        'ADMIN',
        'MANAGER',
        'REVIEWER'
      )
    ),

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- STAFF ASSIGNMENT FOREIGN KEY
-- ============================================================

alter table public.applications
  add constraint applications_assigned_staff_fk
  foreign key (assigned_staff_id)
  references public.staff_profiles(id)
  on delete set null;

alter table public.application_documents
  add constraint application_documents_verified_by_fk
  foreign key (verified_by)
  references public.staff_profiles(id)
  on delete set null;

-- ============================================================
-- APPLICATION NOTES
-- ============================================================

create table public.application_notes (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id)
    on delete cascade,

  staff_id uuid
    references public.staff_profiles(id)
    on delete set null,

  note text not null,

  created_at timestamptz not null default now()
);

-- ============================================================
-- APPLICATION AUDIT LOG
-- ============================================================

create table public.application_audit_log (
  id uuid primary key default gen_random_uuid(),

  application_id uuid
    references public.applications(id)
    on delete set null,

  staff_id uuid
    references public.staff_profiles(id)
    on delete set null,

  action text not null,

  previous_status text,
  new_status text,

  details jsonb,

  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index applications_status_idx
  on public.applications(status);

create index applications_submitted_at_idx
  on public.applications(submitted_at desc);

create index applications_email_idx
  on public.applications(email);

create index applications_reference_number_idx
  on public.applications(reference_number);

create index applications_assigned_staff_idx
  on public.applications(assigned_staff_id);

create index application_documents_application_id_idx
  on public.application_documents(application_id);

create index application_documents_type_idx
  on public.application_documents(document_type);

create index application_notes_application_id_idx
  on public.application_notes(application_id);

create index audit_log_application_id_idx
  on public.application_audit_log(application_id);

create index audit_log_created_at_idx
  on public.application_audit_log(created_at desc);

-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create trigger applications_set_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

create trigger staff_profiles_set_updated_at
before update on public.staff_profiles
for each row
execute function public.set_updated_at();

-- ============================================================
-- REFERENCE NUMBER GENERATOR
-- Format:
-- PSA-YYYYMMDD-XXXXXXXX
-- ============================================================

create or replace function public.generate_application_reference()
returns text
language plpgsql
as $$
declare
  generated_reference text;
begin
  generated_reference :=
    'PSA-' ||
    to_char(current_date, 'YYYYMMDD') ||
    '-' ||
    upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));

  return generated_reference;
end;
$$;

-- ============================================================
-- AUTOMATIC REFERENCE NUMBER
-- ============================================================

create or replace function public.set_application_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference_number is null
     or trim(new.reference_number) = '' then
    new.reference_number :=
      public.generate_application_reference();
  end if;

  return new;
end;
$$;

create trigger applications_set_reference
before insert on public.applications
for each row
execute function public.set_application_reference();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.application_notes enable row level security;
alter table public.application_audit_log enable row level security;

-- ============================================================
-- SECURITY NOTE
-- ============================================================
--
-- No public policies are created in Migration 001.
--
-- Students will submit applications through controlled server-side
-- application endpoints. Students will NOT receive Supabase accounts.
--
-- Staff access will be implemented through Supabase Auth and
-- explicit RLS policies in later migrations.
--
-- This prevents accidentally exposing applicant information while
-- the authentication and authorization model is being built.
--
-- ============================================================
