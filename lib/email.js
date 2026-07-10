import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's shared sandbox sender — fine until we verify our own domain,
// but it can only deliver to the email address the Resend account was
// created with. A verified domain removes that restriction.
const FROM_ADDRESS = "Belly Dance Academy <onboarding@resend.dev>";

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
