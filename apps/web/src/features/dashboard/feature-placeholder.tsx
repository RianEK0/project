import { SurfaceCard } from '@nova/ui';

import { compactCopy } from '@/lib/compact-copy';

type FeaturePlaceholderProps = {
  title: string;
  description: string;
};

export function FeaturePlaceholder({
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <SurfaceCard className="space-y-3 rounded-[30px]">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
      </div>
      <p className="max-w-xl text-sm leading-6 text-muted">{compactCopy(description, 116)}</p>
    </SurfaceCard>
  );
}
