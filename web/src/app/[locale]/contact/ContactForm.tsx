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
  'mt-2 w-full rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-subtle-foreground hover:border-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none';

function FieldError({children, id}: {children?: string; id: string}) {
  if (!children) return null;
  return <div id={id} className="mt-1.5 font-mono text-xs text-syn-red">{children}</div>;
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
  const fieldErrors: ContactFieldErrors = feedback.kind === 'error' ? feedback.fieldErrors : {};
  const outcome = state.status === 'idle' ? undefined : state.outcome;

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
      outcome,
    });

    if (completion?.shouldTrack) {
      trackContactFormOutcome({
        outcome: completion.outcome,
        submitAttempt: completion.submitAttempt,
      });
    }
  }, [pending, outcome]);

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
    const nativeFieldErrors = nativeValidationFieldErrors(event.currentTarget);

    trackContactFormSubmit({
      service: normalizedService,
      submitAttempt,
    });

    trackContactFormOutcome({
      outcome: {
        kind: 'validation_error',
        service: normalizedService,
        fieldErrors: nativeFieldErrors,
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

  function fieldControlId(field: keyof ContactFieldErrors) {
    return `${formId}-${field}`;
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
        <div>
          <label htmlFor={fieldControlId('name')} className="block font-mono text-xs font-bold text-syn-cyan">
            {t(fields.name.labelKey)}
          </label>
          <input
            id={fieldControlId('name')}
            name={fields.name.name}
            type={fields.name.type}
            required={fields.name.required}
            minLength={fields.name.minLength}
            maxLength={fields.name.maxLength}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? fieldErrorId('name') : undefined}
            className={inputBase + ' h-11'}
            placeholder={t(fields.name.placeholderKey)}
          />
          <FieldError id={fieldErrorId('name')}>{fieldErrorMessage(fieldErrors.name)}</FieldError>
        </div>

        <div>
          <label htmlFor={fieldControlId('email')} className="block font-mono text-xs font-bold text-syn-cyan">
            {t(fields.email.labelKey)}
          </label>
          <input
            id={fieldControlId('email')}
            name={fields.email.name}
            type={fields.email.type}
            required={fields.email.required}
            maxLength={fields.email.maxLength}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? fieldErrorId('email') : undefined}
            className={inputBase + ' h-11'}
            placeholder={t(fields.email.placeholderKey)}
          />
          <FieldError id={fieldErrorId('email')}>{fieldErrorMessage(fieldErrors.email)}</FieldError>
        </div>
      </div>

      <div>
        <label htmlFor={fieldControlId('service')} className="block font-mono text-xs font-bold text-syn-cyan">
          {t(fields.service.labelKey)}
        </label>
        <select
          id={fieldControlId('service')}
          ref={serviceSelectRef}
          name={fields.service.name}
          defaultValue={fields.service.defaultValue}
          aria-invalid={Boolean(fieldErrors.service)}
          aria-describedby={fieldErrors.service ? fieldErrorId('service') : undefined}
          className={inputBase + ' h-11'}
        >
          {contactOfferOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.messageKey)}
            </option>
          ))}
        </select>
        <FieldError id={fieldErrorId('service')}>{fieldErrorMessage(fieldErrors.service)}</FieldError>
      </div>

      <div>
        <label htmlFor={fieldControlId('message')} className="block font-mono text-xs font-bold text-syn-cyan">
          {t(fields.message.labelKey)}
        </label>
        <textarea
          id={fieldControlId('message')}
          name={fields.message.name}
          required={fields.message.required}
          minLength={fields.message.minLength}
          maxLength={fields.message.maxLength}
          rows={fields.message.rows}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? fieldErrorId('message') : undefined}
          className={inputBase + ' min-h-[8rem] resize-y'}
          placeholder={t(fields.message.placeholderKey)}
        />
        <FieldError id={fieldErrorId('message')}>{fieldErrorMessage(fieldErrors.message)}</FieldError>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
      >
        {pending ? contactFormModel.pendingLabel : t(contactFormModel.submitMessageKey)}
      </Button>

      {feedback.kind === 'success' ? (
        <div role="status" aria-live="polite" className="rounded-md border border-syn-green/50 bg-syn-green/10 p-4 text-sm text-syn-green">
          {t(feedback.messageKey)}
        </div>
      ) : null}

      {feedback.kind === 'error' ? (
        <div role="alert" className="rounded-md border border-syn-red/50 bg-syn-red/10 p-4 text-sm text-syn-red">
          {t(feedback.messageKey)}
        </div>
      ) : null}
    </form>
  );
}
