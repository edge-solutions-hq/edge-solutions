'use client';

import {useActionState, useEffect, useRef, type FormEvent} from 'react';
import {useTranslations} from 'next-intl';
import {
  trackContactFormOutcome,
  trackContactFormSubmit,
} from '@/lib/analytics/events';
import {
  captureContactSubmitAttempt,
  createContactAttemptTrackerState,
  resolveContactAttemptCompletion,
} from '@/lib/contact/contact-attempt-tracker';
import {
  contactFormModel,
  extractContactSubmitService,
  resolveContactFeedback,
  resolveContactServiceSearchParam,
  type ContactOfferValue,
} from '@/lib/contact/intake';
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

export function ContactForm({
  preselectedService,
}: {
  preselectedService?: ContactOfferValue;
}) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(sendContactEmail, initialState);
  const attemptTrackerRef = useRef(createContactAttemptTrackerState());
  const serviceSelectRef = useRef<HTMLSelectElement>(null);
  const {fields, offerOptions: contactOfferOptions} = contactFormModel;
  const feedback = resolveContactFeedback(state);

  useEffect(() => {
    const selectedService =
      preselectedService ??
      resolveContactServiceSearchParam(
        new URLSearchParams(window.location.search).get(fields.service.name)
      );

    if (selectedService && serviceSelectRef.current) {
      serviceSelectRef.current.value = selectedService;
    }
  }, [fields.service.name, preselectedService]);

  useEffect(() => {
    const completion = resolveContactAttemptCompletion({
      state: attemptTrackerRef.current,
      pending,
      outcome: state.outcome,
    });

    if (completion?.shouldTrack) {
      trackContactFormOutcome({
        outcome: completion.outcome,
        submitAttempt: completion.submitAttempt,
      });
    }
  }, [pending, state.outcome]);

  function handleSubmitCapture(event: FormEvent<HTMLFormElement>) {
    const submitAttempt = captureContactSubmitAttempt(attemptTrackerRef.current);

    const formData = new FormData(event.currentTarget);
    const normalizedService = extractContactSubmitService(formData);

    trackContactFormSubmit({
      service: normalizedService,
      submitAttempt,
    });
  }

  function fieldErrorMessage(messageKey?: string) {
    return messageKey ? t(messageKey) : undefined;
  }

  return (
    <form action={formAction} onSubmitCapture={handleSubmitCapture} className="space-y-5">
      {/* Honeypot */}
      <input
        type={fields.honeypot.type}
        name={fields.honeypot.name}
        tabIndex={-1}
        autoComplete={fields.honeypot.autocomplete}
        className="hidden"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">{t(fields.name.labelKey)}</div>
          <input
            name={fields.name.name}
            type={fields.name.type}
            required={fields.name.required}
            minLength={fields.name.minLength}
            maxLength={fields.name.maxLength}
            className={inputBase + ' h-10'}
            placeholder={t(fields.name.placeholderKey)}
          />
          <FieldError>{fieldErrorMessage(state.fieldErrors?.name)}</FieldError>
        </label>

        <label className="block">
          <div className="text-sm font-medium">{t(fields.email.labelKey)}</div>
          <input
            name={fields.email.name}
            type={fields.email.type}
            required={fields.email.required}
            maxLength={fields.email.maxLength}
            className={inputBase + ' h-10'}
            placeholder={t(fields.email.placeholderKey)}
          />
          <FieldError>{fieldErrorMessage(state.fieldErrors?.email)}</FieldError>
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">{t(fields.service.labelKey)}</div>
        <select
          ref={serviceSelectRef}
          name={fields.service.name}
          defaultValue={fields.service.defaultValue}
          className={inputBase + ' h-10'}
        >
          {contactOfferOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.messageKey)}
            </option>
          ))}
        </select>
        <FieldError>{fieldErrorMessage(state.fieldErrors?.service)}</FieldError>
      </label>

      <label className="block">
        <div className="text-sm font-medium">{t(fields.message.labelKey)}</div>
        <textarea
          name={fields.message.name}
          required={fields.message.required}
          minLength={fields.message.minLength}
          maxLength={fields.message.maxLength}
          rows={fields.message.rows}
          className={inputBase + ' min-h-[8rem] resize-y'}
          placeholder={t(fields.message.placeholderKey)}
        />
        <FieldError>{fieldErrorMessage(state.fieldErrors?.message)}</FieldError>
      </label>

      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? contactFormModel.pendingLabel : t(contactFormModel.submitMessageKey)}
      </Button>

      {feedback.kind === 'success' ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-100">
          {t(feedback.messageKey)}
        </div>
      ) : null}

      {feedback.kind === 'error' && (feedback.messageKey || feedback.fallbackMessage) ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-100">
          {feedback.messageKey ? t(feedback.messageKey) : feedback.fallbackMessage}
        </div>
      ) : null}
    </form>
  );
}
