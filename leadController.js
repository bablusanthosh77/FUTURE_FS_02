const Lead = require('../models/Lead');

// @desc    Get all leads with search, filter, pagination, and sorting
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res, next) => {
  try {
    const { search, status, source, sort, page = 1, limit = 10 } = req.query;

    // Build query object
    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by source
    if (source && source !== 'All') {
      query.source = source;
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting setup
    let sortBy = '-createdAt'; // Default sorting is newest first
    if (sort === 'oldest') {
      sortBy = 'createdAt';
    } else if (sort === 'name-asc') {
      sortBy = 'fullName';
    } else if (sort === 'name-desc') {
      sortBy = '-fullName';
    }

    // Fetch leads and total count
    const leads = await Lead.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    const totalLeads = await Lead.countDocuments(query);
    const totalPages = Math.ceil(totalLeads / limitNum);

    // Provide aggregations for dashboard statistics when getting leads
    // Total, New, Contacted, Converted counts
    const statsArray = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      Total: 0,
      New: 0,
      Contacted: 0,
      Converted: 0,
    };

    statsArray.forEach(item => {
      stats[item._id] = item.count;
      stats.Total += item.count;
    });

    res.json({
      success: true,
      count: leads.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        totalLeads,
      },
      stats,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res, next) => {
  try {
    const { fullName, email, phone, source, status, notes } = req.body;

    if (!fullName || !email || !phone) {
      res.status(400);
      throw new Error('Please include fullName, email, and phone');
    }

    // Create the lead
    const lead = new Lead({
      fullName,
      email,
      phone,
      source: source || 'Website',
      status: status || 'New',
      notes: notes || '',
      activityLog: [],
    });

    // Add initial activity log
    lead.activityLog.push({
      action: 'Lead Created',
      note: `Lead successfully initialized via ${source || 'Website'}.`,
    });

    if (notes) {
      lead.activityLog.push({
        action: 'Note Added',
        note: notes,
      });
    }

    await lead.save();

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    const { fullName, email, phone, source, status, notes, newNote } = req.body;

    // Track status change for activity log
    if (status && status !== lead.status) {
      lead.activityLog.push({
        action: 'Status Updated',
        note: `Status changed from '${lead.status}' to '${status}'.`,
      });
      lead.status = status;
    }

    // Track standard edits
    let detailsChanged = false;
    if (fullName && fullName !== lead.fullName) {
      lead.fullName = fullName;
      detailsChanged = true;
    }
    if (email && email !== lead.email) {
      lead.email = email;
      detailsChanged = true;
    }
    if (phone && phone !== lead.phone) {
      lead.phone = phone;
      detailsChanged = true;
    }
    if (source && source !== lead.source) {
      lead.source = source;
      detailsChanged = true;
    }
    if (notes !== undefined && notes !== lead.notes) {
      lead.notes = notes;
      detailsChanged = true;
    }

    if (detailsChanged) {
      lead.activityLog.push({
        action: 'Details Updated',
        note: 'Lead contact information or base notes were updated.',
      });
    }

    // Handle adding a new specific activity note (from timeline update)
    if (newNote && newNote.trim() !== '') {
      lead.activityLog.push({
        action: 'Follow-up Note',
        note: newNote.trim(),
      });
    }

    await lead.save();

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    await lead.deleteOne();

    res.json({
      success: true,
      message: 'Lead removed successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
};
