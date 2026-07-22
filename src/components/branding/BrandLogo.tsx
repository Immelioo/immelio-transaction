import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  className?: string;
  framed?: boolean;
}

const sizes = {
  sm: { width: 132, height: 48 },
  md: { width: 172, height: 62 },
  lg: { width: 212, height: 76 },
} as const;

export default function BrandLogo({
  size = "md",
  priority = false,
  className = "",
  framed = true,
}: BrandLogoProps) {
  const dimensions = sizes[size];

  return (
    <div
      className={`inline-flex items-center ${
        framed
          ? "rounded-lg border border-black/5 bg-white/90 p-1.5 shadow-[0_12px_30px_rgba(5,28,20,0.08)]"
          : ""
      } ${className}`.trim()}
    >
      <Image
        src="/branding/immelio-logo.png"
        alt="Immelio Groupe Immobilier"
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        className="h-auto w-auto rounded-[6px]"
      />
    </div>
  );
}
