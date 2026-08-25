import { createSelector } from '@reduxjs/toolkit';
import { parseBackendTimestamp } from './incidentUtils';

export const MISSED_CASES_TIME_ZONE = 'Africa/Lagos';

const EMPTY_FALLBACK = '—';

const isMeaningfulValue = (value) => {
  if (value === 0 || value === '0') {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeIdList = (values = []) =>
  values
    .map((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : value;
    })
    .filter((value, index, array) => value !== null && value !== undefined && array.indexOf(value) === index);

export const getDisplayValue = (value, fallback = EMPTY_FALLBACK) => {
  if (!isMeaningfulValue(value)) {
    return fallback;
  }

  return typeof value === 'string' ? value.trim() : value;
};

export const humanizeEnumValue = (value, fallback = EMPTY_FALLBACK) => {
  if (!isMeaningfulValue(value)) {
    return fallback;
  }

  return String(value)
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const truncateMiddle = (value, headLength = 10, tailLength = 6) => {
  const normalizedValue = getDisplayValue(value, '');

  if (!normalizedValue) {
    return EMPTY_FALLBACK;
  }

  if (normalizedValue.length <= headLength + tailLength + 1) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, headLength)}...${normalizedValue.slice(-tailLength)}`;
};

export const parseMissedCaseCoordinates = (row) => {
  const latitude = toNumber(row?.latitude);
  const longitude = toNumber(row?.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
};

export const isLocationUnavailable = (row) => {
  const coordinates = parseMissedCaseCoordinates(row);

  if (!coordinates) {
    return true;
  }

  return coordinates.latitude === 0 && coordinates.longitude === 0;
};

export const getMissedCaseTimestamp = (row) => parseBackendTimestamp(row?.missed_at);

export const getMissedCaseTimestampMs = (row) =>
  getMissedCaseTimestamp(row)?.getTime() || 0;

export const formatMissedCaseDateTime = (
  value,
  {
    fallback = EMPTY_FALLBACK,
    timeZone = MISSED_CASES_TIME_ZONE,
    formatterOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    },
  } = {}
) => {
  const parsedDate = parseBackendTimestamp(value);

  if (!parsedDate) {
    return fallback;
  }

  return new Intl.DateTimeFormat(undefined, {
    ...formatterOptions,
    timeZone,
  }).format(parsedDate);
};

export const formatMissedCaseRelativeTime = (
  value,
  { fallback = EMPTY_FALLBACK, now = Date.now() } = {}
) => {
  const parsedDate = parseBackendTimestamp(value);

  if (!parsedDate) {
    return fallback;
  }

  const diffInSeconds = Math.round((parsedDate.getTime() - now) / 1000);
  const absoluteSeconds = Math.abs(diffInSeconds);
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: 'auto',
  });

  if (absoluteSeconds < 60) {
    return formatter.format(diffInSeconds, 'second');
  }

  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return formatter.format(diffInMinutes, 'minute');
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return formatter.format(diffInHours, 'hour');
  }

  const diffInDays = Math.round(diffInHours / 24);
  if (Math.abs(diffInDays) < 7) {
    return formatter.format(diffInDays, 'day');
  }

  const diffInWeeks = Math.round(diffInDays / 7);
  if (Math.abs(diffInWeeks) < 5) {
    return formatter.format(diffInWeeks, 'week');
  }

  const diffInMonths = Math.round(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return formatter.format(diffInMonths, 'month');
  }

  const diffInYears = Math.round(diffInDays / 365);
  return formatter.format(diffInYears, 'year');
};

export const normalizePreviousResponders = (previousResponders) => {
  if (Array.isArray(previousResponders)) {
    return previousResponders.map((responder, index) => ({
      id:
        responder?.id ??
        responder?.user_id ??
        responder?.responder_user_id ??
        responder?.agent_id ??
        `unknown-${index}`,
      name: responder?.name ?? responder?.responder_user_name ?? responder?.full_name,
      phone:
        responder?.phone ??
        responder?.assigned_phone ??
        responder?.phone_number ??
        responder?.mobile_number,
      openCaseCount:
        responder?.open_case_count ??
        responder?.openCaseCount ??
        responder?.responder_open_case_count,
    }));
  }

  if (!isPlainObject(previousResponders)) {
    return [];
  }

  const userIds = normalizeIdList(previousResponders?.user_ids);
  const companyIds = normalizeIdList(previousResponders?.company_ids);

  return [...userIds, ...companyIds].map((id) => ({ id }));
};

export const buildMissedCaseAttemptLookup = (rows = []) => {
  const groupedRows = rows.reduce((accumulator, row) => {
    const incidentId = row?.incident_id;

    if (!incidentId) {
      return accumulator;
    }

    if (!accumulator[incidentId]) {
      accumulator[incidentId] = [];
    }

    accumulator[incidentId].push(row);
    return accumulator;
  }, {});

  return Object.values(groupedRows).reduce((lookup, groupedRowItems) => {
    if (groupedRowItems.length < 2) {
      return lookup;
    }

    [...groupedRowItems]
      .sort((leftRow, rightRow) => getMissedCaseTimestampMs(leftRow) - getMissedCaseTimestampMs(rightRow))
      .forEach((row, index) => {
        lookup[row.id] = index + 1;
      });

    return lookup;
  }, {});
};

export const buildMissedCaseStats = (rows = [], pagination = {}) => ({
  totalMissedCases: Number(pagination?.total) || 0,
  incidentsAffected: new Set(
    rows
      .map((row) => row?.incident_id)
      .filter((incidentId) => incidentId !== null && incidentId !== undefined)
  ).size,
  callFailures: rows.filter((row) => row?.miss_reason === 'call_failed').length,
  missingLocation: rows.filter((row) => isLocationUnavailable(row)).length,
});

export const getRawPayloadEntries = (rawIncident = {}, excludedKeys = []) => {
  if (!isPlainObject(rawIncident)) {
    return [];
  }

  const excludedKeySet = new Set(excludedKeys);

  return Object.entries(rawIncident).filter(([key, value]) => {
    if (excludedKeySet.has(key)) {
      return false;
    }

    if (!isMeaningfulValue(value)) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (isPlainObject(value)) {
      return Object.keys(value).length > 0;
    }

    return true;
  });
};

export const formatDebugValue = (value) => {
  if (Array.isArray(value) || isPlainObject(value)) {
    return JSON.stringify(value);
  }

  return String(value);
};

export const createMissedCaseStatsSelector = (rowsSelector, paginationSelector) =>
  createSelector([rowsSelector, paginationSelector], (rows, pagination) =>
    buildMissedCaseStats(rows, pagination)
  );
