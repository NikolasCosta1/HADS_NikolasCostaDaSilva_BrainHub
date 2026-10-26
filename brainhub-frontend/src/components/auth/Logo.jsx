export default function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="currentColor" opacity=".18" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M16 16L8 9M16 16l8-7M16 16v9" />
      </g>
      <circle cx="16" cy="16" r="4" fill="currentColor" />
      <circle cx="8" cy="9" r="2.5" fill="currentColor" />
      <circle cx="24" cy="9" r="2.5" fill="currentColor" />
      <circle cx="16" cy="25" r="2.5" fill="currentColor" />
    </svg>
  );
}
