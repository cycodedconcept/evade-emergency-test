import React, { useId } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer } from 'recharts';

const buildFallbackChartData = (value) => {
  const safeValue = Number(value);

  return [
    { label: 'Earlier', value: Number.isFinite(safeValue) ? safeValue : 0 },
    { label: 'Today', value: 0 },
  ];
};

const CardComponent = ({
  title,
  icon,
  iconColor = '#2E3192',
  iconBackground = '#EEF2FF',
  imageBase,
  image,
  value,
  helperText,
  details = [],
  showHelperText = false,
  chartData = [],
  chartColor = '#2E3192',
}) => {
  const gradientId = `card-chart-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const hasChartData = Array.isArray(chartData) && chartData.length > 0;
  const safeChartData = hasChartData ? chartData : buildFallbackChartData(value);

  return (
    <>
        <div className="card-single p-3">
            <div className="d-flex justify-content-between">
                <div>
                    <p style={{color: "#707A8F", fontSize: '14px'}} className='mt-2'>{title}</p>
                </div>
                <div>
                    {icon ? (
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '14px',
                          background: iconBackground,
                          color: iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                        }}
                      >
                        <FontAwesomeIcon icon={icon} />
                      </div>
                    ) : (
                      <img src={image} alt="" className='w-75'/>
                    )}
                </div>
            </div>
            <div className="card-body-item">
                <p style={{fontSize: "20px"}}>{value}</p>
                {details.length ? (
                  <div className="card-metric-list">
                    {details.map((item) => (
                      <div className="card-metric-row" key={`${title}-${item.label}`}>
                        <span
                          className="card-metric-label"
                          style={item.color ? { color: item.color } : undefined}
                        >
                          {item.label}
                        </span>
                        <span className="card-metric-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : showHelperText && helperText ? (
                  <small className="card-helper-text">{helperText}</small>
                ) : null}
            </div>
            <div className="card-base">
                {hasChartData || !imageBase ? (
                  <>
                    <div className="card-mini-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={safeChartData}
                          margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
                              <stop offset="95%" stopColor={chartColor} stopOpacity={0.04} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="#EEF2F7" strokeDasharray="3 3" />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={chartColor}
                            strokeWidth={2.5}
                            fill={`url(#${gradientId})`}
                            activeDot={{ r: 4, fill: chartColor, strokeWidth: 0 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card-mini-chart-labels">
                      {safeChartData.map((item) => (
                        <span key={`${title}-${item.label}`}>{item.label}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <img src={imageBase} alt="" />
                )}
            </div>
        </div>
    </>
  )
}

export default CardComponent
