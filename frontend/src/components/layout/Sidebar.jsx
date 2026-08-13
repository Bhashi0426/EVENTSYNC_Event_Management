import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  CalendarPlus,
  Users,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

/* Nav items are role-gated. */
const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['participant', 'organizer', 'admin'] },
  { to: '/events', label: 'Events', icon: CalendarDays, roles: ['participant', 'organizer', 'admin'] },
  { to: '/my-rsvps', label: 'My RSVPs', icon: Ticket, roles: ['participant', 'organizer', 'admin'] },
  { to: '/my-events', label: 'My Events', icon: CalendarPlus, roles: ['organizer', 'admin'] },
  { to: '/admin/users', label: 'User Management', icon: Users, roles: ['admin'] },
  { to: '/admin/events', label: 'Event Management', icon: Settings, roles: ['admin'] },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'participant';
  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={onClose} />}

      <aside
        className={clsx(
          'fixed z-40 inset-y-0 left-0 w-64 bg-white border-r border-line flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-line">
          <div className="flex items-center gap-4">
            <img src="/EventSync_horizontal_logo.svg" alt="EventSync logo" className="w-auto h-18" />
          </div>
          <button onClick={onClose} className="lg:hidden text-muted hover:text-ink" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-slate-50 hover:text-ink'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-line">
          <button
            onClick={logout}
            className="flex items-center w-full gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-lg text-muted hover:bg-red-50 hover:text-danger"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
