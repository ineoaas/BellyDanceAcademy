import { LegalDocument } from "../LegalDocument";

const SECTIONS = [
  {
    heading: "Try before you buy",
    body: [
      "Most courses include a free preview lesson you can watch without an account, so you can check the teaching style and level before you buy.",
    ],
  },
  {
    heading: "Requesting a refund",
    body: [
      "If a course isn't right for you, contact us within 14 days of purchase with your account email and the course name. We review every request individually and will usually approve a refund when you've watched only a small part of the course.",
      "We'll always refund you if:",
      [
        "you were charged more than once for the same course;",
        "the course content is substantially different from its description;",
        "a technical problem on our side stops you from watching and we can't fix it.",
      ],
    ],
  },
  {
    heading: "How refunds are paid",
    body: [
      "Approved refunds go back to your original payment method through Stripe. They usually show up within 5–10 business days, depending on your bank.",
    ],
  },
];

export default function RefundPolicyPage() {
  return <LegalDocument title="Refund Policy" lastUpdated="30 September 2026" sections={SECTIONS} />;
}
