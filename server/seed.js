/**
 * Database Seed Script
 * 
 * Populates MongoDB Atlas with:
 * - 3 Demo User Accounts (Admin, Organizer, Participant)
 * - 8 Realistic College Tech & Campus Events
 * - Sample Event Registrations
 * 
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const config = require('./config');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log('Connected to database for seeding.');

    // 1. Clean existing collections
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({})
    ]);
    console.log('Collections cleared.');

    // 2. Create Demo Users
    console.log('Creating demo users with hashed passwords...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('College@2026', salt);

    const demoUsers = [
      {
        name: 'Prof. Rajesh Sharma (Admin)',
        email: 'admin@ems.edu',
        password: defaultPasswordHash,
        role: 'admin',
        phone: '+91 98765 43210'
      },
      {
        name: 'Dr. Anita Roy (Faculty Organizer)',
        email: 'organizer@ems.edu',
        password: defaultPasswordHash,
        role: 'organizer',
        phone: '+91 98765 12345'
      },
      {
        name: 'Aarav Patel (Cybersecurity Scholar)',
        email: 'participant@ems.edu',
        password: defaultPasswordHash,
        role: 'participant',
        phone: '+91 98123 45678'
      },
      {
        name: 'Sneha Kulkarni (BCA Student)',
        email: 'sneha@ems.edu',
        password: defaultPasswordHash,
        role: 'participant',
        phone: '+91 98234 56789'
      }
    ];

    const createdUsers = await User.insertMany(demoUsers);
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const organizerUser = createdUsers.find(u => u.role === 'organizer');
    const participantUser = createdUsers.find(u => u.email === 'participant@ems.edu');
    const participant2User = createdUsers.find(u => u.email === 'sneha@ems.edu');

    console.log('Created 4 users (Admin, Organizer, 2 Participants).');

    // 3. Create 8 Realistic College Tech & Cultural Events
    console.log('Creating realistic college events...');
    const now = new Date();

    const sampleEvents = [
      {
        title: 'National Cybersecurity & Ethical Hacking Summit 2026',
        description: 'Immerse yourself in live penetration testing simulations, bug bounty workshops, vulnerability analysis, and network defense strategies led by industry cyber architects and CERT-In experts.',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // in 7 days
        endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        location: 'APJ Abdul Kalam Cyber Defense Lab, BCA Tech Block',
        category: 'workshop',
        capacity: 120,
        registeredCount: 0,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
        organizer: organizerUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Full-Stack Web Innovation Hackathon 36-Hours',
        description: 'Collaborate in teams of 2 to 4 to prototype full-stack cloud solutions, real-time architectures, and social impact apps. Exciting cash prizes, certificates, and direct incubator mentoring opportunities.',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // in 14 days
        endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
        location: 'Sir M. Visvesvaraya Incubation & Coding Hub',
        category: 'hackathon',
        capacity: 150,
        registeredCount: 0,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
        organizer: organizerUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Cloud Computing & DevOps Masterclass: AWS & Kubernetes',
        description: 'Comprehensive walkthrough of Docker microservices, CI/CD pipeline automation with GitHub Actions, and high-availability cluster deployments on AWS cloud infrastructure.',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // in 21 days
        endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        location: 'Virtual Classroom 3 & Main Seminar Auditorium A',
        category: 'webinar',
        capacity: 250,
        registeredCount: 0,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
        organizer: organizerUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Generative AI & LLM Systems Symposium',
        description: 'Explore neural network fine-tuning, RAG (Retrieval-Augmented Generation) patterns, AI safety standards, and practical deployment of multimodal Gemini models with industry guest keynote speakers.',
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // in 30 days
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        location: 'Central Campus Convention Center — Grand Hall',
        category: 'conference',
        capacity: 300,
        registeredCount: 0,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
        organizer: organizerUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Open Source Software & Git Contribution Workshop',
        description: 'Hands-on beginner to intermediate session on Git internals, branch rebasing, open-source pull requests, licensing, and building verifiable developer portfolios.',
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // in 4 days
        endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        location: 'Computer Science Lab 2, Academic Block B',
        category: 'workshop',
        capacity: 60,
        registeredCount: 0,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
        organizer: null, // unassigned to test assignment flow
        createdBy: adminUser._id
      },
      {
        title: 'Annual Inter-College IT & Cultural Fest — TechVaganza',
        description: 'The premier college festival featuring coding relays, web design face-offs, tech quizzes, gaming arenas, and evening music and cultural stage performances.',
        date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // in 45 days
        endDate: new Date(now.getTime() + 46 * 24 * 60 * 60 * 1000),
        location: 'University Open Air Theatre & Sports Ground',
        category: 'cultural',
        capacity: 600,
        registeredCount: 0,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
        organizer: organizerUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Cyber Forensics & Incident Response Seminar',
        description: 'Detailed analysis of memory forensics, malware triage, chain-of-custody protocols in cyber law, and digital evidence presentation for cybersecurity students.',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (ongoing/recent)
        endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        location: 'Smart Classroom 104, IT Wing',
        category: 'seminar',
        capacity: 80,
        registeredCount: 0,
        status: 'ongoing',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
        organizer: organizerUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Blockchain & Decentralized Identity Workshop (Archived)',
        description: 'Exploration of smart contracts, cryptographic hash trees, and zero-knowledge identity protocols across enterprise ledger ecosystems.',
        date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // past
        endDate: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
        location: 'Digital Library Seminar Suite',
        category: 'academic',
        capacity: 100,
        registeredCount: 0,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1000&q=80',
        organizer: organizerUser._id,
        createdBy: adminUser._id
      }
    ];

    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`Created ${createdEvents.length} events.`);

    // 4. Create Sample Registrations
    console.log('Seeding sample registrations...');
    const sampleRegistrations = [
      {
        user: participantUser._id,
        event: createdEvents[0]._id, // Cybersecurity Workshop
        status: 'confirmed',
        registeredAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        user: participantUser._id,
        event: createdEvents[1]._id, // Hackathon
        status: 'confirmed',
        registeredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: participantUser._id,
        event: createdEvents[2]._id, // Cloud masterclass
        status: 'confirmed',
        registeredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        user: participant2User._id,
        event: createdEvents[0]._id, // Cybersecurity Workshop
        status: 'confirmed',
        registeredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: participant2User._id,
        event: createdEvents[3]._id, // AI Symposium
        status: 'confirmed',
        registeredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    await Registration.insertMany(sampleRegistrations);

    // Update registered counts on events
    for (const event of createdEvents) {
      await Registration.updateEventCount(event._id);
    }
    console.log('Registrations created and event counts synchronized.');

    console.log('\n======================================================');
    console.log('    🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉   ');
    console.log('======================================================');
    console.log('DEMO ACCOUNTS FOR ACADEMIC TESTING:');
    console.log('------------------------------------------------------');
    console.log('1. Admin Account:');
    console.log('   Email    : admin@ems.edu');
    console.log('   Password : College@2026');
    console.log('   Role     : admin');
    console.log('------------------------------------------------------');
    console.log('2. Organizer Account:');
    console.log('   Email    : organizer@ems.edu');
    console.log('   Password : College@2026');
    console.log('   Role     : organizer');
    console.log('------------------------------------------------------');
    console.log('3. Participant Account:');
    console.log('   Email    : participant@ems.edu');
    console.log('   Password : College@2026');
    console.log('   Role     : participant');
    console.log('------------------------------------------------------');
    console.log('4. Secondary Participant:');
    console.log('   Email    : sneha@ems.edu');
    console.log('   Password : College@2026');
    console.log('   Role     : participant');
    console.log('======================================================\n');

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
