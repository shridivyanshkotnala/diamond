require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const env = require('./src/config/env');
const bcrypt = require('bcryptjs');

mongoose.connect(env.mongodb.uri).then(async () => {
  const Employee = require('./src/models/employee.model');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('SHARMA123', salt);
  await Employee.updateOne({ employeeId: 'EMP3915' }, { $set: { passwordHash: hash } });
  console.log('Password updated for EMP3915');
  process.exit(0);
});
