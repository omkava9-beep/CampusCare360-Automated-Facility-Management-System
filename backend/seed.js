const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
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
        const adminPassword = await bcrypt.hash('admin123', salt);

        if (!admin) {
            admin = await User.create({ fName: 'Admin', lastName: 'CampusCare', email: 'omkava9@gmail.com', password: adminPassword, role: 'admin', status: 'Active' });
            console.log('✓ Created admin user: omkava9@gmail.com');
        }

        if (students.length < 10) {
            console.log('Creating 10 dummy students...');
            const newStudents = await User.insertMany([
                { fName: 'John', lastName: 'Doe', email: 'john.doe@student.com', password: hashedPassword, role: 'student', department: 'Computer Science', phoneNumber: '9876543210' },
                { fName: 'Emma', lastName: 'Watson', email: 'emma.w@student.com', password: hashedPassword, role: 'student', department: 'Electronics', phoneNumber: '9876543211' },
                { fName: 'Raj', lastName: 'Patel', email: 'raj.p@student.com', password: hashedPassword, role: 'student', department: 'Mechanical', phoneNumber: '9876543212' },
                { fName: 'Sarah', lastName: 'Connor', email: 'sarah.c@student.com', password: hashedPassword, role: 'student', department: 'Civil', phoneNumber: '9876543213' },
                { fName: 'Michael', lastName: 'Scott', email: 'michael.s@student.com', password: hashedPassword, role: 'student', department: 'Computer Science', phoneNumber: '9876543214' },
                { fName: 'Priya', lastName: 'Gupta', email: 'priya.g@student.com', password: hashedPassword, role: 'student', department: 'Physics', phoneNumber: '9876543215' },
                { fName: 'Arjun', lastName: 'Singh', email: 'arjun.s@student.com', password: hashedPassword, role: 'student', department: 'Chemistry', phoneNumber: '9876543216' },
                { fName: 'Neha', lastName: 'Sharma', email: 'neha.sh@student.com', password: hashedPassword, role: 'student', department: 'Electrical', phoneNumber: '9876543217' },
                { fName: 'Vikram', lastName: 'Kumar', email: 'vikram.k@student.com', password: hashedPassword, role: 'student', department: 'IT', phoneNumber: '9876543218' },
                { fName: 'Ananya', lastName: 'Mishra', email: 'ananya.m@student.com', password: hashedPassword, role: 'student', department: 'Biotechnology', phoneNumber: '9876543219' }
            ]);
            students = [...students, ...newStudents];
        }

        if (contractors.length < 10) {
            console.log('Creating 10 dummy contractors...');
            const newContractors = await User.insertMany([
                { fName: 'Bob', lastName: 'Builder', email: 'bob@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432101', contractorDetails: { specialization: 'Plumbing', rating: 4.5, memberSince: new Date('2023-01-15'), location: { type: 'Point', coordinates: [73.0081, 21.4988] } } },
                { fName: 'Alice', lastName: 'Electric', email: 'alice@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432102', contractorDetails: { specialization: 'Electrical', rating: 4.8, memberSince: new Date('2023-02-20'), location: { type: 'Point', coordinates: [73.0090, 21.4990] } } },
                { fName: 'Charlie', lastName: 'Clean', email: 'charlie@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432103', contractorDetails: { specialization: 'Cleaning', rating: 4.2, memberSince: new Date('2023-03-10'), location: { type: 'Point', coordinates: [73.0070, 21.4980] } } },
                { fName: 'Dave', lastName: 'Network', email: 'dave@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432104', contractorDetails: { specialization: 'IT/Network', rating: 4.9, memberSince: new Date('2023-04-05'), location: { type: 'Point', coordinates: [73.0095, 21.4995] } } },
                { fName: 'Eve', lastName: 'Paint', email: 'eve@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432105', contractorDetails: { specialization: 'General Maintenance', rating: 4.1, memberSince: new Date('2023-05-12'), location: { type: 'Point', coordinates: [73.0085, 21.4985] } } },
                { fName: 'Frank', lastName: 'Carpenter', email: 'frank@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432106', contractorDetails: { specialization: 'Carpentry', rating: 4.6, memberSince: new Date('2023-06-18'), location: { type: 'Point', coordinates: [73.0060, 21.4975] } } },
                { fName: 'Grace', lastName: 'Pipes', email: 'grace@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432107', contractorDetails: { specialization: 'Plumbing', rating: 4.3, memberSince: new Date('2023-07-22'), location: { type: 'Point', coordinates: [73.0081, 21.4988] } } },
                { fName: 'Henry', lastName: 'Spark', email: 'henry@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432108', contractorDetails: { specialization: 'Electrical', rating: 4.7, memberSince: new Date('2023-08-30'), location: { type: 'Point', coordinates: [73.0090, 21.4990] } } },
                { fName: 'Iris', lastName: 'Sweep', email: 'iris@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432109', contractorDetails: { specialization: 'Cleaning', rating: 4.4, memberSince: new Date('2023-09-14'), location: { type: 'Point', coordinates: [73.0070, 21.4980] } } },
                { fName: 'Jack', lastName: 'Tech', email: 'jack@contractor.com', password: hashedPassword, role: 'contractor', phoneNumber: '8765432110', contractorDetails: { specialization: 'IT/Network', rating: 4.8, memberSince: new Date('2023-10-25'), location: { type: 'Point', coordinates: [73.0095, 21.4995] } } }
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
        const numGrievances = 60; // Generate 60 grievances

        // Distribution of dates over the last 180 days
        const dates = generateRandomDates(numGrievances, 180);

        // Grievance descriptions for variety
        const grievanceDescriptions = {
            'Plumbing': [
                'Leaking tap in bathroom causing water waste',
                'Broken pipe in the basement affecting multiple rooms',
                'Clogged drain needs immediate attention',
                'Water pressure is extremely low, affecting all fixtures',
                'Toilet overflowing and causing floor damage'
            ],
            'Electrical': [
                'Multiple light fixtures not working',
                'Power fluctuation causing equipment damage',
                'Outlet is damaged and poses safety risk',
                'Circuit breaker keeps tripping',
                'Faulty wiring in the laboratory'
            ],
            'Cleaning': [
                'Floors are slippery and need immediate cleaning',
                'Waste bin overflow causing hygiene issues',
                'Dust accumulation in common areas',
                'Spill in library needs immediate cleanup',
                'Restroom cleanliness is below standard'
            ],
            'IT/Network': [
                'Internet connectivity issues affecting multiple users',
                'Server downtime preventing access to files',
                'WiFi signal very weak in this area',
                'Computer terminals not functioning properly',
                'Network printer offline and needs reset'
            ],
            'Carpentry': [
                'Door frame is damaged and needs repair',
                'Desktop surface has cracks and splinters',
                'Cabinet hinges are broken',
                'Floor tiles are cracked and need replacement',
                'Wooden partition is unstable'
            ],
            'General Maintenance': [
                'Ceiling has water stains and possible leak',
                'Paint is peeling off the walls',
                'Window is broken affecting ventilation',
                'HVAC system not cooling properly',
                'Door lock is jammed and inoperable'
            ]
        };

        for (let i = 0; i < numGrievances; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const studentIndex = i % students.length; // Distribute among students

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

            // Get random description for category
            const descriptions = grievanceDescriptions[category] || ['General maintenance issue'];
            const description = descriptions[Math.floor(Math.random() * descriptions.length)];

            grievanceData.push({
                ticketID: `#GR-2024-${String(i + 1001).padStart(4, '0')}`,
                submittedBy: students[studentIndex]._id,
                reportedBy: students[studentIndex]._id,
                subject: `${category} Issue - Ticket ${i + 1}`,
                description: description,
                category: category,
                locationId: locations[Math.floor(Math.random() * locations.length)]._id,
                criticality: criticalities[Math.floor(Math.random() * criticalities.length)],
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                status: status,
                assignedContractor: assignedContractor,
                initialPhoto: dummyPhotos[Math.floor(Math.random() * dummyPhotos.length)],
                resolvedPhoto: (status === 'resolved' || status === 'done') ? dummyPhotos[Math.floor(Math.random() * dummyPhotos.length)] : null,
                contractorNotes: status !== 'applied' ? 'Working on resolving this issue.' : null,
                createdAt: createdAt,
                resolvedAt: resolvedAt,
                assignmentMeta: {
                    distanceInMeters: Math.floor(Math.random() * 800) + 10,
                    isFloorMatched: Math.random() > 0.5
                },
                completionChecklist: {
                    isAreaClean: (status === 'resolved' || status === 'done') && Math.random() > 0.3,
                    isTested: (status === 'resolved' || status === 'done') && Math.random() > 0.3
                }
            });
        }

        await Grievance.insertMany(grievanceData);
        console.log(`✓ Successfully seeded ${numGrievances} grievances`);
        console.log(`✓ Created ${students.length} students`);
        console.log(`✓ Created ${contractors.length} contractors`);
        console.log(`✓ Created ${locations.length} locations`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
