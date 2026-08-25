import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faPhoneVolume,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { formatIncidentDateTimeLabel } from '../utils/incidentUtils';

const HighPriorityAlertBanner = ({
  incident,
  activeCount,
  onOpenIncident,
  onAcknowledgeIncident,
}) => {
  if (!incident) {
    return null;
  }

  return (
    <div
      className="mx-3 mt-3 p-3"
      style={{
        background: '#FFEFF0',
        border: '1px solid #FE5B65',
        borderRadius: '14px',
      }}
    >
      <div className="d-block d-lg-flex justify-content-between align-items-start" style={{ gap: '16px' }}>
        <div>
          <div className="d-flex align-items-center flex-wrap mb-2" style={{ gap: '10px' }}>
            <span
              style={{
                color: '#FE5B65',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
              HIGH priority SOS alert
            </span>
            {activeCount > 1 ? (
              <span
                style={{
                  background: '#fff',
                  color: '#FE5B65',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}
              >
                {activeCount} unacknowledged
              </span>
            ) : null}
          </div>

          <div style={{ color: '#14181F', fontWeight: '700', fontSize: '16px' }}>
            {incident.emergency_id || incident.device_number || 'Emergency alert'}
          </div>
          <div style={{ color: '#14181F', marginTop: '4px' }}>
            {incident.type || incident.nature_of_request || 'New incident received'}
          </div>
          <small className="d-block mt-2" style={{ color: '#707A8F' }}>
            {formatIncidentDateTimeLabel(incident)}
          </small>
        </div>

        <div className="d-flex flex-wrap mt-3 mt-lg-0" style={{ gap: '10px' }}>
          <button
            type="button"
            className="d-btn"
            style={{ marginBottom: 0 }}
            onClick={() => onOpenIncident(incident)}
          >
            <FontAwesomeIcon icon={faPhoneVolume} className="mr-2" />
            Open incident
          </button>
          <button
            type="button"
            className="sh-btn"
            style={{ marginBottom: 0, width: 'auto' }}
            onClick={() => onAcknowledgeIncident(incident)}
          >
            <FontAwesomeIcon icon={faBell} className="mr-2" />
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default HighPriorityAlertBanner;
