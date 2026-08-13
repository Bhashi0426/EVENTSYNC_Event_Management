import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getPendingActions, enqueueAction, removeAction } from '../utils/offlineQueue';
import rsvpService from '../services/rsvpService';
import { useToast } from './ToastContext';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const toast = useToast();
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pending, setPending] = useState(getPendingActions());
  const syncing = useRef(false);

  const refreshPending = useCallback(() => setPending(getPendingActions()), []);

  /* Queue an RSVP taken while offline. */
  const queueRSVP = useCallback((eventId, response, eventTitle) => {
    const next = enqueueAction({ type: 'rsvp', eventId, response, eventTitle });
    setPending(next);
  }, []);

  /* Attempt to flush all pending actions to the server. */
  const sync = useCallback(async () => {
    if (syncing.current) return;
    const actions = getPendingActions();
    if (actions.length === 0) return;
    syncing.current = true;

    let synced = 0;
    let conflicts = 0;
    for (const action of actions) {
      try {
        if (action.type === 'rsvp') {
          await rsvpService.setRSVP(action.eventId, action.response);
        }
        removeAction(action.id);
        synced += 1;
      } catch (err) {
        const status = err.response && err.response.status;
        if (status === 409 || status === 400 || status === 404) {
          // Non-retryable (capacity/conflict/gone). Drop it and inform the user.
          removeAction(action.id);
          conflicts += 1;
        }
        // else keep it queued for the next attempt (network/500).
      }
    }

    syncing.current = false;
    setPending(getPendingActions());
    if (synced > 0) toast.success(`Synced ${synced} pending change${synced > 1 ? 's' : ''}.`);
    if (conflicts > 0) toast.error(`${conflicts} change${conflicts > 1 ? 's' : ''} could not be applied.`);
  }, [toast]);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      toast.info('Back online. Syncing changes…');
      sync();
    }
    function handleOffline() {
      setOnline(false);
      toast.info("You're offline. Changes will be saved locally.");
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sync, toast]);

  // Attempt a sync on mount if there is anything pending and we're online.
  useEffect(() => {
    if (online && getPendingActions().length > 0) sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = { online, pending, pendingCount: pending.length, queueRSVP, sync, refreshPending };
  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}

export default OfflineContext;
