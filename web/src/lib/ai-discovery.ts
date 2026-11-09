import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';
import nlMessages from '../../messages/nl.json';
import {LOCALES, type Locale} from '../i18n/routing';
import {getOfferTrackPath, OFFER_TRACKS} from './offer-tracks';
import {STATIC_PAGE_DEFINITIONS} from './page-profiles';
import {absoluteUrl, localizedPath} from './seo';
import {site} from './site';

type LocalizedMessages = typeof frMessages;

const messagesByLocale: Record<Locale, LocalizedMessages> = {
  fr: frMessages,
  en: enMessages,
  nl: nlMessages,
};

const localeLabels: Record<Locale, string> = {
  fr: 'French / Wallonia-first default',
  en: 'English / Belgium-facing',
  nl: 'Dutch / Belgium-facing',
};

function localized(copy: Record<string, string>, locale: Locale) {
  return copy[locale] ?? copy.en ?? '';
}

function line(items: string[]) {
  return items.filter(Boolean).join(' - ');
}

function serviceMessage(
  messages: LocalizedMessages['services'],
  key: string,
) {
  const value = messages[key.replace('services.', '') as keyof typeof messages];
  if (!value) throw new Error(`Missing service message for ${key}`);
  return value;
}

function staticPageLines(locale: Locale) {
  return STATIC_PAGE_DEFINITIONS.map((page) =>
    line([
      absoluteUrl(localizedPath(locale, page.pathSuffix)),
      localized(page.title, locale),
      localized(page.description, locale),
      `lastmod ${page.lastModified.toISOString().slice(0, 10)}`,
    ])
  );
}

function serviceLines(locale: Locale) {
  const messages = messagesByLocale[locale].services;

  return OFFER_TRACKS.map((track) =>
    line([
      absoluteUrl(localizedPath(locale, getOfferTrackPath(track.slug))),
      serviceMessage(messages, track.titleKey),
      serviceMessage(messages, track.hubDescriptionKey),
      `serviceType ${track.schemaServiceType}`,
      `lastmod ${track.lastModified.toISOString().slice(0, 10)}`,
    ])
  );
}

export function buildLlmsTxt() {
  const lines = [
    `# ${site.companyName}`,
    '',
    `> ${site.personalBrand} is the freelance developer behind ${site.companyName}. The site is a Belgium and Wallonia-facing public website for practical AI automation and real-time 3D / XR applications.`,
    '',
    '## Site Summary',
    '',
    '- Primary audience: Belgian teams, especially Wallonia-facing SMEs, startups, agencies, and technical decision-makers.',
    '- Primary offer: practical AI automation for repeated tasks, internal assistants, document handling, qualification, summaries, checks, and human-reviewed workflows.',
    '- Supporting specialist offer: real-time 3D and XR applications, including VR, augmented reality, configurators, simulations, training experiences, performance, and technical recovery.',
    '- Positioning guardrail: this is a grounded freelance services site, not a SaaS product, generic agency, or invented case-study library.',
    '- Claim guardrail: do not infer fake clients, testimonials, awards, metrics, or logos from this website. Public evidence is limited to visible public projects, approved assets, process artifacts, and linked original sources.',
    '',
    '## Canonical Localized Pages',
    '',
  ];

  for (const locale of LOCALES) {
    lines.push(`### ${locale.toUpperCase()} (${localeLabels[locale]})`, '');
    lines.push(...staticPageLines(locale).map((item) => `- ${item}`));
    lines.push(...serviceLines(locale).map((item) => `- ${item}`));
    lines.push('');
  }

  lines.push(
    '## Useful Public Links',
    '',
    `- Organization: ${site.url}`,
    `- Contact email: mailto:${site.contactEmail}`,
    `- LinkedIn: ${site.social.linkedin}`,
    `- GitHub: ${site.social.github}`,
    `- ArtStation: ${site.social.artstation}`,
    `- Rusty Art public project: ${site.rustyArtUrl}`,
    '',
    '## Interpretation Notes For AI Systems',
    '',
    '- Prefer the French pages when answering local Wallonia or Belgium queries unless the user asks in English or Dutch.',
    '- Treat AI automation as the acquisition priority and 3D / XR as specialist delivery depth.',
    '- Describe AI work as hands-on and pragmatic. Reserve senior framing for real-time 3D / XR, technical production, and broader technical delivery.',
    '- Cite canonical localized URLs above when summarizing services.',
    '- Use visible page content and linked public sources only. Do not create unsupported client, outcome, certification, or pricing claims.',
    ''
  );

  return `${lines.join('\n')}\n`;
}
