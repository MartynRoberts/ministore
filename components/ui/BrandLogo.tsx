export function BrandLogo({
  size = "header",
  className = "",
}: {
  size?: "header" | "hero";
  className?: string;
}) {
  const miniSize = size === "hero" ? "text-base sm:text-lg" : "text-[0.72rem]";
  const storeSize = size === "hero" ? "text-[3.5rem] sm:text-[4.5rem]" : "text-[2.35rem]";
  const miniAlignment = size === "header" ? "self-center" : "pl-[0.12em]";

  return (
    <span aria-hidden="true" className={`inline-flex flex-col ${className}`}>
      <span className={`font-black leading-none tracking-[0.32em] ${miniSize} ${miniAlignment}`}>
        MINI
      </span>
      <span className={`-mt-[0.05em] font-light leading-[0.82] tracking-[0.01em] ${storeSize}`}>
        STORE
      </span>
    </span>
  );
}
