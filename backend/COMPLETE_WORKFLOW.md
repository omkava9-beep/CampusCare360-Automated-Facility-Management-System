# CampusCare Complete Workflow - How It Works

## 🎯 Overview

The CampusCare system manages campus grievances from student submission through contractor work completion to admin verification and student notification. The workflow ensures quality control through admin approval before notifying the student.

---

## 📊 Complete Workflow Diagram

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    CampusCare Grievance Workflow                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

STAGE 1: STUDENT SUBMITS GRIEVANCE
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Student scans QR code → Fills form → Uploads photo (opt)     │
│                                                                 │
│  POST /grievance/add                                           │
│  {                                                             │
│    qrCodeLocationId: "loc_123",                               │
│    subject: "Water leakage",                                  │
│    description: "Bathroom ceiling leak",                      │
│    category: "plumbing",                                      │
│    photo: [file]  (optional)                                  │
│  }                                                             │
│                                                                 │
│  ✓ Grievance created: status = "applied"                      │
│  ✓ Ticket ID generated: #GR-{timestamp}-{random}             │
│  ✓ Nearest contractor AUTOMATICALLY assigned                   │
│  ✓ Photo uploaded to Cloudinary                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    📧 EMAIL 1 (Student)
                    ┌─────────────────────────────┐
                    │ To: student@email.com       │
                    │ Subject: Confirmation       │
                    │ Your grievance #GR-2024-001 │
                    │ has been submitted.         │
                    └─────────────────────────────┘
                            ↓
                    📧 EMAIL 2 (Contractor)
                    ┌─────────────────────────────┐
                    │ To: contractor@email.com    │
                    │ Subject: New Assignment     │
                    │ Grievance #GR-2024-001      │
                    │ assigned to you             │
                    └─────────────────────────────┘


STAGE 2: CONTRACTOR STARTS WORK
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Contractor views assigned work                                │
│  GET /contractor/grievances                                    │
│                                                                 │
│  Contractor updates status to "in-progress"                   │
│  PUT /contractor/grievances/:id/status                        │
│  {                                                             │
│    status: "in-progress",                                     │
│    notes: "Started assessing the leak"                       │
│  }                                                             │
│                                                                 │
│  ✓ Status: "applied" → "in-progress"                         │
│  ✓ Work notes stored in database                             │
│  ✓ No email sent (internal transition)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓

STAGE 3: CONTRACTOR COMPLETES WORK
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Contractor finishes work                                      │
│  Contractor uploads completion photo                           │
│                                                                 │
│  POST /grievance/:id/upload-resolved-photo                    │
│  Content-Type: multipart/form-data                            │
│  {                                                             │
│    photo: [image-file]                                        │
│  }                                                             │
│                                                                 │
│  ⚙️  AUTOMATIC ACTIONS:                                        │
│  ✓ Photo uploaded to Cloudinary                               │
│  ✓ Status: "in-progress" → "done" (AUTOMATIC!)              │
│  ✓ resolvedAt timestamp set                                   │
│  ✓ Grievance moved to admin queue                            │
│  ✓ NO email sent yet (awaiting admin review)                 │
│                                                                 │
│  Response:                                                     │
│  {                                                             │
│    message: "Resolved photo uploaded. Grievance marked done",  │
│    photo: { url: "https://..." },                            │
│    grievance: { status: "done" }                             │
│  }                                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓

STAGE 4: ADMIN REVIEWS WORK
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Admin views pending approvals queue                           │
│  GET /admin/grievances/approval/pending                        │
│                                                                 │
│  Returns list of grievances with status = "done"              │
│  Admin can see:                                                │
│  • Submission details                                          │
│  • Student info                                                │
│  • Contractor info                                             │
│  • Initial photo (before)                                      │
│  • Resolved photo (after)                                      │
│  • Contractor notes                                            │
│                                                                 │
│  Admin selects grievance to review                            │
│  GET /admin/grievances/approval/:id                            │
│                                                                 │
│  Admin verifies work quality by comparing photos              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                ┌───────────────────────────┐
                │  ADMIN DECISION POINT      │
                │  ✅ Approve OR ❌ Reject  │
                └───────────────────────────┘
                   ↓                      ↓


═══════════════════════════════════════════════════════════════════


STAGE 5A: ADMIN APPROVES ✅
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Admin enters feedback (mandatory or default)                  │
│  PUT /admin/grievances/approve/:id                            │
│  {                                                             │
│    adminFeedback: "Excellent work! Issue fully resolved."     │
│  }                                                             │
│                                                                 │
│  ✓ Status: "done" → "resolved" (FINAL)                       │
│  ✓ adminFeedback saved                                        │
│  ✓ resolvedAt timestamp updated                              │
│  ✓ Grievance CLOSED ✓                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    📧 EMAIL 3 (Student) ⭐
                    ┌──────────────────────────────┐
                    │ To: student@email.com        │
                    │ Subject: Grievance Resolved  │
                    │                              │
                    │ Hello [Student Name],        │
                    │                              │
                    │ Your grievance #GR-2024-001  │
                    │ has been successfully        │
                    │ resolved by our team!        │
                    │                              │
                    │ Issue: Water leakage         │
                    │                              │
                    │ Admin Feedback:              │
                    │ "Excellent work! Issue       │
                    │ fully resolved."             │
                    │                              │
                    │ Thank you for your report.   │
                    │                              │
                    │ CampusCare Team              │
                    └──────────────────────────────┘
                            ↓
                    🎉 WORKFLOW COMPLETE 🎉


═══════════════════════════════════════════════════════════════════


STAGE 5B: ADMIN REJECTS ❌
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Admin reviews and finds issues with work                      │
│  Admin enters detailed feedback (REQUIRED)                     │
│                                                                 │
│  PUT /admin/grievances/reject/:id                             │
│  {                                                             │
│    adminFeedback: "Leak still present in corner.              │
│                    Please check connection point."             │
│  }                                                             │
│                                                                 │
│  ✓ Status: "done" → "in-progress" (RE-ASSIGNED)              │
│  ✓ adminFeedback saved                                        │
│  ✓ Grievance returned to contractor                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    📧 EMAIL 4 (Contractor) 🔄
                    ┌──────────────────────────────┐
                    │ To: contractor@email.com     │
                    │ Subject: Work Needs Revision │
                    │                              │
                    │ Hello [Contractor Name],     │
                    │                              │
                    │ Your work on #GR-2024-001    │
                    │ requires adjustments.        │
                    │                              │
                    │ Admin Feedback:              │
                    │ "Leak still present in       │
                    │ corner. Please check         │
                    │ connection point."           │
                    │                              │
                    │ Please make corrections      │
                    │ and resubmit.                │
                    │                              │
                    │ CampusCare Team              │
                    └──────────────────────────────┘
                            ↓
        ❌ Back to STAGE 2: Contractor re-works
        
        Contractor:
        • Updates status back to "in-progress"
        • Works on the issues mentioned
        • Uploads NEW resolved photo
        
        Then process repeats:
        Stage 2 → Stage 3 → Stage 4 → (Approve ✅ or Reject ❌ again)
        
        ⚠️  This cycle continues until APPROVED


═══════════════════════════════════════════════════════════════════
```

---

## 📧 Email Timeline

| Stage | Event | To | Subject | Contains |
|-------|-------|----|---------| ---------|
| 1 | Grievance submitted | Student | Confirmation | Ticket ID, Location, Auto-submitted message |
| 1 | Contractor assigned | Contractor | New Assignment | Ticket ID, Location, Issue details |
| 2-3 | Contractor works | - | - | No email (internal work) |
| 5A | Work approved ✅ | Student | Grievance Resolved | Ticket ID, Admin feedback, Closure confirmation |
| 5B | Work rejected ❌ | Contractor | Work Needs Revision | Issue details, Admin feedback with corrections |

---

## 🔄 Status Transitions

```
Created
  ↓
[APPLIED] ← Initial state after creation
  ↓
  └─ Contractor takes action
[IN-PROGRESS] ← Contractor updates status
  ↓
  └─ Contractor uploads completion photo (AUTOMATIC)
[DONE] ← Waiting for admin review
  ↓
  ├─ Admin reviews & approves
  │  ↓
  │  [RESOLVED] ← FINAL STATE ✓
  │
  └─ Admin reviews & rejects
     ↓
     [IN-PROGRESS] ← Back to contractor (can re-cycle through DONE)
```

---

## 👥 Role-Based Actions

### **STUDENT**
```
1. Submit Grievance
   - Scan QR code to get location
   - Fill form (subject, description, category, etc.)
   - Upload optional photo

2. Track Progress
   - View list of submitted grievances
   - Check individual grievance status
   - See contractor assigned to them
   - View completion photos after approval

3. Receive Notifications
   ✉️ Email when grievance created (confirmation)
   ✉️ Email when work is APPROVED by admin (with admin feedback)
```

### **CONTRACTOR**
```
1. Receive Assignment
   ✉️ Email notification when grievance assigned
   GET /contractor/grievances (view all assigned)

2. Update Status
   PUT status from "applied" → "in-progress" → "done"
   
3. Upload Proof of Work
   POST resolved photo (auto-marks as "done")

4. Receive Feedback
   ✉️ Email if admin rejects (with detailed feedback)
   
5. Re-work if Needed
   Can re-update status and re-upload photo
   Process repeats until approved
```

### **ADMIN**
```
1. Create Infrastructure
   - Create locations with coordinates
   - Create user accounts (students, contractors, faculty)
   
2. Monitor Dashboard
   GET /admin/dashboard/stats (overall metrics)
   GET /admin/grievances (all grievances)
   
3. Review Pending Work
   GET /admin/grievances/approval/pending
   GET /admin/grievances/approval/:id (detailed review)

4. Make Approval Decision
   - Compare initial & resolved photos
   - Read contractor notes
   - Enter feedback (mandatory for rejection)
   
5. Approve or Reject
   PUT /admin/grievances/approve/:id → RESOLVES & emails student
   PUT /admin/grievances/reject/:id → REJECTS & emails contractor

6. Analytics
   View grievances by location
   View status breakdowns
   Track resolution rates
```

---

## 🎯 Key Features

### **Automatic Contractor Assignment**
- When grievance created, system finds **nearest contractor**
- Priority 1: Same floor contractors (within proximity)
- Priority 2: Nearest contractor from other floors
- Uses Haversine distance formula

### **Quality Control Gate**
- Photos required for verification
- Initial photo (problem) + Resolved photo (solution)
- Admin compares both before approval
- Admin feedback if issues found

### **Smart Email Notifications**
- ✉️ Only sent at critical workflow transitions
- ✉️ Student notified: 1) Confirmation, 2) Approval only (not during work)
- ✉️ Contractor notified: 1) Assignment, 2) Rejection feedback only
- ✉️ Automatic HTML formatted emails

### **Revision Workflow**
- Work can go back to contractor unlimited times
- Feedback provided each rejection
- Contractor can re-work and re-upload
- Process repeats until quality approved

### **Photo Management**
- Initial photo: Student uploads with grievance (optional)
- Resolved photo: Contractor uploads at completion (required)
- Both stored in Cloudinary CDN
- Can be viewed side-by-side for comparison

---

## 🔐 Security & Authorization

```
POST /grievance/add
  ✓ Student: Can create own grievances
  ✗ Contractor: Cannot create grievances

PUT /contractor/grievances/:id/status
  ✓ Contractor: Can only update OWN assigned grievances
  ✗ Student: Cannot update contractor tasks

PUT /admin/grievances/approve/:id
  ✓ Admin: Can approve any grievance
  ✗ Contractor: Cannot approve work
  ✗ Student: Cannot approve

All routes require JWT token from cookies (no Bearer tokens)
```

---

## 📱 Example: Complete User Journey

### **Day 1: 10:00 AM - Student Submits**
```
✓ Student: Scans QR code in bathroom
✓ Student: Fills form "Water leaking from ceiling"
✓ Student: Takes photo of leak
✓ Student: Submits grievance
✓ System: Ticket #GR-240306-001 created
✓ System: Contractor "Rajesh" automatically assigned (5m away, same floor)
✉️ Email to Student: "Grievance submitted, ticket #GR-240306-001"
✉️ Email to Rajesh: "New work assigned, building A floor 2"
```

### **Day 1: 02:00 PM - Contractor Accepts**
```
✓ Rajesh: Views assigned work in app
✓ Rajesh: Updates status to "in-progress"
✓ Rajesh: Arrives at location and assesses damage
✓ Rajesh: Replaces leaking pipe connection
⏱️ No email sent (internal work in progress)
```

### **Day 1: 03:30 PM - Contractor Completes**
```
✓ Rajesh: Fixes completed
✓ Rajesh: Takes "after" photo
✓ Rajesh: Uploads resolved photo
⚙️ AUTOMATIC: Status changes to "done"
⏱️ No email sent (awaiting admin review)
✓ Grievance moved to admin queue
```

### **Day 1: 04:00 PM - Admin Reviews**
```
✓ Admin: Sees pending approval notification 
✓ Admin: Opens grievance details
✓ Admin: Views "before" photo (leak visible)
✓ Admin: Views "after" photo (fixed)
✓ Admin: Reads: "Replaced pipe connection, tested water flow"
✓ Admin: Approves: "Excellent work, no further issues"
⚙️ AUTOMATIC: Status changes to "resolved"
✉️ Email to Student: "Your grievance RESOLVED! Leak has been fixed."
✓ Grievance CLOSED
```

### **Outcome:**
- Student: Satisfied, area fixed, notified only of completion
- Contractor: Credited with completed work
- Admin: Verified quality before student notification
- System: Complete audit trail with photos and timestamps

---

## ⚠️ Alternative: Rejection & Re-work

### **Day 1: 04:00 PM - Admin Rejects**
```
✓ Admin: Reviews photos
✓ Admin: Notices water still dripping
✓ Admin: Rejects: "Leak still present, check connection again"
⚙️ AUTOMATIC: Status back to "in-progress"
✉️ Email to Rajesh: "Work rejected. Leak still present, check connection again."
```

### **Day 1: 04:15 PM - Contractor Re-works**
```
✓ Rajesh: Receives rejection email
✓ Rajesh: Reads feedback
✓ Rajesh: Returns to location
✓ Rajesh: Tightens connection further
✓ Rajesh: Tests thoroughly
✓ Rajesh: Uploads NEW "after" photo
⚙️ AUTOMATIC: Status is "done" again
✓ Back to admin review queue
```

### **Day 1: 04:45 PM - Admin Approves**
```
✓ Admin: Reviews new photo
✓ Admin: Confirms: No leak visible
✓ Admin: Approves: "Perfect, issue fully resolved"
⚙️ AUTOMATIC: Status "resolved"
✉️ Email to Student: "Grievance RESOLVED! Thank you for reporting."
✓ Process complete on second try
```

---

## 📊 Dashboard Views

### **Student View**
```
My Grievances
├─ #GR-240306-001 | Status: RESOLVED ✓
│  ├─ Issue: Water leaking
│  ├─ Location: Building A, Floor 2
│  ├─ Assigned to: Rajesh Kumar
│  ├─ Submitted: Today 10:00 AM
│  └─ Resolved: Today 4:45 PM
│
└─ #GR-240305-024 | Status: IN-PROGRESS 🔄
   ├─ Issue: Electrical outlet broken
   ├─ Location: Building B, Floor 3
   ├─ Assigned to: Priya Singh
   └─ Started: Yesterday 2:00 PM
```

### **Contractor View**
```
My Assigned Work
├─ #GR-240306-001 | Status: RESOLVED ✓ | Approved!
│  ├─ Issue: Water leaking from ceiling
│  ├─ Completed: Today 3:30 PM
│  ├─ Admin Feedback: "Excellent work"
│  └─ Points Earned: +10
│
├─ #GR-240305-024 | Status: IN-PROGRESS 🔄
│  ├─ Issue: Electrical outlet broken
│  ├─ Started: Yesterday 2:00 PM
│  ├─ Your Notes: "Checking outlet wiring"
│  └─ Next: Upload photo when done
│
└─ #GR-240305-015 | Status: APPLIED ⏳
   ├─ Issue: AC not cooling
   ├─ Location: Building C, Floor 1
   └─ Next: Click to accept or view details
```

### **Admin Dashboard**
```
System Statistics
├─ Total Grievances: 156
├─ Status Breakdown:
│  ├─ Applied: 12 (awaiting contractor start)
│  ├─ In-Progress: 34 (contractor working)
│  ├─ Done: 8 (awaiting admin review) ⭐
│  └─ Resolved: 102 (completed)
│
├─ Users:
│  ├─ Contractors: 25
│  ├─ Students: 1200
│  └─ Faculty: 150
│
├─ Resolution Rate: 65%
└─ Avg Time to Resolution: 18 hours

Pending Approvals (8)
├─ #GR-240306-001 | Water leak | Building A Floor 2 [REVIEW]
├─ #GR-240306-002 | Door lock | Building B Floor 1 [REVIEW]
└─ ... 6 more
```

---

## 🚀 Deployment Ready

**All components implemented:**
- ✅ Grievance submission with QR scanning
- ✅ Automatic contractor assignment (geospatial)
- ✅ Photo uploads to Cloudinary
- ✅ Status workflow (applied → in-progress → done → resolved)
- ✅ Email notifications at key transitions
- ✅ Admin review & approval/rejection with feedback
- ✅ Role-based access control
- ✅ Database schema with timestamps
- ✅ Error handling & validation
- ✅ API documentation

**Ready for:**
- Frontend development
- Load testing
- Production deployment
- Student/contractor education
- Admin training
