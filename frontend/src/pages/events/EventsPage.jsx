import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, CalendarSearch } from 'lucide-react';
import EventCard from '../../components/events/EventCard';
import { EventCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import eventService from '../../services/eventService';
import { getErrorMessage } from '../../services/api';
import { CATEGORIES } from '../../utils/constants';
import useDebounce from '../../hooks/useDebounce';

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [filters, setFilters] = useState({ category: '', date: '', location: '', availability: '', sort: 'date_asc' });
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ events: [], pagination: { totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 9,
        status: 'published',
        sort: filters.sort,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.category) params.category = filters.category;
      if (filters.date) params.date = filters.date;
      if (filters.location) params.location = filters.location;
      if (filters.availability) params.availability = filters.availability;

      const result = await eventService.list(params);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load events.'));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 when a filter/search changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Events</h1>
          <p className="text-muted text-sm mt-0.5">Browse and RSVP to upcoming events.</p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-10"
              placeholder="Search events by title, description, or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn-secondary sm:w-auto"
            onClick={() => setShowFilters((s) => !s)}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <Select
              label="Category"
              placeholder="All categories"
              options={CATEGORIES}
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="input"
                placeholder="Any location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <Select
              label="Availability"
              placeholder="Any"
              options={[
                { value: 'available', label: 'Seats available' },
                { value: 'full', label: 'Full' },
              ]}
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            />
            <Select
              label="Sort by"
              options={[
                { value: 'date_asc', label: 'Date (soonest)' },
                { value: 'date_desc', label: 'Date (latest)' },
                { value: 'newest', label: 'Recently added' },
                { value: 'title', label: 'Title (A–Z)' },
              ]}
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : data.events.length === 0 ? (
        <EmptyState
          icon={CalendarSearch}
          title="No events found"
          description="Try changing your filters or search terms."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
