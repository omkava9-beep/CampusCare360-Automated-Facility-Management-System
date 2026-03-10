import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats } from '../../redux/slices/grievanceSlice';
import { LayoutDashboard, CheckCircle2, Users, GraduationCap, MapPin, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#388bfd', '#a371f7', '#3fb950', '#f85149', '#e3b341', '#8957e5'];
const PIE_COLORS = ['#3fb950', '#e3b341', '#f85149', '#388bfd']; 

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color, fontSize: '0.85rem' }}>
            {entry.name === 'reported' ? 'Reported' : entry.name === 'resolved' ? 'Resolved' : entry.name}: <strong>{entry.value}</strong>
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

  if (isLoading && !stats) return <div className="loading">Initializing Analytics Engine...</div>;

  const trendData = stats?.trends?.[timeRange] || [];
  
  // Format Category Data
  const categoryData = stats?.categoryDistribution?.map(c => ({
      name: c._id || 'Uncategorized',
      value: c.count
  })) || [];

  // Format Status Data
  const statusData = [
      { name: 'Resolved', value: stats?.grievances?.resolved || 0 },
      { name: 'Pending', value: stats?.grievances?.applied || 0 },
      { name: 'In Progress', value: stats?.grievances?.inProgress || 0 },
      { name: 'Verification', value: stats?.grievances?.done || 0 },
  ].filter(d => d.value > 0);

  // Format Location Data
  const locationData = stats?.grievancesByLocation?.map(l => ({
      name: l.locationDetails[0]?.locationName || 'Unknown',
      Reported: l.count,
      Resolved: l.statusBreakdown.resolved
  })).slice(0, 5) || []; // Top 5 locations

  return (
    <div className="dashboard-container page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Analytics Engine</h1>
          <p className="page-subtitle">Real-time facility insights, contractor performance, and grievance trends.</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="stats-grid">
        <div className="stat-card glass-card highlight">
          <div className="stat-header">
             <span className="stat-label">Total Grievances</span>
             <LayoutDashboard className="sidebar-icon" size={20} color="#388bfd" />
          </div>
          <span className="stat-value">{stats?.grievances?.total || 0}</span>
          <div className="stat-trend" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
             Across {stats?.locations || 0} zones
          </div>
        </div>
        
        <div className="stat-card glass-card">
          <div className="stat-header">
             <span className="stat-label">Resolution Rate</span>
             <CheckCircle2 className="sidebar-icon" size={20} color="#3fb950" />
          </div>
          <span className="stat-value">{stats?.grievances?.percentageResolved || 0}%</span>
          <div className="stat-trend" style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
             <TrendingUp size={14}/> {stats?.grievances?.resolved || 0} Resolved
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-header">
             <span className="stat-label">Pending Verification</span>
             <AlertCircle className="sidebar-icon" size={20} color="#e3b341" />
          </div>
          <span className="stat-value" style={{ color: '#e3b341' }}>{stats?.grievances?.done || 0}</span>
          <div className="stat-trend" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
             Requires admin approval
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-header">
             <span className="stat-label">Active Contractors</span>
             <Users className="sidebar-icon" size={20} color="#a371f7" />
          </div>
          <span className="stat-value">{stats?.users?.contractors || 0}</span>
          <div className="stat-trend" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
             Servicing {stats?.users?.students || 0} students
          </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="glass-panel" style={{ marginTop: '24px', padding: '24px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Grievance Lifecycle Trends</h3>
             <div className="grievance-tab-pills">
                 <button className={`grievance-pill ${timeRange === 'daily' ? 'pill-active' : ''}`} onClick={() => setTimeRange('daily')} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Daily</button>
                 <button className={`grievance-pill ${timeRange === 'weekly' ? 'pill-active' : ''}`} onClick={() => setTimeRange('weekly')} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Weekly</button>
                 <button className={`grievance-pill ${timeRange === 'monthly' ? 'pill-active' : ''}`} onClick={() => setTimeRange('monthly')} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Monthly</button>
             </div>
         </div>
         <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#388bfd" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#388bfd" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3fb950" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3fb950" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="_id" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                <Area type="monotone" dataKey="reported" name="Reported Incidents" stroke="#388bfd" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
                <Area type="monotone" dataKey="resolved" name="Resolved Incidents" stroke="#3fb950" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Distribution Row */}
      <div className="dashboard-grid-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
          
          {/* Status Donut */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>Status Distribution</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Category Bar */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>Incidents by Category</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis dataKey="name" type="category" stroke="var(--text-primary)" fontSize={12} tickLine={false} axisLine={false} width={80}/>
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="value" name="Incidents" radius={[0, 4, 4, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Top Locations */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>Top 5 Active Zones</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tick={{ width: 80 }} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }}/>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    <Bar dataKey="Reported" stackId="a" fill="#e3b341" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Resolved" stackId="a" fill="#3fb950" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

      </div>
    </div>
  );
};

export default Dashboard;
