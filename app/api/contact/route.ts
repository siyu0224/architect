import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Contact form is not configured (missing Supabase env)" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("contact_submissions").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? String(subject).trim() : null,
      message: message.trim(),
    });

    if (error) {
      console.error("Supabase contact insert error:", error);
      return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }

    // Attempt to send an email via Resend, but don't fail the request if email sending fails.
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL ?? "liusiyu0224@gmail.com";

    if (apiKey) {
      try {
        const emailSubject =
          (subject && String(subject).trim()) || "New inquiry from Gao Architect website";
        const textBody = [
          `Name: ${name}`,
          `Email: ${email}`,
          subject ? `Subject: ${subject}` : null,
          "",
          "Message:",
          message,
        ]
          .filter(Boolean)
          .join("\n");

        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Using Resend's default domain so you don't need DNS setup.
            from: "Gao Architect <onboarding@resend.dev>",
            to: [toEmail],
            subject: emailSubject,
            text: textBody,
          }),
        });

        if (!resendRes.ok) {
          const text = await resendRes.text();
          console.error("Resend email failed:", resendRes.status, text);
        }
      } catch (emailError) {
        console.error("Resend email error:", emailError);
        // Do not surface to user; Supabase save already succeeded.
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact API error:", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
