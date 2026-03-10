const User = require('../models/User');
const GrieVance = require('../models/Grievance');
const Location = require('../models/Location');
const { sendEmail } = require('../utils/email');

// ============= ADMIN CONTROLLERS =============

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const totalGrievances = await GrieVance.countDocuments();
        const appliedCount = await GrieVance.countDocuments({ status: 'applied' });
        const inProgressCount = await GrieVance.countDocuments({ status: 'in-progress' });
        const doneCount = await GrieVance.countDocuments({ status: 'done' });
        const resolvedCount = await GrieVance.countDocuments({ status: 'resolved' });

        const totalLocations = await Location.countDocuments();
        const totalContractors = await User.countDocuments({ role: 'contractor' });
        const totalStudents = await User.countDocuments({ role: 'student' });

        // Location Distribution
        const grievancesByLocation = await GrieVance.aggregate([
            {
                $group: {
                    _id: '$locationId',
                    count: { $sum: 1 },
                    applied: { $sum: { $cond: [{ $eq: ['$status', 'applied'] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
                    done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
                }
            },
            { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'locationDetails' } },
            {
                $project: {
                    _id: 1, count: 1, locationDetails: 1,
                    statusBreakdown: { applied: '$applied', inProgress: '$inProgress', done: '$done', resolved: '$resolved' }
                }
            }
        ]);

        // Category Distribution
        const categoryDistribution = await GrieVance.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Time Series: Daily (Last 14 Days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const dailyTrend = await GrieVance.aggregate([
            { $match: { createdAt: { $gte: fourteenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    reported: { $sum: 1 },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Time Series: Weekly (Last 8 Weeks)
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
        const weeklyTrend = await GrieVance.aggregate([
            { $match: { createdAt: { $gte: eightWeeksAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-W%U", date: "$createdAt" } },
                    reported: { $sum: 1 },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Time Series: Monthly (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyTrend = await GrieVance.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    reported: { $sum: 1 },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            message: 'Dashboard statistics retrieved',
            stats: {
                grievances: {
                    total: totalGrievances,
                    applied: appliedCount,
                    inProgress: inProgressCount,
                    done: doneCount,
                    resolved: resolvedCount,
                    percentageResolved: totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0
                },
                users: { contractors: totalContractors, students: totalStudents },
                locations: totalLocations,
                grievancesByLocation,
                categoryDistribution,
                trends: {
                    daily: dailyTrend,
                    weekly: weeklyTrend,
                    monthly: monthlyTrend
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
};

// Get all grievances with filters
exports.getAllGrievances = async (req, res) => {
    try {
        const { status, location, priority, criticality, page = 1, limit = 10 } = req.query;

        let query = {};

        if (status) query.status = status;
        if (location) query.locationId = location;
        if (priority) query.priority = priority;
        if (criticality) query.criticality = criticality;

        const grievances = await GrieVance.find(query)
            .populate('submittedBy', 'fName lastName email')
            .populate('assignedContractor', 'fName lastName email')
            .populate('locationId', 'locationName floorNumber')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await GrieVance.countDocuments(query);

        res.status(200).json({
            message: 'Grievances retrieved successfully',
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            },
            grievances: grievances.map(g => ({
                _id: g._id,
                ticketID: g.ticketID,
                subject: g.subject,
                category: g.category,
                priority: g.priority,
                criticality: g.criticality,
                status: g.status,
                location: g.locationId?.locationName,
                floor: g.locationId?.floorNumber,
                submittedBy: g.submittedBy ? `${g.submittedBy.fName} ${g.submittedBy.lastName}` : null,
                assignedContractor: g.assignedContractor ? `${g.assignedContractor.fName} ${g.assignedContractor.lastName}` : null,
                initialPhoto: g.initialPhoto,
                resolvedPhoto: g.resolvedPhoto,
                description: g.description,
                contractorNotes: g.contractorNotes,
                createdAt: g.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching grievances:', error);
        res.status(500).json({ message: 'Error fetching grievances', error: error.message });
    }
};

// Get grievances by location
exports.getGrievancesByLocation = async (req, res) => {
    try {
        const { locationId } = req.params;

        const location = await Location.findById(locationId);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        const grievances = await GrieVance.find({ locationId })
            .populate('submittedBy', 'fName lastName email')
            .populate('assignedContractor', 'fName lastName')
            .sort({ createdAt: -1 });

        const statusBreakdown = {
            applied: grievances.filter(g => g.status === 'applied').length,
            inProgress: grievances.filter(g => g.status === 'in-progress').length,
            done: grievances.filter(g => g.status === 'done').length,
            resolved: grievances.filter(g => g.status === 'resolved').length
        };

        res.status(200).json({
            message: 'Grievances by location retrieved',
            location: {
                _id: location._id,
                name: location.locationName,
                floor: location.floorNumber,
                building: location.buildingBlock
            },
            statusBreakdown,
            grievances: grievances.map(g => ({
                _id: g._id,
                ticketID: g.ticketID,
                subject: g.subject,
                priority: g.priority,
                status: g.status,
                submittedBy: g.submittedBy,
                assignedContractor: g.assignedContractor,
                resolvedPhoto: g.resolvedPhoto,
                createdAt: g.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching grievances by location:', error);
        res.status(500).json({ message: 'Error fetching grievances', error: error.message });
    }
};

// Get grievance for approval (with photo for review)
exports.getGrievanceForApproval = async (req, res) => {
    try {
        const { grievanceId } = req.params;

        const grievance = await GrieVance.findById(grievanceId)
            .populate('submittedBy', 'fName lastName email phoneNumber')
            .populate('assignedContractor', 'fName lastName email')
            .populate('locationId', 'locationName floorNumber buildingBlock');

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        if (grievance.status !== 'done') {
            return res.status(400).json({ message: 'Grievance is not ready for approval (status must be "done")' });
        }

        res.status(200).json({
            message: 'Grievance retrieved for approval',
            grievance: {
                _id: grievance._id,
                ticketID: grievance.ticketID,
                subject: grievance.subject,
                description: grievance.description,
                category: grievance.category,
                priority: grievance.priority,
                criticality: grievance.criticality,
                status: grievance.status,
                submittedBy: grievance.submittedBy,
                assignedContractor: grievance.assignedContractor,
                location: grievance.locationId,
                initialPhoto: grievance.initialPhoto,
                resolvedPhoto: grievance.resolvedPhoto,
                contractorNotes: grievance.contractorNotes,
                completionChecklist: grievance.completionChecklist,
                createdAt: grievance.createdAt,
                updatedAt: grievance.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching grievance for approval:', error);
        res.status(500).json({ message: 'Error fetching grievance', error: error.message });
    }
};

// Approve grievance (mark as resolved)
exports.approveGrievance = async (req, res) => {
    try {
        const { grievanceId } = req.params;
        const { adminFeedback } = req.body;

        const grievance = await GrieVance.findById(grievanceId)
            .populate('submittedBy', 'fName lastName email')
            .populate('assignedContractor', 'fName lastName email');

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        grievance.status = 'resolved';
        grievance.adminFeedback = adminFeedback || 'Approved by admin';
        grievance.resolvedAt = new Date();
        await grievance.save();

        // Send email to student
        try {
            await sendEmail({
                to: grievance.submittedBy.email,
                subject: `Grievance Resolved: ${grievance.ticketID}`,
                html: `
                    <h2>Your Grievance Has Been Resolved!</h2>
                    <p>Hello ${grievance.submittedBy.fName},</p>
                    <p>Your grievance <strong>${grievance.ticketID}</strong> has been successfully resolved by our team.</p>
                    <p><strong>Issue:</strong> ${grievance.subject}</p>
                    <p><strong>Feedback:</strong> ${grievance.adminFeedback}</p>
                    <p>Thank you for reporting this issue. Your feedback helps us improve our facilities.</p>
                    <p>Best regards,<br/>CampusCare Team</p>
                `
            });
        } catch (emailErr) {
            console.warn('Failed to send approval email:', emailErr);
        }

        res.status(200).json({
            message: 'Grievance approved and student notified',
            grievance: {
                _id: grievance._id,
                ticketID: grievance.ticketID,
                status: grievance.status,
                adminFeedback: grievance.adminFeedback,
                resolvedAt: grievance.resolvedAt
            }
        });
    } catch (error) {
        console.error('Error approving grievance:', error);
        res.status(500).json({ message: 'Error approving grievance', error: error.message });
    }
};

// Reject grievance (send back to contractor)
exports.rejectGrievance = async (req, res) => {
    try {
        const { grievanceId } = req.params;
        const { adminFeedback } = req.body;

        if (!adminFeedback) {
            return res.status(400).json({ message: 'Admin feedback is required for rejection' });
        }

        const grievance = await GrieVance.findById(grievanceId)
            .populate('assignedContractor', 'fName lastName email');

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        if (grievance.status !== 'done') {
            return res.status(400).json({ message: 'Can only reject grievances in "done" status' });
        }

        grievance.status = 'in-progress';
        grievance.adminFeedback = adminFeedback;
        await grievance.save();

        // Send email to contractor
        try {
            await sendEmail({
                to: grievance.assignedContractor.email,
                subject: `Grievance Needs Revision: ${grievance.ticketID}`,
                html: `
                    <h2>Work Needs Revision</h2>
                    <p>Hello ${grievance.assignedContractor.fName},</p>
                    <p>Your work on grievance <strong>${grievance.ticketID}</strong> has been reviewed and requires some adjustments.</p>
                    <p><strong>Feedback:</strong> ${adminFeedback}</p>
                    <p>Please make the necessary corrections and resubmit.</p>
                    <p>Thank you,<br/>CampusCare Team</p>
                `
            });
        } catch (emailErr) {
            console.warn('Failed to send rejection email:', emailErr);
        }

        res.status(200).json({
            message: 'Grievance rejected and contractor notified',
            grievance: {
                _id: grievance._id,
                ticketID: grievance.ticketID,
                status: grievance.status,
                adminFeedback: grievance.adminFeedback
            }
        });
    } catch (error) {
        console.error('Error rejecting grievance:', error);
        res.status(500).json({ message: 'Error rejecting grievance', error: error.message });
    }
};

// Get grievances pending approval (status = 'done')
exports.getPendingApprovals = async (req, res) => {
    try {
        const grievances = await GrieVance.find({ status: 'done' })
            .populate('submittedBy', 'fName lastName')
            .populate('assignedContractor', 'fName lastName')
            .populate('locationId', 'locationName floorNumber')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            message: 'Pending approvals retrieved',
            count: grievances.length,
            grievances: grievances.map(g => ({
                _id: g._id,
                ticketID: g.ticketID,
                subject: g.subject,
                submittedBy: g.submittedBy,
                assignedContractor: g.assignedContractor,
                location: g.locationId?.locationName,
                resolvedPhoto: g.resolvedPhoto,
                status: g.status,
                updatedAt: g.updatedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        res.status(500).json({ message: 'Error fetching pending approvals', error: error.message });
    }
};

module.exports = exports;
