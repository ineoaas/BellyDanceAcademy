import { LegalDocument } from "../LegalDocument";

const SECTIONS = [
  {
    heading: "What we collect",
    body: [
      [
        "Account details: your name, email address and a securely hashed password.",
        "Purchases: which courses you bought, what you paid and when. Card details go straight to Stripe; we never see or store them.",
        "Learning activity: lessons watched and progress, so you can resume where you left off.",
        "Instructor details: the profile you publish and your Stripe Connect account reference for payouts.",
        "Messages you send us through the contact form.",
      ],
    ],
  },
  {
    heading: "How we use it",
    body: [
      "We use this information to run your account, process purchases and instructor payouts, stream course videos, send account emails (such as password resets and application updates), and answer your messages. We don't sell your personal data.",
    ],
  },
  {
    heading: "Services we rely on",
    body: [
      "We share only what each service needs to do its job:",
      [
        "Stripe: payments and instructor payouts.",
        "Mux: video hosting and streaming.",
        "Resend: sending account emails.",
      ],
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use two essential cookies: one keeps you signed in and one protects forms against cross-site request forgery. We don't use advertising or tracking cookies.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep account data while your account is open. Purchase records are kept as long as accounting and tax rules require.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can update your name, email and password from your account settings. To get a copy of your data or have your account deleted, email us and we'll handle it.",
    ],
  },
];

export default function PrivacyPage() {
  return <LegalDocument title="Privacy Policy" lastUpdated="30 September 2026" sections={SECTIONS} />;
}
