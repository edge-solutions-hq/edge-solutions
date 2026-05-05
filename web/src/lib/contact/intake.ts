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

export type ContactFormFieldName = keyof ContactFields | 'company';

export type ContactFormFieldModel = {
  name: ContactFormFieldName;
  labelKey?: string;
  placeholderKey?: string;
  errorKey?: ContactFieldErrorKey;
  control: 'input' | 'select' | 'textarea' | 'honeypot';
  type?: 'text' | 'email';
  required?: boolean;
  minLength?: number;
  rows?: number;
  defaultValue?: ContactOfferValue;
  autocomplete?: string;
};

export type ContactFeedbackState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  messageKey?: ContactActionMessageKey;
};

export type ContactFeedbackModel =
  | {kind: 'none'}
  | {kind: 'success'; messageKey: ContactActionMessageKey}
  | {kind: 'error'; messageKey?: ContactActionMessageKey; fallbackMessage?: string};

export const contactFormModel = {
  fields: {
    name: {
      name: 'name',
      labelKey: 'contact.form.name',
      placeholderKey: 'contact.form.namePlaceholder',
      errorKey: 'contact.form.fieldErrors.name',
      control: 'input',
      type: 'text',
      required: true,
      minLength: 2,
    },
    email: {
      name: 'email',
      labelKey: 'contact.form.email',
      placeholderKey: 'contact.form.emailPlaceholder',
      errorKey: 'contact.form.fieldErrors.email',
      control: 'input',
      type: 'email',
      required: true,
    },
    service: {
      name: 'service',
      labelKey: 'contact.form.service',
      errorKey: 'contact.form.fieldErrors.service',
      control: 'select',
      defaultValue: 'unsure',
    },
    message: {
      name: 'message',
      labelKey: 'contact.form.message',
      placeholderKey: 'contact.form.messagePlaceholder',
      errorKey: 'contact.form.fieldErrors.message',
      control: 'textarea',
      required: true,
      minLength: 10,
      rows: 7,
    },
    honeypot: {
      name: 'company',
      control: 'honeypot',
      type: 'text',
      autocomplete: 'off',
    },
  },
  offerOptions: contactOfferOptions,
  submitMessageKey: 'contact.form.submit',
  pendingLabel: '...',
} as const satisfies {
  fields: Record<string, ContactFormFieldModel>;
  offerOptions: typeof contactOfferOptions;
  submitMessageKey: string;
  pendingLabel: string;
};

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

export function extractContactSubmitService(formData: FormData) {
  const service = formData.get(contactFormModel.fields.service.name);
  return typeof service === 'string' ? service : undefined;
}

export function resolveContactFeedback(state: ContactFeedbackState): ContactFeedbackModel {
  if (state.status === 'success') {
    return {
      kind: 'success',
      messageKey: state.messageKey ?? 'contact.form.success',
    };
  }

  if (state.status === 'error') {
    return {
      kind: 'error',
      messageKey: state.messageKey,
      fallbackMessage: state.message,
    };
  }

  return {kind: 'none'};
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
