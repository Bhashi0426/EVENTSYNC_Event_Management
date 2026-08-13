import { PENDING_KEY } from './constants';

/**
 * A tiny persistent queue for actions taken while offline (e.g. RSVPs).
 * Stored in localStorage so it survives refreshes and brief network loss.
 */
export function getPendingActions() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function save(actions) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(actions));
}

export function enqueueAction(action) {
  const actions = getPendingActions();
  // For RSVPs, collapse duplicates per event (keep only latest intent).
  const filtered =
    action.type === 'rsvp'
      ? actions.filter((a) => !(a.type === 'rsvp' && a.eventId === action.eventId))
      : actions;
  filtered.push({ ...action, id: `${Date.now()}-${Math.random()}`, queuedAt: Date.now() });
  save(filtered);
  return filtered;
}

export function removeAction(id) {
  const actions = getPendingActions().filter((a) => a.id !== id);
  save(actions);
  return actions;
}

export function clearActions() {
  save([]);
}
