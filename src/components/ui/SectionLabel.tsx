export function SectionLabel({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""} ${className}`}
    >
      <span className="h-px w-6 bg-lumen/60" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}
