# Testing Guide - API Step by Step

## Prerequisites

- Backend running: `npm start`
- MongoDB connected
- .env configured with Cloudinary and email credentials
- Postman or similar API client

---

## TEST WORKFLOW - Complete End-to-End

### **Step 1️⃣: Create Admin Account (One time)**

**Endpoint:** `POST /api/v1/user/admin/signup`

**Request:**
```bash
POST http://localhost:4000/api/v1/user/admin/signup
Content-Type: application/json

{
  "fName": "Admin",
  "lastName": "User",
  "email": "admin@campus.com",
  "password": "admin123"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "Admin registered successfully",
  "user": {
    "_id": "admin_id_123",
    "email": "admin@campus.com",
    "role": "admin"
  }
}
```

---

### **Step 2️⃣: Admin Login**

**Endpoint:** `POST /api/v1/user/admin/login`

**Request:**
```bash
POST http://localhost:4000/api/v1/user/admin/login
Content-Type: application/json

{
  "email": "admin@campus.com",
  "password": "admin123"
}
```

**Expected Response:** `200 OK` (JWT token in cookies)
```json
{
  "message": "Login successful",
  "email": "admin@campus.com",
  "role": "admin"
}
```

**Note:** Cookie is automatically set. All subsequent admin requests will use this cookie.

---

### **Step 3️⃣: Create Location with Coordinates**

**Endpoint:** `POST /api/v1/user/admin/createlocation`

**Request:**
```bash
POST http://localhost:4000/api/v1/user/admin/createlocation
Content-Type: application/json
Authorization: Cookie (from login)

{
  "locationName": "Building A - Bathroom Floor 2",
  "buildingBlock": "A",
  "floorNumber": 2,
  "latitude": 28.6139,
  "longitude": 77.2090,
  "isHighPriorityZone": false
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "Location created successfully",
  "location": {
    "_id": "location_id_123",
    "locationName": "Building A - Bathroom Floor 2",
    "floorNumber": 2,
    "coordinates": {
      "type": "Point",
      "coordinates": [77.2090, 28.6139]
    },
    "qrCode": "data:image/png;base64,..."
  }
}
```

**Save:** `location_id_123` for later use

---

### **Step 4️⃣: Create Contractor User**

**Endpoint:** `POST /api/v1/user/admin/createuser`

**Request:**
```bash
POST http://localhost:4000/api/v1/user/admin/createuser
Content-Type: application/json
Authorization: Cookie (from login)

{
  "fName": "Rajesh",
  "lastName": "Kumar",
  "email": "rajesh@contractor.com",
  "password": "contractor123",
  "role": "contractor",
  "specialization": "Plumbing",
  "currentFloor": 2,
  "latitude": 28.6140,
  "longitude": 77.2091
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "contractor_id_123",
    "fName": "Rajesh",
    "email": "rajesh@contractor.com",
    "role": "contractor",
    "status": "Active",
    "contractorDetails": {
      "specialization": "Plumbing",
      "currentFloor": 2,
      "location": {
        "type": "Point",
        "coordinates": [77.2091, 28.6140]
      }
    }
  }
}
```

**Save:** `contractor_id_123`

**Email Sent:** Contractor receives account creation email

---

### **Step 5️⃣: Create Student User**

**Endpoint:** `POST /api/v1/user/admin/createuser`

**Request:**
```bash
POST http://localhost:4000/api/v1/user/admin/createuser
Content-Type: application/json
Authorization: Cookie (from login)

{
  "fName": "Aman",
  "lastName": "Singh",
  "email": "aman@student.com",
  "password": "student123",
  "role": "student",
  "department": "CSE"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "student_id_123",
    "fName": "Aman",
    "email": "aman@student.com",
    "role": "student",
    "status": "Active"
  }
}
```

**Save:** `student_id_123`

**Email Sent:** Student receives account creation email

---

### **Step 6️⃣: Student Logs In**

**Endpoint:** `POST /api/v1/user/admin/login` (same endpoint for all roles)

**Request:**
```bash
POST http://localhost:4000/api/v1/user/admin/login
Content-Type: application/json

{
  "email": "aman@student.com",
  "password": "student123"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Login successful",
  "email": "aman@student.com",
  "role": "student"
}
```

**New Cookie Set:** Use this for all student requests

---

### **Step 7️⃣: Student Submits Grievance (with photo)**

**Endpoint:** `POST /api/v1/user/grievance/add`

**Request (Form-Data):**
```bash
POST http://localhost:4000/api/v1/user/grievance/add
Content-Type: multipart/form-data
Authorization: Cookie (student login)

Form Fields:
- qrCodeLocationId: location_id_123
- subject: Water leaking from bathroom ceiling
- description: Water droplets falling from ceiling corner. Needs immediate fix.
- category: plumbing
- criticality: Normal
- priority: High
- photo: select image file]
```

**Expected Response:** `201 Created`
```json
{
  "message": "Grievance added successfully",
  "grievance": {
    "ticketID": "#GR-1709731200567-342",
    "_id": "grievance_id_123",
    "subject": "Water leaking from bathroom ceiling",
    "status": "applied",
    "location": "Building A - Bathroom Floor 2",
    "floor": 2,
    "initialPhoto": "https://res.cloudinary.com/..."
  },
  "assignedContractor": {
    "_id": "contractor_id_123",
    "name": "Rajesh Kumar",
    "specialization": "Plumbing",
    "currentFloor": 2,
    "distanceInMeters": 45,
    "isFloorMatched": true,
    "phoneNumber": "9876543210"
  }
}
```

**Save:** `grievance_id_123` and `ticketID`

**Emails Sent:**
- ✉️ Student: "Your grievance #GR-1709731200567-342 has been submitted"
- ✉️ Contractor: "New grievance assigned to you: #GR-1709731200567-342"

---

### **Step 8️⃣: Contractor Logs In**

**Request:**
```bash
POST http://localhost:4000/api/v1/user/admin/login
Content-Type: application/json

{
  "email": "rajesh@contractor.com",
  "password": "contractor123"
}
```

**New Cookie Set:** Use this for all contractor requests

---

### **Step 9️⃣: Contractor Views Assigned Work**

**Endpoint:** `GET /api/v1/user/contractor/grievances`

**Request:**
```bash
GET http://localhost:4000/api/v1/user/contractor/grievances
Authorization: Cookie (contractor login)
```

**Expected Response:** `200 OK`
```json
{
  "message": "Assigned grievances retrieved successfully",
  "count": 1,
  "grievances": [
    {
      "_id": "grievance_id_123",
      "ticketID": "#GR-1709731200567-342",
      "subject": "Water leaking from bathroom ceiling",
      "status": "applied",
      "location": "Building A - Bathroom Floor 2",
      "floor": 2,
      "submittedBy": {
        "_id": "student_id_123",
        "name": "Aman Singh",
        "email": "aman@student.com",
        "phone": "9876543210"
      },
      "initialPhoto": "https://res.cloudinary.com/...",
      "dueAt": "2024-03-07T12:00:00Z"
    }
  ]
}
```

---

### **Step 🔟: Contractor Updates Status to In-Progress**

**Endpoint:** `PUT /api/v1/user/contractor/grievances/:grievanceId/status`

**Request:**
```bash
PUT http://localhost:4000/api/v1/user/contractor/grievances/grievance_id_123/status
Content-Type: application/json
Authorization: Cookie (contractor login)

{
  "status": "in-progress",
  "notes": "Arrived at location. Assessed the leak - appears to be pipe connection issue. Starting repairs now."
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Grievance status updated successfully",
  "grievance": {
    "_id": "grievance_id_123",
    "ticketID": "#GR-1709731200567-342",
    "status": "in-progress",
    "contractorNotes": "Arrived at location. Assessed the leak - appears to be pipe connection issue. Starting repairs now.",
    "updatedAt": "2024-03-06T14:30:00Z"
  }
}
```

**No Email Sent** (internal transition)

---

### **Step 1️⃣1️⃣: Contractor Uploads Resolved Photo**

**Endpoint:** `POST /api/v1/user/grievance/:grievanceId/upload-resolved-photo`

**Request (Form-Data):**
```bash
POST http://localhost:4000/api/v1/user/grievance/grievance_id_123/upload-resolved-photo
Content-Type: multipart/form-data
Authorization: Cookie (contractor login)

Form Fields:
- photo: [select image file of fixed leak/bathroom]
```

**Expected Response:** `200 OK`
```json
{
  "message": "Resolved photo uploaded successfully. Grievance marked as done.",
  "photo": {
    "url": "https://res.cloudinary.com/...",
    "uploadedAt": "2024-03-06T15:00:00Z"
  },
  "grievance": {
    "_id": "grievance_id_123",
    "ticketID": "#GR-1709731200567-342",
    "status": "done",
    "resolvedAt": "2024-03-06T15:00:00Z"
  }
}
```

**⚙️ AUTOMATIC:** Status changed to `"done"` (no manual update needed)

**No Email Sent** (waiting for admin review)

---

### **Step 1️⃣2️⃣: Admin Views Pending Approvals**

**Request:**
```bash
GET http://localhost:4000/api/v1/user/admin/grievances/approval/pending
Authorization: Cookie (admin login)
```

**Expected Response:** `200 OK`
```json
{
  "message": "Pending approvals retrieved",
  "count": 1,
  "grievances": [
    {
      "_id": "grievance_id_123",
      "ticketID": "#GR-1709731200567-342",
      "subject": "Water leaking from bathroom ceiling",
      "location": "Building A - Bathroom Floor 2",
      "submittedBy": {
        "_id": "student_id_123",
        "name": "Aman Singh"
      },
      "assignedContractor": {
        "_id": "contractor_id_123",
        "name": "Rajesh Kumar"
      },
      "initialPhoto": "https://res.cloudinary.com/.../initial.jpg",
      "resolvedPhoto": "https://res.cloudinary.com/.../resolved.jpg",
      "contractorNotes": "Ended drain pipe and sealed the connection",
      "status": "done",
      "updatedAt": "2024-03-06T15:00:00Z"
    }
  ]
}
```

---

### **Step 1️⃣3️⃣: Admin Views Full Grievance Details**

**Endpoint:** `GET /api/v1/user/admin/grievances/approval/:grievanceId`

**Request:**
```bash
GET http://localhost:4000/api/v1/user/admin/grievances/approval/grievance_id_123
Authorization: Cookie (admin login)
```

**Expected Response:** `200 OK`
```json
{
  "message": "Grievance retrieved for approval",
  "grievance": {
    "_id": "grievance_id_123",
    "ticketID": "#GR-1709731200567-342",
    "subject": "Water leaking from bathroom ceiling",
    "description": "Water droplets falling from ceiling corner. Needs immediate fix.",
    "category": "plumbing",
    "priority": "High",
    "criticality": "Normal",
    "status": "done",
    "submittedBy": {
      "_id": "student_id_123",
      "fName": "Aman",
      "lastName": "Singh",
      "email": "aman@student.com",
      "phoneNumber": "9876543210"
    },
    "assignedContractor": {
      "_id": "contractor_id_123",
      "fName": "Rajesh",
      "lastName": "Kumar",
      "email": "rajesh@contractor.com"
    },
    "location": {
      "_id": "location_id_123",
      "locationName": "Building A - Bathroom Floor 2",
      "floorNumber": 2,
      "buildingBlock": "A"
    },
    "initialPhoto": "https://res.cloudinary.com/.../initial.jpg",
    "resolvedPhoto": "https://res.cloudinary.com/.../resolved.jpg",
    "contractorNotes": "Ended drain pipe and sealed the connection",
    "createdAt": "2024-03-06T14:00:00Z",
    "updatedAt": "2024-03-06T15:00:00Z"
  }
}
```

**Admin compares photos:**
- Initial photo: Shows leak
- Resolved photo: Shows fix
- Contractor notes: Explains work done

---

### **Step 1️⃣4️⃣A: APPROVE - Admin Approves Work ✅**

**Endpoint:** `PUT /api/v1/user/admin/grievances/approve/:grievanceId`

**Request:**
```bash
PUT http://localhost:4000/api/v1/user/admin/grievances/approve/grievance_id_123
Content-Type: application/json
Authorization: Cookie (admin login)

{
  "adminFeedback": "Excellent work! The leak has been completely fixed. Pipe connection is now sealed properly and water flow tested. No issues found."
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Grievance approved and student notified",
  "grievance": {
    "_id": "grievance_id_123",
    "ticketID": "#GR-1709731200567-342",
    "status": "resolved",
    "adminFeedback": "Excellent work! The leak has been completely fixed. Pipe connection is now sealed properly and water flow tested. No issues found.",
    "resolvedAt": "2024-03-06T15:30:00Z"
  }
}
```

**✉️ EMAIL SENT TO STUDENT:**
```
To: aman@student.com
Subject: Grievance Resolved: #GR-1709731200567-342

Hello Aman,

Your grievance #GR-1709731200567-342 has been successfully resolved by our team.

Issue: Water leaking from bathroom ceiling

Feedback: Excellent work! The leak has been completely fixed. 
Pipe connection is now sealed properly and water flow tested. 
No issues found.

Thank you for reporting this issue. Your feedback helps us improve our facilities.

Best regards,
CampusCare Team
```

**🎉 WORKFLOW COMPLETE!**

---

### **Step 1️⃣4️⃣B: REJECT - Admin Rejects Work ❌**

*(If work quality not acceptable)*

**Endpoint:** `PUT /api/v1/user/admin/grievances/reject/:grievanceId`

**Request:**
```bash
PUT http://localhost:4000/api/v1/user/admin/grievances/reject/grievance_id_123
Content-Type: application/json
Authorization: Cookie (admin login)
 
{
  "adminFeedback": "Water is still leaking from the same corner. The pipe connection appears loose. Please check the connection point again and ensure it's fully sealed before resubmitting."
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Grievance rejected and contractor notified",
  "grievance": {
    "_id": "grievance_id_123",
    "ticketID": "#GR-1709731200567-342",
    "status": "in-progress",
    "adminFeedback": "Water is still leaking from the same corner. The pipe connection appears loose. Please check the connection point again..."
  }
}
```

**✉️ EMAIL SENT TO CONTRACTOR:**
```
To: rajesh@contractor.com
Subject: Grievance Needs Revision: #GR-1709731200567-342

Hello Rajesh,

Your work on grievance #GR-1709731200567-342 has been reviewed and 
requires some adjustments.

Feedback: Water is still leaking from the same corner. The pipe connection 
appears loose. Please check the connection point again and ensure it's fully 
sealed before resubmitting.

Please make the necessary corrections and resubmit.

Thank you,
CampusCare Team
```

**🔄 Back to Step 1️⃣0️⃣:** Contractor can update status and upload new photo

---

## 📊 Alternative: View Student's Grievances

**Endpoint:** `GET /api/v1/user/student/grievances`

**Request:**
```bash
GET http://localhost:4000/api/v1/user/student/grievances
Authorization: Cookie (student login)
```

**Expected Response:** `200 OK`
```json
{
  "message": "My grievances retrieved successfully",
  "count": 1,
  "grievances": [
    {
      "_id": "grievance_id_123",
      "ticketID": "#GR-1709731200567-342",
      "subject": "Water leaking from bathroom ceiling",
      "status": "resolved",
      "location": "Building A - Bathroom Floor 2",
      "assignedContractor": {
        "_id": "contractor_id_123",
        "name": "Rajesh Kumar",
        "email": "rajesh@contractor.com"
      },
      "initialPhoto": "https://res.cloudinary.com/.../initial.jpg",
      "resolvedPhoto": "https://res.cloudinary.com/.../resolved.jpg",
      "dueAt": "2024-03-07T12:00:00Z",
      "createdAt": "2024-03-06T14:00:00Z"
    }
  ]
}
```

---

## 🔍 View Contractor Statistics

**Endpoint:** `GET /api/v1/user/contractor/stats`

**Request:**
```bash
GET http://localhost:4000/api/v1/user/contractor/stats
Authorization: Cookie (contractor login)
```

**Expected Response:** `200 OK`
```json
{
  "message": "Contractor statistics retrieved",
  "stats": {
    "total": 5,
    "applied": 1,
    "inProgress": 2,
    "done": 0,
    "resolved": 2,
    "percentageComplete": 40
  }
}
```

---

## 📈 Admin Dashboard Statistics

**Endpoint:** `GET /api/v1/user/admin/dashboard/stats`

**Request:**
```bash
GET http://localhost:4000/api/v1/user/admin/dashboard/stats
Authorization: Cookie (admin login)
```

**Expected Response:** `200 OK`
```json
{
  "message": "Dashboard statistics retrieved",
  "stats": {
    "grievances": {
      "total": 156,
      "applied": 12,
      "inProgress": 34,
      "done": 8,
      "resolved": 102,
      "percentageResolved": 65
    },
    "users": {
      "contractors": 25,
      "students": 1200
    },
    "locations": 32,
    "grievancesByLocation": [...]
  }
}
```

---

## ⚠️ Common Errors

### **Missing Required Field**
```
Status: 400 Bad Request
{
  "message": "Missing required fields: qrCodeLocationId, subject, description, category"
}
```

### **Contractor Not Found**
```
Status: 404 Not Found
{
  "message": "Grievance not found"
}
```

### **Not Authorized**
```
Status: 403 Forbidden
{
  "message": "Not authorized to update this grievance"
}
```

### **Invalid Status**
```
Status: 400 Bad Request
{
  "message": "Invalid status. Must be: applied, in-progress, or done"
}
```

### **No File Uploaded**
```
Status: 400 Bad Request
{
  "message": "No file uploaded"
}
```

---

## ✅ Test Results Checklist

- [ ] Step 1-7: Grievance created with auto-assigned contractor
- [ ] Emails received: Student confirmation + Contractor assignment
- [ ] Step 9-10: Contractor views and updates status
- [ ] Step 11: Photo upload auto-marks as "done"
- [ ] Step 12-13: Admin sees pending approvals
- [ ] Step 14A: Admin approves, student receives email ✅
- [ ] OR Step 14B: Admin rejects, contractor receives email ❌
- [ ] Student can view resolved grievance
- [ ] Dashboard shows updated statistics

