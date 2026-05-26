import type { SVGProps } from "react";

export function TumLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" />
      {/* T letter */}
      <path
        d="M14 16h20M24 16v16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Circumflex accent (^) above T */}
      <path
        d="M21 13l3-3 3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Progress arc at bottom */}
      <path
        d="M10 36a16 16 0 0 0 28 0"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="14 8"
      />
    </svg>
  );
}
