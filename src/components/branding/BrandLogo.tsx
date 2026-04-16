import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  label?: string;
  showText?: boolean;
}

const BrandLogo = ({
  className,
  iconClassName,
  textClassName,
  label = "CALLFLOW",
  showText = true,
}: BrandLogoProps) => {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        className={cn("h-7 w-7", iconClassName)}
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path
          d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"
          stroke="black"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      {showText ? (
        <span className={cn("uppercase tracking-wide", textClassName)}>
          {label}
        </span>
      ) : null}
    </span>
  );
};

export default BrandLogo;
