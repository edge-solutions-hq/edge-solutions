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
  maxLength?: number;
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

export const contactFieldConstraints = {
  name: {minLength: 2, maxLength: 80},
  email: {maxLength: 200},
  message: {minLength: 10, maxLength: 5000},
} as const;

export const contactFormModel = {
  fieldOrder: ['name', 'email', 'service', 'message'] as const,
  fields: {
    name: {
      name: 'name',
      labelKey: 'contact.form.name',
      placeholderKey: 'contact.form.namePlaceholder',
      errorKey: 'contact.form.fieldErrors.name',
      control: 'input',
      type: 'text',
      required: true,
      minLength: contactFieldConstraints.name.minLength,
      maxLength: contactFieldConstraints.name.maxLength,
    },
    email: {
      name: 'email',
      labelKey: 'contact.form.email',
      placeholderKey: 'contact.form.emailPlaceholder',
      errorKey: 'contact.form.fieldErrors.email',
      control: 'input',
      type: 'email',
      required: true,
      maxLength: contactFieldConstraints.email.maxLength,
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
      minLength: contactFieldConstraints.message.minLength,
      maxLength: contactFieldConstraints.message.maxLength,
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
  fieldOrder: readonly (keyof ContactFields)[];
  fields: Record<string, ContactFormFieldModel>;
  offerOptions: typeof contactOfferOptions;
  submitMessageKey: string;
  pendingLabel: string;
};

const schema = z.object({
  name: z.string().trim().min(contactFieldConstraints.name.minLength).max(contactFieldConstraints.name.maxLength),
  email: z.string().trim().email().max(contactFieldConstraints.email.maxLength),
  service: z.enum(contactOfferValues).default('unsure'),
  message: z.string().trim().min(contactFieldConstraints.message.minLength).max(contactFieldConstraints.message.maxLength),
  company: z.string().optional(),
});

export function isContactOfferValue(value: string): value is ContactOfferValue {
  return contactOfferValues.includes(value as ContactOfferValue);
}

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
  return typeof service === 'string' && isContactOfferValue(service) ? service : undefined;
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
