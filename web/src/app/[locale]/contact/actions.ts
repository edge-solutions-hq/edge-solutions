'use server';

import {Resend} from 'resend';
import {checkRateLimit} from '@vercel/firewall';
import {headers} from 'next/headers.js';
import {
  submitContactAttempt,
  type ContactActionState,
  type ContactDeliveryAdapter,
} from '@/lib/contact/delivery';
import {
  CONTACT_RATE_LIMIT_ID,
  normalizeContactRateLimitResult,
  type ContactAbuseAdapter,
} from '@/lib/contact/abuse';
import {
  BROWSER_HARNESS_HEADER,
  resolveBrowserHarnessMode,
} from '@/lib/contact/browser-harness';

export type {ContactActionState} from '@/lib/contact/delivery';

const deliverWithResend: ContactDeliveryAdapter = async (payload, config) => {
  const resend = new Resend(config.apiKey);
  const {error} = await resend.emails.send(payload);
  return error ? {ok: false} : {ok: true};
};

const deliverWithoutIo: ContactDeliveryAdapter = async () => ({ok: true});
const rejectUnverifiedBrowserHarness: ContactDeliveryAdapter = async () => ({ok: false});
const allowWithoutIo: ContactAbuseAdapter = async () => 'allowed';
const rejectAbuseWithoutIo: ContactAbuseAdapter = async () => 'unavailable';

type ContactAdapters = {
  abuse: ContactAbuseAdapter;
  deliver: ContactDeliveryAdapter;
};

async function defaultContactAdapters(): Promise<ContactAdapters> {
  let requestHeaders: Awaited<ReturnType<typeof headers>>;
  try {
    requestHeaders = await headers();
  } catch {
    return {
      abuse: rejectAbuseWithoutIo,
      deliver: rejectUnverifiedBrowserHarness,
    };
  }

  const mode = resolveBrowserHarnessMode({
    enabled: process.env.PLAYWRIGHT_TEST,
    expectedToken: process.env.PLAYWRIGHT_TEST_TOKEN,
    requestToken: requestHeaders.get(BROWSER_HARNESS_HEADER),
  });

  if (mode === 'production') {
    return {
      abuse: async () => normalizeContactRateLimitResult(
        await checkRateLimit(CONTACT_RATE_LIMIT_ID, {headers: requestHeaders})
      ),
      deliver: deliverWithResend,
    };
  }

  return mode === 'verified'
    ? {abuse: allowWithoutIo, deliver: deliverWithoutIo}
    : {abuse: rejectAbuseWithoutIo, deliver: rejectUnverifiedBrowserHarness};
}

export async function sendContactEmail(
  _prevState: ContactActionState,
  formData: FormData,
  adapters?: ContactAdapters
): Promise<ContactActionState> {
  return submitContactAttempt(formData, adapters ?? await defaultContactAdapters());
}
