import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Calendar } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../services/api';

export default function RegisterPage() {
  const { register, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!form.email) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email, password: form.password });
      // Per spec: registration creates a participant, then redirect to /login.
      await logout();
      toast.success('Account created! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="grid flex-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:flex bg-slate-900">
          <img
            src="/logreg.png"
            alt="EventSync registration illustration"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
          <div className="relative z-10 flex flex-col justify-start p-12 pt-16 text-white">
            <div className="max-w-md">
              <h1 className="text-3xl font-bold leading-tight">Join EventSync</h1>
              <p className="mt-6 leading-relaxed text-white/80">
                Create an account to browse events and manage your RSVPs in real time.
              </p>
              <p className="mt-4 leading-relaxed text-white/80">
                Get started quickly with instant organization, notifications, and event coordination tools.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <img src="/EventSync_horizontal_logo.svg" alt="EventSync logo" className="w-auto h-40" />
            </div>
            <h2 className="text-2xl font-bold text-ink">Create account</h2>
            <p className="mt-1 text-sm text-muted">Get started — it only takes a minute.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                id="name"
                label="Full Name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
                autoComplete="name"
              />
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={errors.password}
                  autoComplete="new-password"
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
              <Input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                error={errors.confirm}
                autoComplete="new-password"
              />

              <Button type="submit" loading={loading} className="w-full">
                Create account
              </Button>
            </form>

            <p className="mt-6 text-sm text-center text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
