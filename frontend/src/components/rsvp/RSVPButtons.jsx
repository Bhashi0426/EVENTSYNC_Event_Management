import clsx from 'clsx';
import { Check, HelpCircle, X } from 'lucide-react';
import { RSVP_RESPONSES, RESPONSE_LABELS } from '../../utils/constants';

const ICONS = { going: Check, maybe: HelpCircle, not_going: X };
const ACTIVE = {
  going: 'bg-success text-white border-success',
  maybe: 'bg-warning text-white border-warning',
  not_going: 'bg-danger text-white border-danger',
};

export default function RSVPButtons({ value, onSelect, disabled, fullForGoing }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {RSVP_RESPONSES.map((r) => {
        const Icon = ICONS[r];
        const active = value === r;
        const blockGoing = r === 'going' && fullForGoing && !active;
        return (
          <button
            key={r}
            type="button"
            disabled={disabled || blockGoing}
            onClick={() => onSelect(r)}
            className={clsx(
              'flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              active ? ACTIVE[r] : 'bg-white border-line text-muted hover:border-primary hover:text-primary'
            )}
          >
            <Icon size={18} />
            {RESPONSE_LABELS[r]}
          </button>
        );
      })}
    </div>
  );
}
