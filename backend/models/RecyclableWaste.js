const mongoose = require('mongoose');

const recyclableWasteSchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  unit: { 
    type: String, 
    required: true, 
    default: 'kg' 
  },
  lastUpdatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('RecyclableWaste', recyclableWasteSchema);