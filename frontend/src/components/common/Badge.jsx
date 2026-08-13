import clsx from 'clsx';

const TONES = {
  gray: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-50 text-primary',
  green: 'bg-green-50 text-success',
  amber: 'bg-amber-50 text-warning',
  red: 'bg-red-50 text-danger',
};

export default function Badge({ tone = 'gray', className = '', children }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone] || TONES.gray,
        className
      )}
    >
      {children}
    </span>
  );
}
