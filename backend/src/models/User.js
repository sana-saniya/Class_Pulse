const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['faculty', 'hod', 'student', 'parent'], required: true },
  rollNo: { type: String, default: null }, // for student or parent (linked student rollNo)
  department: { type: String, default: null },
  phone: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
