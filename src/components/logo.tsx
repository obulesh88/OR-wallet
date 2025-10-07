import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M29.5 6.5C28.5 8 24.5 10.5 22 11C19.5 11.5 18.5 11 17 10C15.5 9 13.5 8.5 11.5 9C9.5 9.5 6.5 12 5 13.5"
        stroke="#E5E7EB"
        strokeOpacity="0.5"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M9.52786 8.5C11.5 8 15 7.5 17 8.5C19 9.5 20.5 11.5 21 13.5C21.5 15.5 21.1667 18.8333 20.5 20.5C19.5 23 17.5 24.5 15.5 24.5C13.5 24.5 11.5 24 10.1944 22.5C8.87957 21.0026 8.5 18.5 8.5 16.5C8.5 14.5 8.71113 10 9.52786 8.5Z"
        fill="hsl(var(--primary))"
      />
      <path
        d="M21 13H24.5V24.5H21V13Z"
        fill="hsl(var(--primary))"
      />
    </svg>
  );
}
