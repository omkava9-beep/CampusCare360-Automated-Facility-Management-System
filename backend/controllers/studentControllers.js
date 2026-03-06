const User = require('../models/User');
const GrieVance = require('../models/Grievance');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const { sendEmail } = require('../utils/email');

// ============= STUDENT CONTROLLERS =============

// Get all grievances submitted by student
exports.getMyGrievances = async (req, res) => {
    try {
        const userId = req.user._id;

        const grievances = await GrieVance.find({ submittedBy: userId })
            .populate('assignedContractor', 'fName lastName email phoneNumber')
            .populate('locationId', 'locationName floorNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Grievances retrieved successfully',
            count: grievances.length,
            grievances: grievances.map(g => ({
                _id: g._id,
                ticketID: g.ticketID,
                subject: g.subject,
                description: g.description,
                category: g.category,
                priority: g.priority,
                criticality: g.criticality,
                status: g.status,
                location: g.locationId?.locationName,
                floor: g.locationId?.floorNumber,
                assignedContractor: g.assignedContractor ? {
                    _id: g.assignedContractor._id,
                    name: `${g.assignedContractor.fName} ${g.assignedContractor.lastName}`,
                    phone: g.assignedContractor.phoneNumber
                } : null,
                initialPhoto: g.initialPhoto,
                resolvedPhoto: g.resolvedPhoto,
                dueAt: g.dueAt,
                resolvedAt: g.resolvedAt,
                createdAt: g.createdAt,
                updatedAt: g.updatedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching student grievances:', error);
        res.status(500).json({ message: 'Error fetching grievances', error: error.message });
    }
};

// Get specific grievance details
exports.getGrievanceDetail = async (req, res) => {
    try {
        const { grievanceId } = req.params;
        const userId = req.user._id;

        const grievance = await GrieVance.findById(grievanceId)
            .populate('assignedContractor', 'fName lastName email phoneNumber contractorDetails')
            .populate('locationId', 'locationName floorNumber buildingBlock');

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        if (grievance.submittedBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this grievance' });
        }

        res.status(200).json({
            message: 'Grievance details retrieved',
            grievance: {
                _id: grievance._id,
                ticketID: grievance.ticketID,
                subject: grievance.subject,
                description: grievance.description,
                category: grievance.category,
                priority: grievance.priority,
                criticality: grievance.criticality,
                status: grievance.status,
                location: grievance.locationId,
                assignedContractor: grievance.assignedContractor ? {
                    _id: grievance.assignedContractor._id,
                    name: `${grievance.assignedContractor.fName} ${grievance.assignedContractor.lastName}`,
                    email: grievance.assignedContractor.email,
                    phone: grievance.assignedContractor.phoneNumber,
                    specialization: grievance.assignedContractor.contractorDetails?.specialization
                } : null,
                initialPhoto: grievance.initialPhoto,
                resolvedPhoto: grievance.resolvedPhoto,
                contractorNotes: grievance.contractorNotes,
                adminFeedback: grievance.adminFeedback,
                dueAt: grievance.dueAt,
                resolvedAt: grievance.resolvedAt,
                completionChecklist: grievance.completionChecklist,
                createdAt: grievance.createdAt,
                updatedAt: grievance.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching grievance detail:', error);
        res.status(500).json({ message: 'Error fetching grievance', error: error.message });
    }
};

// Get student profile
exports.getStudentProfile = async (req, res) => {
    try {
        const student = await User.findById(req.user._id).select('-password');

        res.status(200).json({
            message: 'Profile retrieved successfully',
            profile: student
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
    try {
        const { fName, lastName, phoneNumber, midName, department } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (fName) updateData.fName = fName;
        if (lastName) updateData.lastName = lastName;
        if (midName) updateData.midName = midName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (department) updateData.department = department;

        const student = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        res.status(200).json({
            message: 'Profile updated successfully',
            profile: student
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const uploadResult = await uploadToCloudinary(
            req.file.path,
            `CampusCare/profiles`,
            `student-profile-${req.user._id}`
        );

        const student = await User.findByIdAndUpdate(
            req.user._id,
            { profilePic: uploadResult.url },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: 'Profile picture updated successfully',
            profilePic: uploadResult.url,
            profile: student
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Error uploading picture', error: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};

module.exports = exports;
