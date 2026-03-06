const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Local file path of the image
 * @param {String} folder - Cloudinary folder path (e.g., 'CampusCare/grievances')
 * @param {String} publicId - Optional public ID for the image
 * @returns {Promise<Object>} - Cloudinary response with secure_url and public_id
 */
exports.uploadToCloudinary = async (filePath, folder = 'CampusCare/grievances', publicId = null) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`);
        }

        const uploadOptions = {
            folder: folder,
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto'
        };

        // Add public_id if provided (for updates)
        if (publicId) {
            uploadOptions.public_id = publicId;
            uploadOptions.overwrite = true;
        }

        const result = await cloudinary.uploader.upload(filePath, uploadOptions);

        // Delete local file after successful upload
        fs.unlinkSync(filePath);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            cloudinaryId: result.public_id,
            size: result.bytes,
            createdAt: new Date()
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Clean up local file even on error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
};

/**
 * Upload image from base64/buffer
 * @param {Buffer|String} fileBuffer - Buffer or base64 string of the image
 * @param {String} fileName - Name for the file
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise<Object>} - Cloudinary response
 */
exports.uploadBufferToCloudinary = async (fileBuffer, fileName, folder = 'CampusCare/grievances') => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto',
                    quality: 'auto',
                    fetch_format: 'auto'
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({
                            success: true,
                            url: result.secure_url,
                            publicId: result.public_id,
                            cloudinaryId: result.public_id,
                            size: result.bytes,
                            createdAt: new Date()
                        });
                    }
                }
            );

            // Handle different input types
            if (typeof fileBuffer === 'string') {
                // Base64 string
                uploadStream.end(Buffer.from(fileBuffer, 'base64'));
            } else {
                // Buffer
                uploadStream.end(fileBuffer);
            }
        });
    } catch (error) {
        console.error('Cloudinary buffer upload error:', error);
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
exports.deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            throw new Error('Public ID is required for deletion');
        }

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return {
                success: true,
                message: 'Image deleted successfully',
                publicId: publicId
            };
        } else {
            throw new Error(`Failed to delete image: ${result.result}`);
        }
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
};

/**
 * Generate optimized Cloudinary URL
 * @param {String} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {String} - Optimized Cloudinary URL
 */
exports.getOptimizedUrl = (publicId, options = {}) => {
    const defaultOptions = {
        quality: 'auto',
        fetch_format: 'auto',
        width: 800,
        crop: 'fill'
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
        return cloudinary.url(publicId, mergedOptions);
    } catch (error) {
        console.error('Error generating optimized URL:', error);
        return null;
    }
};

/**
 * Get image metadata from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Image metadata
 */
exports.getImageMetadata = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return {
            success: true,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            size: result.bytes,
            format: result.format,
            createdAt: result.created_at
        };
    } catch (error) {
        console.error('Error fetching image metadata:', error);
        throw new Error(`Failed to fetch image metadata: ${error.message}`);
    }
};

module.exports = exports;
