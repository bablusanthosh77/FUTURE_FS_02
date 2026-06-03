const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and files exist with initial arrays if not present
const initJsonFiles = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
};

const readJSON = (filePath) => {
  try {
    initJsonFiles();
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return [];
  }
};

const writeJSON = (filePath, data) => {
  try {
    initJsonFiles();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
  }
};

// Enable a robust Mock DB layer in Mongoose if connection fails
const setupMockDb = () => {
  console.warn('\n⚠️  COULD NOT CONNECT TO MONGODB SERVER. ⚠️');
  console.warn('👉 Switching to RESILIENT MOCK MODE (JSON File-based DB).');
  console.warn(`👉 Data will be persisted locally in: ${DATA_DIR}\n`);

  initJsonFiles();
  global.useMockDb = true;

  // Let's create mock models for User and Lead
  const LeadModel = mongoose.model('Lead');
  const UserModel = mongoose.model('User');

  // Stub UserModel methods
  UserModel.findOne = function (query) {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === query.email?.toLowerCase());
    
    const queryChain = {
      user,
      select: function (fields) {
        return this;
      },
      then: function (resolve) {
        if (!this.user) {
          resolve(null);
          return;
        }
        const doc = { ...this.user };
        doc.matchPassword = async function (enteredPassword) {
          return await bcrypt.compare(enteredPassword, doc.password);
        };
        resolve(doc);
      }
    };
    
    return queryChain;
  };

  UserModel.create = async function (userData) {
    const users = readJSON(USERS_FILE);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role || 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    
    const doc = { ...newUser };
    doc.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, newUser.password);
    };
    return doc;
  };

  UserModel.findById = function (id) {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u._id === id.toString());
    
    const queryChain = {
      user,
      select: function (fields) {
        return this;
      },
      then: function (resolve) {
        resolve(this.user || null);
      }
    };
    
    return queryChain;
  };

  UserModel.deleteMany = async function () {
    writeJSON(USERS_FILE, []);
    return { deletedCount: 1 };
  };

  LeadModel.deleteMany = async function () {
    writeJSON(LEADS_FILE, []);
    return { deletedCount: 1 };
  };

  LeadModel.insertMany = async function (leadsArray) {
    const leads = readJSON(LEADS_FILE);
    const newLeads = leadsArray.map(l => {
      const leadObj = { ...l };
      if (!leadObj._id) {
        leadObj._id = new mongoose.Types.ObjectId().toString();
      }
      if (!leadObj.createdAt) {
        leadObj.createdAt = new Date();
      }
      if (!leadObj.updatedAt) {
        leadObj.updatedAt = new Date();
      }
      return leadObj;
    });
    leads.push(...newLeads);
    writeJSON(LEADS_FILE, leads);
    return newLeads;
  };

  // Stub LeadModel methods
  LeadModel.find = function (query = {}) {
    let leads = readJSON(LEADS_FILE);

    // Apply filtering mimicking leadController.js
    if (query.$or) {
      const searchTerms = query.$or;
      leads = leads.filter(l => {
        return searchTerms.some(termObj => {
          const field = Object.keys(termObj)[0];
          const pattern = termObj[field].$regex;
          const options = termObj[field].$options;
          const val = l[field] || '';
          return new RegExp(pattern, options).test(val);
        });
      });
    }

    if (query.status) {
      leads = leads.filter(l => l.status === query.status);
    }
    if (query.source) {
      leads = leads.filter(l => l.source === query.source);
    }

    // Return a chainable query object
    const queryChain = {
      leads,
      sort: function (sortBy) {
        if (sortBy === 'createdAt' || sortBy === 'oldest') {
          this.leads.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === '-createdAt') {
          this.leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'fullName') {
          this.leads.sort((a, b) => a.fullName.localeCompare(b.fullName));
        } else if (sortBy === '-fullName') {
          this.leads.sort((a, b) => b.fullName.localeCompare(a.fullName));
        }
        return this;
      },
      skip: function (num) {
        this.leads = this.leads.slice(num);
        return this;
      },
      limit: function (num) {
        this.leads = this.leads.slice(0, num);
        return this;
      },
      then: function (resolve) {
        resolve(this.leads.map(l => {
          const doc = { ...l };
          doc.save = async function () {
            const allLeads = readJSON(LEADS_FILE);
            const index = allLeads.findIndex(item => item._id === l._id);
            if (index !== -1) {
              allLeads[index] = { ...this, updatedAt: new Date() };
              writeJSON(LEADS_FILE, allLeads);
            }
            return this;
          };
          doc.deleteOne = async function () {
            const allLeads = readJSON(LEADS_FILE);
            const filtered = allLeads.filter(item => item._id !== l._id);
            writeJSON(LEADS_FILE, filtered);
            return { deletedCount: 1 };
          };
          return doc;
        }));
      }
    };

    return queryChain;
  };

  LeadModel.countDocuments = async function (query = {}) {
    // Re-apply same query logic to get count
    let leads = readJSON(LEADS_FILE);
    if (query.$or) {
      const searchTerms = query.$or;
      leads = leads.filter(l => {
        return searchTerms.some(termObj => {
          const field = Object.keys(termObj)[0];
          const pattern = termObj[field].$regex;
          const options = termObj[field].$options;
          const val = l[field] || '';
          return new RegExp(pattern, options).test(val);
        });
      });
    }
    if (query.status) {
      leads = leads.filter(l => l.status === query.status);
    }
    if (query.source) {
      leads = leads.filter(l => l.source === query.source);
    }
    return leads.length;
  };

  LeadModel.aggregate = async function (pipeline) {
    // For lead statistics aggregation: group by status and count
    const leads = readJSON(LEADS_FILE);
    const stats = {};
    leads.forEach(l => {
      stats[l.status] = (stats[l.status] || 0) + 1;
    });
    return Object.keys(stats).map(status => ({
      _id: status,
      count: stats[status]
    }));
  };

  LeadModel.findById = async function (id) {
    const leads = readJSON(LEADS_FILE);
    const lead = leads.find(l => l._id === id.toString());
    if (!lead) return null;
    
    const doc = { ...lead };
    doc.save = async function () {
      const allLeads = readJSON(LEADS_FILE);
      const index = allLeads.findIndex(item => item._id === lead._id);
      if (index !== -1) {
        allLeads[index] = { ...this, updatedAt: new Date() };
        writeJSON(LEADS_FILE, allLeads);
      }
      return this;
    };
    doc.deleteOne = async function () {
      const allLeads = readJSON(LEADS_FILE);
      const filtered = allLeads.filter(item => item._id !== lead._id);
      writeJSON(LEADS_FILE, filtered);
      return { deletedCount: 1 };
    };
    return doc;
  };

  // Intercept constructor / document instantiations
  // Override constructor behavior for new Lead()
  const originalSave = LeadModel.prototype.save;
  LeadModel.prototype.save = async function () {
    if (global.useMockDb) {
      const leads = readJSON(LEADS_FILE);
      const leadObj = this.toObject ? this.toObject() : this;
      if (!leadObj._id) {
        leadObj._id = new mongoose.Types.ObjectId().toString();
      }
      if (!leadObj.createdAt) {
        leadObj.createdAt = new Date();
      }
      leadObj.updatedAt = new Date();

      const index = leads.findIndex(item => item._id === leadObj._id);
      if (index !== -1) {
        leads[index] = leadObj;
      } else {
        leads.push(leadObj);
      }

      writeJSON(LEADS_FILE, leads);
      // Assign values to this instance
      Object.assign(this, leadObj);
      this.deleteOne = async function () {
        const allLeads = readJSON(LEADS_FILE);
        const filtered = allLeads.filter(item => item._id !== leadObj._id);
        writeJSON(LEADS_FILE, filtered);
        return { deletedCount: 1 };
      };
      return this;
    }
    return originalSave.apply(this);
  };
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-crm', {
      serverSelectionTimeoutMS: 2000, // Timeout fast (2s) to enable resilient mock fallback
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Boot in Mock Mode
    setupMockDb();
  }
};

module.exports = connectDB;
