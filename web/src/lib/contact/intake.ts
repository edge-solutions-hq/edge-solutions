import {z} from 'zod';

export const contactOfferValues = ['ai', 'web', 'realtime', 'unsure'] as const;
export type ContactOfferValue = (typeof contactOfferValues)[number];

export type ContactFields = {
  name: string;
  email: string;
  service: ContactOfferValue;
  message: string;
};

export type ContactFieldErrors = Partial<Record<keyof ContactFields, string>>;

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

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      outcome: {
        kind: 'validation_error',
        service: raw.service || undefined,
        fieldErrors: {
          name: fieldErrors.name?.[0],
          email: fieldErrors.email?.[0],
          service: fieldErrors.service?.[0],
          message: fieldErrors.message?.[0],
        },
      },
    };
  }

  const {name, email, service, message} = parsed.data;
  return {ok: true, fields: {name, email, service, message}};
}

export function serviceLabel(service: ContactOfferValue) {
  switch (service) {
    case 'ai':
      return 'IA & automatisation';
    case 'web':
      return 'Web';
    case 'realtime':
      return 'Temps réel 3D/VR';
    default:
      return 'Non précisé';
  }
}
