/** Gao Architect logo: red circle with white 高 character */
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="50" cy="50" r="50" fill="#c0272d" />
      {/* Roof: two angled lines meeting at peak */}
      <polyline
        points="20,33 50,12 80,33"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Horizontal crossbar below roof */}
      <line x1="16" y1="40" x2="84" y2="40" stroke="white" strokeWidth="5" strokeLinecap="round" />
      {/* Vertical connector */}
      <line x1="50" y1="40" x2="50" y2="50" stroke="white" strokeWidth="5" strokeLinecap="round" />
      {/* Outer box */}
      <path
        d="M22,50 L78,50 L78,84 Q78,90 50,90 Q22,90 22,84 Z"
        stroke="white"
        strokeWidth="5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner horizontal bar inside box */}
      <line x1="22" y1="67" x2="78" y2="67" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
