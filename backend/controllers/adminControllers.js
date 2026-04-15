const fs = require('fs');
const User = require('../models/User');
const Report = require('../models/Report');
const Grievance = require('../models/Grievance');
const bcrypt = require('bcryptjs');

const Location = require('../models/Location');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { sendEmail } = require('../utils/email');

const createUser = async (req, resp) => {
  const { fName, midName, lastName, email, password, role, specialization, currentFloor, latitude, longitude } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('User creation failed: Email already exists', email);
      return resp.status(400).json({ message: 'User already exists' });
    }

    // Validation for contractor-specific fields
    if (role === 'contractor') {
      if (!specialization || currentFloor === undefined || latitude === undefined || longitude === undefined) {
        console.log('Contractor validation failed:', { specialization, currentFloor, latitude, longitude });
        return resp.status(400).json({
          message: 'For contractor role, required fields: specialization, currentFloor, latitude, longitude'
        });
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    const userData = {
      fName,
      midName,
      lastName,
      email,
      password: hashed,
      role
    };

    // Add contractor-specific details if role is contractor
    if (role === 'contractor') {
      userData.contractorDetails = {
        specialization,
        currentFloor: parseInt(currentFloor),
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)] // [lng, lat]
        },
        rating: 0,
        memberSince: new Date()
      };
    }

    user = new User(userData);
    await user.save();

    // send notification email with credentials
    try {
      await sendEmail({
        to: user.email,
        subject: 'Your CampusCare account has been created',
        text: `Hello ${user.fName},\n\nAn account has been created for you on CampusCare with the following credentials:\n
Email: ${user.email}\nPassword: (the one you supplied)\n\nPlease log in and change your password after first use.\n
Thank you,\nCampusCare Team`
      });
    } catch (err) {
      console.warn('Failed to send account creation email:', err);
    }

    resp.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        fName: user.fName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        ...(role === 'contractor' && {
          contractorDetails: user.contractorDetails
        })
      }
    });
  } catch (error) {
    console.error('createUser error', error);
    resp.status(500).json({ message: 'Server error', error: error.message });
  }
}

const updateState = async (req, resp) => {
  const { userId, newState } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return resp.status(404).json({ message: 'User not found' });
    }
    user.status = newState;
    await user.save();
    resp.json({ message: 'User state updated successfully' });
  } catch (error) {
    console.error('updateState error', error);
    resp.status(500).json({ message: 'Server error' });
  }
}

const createLocation = async (req, res) => {
  try {
    const {
      locationName,
      buildingBlock,
      floorNumber,
      latitude,
      longitude,
      isHighPriorityZone,
      zoneMetadata
    } = req.body;

    // 1. Check if a location already exists on this floor with these coordinates
    // (Prevents duplicate QR codes for the same physical spot)
    const existingLocation = await Location.findOne({
      floorNumber,
      'coordinates.coordinates': [longitude, latitude]
    });
    if (existingLocation) {
      return res.status(400).json({ message: "Location already exists at this spot." });
    }

    // 2. Create the Location Instance first to get a unique ID
    const newLocation = new Location({
      locationName,
      buildingBlock,
      floorNumber,
      isHighPriorityZone,
      coordinates: {
        type: 'Point',
        coordinates: [longitude, latitude] // [lng, lat] for MongoDB
      },
      zoneMetadata
    });

    // 3. Generate QR Code;
    // The URL points directly to the submit form with the location ID as a query parameter
    // If not authenticated, the app will redirect to login but preserve the ?qr param
    // Example: https://student-app.vercel.app/submit?qr=LOCATION_ID
    const frontendUrl = `${process.env.FRONTEND_URL}/submit?qr=${newLocation._id}`;

    // Generate QR as a DataURL (Base64 string) to save in DB
    const qrCodeDataUrl = await QRCode.toDataURL(frontendUrl);
    newLocation.qrCodeUrl = qrCodeDataUrl;

    // 4. Save to Database
    await newLocation.save();

    res.status(201).json({
      success: true,
      message: "Location created and QR code generated successfully.",
      data: newLocation
    });

  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ message: "Server error while creating location." });
  }
};

const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Server error while fetching locations." });
  }
};

const downloadLocationQR = async (req, res) => {
  try {
    const { locationId } = req.params;
    const location = await Location.findById(locationId);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // 1. Create a PDF Document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    let chunks = [];

    // 2. Aggregate chunks into a buffer
    doc.on('data', (chunk) => chunks.push(chunk));

    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      // Sanitize filename: remove anything NOT alphanumeric/hyphen/underscore
      const safeName = location.locationName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
      const filename = `QR_${safeName}.pdf`;

      try {
        fs.appendFileSync('/tmp/campuscare_qr.log', `[${new Date().toISOString()}] Generated QR for ${location.locationName}, Size: ${result.length}, Filename: ${filename}\n`);
      } catch (e) { }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': result.length
      });
      res.end(result);
    });

    doc.on('error', (err) => {
      console.error('PDF Generation Error:', err);
      if (!res.headersSent) {
        res.status(500).send('Error generating PDF');
      }
    });

    // 3. Add Branding/Header
    doc.font('Helvetica-Bold').fontSize(26).text('CampusCare 360', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(16).text('Grievance Reporting Point', { align: 'center', color: 'blue' });
    doc.moveDown(2);

    // 4. Generate the QR Code specifically for the PDF
    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/report/${location._id}`;
    const qrSize = 400; // Increased size
    const qrBuffer = await QRCode.toBuffer(frontendUrl, {
      errorCorrectionLevel: 'H',
      width: qrSize,
      margin: 1
    });

    // 5. Insert the QR Code in the PDF flow (centered)
    const qrX = (doc.page.width - qrSize) / 2;
    // Draw the image at exactly qrX and current doc.y
    doc.image(qrBuffer, qrX, doc.y, { width: qrSize, height: qrSize });

    // Manually advance doc.y below the image plus some padding
    doc.y += qrSize + 20;

    // 6. Add Location Details (The "Sticker" Info)
    const stickerWidth = 450;
    const stickerX = (doc.page.width - stickerWidth) / 2;

    // Calculate how much vertical space the text will take
    const startY = doc.y;

    // Draw the text first to establish flow height
    doc.font('Helvetica-Bold').fontSize(18).fillColor('black').text(`Building: ${location.buildingBlock}`, stickerX, startY + 20, { align: 'center', width: stickerWidth });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(16).text(`Location: ${location.locationName}`, { align: 'center', width: stickerWidth });
    doc.moveDown(0.5);
    doc.text(`Floor: ${location.floorNumber}`, { align: 'center', width: stickerWidth });

    if (location.isHighPriorityZone) {
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fillColor('red').text('HIGH PRIORITY ZONE', { align: 'center', width: stickerWidth });
    }

    const endY = doc.y + 20; // Add padding at the bottom of the content

    // Draw the box spanning the content we just wrote
    doc.rect(stickerX, startY, stickerWidth, endY - startY).stroke();

    // 7. Finalize the PDF
    doc.end();

  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).send("Error generating PDF");
  }
};

const getUsersByRole = async (req, resp) => {
  const { role } = req.params;
  try {
    const users = await User.find({ role }).select('-password').sort({ createdAt: -1 });
    resp.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('getUsersByRole error', error);
    resp.status(500).json({ message: 'Server error' });
  }
}

const getContractorDetailedStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Contractor not found' });
    }

    // --- Status Breakdown ---
    const total = await Grievance.countDocuments({ assignedContractor: userId });
    const applied = await Grievance.countDocuments({ assignedContractor: userId, status: 'applied' });
    const inProgress = await Grievance.countDocuments({ assignedContractor: userId, status: 'in-progress' });
    const done = await Grievance.countDocuments({ assignedContractor: userId, status: 'done' });
    const resolved = await Grievance.countDocuments({ assignedContractor: userId, status: 'resolved' });

    // --- Priority Breakdown ---
    const lowPriority = await Grievance.countDocuments({ assignedContractor: userId, priority: 'Low' });
    const mediumPriority = await Grievance.countDocuments({ assignedContractor: userId, priority: 'Medium' });
    const highPriority = await Grievance.countDocuments({ assignedContractor: userId, priority: 'High' });

    // --- Criticality Breakdown ---
    const normalCriticality = await Grievance.countDocuments({ assignedContractor: userId, criticality: 'Normal' });
    const criticalCriticality = await Grievance.countDocuments({ assignedContractor: userId, criticality: 'Critical' });
    const emergencyCriticality = await Grievance.countDocuments({ assignedContractor: userId, criticality: 'Emergency' });

    // --- Average Resolution Time (in hours) ---
    const resolvedGrievances = await Grievance.find({
      assignedContractor: userId,
      status: { $in: ['done', 'resolved'] },
      resolvedAt: { $exists: true, $ne: null }
    }).select('createdAt resolvedAt');

    let avgResolutionHours = null;
    if (resolvedGrievances.length > 0) {
      const totalMs = resolvedGrievances.reduce((sum, g) => {
        return sum + (new Date(g.resolvedAt) - new Date(g.createdAt));
      }, 0);
      avgResolutionHours = Math.round((totalMs / resolvedGrievances.length) / (1000 * 60 * 60));
    }

    // --- Monthly Activity Trend (last 6 months) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Grievance.aggregate([
      {
        $match: {
          assignedContractor: user._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrend = monthlyTrend.map(m => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      count: m.count
    }));

    // --- Extended Recent Tasks (10 with full detail) ---
    const recentTasks = await Grievance.find({ assignedContractor: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('locationId', 'locationName buildingBlock floorNumber')
      .populate('submittedBy', 'fName lastName');

    res.status(200).json({
      success: true,
      contractor: user,
      stats: {
        total,
        applied,
        inProgress,
        done,
        resolved,
        completionRate: total > 0 ? Math.round(((done + resolved) / total) * 100) : 0,
        avgResolutionHours,
        activeTasksCount: applied + inProgress
      },
      priorityBreakdown: { low: lowPriority, medium: mediumPriority, high: highPriority },
      criticalityBreakdown: { normal: normalCriticality, critical: criticalCriticality, emergency: emergencyCriticality },
      monthlyTrend: formattedTrend,
      recentTasks: recentTasks.map(t => ({
        _id: t._id,
        ticketID: t.ticketID,
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        criticality: t.criticality,
        location: t.locationId?.locationName,
        buildingBlock: t.locationId?.buildingBlock,
        floor: t.locationId?.floorNumber,
        submittedBy: t.submittedBy ? `${t.submittedBy.fName} ${t.submittedBy.lastName}` : 'Unknown',
        createdAt: t.createdAt,
        resolvedAt: t.resolvedAt || null,
        dueAt: t.dueAt
      }))
    });
  } catch (error) {
    console.error('getContractorDetailedStats error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  createUser,
  updateState,
  createLocation,
  downloadLocationQR,
  getUsersByRole,
  getAllLocations,
  getContractorDetailedStats
};
