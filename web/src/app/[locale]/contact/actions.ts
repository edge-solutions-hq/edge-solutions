'use server';

import {Resend} from 'resend';
import {site} from '@/lib/site';
import {
  parseContactFields,
  readContactFormData,
  serviceLabel,
  type ContactAttemptOutcome,
} from '@/lib/contact/intake';

export type ContactActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'service' | 'message', string>>;
  outcome?: ContactAttemptOutcome;
};

export async function sendContactEmail(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = parseContactFields(readContactFormData(formData));
  if (!parsed.ok) {
    if (parsed.outcome.kind === 'spam') {
      return {status: 'idle', outcome: parsed.outcome};
    }

    if (parsed.outcome.kind !== 'validation_error') {
      return {
        status: 'error',
        message: 'Erreur de traitement du formulaire.',
        outcome: parsed.outcome,
      };
    }

    return {
      status: 'error',
      message: 'Champs invalides.',
      fieldErrors: parsed.outcome.fieldErrors,
      outcome: parsed.outcome,
    };
  }

  const {name, email, service, message} = parsed.fields;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const outcome: ContactAttemptOutcome = {
      kind: 'delivery_error',
      service,
      message: 'missing_resend_api_key',
    };

    return {
      status: 'error',
      message:
        'Configuration email manquante (RESEND_API_KEY). Ajoutez-la dans vos variables d’environnement.',
      outcome,
    };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'Edge Solutions <onboarding@resend.dev>';
  const to = process.env.RESEND_TO_EMAIL ?? site.contactEmail;

  const resend = new Resend(apiKey);

  const subject = `[${site.companyName}] Nouveau message (${serviceLabel(service)}) — ${name}`;

  const text = [
    `Nom: ${name}`,
    `Email: ${email}`,
    `Service: ${serviceLabel(service)}`,
    '',
    message
  ].join('\n');

  const {error} = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject,
    text
  });

  if (error) {
    const outcome: ContactAttemptOutcome = {
      kind: 'delivery_error',
      service,
      message: error.message || 'resend_error',
    };

    return {
      status: 'error',
      message: error.message || 'Erreur Resend.',
      outcome,
    };
  }

  return {
    status: 'success',
    message: 'Message envoyé. Je reviens vers vous rapidement.',
    outcome: {kind: 'success', service},
  };
}
