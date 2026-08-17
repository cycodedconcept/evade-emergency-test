import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faCircleInfo,
  faLocationDot,
  faPhoneVolume,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  formatIncidentDateTimeLabel,
  formatLocalDateTime,
} from '../utils/incidentUtils';

const severityChipStyles = {
  Fatal: {
    backgroundColor: '#FFF1F2',
    color: '#FE5B65',
  },
  'Non-Fatal': {
    backgroundColor: '#EEF2FF',
    color: '#2E3192',
  },
};

const getDisplayValue = (value, fallback = 'N/A') => {
  if (value === 0 || value === '0') {
    return value;
  }

  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  return value ?? fallback;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildGoogleEmbedMapUrl = (lat, lng) => {
  const parsedLat = toNumber(lat);
  const parsedLng = toNumber(lng);

  if (parsedLat === null || parsedLng === null) {
    return '';
  }

  return `https://www.google.com/maps?q=${parsedLat},${parsedLng}&z=15&output=embed`;
};

const getIncidentStatusLabel = (incident, rawIncident) => {
  const closedStatusValue = rawIncident?.closed_status ?? incident?.closed_status;

  if (closedStatusValue === 1 || closedStatusValue === '1') {
    return 'Closed';
  }

  if (closedStatusValue === 0 || closedStatusValue === '0') {
    return getDisplayValue(incident?.incident_status, 'Active');
  }

  return getDisplayValue(incident?.incident_status, 'N/A');
};

const EmergencyDetailsModal = ({
  isOpen,
  incident,
  emergency,
  loading,
  error,
  company,
  onClose,
  onRetry,
}) => {
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

  if (!isOpen || !incident) {
    return null;
  }

  const hasLoadedMatchingIncident =
    emergency?.incident?.id !== undefined &&
    emergency?.incident?.id !== null &&
    incident?.id !== undefined &&
    incident?.id !== null &&
    String(emergency.incident.id) === String(incident.id);
  const rawIncident = hasLoadedMatchingIncident ? emergency?.raw || {} : {};
  const detailIncident = hasLoadedMatchingIncident
    ? emergency?.incident || incident
    : incident;
  const companyDetails = emergency?.company || company || {};
  const latitude =
    detailIncident?.latitude ??
    rawIncident?.latitude ??
    rawIncident?.lat ??
    null;
  const longitude =
    detailIncident?.longitude ??
    rawIncident?.longitude ??
    rawIncident?.lng ??
    rawIncident?.log ??
    null;
  const mapUrl = buildGoogleEmbedMapUrl(latitude, longitude);
  const severityChipStyle =
    severityChipStyles[detailIncident?.severity] || {
      backgroundColor: '#F8FAFC',
      color: '#14181F',
    };
  const statusLabel = getIncidentStatusLabel(detailIncident, rawIncident);
  const callNumber =
    detailIncident?.actions?.call_number ||
    detailIncident?.assigned_phone ||
    detailIncident?.agent_phone;
  const detailSections = [
    {
      label: 'Emergency ID',
      value: getDisplayValue(
        detailIncident?.emergency_id ?? detailIncident?.incident_id
      ),
      icon: faTriangleExclamation,
    },
    {
      label: 'Device Number',
      value: getDisplayValue(
        detailIncident?.device_number ?? rawIncident?.deviceid
      ),
      icon: faCircleInfo,
    },
    {
      label: 'Type',
      value: getDisplayValue(
        detailIncident?.type ??
          detailIncident?.raw_type ??
          rawIncident?.accident_type
      ),
      icon: faTriangleExclamation,
    },
    {
      label: 'Status',
      value: statusLabel,
      icon: faCircleInfo,
    },
    {
      label: 'Severity',
      value: getDisplayValue(detailIncident?.severity),
      icon: faTriangleExclamation,
    },
    {
      label: 'Priority',
      value: getDisplayValue(detailIncident?.priority),
      icon: faCircleInfo,
    },
    {
      label: 'Nature of Request',
      value: getDisplayValue(detailIncident?.nature_of_request),
      icon: faCircleInfo,
    },
    {
      label: 'Assigned Phone',
      value: getDisplayValue(callNumber),
      icon: faPhoneVolume,
    },
    {
      label: 'Detected At',
      value: formatIncidentDateTimeLabel(detailIncident),
      icon: faCalendar,
    },
    {
      label: 'Assigned At',
      value: formatLocalDateTime(
        detailIncident?.assigned_at || rawIncident?.assigned_at
      ),
      icon: faCalendar,
    },
    {
      label: 'Created At',
      value: formatLocalDateTime(
        rawIncident?.created_at || detailIncident?.created_at
      ),
      icon: faCalendar,
    },
    {
      label: 'Responder Company',
      value: getDisplayValue(
        companyDetails?.company_name ||
          companyDetails?.name ||
          detailIncident?.responder_company_name
      ),
      icon: faCircleInfo,
    },
  ];

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-emergency-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-content2"
        style={{ width: '960px', padding: '24px', borderRadius: '20px' }}
      >
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h4 id="notification-emergency-title" className="mb-1">
              Emergency details
            </h4>
            <small style={{ color: '#707A8F' }}>
              {formatIncidentDateTimeLabel(detailIncident)}
            </small>
          </div>

          <button
            type="button"
            className="modal-close"
            aria-label="Close emergency details"
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

        {loading && !hasLoadedMatchingIncident ? (
          <div className="py-5 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="sr-only"></span>
            </div>
            <h5 style={{ color: '#14181F' }}>Loading emergency details...</h5>
            <p className="mb-0" style={{ color: '#707A8F' }}>
              We&apos;re pulling the latest details for this emergency.
            </p>
          </div>
        ) : error && !hasLoadedMatchingIncident ? (
          <div className="py-5 text-center">
            <h5 style={{ color: '#14181F' }}>Unable to load emergency details</h5>
            <p style={{ color: '#707A8F' }}>
              {typeof error === 'string'
                ? error
                : error?.message || 'Something went wrong.'}
            </p>
            <button
              type="button"
              className="p-3 d-btn"
              onClick={onRetry}
              disabled={!incident?.id}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
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
                  Emergency
                </small>
                <strong style={{ color: '#14181F' }}>
                  {getDisplayValue(
                    detailIncident?.emergency_id ?? detailIncident?.incident_id
                  )}
                </strong>
              </div>
              <div>
                <small style={{ color: '#707A8F' }} className="d-block">
                  Latest request
                </small>
                <strong style={{ color: '#14181F' }}>
                  {getDisplayValue(
                    detailIncident?.nature_of_request,
                    'Accident detected'
                  )}
                </strong>
              </div>
              <span
                style={{
                  ...severityChipStyle,
                  borderRadius: '999px',
                  padding: '8px 14px',
                  fontWeight: '600',
                }}
              >
                {getDisplayValue(detailIncident?.severity)}
              </span>
            </div>

            <div className="row">
              {detailSections.map((section) => (
                <div
                  key={section.label}
                  className="col-sm-12 col-md-6 col-lg-4 mb-3"
                >
                  <div
                    style={{
                      border: '1px solid #E8E8E9',
                      borderRadius: '16px',
                      padding: '16px',
                      height: '100%',
                      backgroundColor: '#fff',
                    }}
                  >
                    <small
                      className="d-flex align-items-center mb-2"
                      style={{ color: '#707A8F', gap: '8px' }}
                    >
                      <FontAwesomeIcon icon={section.icon} />
                      {section.label}
                    </small>
                    <div style={{ color: '#14181F', fontWeight: '600' }}>
                      {section.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mt-2">
              <div className="col-sm-12 col-lg-5 mb-3">
                <div
                  style={{
                    border: '1px solid #E8E8E9',
                    borderRadius: '16px',
                    padding: '20px',
                    height: '100%',
                  }}
                >
                  <h5 className="mb-3" style={{ color: '#14181F' }}>
                    Location snapshot
                  </h5>
                  <div
                    className="d-flex align-items-start"
                    style={{ color: '#707A8F', gap: '10px' }}
                  >
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      style={{ marginTop: '4px', color: '#FE5B65' }}
                    />
                    <div>
                      <div>
                        Lat: {getDisplayValue(latitude)} | Lng:{' '}
                        {getDisplayValue(longitude)}
                      </div>
                      <div className="mt-2">
                        Assignment source:{' '}
                        {getDisplayValue(detailIncident?.assignment_source)}
                      </div>
                      <div className="mt-2">
                        Last call status:{' '}
                        {getDisplayValue(detailIncident?.last_call_status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-12 col-lg-7 mb-3">
                {mapUrl ? (
                  <iframe
                    src={mapUrl}
                    title={`Emergency map for ${getDisplayValue(detailIncident?.emergency_id, 'selected incident')}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{
                      width: '100%',
                      height: '280px',
                      border: 0,
                      borderRadius: '16px',
                    }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center text-center"
                    style={{
                      width: '100%',
                      height: '280px',
                      border: '1px dashed #D3D6DC',
                      borderRadius: '16px',
                      backgroundColor: '#F8FAFC',
                      color: '#707A8F',
                      padding: '20px',
                    }}
                  >
                    Location coordinates are not available for this emergency yet.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmergencyDetailsModal;
