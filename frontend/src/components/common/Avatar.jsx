import clsx from 'clsx';
import { initials } from '../../utils/format';

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' };

export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx('rounded-full object-cover border border-line', SIZES[size], className)}
      />
    );
  }
  return (
    <div
      className={clsx(
        'rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0',
        SIZES[size],
        className
      )}
    >
      {initials(name) || '?'}
    </div>
  );
}
