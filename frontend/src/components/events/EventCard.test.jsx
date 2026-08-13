import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EventCard from './EventCard';

const baseEvent = {
  _id: 'e1',
  title: 'Tech Meetup 2026',
  category: 'Technology',
  date: '2026-09-01T00:00:00.000Z',
  startTime: '18:00',
  endTime: '21:00',
  location: 'Colombo Hub',
  capacity: 100,
  goingCount: 42,
  organizer: { name: 'Nimal Perera' },
  status: 'published',
};

function renderCard(event) {
  return render(
    <MemoryRouter>
      <EventCard event={event} />
    </MemoryRouter>
  );
}

describe('EventCard', () => {
  test('renders event details', () => {
    renderCard(baseEvent);
    expect(screen.getByText('Tech Meetup 2026')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText(/Colombo Hub/)).toBeInTheDocument();
    expect(screen.getByText(/42 \/ 100 going/)).toBeInTheDocument();
    expect(screen.getByText(/by Nimal Perera/)).toBeInTheDocument();
  });

  test('shows Full when at capacity', () => {
    renderCard({ ...baseEvent, goingCount: 100 });
    expect(screen.getByText(/Full/)).toBeInTheDocument();
  });

  test('links to the event details page', () => {
    renderCard(baseEvent);
    const link = screen.getByRole('link', { name: /view event/i });
    expect(link).toHaveAttribute('href', '/events/e1');
  });
});
