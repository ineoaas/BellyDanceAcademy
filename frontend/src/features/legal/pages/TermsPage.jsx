import { LegalDocument } from "../LegalDocument";

const SECTIONS = [
  {
    heading: "Who we are",
    body: [
      "Belly Dance Academy is an online course marketplace operated by The Bellydance Company. Independent instructors publish video courses here, and students buy and watch them. By creating an account or buying a course, you agree to these terms.",
    ],
  },
  {
    heading: "Your account",
    body: [
      "You must give accurate information when you sign up and keep your password private. You're responsible for activity on your account. We may suspend accounts that break these terms or put other users at risk.",
    ],
  },
  {
    heading: "Buying courses",
    body: [
      "Courses are a one-time purchase. Prices are shown before checkout and payment is processed by Stripe. Once your payment is confirmed, you get ongoing personal access to the course for as long as it remains available on the platform.",
      "Refunds are covered by our Refund Policy.",
    ],
  },
  {
    heading: "Using course content",
    body: [
      "Courses are licensed to you for personal, non-commercial viewing. You may not:",
      [
        "download, record, copy or redistribute course videos;",
        "share your account or course access with others;",
        "use course material to teach or sell your own classes without the instructor's permission.",
      ],
    ],
  },
  {
    heading: "Instructors",
    body: [
      "Instructor accounts are reviewed and approved before they can publish. Instructors keep ownership of their courses and grant us a licence to host, stream and sell them on the platform. Every course is reviewed before it goes live.",
      "Instructors are paid their share of each sale through Stripe Connect, after the platform commission shown in their dashboard. Instructors are responsible for their own taxes.",
    ],
  },
  {
    heading: "Reviews and conduct",
    body: [
      "Reviews must be honest and respectful. We may remove content that is abusive, misleading or unlawful.",
    ],
  },
  {
    heading: "Dance safety",
    body: [
      "Dance is physical activity. Warm up, work within your own limits, and check with a medical professional if you have health concerns. Instructors and the platform are not liable for injuries that result from practising course material.",
    ],
  },
  {
    heading: "Changes and availability",
    body: [
      "We may update these terms. When we make significant changes, we'll post the new version here with a new date. We aim to keep the service available but can't guarantee it will be uninterrupted.",
    ],
  },
  {
    heading: "Governing law",
    body: ["These terms are governed by the laws of the United Arab Emirates."],
  },
];

export default function TermsPage() {
  return <LegalDocument title="Terms of Service" lastUpdated="30 September 2026" sections={SECTIONS} />;
}
