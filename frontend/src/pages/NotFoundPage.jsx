import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-background">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold text-ink mt-4">Page not found</h1>
      <p className="text-muted text-sm mt-1 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn-primary mt-6">
        Back to Dashboard
      </Link>
    </div>
  );
}
