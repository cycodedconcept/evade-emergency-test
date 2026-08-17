import { describe, expect, it } from 'vitest';
import {
  formatIncidentDateTimeLabel,
  formatLocalDateTime,
  getOpenDashboardNotificationRows,
  parseBackendTimestamp,
} from '../utils/incidentUtils';

describe('incidentUtils', () => {
  it('treats backend UTC-like timestamps without offsets as UTC values', () => {
    const parsedDate = parseBackendTimestamp('2026-08-08 13:45:00');

    expect(parsedDate?.toISOString()).toBe('2026-08-08T13:45:00.000Z');
  });

  it('formats incident timestamps with the same local conversion logic used by the UI', () => {
    const expectedLabel = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date('2026-08-08T13:45:00.000Z'));

    expect(
      formatIncidentDateTimeLabel({ date_time: '2026-08-08 13:45:00' })
    ).toBe(expectedLabel);
    expect(formatLocalDateTime('not-a-date')).toBe('N/A');
  });

  it('filters resolved incidents out of dashboard notification rows', () => {
    const rows = getOpenDashboardNotificationRows({
      notifications: [
        { id: 1, incident_status: 'active', closed_status: 0 },
        { id: 2, incident_status: 'closed', closed_status: 1 },
        { id: 3, incident_status: 'open', closed_status: '0' },
      ],
    });

    expect(rows.map((row) => row.id)).toEqual([1, 3]);
  });
});
