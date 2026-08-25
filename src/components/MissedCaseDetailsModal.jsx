import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpRightFromSquare,
  faCopy,
  faLocationDot,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  formatDebugValue,
  formatMissedCaseDateTime,
  getDisplayValue,
  getRawPayloadEntries,
  humanizeEnumValue,
  isLocationUnavailable,
  normalizePreviousResponders,
  parseMissedCaseCoordinates,
  truncateMiddle,
} from '../utils/missedCaseUtils';

const sectionShellStyle = {
  border: '1px solid #E8E8E9',
  borderRadius: '16px',
  padding: '20px',
  backgroundColor: '#fff',
  height: '100%',
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '12px 0',
  borderBottom: '1px solid #F8F8F9',
};

const labelStyle = {
  color: '#707A8F',
  fontSize: '13px',
  fontWeight: '600',
  minWidth: '150px',
};

const valueStyle = {
  color: '#14181F',
  fontWeight: '500',
  textAlign: 'right',
  flex: 1,
};

const chipStyles = {
  neutral: {
    backgroundColor: '#F8FAFC',
    color: '#14181F',
  },
  warning: {
    backgroundColor: '#FFF5EA',
    color: '#FE9431',
  },
  danger: {
    backgroundColor: '#FFF1F2',
    color: '#FE5B65',
  },
};

const getClosedStatusLabel = (value) =>
  value === 1 || value === '1' ? 'Closed' : 'Open';

const getStatusTone = (value) => {
  const normalizedValue = String(value || '').toLowerCase();

  if (
    normalizedValue.includes('failed') ||
    normalizedValue.includes('reassigned') ||
    normalizedValue.includes('fatal')
  ) {
    return 'danger';
  }

  if (normalizedValue.includes('assigned') || normalizedValue.includes('pending')) {
    return 'warning';
  }

  return 'neutral';
};

const renderChip = (label, tone = 'neutral') => (
  <span
    style={{
      ...chipStyles[tone],
      borderRadius: '999px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'none',
    }}
  >
    {label}
  </span>
);

const DefinitionSection = ({ title, items }) => (
  <div style={sectionShellStyle}>
    <h5 className="mb-3" style={{ color: '#14181F' }}>
      {title}
    </h5>
    <div>
      {items.map((item, index) => (
        <div
          key={`${title}-${item.label}`}
          style={{
            ...rowStyle,
            borderBottom: index === items.length - 1 ? 'none' : rowStyle.borderBottom,
          }}
        >
          <div style={labelStyle}>{item.label}</div>
          <div style={valueStyle}>{item.value}</div>
        </div>
      ))}
    </div>
  </div>
);

const MissedCaseDetailsModal = ({ isOpen, missedCase, onClose }) => {
  const [copyStatus, setCopyStatus] = useState('Copy');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (copyStatus !== 'Copied') {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCopyStatus('Copy');
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const previousResponders = useMemo(
    () => normalizePreviousResponders(missedCase?.raw_incident?.previous_responders),
    [missedCase]
  );

  const rawPayloadEntries = useMemo(
    () =>
      getRawPayloadEntries(missedCase?.raw_incident, [
        'assignment_distance_km',
        'assigned_at',
        'responder_open_case_count',
        'assignment_priority_note',
        'previous_responders',
      ]),
    [missedCase]
  );

  if (!isOpen || !missedCase) {
    return null;
  }

  const rawIncident = missedCase?.raw_incident || {};
  const locationUnavailable = isLocationUnavailable(missedCase);
  const coordinates = parseMissedCaseCoordinates(missedCase);
  const hasPreviousResponderDetails = previousResponders.some(
    (responder) =>
      responder?.name || responder?.phone || responder?.openCaseCount !== undefined
  );
  const previousResponderIdLabel = previousResponders.length
    ? previousResponders.map((responder) => `Responder #${responder.id}`).join(', ')
    : 'None';
  const assignmentDistance =
    !locationUnavailable && rawIncident?.assignment_distance_km
      ? `${rawIncident.assignment_distance_km} km`
      : '—';

  const openExternalUrl = (url) => {
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyDeviceId = async () => {
    const deviceId = getDisplayValue(missedCase?.deviceid, '');

    if (!deviceId) {
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(deviceId);
        setCopyStatus('Copied');
        return;
      }
    } catch {
      // Fall through to the legacy clipboard path below.
    }

    const input = document.createElement('input');
    input.value = deviceId;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    setCopyStatus('Copied');
  };

  const caseItems = [
    {
      label: 'Emergency ID',
      value: getDisplayValue(missedCase?.emergency_id, '—'),
    },
    {
      label: 'Incident ID',
      value: getDisplayValue(missedCase?.incident_id, '—'),
    },
    {
      label: 'Type',
      value: getDisplayValue(missedCase?.type, '—'),
    },
    {
      label: 'Raw Type',
      value: getDisplayValue(missedCase?.raw_type, '—'),
    },
    {
      label: 'Nature of Request',
      value: humanizeEnumValue(missedCase?.nature_of_request, '—'),
    },
    {
      label: 'Severity',
      value: getDisplayValue(missedCase?.severity, '—'),
    },
    {
      label: 'Priority',
      value: getDisplayValue(missedCase?.priority, '—'),
    },
    {
      label: 'Current Status',
      value: humanizeEnumValue(missedCase?.incident_status, '—'),
    },
    {
      label: 'Closed Status',
      value: getClosedStatusLabel(missedCase?.closed_status),
    },
  ];

  const assignmentItems = [
    {
      label: 'Responder Name',
      value: getDisplayValue(missedCase?.responder_user_name, '—'),
    },
    {
      label: 'Assigned Phone',
      value: missedCase?.assigned_phone ? (
        <a href={`tel:${missedCase.assigned_phone}`}>{missedCase.assigned_phone}</a>
      ) : (
        '—'
      ),
    },
    {
      label: 'Assignment Source',
      value: humanizeEnumValue(missedCase?.assignment_source, '—'),
    },
    {
      label: 'Assigned At',
      value: formatMissedCaseDateTime(rawIncident?.assigned_at, {
        fallback: '—',
      }),
    },
    {
      label: 'Open Cases',
      value: getDisplayValue(rawIncident?.responder_open_case_count, '—'),
    },
    {
      label: 'Priority Note',
      value: getDisplayValue(rawIncident?.assignment_priority_note, '—'),
    },
    ...(!locationUnavailable
      ? [
          {
            label: 'Assignment Distance',
            value: assignmentDistance,
          },
        ]
      : []),
  ];

  const missItems = [
    {
      label: 'Miss Reason',
      value: renderChip(
        humanizeEnumValue(missedCase?.miss_reason, '—'),
        getStatusTone(missedCase?.miss_reason)
      ),
    },
    {
      label: 'Miss Stage',
      value: humanizeEnumValue(missedCase?.miss_stage, '—'),
    },
    {
      label: 'Status At Miss',
      value: renderChip(
        humanizeEnumValue(missedCase?.incident_status_at_miss, '—'),
        getStatusTone(missedCase?.incident_status_at_miss)
      ),
    },
    {
      label: 'Missed At',
      value: formatMissedCaseDateTime(missedCase?.missed_at, {
        fallback: '—',
      }),
    },
  ];

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="missed-case-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-content2"
        style={{ width: '1080px', padding: '24px', borderRadius: '20px' }}
      >
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h4 id="missed-case-title" className="mb-1">
              Missed case details
            </h4>
            <small style={{ color: '#707A8F' }}>
              {formatMissedCaseDateTime(missedCase?.missed_at, {
                fallback: '—',
              })}
            </small>
          </div>

          <button
            type="button"
            className="modal-close"
            aria-label="Close missed case details"
            onClick={onClose}
            style={{
              border: '1px solid #D3D6DC',
              borderRadius: '999px',
              width: '40px',
              height: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div
          className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3"
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            gap: '12px',
          }}
        >
          <div>
            <small style={{ color: '#707A8F' }} className="d-block">
              Case
            </small>
            <strong style={{ color: '#14181F' }}>
              {getDisplayValue(missedCase?.emergency_id, '—')}
            </strong>
          </div>
          <div>
            <small style={{ color: '#707A8F' }} className="d-block">
              Responder
            </small>
            <strong style={{ color: '#14181F' }}>
              {getDisplayValue(missedCase?.responder_user_name, '—')}
            </strong>
          </div>
          {renderChip(
            `${getDisplayValue(missedCase?.severity, '—')} · ${getDisplayValue(missedCase?.priority, '—')}`,
            getStatusTone(`${missedCase?.severity || ''} ${missedCase?.priority || ''}`)
          )}
        </div>

        <div className="row">
          <div className="col-sm-12 col-lg-6 mb-3">
            <DefinitionSection title="Case" items={caseItems} />
          </div>
          <div className="col-sm-12 col-lg-6 mb-3">
            <DefinitionSection title="Assignment" items={assignmentItems} />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-lg-6 mb-3">
            <DefinitionSection title="Miss" items={missItems} />
          </div>
          <div className="col-sm-12 col-lg-6 mb-3">
            <div style={sectionShellStyle}>
              <h5 className="mb-3" style={{ color: '#14181F' }}>
                Location
              </h5>

              {locationUnavailable ? (
                <div style={{ color: '#707A8F' }}>Location unavailable</div>
              ) : (
                <>
                  <div
                    className="d-flex align-items-start"
                    style={{ color: '#14181F', gap: '10px' }}
                  >
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      style={{ marginTop: '4px', color: '#FE5B65' }}
                    />
                    <div>
                      {coordinates?.latitude}, {coordinates?.longitude}
                    </div>
                  </div>

                  <div className="d-flex flex-wrap mt-3" style={{ gap: '10px' }}>
                    {missedCase?.map_url ? (
                      <button
                        type="button"
                        className="sh-btn"
                        style={{ width: 'auto', marginBottom: 0 }}
                        onClick={() => openExternalUrl(missedCase.map_url)}
                      >
                        <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
                        View on map
                      </button>
                    ) : null}
                    {missedCase?.directions_url ? (
                      <button
                        type="button"
                        className="d-btn"
                        style={{ marginBottom: 0 }}
                        onClick={() => openExternalUrl(missedCase.directions_url)}
                      >
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="mr-2" />
                        Directions
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-lg-6 mb-3">
            <div style={sectionShellStyle}>
              <h5 className="mb-3" style={{ color: '#14181F' }}>
                Previous Responders
              </h5>

              {!previousResponders.length ? (
                <div style={{ color: '#707A8F' }}>None</div>
              ) : hasPreviousResponderDetails ? (
                <div>
                  {previousResponders.map((responder, index) => (
                    <div
                      key={`${responder.id}-${index}`}
                      style={{
                        ...rowStyle,
                        borderBottom:
                          index === previousResponders.length - 1
                            ? 'none'
                            : rowStyle.borderBottom,
                      }}
                    >
                      <div style={labelStyle}>
                        {getDisplayValue(responder?.name, `Responder #${responder.id}`)}
                      </div>
                      <div style={valueStyle}>
                        <div>
                          {responder?.phone ? (
                            <a href={`tel:${responder.phone}`}>{responder.phone}</a>
                          ) : (
                            '—'
                          )}
                        </div>
                        <small style={{ color: '#707A8F' }}>
                          Open cases:{' '}
                          {getDisplayValue(responder?.openCaseCount, '—')}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{ color: '#14181F', fontWeight: '600' }}>
                    {previousResponderIdLabel}
                  </div>
                  <small style={{ color: '#707A8F' }}>
                    Detailed responder records were not included in the payload.
                  </small>
                </div>
              )}
            </div>
          </div>

          <div className="col-sm-12 col-lg-6 mb-3">
            <div style={sectionShellStyle}>
              <h5 className="mb-3" style={{ color: '#14181F' }}>
                Device
              </h5>

              <div
                className="d-flex flex-wrap justify-content-between align-items-center"
                style={{ gap: '12px' }}
              >
                <code
                  style={{
                    color: '#14181F',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                  title={getDisplayValue(missedCase?.deviceid, '—')}
                >
                  {truncateMiddle(missedCase?.deviceid)}
                </code>

                <button
                  type="button"
                  className="sh-btn"
                  style={{ width: 'auto', marginBottom: 0 }}
                  onClick={handleCopyDeviceId}
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-2" />
                  {copyStatus}
                </button>
              </div>

              {rawPayloadEntries.length ? (
                <details
                  className="mt-4"
                  style={{
                    border: '1px solid #E8E8E9',
                    borderRadius: '12px',
                    padding: '14px 16px',
                  }}
                >
                  <summary
                    style={{
                      color: '#14181F',
                      fontWeight: '600',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    Raw payload
                  </summary>
                  <div className="mt-3">
                    {rawPayloadEntries.map(([key, value], index) => (
                      <div
                        key={key}
                        style={{
                          ...rowStyle,
                          borderBottom:
                            index === rawPayloadEntries.length - 1
                              ? 'none'
                              : rowStyle.borderBottom,
                        }}
                      >
                        <div style={labelStyle}>{humanizeEnumValue(key, key)}</div>
                        <div style={valueStyle}>{formatDebugValue(value)}</div>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissedCaseDetailsModal;
