export function Callout({children}: {children: React.ReactNode}) {
  return (
    <div className="not-prose rounded-2xl border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}


