# 📢 LNMIIT Grievance Portal

The **LNMIIT Grievance Portal** is a digital platform built to streamline the process of lodging and addressing grievances within The Laxmi Niwas Mittal Institute of Information Technology (LNMIIT). It enables students and faculty to raise concerns, track their status, and receive timely responses from the appropriate authorities — all in one place.

This portal promotes a culture of transparency, accountability, and efficient communication between stakeholders, helping resolve issues in a timely and structured manner.

---

## 🎯 Purpose

- 🛠️ **Streamline grievance redressal** through a centralized platform.
- 🔄 **Eliminate manual or paper-based complaint handling** processes.
- 🧭 **Ensure faster routing and resolution** of student issues.
- 📬 **Keep users informed** with real-time updates and notifications.
- ✅ **Establish a transparent chain of responsibility** from submission to resolution.

---

## ⏱️ Response & Resolution Timeline (SLA)

To ensure timely handling, each grievance follows a predefined **Service Level Agreement (SLA)**:

- ⌛ **Initial Response Time**:  
  Office Bearers must respond within some amount of time after grievance submission(depends on urgency of the grievance).

- 🕒 **Resolution Time**:  
  Approving Authorities must act on grievances within the resolution time.

- ⚠️ **Escalation Policy**:  
  If a grievance is not responded to or resolved within the SLA limits, it is **automatically escalated** to the next higher level:
  - If Office Bearer delays, grievance is escalated to Approving Authority.
  - If Approving Authority delays, grievance is escalated to Admin.

This system ensures **accountability** and avoids grievance stagnation.

---

## 👥 User Roles and Access

The system supports a clear **role-based hierarchy** with tailored dashboards and permissions:

- 👨‍🎓 **Student**:  
  - Submit new grievances under defined categories and departments.  
  - Attach supporting documents or screenshots.  
  - Track status in real-time using Ticket ID.  
  - View resolution and admin remarks.

- 🧑‍💼 **Office Bearer**:  
  - View grievances submitted in their department.  
  - Assign the grievances to the workers in their department.
  - Can manually send the greivance to the Approving Authority, or in case of SLA breach, it automatically escalates to higher level.
  - Can add new workers in their department.

- 🧑‍⚖️ **Approving Authority**:  
  - In case of SLA breach, the Approving Authority reverts back to the office bearer with a note and a new deadline.
  - In case of manual escalation by the Office Bearer, the Approving Authority adds a note, a new deadline and sends it back to the Office Bearer.
  - Can add new Office Bearers in their department.

- 👨‍💻 **Admin**:  
  - Manage departments, roles, and access levels.  
  - Oversee the entire grievance flow and maintain records.  
  - View analytics and system logs.  
  - Handle escalated issues from any level.

---

## 🔐 Key Features

- 🔒 **OTP-based login** for secure access and identity verification.
- 🗂️ **Categorized grievances** for targeted redressal (e.g., hostel, academics, mess).
- 📎 **File upload support** for evidence/document attachments.
- ✉️ **Email notifications** on submission, updates, and resolution.
- 🧾 **Unique Ticket ID generation** for each grievance.
- 🧑‍🤝‍🧑 **Multi-role support** for staff with dual roles.
- 🚨 **Auto-escalation of unresolved grievances** beyond SLA deadlines.
- 📊 **Admin dashboard** with summaries, filters, and user management tools.

---

## 🏛️ Departments Covered

Grievances can be raised under multiple institutional units, including:

- Academics  
- Hostel Affairs  
- Mess & Food Services  
- IT Support  
- General Administration  
- Student Affairs  
- Infrastructure & Facilities  

Departments can be modified or added based on institutional structure.

---

## 💡 Why This Matters

- Encourages **proactive problem-solving** instead of offline complaint queues.
- Reduces chances of **miscommunication and lost follow-ups**.
- Builds **student trust** in the institutional response system.
- Helps the administration **track and analyze trends** in student issues.
- Ensures **timely responses and accountability** through defined escalation policies.

---

## 🛠️ Tech Stack (Overview)

- **Frontend**: React.js, Tailwind CSS, Axios  
- **Backend**: Node.js, Express.js, JWT Auth, Sequelize ORM  
- **Database**: MySQL  
- **Email & OTP Services**: Nodemailer  
- **Media Uploads**: ImageKit API  
- **Other Tools**: dotenv, bcrypt, role-based middleware

---

## 📌 Note

This platform is built specifically for internal use at LNMIIT and is adaptable for other institutions with similar grievance redressal hierarchies.
