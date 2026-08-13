import { WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

export default function OfflineIndicator() {
  const { online, pendingCount } = useOffline();

  if (online && pendingCount === 0) return null;

  return (
    <div
      className={`px-4 py-2 text-sm flex items-center justify-center gap-2 ${
        online ? 'bg-amber-50 text-warning' : 'bg-slate-800 text-white'
      }`}
    >
      {online ? (
        <>
          <RefreshCw size={15} className="animate-spin" />
          <span>
            Syncing {pendingCount} pending change{pendingCount > 1 ? 's' : ''}…
          </span>
        </>
      ) : (
        <>
          <WifiOff size={15} />
          <span>
            You&apos;re offline.
            {pendingCount > 0 && ` ${pendingCount} change${pendingCount > 1 ? 's' : ''} will sync when you reconnect.`}
          </span>
        </>
      )}
    </div>
  );
}
