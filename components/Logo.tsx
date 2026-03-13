/** Gao Architect logo: red circle with white architectural symbol (roof, structure, base) */
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="60" cy="60" r="58" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="60" cy="60" r="54" fill="#b91c1c" />
      {/* Roof */}
      <path d="M60 20 L78 42 L60 36 L42 42 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      {/* Vertical sides + center peak */}
      <path d="M42 42 L42 58 M78 42 L78 58 M60 42 L60 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Middle crossbar */}
      <path d="M42 58 L78 58" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Lower verticals */}
      <path d="M42 58 L42 72 M78 58 L78 72" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Rounded base */}
      <path d="M42 72 Q42 92 60 92 Q78 92 78 72" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Inner rounded element */}
      <path d="M52 78 Q52 88 60 88 Q68 88 68 78" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
