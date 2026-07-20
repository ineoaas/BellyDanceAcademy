import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* Resend's shared sandbox sender — only delivers to the account owner's
   email until we verify our own domain. */
const FROM_ADDRESS = "Belly Dance Academy <onboarding@resend.dev>";

/* Instructor applications land here for manual review/activation. */
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

/* The Contact page's actual delivery mechanism — a working form, not a
   static "email us" dead end. */
export async function sendContactMessageEmail({ name, email, message }) {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `Contact form: ${name}`,
    html: `
      <p><strong>${name}</strong> (${email}) sent a message through the Contact page:</p>
      <p>${message}</p>
    `,
  });
}

/* Fired from the Stripe webhook right after a purchase is recorded (FR-6.4). */
export async function sendPurchaseConfirmationEmail(student, course, amountCents) {
  const amount = (amountCents / 100).toFixed(2);
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: student.email,
    subject: `Your receipt for ${course.title}`,
    html: `
      <p>Thanks for your purchase, ${student.name}!</p>
      <p><strong>${course.title}</strong> — $${amount}</p>
      <p>It's available in your dashboard now: <a href="${process.env.APP_URL ?? "http://localhost:3000"}/student">view your courses</a>.</p>
    `,
  });
}
