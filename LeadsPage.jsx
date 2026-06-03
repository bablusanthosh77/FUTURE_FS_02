import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  Trash2, 
  Plus,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

const LeadsPage = ({ setCurrentPage, setSelectedLeadId, showToast }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [source, setSource] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalLeads: 0 });

  // Status Filter options
  const statusOptions = ['All', 'New', 'Contacted', 'Converted'];
  const sourceOptions = ['All', 'Website', 'Referral', 'Social Media', 'Advertisement', 'Other'];

  const fetchLeadsData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getLeads({
        search,
        status,
        source,
        sort,
        page,
        limit
      });
      if (response.success) {
        setLeads(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset page to 1 when search or filter changes to avoid page overflow
    setPage(1);
  }, [search, status, source]);

  useEffect(() => {
    fetchLeadsData();
  }, [search, status, source, sort, page, limit]);

  // Handle lead deletion
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      try {
        const response = await apiService.deleteLead(id);
        if (response.success) {
          showToast(`Lead "${name}" deleted successfully`, 'success');
          // Reload leads
          fetchLeadsData();
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to delete lead', 'error');
      }
    }
  };

  // CSV Export Engine
  const handleExportCSV = () => {
    if (leads.length === 0) {
      showToast('No leads available to export', 'warning');
      return;
    }

    try {
      // Define headers
      const headers = ['Full Name', 'Email', 'Phone', 'Source', 'Status', 'Notes', 'Created At'];
      
      // Map leads to CSV rows
      const csvRows = [];
      csvRows.push(headers.join(',')); // Add header row

      leads.forEach(lead => {
        const row = [
          `"${lead.fullName.replace(/"/g, '""')}"`,
          `"${lead.email.replace(/"/g, '""')}"`,
          `"${lead.phone.replace(/"/g, '""')}"`,
          `"${lead.source}"`,
          `"${lead.status}"`,
          `"${(lead.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          `"${new Date(lead.createdAt).toLocaleDateString()}"`
        ];
        csvRows.push(row.join(','));
      });

      // Create CSV Blob
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Leads exported to CSV successfully!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Failed to export leads', 'error');
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Get status class for style mapping
  const getStatusBadgeClass = (statusStr) => {
    switch (statusStr) {
      case 'New': return 'badge badge-new';
      case 'Contacted': return 'badge badge-contacted';
      case 'Converted': return 'badge badge-converted';
      default: return 'badge';
    }
  };

  return (
    <div className="leads-container animate-fade-in">
      {/* Header */}
      <header className="leads-header">
        <div>
          <h1>Leads Registry</h1>
          <p>Search, filter, and organize client pipelines. Export records to spreadsheets.</p>
        </div>
        <div className="header-actions">
          <button onClick={handleExportCSV} className="btn btn-secondary btn-export">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button onClick={() => setCurrentPage('add-lead')} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </header>

      {/* Control panel (filters, search, limit) */}
      <section className="control-panel glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-wrapper">
          {/* Status filter */}
          <div className="filter-item">
            <span className="filter-label"><Filter size={14} /> Status</span>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="form-select filter-select"
            >
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Source filter */}
          <div className="filter-item">
            <span className="filter-label"><FolderOpen size={14} /> Source</span>
            <select 
              value={source} 
              onChange={(e) => setSource(e.target.value)}
              className="form-select filter-select"
            >
              {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Sort selection */}
          <div className="filter-item">
            <span className="filter-label"><ArrowUpDown size={14} /> Sort By</span>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="form-select filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Leads Table Container */}
      <section className="table-card glass-panel">
        <div className="table-responsive">
          {loading ? (
            <div className="table-loading">
              <RefreshCw className="spinner spinner-dark" />
              <p>Fetching leads from pipeline...</p>
            </div>
          ) : leads.length > 0 ? (
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Email & Phone</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="lead-row">
                    <td>
                      <div className="lead-identity">
                        <div className="lead-avatar-mini">
                          {lead.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="lead-name-text">{lead.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="lead-contact-info">
                        <span className="contact-email">{lead.email}</span>
                        <span className="contact-phone">{lead.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="lead-source-label">{lead.source}</span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(lead.status)}>{lead.status}</span>
                    </td>
                    <td>
                      <span className="lead-date-text">{formatDate(lead.createdAt)}</span>
                    </td>
                    <td className="text-right">
                      <div className="actions-cell">
                        <button
                          onClick={() => {
                            setSelectedLeadId(lead._id);
                            setCurrentPage('lead-details');
                          }}
                          className="btn-icon btn-action-view"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id, lead.fullName)}
                          className="btn-icon btn-action-delete"
                          title="Delete Lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="table-empty">
              <FolderOpen size={48} className="empty-icon" />
              <h3>No leads found</h3>
              <p>Try clearing your filters or create a new client entry to start tracking.</p>
              <button onClick={() => setCurrentPage('add-lead')} className="btn btn-primary margin-top">
                <span>Add First Lead</span>
              </button>
            </div>
          )}
        </div>

        {/* Pagination bar */}
        {!loading && leads.length > 0 && (
          <div className="pagination-bar">
            <div className="pagination-info">
              Showing <span>{leads.length}</span> of <span>{pagination.totalLeads}</span> leads (Page {pagination.page} of {pagination.totalPages})
            </div>
            
            <div className="pagination-buttons">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-icon btn-page"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .map((p, index, array) => {
                  const items = [];
                  if (index > 0 && p - array[index - 1] > 1) {
                    items.push(<span key={`ellipsis-${p}`} className="pagination-ellipsis">...</span>);
                  }
                  items.push(
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`btn btn-page-number ${p === page ? 'active' : ''}`}
                    >
                      {p}
                    </button>
                  );
                  return items;
                })
              }

              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn btn-icon btn-page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .leads-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .leads-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .leads-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .leads-header p {
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .control-panel {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1.5;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .search-input {
          padding-left: 46px;
        }

        .filters-wrapper {
          display: flex;
          gap: 16px;
          flex: 2;
          justify-content: flex-end;
          flex-wrap: wrap;
          min-width: 320px;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .filter-select {
          padding: 8px 32px 8px 12px;
          font-size: 0.82rem;
          width: auto;
          min-width: 120px;
          height: 38px;
        }

        .table-card {
          border-radius: 16px;
          overflow: hidden;
          padding: 8px;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
          min-height: 250px;
        }

        .leads-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .leads-table th {
          padding: 18px 24px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }

        .lead-row {
          border-bottom: 1px solid var(--border-color);
          transition: background-color 0.2s ease;
        }
        .lead-row:hover {
          background-color: rgba(79, 70, 229, 0.02);
        }
        .lead-row:last-child {
          border-bottom: none;
        }

        .leads-table td {
          padding: 16px 24px;
          vertical-align: middle;
        }

        .lead-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lead-avatar-mini {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(79, 70, 229, 0.1);
          color: var(--accent-primary);
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lead-name-text {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .lead-contact-info {
          display: flex;
          flex-direction: column;
        }

        .contact-email {
          font-size: 0.88rem;
          color: var(--text-primary);
        }

        .contact-phone {
          font-size: 0.76rem;
          color: var(--text-tertiary);
          margin-top: 2px;
        }

        .lead-source-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .lead-date-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .text-right {
          text-align: right;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .btn-action-view:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          background: rgba(79, 70, 229, 0.05);
        }

        .btn-action-delete:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .table-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 80px 0;
          color: var(--text-tertiary);
        }

        .table-empty {
          text-align: center;
          padding: 60px 0;
          color: var(--text-tertiary);
        }

        .table-empty h3 {
          color: var(--text-primary);
          margin-top: 16px;
          font-weight: 700;
        }

        .table-empty p {
          font-size: 0.9rem;
          margin-top: 6px;
          margin-bottom: 20px;
        }

        .margin-top {
          margin-top: 10px;
        }

        /* Pagination style */
        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 16px;
        }

        .pagination-info {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .pagination-info span {
          font-weight: 700;
          color: var(--text-primary);
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-page {
          width: 32px;
          height: 32px;
          padding: 0;
        }

        .btn-page-number {
          height: 32px;
          min-width: 32px;
          padding: 0 8px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }
        .btn-page-number:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: var(--border-color);
        }
        .btn-page-number.active {
          background: var(--accent-gradient);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.15);
        }

        .pagination-ellipsis {
          padding: 0 4px;
          color: var(--text-tertiary);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default LeadsPage;
