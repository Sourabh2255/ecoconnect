const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema({
  citizen:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issueType:   { type: String, required: true },
  photoUrl:    { type: String, default: '' },
  address:     { type: String, default: '' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  severity:    { type: String, enum: ['low','medium','high'], default: 'low' },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['open','assigned','in-progress','resolved'], default: 'open' },
  resolvedAt:  { type: Date },
  isEscalated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('IssueReport', issueReportSchema);
