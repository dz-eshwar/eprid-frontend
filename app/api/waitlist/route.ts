import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "E-PRid Waitlist <onboarding@resend.dev>",
    to: ["eshwarchaga@gmail.com"],
    subject: `New waitlist signup: ${email}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #0F6E56; margin: 0 0 16px;">New E-PRid waitlist signup</h2>
        <p style="color: #374151; margin: 0 0 8px;">
          <strong>Email:</strong> ${email}
        </p>
        <p style="color: #374151; margin: 0 0 24px;">
          <strong>Time:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px;" />
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          Sent from E-PRid early access form — eprid-frontend.vercel.app
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
