import React, { useState } from 'react';
import { apiService } from '../services/api';
import { UserPlus, User, Mail, Phone, Tag, PlayCircle, FileText, ArrowLeft } from 'lucide-react';

const AddLeadPage = ({ setCurrentPage, showToast }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'New',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Full Name is required';
    
    // Email regex check
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email) {
      tempErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear field error as user types
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct form errors before submitting', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.createLead(formData);
      if (result) {
        showToast(`Lead "${result.fullName}" created successfully!`, 'success');
        setCurrentPage('leads'); // Direct to Leads table
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-lead-container animate-fade-in">
      {/* Back navigation header */}
      <header className="add-lead-header">
        <button onClick={() => setCurrentPage('leads')} className="btn btn-secondary btn-back">
          <ArrowLeft size={16} />
          <span>Back to Registry</span>
        </button>
        <div>
          <h1>Create Pipeline Lead</h1>
          <p>Register new incoming leads received from contact forms, advertisements, or networking.</p>
        </div>
      </header>

      {/* Main Form Panel */}
      <section className="form-card glass-panel">
        <div className="form-card-header">
          <div className="icon-badge">
            <UserPlus size={22} />
          </div>
          <h3>Lead Metadata Form</h3>
        </div>

        <form onSubmit={handleSubmit} className="add-lead-form">
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name *</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                  placeholder="e.g. Alexander Wright"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="e.g. alex.wright@solutions.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number *</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  id="phone"
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="e.g. +1 (555) 234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            {/* Lead Source */}
            <div className="form-group">
              <label className="form-label" htmlFor="source">Lead Source</label>
              <div className="input-with-icon">
                <Tag size={18} className="input-icon" />
                <select
                  id="source"
                  className="form-select"
                  value={formData.source}
                  onChange={handleChange}
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Lead Status */}
            <div className="form-group">
              <label className="form-label" htmlFor="status">Funnel Status</label>
              <div className="input-with-icon">
                <PlayCircle size={18} className="input-icon" />
                <select
                  id="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes description */}
          <div className="form-group">
            <label className="form-label" htmlFor="notes">Initial Requirements & Follow-up Notes</label>
            <div className="input-with-icon">
              <FileText size={18} className="textarea-icon" />
              <textarea
                id="notes"
                className="form-textarea"
                placeholder="Inquire budget, timelines, active projects, or initial notes..."
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => setCurrentPage('leads')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Register Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <style>{`
        .add-lead-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        .add-lead-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .btn-back {
          width: max-content;
        }

        .add-lead-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .add-lead-header p {
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .form-card {
          border-radius: 16px;
          padding: 30px;
        }

        .form-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(79, 70, 229, 0.1);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-card-header h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon .form-input,
        .input-with-icon .form-select {
          padding-left: 46px;
        }

        .input-with-icon .form-textarea {
          padding-left: 46px;
          padding-top: 14px;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .textarea-icon {
          position: absolute;
          left: 16px;
          top: 14px;
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .input-error {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
        }

        .error-text {
          display: block;
          font-size: 0.75rem;
          color: #ef4444;
          font-weight: 600;
          margin-top: 6px;
          animation: fadeIn 0.2s ease forwards;
        }

        .form-textarea {
          min-height: 120px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
};

export default AddLeadPage;
