import { describe, expect, it } from 'vitest';
import {
  buildMissedCaseAttemptLookup,
  buildMissedCaseStats,
  isLocationUnavailable,
  normalizePreviousResponders,
} from '../utils/missedCaseUtils';

describe('missedCaseUtils', () => {
  it('normalizes object-form previous responders into a flat id list', () => {
    expect(
      normalizePreviousResponders({
        user_ids: [5, '8', 5],
        company_ids: [3],
      })
    ).toEqual([{ id: 5 }, { id: 8 }, { id: 3 }]);
  });

  it('normalizes array-form previous responders with details', () => {
    expect(
      normalizePreviousResponders([
        {
          responder_user_id: 11,
          responder_user_name: 'Agent Joshua',
          phone: '+2349139384191',
          open_case_count: 7,
        },
      ])
    ).toEqual([
      {
        id: 11,
        name: 'Agent Joshua',
        phone: '+2349139384191',
        openCaseCount: 7,
      },
    ]);
  });

  it('treats 0/0 coordinates as unavailable', () => {
    expect(
      isLocationUnavailable({
        latitude: '0.0000',
        longitude: '0.0000',
      })
    ).toBe(true);

    expect(
      isLocationUnavailable({
        latitude: '6.5643',
        longitude: '3.3650',
      })
    ).toBe(false);
  });

  it('builds page stats from rows and pagination', () => {
    const rows = [
      {
        id: 1,
        incident_id: 2145,
        miss_reason: 'call_failed',
        latitude: '0.0000',
        longitude: '0.0000',
      },
      {
        id: 2,
        incident_id: 2145,
        miss_reason: 'call_failed',
        latitude: '6.5643',
        longitude: '3.3650',
      },
      {
        id: 3,
        incident_id: 3001,
        miss_reason: 'busy_line',
        latitude: '0.0000',
        longitude: '0.0000',
      },
    ];

    expect(
      buildMissedCaseStats(rows, {
        total: 486,
      })
    ).toEqual({
      totalMissedCases: 486,
      incidentsAffected: 2,
      callFailures: 2,
      missingLocation: 2,
    });
  });

  it('orders duplicate incident attempts by missed_at', () => {
    expect(
      buildMissedCaseAttemptLookup([
        {
          id: 486,
          incident_id: 2145,
          missed_at: '2026-08-18T14:20:41.000000Z',
        },
        {
          id: 487,
          incident_id: 2145,
          missed_at: '2026-08-18T14:23:41.000000Z',
        },
        {
          id: 488,
          incident_id: 4120,
          missed_at: '2026-08-18T14:25:41.000000Z',
        },
      ])
    ).toEqual({
      486: 1,
      487: 2,
    });
  });
});
