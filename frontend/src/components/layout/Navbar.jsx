import { Menu } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import ProfileMenu from './ProfileMenu';

export default function Navbar({ onMenuClick }) {
  return (
    <header className="h-16 bg-white border-b border-line flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg p-2 text-muted hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <img src="/EventSync_horizontal_logo.svg" alt="EventSync" className="lg:hidden h-16 w-auto" />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>
  );
}
