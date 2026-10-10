# 🎓 Student Feedback About Faculty System (PERN Stack)

A complete **PERN Stack** (*PostgreSQL, Express.js, React.js, Node.js*) application for collecting anonymous student feedback and generating consolidated faculty evaluation reports with **Mode Rating Calculations**, 5s-1s frequency distributions, and admin controls for MCA Semesters 1, 2, 3, and 4.

---

## 🌟 Features

1. **Anonymous Student Feedback Portal**:
   - MCA Semester Selection (MCA 1, MCA 2, MCA 3, MCA 4).
   - Dynamic subject & faculty load matching your institute's paper form.
   - Evaluates **Quality of Teaching** (5 criteria), **Courses** (4 criteria), **General Yes/No Questions**, and **Remarks**.
   - 100% Anonymous (no name or roll number recorded).

2. **Admin Control Center**:
   - **Faculty Management**: Add, Edit, and Delete faculty members (e.g. Dr. Divya Chowdhry, Mrs. Priya Chopra Arora, Mr. Pawan Omer, etc.).
   - **Subject Mapping**: Map subjects to MCA Semesters and assign faculty members.
   - **Consolidated Evaluation & Mode Rating Reports**:
     - Calculates **MODE Rating** (most frequent rating score given by students for each question parameter).
     - Calculates rating frequency breakdown (count of 5s, 4s, 3s, 2s, 1s) and Average Rating Scores.
     - Calculates Yes/No satisfaction percentages.
     - Includes a **"Print / Save PDF Report"** button formatted to match physical institute reports.

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js installed (v18+ recommended)
- PostgreSQL (Optional: if installed, it connects to PostgreSQL database; if PostgreSQL is not running, it automatically uses the local database engine seamlessly!)

### Step 1: Install Dependencies
Open terminal in the project folder and run:
```bash
npm install
```

### Step 2: Start Backend Server
```bash
npm run server
```
*Backend API runs at:* `http://localhost:5000`

### Step 3: Start React Frontend
In a new terminal window:
```bash
npm run dev
```
*Frontend runs at:* `http://localhost:3000`

---

## 🔑 Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
