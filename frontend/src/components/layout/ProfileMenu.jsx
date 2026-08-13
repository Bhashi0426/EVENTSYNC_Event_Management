import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User, LogOut } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100"
      >
        <Avatar name={user.name} src={user.avatar} size="sm" />
        <span className="hidden sm:block text-sm font-medium text-ink max-w-[120px] truncate">{user.name}</span>
        <ChevronDown size={16} className="text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 card overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-line">
            <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
            <span className="mt-1 inline-block text-[11px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-slate-50"
          >
            <User size={16} /> Profile
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
