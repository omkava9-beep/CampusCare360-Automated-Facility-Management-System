const User = require('../models/User');
const Report = require('../models/Report');
const Grievance = require('../models/Grievance');
const bcrypt = require('bcryptjs');

const Location = require('../models/Location');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { sendEmail } = require('../utils/email');



const createUser = async(req,resp)=>{
    const {fName , midName , lastName , email , password , role, specialization, currentFloor, latitude, longitude} = req.body;

    try{
        let user = await User.findOne({email});
        if(user){
            return resp.status(400).json({message: 'User already exists'});
        }

        // Validation for contractor-specific fields
        if (role === 'contractor') {
            if (!specialization || !currentFloor || latitude === undefined || longitude === undefined) {
                return resp.status(400).json({
                    message: 'For contractor role, required fields: specialization, currentFloor, latitude, longitude'
                });
            }
        }

        const hashed = await bcrypt.hash(password , 10);
        
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
    }catch(error){
        console.error('createUser error', error);
        resp.status(500).json({message: 'Server error', error: error.message});
    }
}

const updateState = async(req , resp)=>{
    const {userId , newState} = req.body ;
    try {
        const user = await User.findById(userId);
        if(!user){
            return resp.status(404).json({message: 'User not found'});
        }
        user.status = newState;
        await user.save();
        resp.json({message: 'User state updated successfully'});
    } catch (error) {
        console.error('updateState error', error);
        resp.status(500).json({message: 'Server error'});
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
    // The URL points to your frontend route where the student fills the form
    // Example: https://your-app.com/report/LOCATION_ID
    const frontendUrl = `${process.env.FRONTEND_URL}/report/${newLocation._id}`;
    
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
const downloadLocationQR = async (req, res) => {
  try {
    const { locationId } = req.params;
    const location = await Location.findById(locationId);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // 1. Create a PDF Document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // 2. Set headers so the browser knows it's a PDF download
    const filename = `QR_${location.locationName.replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    // 3. Pipe the PDF into the response
    doc.pipe(res);

    // 4. Add Branding/Header
    doc.fontSize(24).text('CampusCare 360', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Grievance Reporting Point', { align: 'center', color: 'blue' });
    doc.moveDown(2);

    // 5. Generate the QR Code specifically for the PDF
    const frontendUrl = `${process.env.FRONTEND_URL}/report/${location._id}`;
    const qrBuffer = await QRCode.toBuffer(frontendUrl, { 
      errorCorrectionLevel: 'H',
      width: 300 
    });

    // 6. Center the QR Code in the PDF
    doc.image(qrBuffer, (doc.page.width - 300) / 2, doc.y, { width: 300 });
    doc.moveDown(22); // Move below the image

    // 7. Add Location Details (The "Sticker" Info)
    doc.rect(50, doc.y, 500, 100).stroke(); // Draw a box around details
    doc.fontSize(14).text(`Building: ${location.buildingBlock}`, 70, doc.y + 20);
    doc.text(`Location: ${location.locationName}`);
    doc.text(`Floor: ${location.floorNumber}`);

    if (location.isHighPriorityZone) {
      doc.fillColor('red').text('HIGH PRIORITY ZONE', { align: 'right' });
    }

    // 8. Finalize the PDF
    doc.end();

  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).send("Error generating PDF");
  }
};
module.exports = {createUser, updateState, createLocation , downloadLocationQR};