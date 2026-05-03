'use server';

import {Resend} from 'resend';
import {submitContactAttempt, type ContactActionState} from '@/lib/contact/delivery';

export type {ContactActionState} from '@/lib/contact/delivery';

export async function sendContactEmail(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  return submitContactAttempt(formData, {
    deliver: async (payload, config) => {
      const resend = new Resend(config.apiKey);
      const {error} = await resend.emails.send(payload);
      return error
        ? {ok: false, message: error.message || 'Erreur Resend.'}
        : {ok: true};
    },
  });
}
