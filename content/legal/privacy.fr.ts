import { COMPANY, CONTACT } from "@/lib/constants";
import type { LegalDocument } from "./types";

export const privacyFr: LegalDocument = {
  title: "Politique de confidentialité",
  description:
    "Comment MRVIN100 SARLU collecte, utilise et protège les données personnelles dans le cadre du site Tûm et du service Tûm Cloud.",
  updatedLabel: "Dernière mise à jour :",
  updated: "11 novembre 2026",
  intro: [
    "La présente politique explique quelles données personnelles nous collectons lorsque vous consultez le site Tûm ou utilisez Tûm Cloud, pour quelles raisons, à qui elles sont communiquées et quels sont vos droits.",
  ],
  sections: [
    {
      heading: "1. Responsable de vos données",
      paragraphs: [
        `Le responsable du traitement des données personnelles décrites dans la présente politique est ${COMPANY.NAME}, immatriculée en République de Guinée sous le numéro ${COMPANY.RCCM}, dont le siège social est situé à ${COMPANY.ADDRESS}.`,
        `Pour toute question relative à vos données, vous pouvez nous écrire à ${CONTACT.EMAIL} en mentionnant « Tûm » dans l’objet.`,
      ],
    },
    {
      heading: "2. Notre rôle à l’égard du contenu des espaces de travail",
      paragraphs: [
        "Lorsqu’une organisation utilise Tûm Cloud, les projets, tâches, commentaires et fichiers déposés dans son espace de travail lui appartiennent. Elle décide de ce qui y est conservé et elle est responsable du traitement des données personnelles qui s’y trouvent. Nous traitons ce contenu pour son compte, en qualité de sous-traitant, dans le seul but de fournir le service.",
        "Si vous êtes membre d’un espace de travail et avez une question sur le contenu qui y est conservé, adressez-vous d’abord au propriétaire ou à un administrateur de cet espace.",
        "Si vous exécutez le logiciel Tûm sur vos propres serveurs, nous ne recevons aucune donnée de votre installation.",
      ],
    },
    {
      heading: "3. Données que nous collectons",
      paragraphs: ["Nous collectons les catégories de données suivantes :"],
      items: [
        "Données de compte : votre nom, votre adresse électronique, votre photo de profil si vous en ajoutez une, et une version protégée (hachée) de votre mot de passe. Si vous vous connectez avec Google ou GitHub, nous recevons de ce fournisseur votre nom, votre adresse électronique et votre photo de profil.",
        "Données d’espace de travail : les organisations auxquelles vous appartenez, votre rôle, les invitations, ainsi que les contenus que vous créez, tels que les projets, tâches, commentaires, pièces jointes et l’historique d’activité.",
        "Données de facturation : l’offre choisie, l’état et les dates de l’abonnement, le contact de facturation et les références des paiements. Les numéros de carte et les identifiants de mobile money sont collectés par le prestataire de paiement et ne sont jamais conservés sur nos systèmes.",
        "Données techniques : adresse IP, type de navigateur et d’appareil, dates et heures d’accès, journaux de sécurité.",
        "Correspondance : les messages que vous adressez à nos adresses de contact et d’assistance.",
        "Statistiques d’audience : des chiffres agrégés sur la fréquentation des pages, recueillis sans cookie et sans vous identifier.",
      ],
    },
    {
      heading: "4. Finalités de l’utilisation de vos données",
      paragraphs: [
        "Nous utilisons les données personnelles pour les finalités et sur les fondements suivants :",
      ],
      items: [
        "créer votre compte et fournir le service, sur le fondement du contrat qui nous lie ;",
        "gérer les abonnements, les paiements et les factures, sur le fondement du contrat et de nos obligations comptables légales ;",
        "envoyer les messages de service, tels que la vérification de l’adresse électronique, les invitations et les notifications que vous avez activées, sur le fondement du contrat. Vous pouvez régler les notifications dans vos préférences ;",
        "assurer la sécurité du service, prévenir les abus et résoudre les incidents, sur le fondement de notre intérêt légitime à protéger le service et ses utilisateurs ;",
        "comprendre l’utilisation du site et améliorer le produit au moyen de statistiques agrégées, sur le fondement de notre intérêt légitime ;",
        "respecter la loi et répondre aux demandes régulières des autorités.",
      ],
      closing:
        "Nous ne vendons pas de données personnelles. Nous ne les utilisons pas à des fins publicitaires et nous n’utilisons pas le contenu de votre espace de travail pour établir des profils.",
    },
    {
      heading: "5. Cookies",
      paragraphs: [
        "Nous n’utilisons que les cookies strictement nécessaires au fonctionnement du service : un cookie de session qui maintient votre connexion et un cookie qui mémorise votre langue. Ces cookies étant indispensables, ils ne nécessitent pas votre consentement.",
        "Nos statistiques d’audience ne reposent pas sur des cookies. Nous n’utilisons aucun cookie publicitaire ni de suivi entre sites.",
      ],
    },
    {
      heading: "6. Destinataires de vos données",
      paragraphs: [
        "Au sein de MRVIN100, l’accès est limité aux personnes qui en ont besoin pour exploiter le service et vous assister.",
        "Nous faisons appel à des prestataires qui traitent des données pour notre compte et dans un cadre contractuel, dans les catégories suivantes :",
      ],
      items: [
        "hébergement, diffusion de contenu et sécurité du réseau ;",
        "base de données et stockage de fichiers ;",
        "envoi de courriers électroniques transactionnels ;",
        "traitement des paiements, qui reçoit les données nécessaires à l’exécution et à la sécurisation du paiement ;",
        "fournisseurs de connexion (Google ou GitHub), uniquement si vous choisissez de les utiliser.",
      ],
      closing:
        "La liste à jour de ces prestataires est disponible sur demande. Nous pouvons également communiquer des données lorsque la loi l’exige, pour établir ou défendre nos droits en justice, ou à un successeur en cas de fusion ou de cession de notre activité, avec les mêmes protections.",
    },
    {
      heading: "7. Transferts hors de votre pays",
      paragraphs: [
        "Certains de nos prestataires sont établis hors de la République de Guinée et hors de votre pays de résidence, notamment dans l’Union européenne et aux États-Unis. Lorsque la loi l’exige, nous encadrons ces transferts par des garanties appropriées, telles que des engagements contractuels du destinataire.",
      ],
    },
    {
      heading: "8. Durées de conservation",
      paragraphs: [
        "Nous ne conservons les données personnelles que pendant la durée nécessaire à la finalité poursuivie :",
      ],
      items: [
        "données de compte et d’espace de travail : tant que le compte ou l’espace de travail existe. Après suppression, les données sont effacées de nos systèmes actifs dans un délai de 30 jours et des sauvegardes dans un délai de 90 jours ;",
        "journaux d’audit de l’espace de travail : jusqu’à deux ans, sauf suppression antérieure de l’espace de travail ;",
        "pièces de facturation et de comptabilité : dix ans, conformément aux règles comptables ;",
        "journaux de sécurité : jusqu’à douze mois ;",
        "messages adressés au contact et à l’assistance : jusqu’à trois ans après le dernier échange.",
      ],
    },
    {
      heading: "9. Sécurité",
      paragraphs: [
        "Nous appliquons des mesures techniques et organisationnelles adaptées aux risques, notamment le chiffrement des connexions, la conservation protégée des mots de passe, la séparation des données de chaque organisation, le contrôle des accès et la journalisation.",
        "Aucun système ne peut être garanti comme totalement sûr. Si une violation concerne vos données personnelles, nous vous en informons, ainsi que l’autorité compétente, dans les conditions prévues par la loi.",
      ],
    },
    {
      heading: "10. Vos droits",
      paragraphs: [
        "Dans les conditions prévues par la loi qui vous est applicable, vous disposez du droit d’accéder à vos données, de les faire rectifier ou supprimer, de vous opposer à certains traitements ou d’en demander la limitation, de recevoir vos données dans un format réutilisable et de retirer un consentement que vous avez donné.",
        `Vous pouvez mettre à jour la plupart de vos données et supprimer votre compte depuis votre profil. Pour toute autre demande, écrivez à ${CONTACT.EMAIL}. Nous pouvons vous demander de justifier de votre identité et nous répondons dans un délai de 30 jours.`,
        "Vous avez également le droit d’introduire une réclamation auprès de l’autorité de protection des données personnelles de votre pays.",
      ],
    },
    {
      heading: "11. Mineurs",
      paragraphs: [
        "Le service est destiné à un usage professionnel par des personnes majeures. Nous ne collectons pas sciemment de données concernant des personnes de moins de 18 ans. Si vous pensez qu’un mineur nous a communiqué des données personnelles, contactez-nous et nous les supprimerons.",
      ],
    },
    {
      heading: "12. Modifications de la présente politique",
      paragraphs: [
        "Nous pouvons mettre à jour la présente politique pour tenir compte de l’évolution du service ou de la loi. La date indiquée en tête correspond à la dernière version. En cas de modification importante, nous vous en informons par courrier électronique ou dans le service avant son application.",
      ],
    },
    {
      heading: "13. Contact",
      paragraphs: [
        `${COMPANY.NAME}, ${COMPANY.ADDRESS}, République de Guinée. Courriel : ${CONTACT.EMAIL}.`,
      ],
    },
  ],
};
