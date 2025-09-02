import {
LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
RadialBarChart, RadialBar, BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot } from '@fortawesome/free-solid-svg-icons';

const crashData = [
  { day: 'Day 1', crashes: 7 },
  { day: 'Day 2', crashes: 6.5 },
  { day: 'Day 3', crashes: 7.2 },
  { day: 'Day 4', crashes: 8.5 },
  { day: 'Day 5', crashes: 9 },
  { day: 'Day 6', crashes: 7.5 },
  { day: 'Day 7', crashes: 6.2 },
];

const severity = [
  { name: 'Fatal', value: 65, fill: '#2F3EB1' },
  { name: 'Non-Fatal', value: 35, fill: '#3CCF91' },
];

const monthlyData = [
  { month: "Jan", collisions: 65, somersaults: 40, submersions: 20, sos: 30 },
  { month: "Feb", collisions: 260, somersaults: 180, submersions: 55, sos: 220 },
  { month: "Mar", collisions: 120, somersaults: 60, submersions: 45, sos: 100 },
  { month: "Apr", collisions: 200, somersaults: 90, submersions: 10, sos: 150 },
  { month: "May", collisions: 150, somersaults: 80, submersions: 40, sos: 140 },
  { month: "Jun", collisions: 230, somersaults: 160, submersions: 120, sos: 180 },
  { month: "Jul", collisions: 180, somersaults: 100, submersions: 60, sos: 150 },
  { month: "Aug", collisions: 140, somersaults: 70, submersions: 35, sos: 100 },
  { month: "Sep", collisions: 190, somersaults: 60, submersions: 50, sos: 90 },
  { month: "Oct", collisions: 250, somersaults: 120, submersions: 80, sos: 160 },
  { month: "Nov", collisions: 160, somersaults: 70, submersions: 30, sos: 120 },
  { month: "Dec", collisions: 100, somersaults: 50, submersions: 25, sos: 80 },
];

const powerData = [
  { name: "Present", value: 100, color: "#2E3192" },
  { name: "Present", value: 100, color: "#2E3192" },
  { name: "Present", value: 100, color: "#2E3192" },
  { name: "Not-Present", value: 100, color: "#2E3192" },
  { name: "Present", value: 100, color: "#2E3192" },
  { name: "Not-Present", value: 100, color: "#2E3192" },
  { name: "Present", value: 100, color: "#2E3192" },
  { name: "Not-Present", value: 100, color: "#2E3192" },
  { name: "NotPresent", value: 95, color: "#29A5DE" },
  { name: "Not-Present", value: 85, color: "#29A5DE" },
  { name: "Not-Present", value: 75, color: "#29A5DE" },
  { name: "Not-Present", value: 65, color: "#29A5DE" },
  { name: "Not-Present", value: 55, color: "#29A5DE" },
  { name: "Not-Present", value: 45, color: "#29A5DE" },
  { name: "Not-Present", value: 40, color: "#29A5DE" },
  { name: "Not-Present", value: 35, color: "#29A5DE" },
];



const signalData = [
  { name: "Strong", value: 115, color: "#2F3EB1" },
  { name: "Moderate", value: 30, color: "#3F83F8" },
  { name: "Weak", value: 5, color: "#F59E0B" },
];

const sensorData = [
  { name: "Working", value: 15, color: "#2F3EB1" },
  { name: "Faulty", value: 7, color: "#F59E0B" },
];


function CustomTooltip({ active, payload, label }) {
// Small card tooltip like the design
if (!active || !payload || !payload.length) return null;
const value = payload[0].value;
// Example delta display; in a real app compute actual delta.
const delta = "+0.2%";
return (
<div className="tooltip-card">
<div className="tooltip-dot" />
<div className="tooltip-body">
<div className="tooltip-label">{label}</div>
<div className="tooltip-value">↗ {value} <span className="tooltip-delta">{delta}</span></div>
</div>
</div>
);
}

export function CrashTrendsCard() {
return (
<div className="card dashboard-card mb-4">
<div className="card-body">
<div className="d-flex justify-content-between align-items-start mb-2">
<div>
<h5 className="card-title display-6 mb-1">Crash Trends</h5>
<p className="card-subtitle text-muted">Number of crashes per day over the last 7 days.</p>
</div>
<div className="dots vertical-dots">
     
    <div className="mt-3 d-flex justify-content-center">
      {/* Highlight the Day 5 label under the chart*/}
      <div className="day-highlight">Day 5</div>
    </div>
</div>

</div>
<div style={{ width: "100%", height: '370px' }}>
      <ResponsiveContainer>
        <LineChart data={crashData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid stroke="#ececec" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#9aa0a6" }} axisLine={false} />
          <YAxis domain={[0, 12]} tick={{ fill: "#9aa0a6" }} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {/* dashed vertical line at Day 5*/}
          <ReferenceLine x="Day 5" stroke="#3F3EB1" strokeDasharray="4 6" strokeWidth={2} />
          <Line
            type="monotone"
            dataKey="crashes"
            stroke="#2F3EB1"
            strokeWidth={3}
            dot={{ r: 4, stroke: "#2F3EB1", strokeWidth: 2, fill: "#fff" }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
</div>
</div>
)}

export function CrashSeverityCard() {
// compute center total and percentage for display
const total = severity.reduce((s, it) => s + it.value, 0);

return (
<div className="card dashboard-card">
<div className="card-body text-center">
<div className="mb-2">
<div>
<h5 className="card-title display-6 mb-1 text-left">Statistic</h5>
<p className="card-subtitle text-muted text-left">Crash severity distribution</p>
</div>
<div className="dots vertical-dots">
    <div className="radial-wrap">
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          cx="50%" cy="85%"
          innerRadius="60%"
          outerRadius="100%"
          barSize={20}
          startAngle={180}
          endAngle={0}
          data={severity}
        >
          <RadialBar minAngle={15} background clockWise dataKey="value" />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="radial-center mt-3">
        <div className="radial-total">Total</div>
        <div className="radial-percent">
          <span className="percent-num">10% </span>
          <span className="percent-label text-muted">↗ Crash Severity</span>
        </div>
      </div>
    </div>

    <p className="text-muted" style={{fontSize: '18px'}}>Show the distribution of crash severity (e.g., fatal vs. non-fatal).</p>

    <div className="d-flex justify-content-around mt-4">
      <div className="severity-item">
        <div><span className="legend-dot" style={{ background: severity[0].fill }} /> Fatal</div>
        <div className="severity-value"><strong>65%</strong> <span className="text-success small">↗</span></div>
      </div>
      <div className="severity-item">
        <div><span className="legend-dot" style={{ background: severity[1].fill }} /> Non-Fatal</div>
        <div className="severity-value"><strong>35%</strong> <span className="text-success small">↗</span></div>
      </div>
    </div>
</div>
</div>
</div>
</div>
)}


export function EmergencyChart() {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Statistic</h5>
        <p className="card-subtitle text-muted mb-3">Emergency types over the year.</p>

        {/* Summary Stats Row */}
        <div className="row text-center mb-4">
          <div className="col">
            <h4 className="mb-0">210 <span className="text-success small">5% ↑</span></h4>
            <small className="text-muted">Collisions</small>
          </div>
          <div className="col">
            <h4 className="mb-0">85 <span className="text-success small">2% ↑</span></h4>
            <small className="text-muted">Somersaults</small>
          </div>
          <div className="col">
            <h4 className="mb-0">43 <span className="text-success small">0.2% ↑</span></h4>
            <small className="text-muted">Submersions</small>
          </div>
          <div className="col">
            <h4 className="mb-0">24 <span className="text-success small">0.2% ↑</span></h4>
            <small className="text-muted">SOS Alerts</small>
          </div>
        </div>

        {/* Chart */}
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#6c757d" }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="collisions" name="Collisions" fill="#2E3192" radius={[6,6,0,0]} />
              <Bar dataKey="somersaults" name="Somersaults" fill="#29A5DE" radius={[6,6,0,0]} />
              <Bar dataKey="submersions" name="Submersions" fill="#FE9431" radius={[6,6,0,0]} />
              <Bar dataKey="sos" name="SOS Alerts" fill="#FE5B65" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function PowerSourceChart() {
  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
            <h5 className="card-title">Device Performance</h5>
            <p className="card-subtitle text-muted">Power Source</p>

            <small className="mt-4 d-block text-muted">Devices</small>
            <p className="bx">150</p>
            <ResponsiveContainer width="100%" height={120}>
                <BarChart data={powerData}>
                    <Bar dataKey="value" barSize={12} radius={[10, 10, 10, 10]}>
                    {powerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Bar>
                    <XAxis dataKey="name" hide />
                    <Tooltip />
                </BarChart>
            </ResponsiveContainer>

            <div className="d-flex justify-content-between my-4">
                <small className="d-block text-muted">total Devices</small>
                <small className="d-block text-muted">150</small>
            </div>

            <p className="text-center text-muted">Showing Power Source</p>
            <div className="d-flex justify-content-around mt-3">
            <div className="text-center">
                <span className="d-block"><FontAwesomeIcon icon={faCircleDot} width={10} styles={{color: '#2E3192'}}/>Present</span>
                <strong>60%</strong> <span className="text-success">↑</span>
            </div>
            <div className="text-center">
                <span className="d-block"><FontAwesomeIcon icon={faCircleDot} width={10} styles={{color: "#29A5DE"}}/>Not-Present</span>
                <strong>40%</strong> <span className="text-success">↑</span>
            </div>
            </div>
        </div>
      </div>
    </>
    
  );
}

export function SignalStrengthChart() {
  return (
    <div className="card shadow-sm">
        <div className="card-body">
            <h5 className="card-title">Device Performance</h5>
            <p className="card-subtitle text-muted">Power Source</p>

            <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie
                data={signalData}
                dataKey="value"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                >
                {signalData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                ))}
                </Pie>
            </PieChart>
            </ResponsiveContainer>

            <div className="d-flex justify-content-around mt-3">
            <div className="text-center">
                <span className="text-primary d-block">Present</span>
                <strong>60%</strong> <span className="text-success">↑</span>
            </div>
            <div className="text-center">
                <span className="text-info d-block">Not-Present</span>
                <strong>40%</strong> <span className="text-success">↑</span>
            </div>
            </div>
        </div>
    </div>
  );
}

export function SensorHealthChart() {
  return (
    <div className="card shadow-sm">
        <div className="card-body">
            <h5 className="card-title">Device Performance</h5>
            <p className="card-subtitle text-muted">Power Source</p>

            <ResponsiveContainer width="100%" height={150}>
            <PieChart>
                <Pie
                data={sensorData}
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                >
                {sensorData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                ))}
                </Pie>
            </PieChart>
            </ResponsiveContainer>

            <div className="d-flex justify-content-around mt-3">
            <div className="text-center">
                <span className="text-primary d-block">Present</span>
                <strong>60%</strong> <span className="text-success">↑</span>
            </div>
            <div className="text-center">
                <span className="text-info d-block">Not-Present</span>
                <strong>40%</strong> <span className="text-success">↑</span>
            </div>
            </div>
        </div>
    </div>
  );
}

