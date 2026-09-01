-- ============================================================
-- Prospherum Learner Application Portal
-- Migration 004: Align application schema with requirements
-- ============================================================

-- ============================================================
-- APPLICATION SKILLS / COMPUTER LITERACY
-- ============================================================

alter table public.applications
  add column if not exists skills_computer_literacy text;

-- ============================================================
-- APPLICATION REFERENCE NUMBER
-- Format:
-- PRS-YYYY-NNNNNN
-- ============================================================

create or replace function public.generate_application_reference()
returns text
language plpgsql
as $$
declare
  generated_reference text;
begin
  generated_reference :=
    'PRS-' ||
    to_char(current_date, 'YYYY') ||
    '-' ||
    lpad(
      floor(random() * 1000000)::bigint::text,
      6,
      '0'
    );

  return generated_reference;
end;
$$;

-- ============================================================
-- NOTES
-- ============================================================
--
-- The application reference format now follows the functional
-- requirements:
--
--   PRS-YYYY-NNNNNN
--
-- Skills and computer literacy are stored as optional
-- application information.
--
-- Existing applications and existing migration history are
-- preserved.
--
-- ============================================================
