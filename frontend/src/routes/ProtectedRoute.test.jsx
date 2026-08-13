import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContext from '../context/AuthContext';

function renderWithAuth(authValue, { roles } = {}) {
  jest.spyOn(AuthContext, 'useAuth').mockReturnValue(authValue);
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route
          path="/secret"
          element={
            <ProtectedRoute roles={roles}>
              <div>Secret Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => jest.restoreAllMocks());

  test('shows a loader while auth is resolving', () => {
    renderWithAuth({ isAuthenticated: false, user: null, loading: true });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('redirects unauthenticated users to login', () => {
    renderWithAuth({ isAuthenticated: false, user: null, loading: false });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('renders content for authenticated users', () => {
    renderWithAuth({ isAuthenticated: true, user: { role: 'participant' }, loading: false });
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  test('redirects users without the required role', () => {
    renderWithAuth(
      { isAuthenticated: true, user: { role: 'participant' }, loading: false },
      { roles: ['admin'] }
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
