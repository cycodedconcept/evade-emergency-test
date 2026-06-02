import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, it, vi } from 'vitest';
import Display from '../Display';

vi.mock('../components/Login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('../components/Signup', () => ({
  default: () => <div>Signup Page</div>,
}));

vi.mock('../pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>,
}));

describe('Display routing', () => {
  afterEach(() => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  it('renders the login page on the root route', () => {
    window.history.pushState({}, '', '/');

    render(<Display />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the signup page on the signup route', () => {
    window.history.pushState({}, '', '/signup');

    render(<Display />);

    expect(screen.getByText('Signup Page')).toBeInTheDocument();
  });

  it('renders the dashboard page on the dashboard route', () => {
    window.history.pushState({}, '', '/dashboard');

    render(<Display />);

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
