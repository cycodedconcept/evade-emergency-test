import React from 'react';
import {
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

    useSelectorMock.mockImplementation((selector) =>
      selector({
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
      })
    );

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

  it('shows the blocked sound banner before audio has been unlocked', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/alert sounds blocked/i)).toBeInTheDocument();
    expect(screen.getByText(/click anywhere to enable alert sounds/i)).toBeInTheDocument();
  });
});
