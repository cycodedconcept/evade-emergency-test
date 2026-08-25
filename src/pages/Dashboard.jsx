import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import Sidebar from './Sidebar';
import Card from './Card';
import Emergencies from './Emergencies';
import MissedCases from './MissedCases';
import Reports from './Reports';
import Notifications from './Notifications';
import Responders from './Responders';
import HelpCenter from './helpCenter';
import Subscriptions from './Subscriptions';
import { dashboardLiveData } from '../features/dashboardSlice';
import EmergencyDetailsModal from '../components/EmergencyDetailsModal';
import AlertSoundControl from '../components/AlertSoundControl';
import HighPriorityAlertBanner from '../components/HighPriorityAlertBanner';
import { API_URL } from '../config/constant';
import {
  buildIncidentNotificationSignature,
  formatIncidentDateTimeLabel,
  getIncidentTimestampMs,
  getOpenDashboardNotificationRows,
} from '../utils/incidentUtils';
import {
  getDashboardMenuNameFromLocation,
  getDashboardMenuNavigationTarget,
} from '../config/dashboardMenu';
import {
  getAlertSoundState,
  initAlertSound,
  isAlertSoundUnlocked,
  playAlert,
  setAlertMuted,
  setAlertVolume,
  stopAlert,
  subscribeToAlertSoundChanges,
  unlockAlertSound,
} from '../lib/alertSound';

const DASHBOARD_LIVE_REFRESH_INTERVAL_MS = 15000;
const DASHBOARD_RATE_LIMIT_RETRY_MS = 180000;
const ALERT_SOUND_DEBOUNCE_MS = 2000;
const HIGH_PRIORITY_ALERT_TIMEOUT_MS = 60000;

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

const getBrowserNotificationPermission = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  return window.Notification.permission;
};

const isHighPriorityIncident = (incident) =>
  String(incident?.priority || '').toUpperCase() === 'HIGH';

const sortNotificationsByRecency = (leftIncident, rightIncident) =>
  getIncidentTimestampMs(rightIncident) - getIncidentTimestampMs(leftIncident);

const Dashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const token = getStoredToken();
  const { dataItem, liveDataItem } = useSelector((state) => state.dashboard);
  const [activeMenu, setActiveMenu] = useState(() =>
    getDashboardMenuNameFromLocation(location)
  );
  const [showAlertSoundControls, setShowAlertSoundControls] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alertSoundState, setAlertSoundState] = useState(() =>
    getAlertSoundState()
  );
  const [notificationPermission, setNotificationPermission] = useState(() =>
    getBrowserNotificationPermission()
  );
  const [acknowledgedNotificationSignatures, setAcknowledgedNotificationSignatures] =
    useState([]);
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
  const lastNotificationSignatureSetRef = useRef(new Set());
  const hasSeededNotificationStateRef = useRef(false);
  const notificationSourceKeyRef = useRef('dashboard');
  const lastAlertPlaybackTimestampRef = useRef(0);
  const previousHighPrioritySignatureRef = useRef('');
  const defaultDocumentTitleRef = useRef(
    typeof document !== 'undefined' ? document.title : 'Evade'
  );
  const shouldShowNotificationIcon = Boolean(token);
  const notificationSourceKey = activeMenu === 'Dashboard' ? 'dashboard' : 'live';
  const shouldPollLiveData = Boolean(token) && notificationSourceKey === 'live';

  useEffect(() => {
    setActiveMenu(getDashboardMenuNameFromLocation(location));
  }, [location.pathname, location.state]);

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
    initAlertSound().finally(() => {
      setAlertSoundState(getAlertSoundState());
    });

    const unsubscribe = subscribeToAlertSoundChanges((nextState) => {
      setAlertSoundState(nextState);
    });

    const syncNotificationPermission = () => {
      setNotificationPermission(getBrowserNotificationPermission());
    };

    window.addEventListener('focus', syncNotificationPermission);
    document.addEventListener('visibilitychange', syncNotificationPermission);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', syncNotificationPermission);
      document.removeEventListener(
        'visibilitychange',
        syncNotificationPermission
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      notificationEmergencyAbortRef.current?.abort();
      stopAlert();
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
  const acknowledgedSignatureSet = useMemo(
    () => new Set(acknowledgedNotificationSignatures),
    [acknowledgedNotificationSignatures]
  );
  const unacknowledgedHighPriorityNotifications = useMemo(
    () =>
      dashboardRows
        .filter((notification) => {
          const signature = buildIncidentNotificationSignature(notification);
          return (
            signature &&
            !acknowledgedSignatureSet.has(signature) &&
            isHighPriorityIncident(notification)
          );
        })
        .sort(sortNotificationsByRecency),
    [acknowledgedSignatureSet, dashboardRows]
  );
  const activeHighPriorityNotification =
    unacknowledgedHighPriorityNotifications[0] || null;
  const activeHighPriorityNotificationSignature = useMemo(
    () => buildIncidentNotificationSignature(activeHighPriorityNotification),
    [activeHighPriorityNotification]
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
    const currentSignatureSet = new Set(notificationSignatures);

    setAcknowledgedNotificationSignatures((currentSignatures) =>
      currentSignatures.filter((signature) => currentSignatureSet.has(signature))
    );
  }, [notificationSignatures]);

  const acknowledgeIncident = (incident) => {
    const signature = buildIncidentNotificationSignature(incident);

    stopAlert();

    if (!signature) {
      return;
    }

    setAcknowledgedNotificationSignatures((currentSignatures) =>
      currentSignatures.includes(signature)
        ? currentSignatures
        : [...currentSignatures, signature]
    );
  };

  const showDesktopNotification = (notification, newNotificationCount) => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      window.Notification.permission !== 'granted'
    ) {
      return;
    }

    const browserNotification = new window.Notification(
      `${notification?.emergency_id || 'SOS alert'} received`,
      {
        body:
          notification?.type ||
          notification?.nature_of_request ||
          'New emergency incident',
        tag:
          buildIncidentNotificationSignature(notification) ||
          notification?.emergency_id ||
          'evade-alert',
        renotify: isHighPriorityIncident(notification),
        requireInteraction: isHighPriorityIncident(notification),
      }
    );

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      handleNotificationClick(notification);
    };

    if (!isHighPriorityIncident(notification)) {
      window.setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }

    if (newNotificationCount > 1) {
      document.title = `(${newNotificationCount}) SOS — Evade`;
    }
  };

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
    const newNotifications = dashboardRows
      .filter((notification) => {
        const signature = buildIncidentNotificationSignature(notification);
        return signature && !previousSignatureSet.has(signature);
      })
      .sort(sortNotificationsByRecency);

    lastNotificationSignatureSetRef.current = currentSignatureSet;

    if (!newNotifications.length) {
      return;
    }

    const highlightedNotification =
      newNotifications.find((notification) => isHighPriorityIncident(notification)) ||
      newNotifications[0];

    showDesktopNotification(highlightedNotification, newNotifications.length);

    if (!alertSoundState.unlocked || alertSoundState.muted) {
      return;
    }

    const now = Date.now();
    const hasHighPriorityNotification = newNotifications.some((notification) =>
      isHighPriorityIncident(notification)
    );

    if (
      !hasHighPriorityNotification &&
      now - lastAlertPlaybackTimestampRef.current < ALERT_SOUND_DEBOUNCE_MS
    ) {
      return;
    }

    lastAlertPlaybackTimestampRef.current = now;
    playAlert({
      variant: hasHighPriorityNotification ? 'ring' : 'alert',
      loop: hasHighPriorityNotification,
      volume: 1,
    });
  }, [
    alertSoundState.muted,
    alertSoundState.unlocked,
    dashboardRows,
    hasLoadedNotificationSource,
    notificationSignatures,
  ]);

  useEffect(() => {
    const activeSignature = activeHighPriorityNotificationSignature;

    if (!activeSignature) {
      if (previousHighPrioritySignatureRef.current) {
        stopAlert();
      }

      previousHighPrioritySignatureRef.current = '';
      return undefined;
    }

    previousHighPrioritySignatureRef.current = activeSignature;

    const timeoutId = window.setTimeout(() => {
      stopAlert();
    }, HIGH_PRIORITY_ALERT_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeHighPriorityNotificationSignature]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (!activeHighPriorityNotification) {
      document.title = defaultDocumentTitleRef.current;
      return undefined;
    }

    let showEmergencyTitle = true;
    const highPriorityCount = unacknowledgedHighPriorityNotifications.length;
    const flashingTitle = `(${highPriorityCount}) SOS — Evade`;

    document.title = flashingTitle;

    const intervalId = window.setInterval(() => {
      document.title = showEmergencyTitle
        ? flashingTitle
        : defaultDocumentTitleRef.current;
      showEmergencyTitle = !showEmergencyTitle;
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
      document.title = defaultDocumentTitleRef.current;
    };
  }, [activeHighPriorityNotification, unacknowledgedHighPriorityNotifications.length]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return (
          <Card ref={cardRef} onAcknowledgeIncident={acknowledgeIncident} />
        );
      case 'Emergencies':
        return <Emergencies onAcknowledgeIncident={acknowledgeIncident} />;
      case 'Missed Cases':
        return <MissedCases />;
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
    acknowledgeIncident(notification);
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

  const handleActiveMenuChange = (nextMenu) => {
    const nextTarget = getDashboardMenuNavigationTarget(nextMenu);

    setActiveMenu(nextMenu);

    if (nextTarget.state) {
      navigate(nextTarget.pathname, { state: nextTarget.state });
      return;
    }

    navigate(nextTarget.pathname);
  };

  const handleAlertSoundMuteToggle = () => {
    setAlertMuted(!alertSoundState.muted);
  };

  const handleAlertVolumeChange = (nextVolume) => {
    setAlertVolume(nextVolume);
  };

  const handleTestAlertSound = async () => {
    await unlockAlertSound();
    setAlertSoundState(getAlertSoundState());
    await playAlert({ variant: 'alert', loop: false, volume: 1 });
  };

  const handleRequestNotificationPermission = async () => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      window.Notification.permission !== 'default'
    ) {
      setNotificationPermission(getBrowserNotificationPermission());
      return;
    }

    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
  };

  return (
    <>
      <Sidebar activeMenu={activeMenu} setActiveMenu={handleActiveMenuChange} />
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

            <div className="d-flex align-items-center" style={{ gap: '8px' }}>
              <AlertSoundControl
                isOpen={showAlertSoundControls}
                unlocked={alertSoundState.unlocked}
                muted={alertSoundState.muted}
                volume={alertSoundState.volume}
                notificationPermission={notificationPermission}
                onToggleOpen={() =>
                  setShowAlertSoundControls((currentValue) => !currentValue)
                }
                onClose={() => setShowAlertSoundControls(false)}
                onToggleMute={handleAlertSoundMuteToggle}
                onVolumeChange={handleAlertVolumeChange}
                onTestSound={handleTestAlertSound}
                onRequestNotificationPermission={handleRequestNotificationPermission}
              />

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
          </div>
        </header>

        {!alertSoundState.unlocked ? (
          <div
            className="mx-3 mt-3 p-3"
            style={{
              background: '#FFF5EA',
              border: '1px solid #FE9431',
              borderRadius: '14px',
              color: '#FE9431',
            }}
          >
            <strong>Alert sounds blocked.</strong> Click anywhere to enable alert sounds.
          </div>
        ) : null}

        <HighPriorityAlertBanner
          incident={activeHighPriorityNotification}
          activeCount={unacknowledgedHighPriorityNotifications.length}
          onOpenIncident={handleNotificationClick}
          onAcknowledgeIncident={acknowledgeIncident}
        />

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
