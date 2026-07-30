'use server';

import {Resend} from 'resend';
import {headers} from 'next/headers.js';
import {
  submitContactAttempt,
  type ContactActionState,
  type ContactDeliveryAdapter,
} from '@/lib/contact/delivery';
import {
  BROWSER_HARNESS_HEADER,
  isBrowserHarnessRequest,
} from '@/lib/contact/browser-harness';

export type {ContactActionState} from '@/lib/contact/delivery';

const deliverWithResend: ContactDeliveryAdapter = async (payload, config) => {
  const resend = new Resend(config.apiKey);
  const {error} = await resend.emails.send(payload);
  return error ? {ok: false} : {ok: true};
};

const deliverWithoutIo: ContactDeliveryAdapter = async () => ({ok: true});
const rejectUnverifiedBrowserHarness: ContactDeliveryAdapter = async () => ({ok: false});

async function defaultDeliveryAdapter(): Promise<ContactDeliveryAdapter> {
  if (process.env.PLAYWRIGHT_TEST !== '1') return deliverWithResend;

  let requestToken: string | null = null;
  try {
    requestToken = (await headers()).get(BROWSER_HARNESS_HEADER);
  } catch {
    return rejectUnverifiedBrowserHarness;
  }

  return isBrowserHarnessRequest({
    enabled: process.env.PLAYWRIGHT_TEST,
    expectedToken: process.env.PLAYWRIGHT_TEST_TOKEN,
    requestToken,
  })
    ? deliverWithoutIo
    : rejectUnverifiedBrowserHarness;
}

export async function sendContactEmail(
  _prevState: ContactActionState,
  formData: FormData,
  deliver?: ContactDeliveryAdapter
): Promise<ContactActionState> {
  return submitContactAttempt(formData, {
    deliver: deliver ?? await defaultDeliveryAdapter(),
  });
}
