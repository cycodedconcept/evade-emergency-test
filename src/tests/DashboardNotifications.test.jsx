import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

const {
  dashboardLiveDataMock,
  dispatchMock,
  getAlertSoundStateMock,
  highlightRowMock,
  initAlertSoundMock,
  playAlertMock,
  scrollToTableMock,
  setAlertMutedMock,
  setAlertVolumeMock,
  stopAlertMock,
  subscribeToAlertSoundChangesMock,
  unlockAlertSoundMock,
  useSelectorMock,
} = vi.hoisted(() => ({
  dashboardLiveDataMock: vi.fn((payload) => ({
    type: 'dashboard/dashboardLiveData',
    payload,
  })),
  dispatchMock: vi.fn(),
  getAlertSoundStateMock: vi.fn(),
  highlightRowMock: vi.fn(),
  initAlertSoundMock: vi.fn(),
  playAlertMock: vi.fn(),
  scrollToTableMock: vi.fn(),
  setAlertMutedMock: vi.fn(),
  setAlertVolumeMock: vi.fn(),
  stopAlertMock: vi.fn(),
  subscribeToAlertSoundChangesMock: vi.fn(),
  unlockAlertSoundMock: vi.fn(),
  useSelectorMock: vi.fn(),
}));

vi.mock('axios');

vi.mock('react-redux', () => ({
  useDispatch: () => dispatchMock,
  useSelector: (selector) => useSelectorMock(selector),
}));

vi.mock('../features/dashboardSlice', () => ({
  dashboardLiveData: dashboardLiveDataMock,
}));

vi.mock('../lib/alertSound', () => ({
  getAlertSoundState: getAlertSoundStateMock,
  initAlertSound: initAlertSoundMock,
  playAlert: playAlertMock,
  setAlertMuted: setAlertMutedMock,
  setAlertVolume: setAlertVolumeMock,
  stopAlert: stopAlertMock,
  subscribeToAlertSoundChanges: subscribeToAlertSoundChangesMock,
  unlockAlertSound: unlockAlertSoundMock,
}));

vi.mock('../pages/Sidebar', () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock('../pages/Card', () => ({
  default: React.forwardRef((_props, ref) => {
    React.useImperativeHandle(ref, () => ({
      highlightRow: highlightRowMock,
      scrollToTable: scrollToTableMock,
    }));

    return <div>Card Page</div>;
  }),
}));

vi.mock('../pages/Emergencies', () => ({
  default: () => <div>Emergencies Page</div>,
}));

vi.mock('../pages/MissedCases', () => ({
  default: () => <div>Missed Cases Page</div>,
}));

vi.mock('../pages/Reports', () => ({
  default: () => <div>Reports Page</div>,
}));

vi.mock('../pages/Notifications', () => ({
  default: () => <div>Notifications Page</div>,
}));

vi.mock('../pages/Responders', () => ({
  default: () => <div>Responders Page</div>,
}));

vi.mock('../pages/helpCenter', () => ({
  default: () => <div>Help Center Page</div>,
}));

vi.mock('../pages/Subscriptions', () => ({
  default: () => <div>Subscriptions Page</div>,
}));

let dashboardState;

describe('Dashboard notification details modal', () => {
  beforeEach(() => {
    localStorage.setItem('item', JSON.stringify('test-token'));

    getAlertSoundStateMock.mockReturnValue({
      unlocked: false,
      muted: false,
      volume: 1,
    });
    initAlertSoundMock.mockResolvedValue({});
    playAlertMock.mockResolvedValue(true);
    setAlertMutedMock.mockImplementation(() => {});
    setAlertVolumeMock.mockImplementation(() => {});
    stopAlertMock.mockImplementation(() => {});
    subscribeToAlertSoundChangesMock.mockImplementation(() => () => {});
    unlockAlertSoundMock.mockResolvedValue(true);

    dispatchMock.mockImplementation(() => ({
      abort: vi.fn(),
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    dashboardState = {
      dashboard: {
        dataItem: {
          company: {
            company_name: 'Evade Rescue',
          },
          notifications: [
            {
              id: 1,
              emergency_id: 'EM-001',
              device_number: 'DEV-1001',
              type: 'Crash',
              severity: 'Fatal',
              incident_status: 'Active',
              nature_of_request: 'Major crash',
              date_time: '2026-08-17 10:00:00',
            },
          ],
        },
        liveDataItem: {},
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(dashboardState));

    axios.get.mockResolvedValue({
      data: {
        company: {
          company_name: 'Evade Rescue',
        },
        incident: {
          id: 1,
          emergency_id: 'EM-001',
          device_number: 'DEV-1001',
          type: 'Crash',
          severity: 'Fatal',
          priority: 'High',
          incident_status: 'Active',
          nature_of_request: 'Major crash',
          assigned_phone: '+2347000000001',
          assigned_at: '2026-08-17 10:02:00',
          latitude: '6.5244',
          longitude: '3.3792',
        },
        raw: {
          created_at: '2026-08-17 10:00:00',
          closed_status: 0,
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('opens the emergency details modal when a notification is selected', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('EM-001'));

    expect(axios.get).toHaveBeenCalledWith(
      '/api/responder/emergencies/1',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );

    const dialog = await screen.findByRole('dialog');

    await waitFor(() => {
      expect(within(dialog).getByText('Emergency details')).toBeInTheDocument();
      expect(within(dialog).getAllByText('Major crash').length).toBeGreaterThan(0);
      expect(within(dialog).getByText('+2347000000001')).toBeInTheDocument();
      expect(within(dialog).getByText('Evade Rescue')).toBeInTheDocument();
    });
  });

  it('treats the badge count as part of the clickable notification target', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('1'));

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('counts all open emergencies in the bell badge and excludes closed ones', () => {
    dashboardState = {
      dashboard: {
        dataItem: {
          company: {
            company_name: 'Evade Rescue',
          },
          notifications: [
            {
              id: 1,
              emergency_id: 'EM-001',
              device_number: 'DEV-1001',
              type: 'Crash',
              incident_status: 'Active',
              closed_status: 0,
              date_time: '2026-08-17 10:00:00',
            },
            {
              id: 2,
              emergency_id: 'EM-002',
              device_number: 'DEV-1002',
              type: 'Fire',
              incident_status: 'Closed',
              closed_status: 1,
              date_time: '2026-08-17 11:00:00',
            },
            {
              id: 3,
              emergency_id: 'EM-003',
              device_number: 'DEV-1003',
              type: 'Medical',
              incident_status: 'Active',
              closed_status: 0,
              date_time: '2026-08-17 12:00:00',
            },
            {
              id: 4,
              emergency_id: 'EM-004',
              device_number: 'DEV-1004',
              type: 'Panic',
              incident_status: 'Active',
              closed_status: 0,
              date_time: '2026-08-17 13:00:00',
            },
          ],
        },
        liveDataItem: {},
      },
    };

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    const notificationButton = screen.getByLabelText(/view emergency notifications/i);

    expect(within(notificationButton).getByText('3')).toBeInTheDocument();
    expect(within(notificationButton).queryByText('4')).not.toBeInTheDocument();
  });

  it('removes an opened emergency from the bell badge count', () => {
    dashboardState = {
      dashboard: {
        dataItem: {
          company: {
            company_name: 'Evade Rescue',
          },
          notifications: [
            {
              id: 1,
              emergency_id: 'EM-001',
              device_number: 'DEV-1001',
              type: 'Crash',
              incident_status: 'Active',
              date_time: '2026-08-17 11:00:00',
            },
            {
              id: 2,
              emergency_id: 'EM-002',
              device_number: 'DEV-1002',
              type: 'Fire',
              incident_status: 'Active',
              date_time: '2026-08-17 11:00:00',
            },
          ],
        },
        liveDataItem: {},
      },
    };

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    const notificationButton = screen.getByLabelText(/view emergency notifications/i);
    expect(within(notificationButton).getByText('2')).toBeInTheDocument();

    fireEvent.click(notificationButton);
    fireEvent.click(screen.getByText('EM-001'));

    expect(within(notificationButton).getByText('1')).toBeInTheDocument();
  });

  it('keeps acknowledged emergencies out of the bell after a page refresh', () => {
    localStorage.setItem('evade.acknowledged-notifications', JSON.stringify(['1']));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    const notificationButton = screen.getByLabelText(/view emergency notifications/i);

    expect(within(notificationButton).queryByText('1')).not.toBeInTheDocument();

    fireEvent.click(notificationButton);
    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });

  it('shows all open emergencies in newest-first order in the bell dropdown', () => {
    dashboardState = {
      dashboard: {
        dataItem: {
          company: {
            company_name: 'Evade Rescue',
          },
          notifications: [
            {
              id: 1,
              emergency_id: 'EM-001',
              device_number: 'DEV-1001',
              type: 'Crash',
              incident_status: 'Active',
              date_time: '2026-08-17 10:00:00',
            },
            {
              id: 2,
              emergency_id: 'EM-002',
              device_number: 'DEV-1002',
              type: 'Fire',
              incident_status: 'Active',
              date_time: '2026-08-17 11:00:00',
            },
            {
              id: 3,
              emergency_id: 'EM-003',
              device_number: 'DEV-1003',
              type: 'Medical',
              incident_status: 'Active',
              date_time: '2026-08-17 11:00:00',
            },
          ],
        },
        liveDataItem: {},
      },
    };

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText(/view emergency notifications/i));

    expect(screen.getByText('EM-002')).toBeInTheDocument();
    expect(screen.getByText('EM-003')).toBeInTheDocument();
    expect(screen.getByText('EM-001')).toBeInTheDocument();
  });

  it('shows the blocked sound banner before audio has been unlocked', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/alert sounds blocked/i)).toBeInTheDocument();
    expect(screen.getByText(/click anywhere to enable alert sounds/i)).toBeInTheDocument();
  });

  it('keeps the high-priority safety timeout anchored to the incident signature', () => {
    vi.useFakeTimers();
    getAlertSoundStateMock.mockReturnValue({
      unlocked: true,
      muted: false,
      volume: 1,
    });
    dashboardState = {
      dashboard: {
        dataItem: {
          company: {
            company_name: 'Evade Rescue',
          },
          notifications: [
            {
              id: 77,
              emergency_id: 'EM-077',
              device_number: 'DEV-1077',
              type: 'Crash',
              priority: 'HIGH',
              incident_status: 'Active',
              nature_of_request: 'High priority crash',
              date_time: '2026-08-17 10:00:00',
            },
          ],
        },
        liveDataItem: {},
      },
    };

    const view = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    dashboardState = {
      dashboard: {
        dataItem: {
          company: {
            company_name: 'Evade Rescue',
          },
          notifications: [
            {
              id: 77,
              emergency_id: 'EM-077',
              device_number: 'DEV-1077',
              type: 'Crash',
              priority: 'HIGH',
              incident_status: 'Active',
              nature_of_request: 'High priority crash',
              created_at: '2026-08-17 10:00:00',
              updated_at: '2026-08-17 10:15:00',
            },
          ],
        },
        liveDataItem: {},
      },
    };
    view.rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(44999);
    });

    expect(stopAlertMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(stopAlertMock).toHaveBeenCalledTimes(1);
  });
});
