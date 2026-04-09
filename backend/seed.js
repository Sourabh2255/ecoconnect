require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const { PickupRequest, WasteDeclaration, MarketplaceListing, IssueReport, Notification, DumpingGround, ESGReport } = require('./models/index');

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    PickupRequest.deleteMany({}),
    WasteDeclaration.deleteMany({}),
    MarketplaceListing.deleteMany({}),
    IssueReport.deleteMany({}),
    Notification.deleteMany({}),
    DumpingGround.deleteMany({}),
    ESGReport.deleteMany({}),
  ]);

  console.log('Creating users...');

  // Officers
  const officer1 = await User.create({ fullName: 'Rajesh Sharma', email: 'officer1@ecoconnect.com', phone: '9876543210', password: 'Admin1234', role: 'government_officer', isEmailVerified: true, zone: 'pune-north', address: 'Pune Municipal Corporation, Shivajinagar, Pune' });
  const officer2 = await User.create({ fullName: 'Priya Desai', email: 'officer2@ecoconnect.com', phone: '9876543211', password: 'Admin1234', role: 'government_officer', isEmailVerified: true, zone: 'pune-south', address: 'Pune Municipal Corporation, Swargate, Pune' });

  // Collectors
  const c1 = await User.create({ fullName: 'Suresh Kumar', email: 'collector1@ecoconnect.com', phone: '9123456781', password: 'Driver1234', role: 'garbage_collector', isEmailVerified: true, zone: 'pune-north', vehicleNumber: 'MH12AB1234', currentLat: 18.5282, currentLng: 73.8527, isOnDuty: true });
  const c2 = await User.create({ fullName: 'Ravi Patil', email: 'collector2@ecoconnect.com', phone: '9123456782', password: 'Driver1234', role: 'garbage_collector', isEmailVerified: true, zone: 'pune-north', vehicleNumber: 'MH12CD5678', currentLat: 18.5160, currentLng: 73.8690 });
  const c3 = await User.create({ fullName: 'Anita Jadhav', email: 'collector3@ecoconnect.com', phone: '9123456783', password: 'Driver1234', role: 'garbage_collector', isEmailVerified: true, zone: 'pune-south', vehicleNumber: 'MH12EF9012', currentLat: 18.4997, currentLng: 73.8560 });

  // Citizens
  const cit1 = await User.create({ fullName: 'Aditya Verma', email: 'citizen@demo.com', phone: '9800001111', password: 'Demo1234', role: 'citizen', isEmailVerified: true, ecoPoints: 285, loginStreak: 5, address: 'Flat 3B, Cosmos Heights, Kothrud, Pune 411038' });
  const cit2 = await User.create({ fullName: 'Meera Singh', email: 'eco@demo.com', phone: '9800002222', password: 'Demo1234', role: 'citizen', isEmailVerified: true, ecoPoints: 520, loginStreak: 12, address: '15, Green Park Colony, Baner, Pune 411045' });
  const cit3 = await User.create({ fullName: 'Karan Mehta', email: 'green@demo.com', phone: '9800003333', password: 'Demo1234', role: 'citizen', isEmailVerified: true, ecoPoints: 140, loginStreak: 2, address: '7, Shanti Nagar, Wakad, Pune 411057' });

  // Industries
  const ind1 = await User.create({ fullName: 'Vikram Joshi', email: 'industry@demo.com', phone: '9700001111', password: 'Demo1234', role: 'industry', isEmailVerified: true, companyName: 'GreenTech Industries', gstNumber: 'ABCDE1234F5678G', industryType: 'Manufacturing', acceptsWasteTypes: ['metal', 'plastic', 'paper'], lat: 18.5320, lng: 73.8550, address: 'Plot 45, Bhosari MIDC, Pune 411026', complianceScore: 87 });
  const ind2 = await User.create({ fullName: 'Nisha Agarwal', email: 'factory@demo.com', phone: '9700002222', password: 'Demo1234', role: 'industry', isEmailVerified: true, companyName: 'PaperCycle Pvt Ltd', gstNumber: 'HIJKL5678M9012N', industryType: 'Recycling', acceptsWasteTypes: ['paper', 'cardboard', 'organic'], lat: 18.4820, lng: 73.8620, address: 'Gat No 234, Uruli Kanchan, Pune 412202', complianceScore: 94 });

  console.log('Creating pickup requests...');

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

  const p1 = await PickupRequest.create({ citizenId: cit1._id, wasteTypes: ['organic', 'recyclable'], scheduledDate: tomorrow, timeSlot: 'morning', address: 'Flat 3B, Cosmos Heights, Kothrud, Pune', addressLat: 18.5074, addressLng: 73.8077, status: 'confirmed', collectorId: c1._id, qrCode: `ECO-${Date.now()}-1`, zone: 'pune-north' });
  await PickupRequest.create({ citizenId: cit2._id, wasteTypes: ['e-waste', 'hazardous'], scheduledDate: nextWeek, timeSlot: 'afternoon', address: '15, Green Park Colony, Baner, Pune', addressLat: 18.5589, addressLng: 73.7868, status: 'pending', qrCode: `ECO-${Date.now()}-2`, zone: 'pune-north' });
  await PickupRequest.create({ citizenId: cit1._id, wasteTypes: ['bulky'], scheduledDate: yesterday, timeSlot: 'evening', address: 'Flat 3B, Cosmos Heights, Kothrud', addressLat: 18.5074, addressLng: 73.8077, status: 'collected', collectorId: c1._id, qrCode: `ECO-${Date.now()}-3`, zone: 'pune-north', ecoPointsAwarded: true });
  await PickupRequest.create({ citizenId: cit3._id, wasteTypes: ['organic'], scheduledDate: tomorrow, timeSlot: 'morning', address: '7, Shanti Nagar, Wakad, Pune', addressLat: 18.5913, addressLng: 73.7617, status: 'en-route', collectorId: c2._id, qrCode: `ECO-${Date.now()}-4`, zone: 'pune-north' });
  await PickupRequest.create({ citizenId: cit2._id, wasteTypes: ['recyclable', 'paper'], scheduledDate: nextWeek, timeSlot: 'morning', address: '15, Green Park Colony, Baner', addressLat: 18.5589, addressLng: 73.7868, status: 'pending', qrCode: `ECO-${Date.now()}-5`, zone: 'pune-north' });

  console.log('Creating waste declarations...');
  const d1 = await WasteDeclaration.create({ industryId: ind1._id, wasteCategory: 'hazardous', subType: 'Chemical Solvent', volumeKg: 450, hazardLevel: 'high', preferredDate: tomorrow, pickupAddress: 'Plot 45, Bhosari MIDC, Pune', ownerContact: '9700001111', specialNotes: 'Handle with PPE. Corrosive material.', zone: 'pune-north', qrCode: `IND-${Date.now()}-1` });
  await WasteDeclaration.create({ industryId: ind1._id, wasteCategory: 'recyclable', subType: 'Aluminum Scrap', volumeKg: 1200, hazardLevel: 'low', preferredDate: nextWeek, pickupAddress: 'Plot 45, Bhosari MIDC, Pune', ownerContact: '9700001111', zone: 'pune-north', qrCode: `IND-${Date.now()}-2`, status: 'assigned', collectorId: c3._id });
  await WasteDeclaration.create({ industryId: ind2._id, wasteCategory: 'organic', subType: 'Paper Pulp Waste', volumeKg: 800, hazardLevel: 'low', preferredDate: tomorrow, pickupAddress: 'Gat No 234, Uruli Kanchan, Pune', ownerContact: '9700002222', zone: 'pune-south', qrCode: `IND-${Date.now()}-3` });

  console.log('Creating marketplace listings...');
  await MarketplaceListing.create({ industryId: ind1._id, title: 'Aluminum Metal Scrap', wasteType: 'metal', quantity: 500, unit: 'kg', pricePerUnit: 45, description: 'High quality aluminum offcuts from CNC machining. Clean, sorted by grade.' });
  await MarketplaceListing.create({ industryId: ind2._id, title: 'Cardboard & Paper Waste', wasteType: 'paper', quantity: 2000, unit: 'kg', pricePerUnit: 8, description: 'Mixed cardboard boxes and printing paper. Baled and ready for transport.' });
  await MarketplaceListing.create({ industryId: ind1._id, title: 'Industrial Plastic Granules', wasteType: 'plastic', quantity: 300, unit: 'kg', pricePerUnit: 22, description: 'ABS plastic granules from injection molding waste. Sorted by color.' });

  console.log('Creating issue reports...');
  await IssueReport.create({ reportedBy: cit1._id, title: 'Overflowing dustbin near bus stop', description: 'The dustbin near Kothrud bus depot has been overflowing for 3 days. Creating unhygienic conditions.', location: 'Kothrud Bus Depot, Pune', lat: 18.5074, lng: 73.8077, category: 'overflow', zone: 'pune-north', status: 'in-progress', assignedTo: officer1._id });
  await IssueReport.create({ reportedBy: cit2._id, title: 'Illegal dumping near lake', description: 'Construction debris being dumped near Pashan lake. Need immediate action.', location: 'Pashan Lake Road, Pune', lat: 18.5336, lng: 73.7869, category: 'illegal-dumping', zone: 'pune-north', status: 'open' });

  console.log('Creating dumping grounds...');
  await DumpingGround.create({ name: 'Uruli Devachi Waste Processing Center', address: 'Uruli Devachi, Pune 412308', lat: 18.4423, lng: 73.9600, totalCapacityTons: 2000, usedCapacityTons: 1340, wasteTypes: ['organic', 'mixed'], zone: 'pune-south', contactPhone: '020-12345678', operatingHours: '6 AM - 8 PM' });
  await DumpingGround.create({ name: 'Hadapsar Recycling Zone', address: 'Hadapsar Industrial Area, Pune 411028', lat: 18.4988, lng: 73.9259, totalCapacityTons: 800, usedCapacityTons: 420, wasteTypes: ['recyclable', 'metal', 'plastic'], zone: 'pune-south', contactPhone: '020-87654321', operatingHours: '7 AM - 6 PM' });
  await DumpingGround.create({ name: 'Pimpri-Chinchwad E-Waste Hub', address: 'PCMC Industrial Estate, Pimpri, Pune 411018', lat: 18.6279, lng: 73.7997, totalCapacityTons: 300, usedCapacityTons: 95, wasteTypes: ['e-waste', 'hazardous'], zone: 'pune-north', contactPhone: '020-11223344', operatingHours: '9 AM - 5 PM' });
  await DumpingGround.create({ name: 'Katraj Compost Plant', address: 'Katraj, Pune 411046', lat: 18.4536, lng: 73.8672, totalCapacityTons: 500, usedCapacityTons: 280, wasteTypes: ['organic', 'garden'], zone: 'pune-south', contactPhone: '020-44556677', operatingHours: '6 AM - 7 PM' });
  await DumpingGround.create({ name: 'Bhosari Industrial Waste Yard', address: 'Bhosari MIDC, Pune 411026', lat: 18.6311, lng: 73.8545, totalCapacityTons: 1000, usedCapacityTons: 650, wasteTypes: ['industrial', 'chemical', 'hazardous'], zone: 'pune-north', contactPhone: '020-99887766', operatingHours: '8 AM - 6 PM' });

  console.log('Creating ESG reports...');
  await ESGReport.create({ industryId: ind1._id, period: '2025-Q4', totalWaste: 3500, recycledWaste: 2800, co2Saved: 1400, co2Emitted: 210, recyclingRate: 80, grade: 'A', score: 80, zone: 'pune-north' });
  await ESGReport.create({ industryId: ind2._id, period: '2025-Q4', totalWaste: 5200, recycledWaste: 4900, co2Saved: 2450, co2Emitted: 90, recyclingRate: 94, grade: 'A+', score: 94, zone: 'pune-south' });

  console.log('Creating notifications...');
  const notifs = [
    { userId: cit1._id, title: 'Welcome to EcoConnect!', message: 'Start scheduling pickups and earn Eco Points!', type: 'info' },
    { userId: cit1._id, title: 'Pickup Confirmed', message: 'Your pickup for tomorrow morning has been confirmed.', type: 'success' },
    { userId: cit2._id, title: 'Eco Points Earned!', message: 'You earned 20 points for completing a pickup. Keep it up!', type: 'success' },
    { userId: officer1._id, title: 'New Pickup Request', message: 'A new pickup request in pune-north needs assignment.', type: 'warning' },
    { userId: officer1._id, title: 'Industry Declaration', message: 'GreenTech Industries submitted a hazardous waste declaration.', type: 'warning' },
    { userId: c1._id, title: 'New Assignment', message: 'You have a new pickup assigned for tomorrow.', type: 'info' },
    { userId: ind1._id, title: 'Declaration Received', message: 'Your waste declaration has been submitted and is pending review.', type: 'info' },
    { userId: cit3._id, title: 'Collector En Route', message: 'Your garbage collector is on the way!', type: 'success' },
    { userId: officer2._id, title: 'Complaint Escalated', message: 'A complaint has been open for more than 48 hours.', type: 'error' },
    { userId: ind2._id, title: 'ESG Grade Updated', message: 'Your ESG grade has been updated to A+ for Q4 2025.', type: 'success' },
  ];
  await Notification.insertMany(notifs);

  console.log('\n✅ Seed completed successfully!\n');
  console.log('📋 Demo Credentials:');
  console.log('  Officers:    officer1@ecoconnect.com / Admin1234');
  console.log('              officer2@ecoconnect.com / Admin1234');
  console.log('  Collectors:  collector1@ecoconnect.com / Driver1234');
  console.log('              collector2@ecoconnect.com / Driver1234');
  console.log('              collector3@ecoconnect.com / Driver1234');
  console.log('  Citizens:    citizen@demo.com / Demo1234');
  console.log('              eco@demo.com / Demo1234');
  console.log('              green@demo.com / Demo1234');
  console.log('  Industries:  industry@demo.com / Demo1234');
  console.log('              factory@demo.com / Demo1234');

  mongoose.connection.close();
};

seed().catch(err => { console.error(err); process.exit(1); });
