import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's shared sandbox sender — fine until we verify our own domain,
// but it can only deliver to the email address the Resend account was
// created with. A verified domain removes that restriction.
const FROM_ADDRESS = "Belly Dance Academy <onboarding@resend.dev>";

// Where instructor applications get flagged for review. There's no admin
// approval UI yet (that's FR-5.2), so for now this is just an FYI — the
// account gets activated by hand until that's built.
const ADMIN_EMAIL = "info@thebellydancecompany.ae";

export async function sendPasswordResetEmail(to, resetUrl) {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your Belly Dance Academy password",
    html: `
      <p>Someone requested a password reset for this account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

export async function sendInstructorApplicationEmail(applicant) {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: ADMIN_EMAIL,
    subject: "New instructor application",
    html: `
      <p><strong>${applicant.name}</strong> (${applicant.email}) applied to teach on Belly Dance Academy.</p>
      <p>Their account is pending until it's activated.</p>
    `,
  });
}
