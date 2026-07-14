'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <Icon className="w-16 h-16 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        {action && (
          <Link
            href={action.href}
            className="inline-block bg-[#00c2a9] hover:bg-[#00a892] dark:bg-[#00c2a9] dark:hover:bg-[#00a892] text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
