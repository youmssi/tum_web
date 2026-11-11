import { COMPANY, CONTACT } from "@/lib/constants";
import type { LegalDocument } from "./types";

export const termsEn: LegalDocument = {
  title: "Terms of Service",
  description:
    "The terms that govern use of the Tûm website and the Tûm Cloud service operated by MRVIN100 SARLU.",
  updatedLabel: "Last updated:",
  updated: "11 November 2026",
  intro: [
    `These Terms of Service (the "Terms") are a contract between you and ${COMPANY.NAME}, a company registered in the Republic of Guinea under number ${COMPANY.RCCM}, with its registered office at ${COMPANY.ADDRESS} ("MRVIN100", "we", "us").`,
    "Please read them carefully. By creating an account or using the service you accept these Terms. If you do not accept them, do not use the service.",
  ],
  sections: [
    {
      heading: "1. Scope",
      paragraphs: [
        'These Terms apply to the website at tum.mrvin100.de and to the hosted version of Tûm that we operate ("Tûm Cloud"). Together they are referred to as the "Service".',
        "The Tûm software itself is published under the GNU Affero General Public License version 3. If you download and run the software on your own infrastructure, that use is governed by that licence alone and not by these Terms.",
        'If you use the Service on behalf of a company or other organisation, you confirm that you are authorised to bind it, and the words "you" and "Customer" refer to that organisation.',
      ],
    },
    {
      heading: "2. Definitions",
      paragraphs: ["In these Terms:"],
      items: [
        '"Account" means the personal login you create to access the Service.',
        '"Workspace" means the organisation space in which projects, tasks and members are managed.',
        '"Customer Data" means all content that you or your members submit to a Workspace, including projects, tasks, comments and files.',
        '"Subscription" means a paid plan attached to a Workspace for a monthly or annual period.',
      ],
    },
    {
      heading: "3. Accounts and Workspaces",
      paragraphs: [
        "You must be at least 18 years old to create an Account. You agree to provide accurate information and to keep it up to date.",
        "You are responsible for keeping your credentials confidential and for all activity carried out under your Account. Tell us without delay if you suspect unauthorised use.",
        "The owner of a Workspace decides who may join it and what they may do. The owner is responsible for the members' use of the Service and for their compliance with these Terms.",
      ],
    },
    {
      heading: "4. Plans, trial and fees",
      paragraphs: [
        "The plans available and their prices are described on the pricing page. Prices are stated in United States dollars and are charged per Workspace.",
        "Paid plans may begin with a free trial of 14 days. If you do not subscribe before the trial ends, the paid features stop being available.",
        "Subscription fees are payable in advance for each monthly or annual period. Payments are processed by third-party payment providers, and their own terms apply to the payment itself. We do not store your card number or mobile money credentials.",
        "Prices do not include taxes, duties or bank and operator charges, which remain your responsibility unless we state otherwise.",
        "We may change our prices. We will give you at least 30 days' notice, and the new price will apply from the start of your next billing period.",
      ],
    },
    {
      heading: "5. Renewal, cancellation and refunds",
      paragraphs: [
        "A Subscription renews for successive periods of the same length until it is cancelled. Where your payment method allows automatic charging, the renewal fee is charged at the start of each period. Where your payment method requires your approval for each payment, as is the case for most mobile money services, we send you a payment request before the period ends. If the payment is not completed by the date stated in the request, we may limit the Workspace to the features of the free plan until payment is received.",
        "You may cancel a Subscription at any time from the billing page. The cancellation takes effect at the end of the period already paid, and you keep access to the paid features until then.",
        "Fees already paid are not refunded for a period that has started, except where the law requires it or where section 12 provides for a refund.",
      ],
    },
    {
      heading: "6. Acceptable use",
      paragraphs: ["You agree not to, and not to allow others to:"],
      items: [
        "use the Service in breach of any law or of the rights of another person;",
        "upload content that is unlawful, defamatory, or that infringes intellectual property or privacy rights;",
        "upload malicious code or attempt to gain unauthorised access to the Service, to other Workspaces or to our systems;",
        "disrupt the Service or place an unreasonable load on it, including through automated means that we have not authorised;",
        "circumvent the limits of your plan or any technical measure that protects the Service;",
        "resell or provide the hosted Service to third parties under your own name without our written agreement.",
      ],
      closing:
        "The last point concerns the hosted Service that we operate. It does not restrict the rights you hold over the software under the GNU Affero General Public License.",
    },
    {
      heading: "7. Customer Data",
      paragraphs: [
        "You keep all rights in your Customer Data. You grant us the right to host, copy, transmit and display it only as far as needed to provide and secure the Service and to give you support.",
        "You are responsible for the content of your Customer Data and for having the rights and permissions required to submit it.",
        "You can export your Customer Data at any time using the export tools provided in the Service.",
        "We do not access Customer Data except to provide the Service, to respond to a support request from you, to prevent or resolve a security or technical problem, or where the law requires it.",
      ],
    },
    {
      heading: "8. Personal data",
      paragraphs: [
        "Our Privacy Policy explains how we handle personal data relating to your Account and to your use of the Service.",
        "Where Customer Data contains personal data, you act as the controller of that data and we process it on your behalf and on your instructions, for the sole purpose of providing the Service. A data processing agreement is available on request.",
      ],
    },
    {
      heading: "9. Intellectual property",
      paragraphs: [
        "The Tûm software is licensed under the GNU Affero General Public License version 3. Nothing in these Terms limits the rights that licence gives you.",
        "The names Tûm and MRVIN100, our logos and the visual identity of the Service belong to us. These Terms do not give you any right to use them without our written consent.",
        "If you send us suggestions or feedback, we may use them freely and without obligation to you.",
      ],
    },
    {
      heading: "10. Availability and support",
      paragraphs: [
        "We make reasonable efforts to keep Tûm Cloud available and secure. The Service may be interrupted for maintenance, updates or reasons outside our control. Unless we have agreed a service level with you in writing, we do not guarantee a particular level of availability.",
        `Support is provided by email at ${CONTACT.SUPPORT_EMAIL}. Priority support is available on the plans that include it.`,
      ],
    },
    {
      heading: "11. Third-party services",
      paragraphs: [
        "The Service relies on third-party providers, for example for hosting, payment, email delivery and sign-in. Where you choose to connect a third-party service, your use of it is governed by the terms of that provider. We are not responsible for services that we do not operate.",
      ],
    },
    {
      heading: "12. Suspension and termination",
      paragraphs: [
        "You may stop using the Service and delete your Account or Workspace at any time.",
        "We may suspend or terminate your access if you seriously or repeatedly breach these Terms, if fees remain unpaid, or if continued access would expose us or other users to a legal or security risk. Where the circumstances allow, we will notify you beforehand and give you a reasonable opportunity to remedy the situation.",
        "We may also end the Service or a Subscription for convenience with at least 60 days' notice. In that case we refund the fees paid for the period remaining after the termination date.",
        "After termination you have 30 days to export your Customer Data, unless the law prevents us from giving access. After that period we delete it, subject to the retention periods set out in the Privacy Policy.",
      ],
    },
    {
      heading: "13. Warranties",
      paragraphs: [
        "We provide the Service with reasonable care and skill. Beyond that commitment, and to the fullest extent permitted by law, the Service is provided as it is and as available, without any warranty of fitness for a particular purpose, of uninterrupted operation or of freedom from errors.",
        "Tûm is a planning and coordination tool. You remain responsible for the decisions you take on the basis of the schedules, reports and other information it produces.",
      ],
    },
    {
      heading: "14. Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, neither party is liable to the other for loss of profit, loss of revenue, loss of business, loss of data that could have been avoided by a reasonable backup or export, or for any indirect or consequential loss.",
        "Our total liability arising out of or in connection with the Service, whatever the cause, is limited to the fees you paid us for the Service during the twelve months preceding the event giving rise to the claim, or to 100 United States dollars if you use a free plan.",
        "Nothing in these Terms excludes or limits liability for fraud, for wilful misconduct or gross negligence, for death or personal injury, or any other liability that cannot be excluded or limited by law.",
      ],
    },
    {
      heading: "15. Indemnity",
      paragraphs: [
        "You agree to compensate us for any claim, loss or cost, including reasonable legal fees, that results from your Customer Data or from your breach of section 6, provided that we inform you promptly of the claim and give you the opportunity to defend it.",
      ],
    },
    {
      heading: "16. Changes",
      paragraphs: [
        "We may develop the Service and change its features. We will not materially reduce the core functions of a paid plan during a period you have already paid for.",
        "We may amend these Terms. If a change is material, we will inform you by email or in the Service at least 30 days before it takes effect. If you do not agree, you may cancel your Subscription before that date. Continued use of the Service after that date means that you accept the amended Terms.",
      ],
    },
    {
      heading: "17. Governing law and disputes",
      paragraphs: [
        "These Terms are governed by the law of the Republic of Guinea, including the Uniform Acts of the Organisation for the Harmonisation of Business Law in Africa (OHADA) where they apply.",
        "The parties will first try to resolve any dispute amicably. If no solution is found within 30 days of written notice of the dispute, it will be submitted to the competent courts of Conakry.",
        "If you use the Service as a consumer, this section does not deprive you of the protection given by the mandatory rules of the law of the country where you live.",
      ],
    },
    {
      heading: "18. General provisions",
      paragraphs: [
        "These Terms, together with the Privacy Policy and any order or written agreement between us, are the whole agreement between you and us concerning the Service.",
        "If a provision is held to be invalid, the remaining provisions continue to apply. A failure to enforce a right is not a waiver of that right.",
        "You may not transfer your rights or obligations under these Terms without our consent. We may transfer ours to a company of our group or to a successor to our business, provided your rights are not reduced.",
        "Neither party is liable for a failure to perform caused by an event beyond its reasonable control, such as a failure of telecommunications or power networks, an act of public authority or a natural disaster.",
        "These Terms are published in English and in French. In the event of a discrepancy, the French version prevails.",
      ],
    },
    {
      heading: "19. Contact",
      paragraphs: [
        `Questions about these Terms can be sent to ${CONTACT.EMAIL}, with "Tûm" in the subject line, or by post to ${COMPANY.NAME}, ${COMPANY.ADDRESS}, Republic of Guinea.`,
      ],
    },
  ],
};
