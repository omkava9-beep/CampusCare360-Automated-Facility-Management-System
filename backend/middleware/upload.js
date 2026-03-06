const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create temp upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isMimeAllowed = allowedMimes.includes(file.mimetype);
    const isExtensionAllowed = allowedExtensions.includes(fileExtension);

    if (isMimeAllowed && isExtensionAllowed) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

module.exports = upload;
