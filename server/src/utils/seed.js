const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { connectDB, closeDB } = require('../config/db');
const {
  User,
  Category,
  Person,
  Item,
  Transaction,
  AuditLog,
} = require('../models');

const seedDatabase = async () => {
  try {
    console.log('--- Starting Database Seeding ---');
    await connectDB();

    // 1. Clean existing collections
    console.log('[1/6] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Person.deleteMany({}),
      Item.deleteMany({}),
      Transaction.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('✓ All collections cleaned.');

    // 2. Seed Users
    console.log('[2/6] Seeding Users...');
    const adminUser = new User({
      username: 'admin',
      email: 'admin@mana.store',
      passwordHash: 'Admin@123',
      role: 'ADMIN',
      isActive: true,
    });
    await adminUser.save();

    const storekeeperUser = new User({
      username: 'storekeeper',
      email: 'storekeeper@mana.store',
      passwordHash: 'Store@123',
      role: 'STOREKEEPER',
      isActive: true,
    });
    await storekeeperUser.save();

    console.log(`✓ Seeded 2 users: ${adminUser.username} (ADMIN), ${storekeeperUser.username} (STOREKEEPER).`);

    // 3. Seed Categories
    console.log('[3/6] Seeding Categories...');
    const categories = await Category.insertMany([
      {
        name: 'Electronics & Testing',
        description: 'Oscilloscopes, multimeters, power supplies, logic analyzers, and RF equipment',
        parentCategory: null,
      },
      {
        name: 'Power & Hand Tools',
        description: 'Drills, grinders, torque wrenches, soldering stations, and specialized toolsets',
        parentCategory: null,
      },
      {
        name: 'Optics & Laboratory',
        description: 'Microscopes, spectroscopy instruments, lasers, and precision measuring sensors',
        parentCategory: null,
      },
    ]);
    console.log(`✓ Seeded ${categories.length} categories.`);

    const catElectronics = categories[0];
    const catTools = categories[1];
    const catOptics = categories[2];

    // 4. Seed People (3 Students, 2 Staff)
    console.log('[4/6] Seeding People / Borrowers...');
    const students = await Person.insertMany([
      {
        name: 'Alex Turner',
        type: 'STUDENT',
        identifier: 'STU-0101',
        department: 'Computer Engineering',
        email: 'alex.turner@campus.edu',
        phone: '+1-555-0101',
        activeItemsCount: 0,
        status: 'ACTIVE',
      },
      {
        name: 'Priya Sharma',
        type: 'STUDENT',
        identifier: 'STU-0102',
        department: 'Electrical Engineering',
        email: 'priya.sharma@campus.edu',
        phone: '+1-555-0102',
        activeItemsCount: 1, // Will hold Laser Meter
        status: 'ACTIVE',
      },
      {
        name: 'Jordan Lee',
        type: 'STUDENT',
        identifier: 'STU-0103',
        department: 'Mechanical Engineering',
        email: 'jordan.lee@campus.edu',
        phone: '+1-555-0103',
        activeItemsCount: 1, // Will hold Rotary Hammer (overdue)
        status: 'ACTIVE',
      },
    ]);

    const staffMembers = await Person.insertMany([
      {
        name: 'Dr. Marcus Vance',
        type: 'FACULTY',
        identifier: 'STF-0201',
        department: 'Robotics & Automation Lab',
        email: 'm.vance@campus.edu',
        phone: '+1-555-0201',
        activeItemsCount: 0,
        status: 'ACTIVE',
      },
      {
        name: 'Elena Rostova',
        type: 'STAFF',
        identifier: 'STF-0202',
        department: 'Physics Department',
        email: 'elena.rostova@campus.edu',
        phone: '+1-555-0202',
        activeItemsCount: 0,
        status: 'ACTIVE',
      },
    ]);
    console.log(`✓ Seeded 3 students and 2 staff members.`);

    const studentPriya = students[1];
    const studentJordan = students[2];
    const facultyMarcus = staffMembers[0];

    // 5. Seed 6 Items across states
    console.log('[5/6] Seeding Items across multiple states...');
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    const items = await Item.insertMany([
      {
        assetId: 'EQ-1001',
        name: 'Digital Storage Oscilloscope 100MHz 4CH',
        category: catElectronics._id,
        trackingType: 'INDIVIDUAL_ASSET',
        quantity: 1,
        status: 'AVAILABLE',
        condition: 'GOOD',
        currentLocation: 'Shelf A-12',
        currentBorrower: null,
        currentExpectedReturnDate: null,
        serialNumber: 'DSO-90218-X',
        notes: 'Calibrated on Sep 2026. Ready for checkout.',
      },
      {
        assetId: 'EQ-1002',
        name: 'Laser Distance Meter & Rangefinder 100m',
        category: catOptics._id,
        trackingType: 'INDIVIDUAL_ASSET',
        quantity: 1,
        status: 'ISSUED',
        condition: 'GOOD',
        currentLocation: 'With Borrower',
        currentBorrower: studentPriya._id,
        currentExpectedReturnDate: threeDaysLater,
        serialNumber: 'LDM-44102',
        notes: 'Issued for Senior Capstone Field Survey.',
      },
      {
        assetId: 'EQ-1003',
        name: 'Cordless Brushless Heavy Rotary Hammer Drill',
        category: catTools._id,
        trackingType: 'INDIVIDUAL_ASSET',
        quantity: 1,
        status: 'ISSUED',
        condition: 'FAIR',
        currentLocation: 'With Borrower',
        currentBorrower: studentJordan._id,
        currentExpectedReturnDate: fourDaysAgo, // Overdue
        serialNumber: 'RHD-88319',
        notes: 'Overdue notice sent to borrower.',
      },
      {
        assetId: 'EQ-1004',
        name: 'Binocular Stereo Zoom Microscope 45X HD',
        category: catOptics._id,
        trackingType: 'INDIVIDUAL_ASSET',
        quantity: 1,
        status: 'AVAILABLE',
        condition: 'NEW',
        currentLocation: 'Cabinet C-04',
        currentBorrower: null,
        currentExpectedReturnDate: null,
        serialNumber: 'MIC-2026-004',
        notes: 'Brand new laboratory addition with optical dust cover.',
      },
      {
        assetId: 'EQ-1005',
        name: 'Programmable Triple Output DC Power Supply 30V/5A',
        category: catElectronics._id,
        trackingType: 'INDIVIDUAL_ASSET',
        quantity: 1,
        status: 'UNDER_MAINTENANCE',
        condition: 'FAIR',
        currentLocation: 'Repair Bench B-01',
        currentBorrower: null,
        currentExpectedReturnDate: null,
        serialNumber: 'PSU-77215',
        notes: 'Channel 2 current regulation calibration in progress.',
      },
      {
        assetId: 'EQ-1006',
        name: 'Professional ESD Safe Soldering Rework Station 750W',
        category: catTools._id,
        trackingType: 'INDIVIDUAL_ASSET',
        quantity: 1,
        status: 'AVAILABLE',
        condition: 'GOOD',
        currentLocation: 'Bench T-03',
        currentBorrower: null,
        currentExpectedReturnDate: null,
        serialNumber: 'SLD-61099',
        notes: 'Includes hot air nozzle accessories and micro-tips.',
      },
    ]);
    console.log(`✓ Seeded ${items.length} items across AVAILABLE, ISSUED, and UNDER_MAINTENANCE states.`);

    // 6. Seed Past & Active Transactions and Audit Logs
    console.log('[6/6] Seeding Transactions and Audit Logs...');
    const pastIssueDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const pastReturnDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const transactions = await Transaction.insertMany([
      // Past completed cycle for EQ-1001
      {
        type: 'ISSUE',
        item: items[0]._id,
        person: facultyMarcus._id,
        performedBy: storekeeperUser._id,
        issueDate: pastIssueDate,
        expectedReturnDate: pastReturnDate,
        actualReturnDate: null,
        conditionAtEvent: 'GOOD',
        purpose: 'Robotics sensor frequency testing in Lab 3',
        remarks: 'Issued with 4 probe sets',
      },
      {
        type: 'RETURN',
        item: items[0]._id,
        person: facultyMarcus._id,
        performedBy: storekeeperUser._id,
        issueDate: pastIssueDate,
        actualReturnDate: pastReturnDate,
        conditionAtEvent: 'GOOD',
        purpose: 'Return after experiment completion',
        remarks: 'Returned in clean, calibrated working condition',
      },
      // Active issue for EQ-1002 (Priya)
      {
        type: 'ISSUE',
        item: items[1]._id,
        person: studentPriya._id,
        performedBy: storekeeperUser._id,
        issueDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        expectedReturnDate: threeDaysLater,
        actualReturnDate: null,
        conditionAtEvent: 'GOOD',
        purpose: 'Solar farm layout distance survey',
        remarks: 'Target plate included',
      },
      // Active overdue issue for EQ-1003 (Jordan)
      {
        type: 'ISSUE',
        item: items[2]._id,
        person: studentJordan._id,
        performedBy: adminUser._id,
        issueDate: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
        expectedReturnDate: fourDaysAgo,
        actualReturnDate: null,
        conditionAtEvent: 'GOOD',
        purpose: 'Mechanical fabrication project',
        remarks: 'Includes SDS chuck adapter',
      },
      // Maintenance routing for EQ-1005
      {
        type: 'MAINTENANCE_IN',
        item: items[4]._id,
        person: null,
        performedBy: storekeeperUser._id,
        issueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        conditionAtEvent: 'FAIR',
        purpose: 'Bench PSU maintenance routing',
        remarks: 'Channel 2 calibration check',
      },
    ]);
    console.log(`✓ Seeded ${transactions.length} historical and active transactions.`);

    // Audit Logs
    await AuditLog.insertMany([
      {
        performedBy: adminUser._id,
        action: 'SYSTEM_INITIALIZED',
        targetEntity: 'System',
        targetId: null,
        details: { message: 'Database seeded with core operational dataset' },
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
      },
      {
        performedBy: storekeeperUser._id,
        action: 'ITEM_ISSUED',
        targetEntity: 'Item',
        targetId: items[1]._id,
        details: {
          assetId: items[1].assetId,
          borrower: studentPriya.name,
          transactionId: transactions[2]._id,
        },
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
      },
      {
        performedBy: adminUser._id,
        action: 'ITEM_ISSUED',
        targetEntity: 'Item',
        targetId: items[2]._id,
        details: {
          assetId: items[2].assetId,
          borrower: studentJordan.name,
          transactionId: transactions[3]._id,
        },
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
      },
    ]);
    console.log('✓ Seeded initial audit logs.');

    console.log('----------------------------------------------------');
    console.log('🎉 Database seeding completed successfully!');
    console.log('Default credentials for testing:');
    console.log('  Admin User:       admin@mana.store / Admin@123');
    console.log('  Storekeeper User: storekeeper@mana.store / Store@123');
    console.log('----------------------------------------------------');

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await closeDB();
    process.exit(1);
  }
};

seedDatabase();
