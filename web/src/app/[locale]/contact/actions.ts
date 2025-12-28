'use server';

import {Resend} from 'resend';
import {z} from 'zod';
import {site} from '@/lib/site';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  service: z.enum(['web', 'realtime', 'unsure']).default('unsure'),
  message: z.string().trim().min(10).max(5000),
  company: z.string().optional() // honeypot (doit rester vide)
});

export type ContactActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'service' | 'message', string>>;
};

function asString(v: FormDataEntryValue | null) {
  return typeof v === 'string' ? v : '';
}

function serviceLabel(service: 'web' | 'realtime' | 'unsure') {
  switch (service) {
    case 'web':
      return 'Web';
    case 'realtime':
      return 'Temps réel 3D/VR';
    default:
      return 'Non précisé';
  }
}

export async function sendContactEmail(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const raw = {
    name: asString(formData.get('name')),
    email: asString(formData.get('email')),
    service: asString(formData.get('service')),
    message: asString(formData.get('message')),
    company: asString(formData.get('company'))
  };

  // Honeypot: on "réussit" sans envoyer
  if (raw.company) {
    return {status: 'success', message: 'OK'};
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: 'error',
      message: 'Champs invalides.',
      fieldErrors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        service: fieldErrors.service?.[0],
        message: fieldErrors.message?.[0]
      }
    };
  }

  const {name, email, service, message} = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      status: 'error',
      message:
        'Configuration email manquante (RESEND_API_KEY). Ajoutez-la dans vos variables d’environnement.'
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
    return {
      status: 'error',
      message: error.message || 'Erreur Resend.'
    };
  }

  return {
    status: 'success',
    message: 'Message envoyé. Je reviens vers vous rapidement.'
  };
}


