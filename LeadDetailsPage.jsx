import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Tag, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  MessageSquare,
  ChevronDown,
  CheckCircle
} from 'lucide-react';

const LeadDetailsPage = ({ leadId, setCurrentPage, showToast }) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Follow-up Note state
  const [newNoteText, setNewNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    source: '',
    status: '',
    notes: ''
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const data = await apiService.getLeadById(leadId);
      setLead(data);
      // Initialize edit form
      setEditForm({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        source: data.source,
        status: data.status,
        notes: data.notes || ''
      });
    } catch (err) {
      console.error(err);
      showToast('Error fetching lead details', 'error');
      setCurrentPage('leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  // Submit Quick Status Update
  const handleStatusChange = async (newStatus) => {
    if (!lead) return;
    try {
      const updated = await apiService.updateLead(lead._id, { status: newStatus });
      setLead(updated);
      setEditForm(prev => ({ ...prev, status: newStatus }));
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  // Submit Custom Timeline Follow-up Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !lead) return;

    setSubmittingNote(true);
    try {
      const updated = await apiService.updateLead(lead._id, { newNote: newNoteText.trim() });
      setLead(updated);
      setNewNoteText('');
      showToast('Follow-up note added successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to add follow-up note', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  // Submit Full Profile Edits
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!lead) return;

    setSubmittingEdit(true);
    try {
      const updated = await apiService.updateLead(lead._id, editForm);
      setLead(updated);
      setIsEditing(false);
      showToast('Lead details updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update details', 'error');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete Lead Handler
  const handleDelete = async () => {
    if (!lead) return;
    if (window.confirm(`Are you sure you want to permanently delete lead "${lead.fullName}"?`)) {
      try {
        const response = await apiService.deleteLead(lead._id);
        if (response.success) {
          showToast(`Lead "${lead.fullName}" removed`, 'success');
          setCurrentPage('leads');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to delete lead', 'error');
      }
    }
  };

  // Helpers
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (statusStr) => {
    switch (statusStr) {
      case 'New': return 'badge badge-new';
      case 'Contacted': return 'badge badge-contacted';
      case 'Converted': return 'badge badge-converted';
      default: return 'badge';
    }
  };

  if (loading) {
    return (
      <div className="details-loading animate-fade-in">
        <div className="skeleton back-btn-skeleton"></div>
        <div className="details-layout-skeleton">
          <div className="skeleton left-card-skeleton"></div>
          <div className="skeleton right-card-skeleton"></div>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="details-container animate-fade-in">
      {/* Top Back Navigation & Header */}
      <div className="details-header">
        <button onClick={() => setCurrentPage('leads')} className="btn btn-secondary btn-back">
          <ArrowLeft size={16} />
          <span>Back to Registry</span>
        </button>

        <div className="details-header-actions">
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
            <Edit3 size={16} />
            <span>Edit Lead</span>
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 size={16} />
            <span>Delete Lead</span>
          </button>
        </div>
      </div>

      <div className="details-layout">
        {/* Left Side: Metadata Card */}
        <div className="details-left">
          <div className="profile-card glass-panel">
            <div className="profile-hero">
              <div className="profile-avatar">
                {lead.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h2>{lead.fullName}</h2>
              <span className={getStatusBadgeClass(lead.status)}>{lead.status}</span>
            </div>

            <div className="profile-info-list">
              {/* Email */}
              <div className="info-row">
                <Mail size={18} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Email Address</span>
                  <a href={`mailto:${lead.email}`} className="info-value text-link">{lead.email}</a>
                </div>
              </div>

              {/* Phone */}
              <div className="info-row">
                <Phone size={18} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Phone Number</span>
                  <a href={`tel:${lead.phone}`} className="info-value text-link">{lead.phone}</a>
                </div>
              </div>

              {/* Source */}
              <div className="info-row">
                <Tag size={18} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Lead Source</span>
                  <span className="info-value">{lead.source}</span>
                </div>
              </div>

              {/* Created Date */}
              <div className="info-row">
                <Calendar size={18} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Created At</span>
                  <span className="info-value">{formatDate(lead.createdAt)}</span>
                </div>
              </div>

              {/* Updated Date */}
              <div className="info-row">
                <Clock size={18} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">{formatDate(lead.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="quick-status-bar">
              <h4>Quick Pipeline Trigger</h4>
              <div className="status-buttons">
                {['New', 'Contacted', 'Converted'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`btn btn-status-trigger ${st.toLowerCase()} ${lead.status === st ? 'active' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Lead description notes */}
            <div className="lead-description-box">
              <h4>Primary Description & Requirements</h4>
              <p>{lead.notes || 'No primary notes added for this lead yet. Edit lead details to add a description.'}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline & Follow-up Entries */}
        <div className="details-right">
          {/* Note Input card */}
          <div className="notes-card glass-panel">
            <h3>Add Follow-up Activity Log</h3>
            <p className="notes-subtitle">Log client call minutes, contract states, or proposal deliverables</p>
            
            <form onSubmit={handleAddNote} className="note-form">
              <div className="form-group">
                <textarea
                  className="form-textarea note-textarea"
                  placeholder="Type timeline update details here..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submittingNote || !newNoteText.trim()}
              >
                {submittingNote ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    <span>Log Activity Entry</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Activity Timeline Card */}
          <div className="timeline-card glass-panel">
            <h3>Lead Lifecycle Journey Logs</h3>
            <div className="details-timeline">
              {lead.activityLog && lead.activityLog.length > 0 ? (
                [...lead.activityLog].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, idx) => (
                  <div key={log._id || idx} className="details-timeline-item">
                    <div className="details-timeline-dot-wrapper">
                      <div className={`details-timeline-dot ${log.action.toLowerCase().replace(' ', '-')}`}></div>
                      {idx < lead.activityLog.length - 1 && <div className="details-timeline-line"></div>}
                    </div>
                    <div className="details-timeline-info">
                      <div className="details-timeline-meta">
                        <span className="details-timeline-action">{log.action}</span>
                        <span className="details-timeline-date">{formatDate(log.timestamp)}</span>
                      </div>
                      <p className="details-timeline-note">{log.note}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-details-timeline">
                  <MessageSquare size={36} />
                  <p>No activity logs recorded.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Details Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>Edit Lead Details</h3>
              <button onClick={() => setIsEditing(false)} className="btn-close">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="modal-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select
                    className="form-select"
                    value={editForm.source}
                    onChange={(e) => setEditForm(p => ({ ...p, source: e.target.value }))}
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Base notes / Core requirements</label>
                <textarea
                  className="form-textarea"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Enter detailed description of requirements..."
                ></textarea>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="btn btn-secondary"
                  disabled={submittingEdit}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submittingEdit}
                >
                  {submittingEdit ? <span className="spinner"></span> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .details-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .details-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .details-header-actions {
          display: flex;
          gap: 10px;
        }

        .details-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }

        @media (max-width: 960px) {
          .details-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Profile Left Card */
        .profile-card {
          padding: 30px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: var(--accent-gradient);
          color: white;
          font-weight: 800;
          font-size: 2.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.25);
        }

        .profile-hero h2 {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .profile-info-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-icon {
          color: var(--text-tertiary);
          margin-top: 2px;
        }

        .info-content {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 2px;
        }

        .text-link {
          color: var(--accent-primary);
          text-decoration: none;
        }
        .text-link:hover {
          text-decoration: underline;
        }

        /* Quick status bar */
        .quick-status-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .quick-status-bar h4,
        .lead-description-box h4 {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .btn-status-trigger {
          padding: 8px 4px;
          font-size: 0.78rem;
          font-weight: 700;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-status-trigger.new:hover { background: var(--status-new-bg); color: var(--status-new-text); border-color: var(--status-new-border); }
        .btn-status-trigger.contacted:hover { background: var(--status-contacted-bg); color: var(--status-contacted-text); border-color: var(--status-contacted-border); }
        .btn-status-trigger.converted:hover { background: var(--status-converted-bg); color: var(--status-converted-text); border-color: var(--status-converted-border); }

        .btn-status-trigger.new.active { background: var(--status-new-bg); color: var(--status-new-text); border-color: var(--status-new-border); box-shadow: 0 4px 10px rgba(37,99,235,0.1); }
        .btn-status-trigger.contacted.active { background: var(--status-contacted-bg); color: var(--status-contacted-text); border-color: var(--status-contacted-border); box-shadow: 0 4px 10px rgba(234,88,12,0.1); }
        .btn-status-trigger.converted.active { background: var(--status-converted-bg); color: var(--status-converted-text); border-color: var(--status-converted-border); box-shadow: 0 4px 10px rgba(22,163,74,0.1); }

        .lead-description-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lead-description-box p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Timeline & notes right side */
        .notes-card {
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
        }

        .notes-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .notes-subtitle {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          margin-bottom: 16px;
        }

        .note-textarea {
          min-height: 80px;
        }

        .timeline-card {
          padding: 24px;
          border-radius: 16px;
        }

        .timeline-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .details-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .details-timeline-item {
          display: flex;
          gap: 16px;
        }

        .details-timeline-dot-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .details-timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--text-tertiary);
        }

        .details-timeline-dot.lead-created { background-color: var(--accent-primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15); }
        .details-timeline-dot.status-updated { background-color: #eab308; box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.15); }
        .details-timeline-dot.follow-up-note { background-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15); }
        .details-timeline-dot.details-updated { background-color: #06b6d4; box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.15); }
        .details-timeline-dot.note-added { background-color: #a855f7; box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15); }

        .details-timeline-line {
          width: 2px;
          flex: 1;
          background: var(--border-color);
          margin-top: 6px;
        }

        .details-timeline-info {
          flex: 1;
          background: var(--bg-tertiary);
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .details-timeline-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .details-timeline-action {
          font-size: 0.85rem;
          font-weight: 750;
          color: var(--text-primary);
        }

        .details-timeline-date {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .details-timeline-note {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .empty-details-timeline {
          text-align: center;
          padding: 30px 0;
          color: var(--text-tertiary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-card {
          width: 100%;
          max-width: 650px;
          border-radius: 20px;
          padding: 30px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .modal-header h3 {
          font-size: 1.2rem;
          font-weight: 800;
        }

        .btn-close {
          background: transparent;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: var(--text-tertiary);
          line-height: 1;
        }
        .btn-close:hover {
          color: var(--text-primary);
        }

        .modal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
        }

        .details-loading {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .back-btn-skeleton {
          width: 150px;
          height: 38px;
        }

        .details-layout-skeleton {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }

        .left-card-skeleton {
          height: 480px;
          border-radius: 16px;
        }

        .right-card-skeleton {
          height: 480px;
          border-radius: 16px;
        }
      `}</style>
    </div>
  );
};

export default LeadDetailsPage;
