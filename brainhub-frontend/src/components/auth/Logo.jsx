export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bhLogoGradGlobal" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0066FF" />
          <stop offset="0.5" stopColor="#2563EB" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="bhGlowOrangeGlobal" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#FB923C" />
        </linearGradient>
      </defs>

      {/* Base Squircle Glass */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="13"
        fill="#0D162C"
        stroke="rgba(59, 130, 246, 0.4)"
        strokeWidth="1.5"
      />

      {/* Linhas de Sinapse / Circuitos Neurais */}
      <g stroke="url(#bhLogoGradGlobal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 13V24M24 24L15 17M24 24L33 17M24 24L16 32M24 24L32 32M24 24V35" opacity="0.85" />
        <path d="M15 15C12 17 11 20 11 24C11 28 13 31 16 33" strokeDasharray="1 2" opacity="0.6" />
        <path d="M33 15C36 17 37 20 37 24C37 28 35 31 32 33" strokeDasharray="1 2" opacity="0.6" />
      </g>

      {/* Núcleo Central */}
      <circle cx="24" cy="24" r="4.5" fill="#38BDF8" />
      <circle cx="24" cy="24" r="2" fill="#FFFFFF" />

      {/* Nódulos em Laranja */}
      <circle cx="15" cy="17" r="2.8" fill="url(#bhGlowOrangeGlobal)" />
      <circle cx="33" cy="17" r="2.8" fill="url(#bhGlowOrangeGlobal)" />
      <circle cx="24" cy="13" r="2.4" fill="#60A5FA" />
      <circle cx="16" cy="32" r="2.6" fill="#38BDF8" />
      <circle cx="32" cy="32" r="2.6" fill="url(#bhGlowOrangeGlobal)" />
      <circle cx="24" cy="35" r="2.4" fill="#60A5FA" />
    </svg>
  );
}
