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
      <circle cx="16" cy="16" r="16" fill="hsl(var(--primary))" />
      <path
        d="M20.5 10C18.4284 10 16.5366 10.9333 15.25 12.5V10H13.25V22H15.25V19.5C16.5366 21.0667 18.4284 22 20.5 22C23.5376 22 26 19.3137 26 16C26 12.6863 23.5376 10 20.5 10ZM20.5 20C18.291 20 16.5 18.2091 16.5 16C16.5 13.7909 18.291 12 20.5 12C22.709 12 24.5 13.7909 24.5 16C24.5 18.2091 22.709 20 20.5 20Z"
        fill="hsl(var(--primary-foreground))"
      />
    </svg>
  );
}
