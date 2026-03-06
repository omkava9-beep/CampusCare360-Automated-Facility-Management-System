const User = require('../models/User');
const GrieVance = require('../models/Grievance');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { sendEmail } = require('../utils/email');

// ============= CONTRACTOR CONTROLLERS =============

// Get assigned grievances
exports.getAssignedGrievances = async (req, res) => {
    try {
        const contractorId = req.user._id;
        const { status } = req.query; // optional filter by status

        let query = { assignedContractor: contractorId };
        
        if (status) {
            query.status = status;
        }

        const grievances = await GrieVance.find(query)
            .populate('submittedBy', 'fName lastName email phoneNumber')
            .populate('locationId', 'locationName floorNumber buildingBlock')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Assigned grievances retrieved successfully',
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
                submittedBy: g.submittedBy ? {
                    _id: g.submittedBy._id,
                    name: `${g.submittedBy.fName} ${g.submittedBy.lastName}`,
                    email: g.submittedBy.email,
                    phone: g.submittedBy.phoneNumber
                } : null,
                initialPhoto: g.initialPhoto,
                resolvedPhoto: g.resolvedPhoto,
                dueAt: g.dueAt,
                createdAt: g.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching assigned grievances:', error);
        res.status(500).json({ message: 'Error fetching grievances', error: error.message });
    }
};

// Get grievance detail for contractor
exports.getGrievanceDetail = async (req, res) => {
    try {
        const { grievanceId } = req.params;
        const contractorId = req.user._id;

        const grievance = await GrieVance.findById(grievanceId)
            .populate('submittedBy', 'fName lastName email phoneNumber')
            .populate('locationId', 'locationName floorNumber buildingBlock coordinates');

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        if (grievance.assignedContractor.toString() !== contractorId.toString()) {
            return res.status(403).json({ message: 'You are not assigned to this grievance' });
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
                submittedBy: grievance.submittedBy,
                initialPhoto: grievance.initialPhoto,
                resolvedPhoto: grievance.resolvedPhoto,
                contractorNotes: grievance.contractorNotes,
                dueAt: grievance.dueAt,
                resolvedAt: grievance.resolvedAt,
                completionChecklist: grievance.completionChecklist,
                createdAt: grievance.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching grievance:', error);
        res.status(500).json({ message: 'Error fetching grievance', error: error.message });
    }
};

// Update grievance status (applied -> in-progress -> done)
exports.updateGrievanceStatus = async (req, res) => {
    try {
        const { grievanceId } = req.params;
        const { status, notes } = req.body;
        const contractorId = req.user._id;

        const validStatuses = ['applied', 'in-progress', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be: applied, in-progress, or done' });
        }

        const grievance = await GrieVance.findById(grievanceId);

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        if (grievance.assignedContractor.toString() !== contractorId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this grievance' });
        }

        grievance.status = status;
        if (notes) {
            grievance.contractorNotes = notes;
        }

        await grievance.save();

        res.status(200).json({
            message: 'Grievance status updated successfully',
            grievance: {
                _id: grievance._id,
                ticketID: grievance.ticketID,
                status: grievance.status,
                contractorNotes: grievance.contractorNotes,
                updatedAt: grievance.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};

// Get contractor statistics
exports.getContractorStats = async (req, res) => {
    try {
        const contractorId = req.user._id;

        const total = await GrieVance.countDocuments({ assignedContractor: contractorId });
        const applied = await GrieVance.countDocuments({ assignedContractor: contractorId, status: 'applied' });
        const inProgress = await GrieVance.countDocuments({ assignedContractor: contractorId, status: 'in-progress' });
        const done = await GrieVance.countDocuments({ assignedContractor: contractorId, status: 'done' });
        const resolved = await GrieVance.countDocuments({ assignedContractor: contractorId, status: 'resolved' });

        res.status(200).json({
            message: 'Contractor statistics retrieved',
            stats: {
                total,
                applied,
                inProgress,
                done,
                resolved,
                percentageComplete: total > 0 ? Math.round(((done + resolved) / total) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
};

// Get contractor profile
exports.getContractorProfile = async (req, res) => {
    try {
        const contractor = await User.findById(req.user._id).select('-password');

        res.status(200).json({
            message: 'Profile retrieved successfully',
            profile: contractor
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Update contractor profile
exports.updateContractorProfile = async (req, res) => {
    try {
        const { fName, lastName, phoneNumber, midName, specialization } = req.body;
        const contractorId = req.user._id;

        const updateData = {};
        if (fName) updateData.fName = fName;
        if (lastName) updateData.lastName = lastName;
        if (midName) updateData.midName = midName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (specialization) updateData['contractorDetails.specialization'] = specialization;

        const contractor = await User.findByIdAndUpdate(contractorId, updateData, { new: true }).select('-password');

        res.status(200).json({
            message: 'Profile updated successfully',
            profile: contractor
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
            `contractor-profile-${req.user._id}`
        );

        const contractor = await User.findByIdAndUpdate(
            req.user._id,
            { profilePic: uploadResult.url },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: 'Profile picture updated successfully',
            profilePic: uploadResult.url,
            profile: contractor
        });
    } catch (error) {
        console.error('Error uploading picture:', error);
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
