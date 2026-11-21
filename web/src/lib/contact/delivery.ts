import {site} from '@/lib/site/site';
import {getContactDeliveryConfig} from '@/lib/runtime-config';
import type {ContactAbuseAdapter} from '@/lib/contact/abuse';
import {
  parseContactFields,
  readContactFormData,
  serviceLabel,
  type ContactActionState,
  type ContactErrorMessageKey,
  type ContactFields,
} from '@/lib/contact/intake';

export type {ContactActionState} from '@/lib/contact/intake';

export type ContactEmailPayload = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

export type ContactDeliveryAdapter = (
  payload: ContactEmailPayload,
  config: {apiKey: string}
) => Promise<{ok: true} | {ok: false}>;

function deliveryErrorState(
  service: ContactFields['service'],
  messageKey: Extract<ContactErrorMessageKey, 'contact.form.configError' | 'contact.form.genericError'>
): ContactActionState {
  return {
    status: 'error',
    messageKey,
    outcome: {kind: 'delivery_error', service},
  };
}

export function buildContactEmailPayload({
  fields,
  from,
  to,
}: {
  fields: ContactFields;
  from: string;
  to: string;
}): ContactEmailPayload {
  const {name, email, service, message} = fields;

  return {
    from,
    to,
    replyTo: email,
    subject: `[${site.companyName}] Nouveau message (${serviceLabel(service)}) - ${name}`,
    text: [
      `Nom: ${name}`,
      `Email: ${email}`,
      `Service: ${serviceLabel(service)}`,
      '',
      message,
    ].join('\n'),
  };
}

type SubmitContactAttemptOptions = {
  env?: Record<string, string | undefined>;
  abuse: ContactAbuseAdapter;
  deliver: ContactDeliveryAdapter;
};

export async function submitContactAttempt(
  formData: FormData,
  {env = process.env, abuse, deliver}: SubmitContactAttemptOptions
): Promise<ContactActionState> {
  const parsed = parseContactFields(readContactFormData(formData));
  if (!parsed.ok) {
    if (parsed.outcome.kind === 'spam') {
      return {status: 'dropped', outcome: parsed.outcome};
    }

    return {
      status: 'error',
      messageKey: 'contact.form.validationError',
      outcome: parsed.outcome,
    };
  }

  const {service} = parsed.fields;
  let abuseDecision: Awaited<ReturnType<ContactAbuseAdapter>>;
  try {
    abuseDecision = await abuse();
  } catch {
    return {
      status: 'error',
      messageKey: 'contact.form.genericError',
      outcome: {kind: 'abuse_control_error', service},
    };
  }

  if (abuseDecision === 'limited') {
    return {
      status: 'error',
      messageKey: 'contact.form.rateLimitError',
      outcome: {kind: 'limited', service},
    };
  }

  if (abuseDecision === 'unavailable') {
    return {
      status: 'error',
      messageKey: 'contact.form.genericError',
      outcome: {kind: 'abuse_control_error', service},
    };
  }

  const config = getContactDeliveryConfig(env);
  if (!config.ready) {
    return deliveryErrorState(service, 'contact.form.configError');
  }

  const payload = buildContactEmailPayload({
    fields: parsed.fields,
    from: config.from,
    to: config.to,
  });

  let result: Awaited<ReturnType<ContactDeliveryAdapter>>;
  try {
    result = await deliver(payload, {apiKey: config.apiKey});
  } catch {
    return deliveryErrorState(service, 'contact.form.genericError');
  }

  if (!result.ok) {
    return deliveryErrorState(service, 'contact.form.genericError');
  }

  return {
    status: 'success',
    outcome: {kind: 'success', service},
  };
}
