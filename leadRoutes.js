const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// All lead routes are protected by admin authorization
router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

module.exports = router;
