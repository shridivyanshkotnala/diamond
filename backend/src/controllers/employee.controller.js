const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../redis/redisClient');
const Employee = require('../models/employee.model');

// Generate unique Employee ID
const generateEmployeeId = () => {
  return 'EMP' + Math.floor(1000 + Math.random() * 9000).toString();
};

const createEmployee = async (req, res) => {
  try {
    const { name, phone, email, permissions, password } = req.body;
    const businessId = req.user.businessId; 

    // Step 2: Finalize if password is provided
    if (password) {
      const redisKey = `emp_draft:${businessId}`;
      let draftDataStr;
      
      if (redisClient) {
          draftDataStr = await redisClient.get(redisKey);
      }

      if (!draftDataStr) {
        return res.status(400).json({ success: false, message: 'Draft expired or not found' });
      }

      const draftData = JSON.parse(draftDataStr);

      let employeeId = generateEmployeeId();
      let isUnique = false;
      while (!isUnique) {
        const existing = await Employee.findOne({ employeeId });
        if (!existing) {
          isUnique = true;
        } else {
          employeeId = generateEmployeeId();
        }
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newEmployee = new Employee({
        businessId,
        employeeId,
        name: draftData.name,
        phone: draftData.phone,
        email: draftData.email,
        passwordHash,
        permissions: draftData.permissions
      });

      await newEmployee.save();

      if (redisClient) {
          await redisClient.del(redisKey);
      }

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: {
          employeeId: newEmployee.employeeId,
          name: newEmployee.name
        }
      });
    }

    // Step 1: Draft if no password
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const draftData = {
      businessId: businessId.toString(),
      name,
      phone,
      email,
      permissions: permissions || {}
    };

    const redisKey = `emp_draft:${businessId}`;
    if (redisClient) {
        await redisClient.set(redisKey, JSON.stringify(draftData), 'EX', 3600);
    }

    return res.status(200).json({
      success: true,
      message: 'Draft saved successfully'
    });

  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getEmployees = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const employees = await Employee.find({ businessId }).select('-passwordHash');

    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Get Employees Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createEmployee,
  getEmployees
};
