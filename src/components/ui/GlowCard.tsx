export function GlowCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative rounded-[10px] border border-paper/10 bg-ink-raised p-8 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-lumen/40 hover:shadow-[0_0_60px_-24px_rgba(222,168,47,0.7)] ${className}`}
    >
      {children}
    </div>
  );
}
