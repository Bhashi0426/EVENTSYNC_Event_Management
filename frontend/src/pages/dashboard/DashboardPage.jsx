import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Ticket, CheckCircle2, HelpCircle, Users, CalendarPlus, UserCheck, BarChart3 } from 'lucide-react';
import EventCard from '../../components/events/EventCard';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import rsvpService from '../../services/rsvpService';
import statsService from '../../services/statsService';

function StatCard({ icon: Icon, label, value, tone = 'text-primary' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="text-2xl font-bold text-ink mt-1">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const eventsData = await eventService.list({ status: 'published', sort: 'date_asc', limit: 6 });
        const now = new Date();
        const upcomingEvents = eventsData.events.filter((e) => new Date(e.date) >= new Date(now.toDateString()));

        const myRsvps = await rsvpService.myRsvps('all');
        const going = myRsvps.filter((r) => r.response === 'going').length;
        const maybe = myRsvps.filter((r) => r.response === 'maybe').length;

        const computed = {
          upcomingCount: eventsData.pagination.total,
          rsvpCount: myRsvps.length,
          going,
          maybe,
        };

        if (user.role === 'organizer' || user.role === 'admin') {
          const mine = await eventService.list({ organizer: user._id, limit: 100 });
          computed.myEvents = mine.pagination.total;
          computed.totalAttendees = mine.events.reduce((sum, e) => sum + (e.goingCount || 0), 0);
        }

        if (user.role === 'admin') {
          const overview = await statsService.overview();
          Object.assign(computed, overview);
        }

        if (active) {
          setUpcoming(upcomingEvents.slice(0, 6));
          setStats(computed);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-muted text-sm mt-0.5">Here&apos;s what&apos;s happening on EventSync.</p>
      </div>

      {/* Role-based stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {user.role === 'admin' ? (
          <>
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers ?? 0} />
            <StatCard icon={CalendarDays} label="Total Events" value={stats.totalEvents ?? 0} tone="text-success" />
            <StatCard icon={CalendarPlus} label="Upcoming Events" value={stats.upcomingEvents ?? 0} tone="text-warning" />
            <StatCard icon={BarChart3} label="Total RSVPs" value={stats.totalRsvps ?? 0} tone="text-danger" />
          </>
        ) : user.role === 'organizer' ? (
          <>
            <StatCard icon={CalendarDays} label="Upcoming Events" value={stats.upcomingCount ?? 0} />
            <StatCard icon={Ticket} label="My RSVPs" value={stats.rsvpCount ?? 0} tone="text-success" />
            <StatCard icon={CalendarPlus} label="My Events" value={stats.myEvents ?? 0} tone="text-warning" />
            <StatCard icon={UserCheck} label="Total Attendees" value={stats.totalAttendees ?? 0} tone="text-danger" />
          </>
        ) : (
          <>
            <StatCard icon={CalendarDays} label="Upcoming Events" value={stats.upcomingCount ?? 0} />
            <StatCard icon={Ticket} label="My RSVPs" value={stats.rsvpCount ?? 0} tone="text-success" />
            <StatCard icon={CheckCircle2} label="Going" value={stats.going ?? 0} tone="text-success" />
            <StatCard icon={HelpCircle} label="Maybe" value={stats.maybe ?? 0} tone="text-warning" />
          </>
        )}
      </div>

      {/* Upcoming events */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink">Upcoming Events</h2>
        <Link to="/events" className="text-sm text-primary font-medium hover:underline">
          View all
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming events" description="Check back soon for new events." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {upcoming.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
