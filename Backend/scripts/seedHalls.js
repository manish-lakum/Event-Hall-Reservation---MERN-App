const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Hall } = require('../models/Hall');
const User = require('../models/userModel');

dotenv.config();

const initialHallsData = [
  {
    hallName: 'Assembly Hall',
    hallType: 'ASSEMBLY',
    capacity: 500,
    location: 'Main Block, 2nd Floor',
    description: 'Spacious multi-tiered hall designed for college assemblies, guest lectures, large departmental meetings, and student union gatherings.',
    openingTime: '08:00',
    closingTime: '19:00',
    facilities: ['PROJECTOR', 'MICROPHONE', 'SOUND_SYSTEM', 'STAGE', 'WIFI', 'AIR_CONDITIONING', 'SEATING'],
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80'
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
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80'
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
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80'
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
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80'
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
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1000&q=80'
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
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80'
  }
];

const seedHalls = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db';
    await mongoose.connect(mongoURI);
    console.log(`\x1b[32m%s\x1b[0m`, `[Seed Script] Connected to MongoDB`);

    // Find Admin User
    let adminUser = await User.findOne({ role: 'ADMIN' });
    if (!adminUser) {
      console.log(`\x1b[33m%s\x1b[0m`, `[Seed Script] No Admin found. Creating default Admin user...`);
      adminUser = await User.create({
        name: process.env.ADMIN_NAME || 'SVGU Campus Admin',
        email: (process.env.ADMIN_EMAIL || 'admin@svgu.edu.in').toLowerCase(),
        password: process.env.ADMIN_PASSWORD || 'AdminPass@123',
        role: 'ADMIN',
        userType: 'FACULTY',
        department: 'Campus Estate Management'
      });
    }

    let insertedCount = 0;
    for (const item of initialHallsData) {
      const existing = await Hall.findOne({ hallName: item.hallName });
      if (!existing) {
        await Hall.create({
          ...item,
          createdBy: adminUser._id
        });
        insertedCount++;
      }
    }

    console.log(`\x1b[32m%s\x1b[0m`, `[Seed Script] Hall Seeding Complete! ${insertedCount} new halls created.`);
    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `[Seed Error] Failed to seed halls: ${error.message}`);
    process.exit(1);
  }
};

seedHalls();
