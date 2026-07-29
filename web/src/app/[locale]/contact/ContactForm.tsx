'use client';

import {useActionState, useEffect, useId, useRef, type FormEvent} from 'react';
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
  type ContactFieldErrors,
  type ContactOfferValue,
} from '@/lib/contact/intake';
import type {ContactActionState} from './actions';
import {sendContactEmail} from './actions';
import {Button} from '@/components/ui/Button';

const initialState: ContactActionState = {status: 'idle'};

const inputBase =
  'mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-subtle-foreground focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

function FieldError({children, id}: {children?: string; id: string}) {
  if (!children) return null;
  return <div id={id} className="mt-1 text-xs text-red-600 dark:text-red-400">{children}</div>;
}

function isValidatableControl(
  element: Element | RadioNodeList | null
): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  );
}

function nativeValidationFieldErrors(form: HTMLFormElement): ContactFieldErrors {
  const fieldErrors: ContactFieldErrors = {};

  for (const fieldName of contactFormModel.fieldOrder) {
    const field = contactFormModel.fields[fieldName];
    const element = form.elements.namedItem(field.name);

    if (field.errorKey && isValidatableControl(element) && !element.validity.valid) {
      fieldErrors[fieldName] = field.errorKey;
    }
  }

  return fieldErrors;
}

export function ContactForm({
  preselectedService,
}: {
  preselectedService?: ContactOfferValue;
}) {
  const t = useTranslations();
  const formId = useId();
  const [state, formAction, pending] = useActionState(sendContactEmail, initialState);
  const attemptTrackerRef = useRef(createContactAttemptTrackerState());
  const invalidTrackingQueuedRef = useRef(false);
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

  function handleInvalidCapture(event: FormEvent<HTMLFormElement>) {
    if (invalidTrackingQueuedRef.current) return;

    invalidTrackingQueuedRef.current = true;
    window.setTimeout(() => {
      invalidTrackingQueuedRef.current = false;
    }, 0);

    const submitAttempt = captureContactSubmitAttempt(attemptTrackerRef.current);
    const formData = new FormData(event.currentTarget);
    const normalizedService = extractContactSubmitService(formData);
    const fieldErrors = nativeValidationFieldErrors(event.currentTarget);

    trackContactFormSubmit({
      service: normalizedService,
      submitAttempt,
    });

    trackContactFormOutcome({
      outcome: {
        kind: 'validation_error',
        service: normalizedService,
        fieldErrors,
      },
      submitAttempt,
    });
  }

  function fieldErrorMessage(messageKey?: string) {
    return messageKey ? t(messageKey) : undefined;
  }

  function fieldErrorId(field: keyof ContactFieldErrors) {
    return `${formId}-${field}-error`;
  }

  return (
    <form
      action={formAction}
      onInvalidCapture={handleInvalidCapture}
      onSubmitCapture={handleSubmitCapture}
      className="space-y-5"
    >
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
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={state.fieldErrors?.name ? fieldErrorId('name') : undefined}
            className={inputBase + ' h-10'}
            placeholder={t(fields.name.placeholderKey)}
          />
          <FieldError id={fieldErrorId('name')}>{fieldErrorMessage(state.fieldErrors?.name)}</FieldError>
        </label>

        <label className="block">
          <div className="text-sm font-medium">{t(fields.email.labelKey)}</div>
          <input
            name={fields.email.name}
            type={fields.email.type}
            required={fields.email.required}
            maxLength={fields.email.maxLength}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? fieldErrorId('email') : undefined}
            className={inputBase + ' h-10'}
            placeholder={t(fields.email.placeholderKey)}
          />
          <FieldError id={fieldErrorId('email')}>{fieldErrorMessage(state.fieldErrors?.email)}</FieldError>
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">{t(fields.service.labelKey)}</div>
        <select
          ref={serviceSelectRef}
          name={fields.service.name}
          defaultValue={fields.service.defaultValue}
          aria-invalid={Boolean(state.fieldErrors?.service)}
          aria-describedby={state.fieldErrors?.service ? fieldErrorId('service') : undefined}
          className={inputBase + ' h-10'}
        >
          {contactOfferOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.messageKey)}
            </option>
          ))}
        </select>
        <FieldError id={fieldErrorId('service')}>{fieldErrorMessage(state.fieldErrors?.service)}</FieldError>
      </label>

      <label className="block">
        <div className="text-sm font-medium">{t(fields.message.labelKey)}</div>
        <textarea
          name={fields.message.name}
          required={fields.message.required}
          minLength={fields.message.minLength}
          maxLength={fields.message.maxLength}
          rows={fields.message.rows}
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? fieldErrorId('message') : undefined}
          className={inputBase + ' min-h-[8rem] resize-y'}
          placeholder={t(fields.message.placeholderKey)}
        />
        <FieldError id={fieldErrorId('message')}>{fieldErrorMessage(state.fieldErrors?.message)}</FieldError>
      </label>

      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? contactFormModel.pendingLabel : t(contactFormModel.submitMessageKey)}
      </Button>

      {feedback.kind === 'success' ? (
        <div role="status" aria-live="polite" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-100">
          {t(feedback.messageKey)}
        </div>
      ) : null}

      {feedback.kind === 'error' && (feedback.messageKey || feedback.fallbackMessage) ? (
        <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-100">
          {feedback.messageKey ? t(feedback.messageKey) : feedback.fallbackMessage}
        </div>
      ) : null}
    </form>
  );
}
