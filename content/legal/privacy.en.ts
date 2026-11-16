import { COMPANY, CONTACT } from "@/lib/constants";
import type { LegalDocument } from "./types";

export const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  description:
    "How MRVIN100 SARLU collects, uses and protects personal data in connection with the Tûm website and the Tûm Cloud service.",
  updatedLabel: "Last updated:",
  updated: "11 November 2026",
  intro: [
    "This policy explains what personal data we collect when you visit the Tûm website or use Tûm Cloud, why we collect it, who receives it and what rights you have.",
  ],
  sections: [
    {
      heading: "1. Who is responsible for your data",
      paragraphs: [
        `The controller of the personal data described in this policy is ${COMPANY.NAME}, registered in the Republic of Guinea under number ${COMPANY.RCCM}, with its registered office at ${COMPANY.ADDRESS}.`,
        `You can reach us about any privacy matter at ${CONTACT.EMAIL}. Please mention "Tûm" in the subject line.`,
      ],
    },
    {
      heading: "2. Our role in relation to workspace content",
      paragraphs: [
        "When an organisation uses Tûm Cloud, the projects, tasks, comments and files placed in its workspace belong to that organisation. The organisation decides what is stored there and is the controller of any personal data it contains. We process that content on its behalf, as a processor, only to provide the service.",
        "If you are a member of a workspace and have a question about the content held in it, please contact the owner or an administrator of that workspace first.",
        "If you run the Tûm software on your own servers, we receive no data from your installation.",
      ],
    },
    {
      heading: "3. Data we collect",
      paragraphs: ["We collect the following categories of data:"],
      items: [
        "Account data: your name, email address, profile picture if you add one, and a protected (hashed) version of your password. If you sign in with Google or GitHub, we receive your name, email address and profile picture from that provider.",
        "Workspace data: the organisations you belong to, your role in them, invitations, and the content you create, such as projects, tasks, comments, attachments and activity history.",
        "Billing data: the plan chosen, the status and dates of the subscription, the billing contact and the references of payments. Card numbers and mobile money credentials are collected by the payment provider and are never stored on our systems.",
        "Technical data: IP address, browser and device type, dates and times of access, and security logs.",
        "Communications: the messages you send to our contact and support addresses.",
        "Audience statistics: aggregated figures on page visits, collected without cookies and without identifying you.",
      ],
    },
    {
      heading: "4. Why we use your data",
      paragraphs: ["We use personal data for the following purposes and on the following grounds:"],
      items: [
        "to create your account and provide the service, on the basis of the contract between us;",
        "to manage subscriptions, payments and invoices, on the basis of the contract and of our legal accounting obligations;",
        "to send service messages, such as email verification, invitations and the notifications you have enabled, on the basis of the contract. You can adjust notifications in your preferences;",
        "to keep the service secure, to prevent abuse and to resolve incidents, on the basis of our legitimate interest in protecting the service and its users;",
        "to understand how the website is used and to improve the product, using aggregated statistics, on the basis of our legitimate interest;",
        "to comply with the law and respond to lawful requests from authorities.",
      ],
      closing:
        "We do not sell personal data. We do not use it for advertising, and we do not use your workspace content to build profiles.",
    },
    {
      heading: "5. Cookies",
      paragraphs: [
        "We use only the cookies that are strictly necessary for the service to work: a session cookie that keeps you signed in and a cookie that remembers your language. Because these cookies are essential, they do not require your consent.",
        "Our audience statistics do not rely on cookies. We do not use advertising or cross-site tracking cookies.",
      ],
    },
    {
      heading: "6. Who receives your data",
      paragraphs: [
        "Within MRVIN100, access is limited to the staff who need it to operate the service and assist you.",
        "We use service providers that process data on our behalf and under contract, in the following categories:",
      ],
      items: [
        "hosting, content delivery and network security;",
        "database and file storage;",
        "transactional email delivery;",
        "payment processing, which receives the data needed to carry out and secure the payment;",
        "sign-in providers (Google or GitHub), only if you choose to use them.",
      ],
      closing:
        "The current list of these providers is available on request. We may also disclose data where the law requires it, to establish or defend our legal rights, or to a successor in the event of a merger or transfer of our business, subject to the same protections.",
    },
    {
      heading: "7. Transfers outside your country",
      paragraphs: [
        "Some of our providers are located outside the Republic of Guinea and outside the country where you live, including in the European Union and the United States. Where the law requires it, we put in place appropriate safeguards for these transfers, such as contractual commitments from the recipient.",
      ],
    },
    {
      heading: "8. How long we keep your data",
      paragraphs: ["We keep personal data only for as long as the purpose requires:"],
      items: [
        "account and workspace data: for as long as the account or workspace exists. After deletion, the data is removed from our active systems within 30 days and from backups within 90 days;",
        "workspace audit logs: up to two years, unless the workspace is deleted earlier;",
        "billing and accounting records: ten years, as required by accounting rules;",
        "security logs: up to twelve months;",
        "messages sent to contact and support: up to three years after the last exchange.",
      ],
    },
    {
      heading: "9. Security",
      paragraphs: [
        "We apply technical and organisational measures suited to the risks, including encrypted connections, protected storage of passwords, separation of each organisation's data, access controls and audit logging.",
        "No system can be guaranteed to be fully secure. If a breach affects your personal data, we will inform you and the competent authority as the law requires.",
      ],
    },
    {
      heading: "10. Your rights",
      paragraphs: [
        "Subject to the conditions set by the law that applies to you, you have the right to access your data, to have it corrected or deleted, to object to or restrict certain processing, to receive your data in a reusable format and to withdraw a consent you have given.",
        `You can update most of your data and delete your account from your profile. For any other request, write to ${CONTACT.EMAIL}. We may ask you to confirm your identity and we reply within 30 days.`,
        "You also have the right to lodge a complaint with the personal data protection authority of your country.",
      ],
    },
    {
      heading: "11. Children",
      paragraphs: [
        "The service is intended for professional use by adults. We do not knowingly collect data from persons under 18. If you believe a minor has given us personal data, contact us and we will delete it.",
      ],
    },
    {
      heading: "12. Changes to this policy",
      paragraphs: [
        "We may update this policy to reflect changes in the service or in the law. The date at the top shows the latest version. If a change is significant, we will inform you by email or in the service before it applies.",
      ],
    },
    {
      heading: "13. Contact",
      paragraphs: [
        `${COMPANY.NAME}, ${COMPANY.ADDRESS}, Republic of Guinea. Email: ${CONTACT.EMAIL}.`,
      ],
    },
  ],
};
