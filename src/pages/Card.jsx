import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faPhoneVolume,
  faCrosshairs,
  faCalendar,
  faCarCrash,
  faLocationArrow,
  faMapLocationDot,
  faTriangleExclamation,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import CardCarousel from './reusables/CardCarousel';
import Table from './reusables/Table';
import Pagination from './reusables/Pagination';
import { dashboardData, emergencyDetails } from '../features/dashboardSlice';
import { closeEmergencyCase } from '../features/createSlice';
import { getResponderAgents } from '../features/responderSlice';
import {
  Em,
  War,
  Logo2,
} from '../assets';

const GOOGLE_MAPS_API_KEY = 'AIzaSyC2CKttNS1QGg-S0xkbWhYoA08OHuBWzmY';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '20px',
};

const defaultCenter = { lat: 6.5244, lng: 3.3792 };

const getStoredToken = () => {
  const tokenItem = localStorage.getItem('item');

  if (!tokenItem) {
    return null;
  }

  try {
    return JSON.parse(tokenItem);
  } catch (error) {
    return tokenItem;
  }
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toLatLng = (lat, lng) => {
  const parsedLat = toNumber(lat);
  const parsedLng = toNumber(lng);

  if (parsedLat === null || parsedLng === null) {
    return null;
  }

  return { lat: parsedLat, lng: parsedLng };
};

const buildGoogleEmbedMapUrl = (lat, lng) => {
  const coordinates = toLatLng(lat, lng);

  if (!coordinates) {
    return '';
  }

  return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`;
};

const parseDateTime = (row) => {
  if (row?.date_time) {
    const parsed = new Date(row.date_time).getTime();
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const fallback = new Date(`${row?.date || ''} ${row?.time || ''}`).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
};

const formatDateTimeLabel = (row) => {
  if (row?.date_time) {
    return row.date_time;
  }

  return [row?.date, row?.time].filter(Boolean).join(' | ') || 'N/A';
};

const toMetricNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const pickMetricValue = (...values) => {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const buildCardChartData = (card) => {
  const total = toMetricNumber(card?.value);
  const today = Math.max(toMetricNumber(card?.today), 0);

  return [
    { label: 'Earlier', value: Math.max(total - today, 0) },
    { label: 'Today', value: today },
  ];
};

const severityStyles = {
  Fatal: { color: '#FE5B65' },
  'Non-Fatal': { color: '#2E3192' },
};

const Card = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const token = getStoredToken();
  const {
    loading,
    error,
    dataItem,
    emergency,
    emergencyLoading,
    emergencyError,
  } = useSelector((state) => state.dashboard);
  const { responderAgents } = useSelector((state) => state.responder);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showMainAlert, setShowMainAlert] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [closingCaseId, setClosingCaseId] = useState(null);
  const emergenciesTableRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToTable: () => {
      if (emergenciesTableRef.current) {
        emergenciesTableRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    },
    highlightRow: (valueToMatch) => {
      if (!valueToMatch) return;

      setTimeout(() => {
        const tableRows = document.querySelectorAll('table tbody tr');
        tableRows.forEach((row) => {
          const deviceNumberCell = row.querySelector('td:nth-child(2)');
          const emergencyIdCell = row.querySelector('td:nth-child(3)');
          const matchesDevice =
            deviceNumberCell &&
            deviceNumberCell.textContent.trim() === valueToMatch;
          const matchesEmergency =
            emergencyIdCell &&
            emergencyIdCell.textContent.trim() === valueToMatch;

          if (matchesDevice || matchesEmergency) {
            row.style.backgroundColor = '#fffbf0';
            row.style.border = '2px solid #FE5B65';
            row.style.transition = 'all 0.3s ease';

            setTimeout(() => {
              row.style.backgroundColor = '';
              row.style.border = '';
            }, 3000);
          }
        });
      }, 500);
    },
  }));

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        await dispatch(dashboardData({ token, page: currentPage })).unwrap();
      } catch (fetchError) {
        console.error('Dashboard refresh failed:', fetchError);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);

    return () => clearInterval(interval);
  }, [currentPage, dispatch, token]);

  useEffect(() => {
    if (!token) return;

    dispatch(getResponderAgents({ token }));
  }, [dispatch, token]);

  const company = dataItem?.company || {};
  const responseCards = dataItem?.cards || {};
  const responderAgentList = responderAgents?.agents || [];
  const responderAgentPagination = responderAgents?.pagination || {};
  const tableRows = useMemo(() => dataItem?.table?.rows || [], [dataItem]);
  const tablePagination = dataItem?.table?.pagination || {};
  const mapLocations = useMemo(
    () => dataItem?.map?.locations || [],
    [dataItem]
  );
  const fatalCrashValue = toMetricNumber(responseCards?.fatal_crash?.value);
  const nonFatalCrashValue = toMetricNumber(responseCards?.non_fatal_crash?.value);
  const totalCrashOutcomes = fatalCrashValue + nonFatalCrashValue;
  const responderAgentsTotal =
    responderAgentPagination?.total !== undefined && responderAgentPagination?.total !== null
      ? responderAgentPagination.total
      : responderAgentList.length > 0
        ? responderAgentList.length
        : null;
  const totalAgentsValue = pickMetricValue(
    responderAgentsTotal,
    responseCards?.total_agents?.value,
    dataItem?.stats?.total_agents,
    company?.total_agents,
    company?.agent_count,
    company?.agents_count,
    company?.total_responders,
    company?.responders_count
  );
  const activeAgentsValue = pickMetricValue(
    responseCards?.active_agents?.value,
    dataItem?.stats?.active_agents,
    company?.active_agents
  );
  const inactiveAgentsValue = Math.max(totalAgentsValue - activeAgentsValue, 0);

  const latestIncident = useMemo(() => {
    if (!tableRows.length) return null;

    return [...tableRows].sort((a, b) => parseDateTime(b) - parseDateTime(a))[0];
  }, [tableRows]);

  useEffect(() => {
    if (latestIncident) {
      setShowMainAlert(true);
    }
  }, [latestIncident?.id]);

  useEffect(() => {
    if (!selectedIncident?.id) return;

    const updatedIncident = tableRows.find((row) => row.id === selectedIncident.id);
    if (updatedIncident && updatedIncident !== selectedIncident) {
      setSelectedIncident(updatedIncident);
    }
  }, [selectedIncident, tableRows]);

  useEffect(() => {
    const apiCurrentPage = Number(tablePagination?.current_page);

    if (
      Number.isFinite(apiCurrentPage) &&
      apiCurrentPage > 0 &&
      apiCurrentPage !== currentPage
    ) {
      setCurrentPage(apiCurrentPage);
    }
  }, [currentPage, tablePagination?.current_page]);

  const carouselCards = useMemo(
    () => [
      {
        key: 'total_emergencies',
        title: responseCards?.total_emergencies?.title || 'Total Emergencies',
        value: responseCards?.total_emergencies?.value ?? 0,
        helperText: responseCards?.total_emergencies?.change?.text || '0 today',
        chartData: buildCardChartData(responseCards?.total_emergencies),
        chartColor: '#2E3192',
        icon: faTriangleExclamation,
        iconColor: '#2E3192',
        iconBackground: '#EEF2FF',
      },
      {
        key: 'total_agents',
        title: responseCards?.total_agents?.title || 'Total Agents',
        value: totalAgentsValue,
        helperText:
          responseCards?.total_agents?.change?.text || `${activeAgentsValue} active`,
        chartData:
          totalAgentsValue > 0 || activeAgentsValue > 0
            ? [
                { label: 'Inactive', value: inactiveAgentsValue },
                { label: 'Active', value: activeAgentsValue },
              ]
            : buildCardChartData(responseCards?.total_agents),
        chartColor: '#29A5DE',
        icon: faUsers,
        iconColor: '#29A5DE',
        iconBackground: '#EAF8FF',
      },
      {
        key: 'crash_outcomes',
        title: 'Fatal & Non-Fatal',
        value: totalCrashOutcomes,
        chartData: [
          { label: 'Fatal', value: fatalCrashValue },
          { label: 'Non-Fatal', value: nonFatalCrashValue },
        ],
        chartColor: '#FE5B65',
        details: [
          { label: 'Fatal', value: fatalCrashValue, color: '#FE5B65' },
          { label: 'Non-Fatal', value: nonFatalCrashValue, color: '#FE9431' },
        ],
        icon: faCarCrash,
        iconColor: '#FE5B65',
        iconBackground: '#FFF1F2',
      },
      {
        key: 'sos_requests',
        title: responseCards?.sos_requests?.title || 'SOS Requests',
        value: responseCards?.sos_requests?.value ?? 0,
        helperText: responseCards?.sos_requests?.change?.text || '0 today',
        chartData: buildCardChartData(responseCards?.sos_requests),
        chartColor: '#15AC77',
        icon: faPhoneVolume,
        iconColor: '#15AC77',
        iconBackground: '#EAFBF4',
      },
    ],
    [
      activeAgentsValue,
      fatalCrashValue,
      inactiveAgentsValue,
      nonFatalCrashValue,
      responseCards,
      totalAgentsValue,
      totalCrashOutcomes,
    ]
  );

  const tableData = useMemo(
    () =>
      tableRows.map((row) => ({
        ...row,
        device_number: row.device_number || 'N/A',
        emergency_id: row.emergency_id || 'N/A',
        type: row.type || 'N/A',
        severity: row.severity || 'N/A',
        priority: row.priority || 'N/A',
        assigned_phone: row.actions?.call_number || row.assigned_phone || 'N/A',
        incident_status: row.incident_status || 'N/A',
        actionIcons: [
          row.actions?.call_number ? 'phone' : null,
          row.actions?.can_view ? 'eye' : null,
          row.actions?.directions_url || row.actions?.map_url ? 'map' : null,
        ].filter(Boolean),
        action: 'action',
      })),
    [tableRows]
  );

  const columns = useMemo(
    () => [
      { header: '', accessor: 'select', width: '56px' },
      { header: 'DEVICE NUMBER', accessor: 'device_number' },
      { header: 'EMERGENCY ID', accessor: 'emergency_id' },
      { header: 'TYPE', accessor: 'type' },
      { header: 'SEVERITY', accessor: 'severity' },
      { header: 'PRIORITY', accessor: 'priority' },
      { header: 'ASSIGNED PHONE', accessor: 'assigned_phone' },
      { header: 'STATUS', accessor: 'incident_status' },
      { header: 'ACTION', accessor: 'action' },
    ],
    []
  );

  const dashboardMapCenter = useMemo(() => {
    const center = dataItem?.map?.center;
    const parsedCenter = toLatLng(center?.lat, center?.lng);

    if (parsedCenter) {
      return parsedCenter;
    }

    const firstLocation = mapLocations[0];
    return toLatLng(firstLocation?.latitude, firstLocation?.longitude) || defaultCenter;
  }, [dataItem, mapLocations]);

  const selectedLocation = useMemo(() => {
    if (!selectedIncident) return null;

    return (
      mapLocations.find(
        (location) =>
          location.incident_id === selectedIncident.id ||
          location.emergency_id === selectedIncident.emergency_id
      ) || null
    );
  }, [mapLocations, selectedIncident]);

  const selectedMapCenter = useMemo(() => {
    return (
      toLatLng(selectedLocation?.latitude, selectedLocation?.longitude) ||
      toLatLng(selectedIncident?.latitude, selectedIncident?.longitude) ||
      dashboardMapCenter
    );
  }, [dashboardMapCenter, selectedIncident, selectedLocation]);

  const dashboardMarkers = useMemo(
    () =>
      mapLocations
        .map((location) => ({
          key: location.incident_id || location.emergency_id,
          position: toLatLng(location.latitude, location.longitude),
        }))
        .filter((location) => location.position),
    [mapLocations]
  );

  const handleView = (row) => {
    setSelectedIncident(row);
    setShowMainAlert(false);

    if (token && row?.id) {
      dispatch(emergencyDetails({ token, id: row.id }));
    }
  };

  const dashboardMapUrl =
    dataItem?.map?.blade_view_url || dataItem?.map?.map_page_url || '';

  const openExternalUrl = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCall = (row) => {
    const callNumber = row?.actions?.call_number || row?.assigned_phone;

    if (callNumber) {
      window.location.href = `tel:${callNumber}`;
    }
  };

  const handleMap = (row) => {
    openExternalUrl(row?.actions?.directions_url || row?.actions?.map_url);
  };

  const handleCloseCase = async (incident) => {
    if (!token || !incident?.id) {
      return;
    }

    const isIncidentClosed =
      incident.closed_status === 1 ||
      incident.closed_status === '1' ||
      String(incident.incident_status || '').toLowerCase() === 'closed';
    const canClose =
      incident.actions?.can_close === true ||
      incident.actions?.can_close === 1 ||
      incident.actions?.can_close === '1';

    if (isIncidentClosed || !canClose) {
      return;
    }

    try {
      setClosingCaseId(incident.id);
      await dispatch(closeEmergencyCase({ token, id: incident.id })).unwrap();
      await Promise.all([
        dispatch(emergencyDetails({ token, id: incident.id })).unwrap(),
        dispatch(dashboardData({ token, page: currentPage })).unwrap(),
      ]);
    } catch (closeError) {
      console.error('Close case failed:', closeError);
    } finally {
      setClosingCaseId(null);
    }
  };

  const handlePageChange = (page) => {
    const lastPage = Number(tablePagination?.last_page) || 1;

    if (page < 1 || page > lastPage || page === currentPage) {
      return;
    }

    setCurrentPage(page);

    if (emergenciesTableRef.current) {
      emergenciesTableRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  };

  const renderDashboard = () => (
    <>
      <CardCarousel cards={carouselCards} />

      {latestIncident && showMainAlert && (
        <div className="notifications-container mt-4">
          <div
            className="alert-box d-block d-lg-flex justify-content-between p-3 mb-3"
            style={{
              border: '1px solid #FE5B65',
              borderRadius: '12px',
              position: 'relative',
            }}
          >
            <div className="d-flex">
              <div>
                <img src={Em} alt="" className="mx-3 my-3" />
              </div>
              <div>
                <div className="d-block d-lg-flex">
                  <p
                    style={{
                      color: '#FE5B65',
                      fontWeight: '600',
                      marginRight: '10px',
                      marginBottom: '0',
                    }}
                  >
                    Emergency Alert
                  </p>
                  <p
                    style={{
                      color: '#15AC77',
                      fontSize: '14px',
                      background: '#E8F7F1',
                      padding: '5px',
                      marginBottom: '0',
                    }}
                  >
                    <FontAwesomeIcon icon={faPhone} className="mx-2" />
                    Device Number: {latestIncident.device_number}
                  </p>
                </div>
                <p style={{ fontWeight: '600', marginBottom: '0' }}>
                  {latestIncident.nature_of_request || 'Accident detected'}
                </p>
                <div className="d-block d-lg-flex">
                  <FontAwesomeIcon
                    icon={faCrosshairs}
                    style={{
                      color: '#707A8F',
                      marginRight: '5px',
                      fontSize: '14px',
                      marginTop: '4px',
                    }}
                  />
                  <small style={{ color: '#707A8F', marginRight: '15px' }}>
                    Location: {latestIncident.latitude || 'N/A'},{' '}
                    {latestIncident.longitude || 'N/A'}
                  </small>
                  <small style={{ color: '#707A8F', marginRight: '5px' }}>
                    <FontAwesomeIcon icon={faCalendar} />
                  </small>
                  <small style={{ color: '#707A8F', marginRight: '15px' }}>
                    Date/Time: {formatDateTimeLabel(latestIncident)}
                  </small>
                  <small style={{ color: '#707A8F', marginRight: '5px' }}>
                    <FontAwesomeIcon icon={faCarCrash} />
                  </small>
                  <small style={{ color: '#707A8F' }}>
                    Type: {latestIncident.type || 'N/A'}
                  </small>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p
                style={{
                  color: '#FE5B65',
                  background: '#FFEFF0',
                  padding: '7px',
                }}
              >
                <img src={War} alt="" /> Severity: {latestIncident.severity || 'N/A'}
              </p>
            </div>
            <button
              onClick={() => setShowMainAlert(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                color: '#FE5B65',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div
        className="map-section px-4 py-4 mt-5"
        style={{
          backgroundColor: '#fff',
          border: '1px solid #d3d6dc',
          borderRadius: '20px',
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Emergency Map</h5>
          <small style={{ color: '#707A8F' }}>
            {dataItem?.map?.total_locations ?? dashboardMarkers.length} active
            location{(dataItem?.map?.total_locations ?? dashboardMarkers.length) === 1 ? '' : 's'}
          </small>
        </div>

        {dashboardMapUrl ? (
          <iframe
            src={dashboardMapUrl}
            title="Emergency map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: '100%',
              height: containerStyle.height,
              border: 0,
              borderRadius: containerStyle.borderRadius,
            }}
          />
        ) : (
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={dashboardMapCenter}
              zoom={Number(dataItem?.map?.zoom) || 10}
            >
              {dashboardMarkers.map((marker) => (
                <Marker key={marker.key} position={marker.position} />
              ))}
            </GoogleMap>
          </LoadScript>
        )}
      </div>

      <div ref={emergenciesTableRef} className="recent-section p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0">All Connected Devices</p>
          <small style={{ color: '#707A8F' }}>
            {dataItem?.table?.pagination?.total ?? tableData.length} total incident
            {(dataItem?.table?.pagination?.total ?? tableData.length) === 1 ? '' : 's'}
          </small>
        </div>

        {loading && !tableData.length ? (
          <div>Loading emergency data...</div>
        ) : error ? (
          <div>Error loading emergency data.</div>
        ) : (
          <>
            <Table
              columns={columns}
              data={tableData}
              onCall={handleCall}
              onMap={handleMap}
              onView={handleView}
              onRowClick={handleView}
              actionIcons={[]}
            />
            <div className="mt-3">
              <Pagination
                currentPage={Number(tablePagination?.current_page) || currentPage}
                lastPage={Number(tablePagination?.last_page) || 1}
                onPageChange={handlePageChange}
                totalItems={Number(tablePagination?.total) || tableData.length}
                perPage={Number(tablePagination?.per_page) || tableData.length || 1}
              />
            </div>
          </>
        )}
      </div>
    </>
  );

  const renderEmergencyDetails = () => {
    if (!selectedIncident) return null;

    const emergencyIncident =
      emergency?.incident?.id === selectedIncident.id ? emergency.incident : null;
    const rawIncident =
      emergency?.incident?.id === selectedIncident.id ? emergency.raw || {} : {};
    const detailIncident = emergencyIncident || selectedIncident;
    const callNumber =
      detailIncident.actions?.call_number || detailIncident.assigned_phone;
    const selectedIncidentEmbedMapUrl = buildGoogleEmbedMapUrl(
      detailIncident.latitude,
      detailIncident.longitude
    );
    const closedStatusValue =
      rawIncident.closed_status ?? detailIncident.closed_status;
    const closedStatusLabel =
      closedStatusValue === 1 || closedStatusValue === '1'
        ? 'Closed'
        : closedStatusValue === 0 || closedStatusValue === '0'
          ? 'Open'
          : 'N/A';
    const incidentStatusLabel =
      closedStatusValue === 1 || closedStatusValue === '1'
        ? 'Closed'
        : closedStatusValue === 0 || closedStatusValue === '0'
          ? 'Active'
          : 'N/A';
    const severityStyle =
      severityStyles[detailIncident.severity] || severityStyles['Non-Fatal'];
    const isIncidentActive =
      closedStatusValue === 0 || closedStatusValue === '0';
    const detailIsLoading = emergencyLoading && !emergencyIncident;
    const detailHasError = emergencyError && !emergencyIncident;
    const isIncidentClosed =
      closedStatusValue === 1 ||
      closedStatusValue === '1' ||
      String(detailIncident.incident_status || '').toLowerCase() === 'closed';
    const canClose =
      detailIncident.actions?.can_close === true ||
      detailIncident.actions?.can_close === 1 ||
      detailIncident.actions?.can_close === '1';
    const isCloseDisabled = isIncidentClosed || !canClose;
    const isClosingCase = closingCaseId === detailIncident.id;
    const closeCaseLabel = isIncidentClosed ? 'Closed' : 'Close Case';

    return (
      <>
        <div className="mt-3 d-block d-lg-flex justify-content-between align-items-center px-3">
          <button className="p-3 d-btn mb-3" onClick={() => setSelectedIncident(null)}>
            Back to dashboard
          </button>
          <div className="text-right">
            <h4 className="mb-1">Emergency: {detailIncident.emergency_id}</h4>
            <small style={{ color: '#707A8F' }}>
              {formatDateTimeLabel(detailIncident)}
            </small>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-sm-12 col-md-12 col-lg-9">
            <div
              className="jumbotron"
              style={{
                backgroundColor: '#fff',
                border: '2px solid #d3d6dc',
                borderRadius: '20px',
              }}
            >
              {detailIsLoading ? (
                <div className="py-5 text-center">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  >
                    <span className="sr-only"></span>
                  </div>
                  <h5 style={{ color: '#14181F' }}>Loading emergency details...</h5>
                  <p style={{ color: '#707A8F' }} className="mb-0">
                    Please wait while the incident page is being prepared.
                  </p>
                </div>
              ) : detailHasError ? (
                <div className="py-5 text-center">
                  <h5 style={{ color: '#14181F' }}>Unable to load emergency details</h5>
                  <p style={{ color: '#707A8F' }}>
                    {typeof emergencyError === 'string'
                      ? emergencyError
                      : emergencyError?.message || 'Something went wrong.'}
                  </p>
                  <button
                    className="p-3 d-btn"
                    onClick={() =>
                      token &&
                      selectedIncident?.id &&
                      dispatch(
                        emergencyDetails({ token, id: selectedIncident.id })
                      )
                    }
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="d-block d-lg-flex justify-content-between mb-5">
                    <div className="log">
                      <img src={Logo2} alt="" />
                    </div>
                    <div className="overview">
                      <p>Emergency Overview</p>
                      <div className="d-flex justify-content-between">
                        <p style={{ color: '#707A8F' }}>Emergency ID:</p>
                        <small className="d-block">{detailIncident.emergency_id}</small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p style={{ color: '#707A8F' }}>Device Number:</p>
                        <small className="d-block">{detailIncident.device_number}</small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p style={{ color: '#707A8F' }}>Type:</p>
                        <small className="d-block">{detailIncident.type}</small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p style={{ color: '#707A8F' }}>Severity:</p>
                        <small className="d-block">{detailIncident.severity}</small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p style={{ color: '#707A8F' }}>Priority:</p>
                        <small className="d-block">{detailIncident.priority}</small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p style={{ color: '#707A8F' }}>Incident Status:</p>
                        <small className="d-block">{detailIncident.incident_status}</small>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-sm-12 col-md-12 col-lg-6">
                      <p>Assignment Details</p>
                      <hr />
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                         Phone: <span className='stx ml-2'>{callNumber || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Assignment Source:<span className='stx ml-2'>{detailIncident.assignment_source || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Assigned At:<span className='stx ml-2'>{detailIncident.assigned_at || rawIncident.created_at || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Distance: <span className='stx ml-2'>{detailIncident.assignment_distance_km || '0.00'} km</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Request Accepted: <span className='stx ml-2'>{detailIncident.request_accepted ? 'Yes' : 'No'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Last Call Status: <span className='stx ml-2'>{detailIncident.last_call_status || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Nature of Request:{' '}
                        <span className='stx ml-2'>{detailIncident.nature_of_request || 'Accident detected'}</span>
                      </h6>
                    </div>

                    <div className="col-sm-12 col-md-12 col-lg-6">
                      <p>Responder Company</p>
                      <hr />
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Company: <span className='stx ml-2'>{company?.company_name || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Email: <span className='stx ml-2'>{company?.email || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Phone: <span className='stx ml-2'>{company?.phone || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Address: <span className='stx ml-2'>{company?.address || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Status:{' '}
                        <span
                          className={`ml-2 status-indicator ${isIncidentActive ? 'active' : isIncidentClosed ? 'closed' : ''}`}
                        >
                          {isIncidentActive ? (
                            <span className="status-signal" aria-hidden="true"></span>
                          ) : null}
                          <span className='stx'>{incidentStatusLabel}</span>
                        </span>
                      </h6>
                    </div>
                  </div>

                  <div
                    className="my-5 p-4"
                    style={{ background: '#F8FAFC', borderRadius: '12px' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">Location Snapshot</h5>
                        <small style={{ color: '#707A8F' }}>
                          Lat: {detailIncident.latitude || rawIncident.lat || 'N/A'} | Lng:{' '}
                          {detailIncident.longitude || rawIncident.log || 'N/A'}
                        </small>
                      </div>
                      <span
                        style={{
                          ...severityStyle,
                          padding: '8px 14px',
                          borderRadius: '999px',
                          fontWeight: '600',
                        }}
                      >
                        {detailIncident.severity || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-sm-12 col-md-12 col-lg-6">
                      <p>Incident Record</p>
                      <hr />
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Device ID: <span className='stx ml-2'>{rawIncident.deviceid || detailIncident.device_number || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Crash Type: <span className='stx ml-2'>{detailIncident.raw_type || rawIncident.accident_type || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Created At: <span className='stx ml-2'>{rawIncident.created_at || detailIncident.assigned_at || 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Closed Status: <span className='stx ml-2'>{closedStatusLabel}</span>
                      </h6>
                    </div>

                    <div className="col-sm-12 col-md-12 col-lg-6">
                      <p>Routing Metadata</p>
                      <hr />
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Responder Company ID: <span>{detailIncident.responder_company_id ?? rawIncident.responder_company_id ?? 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Responder User ID: <span className='stx ml-2'>{detailIncident.responder_user_id ?? rawIncident.responder_user_id ?? 'N/A'}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Assignment Attempts: <span className='stx ml-2'>{detailIncident.assignment_attempts ?? rawIncident.assignment_attempts ?? 0}</span>
                      </h6>
                      <h6 style={{ color: '#707A8F' }} className='ad'>
                        Raw Incident ID: <span className='stx ml-2'>{rawIncident.id ?? detailIncident.id ?? 'N/A'}</span>
                      </h6>
                    </div>
                  </div>

                  <div className="mt-4">
                    {selectedIncidentEmbedMapUrl ? (
                      <iframe
                        src={selectedIncidentEmbedMapUrl}
                        title={`Emergency map for ${detailIncident.emergency_id}`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        style={{
                          width: '100%',
                          height: containerStyle.height,
                          border: 0,
                          borderRadius: containerStyle.borderRadius,
                        }}
                      />
                    ) : (
                      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                        <GoogleMap
                          mapContainerStyle={containerStyle}
                          center={selectedMapCenter}
                          zoom={12}
                        >
                          <Marker position={selectedMapCenter} />
                        </GoogleMap>
                      </LoadScript>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-sm-12 col-md-12 col-lg-3">
            <div
              className="p-3 text-center my-4 my-lg-0"
              style={{
                backgroundColor: '#fff',
                border: '2px solid #d3d6dc',
                borderRadius: '20px',
              }}
            >
              <button
                className="sh-btn mb-2"
                onClick={() =>
                  openExternalUrl(detailIncident.actions?.directions_url)
                }
              >
                <FontAwesomeIcon icon={faLocationArrow} className="mr-2" />
                Open Directions
              </button>

              <button
                className="sh-btn"
                onClick={() => {
                  if (callNumber) {
                    window.location.href = `tel:${callNumber}`;
                  }
                }}
              >
                {isIncidentActive ? (
                  <span className="status-signal mr-2" aria-hidden="true"></span>
                ) : null}
                <FontAwesomeIcon icon={faPhoneVolume} className="mr-2" />
                Call Device
              </button>

              <button
                className="sh-btn mt-2 cl-btn"
                disabled={isCloseDisabled || isClosingCase}
                onClick={() => handleCloseCase(detailIncident)}
              >
                {isClosingCase ? 'Closing...' : closeCaseLabel}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {selectedIncident ? renderEmergencyDetails() : renderDashboard()}
    </>
  );
});

export default Card;
