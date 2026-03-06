const User = require('../models/User');
const bcrypt = require('bcryptjs');
const GrieVance = require('../models/Grievance');
const Location = require('../models/Location');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary, deleteFromCloudinary, getOptimizedUrl } = require('../utils/cloudinaryUpload');
const { sendEmail } = require('../utils/email');

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return distance in meters
};

// Helper function to find nearest available contractor (no category filtering)
const findNearestContractor = async (location) => {
    console.log(`\n[DEBUG] Starting contractor search...`);
    
    // First, check ALL contractors
    const allContractors = await User.find({ role: 'contractor' });
    console.log(`[DEBUG] Total contractors in DB: ${allContractors.length}`);
    
    allContractors.forEach((c, i) => {
        console.log(`[DEBUG] Contractor ${i}: ${c.fName} ${c.lastName}`);
        console.log(`  - Status: ${c.status}`);
        console.log(`  - Has contractorDetails: ${!!c.contractorDetails}`);
        if (c.contractorDetails) {
            console.log(`  - Has currentFloor: ${!!c.contractorDetails.currentFloor} (value: ${c.contractorDetails.currentFloor})`);
            console.log(`  - Has location: ${!!c.contractorDetails.location}`);
            if (c.contractorDetails.location) {
                console.log(`  - Has coordinates: ${!!c.contractorDetails.location.coordinates} (value:`, c.contractorDetails.location.coordinates, ')'
                );
            }
        }
    });
    
    // Find all active contractors with valid location coordinates (any specialty)
    const contractors = await User.find({
        role: 'contractor',
        status: 'Active',
        'contractorDetails.location.coordinates': { $exists: true }
    });

    console.log(`[DEBUG] Found ${contractors.length} contractors matching ALL criteria`);
    console.log(`[DEBUG] Location floor: ${location.floorNumber}, coordinates:`, location.coordinates.coordinates);
    
    if (contractors.length > 0) {
        contractors.forEach((c, i) => {
            console.log(`[DEBUG] Contractor ${i}: ${c.fName} ${c.lastName}, Floor: ${c.contractorDetails.currentFloor}, Coords:`, c.contractorDetails.location.coordinates);
        });
    }

    if (contractors.length === 0) {
        return null;
    }

    // Separate contractors by floor
    const sameFloorContractors = contractors.filter(
        contractor => contractor.contractorDetails.currentFloor === location.floorNumber
    );

    const otherFloorContractors = contractors.filter(
        contractor => contractor.contractorDetails.currentFloor !== location.floorNumber
    );

    let nearestContractor = null;
    let isFloorMatched = false;
    let minDistance = Infinity;

    // Priority 1: Find nearest contractor on same floor
    if (sameFloorContractors.length > 0) {
        for (let contractor of sameFloorContractors) {
            const distance = calculateDistance(
                location.coordinates.coordinates,
                contractor.contractorDetails.location.coordinates
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestContractor = contractor;
                isFloorMatched = true;
            }
        }
    }

    // Priority 2: If no contractor on same floor, find nearest from other floors
    if (!nearestContractor && otherFloorContractors.length > 0) {
        for (let contractor of otherFloorContractors) {
            const distance = calculateDistance(
                location.coordinates.coordinates,
                contractor.contractorDetails.location.coordinates
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestContractor = contractor;
                isFloorMatched = false;
            }
        }
    }

    return {
        contractor: nearestContractor,
        distance: minDistance,
        isFloorMatched: isFloorMatched
    };
};

// Add new Grievance with QR code scanning and automatic contractor assignment
exports.addGrievance = async (req, res) => {
    try {
        const { qrCodeLocationId, subject, description, category, criticality = 'Normal', priority = 'Medium' } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!qrCodeLocationId || !subject || !description || !category) {
            return res.status(400).json({ 
                message: 'Missing required fields: qrCodeLocationId, subject, description, category' 
            });
        }

        // Scan QR code to get location details
        const location = await Location.findById(qrCodeLocationId);
        if (!location) {
            return res.status(404).json({ message: 'Location not found. Invalid QR code.' });
        }

        // Generate unique ticket ID
        const ticketID = `#GR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Find nearest available contractor (regardless of specialty)
        const contractorResult = await findNearestContractor(location);

        // Handle photo upload if provided
        let initialPhotoUrl = null;
        if (req.files && req.files.photo && req.files.photo[0]) {
            try {
                const uploadResult = await uploadToCloudinary(
                    req.files.photo[0].path,
                    `CampusCare/grievances`,
                    `grievance-initial-${Date.now()}`
                );
                initialPhotoUrl = uploadResult.url;
            } catch (uploadError) {
                console.warn('Warning: Photo upload failed, continuing without photo:', uploadError);
            }
        }

        // Create new grievance
        const grievance = new GrieVance({
            ticketID,
            submittedBy: userId,
            subject,
            description,
            category,
            criticality,
            priority,
            locationId: qrCodeLocationId,
            reportedBy: userId,
            assignedContractor: contractorResult?.contractor?._id || null,
            assignmentMeta: {
                distanceInMeters: contractorResult?.distance || null,
                isFloorMatched: contractorResult?.isFloorMatched || false
            },
            initialPhoto: initialPhotoUrl || null,
            status: 'applied',
            dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours due date
        });

        await grievance.save();

        // Add grievance to user's myGrievances array
        await User.findByIdAndUpdate(userId, {
            $push: { myGrievances: grievance._id }
        });

        // Add grievance to contractor's assignedGrievances array if assigned
        if (contractorResult?.contractor) {
            await User.findByIdAndUpdate(contractorResult.contractor._id, {
                $push: { assignedGrievances: grievance._id }
            });

            // send notification email to contractor
            try {
                await sendEmail({
                    to: contractorResult.contractor.email,
                    subject: `New grievance assigned: ${grievance.ticketID}`,
                    text: `Hello ${contractorResult.contractor.fName},\n\nA new grievance has been assigned to you:\n
Ticket: ${grievance.ticketID}\nLocation: ${location.locationName} (Floor ${location.floorNumber})\nSubject: ${subject}\nDescription: ${description}\n\nPlease log in to the portal to view and resolve it.\n
Thank you,\nCampusCare Team`
                });
            } catch (emailErr) {
                console.warn('Failed to send contractor notification email:', emailErr);
            }
        }

        // send confirmation email to student
        try {
            const student = await User.findById(userId);
            if (student && student.email) {
                await sendEmail({
                    to: student.email,
                    subject: `Grievance submitted: ${grievance.ticketID}`,
                    text: `Hello ${student.fName},\n\nYour grievance has been submitted successfully with ticket ID ${grievance.ticketID}.\n
Location: ${location.locationName} (Floor ${location.floorNumber})\nSubject: ${subject}\nDescription: ${description}\n\nYou will be notified once a contractor begins work.\n
Thank you,\nCampusCare Team`
                });
            }
        } catch (emailErr) {
            console.warn('Failed to send student confirmation email:', emailErr);
        }

        // Prepare response
        const response = {
            message: 'Grievance added successfully',
            grievance: {
                ticketID: grievance.ticketID,
                _id: grievance._id,
                subject: grievance.subject,
                description: grievance.description,
                category: grievance.category,
                priority: grievance.priority,
                criticality: grievance.criticality,
                location: location.locationName,
                floor: location.floorNumber,
                status: grievance.status,
                dueAt: grievance.dueAt,
                createdAt: grievance.createdAt,
                initialPhoto: initialPhotoUrl || null
            }
        };

        if (contractorResult?.contractor) {
            response.assignedContractor = {
                _id: contractorResult.contractor._id,
                name: `${contractorResult.contractor.fName} ${contractorResult.contractor.lastName}`,
                specialization: contractorResult.contractor.contractorDetails.specialization,
                currentFloor: contractorResult.contractor.contractorDetails.currentFloor,
                distanceInMeters: Math.round(contractorResult.distance),
                isFloorMatched: contractorResult.isFloorMatched,
                phoneNumber: contractorResult.contractor.phoneNumber
            };
        } else {
            response.assignedContractor = null;
            response.warning = 'No contractors available. Grievance created but not assigned.';
        }

        res.status(201).json(response);

    } catch (error) {
        console.error('Error adding grievance:', error);
        res.status(500).json({ 
            message: 'Error adding grievance', 
            error: error.message 
        });
    }
};

// Upload initial photo for a grievance (Student submission)
exports.uploadGrievancePhoto = async (req, res) => {
    try {
        const { grievanceId } = req.params;

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate grievance exists
        const grievance = await GrieVance.findById(grievanceId);
        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        // Check authorization - only the person who submitted can upload initial photo
        if (grievance.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to upload photo for this grievance' });
        }

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(
            req.file.path,
            `CampusCare/grievances/${grievanceId}`,
            `grievance-initial-${grievanceId}`
        );

        // Update grievance with photo URL
        grievance.initialPhoto = uploadResult.url;
        await grievance.save();

        res.status(200).json({
            message: 'Photo uploaded successfully',
            photo: {
                url: uploadResult.url,
                cloudinaryId: uploadResult.cloudinaryId,
                uploadedAt: uploadResult.createdAt
            }
        });

    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ 
            message: 'Error uploading photo', 
            error: error.message 
        });
    }
};

// Upload resolved photo (Contractor completion photo)
exports.uploadResolvedPhoto = async (req, res) => {
    try {
        const { grievanceId } = req.params;

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate grievance exists
        const grievance = await GrieVance.findById(grievanceId);
        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        // Check authorization - only assigned contractor can upload resolved photo
        if (!grievance.assignedContractor || grievance.assignedContractor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized. Only assigned contractor can upload resolved photo.' });
        }

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(
            req.file.path,
            `CampusCare/grievances/${grievanceId}`,
            `grievance-resolved-${grievanceId}`
        );

        // Update grievance with resolved photo
        grievance.resolvedPhoto = uploadResult.url;
        grievance.status = 'done'; // Mark as completed
        grievance.resolvedAt = new Date();
        await grievance.save();

        res.status(200).json({
            message: 'Resolved photo uploaded successfully. Grievance marked as done.',
            photo: {
                url: uploadResult.url,
                cloudinaryId: uploadResult.cloudinaryId,
                uploadedAt: uploadResult.createdAt
            },
            grievance: {
                _id: grievance._id,
                ticketID: grievance.ticketID,
                status: grievance.status,
                resolvedAt: grievance.resolvedAt
            }
        });

    } catch (error) {
        console.error('Error uploading resolved photo:', error);
        res.status(500).json({ 
            message: 'Error uploading resolved photo', 
            error: error.message 
        });
    }
};

// Get all photos for a grievance
exports.getGrievancePhotos = async (req, res) => {
    try {
        const { grievanceId } = req.params;

        const grievance = await GrieVance.findById(grievanceId);
        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        const photos = {
            initialPhoto: grievance.initialPhoto ? {
                url: grievance.initialPhoto,
                optimizedUrl: getOptimizedUrl(grievance.initialPhoto, { width: 500 }),
                uploadedWith: 'Initial submission'
            } : null,
            resolvedPhoto: grievance.resolvedPhoto ? {
                url: grievance.resolvedPhoto,
                optimizedUrl: getOptimizedUrl(grievance.resolvedPhoto, { width: 500 }),
                uploadedWith: 'Contractor resolution'
            } : null
        };

        res.status(200).json({
            message: 'Photos retrieved successfully',
            grievanceId: grievanceId,
            ticketID: grievance.ticketID,
            photos: photos
        });

    } catch (error) {
        console.error('Error retrieving photos:', error);
        res.status(500).json({ 
            message: 'Error retrieving photos', 
            error: error.message 
        });
    }
};

// Delete photo from grievance
exports.deleteGrievancePhoto = async (req, res) => {
    try {
        const { grievanceId, photoType } = req.params; // photoType: 'initial' or 'resolved'

        const grievance = await GrieVance.findById(grievanceId);
        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        // Authorization check
        if (photoType === 'initial' && grievance.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete initial photo' });
        }

        if (photoType === 'resolved' && (!grievance.assignedContractor || grievance.assignedContractor.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to delete resolved photo' });
        }

        let photoUrl = null;
        if (photoType === 'initial') {
            photoUrl = grievance.initialPhoto;
            grievance.initialPhoto = null;
        } else if (photoType === 'resolved') {
            photoUrl = grievance.resolvedPhoto;
            grievance.resolvedPhoto = null;
        } else {
            return res.status(400).json({ message: 'Invalid photoType. Use "initial" or "resolved"' });
        }

        if (!photoUrl) {
            return res.status(404).json({ message: `No ${photoType} photo found for this grievance` });
        }

        // Delete from Cloudinary (extract public ID from URL if needed)
        // Cloudinary URLs contain the public_id
        const publicId = `CampusCare/grievances/${grievanceId}/grievance-${photoType}-${grievanceId}`;
        
        try {
            await deleteFromCloudinary(publicId);
        } catch (cloudinaryError) {
            console.warn('Warning: Could not delete photo from Cloudinary, but removing reference:', cloudinaryError);
        }

        await grievance.save();

        res.status(200).json({
            message: `${photoType} photo deleted successfully`,
            grievanceId: grievanceId
        });

    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ 
            message: 'Error deleting photo', 
            error: error.message 
        });
    }
};