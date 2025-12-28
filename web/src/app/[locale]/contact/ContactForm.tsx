'use client';

import {useActionState} from 'react';
import {useTranslations} from 'next-intl';
import type {ContactActionState} from './actions';
import {sendContactEmail} from './actions';

const initialState: ContactActionState = {status: 'idle'};

function FieldError({children}: {children?: string}) {
  if (!children) return null;
  return <div className="mt-1 text-xs text-red-600 dark:text-red-400">{children}</div>;
}

export function ContactForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(sendContactEmail, initialState);

  return (
    <form action={formAction} className="space-y-5">
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
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/30 dark:border-white/10 dark:bg-black dark:focus:border-white/30"
            placeholder="Gil Guminski"
          />
          <FieldError>{state.fieldErrors?.name}</FieldError>
        </label>

        <label className="block">
          <div className="text-sm font-medium">{t('contact.form.email')}</div>
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/30 dark:border-white/10 dark:bg-black dark:focus:border-white/30"
            placeholder="vous@exemple.com"
          />
          <FieldError>{state.fieldErrors?.email}</FieldError>
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">{t('contact.form.service')}</div>
        <select
          name="service"
          defaultValue="unsure"
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/30 dark:border-white/10 dark:bg-black dark:focus:border-white/30"
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
          className="mt-2 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/30 dark:border-white/10 dark:bg-black dark:focus:border-white/30"
          placeholder="Contexte, objectifs, contraintes, délais..."
        />
        <FieldError>{state.fieldErrors?.message}</FieldError>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        {pending ? '...' : t('contact.form.submit')}
      </button>

      {state.status === 'success' ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-100">
          {t('contact.form.success')}
        </div>
      ) : null}

      {state.status === 'error' && state.message ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-100">
          {state.message}
        </div>
      ) : null}
    </form>
  );
}


