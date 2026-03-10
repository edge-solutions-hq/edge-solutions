'use client';

import {useActionState, useEffect, useRef, type FormEvent} from 'react';
import {useTranslations} from 'next-intl';
import {trackConversionEvent} from '@/lib/analytics/events';
import type {ContactActionState} from './actions';
import {sendContactEmail} from './actions';
import {Button} from '@/components/ui/Button';

const initialState: ContactActionState = {status: 'idle'};

const inputBase =
  'mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-subtle-foreground focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

function FieldError({children}: {children?: string}) {
  if (!children) return null;
  return <div className="mt-1 text-xs text-red-600 dark:text-red-400">{children}</div>;
}

export function ContactForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(sendContactEmail, initialState);
  const lastSubmittedServiceRef = useRef<string | undefined>(undefined);
  const submissionAttemptRef = useRef(0);
  const trackedAttemptRef = useRef(0);

  useEffect(() => {
    if (pending) {
      return;
    }

    const currentAttempt = submissionAttemptRef.current;
    if (currentAttempt === 0 || currentAttempt <= trackedAttemptRef.current) {
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;
    const submittedService = lastSubmittedServiceRef.current;

    if (state.status === 'success') {
      trackConversionEvent('contact_form_success', {
        page_path: currentPath,
        service: submittedService,
        submit_attempt: currentAttempt,
      });
      trackedAttemptRef.current = currentAttempt;
      return;
    }

    if (state.status === 'error') {
      const fieldErrorCount = state.fieldErrors
        ? Object.values(state.fieldErrors).filter(Boolean).length
        : 0;
      const hasFieldErrors = fieldErrorCount > 0;

      trackConversionEvent('contact_form_error', {
        page_path: currentPath,
        service: submittedService,
        submit_attempt: currentAttempt,
        error_type: hasFieldErrors ? 'validation' : 'delivery',
        error_field_count: hasFieldErrors ? fieldErrorCount : undefined,
      });
      trackedAttemptRef.current = currentAttempt;
    }
  }, [pending, state.fieldErrors, state.status]);

  function handleSubmitCapture(event: FormEvent<HTMLFormElement>) {
    submissionAttemptRef.current += 1;

    const formData = new FormData(event.currentTarget);
    const service = formData.get('service');
    const normalizedService = typeof service === 'string' ? service : undefined;
    const currentPath = `${window.location.pathname}${window.location.search}`;

    lastSubmittedServiceRef.current = normalizedService;

    trackConversionEvent('contact_form_submit', {
      service: normalizedService,
      page_path: currentPath,
      submit_attempt: submissionAttemptRef.current,
    });
  }

  return (
    <form action={formAction} onSubmitCapture={handleSubmitCapture} className="space-y-5">
      {/* Honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">{t('contact.form.name')}</div>
          <input
            name="name"
            required
            minLength={2}
            className={inputBase + ' h-10'}
            placeholder={t('contact.form.namePlaceholder')}
          />
          <FieldError>{state.fieldErrors?.name}</FieldError>
        </label>

        <label className="block">
          <div className="text-sm font-medium">{t('contact.form.email')}</div>
          <input
            name="email"
            type="email"
            required
            className={inputBase + ' h-10'}
            placeholder={t('contact.form.emailPlaceholder')}
          />
          <FieldError>{state.fieldErrors?.email}</FieldError>
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">{t('contact.form.service')}</div>
        <select
          name="service"
          defaultValue="unsure"
          className={inputBase + ' h-10'}
        >
          <option value="web">{t('contact.form.service_web')}</option>
          <option value="realtime">{t('contact.form.service_realtime')}</option>
          <option value="unsure">{t('contact.form.service_unsure')}</option>
        </select>
        <FieldError>{state.fieldErrors?.service}</FieldError>
      </label>

      <label className="block">
        <div className="text-sm font-medium">{t('contact.form.message')}</div>
        <textarea
          name="message"
          required
          minLength={10}
          rows={7}
          className={inputBase + ' min-h-[8rem] resize-y'}
          placeholder={t('contact.form.messagePlaceholder')}
        />
        <FieldError>{state.fieldErrors?.message}</FieldError>
      </label>

      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? '...' : t('contact.form.submit')}
      </Button>

      {state.status === 'success' ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-100">
          {t('contact.form.success')}
        </div>
      ) : null}

      {state.status === 'error' && state.message ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-100">
          {state.message}
        </div>
      ) : null}
    </form>
  );
}

