const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Lead = require('../models/Lead');

dotenv.config();

// Custom seed data with varying dates to demonstrate dashboard charts
const users = [
  {
    name: 'Admin User',
    email: 'admin@crm.com',
    password: 'admin123', // Will be hashed via pre-save hook
    role: 'Admin',
  },
];

const now = new Date();
const lastMonth = new Date(new Date().setMonth(now.getMonth() - 1));
const twoMonthsAgo = new Date(new Date().setMonth(now.getMonth() - 2));
const threeMonthsAgo = new Date(new Date().setMonth(now.getMonth() - 3));

const leads = [
  {
    fullName: 'Alexander Wright',
    email: 'alex.wright@techsolutions.com',
    phone: '+1 (555) 234-5678',
    source: 'Website',
    status: 'Converted',
    notes: 'Interested in enterprise cloud migration package. Highly motivated.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Website.', timestamp: threeMonthsAgo },
      { action: 'Note Added', note: 'Interested in enterprise cloud migration package. Highly motivated.', timestamp: threeMonthsAgo },
      { action: 'Status Updated', note: "Status changed from 'New' to 'Contacted'.", timestamp: new Date(threeMonthsAgo.getTime() + 86400000) },
      { action: 'Follow-up Note', note: 'Sent proposal and conducted demo call. Client liked the scalability features.', timestamp: new Date(threeMonthsAgo.getTime() + 172800000) },
      { action: 'Status Updated', note: "Status changed from 'Contacted' to 'Converted'.", timestamp: new Date(threeMonthsAgo.getTime() + 259200000) },
    ],
    createdAt: threeMonthsAgo,
    updatedAt: new Date(threeMonthsAgo.getTime() + 259200000),
  },
  {
    fullName: 'Sarah Jenkins',
    email: 'sarah.j@creativestudio.io',
    phone: '+1 (555) 987-6543',
    source: 'Referral',
    status: 'Converted',
    notes: 'Referred by existing client. Needs ongoing UI/UX brand consulting.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Referral.', timestamp: threeMonthsAgo },
      { action: 'Note Added', note: 'Referred by existing client. Needs ongoing UI/UX brand consulting.', timestamp: threeMonthsAgo },
      { action: 'Status Updated', note: "Status changed from 'New' to 'Converted'.", timestamp: new Date(threeMonthsAgo.getTime() + 432000000) },
    ],
    createdAt: threeMonthsAgo,
    updatedAt: new Date(threeMonthsAgo.getTime() + 432000000),
  },
  {
    fullName: 'Marcus Vance',
    email: 'marcus.v@innovategroup.com',
    phone: '+1 (555) 345-6789',
    source: 'Social Media',
    status: 'Contacted',
    notes: 'Inquired about monthly marketing retainer packages.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Social Media.', timestamp: twoMonthsAgo },
      { action: 'Note Added', note: 'Inquired about monthly marketing retainer packages.', timestamp: twoMonthsAgo },
      { action: 'Status Updated', note: "Status changed from 'New' to 'Contacted'.", timestamp: new Date(twoMonthsAgo.getTime() + 172800000) },
      { action: 'Follow-up Note', note: 'Left voicemail. Will follow up in 3 days.', timestamp: new Date(twoMonthsAgo.getTime() + 259200000) },
    ],
    createdAt: twoMonthsAgo,
    updatedAt: new Date(twoMonthsAgo.getTime() + 259200000),
  },
  {
    fullName: 'Elena Rostova',
    email: 'elena.rostova@globalcom.ru',
    phone: '+1 (555) 876-5432',
    source: 'Advertisement',
    status: 'Converted',
    notes: 'Responded to Google search ads for Node.js developers.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Advertisement.', timestamp: twoMonthsAgo },
      { action: 'Note Added', note: 'Responded to Google search ads for Node.js developers.', timestamp: twoMonthsAgo },
      { action: 'Status Updated', note: "Status changed from 'New' to 'Contacted'.", timestamp: new Date(twoMonthsAgo.getTime() + 86400000) },
      { action: 'Status Updated', note: "Status changed from 'Contacted' to 'Converted'.", timestamp: new Date(twoMonthsAgo.getTime() + 604800000) },
    ],
    createdAt: twoMonthsAgo,
    updatedAt: new Date(twoMonthsAgo.getTime() + 604800000),
  },
  {
    fullName: 'David Beckham',
    email: 'david@sportsanalytics.co.uk',
    phone: '+44 20 7946 0958',
    source: 'Other',
    status: 'New',
    notes: 'Met at European Tech Summit. Looking for custom analytics dashboard.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Other.', timestamp: twoMonthsAgo },
      { action: 'Note Added', note: 'Met at European Tech Summit. Looking for custom analytics dashboard.', timestamp: twoMonthsAgo },
    ],
    createdAt: twoMonthsAgo,
    updatedAt: twoMonthsAgo,
  },
  {
    fullName: 'Chloe Dupont',
    email: 'chloe.dupont@luxebrands.fr',
    phone: '+33 1 42 27 78 90',
    source: 'Website',
    status: 'Converted',
    notes: 'Needs premium Shopify e-commerce build and brand re-design.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Website.', timestamp: lastMonth },
      { action: 'Note Added', note: 'Needs premium Shopify e-commerce build and brand re-design.', timestamp: lastMonth },
      { action: 'Status Updated', note: "Status changed from 'New' to 'Contacted'.", timestamp: new Date(lastMonth.getTime() + 86400000) },
      { action: 'Follow-up Note', note: 'Presented project quote of $12,000. Customer signed contract.', timestamp: new Date(lastMonth.getTime() + 345600000) },
      { action: 'Status Updated', note: "Status changed from 'Contacted' to 'Converted'.", timestamp: new Date(lastMonth.getTime() + 345600000) },
    ],
    createdAt: lastMonth,
    updatedAt: new Date(lastMonth.getTime() + 345600000),
  },
  {
    fullName: 'Jonathan Miller',
    email: 'jmiller@millercapital.com',
    phone: '+1 (555) 456-7890',
    source: 'Referral',
    status: 'Contacted',
    notes: 'Referred by Sarah Jenkins. Financial firm looking for secure landing pages.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Referral.', timestamp: lastMonth },
      { action: 'Note Added', note: 'Referred by Sarah Jenkins. Financial firm looking for secure landing pages.', timestamp: lastMonth },
      { action: 'Status Updated', note: "Status changed from 'New' to 'Contacted'.", timestamp: new Date(lastMonth.getTime() + 172800000) },
    ],
    createdAt: lastMonth,
    updatedAt: new Date(lastMonth.getTime() + 172800000),
  },
  {
    fullName: 'Aisha Rahman',
    email: 'aisha.r@dubaisolutions.ae',
    phone: '+971 4 368 0000',
    source: 'Social Media',
    status: 'New',
    notes: 'Instagram lead. Needs automated chatbot setup for retail business.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Social Media.', timestamp: lastMonth },
      { action: 'Note Added', note: 'Instagram lead. Needs automated chatbot setup for retail business.', timestamp: lastMonth },
    ],
    createdAt: lastMonth,
    updatedAt: lastMonth,
  },
  {
    fullName: 'Robert Chen',
    email: 'robert.chen@asiatech.com.sg',
    phone: '+65 6789 0123',
    source: 'Advertisement',
    status: 'Contacted',
    notes: 'Clicked LinkedIn ad. Seeking React Native hybrid app development cost estimation.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Advertisement.', timestamp: lastMonth },
      { action: 'Note Added', note: 'Clicked LinkedIn ad. Seeking React Native hybrid app development cost estimation.', timestamp: lastMonth },
      { action: 'Status Updated', note: "Status changed from 'New' to 'Contacted'.", timestamp: new Date(lastMonth.getTime() + 259200000) },
      { action: 'Follow-up Note', note: 'Sent preliminary proposal. Awaiting response after their board meeting next week.', timestamp: new Date(lastMonth.getTime() + 432000000) },
    ],
    createdAt: lastMonth,
    updatedAt: new Date(lastMonth.getTime() + 432000000),
  },
  {
    fullName: 'Daniel Green',
    email: 'dgreen@ecopower.org',
    phone: '+1 (555) 567-8901',
    source: 'Website',
    status: 'New',
    notes: 'Non-profit green energy portal revamp inquiry.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Website.', timestamp: now },
      { action: 'Note Added', note: 'Non-profit green energy portal revamp inquiry.', timestamp: now },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    fullName: 'Emily Watson',
    email: 'emily.watson@edtechhub.org',
    phone: '+1 (555) 678-9012',
    source: 'Referral',
    status: 'Contacted',
    notes: 'Online course platform needs Stripe payment integration assistance.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Referral.', timestamp: now },
      { action: 'Note Added', note: 'Online course platform needs Stripe payment integration assistance.', timestamp: now },
      { action: 'Status Updated', note: "Status changed from 'New' to 'Contacted'.", timestamp: new Date(now.getTime() - 7200000) },
      { action: 'Follow-up Note', note: 'Discussed project scope. Estimated 40 hours of work.', timestamp: new Date(now.getTime() - 3600000) },
    ],
    createdAt: now,
    updatedAt: new Date(now.getTime() - 3600000),
  },
  {
    fullName: 'Frank Gallagher',
    email: 'frank@chicagodecor.net',
    phone: '+1 (555) 789-0123',
    source: 'Advertisement',
    status: 'New',
    notes: 'Local design shop wants local SEO implementation.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Advertisement.', timestamp: now },
      { action: 'Note Added', note: 'Local design shop wants local SEO implementation.', timestamp: now },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    fullName: 'Grace Hopper',
    email: 'grace@compilers.org',
    phone: '+1 (555) 890-1234',
    source: 'Website',
    status: 'Converted',
    notes: 'Legacy system modernization consultation. High budget.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Website.', timestamp: now },
      { action: 'Note Added', note: 'Legacy system modernization consultation. High budget.', timestamp: now },
      { action: 'Status Updated', note: "Status changed from 'New' to 'Contacted'.", timestamp: new Date(now.getTime() - 28800000) },
      { action: 'Status Updated', note: "Status changed from 'Contacted' to 'Converted'.", timestamp: new Date(now.getTime() - 7200000) },
    ],
    createdAt: now,
    updatedAt: new Date(now.getTime() - 7200000),
  },
  {
    fullName: 'Henry Cavill',
    email: 'henry@witcherproductions.com',
    phone: '+1 (555) 901-2345',
    source: 'Other',
    status: 'New',
    notes: 'Needs custom content management website built on Next.js.',
    activityLog: [
      { action: 'Lead Created', note: 'Lead successfully initialized via Other.', timestamp: now },
      { action: 'Note Added', note: 'Needs custom content management website built on Next.js.', timestamp: now },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

const seedDB = async () => {
  try {
    console.log('Connecting to database/mock for seeding...');
    await connectDB();
    console.log('Database connected / initialized!');

    // Clear existing data
    console.log('Clearing existing users and leads...');
    await User.deleteMany();
    await Lead.deleteMany();
    console.log('Cleared!');

    // Seed User
    console.log('Seeding default Admin user...');
    // We save each user individually so pre-save hooks (password hashing) trigger
    for (const u of users) {
      await User.create(u);
    }
    console.log('Admin user seeded successfully!');

    // Seed Leads
    console.log(`Seeding ${leads.length} demo leads...`);
    await Lead.insertMany(leads);
    console.log('Leads seeded successfully!');

    console.log('Seeding complete! Closing database connection...');
    if (!global.useMockDb) {
      await mongoose.connection.close();
    }
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
