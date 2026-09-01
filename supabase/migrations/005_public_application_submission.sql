-- ============================================================
-- Prospherum Learner Application Portal
-- Migration 005: Controlled public application submission
-- ============================================================
--
-- Students do not have accounts.
--
-- Public applications are submitted through a controlled
-- database function rather than direct table INSERT access.
--
-- Staff authentication remains separate.
-- ============================================================


-- ============================================================
-- PUBLIC APPLICATION SUBMISSION FUNCTION
-- ============================================================

create or replace function public.submit_public_application(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_id_number text default null,
  p_date_of_birth date default null,
  p_address text default null,
  p_city text default null,
  p_province text default null,
  p_highest_qualification text default null,
  p_field_of_study text default null,
  p_institution text default null,
  p_programme_applied_for text default null,
  p_skills_computer_literacy text default null
)
returns table (
  application_id uuid,
  reference_number text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application_id uuid;
  v_reference_number text;
begin

  -- ----------------------------------------------------------
  -- Basic validation
  -- ----------------------------------------------------------

  if nullif(trim(p_first_name), '') is null then
    raise exception 'First name is required';
  end if;

  if nullif(trim(p_last_name), '') is null then
    raise exception 'Last name is required';
  end if;

  if nullif(trim(p_email), '') is null then
    raise exception 'Email address is required';
  end if;

  if nullif(trim(p_phone), '') is null then
    raise exception 'Phone number is required';
  end if;


  -- ----------------------------------------------------------
  -- Generate a unique application reference
  -- ----------------------------------------------------------

  loop

    v_reference_number :=
      public.generate_application_reference();

    begin

      insert into public.applications (
        reference_number,
        first_name,
        last_name,
        email,
        phone,
        id_number,
        date_of_birth,
        address,
        city,
        province,
        highest_qualification,
        field_of_study,
        institution,
        programme_applied_for,
        skills_computer_literacy,
        application_source
      )
      values (
        v_reference_number,
        trim(p_first_name),
        trim(p_last_name),
        lower(trim(p_email)),
        trim(p_phone),
        nullif(trim(p_id_number), ''),
        p_date_of_birth,
        nullif(trim(p_address), ''),
        nullif(trim(p_city), ''),
        nullif(trim(p_province), ''),
        nullif(trim(p_highest_qualification), ''),
        nullif(trim(p_field_of_study), ''),
        nullif(trim(p_institution), ''),
        nullif(trim(p_programme_applied_for), ''),
        nullif(trim(p_skills_computer_literacy), ''),
        'WEBSITE'
      )
      returning id
      into v_application_id;

      exit;

    exception
      when unique_violation then
        -- A reference collision occurred.
        -- Generate another reference and retry.
    end;

  end loop;


  -- ----------------------------------------------------------
  -- Return the newly created application
  -- ----------------------------------------------------------

  return query
  select
    v_application_id,
    v_reference_number;

end;
$$;


-- ============================================================
-- FUNCTION SECURITY
-- ============================================================

-- Remove default public execution privileges.

revoke all
on function public.submit_public_application(
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from public;


-- Allow unauthenticated applicants to submit applications
-- through this function only.

grant execute
on function public.submit_public_application(
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
to anon;


-- Authenticated users may also execute the function, although
-- normal applicants do not have accounts.

grant execute
on function public.submit_public_application(
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
to authenticated;


-- ============================================================
-- SECURITY NOTES
-- ============================================================
--
-- The anon role does NOT receive direct INSERT permission on
-- public.applications.
--
-- The anon role can only submit through the controlled function.
--
-- The function executes with security definer privileges and
-- therefore performs the database INSERT on behalf of the
-- applicant.
--
-- Students remain unauthenticated.
--
-- Staff continue to use Supabase Auth and staff_profiles.
--
-- ============================================================
