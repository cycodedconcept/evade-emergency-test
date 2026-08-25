const TIMESTAMP_WITH_TIMEZONE_PATTERN = /(?:[zZ]|[+-]\d{2}:\d{2})$/;
const UTC_LIKE_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeTimestampString = (value) => {
  const trimmed = value.trim();

  if (
    UTC_LIKE_TIMESTAMP_PATTERN.test(trimmed) &&
    !TIMESTAMP_WITH_TIMEZONE_PATTERN.test(trimmed)
  ) {
    return `${trimmed.replace(' ', 'T')}Z`;
  }

  return trimmed;
};

const getNotificationRowsFromSource = (source) => {
  if (Array.isArray(source)) {
    return source;
  }

  if (Array.isArray(source?.notifications) && source.notifications.length > 0) {
    return source.notifications;
  }

  if (Array.isArray(source?.table?.rows)) {
    return source.table.rows;
  }

  if (Array.isArray(source?.rows)) {
    return source.rows;
  }

  if (Array.isArray(source?.records)) {
    return source.records;
  }

  return [];
};

export const isIncidentClosedRecord = (incident) =>
  incident?.closed_status === 1 ||
  incident?.closed_status === '1' ||
  String(incident?.incident_status || '').toLowerCase() === 'closed';

export const getIncidentDateTimeValue = (incident) => {
  if (isNonEmptyString(incident?.date_time)) {
    return incident.date_time.trim();
  }

  const dateValue = isNonEmptyString(incident?.date) ? incident.date.trim() : '';
  const timeValue = isNonEmptyString(incident?.time) ? incident.time.trim() : '';
  const combined = [dateValue, timeValue].filter(Boolean).join(' ');

  return combined || null;
};

export const parseBackendTimestamp = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = normalizeTimestampString(value);
  const parsedDate = new Date(normalizedValue);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  const fallbackDate = new Date(value);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};

export const formatLocalDateTime = (
  value,
  {
    fallback = 'N/A',
    formatterOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  } = {}
) => {
  const parsedDate = parseBackendTimestamp(value);

  if (!parsedDate) {
    return fallback;
  }

  return new Intl.DateTimeFormat(undefined, formatterOptions).format(parsedDate);
};

export const getIncidentTimestampMs = (incident) => {
  const timestampValue = getIncidentDateTimeValue(incident);
  const parsedDate = parseBackendTimestamp(timestampValue);

  return parsedDate ? parsedDate.getTime() : 0;
};

export const formatIncidentDateTimeLabel = (
  incident,
  options = undefined
) => formatLocalDateTime(getIncidentDateTimeValue(incident), options);

export const getDashboardNotificationRows = (source) =>
  getNotificationRowsFromSource(source);

export const getOpenDashboardNotificationRows = (source) =>
  getNotificationRowsFromSource(source).filter(
    (incident) => !isIncidentClosedRecord(incident)
  );

export const buildIncidentNotificationSignature = (incident) => {
  if (!incident) {
    return '';
  }

  const stableIncidentId = [
    incident.id,
    incident.incident_id,
    incident.emergency_id,
    incident.device_number,
    incident.deviceid,
  ].find((value) => value !== undefined && value !== null && String(value).trim());

  if (stableIncidentId !== undefined) {
    return String(stableIncidentId).trim();
  }

  return (
    incident.created_at ??
    incident.date_time ??
    [incident.date ?? '', incident.time ?? ''].filter(Boolean).join(' ')
  );
};
