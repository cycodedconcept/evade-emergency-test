import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { analysisDashboardData } from '../features/analysis';

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

const formatErrorMessage = (error) => {
  if (!error) {
    return 'Something went wrong.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return error.message || 'Something went wrong.';
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E8E8E9',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 10px 30px rgba(20, 24, 31, 0.08)',
      }}
    >
      <div style={{ color: '#14181F', fontWeight: 600, marginBottom: '8px' }}>{label}</div>
      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="d-flex justify-content-between"
          style={{ gap: '20px', color: '#707A8F', fontSize: '13px' }}
        >
          <span>{item.name}</span>
          <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const Reports = () => {
  const dispatch = useDispatch();
  const token = getStoredToken();
  const { loading, error, dataItem } = useSelector((state) => state.analysis);

  useEffect(() => {
    if (!token) {
      return;
    }

    dispatch(analysisDashboardData({ token }));
  }, [dispatch, token]);

  const filters = dataItem?.filters || {};
  const crashTrends = dataItem?.crash_trends || {};
  const severityDistribution = dataItem?.severity_distribution || {};
  const emergencyTypeStatistics = dataItem?.emergency_type_statistics || {};

  const crashTrendData = useMemo(
    () =>
      (crashTrends?.rows || []).map((row) => ({
        label: row?.display_label || row?.day_label || row?.date || 'N/A',
        totalCrashes: toMetricNumber(row?.total_crashes),
        fatal: toMetricNumber(row?.fatal),
        nonFatal: toMetricNumber(row?.non_fatal),
      })),
    [crashTrends]
  );

  const severityChartData = useMemo(
    () =>
      (severityDistribution?.chart || []).map((item, index) => ({
        ...item,
        value: toMetricNumber(item?.value),
        percentage: toMetricNumber(item?.percentage),
        fill: index === 0 ? '#2E3192' : index === 1 ? '#15AC77' : '#FE9431',
      })),
    [severityDistribution]
  );

  const monthlyEmergencyData = useMemo(
    () =>
      (emergencyTypeStatistics?.rows || []).map((row) => ({
        month: row?.month || 'N/A',
        collisions: toMetricNumber(row?.collisions),
        somersaults: toMetricNumber(row?.somersaults),
        submersions: toMetricNumber(row?.submersions),
        sosAlerts: toMetricNumber(row?.sos_alerts),
      })),
    [emergencyTypeStatistics]
  );

  const emergencySummaryItems = useMemo(
    () => [
      emergencyTypeStatistics?.summary?.collisions,
      emergencyTypeStatistics?.summary?.somersaults,
      emergencyTypeStatistics?.summary?.submersions,
      emergencyTypeStatistics?.summary?.sos_alerts,
    ].filter(Boolean),
    [emergencyTypeStatistics]
  );

  if (!token) {
    return renderStateMessage(
      'No active session found',
      'Please sign in again before viewing analysis data.'
    );
  }

  if (loading && !Object.keys(dataItem || {}).length) {
    return renderStateMessage(
      'Loading analysis dashboard...',
      'Please wait while the responder analysis data is being prepared.'
    );
  }

  if (error && !Object.keys(dataItem || {}).length) {
    return renderStateMessage('Unable to load analytics', formatErrorMessage(error));
  }

  return (
    <>
      <div className="p-3">
        <h4 className='font-weight-bold'>Analytics</h4>
        <p><span className='font-weight-bold' style={{color: '#2E3192'}}>Dashboard</span><FontAwesomeIcon icon={faChevronRight} className='mx-2' style={{color: '#9FA6B4', fontSize: '13px'}}/> <span style={{color: '#707A8F'}}>Analytics</span></p>
      </div>

      <div className="px-3 mb-4">
        <div className="d-flex flex-wrap report-filter-row" style={{ gap: '12px' }}>
          <div
            className="px-3 py-2"
            style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '999px' }}
          >
            <small style={{ color: '#707A8F' }}>Year</small>
            <div style={{ color: '#14181F', fontWeight: 600 }}>{filters?.year || 'N/A'}</div>
          </div>
          <div
            className="px-3 py-2"
            style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '999px' }}
          >
            <small style={{ color: '#707A8F' }}>Status</small>
            <div style={{ color: '#14181F', fontWeight: 600, textTransform: 'capitalize' }}>
              {filters?.status || 'N/A'}
            </div>
          </div>
          <div
            className="px-3 py-2"
            style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '999px' }}
          >
            <small style={{ color: '#707A8F' }}>Trend Window</small>
            <div style={{ color: '#14181F', fontWeight: 600 }}>
              {filters?.trend_days || 0} days
            </div>
          </div>
        </div>
      </div>

      <div className="my-4 px-3">
        <div className="row">
          <div className="col-md-8">
            <div className="card dashboard-card mb-4 border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4">
                <h5 className="card-title mb-1">
                  {crashTrends?.title || 'Crash Trends'}
                </h5>
                <p className="card-subtitle text-muted mb-4">
                  {crashTrends?.subtitle || 'Number of crashes per day over the selected trend window.'}
                </p>
                <div className="report-chart-scroll">
                  <div className="report-chart-frame" style={{ height: '360px' }}>
                    <ResponsiveContainer>
                      <LineChart data={crashTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                        <CartesianGrid stroke="#EEF2F7" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#707A8F' }} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: '#707A8F' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="totalCrashes"
                          name="Total Crashes"
                          stroke="#2E3192"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="fatal"
                          name="Fatal"
                          stroke="#FE5B65"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="nonFatal"
                          name="Non-Fatal"
                          stroke="#15AC77"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card dashboard-card border-0 shadow-sm h-100"
              style={{ borderRadius: '20px', overflow: 'hidden' }}
            >
              <div className="card-body p-4 d-flex flex-column h-100">
                <h5 className="card-title mb-1">
                  {severityDistribution?.title || 'Statistic'}
                </h5>
                <p className="card-subtitle text-muted mb-4">
                  {severityDistribution?.subtitle || 'Crash severity distribution'}
                </p>
                <div style={{ width: '100%', height: '220px', flexShrink: 0 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={severityChartData}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {severityChartData.map((item) => (
                          <Cell key={item.label} fill={item.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mb-4" style={{ flexShrink: 0 }}>
                  <small style={{ color: '#707A8F' }}>Total Cases</small>
                  <div style={{ color: '#14181F', fontSize: '28px', fontWeight: 700 }}>
                    {toMetricNumber(severityDistribution?.total)}
                  </div>
                </div>
                <div className="mt-auto" style={{ display: 'grid', gap: '12px' }}>
                  {severityChartData.map((item) => (
                    <div
                      key={item.label}
                      className="d-flex justify-content-between align-items-center"
                      style={{ gap: '12px', flexWrap: 'wrap' }}
                    >
                      <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: item.fill,
                            display: 'inline-block',
                            marginRight: '10px',
                          }}
                        />
                        <span style={{ color: '#14181F', fontWeight: 500 }}>{item.label}</span>
                      </div>
                      <div style={{ color: '#707A8F', textAlign: 'right' }}>
                        {item.value} ({item.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '20px' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-1">
              {emergencyTypeStatistics?.title || 'Statistic'}
            </h5>
            <p className="card-subtitle text-muted mb-4">
              {emergencyTypeStatistics?.subtitle || 'Emergency types over the year.'}
            </p>

            <div className="row text-center mb-4 report-summary-grid">
              {emergencySummaryItems.map((item) => (
                <div className="col-sm-6 col-xl-3 mb-3 mb-xl-0" key={item.label}>
                  <div
                    className="h-100 px-3 py-3 report-summary-tile"
                    style={{ background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E8E8E9' }}
                  >
                    <small style={{ color: '#707A8F' }}>{item.label}</small>
                    <div style={{ color: '#14181F', fontSize: '26px', fontWeight: 700 }}>
                      {toMetricNumber(item.value)}
                    </div>
                    <small style={{ color: '#15AC77' }}>{item?.change?.text || '0%'}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="report-chart-scroll">
              <div className="report-chart-frame" style={{ height: 360 }}>
                <ResponsiveContainer>
                  <BarChart data={monthlyEmergencyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F7" />
                    <XAxis dataKey="month" tick={{ fill: '#707A8F' }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#707A8F' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="collisions" name="Collisions" fill="#2E3192" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="somersaults" name="Somersaults" fill="#29A5DE" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="submersions" name="Submersions" fill="#FE9431" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="sosAlerts" name="SOS Alerts" fill="#FE5B65" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 my-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4">
                <h5 className="mb-1">Daily Crash Breakdown</h5>
                <p className="text-muted mb-4">Daily trend rows returned from the analysis endpoint.</p>
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Total</th>
                        <th>Fatal</th>
                        <th>Non-Fatal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crashTrends?.rows?.length ? (
                        crashTrends.rows.map((row) => (
                          <tr key={row.date}>
                            <td>{row.display_label || row.day_label || row.date}</td>
                            <td>{toMetricNumber(row.total_crashes)}</td>
                            <td>{toMetricNumber(row.fatal)}</td>
                            <td>{toMetricNumber(row.non_fatal)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center" style={{ color: '#707A8F' }}>
                            No crash trend data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 my-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4">
                <h5 className="mb-1">Monthly Emergency Breakdown</h5>
                <p className="text-muted mb-4">Yearly emergency type totals returned from the analysis endpoint.</p>
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Collisions</th>
                        <th>Somersaults</th>
                        <th>Submersions</th>
                        <th>SOS Alerts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyEmergencyData.length ? (
                        monthlyEmergencyData.map((row) => (
                          <tr key={row.month}>
                            <td>{row.month}</td>
                            <td>{row.collisions}</td>
                            <td>{row.somersaults}</td>
                            <td>{row.submersions}</td>
                            <td>{row.sosAlerts}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center" style={{ color: '#707A8F' }}>
                            No monthly statistics available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="px-3 pb-3 text-danger" style={{ fontSize: '14px' }}>
          {formatErrorMessage(error)}
        </div>
      ) : null}
    </>
  )
}

export default Reports
