const mongoose = require('mongoose');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
require('dotenv').config();

const Location = require('./models/Location');

async function testPdf() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const location = await Location.findOne();
        if (!location) {
            console.log('No location found');
            return;
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const writeStream = fs.createWriteStream('/tmp/test_qr.pdf');
        doc.pipe(writeStream);

        doc.fontSize(24).text('CampusCare 360', { align: 'center' });
        doc.moveDown();

        const frontendUrl = `http://localhost:5173/report/${location._id}`;
        const qrBuffer = await QRCode.toBuffer(frontendUrl, {
            errorCorrectionLevel: 'H',
            width: 300,
            margin: 1
        });

        doc.image(qrBuffer, (doc.page.width - 300) / 2, doc.y, { width: 300 });
        doc.moveDown(2); // Reduced from 22

        doc.rect(50, doc.y, 500, 100).stroke();
        doc.fontSize(14).text(`Building: ${location.buildingBlock}`, 70, doc.y + 20);
        doc.text(`Location: ${location.locationName}`);
        doc.text(`Floor: ${location.floorNumber}`);

        doc.end();

        writeStream.on('finish', () => {
            console.log('PDF generated successfully at /tmp/test_qr.pdf');
            const stats = fs.statSync('/tmp/test_qr.pdf');
            console.log('File size:', stats.size);
            process.exit(0);
        });
    } catch (err) {
        console.error('FAILED:', err);
        process.exit(1);
    }
}

testPdf();
