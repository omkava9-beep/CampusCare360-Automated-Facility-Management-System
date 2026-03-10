const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Location = require('./models/Location');
const Grievance = require('./models/Grievance');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campuscare';

// Helper to get random date between start and end
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate an array of realistic past dates biased towards recent
function generateRandomDates(numDates, maxDaysAgo) {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < numDates; i++) {
        // Bias towards more recent dates: Square root distribution
        const daysAgo = Math.floor(Math.pow(Math.random(), 2) * maxDaysAgo);
        const d = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        dates.push(d);
    }
    return dates.sort((a, b) => a - b);
}

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        console.log('Clearing existing data...');
        // await User.deleteMany({});
        await Location.deleteMany({});
        await Grievance.deleteMany({});

        // --- LOCATIONS ---
        const locationData = [
            { locationName: "Lab 302", buildingBlock: "Science Block A", floorNumber: 3, isHighPriorityZone: true, coordinates: { type: "Point", coordinates: [73.0081, 21.4988] } },
            { locationName: "Main Library", buildingBlock: "Central Library", floorNumber: 1, isHighPriorityZone: false, coordinates: { type: "Point", coordinates: [73.0090, 21.4990] } },
            { locationName: "Cafeteria", buildingBlock: "Student Center", floorNumber: 0, isHighPriorityZone: true, coordinates: { type: "Point", coordinates: [73.0070, 21.4980] } },
            { locationName: "Auditorium", buildingBlock: "Block C", floorNumber: 1, isHighPriorityZone: false, coordinates: { type: "Point", coordinates: [73.0085, 21.4985] } },
            { locationName: "Hostel Block A", buildingBlock: "Boys Hostel", floorNumber: 2, isHighPriorityZone: false, coordinates: { type: "Point", coordinates: [73.0060, 21.4975] } },
            { locationName: "Server Room", buildingBlock: "Engineering Wing", floorNumber: 4, isHighPriorityZone: true, coordinates: { type: "Point", coordinates: [73.0095, 21.4995] } }
        ];
        console.log('Creating locations...');
        const locations = await Location.insertMany(locationData);

        // --- USERS ---
        // Ensure we have at least some students and contractors
        // We will keep existing users but add specific dummy ones if needed, or just fetch them

        let students = await User.find({ role: 'student' });
        let contractors = await User.find({ role: 'contractor' });
        let admin = await User.findOne({ role: 'admin' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        if (!admin) {
            admin = await User.create({ fName: 'Super', lastName: 'Admin', email: 'admin@campuscare.com', password: hashedPassword, role: 'admin' });
        }

        if (students.length < 5) {
            console.log('Creating dummy students...');
            const newStudents = await User.insertMany([
                { fName: 'John', lastName: 'Doe', email: 'john.doe@student.com', password: hashedPassword, role: 'student' },
                { fName: 'Emma', lastName: 'Watson', email: 'emma.w@student.com', password: hashedPassword, role: 'student' },
                { fName: 'Raj', lastName: 'Patel', email: 'raj.p@student.com', password: hashedPassword, role: 'student' },
                { fName: 'Sarah', lastName: 'Connor', email: 'sarah.c@student.com', password: hashedPassword, role: 'student' },
                { fName: 'Michael', lastName: 'Scott', email: 'michael.s@student.com', password: hashedPassword, role: 'student' }
            ]);
            students = [...students, ...newStudents];
        }

        if (contractors.length < 4) {
            console.log('Creating dummy contractors...');
            const newContractors = await User.insertMany([
                { fName: 'Bob', lastName: 'Builder', email: 'bob@contractor.com', password: hashedPassword, role: 'contractor', contractorDetails: { specialization: 'Plumbing', locationBase: locations[0]._id } },
                { fName: 'Alice', lastName: 'Electric', email: 'alice@contractor.com', password: hashedPassword, role: 'contractor', contractorDetails: { specialization: 'Electrical', locationBase: locations[1]._id } },
                { fName: 'Charlie', lastName: 'Clean', email: 'charlie@contractor.com', password: hashedPassword, role: 'contractor', contractorDetails: { specialization: 'Cleaning', locationBase: locations[2]._id } },
                { fName: 'Dave', lastName: 'Network', email: 'dave@contractor.com', password: hashedPassword, role: 'contractor', contractorDetails: { specialization: 'IT/Network', locationBase: locations[5]._id } }
            ]);
            contractors = [...contractors, ...newContractors];
        }

        // --- GRIEVANCES (180 Days of Data) ---
        console.log('Generating structured dummy grievances...');
        const categories = ['Plumbing', 'Electrical', 'Cleaning', 'IT/Network', 'Carpentry', 'General Maintenance'];
        const priorities = ['Low', 'Medium', 'High'];
        const criticalities = ['Normal', 'Critical', 'Emergency'];
        const statuses = ['applied', 'in-progress', 'done', 'resolved'];

        const dummyPhotos = [
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800', // Plumbing
            'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=800', // Electrical
            'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800', // Cleaning
            'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?auto=format&fit=crop&q=80&w=800', // General IT
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800'  // General Maintenance
        ];

        const grievanceData = [];
        const numGrievances = 300; // Generate 300 records

        // Distribution of dates over the last 180 days
        const dates = generateRandomDates(numGrievances, 180);

        for (let i = 0; i < numGrievances; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];

            // Assign contractor mostly based on category match, but randomize a bit
            const eligibleContractors = contractors.filter(c => c.contractorDetails?.specialization === category);
            let assignedContractor = null;
            if (status !== 'applied') {
                assignedContractor = eligibleContractors.length > 0
                    ? eligibleContractors[Math.floor(Math.random() * eligibleContractors.length)]._id
                    : contractors[Math.floor(Math.random() * contractors.length)]._id;
            }

            const createdAt = dates[i];

            // If resolved, set resolvedAt slightly after createdAt
            let resolvedAt = null;
            if (status === 'resolved' || status === 'done') {
                const resolutionDays = Math.floor(Math.random() * 5) + 1; // 1 to 5 days to resolve
                resolvedAt = new Date(createdAt.getTime() + (resolutionDays * 24 * 60 * 60 * 1000));
                // Cap it at current time just in case
                if (resolvedAt > new Date()) resolvedAt = new Date();
            }

            grievanceData.push({
                ticketID: `#GR-2024-${String(i + 1000).padStart(4, '0')}`,
                submittedBy: students[Math.floor(Math.random() * students.length)]._id,
                reportedBy: students[Math.floor(Math.random() * students.length)]._id,
                subject: `Issue regarding ${category.toLowerCase()} maintenance`,
                description: `This is an auto-generated description for a ${category} issue. Please address this promptly.`,
                category: category,
                locationId: locations[Math.floor(Math.random() * locations.length)]._id,
                criticality: criticalities[Math.floor(Math.random() * criticalities.length)],
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                status: status,
                assignedContractor: assignedContractor,
                initialPhoto: dummyPhotos[Math.floor(Math.random() * dummyPhotos.length)],
                resolvedPhoto: (status === 'resolved' || status === 'done') ? dummyPhotos[Math.floor(Math.random() * dummyPhotos.length)] : null,
                createdAt: createdAt,
                resolvedAt: resolvedAt,
                assignmentMeta: {
                    distanceInMeters: Math.floor(Math.random() * 800) + 10,
                    isFloorMatched: Math.random() > 0.5
                }
            });
        }

        await Grievance.insertMany(grievanceData);
        console.log(`Successfully seeded ${numGrievances} grievances, ${locations.length} locations, and verified users.`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
