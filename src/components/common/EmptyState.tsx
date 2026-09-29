import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon"><Inbox size={22} strokeWidth={1.8} /></span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}