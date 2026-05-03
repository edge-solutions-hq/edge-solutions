import {z} from 'zod';

export const contactOfferValues = ['ai', 'web', 'realtime', 'unsure'] as const;
export type ContactOfferValue = (typeof contactOfferValues)[number];

export const contactOfferOptions = [
  {
    value: 'ai',
    messageKey: 'contact.form.service_ai',
    deliveryLabel: 'IA & automatisation',
  },
  {
    value: 'web',
    messageKey: 'contact.form.service_web',
    deliveryLabel: 'Web',
  },
  {
    value: 'realtime',
    messageKey: 'contact.form.service_realtime',
    deliveryLabel: 'Temps réel 3D/VR',
  },
  {
    value: 'unsure',
    messageKey: 'contact.form.service_unsure',
    deliveryLabel: 'Non précisé',
  },
] as const satisfies readonly {
  value: ContactOfferValue;
  messageKey: string;
  deliveryLabel: string;
}[];

export type ContactActionMessageKey =
  | 'contact.form.success'
  | 'contact.form.validationError'
  | 'contact.form.configError'
  | 'contact.form.genericError';

export type ContactFieldErrorKey =
  | 'contact.form.fieldErrors.name'
  | 'contact.form.fieldErrors.email'
  | 'contact.form.fieldErrors.service'
  | 'contact.form.fieldErrors.message';

export type ContactFields = {
  name: string;
  email: string;
  service: ContactOfferValue;
  message: string;
};

export type ContactFieldErrors = Partial<Record<keyof ContactFields, ContactFieldErrorKey>>;

export type ContactAttemptOutcome =
  | {kind: 'success'; service: ContactOfferValue}
  | {kind: 'validation_error'; service?: string; fieldErrors: ContactFieldErrors}
  | {kind: 'delivery_error'; service: ContactOfferValue; message: string}
  | {kind: 'spam'; service?: string};

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  service: z.enum(contactOfferValues).default('unsure'),
  message: z.string().trim().min(10).max(5000),
  company: z.string().optional(),
});

export function asFormString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value : '';
}

export function readContactFormData(formData: FormData) {
  return {
    name: asFormString(formData.get('name')),
    email: asFormString(formData.get('email')),
    service: asFormString(formData.get('service')),
    message: asFormString(formData.get('message')),
    company: asFormString(formData.get('company')),
  };
}

export function parseContactFields(raw: ReturnType<typeof readContactFormData>):
  | {ok: true; fields: ContactFields}
  | {ok: false; outcome: ContactAttemptOutcome} {
  if (raw.company) {
    return {ok: false, outcome: {kind: 'spam', service: raw.service || undefined}};
  }

  const parsed = schema.safeParse({
    ...raw,
    service: raw.service || undefined,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      outcome: {
        kind: 'validation_error',
        service: raw.service || undefined,
        fieldErrors: {
          name: fieldErrors.name?.[0] ? 'contact.form.fieldErrors.name' : undefined,
          email: fieldErrors.email?.[0] ? 'contact.form.fieldErrors.email' : undefined,
          service: fieldErrors.service?.[0] ? 'contact.form.fieldErrors.service' : undefined,
          message: fieldErrors.message?.[0] ? 'contact.form.fieldErrors.message' : undefined,
        },
      },
    };
  }

  const {name, email, service, message} = parsed.data;
  return {ok: true, fields: {name, email, service, message}};
}

export function serviceLabel(service: ContactOfferValue) {
  return contactOfferOptions.find((option) => option.value === service)?.deliveryLabel ?? 'Non précisé';
}
