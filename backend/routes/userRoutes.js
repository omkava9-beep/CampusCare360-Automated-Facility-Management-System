const routes = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AdminSignup, LoginAdmin, isAdmin } = require('../middleware/auth');
const { createUser, updateState, downloadLocationQR, createLocation, getUsersByRole, getAllLocations, getContractorDetailedStats } = require('../controllers/adminControllers');
const { addGrievance, uploadGrievancePhoto, uploadResolvedPhoto, getGrievancePhotos, deleteGrievancePhoto } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Student Controller imports
const { getMyGrievances, getGrievanceDetail, getStudentProfile, updateStudentProfile, uploadProfilePicture, changePassword } = require('../controllers/studentControllers');

// Contractor Controller imports
const { getAssignedGrievances: getContractorGrievances, getGrievanceDetail: getContractorGrievanceDetail, updateGrievanceStatus, getContractorStats, getContractorProfile, updateContractorProfile, uploadProfilePicture: uploadContractorProfile, changePassword: contractorChangePassword } = require('../controllers/contractorControllers');

// Admin/Dashboard Controller imports
const { getDashboardStats, getAllGrievances, getGrievancesByLocation, getGrievanceForApproval, approveGrievance, rejectGrievance, getPendingApprovals } = require('../controllers/dashboardControllers');

// ============= ADMIN ROUTES =============
routes.post('/admin/signup', AdminSignup);
routes.post('/admin/login', LoginAdmin);
routes.post('/admin/createuser', isAdmin, createUser)
routes.put('/admin/stateupdate', isAdmin, updateState);
routes.post('/admin/createlocation', isAdmin, createLocation);
routes.get('/admin/downloadqr/:locationId', downloadLocationQR);
routes.get('/admin/users/:role', isAdmin, getUsersByRole);
routes.get('/admin/locations', isAdmin, getAllLocations);
routes.get('/admin/users/contractor/:userId/stats', isAdmin, getContractorDetailedStats);

// Admin Dashboard Routes
routes.get('/admin/dashboard/stats', isAdmin, getDashboardStats);
routes.get('/admin/grievances', isAdmin, getAllGrievances);
routes.get('/admin/grievances/location/:locationId', isAdmin, getGrievancesByLocation);
routes.get('/admin/grievances/approval/pending', isAdmin, getPendingApprovals);
routes.get('/admin/grievances/approval/:grievanceId', isAdmin, getGrievanceForApproval);
routes.put('/admin/grievances/approve/:grievanceId', isAdmin, approveGrievance);
routes.put('/admin/grievances/reject/:grievanceId', isAdmin, rejectGrievance);

// ============= GRIEVANCE ROUTES (Shared) =============
routes.post('/grievance/add', authenticateToken, upload.fields([{ name: 'photo', maxCount: 1 }]), addGrievance);
routes.post('/grievance/:grievanceId/upload-initial-photo', authenticateToken, upload.single('photo'), uploadGrievancePhoto);
routes.post('/grievance/:grievanceId/upload-resolved-photo', authenticateToken, upload.single('photo'), uploadResolvedPhoto);
routes.get('/grievance/:grievanceId/photos', authenticateToken, getGrievancePhotos);
routes.delete('/grievance/:grievanceId/photo/:photoType', authenticateToken, deleteGrievancePhoto);

// ============= STUDENT ROUTES =============
routes.get('/student/grievances', authenticateToken, getMyGrievances);
routes.get('/student/grievances/:grievanceId', authenticateToken, getGrievanceDetail);
routes.get('/student/profile', authenticateToken, getStudentProfile);
routes.put('/student/profile', authenticateToken, updateStudentProfile);
routes.post('/student/profile-picture', authenticateToken, upload.single('photo'), uploadProfilePicture);
routes.post('/student/change-password', authenticateToken, changePassword);

// ============= CONTRACTOR ROUTES =============
routes.get('/contractor/grievances', authenticateToken, getContractorGrievances);
routes.get('/contractor/grievances/:grievanceId', authenticateToken, getContractorGrievanceDetail);
routes.put('/contractor/grievances/:grievanceId/status', authenticateToken, updateGrievanceStatus);
routes.get('/contractor/stats', authenticateToken, getContractorStats);
routes.get('/contractor/profile', authenticateToken, getContractorProfile);
routes.put('/contractor/profile', authenticateToken, updateContractorProfile);
routes.post('/contractor/profile-picture', authenticateToken, upload.single('photo'), uploadContractorProfile);
routes.post('/contractor/change-password', authenticateToken, contractorChangePassword);

module.exports = routes