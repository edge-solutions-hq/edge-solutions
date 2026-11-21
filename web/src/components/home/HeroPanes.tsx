import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

export function HeroPanes({
  aiLabel,
  realtimeLabel,
  className,
}: {
  aiLabel: string;
  realtimeLabel: string;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-rows-2 divide-y divide-border', className)} aria-hidden="true">
      <Pane index="1" label={aiLabel} accentClass="text-syn-green">
        <svg viewBox="0 0 300 130" className="h-full w-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <Connectors />
          <SourceDocuments />
          <Rules />
          <LanguageModelNode />
          <HumanReview />
          <Output />
        </svg>
      </Pane>

      <Pane index="2" label={realtimeLabel} accentClass="text-syn-cyan">
        <svg viewBox="0 0 300 130" className="h-full w-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <FloorGrid />
          <Orbit />
          <Cube />
          <Axes />
          <HeadsetHint />
        </svg>
      </Pane>
    </div>
  );
}

function Pane({
  index,
  label,
  accentClass,
  children,
}: {
  index: string;
  label: string;
  accentClass: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-2 font-mono text-xs text-muted-foreground">
        <span className={cn('font-bold', accentClass)}>{index}</span>
        <span className="truncate">{label}</span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5 py-4">{children}</div>
    </div>
  );
}

function Connectors() {
  return (
    <g stroke="var(--border-strong)" strokeWidth="1.4" className="flow-dash">
      <path d="M62 65h34" />
      <path d="M140 65h30" />
      <path d="M214 52l28-20" />
      <path d="M214 78l28 20" />
    </g>
  );
}

function SourceDocuments() {
  return (
    <g stroke="var(--muted-foreground)" strokeWidth="1.4">
      <rect x="22" y="40" width="34" height="44" rx="3" fill="var(--surface)" />
      <path d="M30 52h18M30 60h18M30 68h11" />
      <rect x="14" y="48" width="34" height="44" rx="3" fill="var(--surface)" />
      <path d="M22 60h18M22 68h18M22 76h11" />
    </g>
  );
}

function Rules() {
  return (
    <g stroke="var(--syn-cyan)" strokeWidth="1.4">
      <rect x="98" y="47" width="40" height="36" rx="4" fill="var(--surface)" />
      <path d="M108 59h20M108 65h20M108 71h12" />
    </g>
  );
}

function LanguageModelNode() {
  return (
    <g stroke="var(--syn-green)" strokeWidth="1.6">
      <path d="M192 41l22 24-22 24-22-24 22-24Z" fill="var(--surface)" />
      <circle cx="192" cy="65" r="5" fill="var(--syn-green)" stroke="none" />
      <path d="M192 52v5M192 73v5M179 65h5M200 65h5" />
    </g>
  );
}

function HumanReview() {
  return (
    <g stroke="var(--primary)" strokeWidth="1.6">
      <rect x="244" y="12" width="42" height="34" rx="4" fill="var(--surface)" />
      <circle cx="259" cy="25" r="4" />
      <path d="M252 38c1.5-5 12.5-5 14 0" />
      <path d="m271 29 3 3 6-7" />
    </g>
  );
}

function Output() {
  return (
    <g stroke="var(--muted-foreground)" strokeWidth="1.4">
      <rect x="244" y="84" width="42" height="34" rx="4" fill="var(--surface)" />
      <path d="M253 96h24M253 103h24M253 110h14" />
    </g>
  );
}

function FloorGrid() {
  return (
    <g stroke="var(--border)" strokeWidth="1">
      <path d="M30 104 150 126 270 104 150 82Z" />
      <path d="M70 96.7 190 118.7M110 89.3 230 111.3M90 115 210 93M190 89.3 70 111.3" />
    </g>
  );
}

function Orbit() {
  return (
    <ellipse cx="150" cy="62" rx="112" ry="26" stroke="var(--border-strong)" strokeWidth="1.2" className="flow-dash" />
  );
}

function Cube() {
  return (
    <>
      <g strokeWidth="1.6" stroke="var(--syn-cyan)">
        <path d="M150 18 196 40 150 62 104 40Z" fill="var(--surface)" />
        <path d="M104 40v48l46 22V62Z" fill="var(--surface)" />
        <path d="M196 40v48l-46 22V62Z" fill="var(--surface-muted)" />
      </g>
      <g strokeWidth="1.2" stroke="var(--syn-cyan)" opacity="0.55">
        <path d="M127 29v48M173 29v48M127 51l46 22M173 51l-46 22M104 64l46 22 46-22" />
      </g>
    </>
  );
}

function Axes() {
  return (
    <>
      <g strokeWidth="1.8">
        <path d="M150 62l36 17" stroke="var(--syn-red)" />
        <path d="M150 62V24" stroke="var(--syn-green)" />
        <path d="M150 62l-36 17" stroke="var(--syn-blue)" />
      </g>
      <circle cx="150" cy="62" r="3.5" fill="var(--primary)" />
    </>
  );
}

function HeadsetHint() {
  return (
    <g stroke="var(--primary)" strokeWidth="1.6">
      <rect x="246" y="50" width="30" height="16" rx="5" fill="var(--surface)" />
      <path d="M254 58h14" />
    </g>
  );
}
