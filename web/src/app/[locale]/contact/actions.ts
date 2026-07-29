'use server';

import {Resend} from 'resend';
import {
  submitContactAttempt,
  type ContactActionState,
  type ContactDeliveryAdapter,
} from '@/lib/contact/delivery';

export type {ContactActionState} from '@/lib/contact/delivery';

const deliverWithResend: ContactDeliveryAdapter = async (payload, config) => {
  const resend = new Resend(config.apiKey);
  const {error} = await resend.emails.send(payload);
  return error ? {ok: false} : {ok: true};
};

const deliverWithoutIo: ContactDeliveryAdapter = async () => ({ok: true});
const rejectPlaywrightInProduction: ContactDeliveryAdapter = async () => ({ok: false});

function defaultDeliveryAdapter(): ContactDeliveryAdapter {
  if (process.env.PLAYWRIGHT_TEST !== '1') return deliverWithResend;
  return process.env.VERCEL_ENV === 'production'
    ? rejectPlaywrightInProduction
    : deliverWithoutIo;
}

export async function sendContactEmail(
  _prevState: ContactActionState,
  formData: FormData,
  deliver?: ContactDeliveryAdapter
): Promise<ContactActionState> {
  return submitContactAttempt(formData, {deliver: deliver ?? defaultDeliveryAdapter()});
}
