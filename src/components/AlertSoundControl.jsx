import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faTriangleExclamation,
  faVolumeHigh,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';

const headerButtonStyle = {
  border: 'none',
  background: 'transparent',
  padding: 0,
  position: 'relative',
  width: '40px',
  height: '40px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const AlertSoundControl = ({
  isOpen,
  unlocked,
  muted,
  volume,
  notificationPermission,
  onToggleOpen,
  onClose,
  onToggleMute,
  onVolumeChange,
  onTestSound,
  onRequestNotificationPermission,
}) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const icon = !unlocked
    ? faTriangleExclamation
    : muted
      ? faVolumeXmark
      : faVolumeHigh;
  const iconColor = !unlocked ? '#FE5B65' : muted ? '#707A8F' : '#2E3192';
  const statusLabel = !unlocked ? 'Blocked' : muted ? 'Muted' : 'On';
  const statusDescription = !unlocked
    ? 'Click anywhere to enable alert sounds.'
    : muted
      ? 'Alert sounds are muted.'
      : 'Alert sounds are enabled.';
  const canRequestNotifications =
    typeof notificationPermission === 'string' &&
    notificationPermission !== 'granted' &&
    notificationPermission !== 'denied' &&
    notificationPermission !== 'unsupported';

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Alert sounds"
        title={statusDescription}
        onClick={onToggleOpen}
        style={headerButtonStyle}
      >
        <FontAwesomeIcon
          icon={icon}
          style={{
            fontSize: '16px',
            cursor: 'pointer',
            padding: '10px',
            color: iconColor,
          }}
          className="icon-hover alert-sound-icon"
        />
      </button>

      {isOpen ? (
        <div
          style={{
            position: 'absolute',
            top: '35px',
            right: '0',
            width: '300px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: '1000',
            padding: '16px',
            border: '1px solid #E8E8E9',
          }}
        >
          <div className="d-flex justify-content-between align-items-start mb-3" style={{ gap: '12px' }}>
            <div>
              <h6 className="mb-1" style={{ color: '#14181F' }}>
                Alert sounds
              </h6>
              <small style={{ color: '#707A8F' }}>{statusDescription}</small>
            </div>
            <span
              style={{
                backgroundColor: !unlocked ? '#FFEFF0' : muted ? '#F8F8F9' : '#EEF2FF',
                color: !unlocked ? '#FE5B65' : muted ? '#707A8F' : '#2E3192',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '700',
              }}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mb-3">
            <label
              htmlFor="alert-sound-volume"
              className="d-flex justify-content-between align-items-center mb-2"
              style={{ color: '#707A8F', fontSize: '13px', fontWeight: '600' }}
            >
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </label>
            <input
              id="alert-sound-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              style={{
                marginBottom: 0,
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
              }}
            />
          </div>

          <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
            <button
              type="button"
              className={muted ? 'd-btn' : 'sh-btn'}
              style={{ width: 'auto', marginBottom: 0 }}
              onClick={onToggleMute}
            >
              <FontAwesomeIcon icon={muted ? faVolumeHigh : faVolumeXmark} className="mr-2" />
              {muted ? 'Unmute' : 'Mute'}
            </button>

            <button
              type="button"
              className="sh-btn"
              style={{ width: 'auto', marginBottom: 0 }}
              onClick={onTestSound}
            >
              <FontAwesomeIcon icon={faBell} className="mr-2" />
              Test sound
            </button>

            {canRequestNotifications ? (
              <button
                type="button"
                className="sh-btn"
                style={{ width: 'auto', marginBottom: 0 }}
                onClick={onRequestNotificationPermission}
              >
                Desktop alerts
              </button>
            ) : null}
          </div>

          {notificationPermission === 'granted' ? (
            <small className="d-block mt-3" style={{ color: '#15AC77' }}>
              Desktop alerts are enabled.
            </small>
          ) : notificationPermission === 'denied' ? (
            <small className="d-block mt-3" style={{ color: '#FE5B65' }}>
              Desktop alerts are blocked in the browser.
            </small>
          ) : notificationPermission === 'unsupported' ? (
            <small className="d-block mt-3" style={{ color: '#707A8F' }}>
              Desktop alerts are not supported in this browser.
            </small>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default AlertSoundControl;
