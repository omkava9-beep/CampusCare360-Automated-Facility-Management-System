# 🏫 CampusCare360: Smart Facility Management & Automated Grievance Redressal

**CampusCare360** is a full-stack MERN application designed to digitize and automate campus maintenance. By leveraging **QR-code identification** and **Geospatial proximity logic**, it ensures that infrastructure issues—from leaky pipes to electrical faults—are reported instantly and assigned to the nearest available specialist without manual intervention.

---

## 🚀 The Core Workflow

* **Admin Side:** Creates a physical "Location" (Building, Floor, GPS Coordinates). The system generates a unique, branded **QR Code PDF** to be pasted at that spot.
* **Student Side:** Scans the QR at the site of the issue. A form opens pre-loaded with location metadata (Operating hours, Facilities, etc.).
* **The Assignment Engine:** Upon submission, the backend runs a **Geospatial Proximity Algorithm** using MongoDB `$near` queries. It identifies the closest active contractor specialized in that category (e.g., Plumbing), prioritizing those on the same floor or building.
* **Contractor Side:** Receives a real-time notification via **Socket.io**. They manage the task lifecycle (Applied → In Progress → Done) and upload a "Resolution Photo" as proof of work.
* **Validation:** The Admin reviews the "Before/After" evidence. Once approved, the student is automatically notified of the resolution via **Nodemailer**.



---

## 🛠️ Tech Stack

* **Frontend:** React.js (Role-Based Protected Routing)
* **Backend:** Node.js & Express.js
* **Database:** MongoDB (**GeoJSON & 2dsphere indexing** for proximity search)
* **Real-time:** Socket.io (Live status updates & internal activity logs)
* **Communication:** Nodemailer (Email triggers)
* **Document Engine:** PDFKit (On-the-fly QR poster generation)

---

## ✨ Key Features

* 📍 **Geospatial Auto-Assignment:** Automated task dispatching based on real-time coordinate calculations.
* 🏢 **Floor-Aware Logic:** Handles vertical campus structures where GPS coordinates overlap across different floors, ensuring the "nearest" person isn't 5 floors away.
* 📊 **Admin Command Center:** Real-time analytics on grievance hotspots, solved vs. pending cases, and user management (Activate/Discard users).
* 💬 **Live Activity Log:** A WhatsApp-style internal communication thread between Admins and Contractors for every ticket to discuss specific fix requirements.
* 📸 **Visual Accountability:** Mandatory "Resolution Photo" upload for contractor accountability before a ticket can be closed.



---

## 📂 Backend Architecture (Models)

* **User Model:** Manages roles (Admin, Student, Contractor), specializations, and live GPS coordinates.
* **Location Model:** Stores static campus points, floor numbers, and generated QR Base64 strings.
* **Grievance Model:** The central transaction record tracking the ticket lifecycle, "Before/After" media, and assignment metadata.
* **Message Model:** Stores the real-time interaction logs for audit trails.

---

## 🚦 Getting Started

### Prerequisites
* Node.js (v16+)
* MongoDB Atlas Account
* Cloudinary Account (for image uploads)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/CampusCare360.git](https://github.com/yourusername/CampusCare360.git)
    cd CampusCare360
    ```

2.  **Setup Backend:**
    ```bash
    cd server
    npm install
    # Create a .env file and add your credentials
    npm run dev
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../client
    npm install
    npm start
    ```

### Environment Variables (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
CLOUDINARY_URL=your_cloudinary_url
NODEMAILER_EMAIL=your_email
NODEMAILER_PASS=your_app_password
