import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Calendar } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.email) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="grid flex-1 lg:grid-cols-2">
        {/* Image panel */}
        <div className="relative hidden overflow-hidden lg:flex bg-slate-900">
          <img
            src="/logreg.png"
            alt="EventSync login illustration"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
          <div className="relative z-10 flex flex-col justify-start p-12 pt-16 text-white">
            <div className="max-w-md">
              <h1 className="text-3xl font-bold leading-tight">Real-time event & RSVP management</h1>
              <p className="mt-6 leading-relaxed text-white/80">
                Discover events, RSVP in a click, and keep every attendee in sync — live.
              </p>
              {/* <p className="mt-4 leading-relaxed text-white/80">
                Plan smarter with instant updates, attendee tracking, and seamless coordination for every event.
              </p> */}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <img src="/EventSync_horizontal_logo.svg" alt="EventSync logo" className="w-auto h-40" />
            </div>

            <h2 className="text-2xl font-bold text-ink">Sign in</h2>
            <p className="mt-1 text-sm text-muted">Welcome back. Please enter your details.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />
              <div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    error={errors.password}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-9 text-muted hover:text-ink"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => toast.info('Please contact an administrator to reset your password.')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full">
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-sm text-center text-muted">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Register
              </Link>
            </p>

            <div className="p-4 mt-8 text-xs bg-white border rounded-lg border-line text-muted">
              <p className="mb-1 font-medium text-ink">Demo accounts (dev only)</p>
              <p>admin@eventsync.com · organizer@eventsync.com · participant@eventsync.com</p>
              <p className="mt-1">Password: Password123!</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
