import Link from "next/link";

type BrandSignatureProps = {
  className?: string;
  onClick?: () => void;
  showDescriptor?: boolean;
};

export function BrandSignature({
  className = "",
  onClick,
  showDescriptor = true,
}: BrandSignatureProps) {
  return (
    <Link
      href="/"
      aria-label="APRISM home"
      className={`inline-flex items-center gap-3 ${className}`}
      onClick={onClick}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 46 52"
        className="h-10 w-9 shrink-0 text-[#c6a46a]"
        fill="none"
      >
        <path d="M4 47 23 5l19 42" stroke="currentColor" strokeWidth="2.2" />
        <path d="m11 47 12-27 12 27M9 36l14-10 14 10" stroke="currentColor" strokeWidth="1.35" />
      </svg>
      <span className="flex flex-col">
        <span className="font-serif text-[1.72rem] leading-none tracking-[0.2em] text-white">APRISM</span>
        {showDescriptor ? (
          <span className="mt-1 text-[0.42rem] font-semibold uppercase tracking-[0.3em] text-[#cdb17d]">
            Luxury Asset Stewardship
          </span>
        ) : null}
      </span>
    </Link>
  );
}
