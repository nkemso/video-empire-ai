import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="text-center py-20">
      <Icon className="w-16 h-16 text-empire-gold/50 mx-auto mb-4" />
      <h3 className="text-2xl font-display font-bold mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="glow-button inline-flex">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
