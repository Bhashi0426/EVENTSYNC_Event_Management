import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 24, className = '', label }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-muted ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
