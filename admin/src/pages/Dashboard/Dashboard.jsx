import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats } from '../../redux/slices/grievanceSlice';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#388bfd', '#a371f7', '#3fb950', '#f85149', '#e3b341', '#8957e5'];
const PIE_COLORS = ['#3fb950', '#e3b341', '#f85149', '#388bfd']; 

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(13, 17, 34, 0.9)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>{label}</p>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }}></div>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }}></span>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.grievances);
  const [timeRange, setTimeRange] = useState('daily');

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  if (isLoading && !stats) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Initializing Analytics Engine...</p>
      </div>
    );
  }

  const trendData = stats?.trends?.[timeRange] || [];
  
  const categoryData = stats?.categoryDistribution?.map(c => ({
      name: c._id || 'Uncategorized',
      value: c.count
  })) || [];

  const statusData = [
      { name: 'Resolved', value: stats?.grievances?.resolved || 0 },
      { name: 'Pending', value: stats?.grievances?.applied || 0 },
      { name: 'In Progress', value: stats?.grievances?.inProgress || 0 },
      { name: 'Verification', value: stats?.grievances?.done || 0 },
  ].filter(d => d.value > 0);

  const locationData = stats?.grievancesByLocation?.map(l => ({
      name: l.locationDetails[0]?.locationName || 'Unknown',
      Reported: l.count,
      Resolved: l.statusBreakdown.resolved
  })).slice(0, 5) || [];

  return (
    <div className="dashboard-container page-container">
      {/* Dynamic Background */}
      <div className="dashboard-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <header className="dashboard-header">
        <h1 className="dashboard-title">Analytics Engine</h1>
        <p className="dashboard-subtitle">
          Real-time insights across {stats?.locations || 0} facility zones. Monitor lifecycle trends and student care reports.
        </p>
      </header>

      {/* KPI Section */}
      <section className="stats-grid">
        <div className="stat-card glass-card highlight">
            <div className="stat-header">
               <span className="stat-label">Total Volume</span>
               <Activity size={18} color="#388bfd" />
            </div>
            <span className="stat-value">{stats?.grievances?.total || 0}</span>
            <div className="stat-trend">Cumulative incidents logged</div>
        </div>
        
        <div className="stat-card glass-card">
            <div className="stat-header">
               <span className="stat-label">Success Rate</span>
               <CheckCircle2 size={18} color="#3fb950" />
            </div>
            <span className="stat-value" style={{ color: '#3fb950' }}>{stats?.grievances?.percentageResolved || 0}%</span>
            <div className="stat-trend" style={{ color: '#3fb950', display: 'flex', alignItems: 'center', gap: '4px' }}>
               <TrendingUp size={14}/> {stats?.grievances?.resolved || 0} Resolved
            </div>
        </div>

        <div className="stat-card glass-card">
            <div className="stat-header">
               <span className="stat-label">Action Required</span>
               <AlertCircle size={18} color="#e3b341" />
            </div>
            <span className="stat-value" style={{ color: '#e3b341' }}>{stats?.grievances?.done || 0}</span>
            <div className="stat-trend">Pending Verification</div>
        </div>

        <div className="stat-card glass-card">
            <div className="stat-header">
               <span className="stat-label">Resources</span>
               <Users size={18} color="#a371f7" />
            </div>
            <span className="stat-value">{stats?.users?.contractors || 0}</span>
            <div className="stat-trend">Assigned Contractors</div>
        </div>
      </section>

      {/* Lifecycle Trend Analytics */}
      <div className="dashboard-panel">
         <div className="panel-header">
             <h3 className="panel-title"><Sparkles size={18} color="#388bfd" /> Lifecycle Trends</h3>
             <div className="grievance-tab-pills">
                 <button className={`grievance-pill ${timeRange === 'daily' ? 'pill-active' : ''}`} onClick={() => setTimeRange('daily')}>Daily</button>
                 <button className={`grievance-pill ${timeRange === 'weekly' ? 'pill-active' : ''}`} onClick={() => setTimeRange('weekly')}>Weekly</button>
                 <button className={`grievance-pill ${timeRange === 'monthly' ? 'pill-active' : ''}`} onClick={() => setTimeRange('monthly')}>Monthly</button>
             </div>
         </div>
         <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#388bfd" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#388bfd" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3fb950" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3fb950" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="_id" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase' }}/>
                <Area type="monotone" dataKey="reported" name="Reported" stroke="#388bfd" strokeWidth={3} fillOpacity={1} fill="url(#colorReported)" activeDot={{ r: 6, stroke: '#388bfd', strokeWidth: 2, fill: '#fff' }} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#3fb950" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" activeDot={{ r: 6, stroke: '#3fb950', strokeWidth: 2, fill: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Modular Visual Distributions */}
      <div className="chart-grid-row">
          
          {/* Status Breakdown */}
          <div className="dashboard-panel" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
            <h4 className="panel-title" style={{ fontSize: '1.05rem' }}><PieIcon size={16} /> Status Analytics</h4>
            <div style={{ flex: 1, minHeight: 0, marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={statusData} 
                      cx="50%" 
                      cy="45%" 
                      innerRadius={65} 
                      outerRadius={85} 
                      paddingAngle={8} 
                      dataKey="value" 
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      iconType="circle" 
                      verticalAlign="bottom" 
                      wrapperStyle={{ fontSize: '11px', color: '#8b949e', paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Category Performance */}
          <div className="dashboard-panel" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
            <h4 className="panel-title" style={{ fontSize: '1.05rem' }}><BarChart3 size={16} /> Category Flow</h4>
            <div style={{ flex: 1, minHeight: 0, marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false}/>
                    <YAxis dataKey="name" type="category" stroke="#e6edf3" fontSize={11} tickLine={false} axisLine={false} width={85}/>
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="value" name="Incidents" radius={[0, 6, 6, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Hotspots */}
          <div className="dashboard-panel" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
            <h4 className="panel-title" style={{ fontSize: '1.05rem' }}><MapPin size={16} /> Zone Hotspots</h4>
            <div style={{ flex: 1, minHeight: 0, marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} margin={{ top: 10, right: 10, left: -25, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#8b949e" fontSize={10} tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={50} />
                    <YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }}/>
                    <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#8b949e', marginBottom: '10px' }}/>
                    <Bar dataKey="Reported" stackId="a" fill="#e3b341" radius={[0, 0, 0, 0]} barSize={20} />
                    <Bar dataKey="Resolved" stackId="a" fill="#3fb950" radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

      </div>
    </div>
  );
};

export default Dashboard;
