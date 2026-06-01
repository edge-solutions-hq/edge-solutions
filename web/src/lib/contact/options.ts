export const contactOfferValues = ['ai', 'realtime', 'unsure'] as const;
export type ContactOfferValue = (typeof contactOfferValues)[number];

export const defaultContactOfferValue: ContactOfferValue = 'unsure';

export const contactOfferOptions = [
  {
    value: 'ai',
    messageKey: 'contact.form.service_ai',
    deliveryLabel: 'IA & automatisation',
  },
  {
    value: 'realtime',
    messageKey: 'contact.form.service_realtime',
    deliveryLabel: '3D / XR temps réel',
  },
  {
    value: defaultContactOfferValue,
    messageKey: 'contact.form.service_unsure',
    deliveryLabel: 'Non précisé',
  },
] as const satisfies readonly {
  value: ContactOfferValue;
  messageKey: string;
  deliveryLabel: string;
}[];

export function isContactOfferValue(value: string): value is ContactOfferValue {
  return contactOfferValues.includes(value as ContactOfferValue);
}

export function resolveContactServiceSearchParam(
  value: string | string[] | null | undefined
): ContactOfferValue | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;

  return typeof candidate === 'string' && isContactOfferValue(candidate)
    ? candidate
    : undefined;
}

export function resolveContactServiceTarget(target: string): ContactOfferValue | undefined {
  const queryString = target.split('#', 1)[0]?.split('?', 2)[1] ?? '';
  return resolveContactServiceSearchParam(new URLSearchParams(queryString).get('service'));
}
