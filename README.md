# 🎓 EduManage – School Management System

EduManage is a web-based School Management System developed to simplify and organize everyday school administration. It provides a centralized platform to manage students, teachers, classes, subjects, attendance, examinations, results, and fee payments.

## 🚀 Features

- **Dashboard:** Centralized overview of the school management system.
- **Student Management:** Add, view, and manage student records and class assignments.
- **Teacher Management:** Maintain teacher details and records.
- **Class Management:** Create and manage academic classes.
- **Subject Management:** Organize subjects and assign teachers.
- **Attendance Management:** Record and manage student attendance.
- **Examination Management:** Create and manage examinations.
- **Results Management:** Enter student marks and calculate grades.
- **Fee Management:** Generate fee invoices, record payments, and track collected and pending fees.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Next.js | Web application framework |
| React | User interface |
| TypeScript | Programming language |
| Tailwind CSS | UI styling |
| PostgreSQL | Database |
| Prisma ORM | Database management |
| Node.js | Runtime environment |

## 📂 Project Structure

```text
edumanage/
├── app/
│   ├── api/
│   ├── attendance/
│   ├── classes/
│   ├── examinations/
│   ├── fees/
│   ├── results/
│   ├── students/
│   ├── subjects/
│   ├── teachers/
│   ├── components/
│   └── page.tsx
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/akshara07366/CODSOFT_TASKNO.1.git
```

### 2. Open the project folder

```bash
cd CODSOFT_TASKNO.1
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure the database

Install PostgreSQL and create a database for EduManage.

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"
```

Replace the placeholders with your own PostgreSQL credentials and database name.

### 5. Apply database migrations

```bash
npx prisma migrate deploy
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Project Objective

The main objective of EduManage is to provide an organized and user-friendly platform for managing important school activities digitally. It reduces manual record management and brings multiple administrative functions together in one application.

## 👩‍💻 Project Information

**Project Name:** EduManage – School Management System

**Project Type:** Full-Stack Web Application

**Developer:** Akshara Kumari

**GitHub Repository:** [EduManage](https://github.com/akshara07366/CODSOFT_TASKNO.1)

## 🔮 Future Enhancements

- User authentication and role-based access.
- Parent and student portals.
- Automated fee receipts.
- Notifications and announcements.
- Advanced analytics and reporting.
- Online deployment.

---

⭐ If you find this project interesting, feel free to explore the repository!
