import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
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
    } = body;

    if (!first_name || !last_name || !email || !phone) {
      return NextResponse.json(
        {
          error:
            "First name, last name, email and phone number are required.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "submit_public_application",
      {
        p_first_name: first_name,
        p_last_name: last_name,
        p_email: email,
        p_phone: phone,
        p_id_number: id_number || null,
        p_date_of_birth: date_of_birth || null,
        p_address: address || null,
        p_city: city || null,
        p_province: province || null,
        p_highest_qualification: highest_qualification || null,
        p_field_of_study: field_of_study || null,
        p_institution: institution || null,
        p_programme_applied_for: programme_applied_for || null,
        p_skills_computer_literacy:
          skills_computer_literacy || null,
      },
    );

    if (error) {
      console.error("Application submission error:", error);

      return NextResponse.json(
        { error: "Unable to submit application." },
        { status: 500 },
      );
    }

    const application = data?.[0];

    if (!application) {
      console.error(
        "Application submission returned no application.",
      );

      return NextResponse.json(
        { error: "Unable to submit application." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        application_id: application.application_id,
        reference_number: application.reference_number,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Unexpected application submission error:",
      error,
    );

    return NextResponse.json(
      { error: "Invalid application submission." },
      { status: 400 },
    );
  }
}