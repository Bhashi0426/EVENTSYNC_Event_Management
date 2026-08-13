import clsx from 'clsx';

export default function Input({ label, error, id, className = '', ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input id={id} className={clsx('input', error && 'border-danger focus:ring-danger/20', className)} {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
