import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faClipboardList,
  faLocationDot,
  faPhoneVolume,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import CardCarousel from './reusables/CardCarousel';
import Table from './reusables/Table';
import Pagination from './reusables/Pagination';
import MissedCaseDetailsModal from '../components/MissedCaseDetailsModal';
import {
  fetchMissedCases,
  selectMissedCases,
  selectMissedCasesCompany,
  selectMissedCasesError,
  selectMissedCasesPagination,
  selectMissedCasesStats,
  selectMissedCasesStatus,
  setPage,
  setPerPage,
} from '../features/missedCasesSlice';
import {
  buildMissedCaseAttemptLookup,
  formatMissedCaseDateTime,
  formatMissedCaseRelativeTime,
  getDisplayValue,
  humanizeEnumValue,
} from '../utils/missedCaseUtils';

const PER_PAGE_OPTIONS = [10, 25, 50];
const CONTROL_HEIGHT = '48px';
const DISPLAY_FALLBACK = '—';

const badgeStyles = {
  neutral: {
    backgroundColor: '#F8FAFC',
    color: '#14181F',
  },
  primary: {
    backgroundColor: '#EEF2FF',
    color: '#2E3192',
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

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const sanitizePerPage = (value) => {
  const parsed = Number(value);
  return PER_PAGE_OPTIONS.includes(parsed) ? parsed : 10;
};

const buildMiniChartData = (value) => [
  { label: 'Earlier', value: 0 },
  { label: 'Now', value: Number(value) || 0 },
];

const createSkeletonLine = (width) => (
  <div
    style={{
      width,
      height: '12px',
      borderRadius: '999px',
      backgroundColor: '#E8E8E9',
    }}
  />
);

const renderBadge = (label, tone = 'neutral') => (
  <span
    style={{
      ...(badgeStyles[tone] || badgeStyles.neutral),
      borderRadius: '999px',
      padding: '6px 12px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'none',
      maxWidth: '100%',
    }}
  >
    {label}
  </span>
);

const getPriorityTone = (row) => {
  const priorityValue = String(row?.priority || '').toUpperCase();
  const severityValue = String(row?.severity || '').toUpperCase();

  if (priorityValue === 'HIGH' || severityValue === 'FATAL') {
    return 'danger';
  }

  if (priorityValue === 'MEDIUM') {
    return 'warning';
  }

  return 'neutral';
};

const getStatusTone = (value) => {
  const normalizedValue = String(value || '').toLowerCase();

  if (
    normalizedValue.includes('failed') ||
    normalizedValue.includes('fatal') ||
    normalizedValue.includes('reassigned')
  ) {
    return 'danger';
  }

  if (normalizedValue.includes('assigned') || normalizedValue.includes('pending')) {
    return 'warning';
  }

  if (normalizedValue.includes('requested')) {
    return 'primary';
  }

  return 'neutral';
};

const renderStateMessage = (title, description, action = null) => (
  <div
    className="text-center py-5 mt-4"
    style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '20px' }}
  >
    <h5 style={{ color: '#14181F' }}>{title}</h5>
    <p className="mb-0" style={{ color: '#707A8F' }}>
      {description}
    </p>
    {action ? <div className="mt-3">{action}</div> : null}
  </div>
);

const MissedCases = () => {
  const dispatch = useDispatch();
  const token = getStoredToken();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMissedCase, setSelectedMissedCase] = useState(null);
  const rows = useSelector(selectMissedCases);
  const pagination = useSelector(selectMissedCasesPagination);
  const company = useSelector(selectMissedCasesCompany);
  const stats = useSelector(selectMissedCasesStats);
  const status = useSelector(selectMissedCasesStatus);
  const error = useSelector(selectMissedCasesError);
  const rawQueryPage = searchParams.get('page');
  const rawQueryPerPage = searchParams.get('perPage');
  const queryPage = sanitizePage(rawQueryPage);
  const queryPerPage = sanitizePerPage(rawQueryPerPage);
  const currentPage =
    status === 'succeeded'
      ? sanitizePage(pagination?.current_page || queryPage)
      : queryPage;
  const perPage =
    status === 'succeeded'
      ? sanitizePerPage(pagination?.per_page || queryPerPage)
      : queryPerPage;

  useEffect(() => {
    if (rawQueryPage === String(queryPage) && rawQueryPerPage === String(queryPerPage)) {
      return;
    }

    setSearchParams(
      {
        page: String(queryPage),
        perPage: String(queryPerPage),
      },
      { replace: true }
    );
  }, [queryPage, queryPerPage, rawQueryPage, rawQueryPerPage, setSearchParams]);

  useEffect(() => {
    if (status !== 'succeeded') {
      return;
    }

    if (rawQueryPage === String(currentPage) && rawQueryPerPage === String(perPage)) {
      return;
    }

    setSearchParams(
      {
        page: String(currentPage),
        perPage: String(perPage),
      },
      { replace: true }
    );
  }, [
    currentPage,
    perPage,
    rawQueryPage,
    rawQueryPerPage,
    setSearchParams,
    status,
  ]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const request = dispatch(
      fetchMissedCases({
        page: queryPage,
        perPage: queryPerPage,
      })
    );

    return () => {
      request.abort();
    };
  }, [dispatch, queryPage, queryPerPage, token]);

  useEffect(() => {
    if (!selectedMissedCase?.id) {
      return;
    }

    const nextSelectedRow = rows.find((row) => row.id === selectedMissedCase.id);

    if (!nextSelectedRow) {
      setSelectedMissedCase(null);
      return;
    }

    if (nextSelectedRow !== selectedMissedCase) {
      setSelectedMissedCase(nextSelectedRow);
    }
  }, [rows, selectedMissedCase]);

  const attemptLookup = useMemo(() => buildMissedCaseAttemptLookup(rows), [rows]);

  const skeletonRows = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        id: `missed-case-skeleton-${index}`,
        disableRowClick: true,
        isSkeleton: true,
      })),
    []
  );

  const cards = useMemo(() => {
    const isInitialLoading = status === 'loading' && !rows.length;
    const isPageLoading = status === 'loading';

    return [
      {
        key: 'total_missed_cases',
        title: 'Total Missed Cases',
        value: isInitialLoading ? DISPLAY_FALLBACK : stats.totalMissedCases,
        helperText: 'All time',
        showHelperText: true,
        chartData: buildMiniChartData(stats.totalMissedCases),
        chartColor: '#2E3192',
        icon: faTriangleExclamation,
        iconColor: '#2E3192',
        iconBackground: '#EEF2FF',
      },
      {
        key: 'incidents_affected',
        title: 'Incidents Affected',
        value: isPageLoading ? DISPLAY_FALLBACK : stats.incidentsAffected,
        helperText: 'This page',
        showHelperText: true,
        chartData: buildMiniChartData(stats.incidentsAffected),
        chartColor: '#29A5DE',
        icon: faClipboardList,
        iconColor: '#29A5DE',
        iconBackground: '#EAF8FF',
      },
      {
        key: 'call_failures',
        title: 'Call Failures',
        value: isPageLoading ? DISPLAY_FALLBACK : stats.callFailures,
        helperText: 'This page',
        showHelperText: true,
        chartData: buildMiniChartData(stats.callFailures),
        chartColor: '#FE5B65',
        icon: faPhoneVolume,
        iconColor: '#FE5B65',
        iconBackground: '#FFF1F2',
      },
      {
        key: 'missing_location',
        title: 'Missing Location',
        value: isPageLoading ? DISPLAY_FALLBACK : stats.missingLocation,
        helperText: 'This page',
        showHelperText: true,
        chartData: buildMiniChartData(stats.missingLocation),
        chartColor: '#FE9431',
        icon: faLocationDot,
        iconColor: '#FE9431',
        iconBackground: '#FFF5EA',
      },
    ];
  }, [rows.length, stats, status]);

  const handleRetry = () => {
    if (!token) {
      return;
    }

    dispatch(
      fetchMissedCases({
        page: queryPage,
        perPage: queryPerPage,
      })
    );
  };

  const handlePageChange = (nextPage) => {
    if (nextPage === queryPage) {
      return;
    }

    dispatch(setPage(nextPage));
    setSearchParams(
      {
        page: String(nextPage),
        perPage: String(queryPerPage),
      },
      { replace: false }
    );
  };

  const handlePerPageChange = (nextPerPage) => {
    if (nextPerPage === queryPerPage) {
      return;
    }

    dispatch(setPerPage(nextPerPage));
    setSearchParams(
      {
        page: '1',
        perPage: String(nextPerPage),
      },
      { replace: false }
    );
  };

  const tableRows = status === 'loading' ? skeletonRows : rows;

  const columns = useMemo(
    () => [
      {
        header: 'CASE',
        accessor: 'case',
        render: (row) => {
          if (row?.isSkeleton) {
            return (
              <div className="d-flex justify-content-between align-items-start" style={{ gap: '12px' }}>
                <div style={{ width: '100%' }}>
                  {createSkeletonLine('110px')}
                  <div className="mt-2">{createSkeletonLine('90px')}</div>
                </div>
              </div>
            );
          }

          const attemptNumber = attemptLookup[row.id];

          return (
            <div className="d-flex justify-content-between align-items-start" style={{ gap: '12px' }}>
              <div>
                <div style={{ color: '#14181F', fontWeight: '700' }}>
                  {getDisplayValue(row?.emergency_id, DISPLAY_FALLBACK)}
                </div>
                <div className="d-flex flex-wrap align-items-center mt-1" style={{ gap: '8px' }}>
                  <span style={{ color: '#707A8F' }}>
                    #{getDisplayValue(row?.incident_id, DISPLAY_FALLBACK)}
                  </span>
                  {attemptNumber > 1 ? (
                    <span
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E8E8E9',
                        color: '#707A8F',
                        borderRadius: '999px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}
                    >
                      Attempt {attemptNumber}
                    </span>
                  ) : null}
                </div>
              </div>
              <FontAwesomeIcon icon={faChevronRight} style={{ color: '#707A8F' }} />
            </div>
          );
        },
      },
      {
        header: 'TYPE',
        accessor: 'type',
        render: (row) => {
          if (row?.isSkeleton) {
            return (
              <div>
                {createSkeletonLine('100px')}
                <div className="mt-2">{createSkeletonLine('130px')}</div>
              </div>
            );
          }

          return (
            <div>
              <div style={{ color: '#14181F', fontWeight: '600' }}>
                {getDisplayValue(row?.type, DISPLAY_FALLBACK)}
              </div>
              <div className="mt-1" style={{ color: '#707A8F' }}>
                {humanizeEnumValue(row?.nature_of_request, DISPLAY_FALLBACK)}
              </div>
            </div>
          );
        },
      },
      {
        header: 'PRIORITY',
        accessor: 'priority',
        render: (row) => {
          if (row?.isSkeleton) {
            return createSkeletonLine('120px');
          }

          return renderBadge(
            `${getDisplayValue(row?.severity, DISPLAY_FALLBACK)} · ${getDisplayValue(row?.priority, DISPLAY_FALLBACK)}`,
            getPriorityTone(row)
          );
        },
      },
      {
        header: 'RESPONDER',
        accessor: 'responder',
        render: (row) => {
          if (row?.isSkeleton) {
            return (
              <div>
                {createSkeletonLine('110px')}
                <div className="mt-2">{createSkeletonLine('120px')}</div>
              </div>
            );
          }

          const assignedPhone = getDisplayValue(row?.assigned_phone, '');

          return (
            <div>
              <div style={{ color: '#14181F', fontWeight: '600' }}>
                {getDisplayValue(row?.responder_user_name, DISPLAY_FALLBACK)}
              </div>
              <div className="mt-1">
                {assignedPhone ? (
                  <a href={`tel:${assignedPhone}`} style={{ color: '#707A8F' }}>
                    {assignedPhone}
                  </a>
                ) : (
                  <span style={{ color: '#707A8F' }}>{DISPLAY_FALLBACK}</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        header: 'REASON',
        accessor: 'reason',
        render: (row) => {
          if (row?.isSkeleton) {
            return (
              <div>
                {createSkeletonLine('110px')}
                <div className="mt-2">{createSkeletonLine('120px')}</div>
              </div>
            );
          }

          return (
            <div>
              {renderBadge(
                humanizeEnumValue(row?.miss_reason, DISPLAY_FALLBACK),
                getStatusTone(row?.miss_reason)
              )}
              <div className="mt-2" style={{ color: '#707A8F' }}>
                {humanizeEnumValue(row?.miss_stage, DISPLAY_FALLBACK)}
              </div>
            </div>
          );
        },
      },
      {
        header: 'STATUS AT MISS',
        accessor: 'statusAtMiss',
        render: (row) => {
          if (row?.isSkeleton) {
            return createSkeletonLine('110px');
          }

          return renderBadge(
            humanizeEnumValue(row?.incident_status_at_miss, DISPLAY_FALLBACK),
            getStatusTone(row?.incident_status_at_miss)
          );
        },
      },
      {
        header: 'MISSED',
        accessor: 'missed',
        render: (row) => {
          if (row?.isSkeleton) {
            return (
              <div>
                {createSkeletonLine('90px')}
                <div className="mt-2">{createSkeletonLine('110px')}</div>
              </div>
            );
          }

          const fullTimestamp = formatMissedCaseDateTime(row?.missed_at, {
            fallback: DISPLAY_FALLBACK,
          });

          return (
            <div>
              <span title={fullTimestamp} style={{ color: '#14181F', fontWeight: '600' }}>
                {formatMissedCaseRelativeTime(row?.missed_at, {
                  fallback: DISPLAY_FALLBACK,
                })}
              </span>
            </div>
          );
        },
      },
    ],
    [attemptLookup]
  );

  const emptyState =
    status === 'succeeded' && !rows.length
      ? renderStateMessage(
          'No missed cases',
          'There are no missed responder events to show right now.'
        )
      : null;

  return (
    <div className="py-3">
      <div className="d-block d-lg-flex justify-content-between align-items-center mb-2">
        <div>
          <h4 style={{ color: '#14181F' }} className="mb-1">
            Missed Cases
          </h4>
          <p style={{ color: '#707A8F' }} className="mb-0">
            {company?.company_name || DISPLAY_FALLBACK}
          </p>
          <small style={{ color: '#707A8F' }}>
            Showing {Number(pagination?.from) || 0}–{Number(pagination?.to) || 0} of{' '}
            {Number(pagination?.total) || 0}
          </small>
        </div>
      </div>

      <CardCarousel cards={cards} />

      {status === 'failed' && !rows.length ? (
        renderStateMessage(
          'Unable to load missed cases',
          error || 'Something went wrong.',
          <button type="button" className="d-btn" onClick={handleRetry}>
            Retry
          </button>
        )
      ) : (
        <div className="recent-section py-3">
          <div className="d-block d-lg-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 style={{ color: '#14181F' }} className="mb-1">
                Recent missed events
              </h5>
              <p style={{ color: '#707A8F' }} className="mb-0">
                Each row represents a miss event. Open a row to review assignment context and location quality.
              </p>
            </div>

            <div className="mt-3 mt-lg-0" style={{ minWidth: '160px' }}>
              <select
                aria-label="Select missed cases per page"
                value={perPage}
                onChange={(event) => handlePerPageChange(Number(event.target.value))}
                style={{
                  height: CONTROL_HEIGHT,
                  marginBottom: 0,
                  border: '2px solid #E8E8E9',
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                }}
              >
                {PER_PAGE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value} / page
                  </option>
                ))}
              </select>
            </div>
          </div>

          {emptyState ? (
            emptyState
          ) : (
            <>
              <Table
                columns={columns}
                data={tableRows}
                onRowClick={status === 'loading' ? undefined : setSelectedMissedCase}
                showSelectionColumn={false}
                getRowKey={(row) => row.id}
              />

              <div className="mt-4 d-block d-lg-flex justify-content-between align-items-center" style={{ gap: '16px' }}>
                <Pagination
                  currentPage={currentPage}
                  lastPage={Number(pagination?.last_page) || 1}
                  onPageChange={handlePageChange}
                  totalItems={Number(pagination?.total) || 0}
                  perPage={perPage}
                />
              </div>
            </>
          )}
        </div>
      )}

      <MissedCaseDetailsModal
        isOpen={Boolean(selectedMissedCase)}
        missedCase={selectedMissedCase}
        onClose={() => setSelectedMissedCase(null)}
      />
    </div>
  );
};

export default MissedCases;
