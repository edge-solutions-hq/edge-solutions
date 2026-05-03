import {site} from '@/lib/site';
import {getContactDeliveryConfig} from '@/lib/runtime-config';
import {
  parseContactFields,
  readContactFormData,
  serviceLabel,
  type ContactAttemptOutcome,
  type ContactActionMessageKey,
} from '@/lib/contact/intake';

export type ContactActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  messageKey?: ContactActionMessageKey;
  fieldErrors?: Partial<Record<'name' | 'email' | 'service' | 'message', string>>;
  outcome?: ContactAttemptOutcome;
};

export type ContactEmailPayload = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

export type ContactDeliveryAdapter = (payload: ContactEmailPayload, config: {apiKey: string}) => Promise<{ok: true} | {ok: false; message: string}>;

type SubmitContactAttemptOptions = {
  env?: Record<string, string | undefined>;
  deliver: ContactDeliveryAdapter;
};

export async function submitContactAttempt(
  formData: FormData,
  {env = process.env, deliver}: SubmitContactAttemptOptions
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
        messageKey: 'contact.form.genericError',
        outcome: parsed.outcome,
      };
    }

    return {
      status: 'error',
      message: 'Champs invalides.',
      messageKey: 'contact.form.validationError',
      fieldErrors: parsed.outcome.fieldErrors,
      outcome: parsed.outcome,
    };
  }

  const {name, email, service, message} = parsed.fields;
  const config = getContactDeliveryConfig(env);
  if (!config.ready) {
    const outcome: ContactAttemptOutcome = {
      kind: 'delivery_error',
      service,
      message: `missing_${config.missingKeys.join('_') || 'delivery_config'}`,
    };

    return {
      status: 'error',
      message:
        'Configuration email manquante (RESEND_API_KEY). Ajoutez-la dans vos variables d’environnement.',
      messageKey: 'contact.form.configError',
      outcome,
    };
  }

  const payload: ContactEmailPayload = {
    from: config.from,
    to: config.to,
    replyTo: email,
    subject: `[${site.companyName}] Nouveau message (${serviceLabel(service)}) — ${name}`,
    text: [
      `Nom: ${name}`,
      `Email: ${email}`,
      `Service: ${serviceLabel(service)}`,
      '',
      message,
    ].join('\n'),
  };

  const result = await deliver(payload, {apiKey: config.apiKey});
  if (!result.ok) {
    const outcome: ContactAttemptOutcome = {
      kind: 'delivery_error',
      service,
      message: result.message || 'resend_error',
    };

    return {
      status: 'error',
      message: result.message || 'Erreur Resend.',
      messageKey: 'contact.form.genericError',
      outcome,
    };
  }

  return {
    status: 'success',
    message: 'Message envoyé. Je reviens vers vous rapidement.',
    messageKey: 'contact.form.success',
    outcome: {kind: 'success', service},
  };
}
