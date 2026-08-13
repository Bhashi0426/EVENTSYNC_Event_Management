import clsx from 'clsx';

export default function Textarea({ label, error, id, rows = 4, className = '', ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={clsx('input resize-y', error && 'border-danger', className)}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
