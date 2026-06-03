const BASE_URL = 'http://localhost:5000/api';

// Helper to get authorization headers
const getHeaders = () => {
  const token = localStorage.getItem('crm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const apiService = {
  // Leads endpoints
  async getLeads({ search = '', status = 'All', source = 'All', sort = 'newest', page = 1, limit = 10 } = {}) {
    // Build query parameters
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    if (source && source !== 'All') params.append('source', source);
    if (sort) params.append('sort', sort);
    params.append('page', page);
    params.append('limit', limit);

    const response = await fetch(`${BASE_URL}/leads?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch leads');
    }
    return data; // Returns { success, count, pagination: {...}, stats: {...}, data: [...] }
  },

  async getLeadById(id) {
    const response = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Lead not found');
    }
    return data.data; // Returns the lead object
  },

  async createLead(leadData) {
    const response = await fetch(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(leadData),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create lead');
    }
    return data.data; // Returns the created lead
  },

  async updateLead(id, updateData) {
    // updateData can contain fullName, email, phone, source, status, notes, and newNote
    const response = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update lead');
    }
    return data.data; // Returns the updated lead
  },

  async deleteLead(id) {
    const response = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete lead');
    }
    return data; // Returns { success, message, data }
  },
};
