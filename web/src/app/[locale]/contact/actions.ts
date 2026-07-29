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

export async function sendContactEmail(
  _prevState: ContactActionState,
  formData: FormData,
  deliver: ContactDeliveryAdapter = deliverWithResend
): Promise<ContactActionState> {
  return submitContactAttempt(formData, {deliver});
}
