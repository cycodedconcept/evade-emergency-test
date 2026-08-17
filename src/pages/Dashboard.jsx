import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import Sidebar from './Sidebar';
import Card from './Card';
import Emergencies from './Emergencies';
import Reports from './Reports';
import Notifications from './Notifications';
import Responders from './Responders';
import HelpCenter from './helpCenter';
import Subscriptions from './Subscriptions';
import { dashboardLiveData } from '../features/dashboardSlice';
import EmergencyDetailsModal from '../components/EmergencyDetailsModal';
import { API_URL } from '../config/constant';
import {
  buildIncidentNotificationSignature,
  formatIncidentDateTimeLabel,
  getOpenDashboardNotificationRows,
} from '../utils/incidentUtils';

const DASHBOARD_LIVE_REFRESH_INTERVAL_MS = 15000;
const DASHBOARD_RATE_LIMIT_RETRY_MS = 180000;

const getStoredToken = () => {
  const tokenItem = localStorage.getItem('item');

  if (!tokenItem) {
    return null;
  }

  try {
    return JSON.parse(tokenItem);
  } catch {
    return tokenItem;
  }
};

const getBrowserAudioContext = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.AudioContext || window.webkitAudioContext || null;
};

const playNotificationChime = (audioContext, startOffset = 0) => {
  const triggerTone = (frequency, extraOffset, duration, peakGain) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const startTime = audioContext.currentTime + startOffset + extraOffset;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.03);
  };

  triggerTone(880, 0, 0.18, 0.045);
  triggerTone(1046.5, 0.24, 0.22, 0.04);
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const token = getStoredToken();
  const { dataItem, liveDataItem } = useSelector((state) => state.dashboard);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationEmergency, setNotificationEmergency] = useState(null);
  const [notificationEmergencyLoading, setNotificationEmergencyLoading] =
    useState(false);
  const [notificationEmergencyError, setNotificationEmergencyError] =
    useState(null);
  const [pendingNotificationTarget, setPendingNotificationTarget] = useState(null);
  const cardRef = useRef(null);
  const notificationRef = useRef(null);
  const notificationEmergencyAbortRef = useRef(null);
  const audioContextRef = useRef(null);
  const pendingNotificationSoundCountRef = useRef(0);
  const lastNotificationSignatureSetRef = useRef(new Set());
  const hasSeededNotificationStateRef = useRef(false);
  const notificationSourceKeyRef = useRef('dashboard');
  const flushNotificationSoundsRef = useRef(async () => {});
  const shouldShowNotificationIcon =
    activeMenu === 'Dashboard' || activeMenu === 'Emergencies';
  const notificationSourceKey =
    activeMenu === 'Dashboard'
      ? 'dashboard'
      : activeMenu === 'Emergencies'
        ? 'emergencies'
        : 'hidden';
  const shouldPollLiveData =
    Boolean(token) && notificationSourceKey === 'emergencies';

  useEffect(() => {
    if (!shouldPollLiveData) {
      return;
    }

    let timeoutId;
    let isDisposed = false;
    let activeRequest;
    let isRequestInFlight = false;

    const scheduleNextRefresh = (delay) => {
      if (isDisposed) {
        return;
      }

      timeoutId = window.setTimeout(fetchLiveData, delay);
    };

    const fetchLiveData = async () => {
      if (isRequestInFlight) {
        return;
      }

      isRequestInFlight = true;
      activeRequest = dispatch(dashboardLiveData({ token }));

      try {
        await activeRequest.unwrap();
        scheduleNextRefresh(DASHBOARD_LIVE_REFRESH_INTERVAL_MS);
      } catch (fetchError) {
        if (fetchError?.name === 'AbortError') {
          return;
        }

        console.error('Dashboard live refresh failed:', fetchError);
        const errorMessage =
          typeof fetchError === 'string'
            ? fetchError
            : fetchError?.message || '';
        const retryDelay = /too many/i.test(errorMessage)
          ? DASHBOARD_RATE_LIMIT_RETRY_MS
          : DASHBOARD_LIVE_REFRESH_INTERVAL_MS;

        scheduleNextRefresh(retryDelay);
      } finally {
        activeRequest = null;
        isRequestInFlight = false;
      }
    };

    fetchLiveData();

    return () => {
      isDisposed = true;
      activeRequest?.abort();
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, shouldPollLiveData, token]);

  useEffect(() => {
    const AudioContextClass = getBrowserAudioContext();

    if (!AudioContextClass) {
      return undefined;
    }

    const ensureAudioContext = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      if (audioContextRef.current.state !== 'running') {
        await audioContextRef.current.resume();
      }

      return audioContextRef.current;
    };

    const flushPendingNotificationSounds = async () => {
      if (!pendingNotificationSoundCountRef.current) {
        return;
      }

      try {
        const audioContext = await ensureAudioContext();

        if (!audioContext || audioContext.state !== 'running') {
          return;
        }

        const queuedSoundCount = pendingNotificationSoundCountRef.current;
        pendingNotificationSoundCountRef.current = 0;

        for (let index = 0; index < queuedSoundCount; index += 1) {
          playNotificationChime(audioContext, index * 0.55);
        }
      } catch {
        // Keep the queued sounds until the browser allows playback.
      }
    };

    flushNotificationSoundsRef.current = flushPendingNotificationSounds;

    const handleUserInteraction = () => {
      flushPendingNotificationSounds();
    };

    window.addEventListener('pointerdown', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

      audioContextRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      notificationEmergencyAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (notificationSourceKeyRef.current === notificationSourceKey) {
      return;
    }

    notificationSourceKeyRef.current = notificationSourceKey;
    hasSeededNotificationStateRef.current = false;
    lastNotificationSignatureSetRef.current = new Set();
  }, [notificationSourceKey]);

  useEffect(() => {
    if (activeMenu !== 'Dashboard' || !pendingNotificationTarget || !cardRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      cardRef.current.scrollToTable();
      cardRef.current.highlightRow(pendingNotificationTarget);
      setPendingNotificationTarget(null);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [activeMenu, pendingNotificationTarget]);

  useEffect(() => {
    if (!shouldShowNotificationIcon && showNotifications) {
      setShowNotifications(false);
    }
  }, [shouldShowNotificationIcon, showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const notificationSource =
    notificationSourceKey === 'dashboard' ? dataItem : liveDataItem;
  const hasLoadedNotificationSource = useMemo(() => {
    if (!notificationSource || Array.isArray(notificationSource)) {
      return false;
    }

    return Object.keys(notificationSource).length > 0;
  }, [notificationSource]);
  const dashboardRows = useMemo(
    () => getOpenDashboardNotificationRows(notificationSource),
    [notificationSource]
  );
  const dashboardCompanyName =
    dataItem?.company?.company_name ||
    liveDataItem?.company?.company_name ||
    'Responder';
  const notificationSignatures = useMemo(
    () =>
      dashboardRows
        .map((notification) => buildIncidentNotificationSignature(notification))
        .filter(Boolean),
    [dashboardRows]
  );

  useEffect(() => {
    if (!hasLoadedNotificationSource) {
      return;
    }

    const currentSignatureSet = new Set(notificationSignatures);

    if (!hasSeededNotificationStateRef.current) {
      hasSeededNotificationStateRef.current = true;
      lastNotificationSignatureSetRef.current = currentSignatureSet;
      return;
    }

    const previousSignatureSet = lastNotificationSignatureSetRef.current;
    const newNotificationCount = notificationSignatures.filter(
      (signature) => !previousSignatureSet.has(signature)
    ).length;

    lastNotificationSignatureSetRef.current = currentSignatureSet;

    if (!newNotificationCount) {
      return;
    }

    pendingNotificationSoundCountRef.current += newNotificationCount;
    flushNotificationSoundsRef.current();
  }, [hasLoadedNotificationSource, notificationSignatures]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return <Card ref={cardRef} />;
      case 'Emergencies':
        return <Emergencies />;
      case 'Reports & Analysis':
        return <Reports />;
      case 'Notifications':
        return <Notifications />;
      case 'Responders':
        return <Responders />;
      case 'Help Center':
        return <HelpCenter />;
      case 'Subscription & Billing':
        return <Subscriptions />;
      default:
        return <Card ref={cardRef} />;
    }
  };

  const loadNotificationEmergencyDetails = async (notification) => {
    notificationEmergencyAbortRef.current?.abort();
    notificationEmergencyAbortRef.current = null;
    setNotificationEmergency(null);
    setNotificationEmergencyError(null);

    if (!token || !notification?.id) {
      setNotificationEmergencyLoading(false);
      return;
    }

    const controller = new AbortController();
    notificationEmergencyAbortRef.current = controller;
    setNotificationEmergencyLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/responder/emergencies/${notification.id}`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (notificationEmergencyAbortRef.current !== controller) {
        return;
      }

      setNotificationEmergency(response.data);
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return;
      }

      if (notificationEmergencyAbortRef.current !== controller) {
        return;
      }

      setNotificationEmergencyError(error?.response?.data || error?.message);
    } finally {
      if (notificationEmergencyAbortRef.current === controller) {
        notificationEmergencyAbortRef.current = null;
        setNotificationEmergencyLoading(false);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    setSelectedNotification(notification);
    setNotificationEmergency(null);
    setNotificationEmergencyError(null);
    setNotificationEmergencyLoading(Boolean(token && notification?.id));

    if (activeMenu === 'Dashboard') {
      setPendingNotificationTarget(
        notification?.device_number || notification?.emergency_id || null
      );
    } else {
      setPendingNotificationTarget(null);
    }

    loadNotificationEmergencyDetails(notification);
  };

  const handleCloseNotificationModal = () => {
    notificationEmergencyAbortRef.current?.abort();
    notificationEmergencyAbortRef.current = null;
    setSelectedNotification(null);
    setNotificationEmergency(null);
    setNotificationEmergencyError(null);
    setNotificationEmergencyLoading(false);
  };

  const notificationCompany =
    notificationSource?.company?.company_name || notificationSource?.company?.name
      ? notificationSource.company
      : dataItem?.company || liveDataItem?.company || {};

  return (
    <>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content p-2 p-lg-3">
        <header className="mt-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap px-3">
            {activeMenu === 'Dashboard' ? (
              <div>
                <h5 style={{ color: '#14181F', marginBottom: '4px' }}>
                  Welcome {dashboardCompanyName}
                </h5>
                <p style={{ color: '#707A8F', marginBottom: 0 }}>
                  Provides an overview of key metrics
                </p>
              </div>
            ) : (
              <div />
            )}

            {shouldShowNotificationIcon ? (
              <div ref={notificationRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  aria-label="View emergency notifications"
                  onClick={() => setShowNotifications((currentValue) => !currentValue)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    position: 'relative',
                    width: '40px',
                    height: '40px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesomeIcon
                    icon={faBell}
                    style={{
                      fontSize: '16px',
                      cursor: 'pointer',
                      padding: '10px',
                    }}
                    className="icon-hover"
                  />
                  {dashboardRows.length > 0 ? (
                    <span
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: '#FE5B65',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        minWidth: '20px',
                        height: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '50%',
                        border: '2px solid white',
                        padding: '0 4px',
                        pointerEvents: 'none',
                      }}
                    >
                      {dashboardRows.length}
                    </span>
                  ) : null}
                </button>

                {showNotifications ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: '35px',
                      right: '0',
                      width: '250px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      background: 'white',
                      borderRadius: '10px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      zIndex: '1000',
                      padding: '5px',
                    }}
                  >
                    <h6
                      style={{
                        marginBottom: '10px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }}
                    >
                      Notifications
                    </h6>
                    <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                      {dashboardRows.length > 0 ? (
                        dashboardRows.map((notification, index) => (
                          <li
                            key={notification.id || notification.emergency_id || index}
                            style={{
                              padding: '8px',
                              fontSize: '13px',
                              borderBottom: '1px solid #ddd',
                              cursor: 'pointer',
                              borderRadius: '5px',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(event) => {
                              event.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(event) => {
                              event.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div style={{ fontWeight: 'bold', color: '#FE5B65' }}>
                              {notification.emergency_id || notification.device_number}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {notification.type ||
                                notification.nature_of_request ||
                                'No incident type'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#999' }}>
                              {formatIncidentDateTimeLabel(notification)}
                            </div>
                          </li>
                        ))
                      ) : (
                        <li style={{ padding: '8px', fontSize: '13px' }}>
                          No new notifications
                        </li>
                      )}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>
        {renderContent()}
      </div>
      <EmergencyDetailsModal
        isOpen={Boolean(selectedNotification)}
        incident={selectedNotification}
        emergency={notificationEmergency}
        loading={notificationEmergencyLoading}
        error={notificationEmergencyError}
        company={notificationCompany}
        onClose={handleCloseNotificationModal}
        onRetry={() => loadNotificationEmergencyDetails(selectedNotification)}
      />
    </>
  );
};

export default Dashboard;
