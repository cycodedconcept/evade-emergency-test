import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Sidebar from '../pages/Sidebar';

const useSelectorMock = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: (selector) => useSelectorMock(selector),
}));

vi.mock('../assets', () => ({
  Al: 'al.png',
  Al2: 'al2.png',
  Ch: 'ch.png',
  Ch2: 'ch2.png',
  Help: 'help.png',
  Help2: 'help2.png',
  La: 'la.png',
  La2: 'la2.png',
  Logo2: 'logo2.png',
  Avatar: 'avatar.png',
  Bel: 'bel.png',
  Bel2: 'bel2.png',
}));

const setViewportWidth = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
};

describe('Sidebar mobile navigation', () => {
  beforeEach(() => {
    useSelectorMock.mockImplementation((selector) =>
      selector({
        user: {
          dataItem: {
            details: {
              name: 'Test User',
              user_type: 'responder_company',
            },
          },
        },
        dashboard: {
          dataItem: {
            user_type: 'responder_company',
          },
        },
        responder: {
          responderProfile: {},
        },
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    setViewportWidth(1024);
  });

  it('closes the sidebar after a menu click on small screens', () => {
    setViewportWidth(480);

    const setActiveMenu = vi.fn();

    render(<Sidebar activeMenu="Dashboard" setActiveMenu={setActiveMenu} />);

    const drawer = screen.getByText('Dashboard').closest('.sidebar');

    expect(drawer).toHaveStyle({ width: '250px' });

    fireEvent.click(screen.getByText('Responders'));

    expect(setActiveMenu).toHaveBeenCalledWith('Responders');
    expect(drawer).toHaveStyle({ width: '0px' });
  });

  it('keeps the sidebar open after a menu click on desktop screens', () => {
    setViewportWidth(1280);

    const setActiveMenu = vi.fn();

    render(<Sidebar activeMenu="Dashboard" setActiveMenu={setActiveMenu} />);

    const drawer = screen.getByText('Dashboard').closest('.sidebar');

    fireEvent.click(screen.getByText('Reports & Analysis'));

    expect(setActiveMenu).toHaveBeenCalledWith('Reports & Analysis');
    expect(drawer).toHaveStyle({ width: '250px' });
  });

  it('shows the missed cases menu item for responder companies', () => {
    setViewportWidth(1280);

    const setActiveMenu = vi.fn();

    render(<Sidebar activeMenu="Dashboard" setActiveMenu={setActiveMenu} />);

    expect(screen.getByText('Missed Cases')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Missed Cases'));

    expect(setActiveMenu).toHaveBeenCalledWith('Missed Cases');
  });
});
