import { COMPANY, CONTACT } from "@/lib/constants";
import type { LegalDocument } from "./types";

export const termsFr: LegalDocument = {
  title: "Conditions générales d’utilisation",
  description:
    "Les conditions qui régissent l’utilisation du site Tûm et du service Tûm Cloud exploité par MRVIN100 SARLU.",
  updatedLabel: "Dernière mise à jour :",
  updated: "11 novembre 2026",
  intro: [
    `Les présentes conditions générales d’utilisation (les « Conditions ») forment un contrat entre vous et ${COMPANY.NAME}, société immatriculée en République de Guinée sous le numéro ${COMPANY.RCCM}, dont le siège social est situé à ${COMPANY.ADDRESS} (« MRVIN100 », « nous »).`,
    "Nous vous invitons à les lire attentivement. En créant un compte ou en utilisant le service, vous acceptez les Conditions. Si vous ne les acceptez pas, n’utilisez pas le service.",
  ],
  sections: [
    {
      heading: "1. Champ d’application",
      paragraphs: [
        "Les Conditions s’appliquent au site accessible à l’adresse tum.mrvin100.de et à la version hébergée de Tûm que nous exploitons (« Tûm Cloud »). L’ensemble est désigné par le terme « Service ».",
        "Le logiciel Tûm est publié sous la licence publique générale GNU Affero, version 3. Si vous téléchargez le logiciel et l’exécutez sur votre propre infrastructure, cette utilisation est régie par cette seule licence et non par les Conditions.",
        "Si vous utilisez le Service pour le compte d’une société ou d’une autre organisation, vous déclarez être habilité à l’engager. Les termes « vous » et « Client » désignent alors cette organisation.",
      ],
    },
    {
      heading: "2. Définitions",
      paragraphs: ["Dans les Conditions :"],
      items: [
        "« Compte » désigne l’identifiant personnel que vous créez pour accéder au Service.",
        "« Espace de travail » désigne l’espace de l’organisation dans lequel sont gérés les projets, les tâches et les membres.",
        "« Données du Client » désigne l’ensemble des contenus que vous ou vos membres déposez dans un Espace de travail, notamment les projets, tâches, commentaires et fichiers.",
        "« Abonnement » désigne une offre payante rattachée à un Espace de travail pour une période mensuelle ou annuelle.",
      ],
    },
    {
      heading: "3. Comptes et Espaces de travail",
      paragraphs: [
        "Vous devez avoir au moins 18 ans pour créer un Compte. Vous vous engagez à fournir des informations exactes et à les tenir à jour.",
        "Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée depuis votre Compte. Informez-nous sans délai si vous soupçonnez une utilisation non autorisée.",
        "Le propriétaire d’un Espace de travail décide qui peut le rejoindre et avec quels droits. Il répond de l’utilisation du Service par les membres et du respect des Conditions par ceux-ci.",
      ],
    },
    {
      heading: "4. Offres, essai et prix",
      paragraphs: [
        "Les offres disponibles et leurs prix sont décrits sur la page des tarifs. Les prix sont exprimés en dollars des États-Unis et s’entendent par Espace de travail.",
        "Les offres payantes peuvent débuter par un essai gratuit de 14 jours. Si vous ne souscrivez pas avant la fin de l’essai, les fonctionnalités payantes cessent d’être disponibles.",
        "Le prix de l’Abonnement est payable d’avance pour chaque période mensuelle ou annuelle. Les paiements sont traités par des prestataires de paiement tiers, dont les conditions s’appliquent à l’opération de paiement. Nous ne conservons ni votre numéro de carte ni vos identifiants de mobile money.",
        "Les prix s’entendent hors taxes, droits et frais bancaires ou d’opérateur, qui restent à votre charge sauf indication contraire de notre part.",
        "Nous pouvons modifier nos prix. Nous vous en informons au moins 30 jours à l’avance et le nouveau prix s’applique à compter de votre période de facturation suivante.",
      ],
    },
    {
      heading: "5. Renouvellement, résiliation et remboursement",
      paragraphs: [
        "L’Abonnement se renouvelle par périodes successives de même durée jusqu’à sa résiliation. Lorsque votre moyen de paiement permet le prélèvement automatique, le prix du renouvellement est prélevé au début de chaque période. Lorsque votre moyen de paiement exige votre validation pour chaque paiement, ce qui est le cas de la plupart des services de mobile money, nous vous adressons une demande de paiement avant la fin de la période. Si le paiement n’est pas effectué à la date indiquée dans la demande, nous pouvons limiter l’Espace de travail aux fonctionnalités de l’offre gratuite jusqu’à réception du paiement.",
        "Vous pouvez résilier un Abonnement à tout moment depuis la page de facturation. La résiliation prend effet à la fin de la période déjà payée et vous conservez l’accès aux fonctionnalités payantes jusqu’à cette date.",
        "Les sommes versées ne sont pas remboursées pour une période entamée, sauf lorsque la loi l’impose ou lorsque l’article 12 prévoit un remboursement.",
      ],
    },
    {
      heading: "6. Utilisation autorisée",
      paragraphs: ["Vous vous engagez à ne pas, et à ne pas permettre à des tiers de :"],
      items: [
        "utiliser le Service en violation de la loi ou des droits d’autrui ;",
        "déposer des contenus illicites, diffamatoires ou portant atteinte à des droits de propriété intellectuelle ou à la vie privée ;",
        "introduire un code malveillant ou tenter d’accéder sans autorisation au Service, à d’autres Espaces de travail ou à nos systèmes ;",
        "perturber le Service ou lui imposer une charge déraisonnable, notamment par des moyens automatisés que nous n’avons pas autorisés ;",
        "contourner les limites de votre offre ou toute mesure technique de protection du Service ;",
        "revendre ou fournir le Service hébergé à des tiers sous votre propre nom sans notre accord écrit.",
      ],
      closing:
        "Ce dernier point concerne le Service hébergé que nous exploitons. Il ne restreint pas les droits que vous tenez de la licence publique générale GNU Affero sur le logiciel.",
    },
    {
      heading: "7. Données du Client",
      paragraphs: [
        "Vous conservez l’ensemble de vos droits sur les Données du Client. Vous nous autorisez à les héberger, les reproduire, les transmettre et les afficher dans la seule mesure nécessaire pour fournir et sécuriser le Service et pour vous assister.",
        "Vous êtes responsable du contenu des Données du Client et vous garantissez disposer des droits et autorisations nécessaires pour les déposer.",
        "Vous pouvez exporter les Données du Client à tout moment au moyen des outils d’export du Service.",
        "Nous n’accédons aux Données du Client que pour fournir le Service, répondre à une demande d’assistance de votre part, prévenir ou résoudre un incident technique ou de sécurité, ou lorsque la loi l’exige.",
      ],
    },
    {
      heading: "8. Données personnelles",
      paragraphs: [
        "Notre Politique de confidentialité décrit la manière dont nous traitons les données personnelles relatives à votre Compte et à votre utilisation du Service.",
        "Lorsque les Données du Client contiennent des données personnelles, vous en êtes le responsable de traitement et nous les traitons pour votre compte et sur vos instructions, dans le seul but de fournir le Service. Un accord de sous-traitance est disponible sur demande.",
      ],
    },
    {
      heading: "9. Propriété intellectuelle",
      paragraphs: [
        "Le logiciel Tûm est concédé sous la licence publique générale GNU Affero, version 3. Aucune stipulation des Conditions ne limite les droits que cette licence vous confère.",
        "Les noms Tûm et MRVIN100, nos logos et l’identité visuelle du Service nous appartiennent. Les Conditions ne vous confèrent aucun droit de les utiliser sans notre accord écrit.",
        "Si vous nous adressez des suggestions ou des retours, nous pouvons les utiliser librement et sans obligation à votre égard.",
      ],
    },
    {
      heading: "10. Disponibilité et assistance",
      paragraphs: [
        "Nous mettons en œuvre des moyens raisonnables pour assurer la disponibilité et la sécurité de Tûm Cloud. Le Service peut être interrompu pour maintenance, mise à jour ou pour des raisons indépendantes de notre volonté. Sauf engagement de niveau de service convenu par écrit avec vous, nous ne garantissons pas un taux de disponibilité déterminé.",
        `L’assistance est assurée par courrier électronique à l’adresse ${CONTACT.SUPPORT_EMAIL}. Une assistance prioritaire est proposée dans les offres qui la prévoient.`,
      ],
    },
    {
      heading: "11. Services tiers",
      paragraphs: [
        "Le Service fait appel à des prestataires tiers, par exemple pour l’hébergement, le paiement, l’envoi de courriers électroniques et la connexion. Lorsque vous choisissez de connecter un service tiers, son utilisation est régie par les conditions de ce prestataire. Nous ne répondons pas des services que nous n’exploitons pas.",
      ],
    },
    {
      heading: "12. Suspension et résiliation",
      paragraphs: [
        "Vous pouvez cesser d’utiliser le Service et supprimer votre Compte ou votre Espace de travail à tout moment.",
        "Nous pouvons suspendre ou résilier votre accès en cas de manquement grave ou répété aux Conditions, de défaut de paiement, ou lorsque le maintien de l’accès nous exposerait, ou exposerait d’autres utilisateurs, à un risque juridique ou de sécurité. Lorsque les circonstances le permettent, nous vous en informons au préalable et vous laissons un délai raisonnable pour y remédier.",
        "Nous pouvons également mettre fin au Service ou à un Abonnement pour convenance, moyennant un préavis d’au moins 60 jours. Dans ce cas, nous remboursons les sommes versées pour la période restant à courir après la date de résiliation.",
        "Après la résiliation, vous disposez de 30 jours pour exporter les Données du Client, sauf si la loi nous interdit d’y donner accès. Passé ce délai, nous les supprimons, sous réserve des durées de conservation prévues par la Politique de confidentialité.",
      ],
    },
    {
      heading: "13. Garanties",
      paragraphs: [
        "Nous fournissons le Service avec le soin et la compétence raisonnablement attendus. Au-delà de cet engagement, et dans toute la mesure permise par la loi, le Service est fourni en l’état et selon sa disponibilité, sans garantie d’adéquation à un usage particulier, de fonctionnement ininterrompu ou d’absence d’erreur.",
        "Tûm est un outil de planification et de coordination. Vous demeurez responsable des décisions que vous prenez sur la base des plannings, rapports et autres informations qu’il produit.",
      ],
    },
    {
      heading: "14. Limitation de responsabilité",
      paragraphs: [
        "Dans toute la mesure permise par la loi, aucune partie ne répond envers l’autre du manque à gagner, de la perte de chiffre d’affaires, de la perte de clientèle, de la perte de données qu’une sauvegarde ou un export raisonnable aurait permis d’éviter, ni d’aucun dommage indirect.",
        "Notre responsabilité totale au titre du Service, quelle qu’en soit la cause, est limitée aux sommes que vous nous avez versées pour le Service au cours des douze mois précédant le fait générateur de la réclamation, ou à 100 dollars des États-Unis si vous utilisez une offre gratuite.",
        "Aucune stipulation des Conditions n’exclut ni ne limite la responsabilité en cas de fraude, de faute intentionnelle ou lourde, de décès ou de dommage corporel, ni toute autre responsabilité que la loi interdit d’exclure ou de limiter.",
      ],
    },
    {
      heading: "15. Garantie du Client",
      paragraphs: [
        "Vous vous engagez à nous indemniser de toute réclamation, perte ou frais, y compris les honoraires d’avocat raisonnables, résultant des Données du Client ou d’un manquement de votre part à l’article 6, à condition que nous vous informions rapidement de la réclamation et vous permettions d’assurer votre défense.",
      ],
    },
    {
      heading: "16. Modifications",
      paragraphs: [
        "Nous pouvons faire évoluer le Service et en modifier les fonctionnalités. Nous ne réduirons pas de manière substantielle les fonctions essentielles d’une offre payante au cours d’une période que vous avez déjà payée.",
        "Nous pouvons modifier les Conditions. En cas de modification substantielle, nous vous en informons par courrier électronique ou dans le Service au moins 30 jours avant son entrée en vigueur. Si vous n’êtes pas d’accord, vous pouvez résilier votre Abonnement avant cette date. La poursuite de l’utilisation du Service après cette date vaut acceptation des Conditions modifiées.",
      ],
    },
    {
      heading: "17. Droit applicable et litiges",
      paragraphs: [
        "Les Conditions sont régies par le droit de la République de Guinée, y compris les Actes uniformes de l’Organisation pour l’harmonisation en Afrique du droit des affaires (OHADA) lorsqu’ils s’appliquent.",
        "Les parties s’efforcent d’abord de résoudre tout litige à l’amiable. À défaut de solution dans un délai de 30 jours à compter de la notification écrite du litige, celui-ci est porté devant les juridictions compétentes de Conakry.",
        "Si vous utilisez le Service en qualité de consommateur, le présent article ne vous prive pas de la protection que vous accordent les dispositions impératives de la loi de votre pays de résidence.",
      ],
    },
    {
      heading: "18. Dispositions générales",
      paragraphs: [
        "Les Conditions, la Politique de confidentialité et tout bon de commande ou accord écrit conclu entre nous constituent l’intégralité de l’accord entre vous et nous au sujet du Service.",
        "Si une stipulation est jugée nulle, les autres stipulations demeurent applicables. Le fait de ne pas exercer un droit ne vaut pas renonciation à ce droit.",
        "Vous ne pouvez pas céder vos droits ou obligations au titre des Conditions sans notre accord. Nous pouvons céder les nôtres à une société de notre groupe ou au successeur de notre activité, à condition que vos droits ne s’en trouvent pas réduits.",
        "Aucune partie ne répond d’une inexécution causée par un événement échappant à son contrôle raisonnable, tel qu’une défaillance des réseaux de télécommunication ou d’électricité, une décision d’une autorité publique ou une catastrophe naturelle.",
        "Les Conditions sont publiées en français et en anglais. En cas de divergence, la version française prévaut.",
      ],
    },
    {
      heading: "19. Contact",
      paragraphs: [
        `Toute question relative aux Conditions peut être adressée à ${CONTACT.EMAIL}, en mentionnant « Tûm » dans l’objet, ou par courrier à ${COMPANY.NAME}, ${COMPANY.ADDRESS}, République de Guinée.`,
      ],
    },
  ],
};
