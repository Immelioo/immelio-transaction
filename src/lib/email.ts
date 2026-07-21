import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// En production, utilise la clé API Resend
// En dev, les emails sont loggés dans la console
const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = env.FROM_EMAIL;
const ADMIN_EMAIL = env.ADMIN_EMAIL || "tf.immopro@gmail.com";
const SMTP_FROM = env.SMTP_FROM;
const SITE_URL = env.NEXT_PUBLIC_SITE_URL || "https://www.immelio.fr";

type EmailProvider = "smtp" | "resend" | "console";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  provider: EmailProvider;
  id?: string;
  dev?: boolean;
  error?: unknown;
}

let smtpTransporter: Transporter | null = null;

function hasSmtpConfig() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);
}

function getSmtpTransporter() {
  if (!hasSmtpConfig()) return null;
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: env.SMTP_SECURE === "true" || Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return smtpTransporter;
}

function stringifyEmailError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function sendWithSmtp({ to, subject, html }: EmailOptions): Promise<EmailResult> {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    return { success: false, provider: "smtp", error: "SMTP non configuré" };
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });

    return {
      success: true,
      provider: "smtp",
      id: info.messageId,
    };
  } catch (error) {
    logger.error("Erreur envoi email SMTP", { to, subject, error: stringifyEmailError(error) });
    return { success: false, provider: "smtp", error };
  }
}

async function sendWithResend({ to, subject, html }: EmailOptions): Promise<EmailResult> {
  if (!resend) {
    return { success: false, provider: "resend", error: "Resend non configuré" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      logger.error("Erreur envoi email Resend", {
        to,
        subject,
        error: stringifyEmailError(error),
        from: FROM_EMAIL,
      });
      return { success: false, provider: "resend", error };
    }

    return {
      success: true,
      provider: "resend",
      id: data?.id,
    };
  } catch (error) {
    logger.error("Exception envoi email Resend", {
      to,
      subject,
      error: stringifyEmailError(error),
      from: FROM_EMAIL,
    });
    return { success: false, provider: "resend", error };
  }
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<EmailResult> {
  // En dev sans clé Resend : log dans la console
  if (!resend && !hasSmtpConfig()) {
    logger.info("EMAIL mode dev — non envoyé", {
      provider: "console",
      to,
      subject,
      preview: html.substring(0, 200),
    });
    return { success: true, dev: true, provider: "console" };
  }

  const strategies = [
    hasSmtpConfig() ? sendWithSmtp : null,
    resend ? sendWithResend : null,
  ].filter(Boolean) as Array<(options: EmailOptions) => Promise<EmailResult>>;

  for (const strategy of strategies) {
    const result = await strategy({ to, subject, html });
    if (result.success) {
      return result;
    }
  }

  logger.error("Tous les providers email ont échoué", {
    to,
    subject,
    providersTried: strategies.length,
  });

  return {
    success: false,
    provider: hasSmtpConfig() ? "smtp" : "resend",
    error: "Tous les providers email ont échoué",
  };
}

// ============================================
// TEMPLATES EMAIL
// ============================================

const HEADER = `
<div style="background: #1e3a5f; padding: 24px; text-align: center;">
  <h1 style="color: white; margin: 0; font-family: Arial, sans-serif;">
    <span style="color: #d4a853;">Immelio</span> Transaction
  </h1>
</div>`;

const FOOTER = `
<div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; font-family: Arial, sans-serif;">
  <p>Immelio Transaction — Votre partenaire immobilier de confiance</p>
  <p>07 71 55 64 83 | tf.immopro@gmail.com</p>
  <p style="margin-top: 8px;">Lyon, France</p>
</div>`;

/**
 * A1 — Email de confirmation de visite au client
 */
export function emailConfirmationVisite(params: {
  prenom: string;
  nom: string;
  bienTitre: string;
  bienAdresse: string;
  dateSouhaitee: string;
  creneau: string;
}) {
  const creneauLabel: Record<string, string> = {
    MATIN: "Matin (9h-12h)",
    APRES_MIDI: "Après-midi (14h-18h)",
    SOIR: "Soir (18h-20h)",
  };

  return {
    subject: `Confirmation de votre demande de visite — ${params.bienTitre}`,
    html: `
      ${HEADER}
      <div style="padding: 32px; font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Bonjour ${params.prenom},</h2>

        <p style="font-size: 16px; line-height: 1.6;">
          Nous avons bien reçu votre demande de visite et nous vous en remercions !
        </p>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #d4a853;">
          <h3 style="margin: 0 0 12px 0; color: #1e3a5f;">Récapitulatif</h3>
          <p style="margin: 4px 0;"><strong>Bien :</strong> ${params.bienTitre}</p>
          <p style="margin: 4px 0;"><strong>Adresse :</strong> ${params.bienAdresse}</p>
          <p style="margin: 4px 0;"><strong>Date souhaitée :</strong> ${params.dateSouhaitee}</p>
          <p style="margin: 4px 0;"><strong>Créneau :</strong> ${creneauLabel[params.creneau] || params.creneau}</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Notre équipe va étudier votre demande et vous recontacter dans les plus brefs délais
          pour confirmer le rendez-vous.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Si vous avez des questions, n'hésitez pas à nous appeler au
          <strong>07 71 55 64 83</strong>.
        </p>

        <p style="margin-top: 32px; color: #666;">
          Cordialement,<br/>
          <strong>L'équipe Immelio Transaction</strong>
        </p>
      </div>
      ${FOOTER}
    `,
  };
}

/**
 * A1 bis — Notification à l'admin quand nouvelle demande de visite
 */
export function emailNouvelleVisiteAdmin(params: {
  clientNom: string;
  clientEmail: string;
  clientTelephone?: string;
  bienTitre: string;
  dateSouhaitee: string;
  creneau: string;
  message?: string;
}) {
  return {
    to: ADMIN_EMAIL,
    subject: `🏠 Nouvelle demande de visite — ${params.bienTitre}`,
    html: `
      ${HEADER}
      <div style="padding: 32px; font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Nouvelle demande de visite !</h2>

        <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #d4a853;">
          <h3 style="margin: 0 0 12px 0;">Client</h3>
          <p style="margin: 4px 0;"><strong>Nom :</strong> ${params.clientNom}</p>
          <p style="margin: 4px 0;"><strong>Email :</strong> ${params.clientEmail}</p>
          ${params.clientTelephone ? `<p style="margin: 4px 0;"><strong>Tél :</strong> ${params.clientTelephone}</p>` : ""}
        </div>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0;">Visite</h3>
          <p style="margin: 4px 0;"><strong>Bien :</strong> ${params.bienTitre}</p>
          <p style="margin: 4px 0;"><strong>Date :</strong> ${params.dateSouhaitee}</p>
          <p style="margin: 4px 0;"><strong>Créneau :</strong> ${params.creneau}</p>
          ${params.message ? `<p style="margin: 4px 0;"><strong>Message :</strong> ${params.message}</p>` : ""}
        </div>

        <a href="${SITE_URL}/admin/visites"
           style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Voir dans le CRM
        </a>
      </div>
      ${FOOTER}
    `,
  };
}

/**
 * B1 — Notification admin : nouveau message de contact
 */
export function emailNouveauContactAdmin(params: {
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
}) {
  return {
    to: ADMIN_EMAIL,
    subject: `📩 Nouveau message de contact — ${params.sujet}`,
    html: `
      ${HEADER}
      <div style="padding: 32px; font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Nouveau message de contact !</h2>

        <div style="background: #e8f4f8; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #d4a853;">
          <h3 style="margin: 0 0 12px 0; color: #1e3a5f;">Expéditeur</h3>
          <p style="margin: 4px 0;"><strong>Nom :</strong> ${params.nom}</p>
          <p style="margin: 4px 0;"><strong>Email :</strong> <a href="mailto:${params.email}" style="color: #1e3a5f;">${params.email}</a></p>
          ${params.telephone ? `<p style="margin: 4px 0;"><strong>Tél :</strong> ${params.telephone}</p>` : ""}
        </div>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0;">Message</h3>
          <p style="margin: 4px 0;"><strong>Sujet :</strong> ${params.sujet}</p>
          <p style="margin: 12px 0 0 0; line-height: 1.6; white-space: pre-wrap;">${params.message}</p>
        </div>

        <a href="${SITE_URL}/admin/leads"
           style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Voir dans le CRM
        </a>
      </div>
      ${FOOTER}
    `,
  };
}

/**
 * B2 — Confirmation au client après son message
 */
export function emailConfirmationContact(params: {
  prenom: string;
  nom: string;
  sujet: string;
}) {
  return {
    subject: `Votre message a bien été reçu — Immelio Transaction`,
    html: `
      ${HEADER}
      <div style="padding: 32px; font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Bonjour ${params.prenom},</h2>

        <p style="font-size: 16px; line-height: 1.6;">
          Nous avons bien reçu votre message concernant <strong>"${params.sujet}"</strong>
          et nous vous en remercions.
        </p>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #d4a853;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6;">
            Notre équipe va revenir vers vous dans les <strong>meilleurs délais</strong>,
            généralement sous 24 à 48 heures ouvrées.
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          En attendant, n'hésitez pas à parcourir notre sélection de biens ou à nous appeler
          directement au <strong>07 71 55 64 83</strong>.
        </p>

        <a href="${SITE_URL}/biens"
           style="display: inline-block; background: #d4a853; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Voir nos biens
        </a>

        <p style="margin-top: 32px; color: #666;">
          Cordialement,<br/>
          <strong>L'équipe Immelio Transaction</strong>
        </p>
      </div>
      ${FOOTER}
    `,
  };
}

/**
 * B3 — Notification admin : nouvelle demande d'estimation
 */
export function emailNouvelleEstimationAdmin(params: {
  nom: string;
  email: string;
  telephone: string;
  type: string;
  surface: string;
  ville: string;
  details: string;
}) {
  return {
    to: ADMIN_EMAIL,
    subject: `🏡 Nouvelle demande d'estimation — ${params.type} ${params.surface}m² à ${params.ville}`,
    html: `
      ${HEADER}
      <div style="padding: 32px; font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Nouvelle demande d'estimation !</h2>

        <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #d4a853;">
          <h3 style="margin: 0 0 12px 0;">Contact</h3>
          <p style="margin: 4px 0;"><strong>Nom :</strong> ${params.nom}</p>
          <p style="margin: 4px 0;"><strong>Email :</strong> <a href="mailto:${params.email}" style="color: #1e3a5f;">${params.email}</a></p>
          <p style="margin: 4px 0;"><strong>Tél :</strong> ${params.telephone}</p>
        </div>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0;">Bien à estimer</h3>
          <p style="margin: 4px 0;"><strong>Type :</strong> ${params.type}</p>
          <p style="margin: 4px 0;"><strong>Surface :</strong> ${params.surface} m²</p>
          <p style="margin: 4px 0;"><strong>Ville :</strong> ${params.ville}</p>
          <p style="margin: 16px 0 0 0; font-size: 13px; white-space: pre-wrap; color: #555;">${params.details}</p>
        </div>

        <a href="${SITE_URL}/admin/leads"
           style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Voir dans le CRM
        </a>
      </div>
      ${FOOTER}
    `,
  };
}

/**
 * A2 — Email d'invitation partenaire avec lien de définition de mot de passe
 * Le mot de passe n'est JAMAIS envoyé par email.
 */
export function emailInvitationPartenaire(params: {
  prenom: string;
  nom: string;
  email: string;
  entreprise: string;
  codeAcces: string;
  inviteUrl: string;
}) {
  return {
    subject: `Bienvenue chez Immelio Transaction — Activez votre espace partenaire`,
    html: `
      ${HEADER}
      <div style="padding: 32px; font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Bienvenue ${params.prenom} !</h2>

        <p style="font-size: 16px; line-height: 1.6;">
          Votre compte partenaire <strong>${params.entreprise}</strong> a été créé sur
          la plateforme Immelio Transaction. Pour finaliser votre inscription, vous devez
          définir votre mot de passe en cliquant sur le bouton ci-dessous.
        </p>

        <div style="background: #e8f4f8; border-radius: 12px; padding: 24px; margin: 24px 0; border: 2px solid #1e3a5f;">
          <h3 style="margin: 0 0 16px 0; color: #1e3a5f;">Vos informations de connexion</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px;">Email :</td>
              <td style="padding: 8px 0;">${params.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Code d'accès :</td>
              <td style="padding: 8px 0; font-family: monospace; background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${params.codeAcces}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${params.inviteUrl}"
             style="display: inline-block; background: #d4a853; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Définir mon mot de passe et activer mon compte
          </a>
          <p style="font-size: 13px; color: #888; margin-top: 12px;">
            Ce lien est valable 48 heures. Ne le partagez avec personne.
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">
          Une fois votre compte activé, vous pourrez :
        </p>
        <ul style="font-size: 15px; line-height: 1.8; color: #555;">
          <li>Consulter les biens disponibles avec les commissions</li>
          <li>Découvrir les programmes neufs et poser des options</li>
          <li>Envoyer des documents (mandats, compromis...)</li>
          <li>Faire des demandes de recherche pour vos clients</li>
        </ul>

        <p style="font-size: 13px; color: #aaa; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
          Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
          Pour toute question : 07 71 55 64 83
        </p>

        <p style="margin-top: 24px; color: #666;">
          À très bientôt,<br/>
          <strong>L'équipe Immelio Transaction</strong>
        </p>
      </div>
      ${FOOTER}
    `,
  };
}

/**
 * C1 — Notification admin : demande publique de partenariat (formulaire /devenir-partenaire)
 */
export function emailDemandePartenariat(params: {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  entreprise: string;
  message?: string;
  prefillUrl: string;
}) {
  return {
    to: ADMIN_EMAIL,
    subject: `🤝 Nouvelle demande de partenariat — ${params.prenom} ${params.nom} (${params.entreprise})`,
    html: `
      ${HEADER}
      <div style="padding: 32px; font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Nouvelle demande de partenariat</h2>
        <p style="color: #555;">Un professionnel souhaite devenir partenaire Immelio Transaction.</p>

        <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #d4a853;">
          <h3 style="margin: 0 0 12px 0; color: #1e3a5f;">Coordonnées</h3>
          <p style="margin: 6px 0;"><strong>Nom :</strong> ${params.prenom} ${params.nom}</p>
          <p style="margin: 6px 0;"><strong>Email :</strong> <a href="mailto:${params.email}" style="color: #1e3a5f;">${params.email}</a></p>
          ${params.telephone ? `<p style="margin: 6px 0;"><strong>Tél :</strong> <a href="tel:${params.telephone}" style="color: #1e3a5f;">${params.telephone}</a></p>` : ""}
          <p style="margin: 6px 0;"><strong>Entreprise :</strong> ${params.entreprise}</p>
        </div>

        ${params.message ? `
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1e3a5f;">Message</h3>
          <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${params.message}</p>
        </div>
        ` : ""}

        <div style="text-align: center; margin: 32px 0;">
          <a href="${params.prefillUrl}"
             style="display: inline-block; background: #1e3a5f; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Créer le compte partenaire →
          </a>
          <p style="font-size: 12px; color: #888; margin-top: 8px;">Les informations sont préremplies dans le formulaire.</p>
        </div>
      </div>
      ${FOOTER}
    `,
  };
}

/**
 * @deprecated Utiliser emailInvitationPartenaire à la place — ne jamais envoyer de mot de passe en clair
 */
export function emailBienvenuePartenaire(params: {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  codeAcces: string;
  entreprise: string;
}) {
  // Redirige silencieusement vers la version sécurisée (sans le mot de passe)
  return emailInvitationPartenaire({
    prenom: params.prenom,
    nom: params.nom,
    email: params.email,
    entreprise: params.entreprise,
    codeAcces: params.codeAcces,
    inviteUrl: `${SITE_URL}/pro/login`,
  });
}
