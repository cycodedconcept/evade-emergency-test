import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faCarCrash,
  faCrosshairs,
  faDownload,
  faLocationArrow,
  faMapLocationDot,
  faPhone,
  faPhoneVolume,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import CardCarousel from './reusables/CardCarousel';
import Table from './reusables/Table';
import Pagination from './reusables/Pagination';
import { searchEmergencyCasesByStatus, closeEmergencyCase } from '../features/createSlice';
import { emergencyDetails } from '../features/dashboardSlice';
import { Com, Pink, Org, Act, Pad, Pink2, Org2, Act2, Logo2 } from '../assets';

const GOOGLE_MAPS_API_KEY = 'AIzaSyC2CKttNS1QGg-S0xkbWhYoA08OHuBWzmY';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '20px',
};

const defaultCenter = { lat: 6.5244, lng: 3.3792 };

const severityStyles = {
  Fatal: { color: '#FE5B65' },
  'Non-Fatal': { color: '#2E3192' },
};

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

const toMetricNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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

const formatDateTimeLabel = (row) => {
  if (row?.date_time) {
    return row.date_time;
  }

  return [row?.date, row?.time].filter(Boolean).join(' | ') || 'N/A';
};

const buildCardChartData = (card) => {
  const total = toMetricNumber(card?.value);
  const today = Math.max(toMetricNumber(card?.today), 0);

  return [
    { label: 'Earlier', value: Math.max(total - today, 0) },
    { label: 'Today', value: today },
  ];
};

const statusFilterOptions = [
  { label: 'Open Cases', value: 'open' },
  { label: 'Closed Cases', value: 'closed' },
];

const controlHeight = '48px';

const Emergencies = () => {
  const dispatch = useDispatch();
  const token = getStoredToken();
  const { loading, error, emergencySearchResults } = useSelector((state) => state.create);
  const { emergency, emergencyLoading, emergencyError } = useSelector((state) => state.dashboard);
  const [statusFilter, setStatusFilter] = useState('open');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [closingCaseId, setClosingCaseId] = useState(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    dispatch(
      searchEmergencyCasesByStatus({
        token,
        status: statusFilter,
        page: currentPage,
      })
    );
  }, [currentPage, dispatch, statusFilter, token]);

  const company = emergencySearchResults?.company || {};
  const responseCards = emergencySearchResults?.cards || {};
  const tableRows =
    emergencySearchResults?.table?.rows ||
    emergencySearchResults?.rows ||
    emergencySearchResults?.records ||
    [];
  const tablePagination =
    emergencySearchResults?.table?.pagination ||
    emergencySearchResults?.pagination ||
    {};

  useEffect(() => {
    if (!selectedIncident?.id) {
      return;
    }

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
        imageBase: Pad,
        image: Com,
      },
      {
        key: 'fatal_crash',
        title: responseCards?.fatal_crash?.title || 'Fatal Crash',
        value: responseCards?.fatal_crash?.value ?? 0,
        helperText: responseCards?.fatal_crash?.change?.text || '0 today',
        chartData: buildCardChartData(responseCards?.fatal_crash),
        chartColor: '#FE5B65',
        imageBase: Pink2,
        image: Pink,
      },
      {
        key: 'non_fatal_crash',
        title: responseCards?.non_fatal_crash?.title || 'Non-Fatal Crash',
        value: responseCards?.non_fatal_crash?.value ?? 0,
        helperText: responseCards?.non_fatal_crash?.change?.text || '0 today',
        chartData: buildCardChartData(responseCards?.non_fatal_crash),
        chartColor: '#FE9431',
        imageBase: Org2,
        image: Org,
      },
      {
        key: 'sos_requests',
        title: responseCards?.sos_requests?.title || 'SOS Requests',
        value: responseCards?.sos_requests?.value ?? 0,
        helperText: responseCards?.sos_requests?.change?.text || '0 today',
        chartData: buildCardChartData(responseCards?.sos_requests),
        chartColor: '#15AC77',
        imageBase: Act2,
        image: Act,
      },
    ],
    [responseCards]
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return tableRows;
    }

    return tableRows.filter((row) =>
      [
        row?.emergency_id,
        row?.device_number,
        row?.type,
        row?.severity,
        row?.priority,
        row?.incident_status,
        row?.nature_of_request,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    );
  }, [searchTerm, tableRows]);

  const tableData = useMemo(
    () =>
      filteredRows.map((row, index) => ({
        ...row,
        index: (currentPage - 1) * (Number(tablePagination?.per_page) || 10) + index + 1,
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
    [currentPage, filteredRows, tablePagination?.per_page]
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

  const selectedMapCenter = useMemo(
    () => toLatLng(selectedIncident?.latitude, selectedIncident?.longitude) || defaultCenter,
    [selectedIncident]
  );

  const handleView = (row) => {
    setSelectedIncident(row);

    if (token && row?.id) {
      dispatch(emergencyDetails({ token, id: row.id }));
    }
  };

  const openExternalUrl = (url) => {
    if (!url) {
      return;
    }

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
        dispatch(
          searchEmergencyCasesByStatus({
            token,
            status: statusFilter,
            page: currentPage,
          })
        ).unwrap(),
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
  };

  const renderStateMessage = (title, description) => (
    <div
      className="text-center py-5 mt-4"
      style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '20px' }}
    >
      <h5 style={{ color: '#14181F' }}>{title}</h5>
      <p className="mb-0" style={{ color: '#707A8F' }}>
        {description}
      </p>
    </div>
  );

  const renderListView = () => (
    <div className="py-3">
      <div className="d-block d-lg-flex justify-content-between align-items-center mb-2">
        <div>
          <h4 style={{ color: '#14181F' }} className="mb-1">
            Emergencies
          </h4>
          <p style={{ color: '#707A8F' }} className="mb-0">
            Review incidents by status and keep track of active response volume.
          </p>
        </div>
        <div className="mt-3 mt-lg-0">
          <button
            className="ex-btn"
            style={{ height: controlHeight, display: 'inline-flex', alignItems: 'center' }}
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {loading && !tableRows.length ? (
        renderStateMessage(
          'Loading emergency cases...',
          'Please wait while we fetch the latest incident list.'
        )
      ) : error && !tableRows.length ? (
        renderStateMessage(
          'Unable to load emergency cases',
          typeof error === 'string' ? error : error?.message || 'Something went wrong.'
        )
      ) : (
        <>
          <CardCarousel cards={carouselCards} />

          <div className="recent-section py-3">
            <div className="d-block d-lg-flex justify-content-between align-items-center mb-4">
              <div className="d-flex flex-column flex-lg-row align-items-lg-center">
                <div className="search-container mr-lg-3 mb-3 mb-lg-0" style={{ minWidth: '280px' }}>
                  <div className="position-relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search emergencies..."
                      className="form-control"
                      style={{
                        height: controlHeight,
                        padding: '0 16px 0 40px',
                        border: '2px solid #E8E8E9',
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        marginBottom: 0,
                      }}
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="position-absolute"
                      style={{
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#707A8F',
                      }}
                    />
                  </div>
                </div>

                <div className="d-flex flex-wrap align-items-center" style={{ gap: '10px' }}>
                  {statusFilterOptions.map((option) => {
                    const isActive = statusFilter === option.value;

                    return (
                      <button
                        key={option.value}
                        className={isActive ? 'ex-btn' : 'fil-btn'}
                        style={{ height: controlHeight, display: 'inline-flex', alignItems: 'center' }}
                        onClick={() => {
                          setCurrentPage(1);
                          setStatusFilter(option.value);
                        }}
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <small style={{ color: '#707A8F' }} className="mt-3 mt-lg-0 d-block">
                {Number(tablePagination?.total) || tableRows.length} total case
                {(Number(tablePagination?.total) || tableRows.length) === 1 ? '' : 's'}
              </small>
            </div>

            <Table
              columns={columns}
              data={tableData}
              onCall={handleCall}
              onMap={handleMap}
              onView={handleView}
              onRowClick={handleView}
              actionIcons={[]}
            />

            <div className="mt-4">
              <Pagination
                currentPage={Number(tablePagination?.current_page) || currentPage}
                lastPage={Number(tablePagination?.last_page) || 1}
                onPageChange={handlePageChange}
                totalItems={Number(tablePagination?.total) || tableData.length}
                perPage={Number(tablePagination?.per_page) || tableData.length || 10}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderEmergencyDetails = () => {
    if (!selectedIncident) {
      return null;
    }

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
    const severityStyle =
      severityStyles[detailIncident.severity] || severityStyles['Non-Fatal'];
    const companyStatus = String(company?.status || 'N/A');
    const isCompanyActive = companyStatus.toLowerCase() === 'active';
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
        <div className="mt-3 d-flex justify-content-between align-items-center px-3">
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
                          className={`ml-2 ${isCompanyActive ? 'status-indicator active' : 'status-indicator'}`}
                        >
                          {isCompanyActive ? (
                            <span className="status-signal" aria-hidden="true"></span>
                          ) : null}
                          <span className='stx'>{companyStatus}</span>
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
                        Raw Type: <span className='stx ml-2'>{detailIncident.raw_type || rawIncident.accident_type || 'N/A'}</span>
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
              className="p-3 text-center"
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
                className="sh-btn mb-2"
                onClick={() => openExternalUrl(detailIncident.actions?.map_url)}
              >
                <FontAwesomeIcon icon={faMapLocationDot} className="mr-2" />
                Open Map
              </button>

              <button
                className="sh-btn"
                onClick={() => {
                  if (callNumber) {
                    window.location.href = `tel:${callNumber}`;
                  }
                }}
              >
                <span className="status-signal mr-2" aria-hidden="true"></span>
                <FontAwesomeIcon icon={faPhoneVolume} className="mr-2" />
                Call Responder
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

  if (!token) {
    return renderStateMessage(
      'No active session found',
      'Please sign in again before loading emergency cases.'
    );
  }

  return (
    <>
      {selectedIncident ? renderEmergencyDetails() : renderListView()}
    </>
  );
};

export default Emergencies;
