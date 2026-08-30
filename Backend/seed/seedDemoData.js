const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('../models/userModel');
const { Hall } = require('../models/Hall');
const { HallBlock } = require('../models/HallBlock');
const { Reservation } = require('../models/Reservation');
const Notification = require('../models/Notification');

dotenv.config();

const formatDateLocal = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getOffsetDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateLocal(d);
};

// Seed Users Data
const usersSeedData = [
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@student.svgu.edu.in',
    password: 'studentpassword123',
    role: 'USER',
    userType: 'STUDENT',
    department: 'MCA',
    collegeId: 'STUDENT-2026-MCA',
    phone: '+91 98765 43210',
    isActive: true
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@faculty.svgu.edu.in',
    password: 'facultypassword123',
    role: 'USER',
    userType: 'FACULTY',
    department: 'Computer Science',
    collegeId: 'FAC-CS-102',
    phone: '+91 98123 45678',
    isActive: true
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@student.svgu.edu.in',
    password: 'Demo@123',
    role: 'USER',
    userType: 'STUDENT',
    department: 'BCA',
    collegeId: 'STUDENT-2026-BCA',
    phone: '+91 97654 32109',
    isActive: true
  },
  {
    name: 'Dr. Sneha Reddy',
    email: 'sneha.reddy@faculty.svgu.edu.in',
    password: 'Demo@123',
    role: 'USER',
    userType: 'FACULTY',
    department: 'IT',
    collegeId: 'FAC-IT-205',
    phone: '+91 96543 21098',
    isActive: true
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@staff.svgu.edu.in',
    password: 'Demo@123',
    role: 'USER',
    userType: 'STAFF',
    department: 'Management',
    collegeId: 'STAFF-MGT-05',
    phone: '+91 95432 10987',
    isActive: true
  },
  {
    name: 'Ananya Joshi',
    email: 'ananya.joshi@club.svgu.edu.in',
    password: 'Demo@123',
    role: 'USER',
    userType: 'CLUB',
    department: 'MCA',
    collegeId: 'CLUB-LEAD-01',
    phone: '+91 94321 09876',
    isActive: true
  },
  {
    name: 'SVGU Tech Club',
    email: 'tech.club@club.svgu.edu.in',
    password: 'Demo@123',
    role: 'USER',
    userType: 'CLUB',
    department: 'Computer Science',
    collegeId: 'CLUB-TECH-02',
    phone: '+91 93210 98765',
    isActive: true
  },
  {
    name: 'Sports Department',
    email: 'sports.dept@department.svgu.edu.in',
    password: 'Demo@123',
    role: 'USER',
    userType: 'DEPARTMENT',
    department: 'Sports',
    collegeId: 'DEPT-SPORTS-01',
    phone: '+91 92109 87654',
    isActive: true
  },
  {
    name: 'Cultural Society',
    email: 'cultural.soc@club.svgu.edu.in',
    password: 'Demo@123',
    role: 'USER',
    userType: 'CLUB',
    department: 'Management',
    collegeId: 'CLUB-CULT-03',
    phone: '+91 91098 76543',
    isActive: true
  },
  {
    name: 'HOD Computer Science',
    email: 'hod.cs@faculty.svgu.edu.in',
    password: 'Demo@123',
    role: 'USER',
    userType: 'FACULTY',
    department: 'Computer Science',
    collegeId: 'FAC-CS-HOD',
    phone: '+91 90987 65432',
    isActive: true
  }
];

// Seed Halls Data
const hallsSeedData = [
  {
    hallName: 'Assembly Hall',
    hallType: 'ASSEMBLY',
    capacity: 500,
    location: 'Main Block, 2nd Floor',
    description: 'Spacious multi-tiered hall designed for college assemblies, guest lectures, large departmental meetings, and student union gatherings.',
    openingTime: '08:00',
    closingTime: '19:00',
    facilities: ['PROJECTOR', 'MICROPHONE', 'SOUND_SYSTEM', 'STAGE', 'WIFI', 'AIR_CONDITIONING', 'SEATING'],
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80',
    isActive: true
  },
  {
    hallName: 'Main Auditorium',
    hallType: 'AUDITORIUM',
    capacity: 800,
    location: 'Central Campus Complex, Grand Wing',
    description: 'State-of-the-art college auditorium equipped with high-definition projection, acoustic wall paneling, full stage lighting, and professional sound system.',
    openingTime: '08:00',
    closingTime: '20:00',
    facilities: ['PROJECTOR', 'MICROPHONE', 'SOUND_SYSTEM', 'STAGE', 'AIR_CONDITIONING', 'WIFI', 'SMART_BOARD', 'SEATING'],
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
    isActive: true
  },
  {
    hallName: 'Sports Hall',
    hallType: 'SPORTS',
    capacity: 300,
    location: 'Indoor Sports Pavilion',
    description: 'High-ceiling indoor athletic venue featuring wood parquet floor layout, public address speakers, and spectator gallery.',
    openingTime: '06:00',
    closingTime: '21:00',
    facilities: ['SPORTS_EQUIPMENT', 'SEATING', 'MICROPHONE', 'SOUND_SYSTEM', 'WIFI'],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
    isActive: true
  },
  {
    hallName: 'Seminar Hall',
    hallType: 'SEMINAR',
    capacity: 120,
    location: 'Academic Building Block A, 3rd Floor',
    description: 'Tiered executive seminar hall with integrated interactive smart boards, individual desk power outlets, and video conferencing capabilities.',
    openingTime: '08:00',
    closingTime: '18:00',
    facilities: ['PROJECTOR', 'SMART_BOARD', 'WIFI', 'AIR_CONDITIONING', 'MICROPHONE', 'SOUND_SYSTEM', 'SEATING'],
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
    isActive: true
  },
  {
    hallName: 'Conference Hall',
    hallType: 'CONFERENCE',
    capacity: 60,
    location: 'Administrative Wing, 1st Floor',
    description: 'Premium board-style conference room with executive seating, centralized condenser mic system, and high-definition dual display.',
    openingTime: '09:00',
    closingTime: '17:30',
    facilities: ['PROJECTOR', 'SMART_BOARD', 'WIFI', 'AIR_CONDITIONING', 'MICROPHONE', 'SOUND_SYSTEM', 'SEATING'],
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1000&q=80',
    isActive: true
  },
  {
    hallName: 'Multipurpose Hall',
    hallType: 'MULTIPURPOSE',
    capacity: 250,
    location: 'Student Activity Centre, Level 1',
    description: 'Flexible open layout hall adaptable for poster presentations, exhibitions, club hackathons, workshops, and student society activities.',
    openingTime: '08:30',
    closingTime: '20:00',
    facilities: ['PROJECTOR', 'MICROPHONE', 'SOUND_SYSTEM', 'SEATING', 'STAGE', 'WIFI', 'AIR_CONDITIONING'],
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    isActive: true
  }
];

const seedDemoData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db';
    await mongoose.connect(mongoURI);
    console.log('\x1b[32m%s\x1b[0m', '[Seed System] Connected to MongoDB: EventHall_db');

    // 1. Seed / Find Admin User
    let adminUser = await User.findOne({ email: 'admin@svgu.edu.in' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'SVGU Campus Admin',
        email: 'admin@svgu.edu.in',
        password: 'AdminPass@123',
        role: 'ADMIN',
        userType: 'FACULTY',
        department: 'Campus Estate & Facilities Management',
        collegeId: 'ADMIN-FAC-01',
        phone: '+91 98000 11223',
        isActive: true
      });
      console.log('\x1b[32m%s\x1b[0m', '  [+] Created Admin: admin@svgu.edu.in');
    } else {
      console.log('\x1b[36m%s\x1b[0m', '  [=] Admin already exists: admin@svgu.edu.in');
    }

    // 2. Seed Users
    const userMap = {};
    for (const u of usersSeedData) {
      let existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        existingUser = await User.create(u);
        console.log(`  [+] Created User: ${u.email} (${u.role})`);
      } else {
        console.log(`  [=] User already exists: ${u.email}`);
      }
      userMap[u.email] = existingUser;
    }

    // 3. Seed Halls
    const hallMap = {};
    for (const h of hallsSeedData) {
      let existingHall = await Hall.findOne({ hallName: h.hallName });
      if (!existingHall) {
        existingHall = await Hall.create({ ...h, createdBy: adminUser._id });
        console.log(`  [+] Created Hall: ${h.hallName}`);
      } else {
        console.log(`  [=] Hall already exists: ${h.hallName}`);
      }
      hallMap[h.hallName] = existingHall;
    }

    // 4. Seed Hall Blocks
    const blocksSeedData = [
      {
        hall: hallMap['Main Auditorium']?._id,
        startDate: getOffsetDate(-10),
        endDate: getOffsetDate(-8),
        startTime: '08:00',
        endTime: '18:00',
        reason: 'MAINTENANCE',
        notes: 'Annual stage acoustic panel maintenance',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        hall: hallMap['Seminar Hall']?._id,
        startDate: getOffsetDate(10),
        endDate: getOffsetDate(12),
        startTime: '09:00',
        endTime: '17:00',
        reason: 'EXAMINATION',
        notes: 'Mid-term university practical exams',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        hall: hallMap['Sports Hall']?._id,
        startDate: getOffsetDate(20),
        endDate: getOffsetDate(21),
        startTime: '08:00',
        endTime: '20:00',
        reason: 'TECHNICAL_WORK',
        notes: 'Lighting fixture upgrade and floor polishing',
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    let blockCount = 0;
    for (const b of blocksSeedData) {
      if (b.hall) {
        const existingBlock = await HallBlock.findOne({ hall: b.hall, startDate: b.startDate, startTime: b.startTime });
        if (!existingBlock) {
          await HallBlock.create(b);
          blockCount++;
        }
      }
    }
    console.log(`  [+] Seeded ${blockCount} Hall Maintenance Blocks`);

    // 5. Seed Reservations
    const reservationsSeedData = [
      // Past Approved / Completed
      {
        user: userMap['rahul.verma@student.svgu.edu.in']?._id,
        hall: hallMap['Assembly Hall']?._id,
        eventTitle: 'Annual MCA Orientation Session',
        eventType: 'SEMINAR',
        eventDescription: 'Welcome ceremony and curriculum overview for incoming MCA students.',
        eventDate: getOffsetDate(-15),
        startTime: '10:00',
        endTime: '12:00',
        expectedParticipants: 150,
        status: 'COMPLETED'
      },
      {
        user: userMap['priya.sharma@faculty.svgu.edu.in']?._id,
        hall: hallMap['Seminar Hall']?._id,
        eventTitle: 'AI & Data Science Faculty Workshop',
        eventType: 'WORKSHOP',
        eventDescription: 'Faculty development program focusing on modern generative AI tools.',
        eventDate: getOffsetDate(-12),
        startTime: '14:00',
        endTime: '17:00',
        expectedParticipants: 45,
        status: 'COMPLETED'
      },
      {
        user: userMap['tech.club@club.svgu.edu.in']?._id,
        hall: hallMap['Multipurpose Hall']?._id,
        eventTitle: '24-Hour Student Hackathon 2026',
        eventType: 'WORKSHOP',
        eventDescription: 'Inter-departmental software hackathon focusing on campus solutions.',
        eventDate: getOffsetDate(-7),
        startTime: '09:00',
        endTime: '18:00',
        expectedParticipants: 180,
        status: 'COMPLETED'
      },

      // Past Rejected / Cancelled
      {
        user: userMap['amit.patel@student.svgu.edu.in']?._id,
        hall: hallMap['Conference Hall']?._id,
        eventTitle: 'Gaming Club Informal Gathering',
        eventType: 'OTHER',
        eventDescription: 'Informal student meetup.',
        eventDate: getOffsetDate(-5),
        startTime: '10:00',
        endTime: '12:00',
        expectedParticipants: 30,
        status: 'REJECTED',
        adminRemarks: 'Informal gaming events are not permitted in administrative conference halls.'
      },
      {
        user: userMap['cultural.soc@club.svgu.edu.in']?._id,
        hall: hallMap['Main Auditorium']?._id,
        eventTitle: 'Dance Rehearsal Practice',
        eventType: 'CULTURAL',
        eventDescription: 'Practice session for upcoming fest.',
        eventDate: getOffsetDate(-3),
        startTime: '14:00',
        endTime: '17:00',
        expectedParticipants: 60,
        status: 'CANCELLED',
        cancellationReason: 'Event rescheduled due to exams.'
      },

      // Recent / Today Approved
      {
        user: userMap['hod.cs@faculty.svgu.edu.in']?._id,
        hall: hallMap['Conference Hall']?._id,
        eventTitle: 'Department Academic Council Meeting',
        eventType: 'MEETING',
        eventDescription: 'Review of semester syllabus and laboratory equipment procurement.',
        eventDate: getOffsetDate(0),
        startTime: '10:00',
        endTime: '12:00',
        expectedParticipants: 15,
        status: 'APPROVED'
      },

      // Upcoming Approved
      {
        user: userMap['sneha.reddy@faculty.svgu.edu.in']?._id,
        hall: hallMap['Seminar Hall']?._id,
        eventTitle: 'Guest Lecture on Quantum Computing',
        eventType: 'GUEST_LECTURE',
        eventDescription: 'Keynote by visiting scientist on quantum algorithms.',
        eventDate: getOffsetDate(2),
        startTime: '11:00',
        endTime: '13:00',
        expectedParticipants: 80,
        status: 'APPROVED'
      },
      {
        user: userMap['sports.dept@department.svgu.edu.in']?._id,
        hall: hallMap['Sports Hall']?._id,
        eventTitle: 'Inter-College Badminton Tournament',
        eventType: 'SPORTS',
        eventDescription: 'Annual indoor university sports championship matches.',
        eventDate: getOffsetDate(4),
        startTime: '09:00',
        endTime: '17:00',
        expectedParticipants: 200,
        status: 'APPROVED'
      },
      {
        user: userMap['cultural.soc@club.svgu.edu.in']?._id,
        hall: hallMap['Main Auditorium']?._id,
        eventTitle: 'Annual Campus Cultural Fest 2026',
        eventType: 'CULTURAL',
        eventDescription: 'Grand inauguration ceremony, music performance, and drama club play.',
        eventDate: getOffsetDate(7),
        startTime: '10:00',
        endTime: '19:00',
        expectedParticipants: 700,
        status: 'APPROVED'
      },
      {
        user: userMap['rahul.verma@student.svgu.edu.in']?._id,
        hall: hallMap['Assembly Hall']?._id,
        eventTitle: 'Placement Preparation & Mock Interviews',
        eventType: 'PRESENTATION',
        eventDescription: 'Final year student mock interviews and resume building talk.',
        eventDate: getOffsetDate(9),
        startTime: '10:00',
        endTime: '13:00',
        expectedParticipants: 250,
        status: 'APPROVED'
      },

      // Upcoming Pending Requests (Waiting for Admin Review)
      {
        user: userMap['ananya.joshi@club.svgu.edu.in']?._id,
        hall: hallMap['Multipurpose Hall']?._id,
        eventTitle: 'Cybersecurity Awareness Workshop',
        eventType: 'WORKSHOP',
        eventDescription: 'Interactive session on ethical hacking principles and web safety.',
        eventDate: getOffsetDate(5),
        startTime: '10:00',
        endTime: '13:00',
        expectedParticipants: 120,
        status: 'PENDING'
      },
      {
        user: userMap['vikram.singh@staff.svgu.edu.in']?._id,
        hall: hallMap['Conference Hall']?._id,
        eventTitle: 'Staff Administration Coordination Meeting',
        eventType: 'MEETING',
        eventDescription: 'Monthly administrative staff workflow coordination meeting.',
        eventDate: getOffsetDate(6),
        startTime: '14:00',
        endTime: '16:00',
        expectedParticipants: 25,
        status: 'PENDING'
      },
      {
        user: userMap['amit.patel@student.svgu.edu.in']?._id,
        hall: hallMap['Assembly Hall']?._id,
        eventTitle: 'BCA Alumni Interaction Session',
        eventType: 'GUEST_LECTURE',
        eventDescription: 'Interaction session with distinguished BCA alumni working in industry.',
        eventDate: getOffsetDate(12),
        startTime: '11:00',
        endTime: '13:00',
        expectedParticipants: 180,
        status: 'PENDING'
      },
      {
        user: userMap['tech.club@club.svgu.edu.in']?._id,
        hall: hallMap['Seminar Hall']?._id,
        eventTitle: 'Web Development Bootcamp Part 1',
        eventType: 'WORKSHOP',
        eventDescription: 'Hands-on React and Node.js training session for beginner students.',
        eventDate: getOffsetDate(15),
        startTime: '14:00',
        endTime: '17:00',
        expectedParticipants: 90,
        status: 'PENDING'
      }
    ];

    let resCount = 0;
    for (const r of reservationsSeedData) {
      if (r.user && r.hall) {
        const existingRes = await Reservation.findOne({
          user: r.user,
          hall: r.hall,
          eventDate: r.eventDate,
          startTime: r.startTime
        });
        if (!existingRes) {
          await Reservation.create({
            ...r,
            requestedFacilities: ['PROJECTOR', 'MICROPHONE', 'SOUND_SYSTEM', 'AIR_CONDITIONING', 'WIFI']
          });
          resCount++;
        }
      }
    }
    console.log(`  [+] Seeded ${resCount} Realistic Hall Reservations`);

    // 6. Summary Output
    const totalUsersCount = await User.countDocuments({});
    const totalHallsCount = await Hall.countDocuments({});
    const totalBlocksCount = await HallBlock.countDocuments({});
    const totalResCount = await Reservation.countDocuments({});

    console.log('\n======================================================');
    console.log('\x1b[32m%s\x1b[0m', '  🎉 DEMO DATA SEEDED SUCCESSFULLY TO MONGODB!');
    console.log('======================================================');
    console.log(`  - Total Users       : ${totalUsersCount} (1 Admin + 10 Demo Users)`);
    console.log(`  - Total Halls       : ${totalHallsCount} (6 College Venues)`);
    console.log(`  - Total Hall Blocks : ${totalBlocksCount} (Maintenance Periods)`);
    console.log(`  - Total Reservations: ${totalResCount} (Past, Today & Upcoming)`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `[Seed Error] Failed to seed demo data: ${error.message}`);
    process.exit(1);
  }
};

seedDemoData();
