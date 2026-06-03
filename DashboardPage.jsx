import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { 
  Users, 
  UserCheck, 
  PhoneCall, 
  UserX, 
  TrendingUp,
  FileText,
  Calendar,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

const DashboardPage = ({ setCurrentPage, setSelectedLeadId, showToast }) => {
  const [stats, setStats] = useState({ Total: 0, New: 0, Contacted: 0, Converted: 0 });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status colors matching our global CSS theme
  const COLORS = {
    'New': '#2563eb',       // Blue
    'Contacted': '#ea580c', // Orange
    'Converted': '#16a34a'  // Green
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch leads (limit 100 to gather wide range for aggregation charts)
        const response = await apiService.getLeads({ limit: 100 });
        if (response.success) {
          setStats(response.stats);
          setLeads(response.data);
        }
      } catch (err) {
        console.error(err);
        showToast('Error loading dashboard analytics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  // Aggregate Lead Status Distribution
  const pieData = Object.keys(COLORS).map(status => ({
    name: status,
    value: stats[status] || 0
  })).filter(item => item.value > 0);

  // Aggregate Monthly Lead Growth
  const getMonthlyData = () => {
    const monthlyMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Sort leads chronologically
    const sortedLeads = [...leads].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    sortedLeads.forEach(lead => {
      const date = new Date(lead.createdAt);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
      monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + 1;
    });

    // Convert map to array
    const chartData = Object.keys(monthlyMap).map(month => ({
      name: month,
      leads: monthlyMap[month]
    }));

    // If empty, supply dummy structure to render nicely
    if (chartData.length === 0) {
      return [
        { name: 'Mar 26', leads: 2 },
        { name: 'Apr 26', leads: 4 },
        { name: 'May 26', leads: 8 }
      ];
    }
    return chartData;
  };

  // Compile recent global activity logs across all leads
  const getRecentActivities = () => {
    let activities = [];
    leads.forEach(lead => {
      if (lead.activityLog && Array.isArray(lead.activityLog)) {
        lead.activityLog.forEach(log => {
          activities.push({
            leadId: lead._id,
            fullName: lead.fullName,
            action: log.action,
            note: log.note,
            timestamp: new Date(log.timestamp),
          });
        });
      }
    });

    // Sort by timestamp descending
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  };

  const monthlyChartData = getMonthlyData();
  const recentActivities = getRecentActivities();

  // Helper to format date
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="dashboard-loading animate-fade-in">
        <div className="dashboard-header-skeleton">
          <div className="skeleton title-skeleton"></div>
          <div className="skeleton button-skeleton"></div>
        </div>
        <div className="kpis-grid">
          {[1, 2, 3, 4].map(n => <div key={n} className="skeleton kpi-card-skeleton"></div>)}
        </div>
        <div className="charts-grid">
          <div className="skeleton chart-skeleton"></div>
          <div className="skeleton chart-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Dashboard Analytics</h1>
          <p>Real-time visual insights, pipelines, and performance logs.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setCurrentPage('add-lead')} className="btn btn-primary">
            <TrendingUp size={16} />
            <span>Create New Lead</span>
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="kpis-grid">
        {/* Total Leads */}
        <div className="kpi-card glass-panel-interactive">
          <div className="kpi-content">
            <p className="kpi-label">Total Leads</p>
            <h3 className="kpi-value">{stats.Total || 0}</h3>
            <span className="kpi-badge kpi-badge-indigo">Active pipeline</span>
          </div>
          <div className="kpi-icon-wrapper bg-indigo">
            <Users size={24} />
          </div>
        </div>

        {/* New Leads */}
        <div className="kpi-card glass-panel-interactive">
          <div className="kpi-content">
            <p className="kpi-label">New Leads</p>
            <h3 className="kpi-value">{stats.New || 0}</h3>
            <span className="kpi-badge kpi-badge-blue">
              {stats.Total ? Math.round(((stats.New || 0) / stats.Total) * 100) : 0}% of pipeline
            </span>
          </div>
          <div className="kpi-icon-wrapper bg-blue">
            <FileText size={24} />
          </div>
        </div>

        {/* Contacted Leads */}
        <div className="kpi-card glass-panel-interactive">
          <div className="kpi-content">
            <p className="kpi-label">Contacted Leads</p>
            <h3 className="kpi-value">{stats.Contacted || 0}</h3>
            <span className="kpi-badge kpi-badge-orange">
              {stats.Total ? Math.round(((stats.Contacted || 0) / stats.Total) * 100) : 0}% contacted
            </span>
          </div>
          <div className="kpi-icon-wrapper bg-orange">
            <PhoneCall size={24} />
          </div>
        </div>

        {/* Converted Leads */}
        <div className="kpi-card glass-panel-interactive">
          <div className="kpi-content">
            <p className="kpi-label">Converted Leads</p>
            <h3 className="kpi-value">{stats.Converted || 0}</h3>
            <span className="kpi-badge kpi-badge-green">
              {stats.Total ? Math.round(((stats.Converted || 0) / stats.Total) * 100) : 0}% success rate
            </span>
          </div>
          <div className="kpi-icon-wrapper bg-green">
            <UserCheck size={24} />
          </div>
        </div>
      </section>

      {/* Analytics Charts Grid */}
      <section className="charts-grid">
        {/* Growth Trend */}
        <div className="chart-card glass-panel">
          <h3>Lead Acquisition Growth</h3>
          <p className="chart-subtitle">Monthly cumulative intake of newly acquired leads</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Area type="monotone" dataKey="leads" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="chart-card glass-panel">
          <h3>Lead Status Breakdown</h3>
          <p className="chart-subtitle">Distribution ratio of leads in the marketing funnel</p>
          <div className="breakdown-content">
            <div className="pie-wrapper">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-pie">No Status Data</div>
              )}
            </div>
            
            <div className="chart-legend">
              {Object.keys(COLORS).map(status => (
                <div key={status} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: COLORS[status] }}></span>
                  <span className="legend-name">{status}</span>
                  <span className="legend-count">({stats[status] || 0})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Layout - Activity feed */}
      <section className="activity-section">
        <div className="activity-card glass-panel">
          <div className="activity-header">
            <h3>Recent Lead Activity Timeline</h3>
            <button onClick={() => setCurrentPage('leads')} className="btn-link">
              <span>View All Leads</span>
              <ExternalLink size={14} />
            </button>
          </div>
          <div className="activity-timeline">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-badge-line">
                    <span className="timeline-badge-dot"></span>
                    {idx < recentActivities.length - 1 && <span className="timeline-line"></span>}
                  </div>
                  <div className="timeline-details">
                    <div className="timeline-meta">
                      <button 
                        onClick={() => {
                          setSelectedLeadId(activity.leadId);
                          setCurrentPage('lead-details');
                        }}
                        className="timeline-lead-name"
                      >
                        {activity.fullName}
                      </button>
                      <span className="timeline-date">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                    <div className="timeline-action">
                      <strong>{activity.action}:</strong> {activity.note}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-activities">
                <Calendar size={32} className="empty-icon" />
                <p>No recent activity logs available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .dashboard-header p {
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .kpis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .kpi-card {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px;
        }

        .kpi-content {
          display: flex;
          flex-direction: column;
        }

        .kpi-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-value {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 4px;
          line-height: 1;
        }

        .kpi-badge {
          display: inline-flex;
          font-size: 0.72rem;
          font-weight: 600;
          margin-top: 10px;
          padding: 2px 8px;
          border-radius: 6px;
          width: max-content;
        }

        .kpi-badge-indigo { background: rgba(79, 70, 229, 0.1); color: #4f46e5; }
        .kpi-badge-blue { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
        .kpi-badge-orange { background: rgba(234, 88, 12, 0.1); color: #ea580c; }
        .kpi-badge-green { background: rgba(22, 163, 74, 0.1); color: #16a34a; }

        .kpi-icon-wrapper {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-indigo { background: rgba(79, 70, 229, 0.1); color: #4f46e5; }
        .bg-blue { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
        .bg-orange { background: rgba(234, 88, 12, 0.1); color: #ea580c; }
        .bg-green { background: rgba(22, 163, 74, 0.1); color: #16a34a; }

        .charts-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          padding: 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
        }

        .chart-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .chart-subtitle {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          margin-bottom: 24px;
        }

        .chart-wrapper {
          height: 250px;
          width: 100%;
        }

        .breakdown-content {
          display: flex;
          align-items: center;
          justify-content: space-around;
          flex: 1;
        }

        .pie-wrapper {
          width: 160px;
          height: 160px;
          position: relative;
        }

        .empty-pie {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 4px dashed var(--border-color);
          font-size: 0.8rem;
          color: var(--text-tertiary);
          font-weight: 600;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .legend-name {
          flex: 1;
        }

        .legend-count {
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .activity-card {
          padding: 24px;
          border-radius: 16px;
        }

        .activity-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .activity-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .btn-link {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .btn-link:hover {
          transform: translateX(-2px);
          filter: brightness(1.1);
        }

        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .timeline-item {
          display: flex;
          gap: 16px;
        }

        .timeline-badge-line {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .timeline-badge-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent-primary);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          background: var(--border-color);
          margin-top: 6px;
        }

        .timeline-details {
          flex: 1;
          background: var(--bg-tertiary);
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .timeline-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .timeline-lead-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-primary);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          text-align: left;
        }
        .timeline-lead-name:hover {
          text-decoration: underline;
        }

        .timeline-date {
          font-size: 0.72rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .timeline-action {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .empty-activities {
          text-align: center;
          padding: 40px 0;
          color: var(--text-tertiary);
        }

        .empty-icon {
          margin-bottom: 12px;
          stroke: var(--text-tertiary);
        }

        /* Loading Skeletons CSS */
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        
        .dashboard-header-skeleton {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-skeleton {
          width: 260px;
          height: 32px;
        }

        .button-skeleton {
          width: 140px;
          height: 40px;
        }

        .kpi-card-skeleton {
          height: 110px;
          border-radius: 16px;
        }

        .chart-skeleton {
          height: 330px;
          border-radius: 16px;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
