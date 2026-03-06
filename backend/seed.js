/**
 * EcoConnect Database Seeder
 * Run: node seed.js
 * Creates demo users and sample data
 */
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const bcrypt   = require('bcryptjs');

dotenv.config();

const User              = require('./models/User');
const PickupRequest     = require('./models/PickupRequest');
const WasteDeclaration  = require('./models/WasteDeclaration');
const MarketplaceListing= require('./models/MarketplaceListing');
const IssueReport       = require('./models/IssueReport');
const Notification      = require('./models/Notification');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), PickupRequest.deleteMany({}),
      WasteDeclaration.deleteMany({}), MarketplaceListing.deleteMany({}),
      IssueReport.deleteMany({}), Notification.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      // Citizens
      { fullName: 'Aisha Sharma',  email: 'citizen@demo.com',   phone: '9876543210', password: 'demo1234', role: 'citizen',     ecoPoints: 1250, level: 'Green Warrior',  neighbourhood: 'Koregaon Park' },
      { fullName: 'Raj Patel',     email: 'raj@demo.com',       phone: '9876543211', password: 'demo1234', role: 'citizen',     ecoPoints: 2100, level: 'Eco Hero',       neighbourhood: 'Baner' },
      { fullName: 'Priya Nair',    email: 'priya@demo.com',     phone: '9876543212', password: 'demo1234', role: 'citizen',     ecoPoints: 875,  level: 'Recycler',       neighbourhood: 'Viman Nagar' },
      { fullName: 'Kiran Mehta',   email: 'kiran@demo.com',     phone: '9876543213', password: 'demo1234', role: 'citizen',     ecoPoints: 3200, level: 'Eco Hero',       neighbourhood: 'Hinjewadi' },
      // Government
      { fullName: 'Officer Desai', email: 'govt@demo.com',      phone: '9876543220', password: 'demo1234', role: 'government',  department: 'Solid Waste Mgmt', employeeId: 'PMC-001', zone: 'North Zone' },
      { fullName: 'Officer Kaur',  email: 'officer2@demo.com',  phone: '9876543221', password: 'demo1234', role: 'government',  department: 'Solid Waste Mgmt', employeeId: 'PMC-002', zone: 'South Zone' },
      // Industry
      { fullName: 'Vikram Singh',  email: 'industry@demo.com',  phone: '9876543230', password: 'demo1234', role: 'industry',    companyName: 'TechFab Industries', industryType: 'Manufacturing', businessRegNum: 'MH-2023-001', complianceScore: 87 },
      { fullName: 'Anita Shah',    email: 'industry2@demo.com', phone: '9876543231', password: 'demo1234', role: 'industry',    companyName: 'GreenChem Pvt Ltd',  industryType: 'Chemical',       businessRegNum: 'MH-2023-002', complianceScore: 94 }
    ]);
    console.log(`Created ${users.length} users`);

    const [aisha, raj, priya, kiran, desai, kaur, techfab, greenchem] = users;

    // Pickup requests
    const pickups = await PickupRequest.create([
      { citizen: aisha._id, collector: desai._id, wasteTypes: ['organic','recyclable'], scheduledDate: new Date(Date.now() + 2*86400000), timeSlot: 'morning',   quantity: 'medium', address: '12, Rose Garden, Koregaon Park, Pune', status: 'confirmed',  qrCode: 'ECO-001-AISHA1' },
      { citizen: aisha._id, collector: desai._id, wasteTypes: ['e-waste'],              scheduledDate: new Date(Date.now() - 3*86400000), timeSlot: 'afternoon', quantity: 'small',  address: '12, Rose Garden, Koregaon Park, Pune', status: 'collected',  qrCode: 'ECO-002-AISHA2', ecoPointsAwarded: 20 },
      { citizen: raj._id,                          wasteTypes: ['recyclable'],           scheduledDate: new Date(Date.now() + 1*86400000), timeSlot: 'evening',   quantity: 'small',  address: '45, Green Valley, Baner, Pune',        status: 'pending',    qrCode: 'ECO-003-RAJ001' },
      { citizen: priya._id, collector: kaur._id,   wasteTypes: ['hazardous'],            scheduledDate: new Date(Date.now() + 4*86400000), timeSlot: 'morning',   quantity: 'small',  address: '78, Sunrise Apt, Viman Nagar, Pune',   status: 'confirmed',  qrCode: 'ECO-004-PRIYA1' },
      { citizen: kiran._id,                         wasteTypes: ['bulky'],               scheduledDate: new Date(Date.now() + 5*86400000), timeSlot: 'afternoon', quantity: 'bulk',   address: '90, Tech Park Rd, Hinjewadi, Pune',    status: 'pending',    qrCode: 'ECO-005-KIRAN1' }
    ]);
    console.log(`Created ${pickups.length} pickup requests`);

    // Waste declarations
    const declarations = await WasteDeclaration.create([
      { industry: techfab._id,  wasteCategory: 'Industrial Waste', wasteSubType: 'Metal Scrap',    volumeKg: 450, hazardLevel: 'low',  packagingType: 'Drummed', preferredDate: new Date(Date.now() + 3*86400000),  status: 'pending',   qrCode: 'IND-001-TECH01' },
      { industry: techfab._id,  wasteCategory: 'Chemical Waste',   wasteSubType: 'Solvent Waste',  volumeKg: 120, hazardLevel: 'high', packagingType: 'Containerized', preferredDate: new Date(Date.now() + 2*86400000), status: 'confirmed', qrCode: 'IND-002-TECH02' },
      { industry: greenchem._id,wasteCategory: 'Recyclable Material',wasteSubType:'Paper/Cardboard',volumeKg:800, hazardLevel: 'none', packagingType: 'Bagged', preferredDate: new Date(Date.now() - 5*86400000), status: 'certified', qrCode: 'IND-003-GREEN1' },
      { industry: greenchem._id,wasteCategory: 'Industrial Waste', wasteSubType: 'Plastic Offcuts',volumeKg: 230, hazardLevel: 'none', packagingType: 'Bagged', preferredDate: new Date(Date.now() + 7*86400000),  status: 'pending',   qrCode: 'IND-004-GREEN2' }
    ]);
    console.log(`Created ${declarations.length} waste declarations`);

    // Marketplace listings
    await MarketplaceListing.create([
      { seller: techfab._id,  materialType: 'Metal',  subType: 'Steel Scrap', quantityKg: 400, pricePerKg: 12, minOrderKg: 50, location: 'Pune, MH', description: 'Clean mild steel offcuts from CNC machining' },
      { seller: greenchem._id,materialType: 'Paper',  subType: 'Cardboard',   quantityKg: 800, pricePerKg: 5,  minOrderKg: 100,location: 'Pune, MH', description: 'Clean double-walled cardboard bales, moisture-free' },
      { seller: techfab._id,  materialType: 'Plastic',subType: 'HDPE Resin',  quantityKg: 200, pricePerKg: 18, minOrderKg: 25, location: 'Pune, MH', description: 'Post-industrial HDPE granules, food-grade quality' },
      { seller: greenchem._id,materialType: 'Glass',  subType: 'Clear Glass', quantityKg: 300, pricePerKg: 4,  minOrderKg: 50, location: 'Pune, MH', description: 'Laboratory clear glass bottles, clean and intact' }
    ]);
    console.log('Created marketplace listings');

    // Issue reports
    await IssueReport.create([
      { citizen: aisha._id, issueType: 'Overflowing Bin',  address: 'MG Road, Near Mall', severity: 'high',   description: 'Main garbage bin overflowing since 2 days', status: 'open' },
      { citizen: raj._id,   issueType: 'Illegal Dumping',  address: 'Baner Road, Plot 45', severity: 'medium', description: 'Construction debris dumped on roadside',    status: 'assigned', assignedTo: desai._id },
      { citizen: priya._id, issueType: 'Missed Pickup',    address: 'Viman Nagar Sector 3', severity: 'low',   description: 'Scheduled pickup was missed last Monday',   status: 'resolved', resolvedAt: new Date() }
    ]);
    console.log('Created issue reports');

    // Notifications
    await Notification.create([
      { user: aisha._id, title: 'Pickup Confirmed!',      message: 'Your organic/recyclable pickup on ' + new Date(Date.now()+2*86400000).toDateString() + ' is confirmed.', type: 'pickup' },
      { user: aisha._id, title: 'Pickup Completed! 🎉',   message: 'Your e-waste has been collected. You earned 20 Eco Points!', type: 'pickup', isRead: true },
      { user: aisha._id, title: 'Leaderboard Update 🏆',  message: 'You moved up to Rank #3 in your neighbourhood!', type: 'system' },
      { user: techfab._id,title: 'Declaration Received',  message: 'Your 450kg Industrial Waste declaration is pending collector assignment.', type: 'pickup' }
    ]);
    console.log('Created notifications');

    console.log('\n=========================================');
    console.log('  ✅ Database seeded successfully!');
    console.log('=========================================');
    console.log('\n  Demo Login Credentials:');
    console.log('  ─────────────────────────────────────');
    console.log('  👥 Citizen:    citizen@demo.com   / demo1234');
    console.log('  🏛️  Government: govt@demo.com     / demo1234');
    console.log('  🏭 Industry:   industry@demo.com  / demo1234');
    console.log('=========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seed();
