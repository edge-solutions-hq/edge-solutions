type LogoMarkProps = {
  className?: string;
};

export function LogoMark({className}: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={40}
      strokeLinejoin="miter"
    >
      <polygon points="256,48 436,152 436,360 256,464 76,360 76,152" />
      <line x1="256" y1="256" x2="436" y2="152" strokeLinecap="butt" />
    </svg>
  );
}
