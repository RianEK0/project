type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeaderProps) {
  const alignment = align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl';

  return (
    <div className={alignment}>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/70">
        <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_16px_var(--accent)]" />
        {eyebrow}
      </div>
      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-[3rem]">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{description}</p>
    </div>
  );
}
