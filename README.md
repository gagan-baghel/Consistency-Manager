# Personal Earnings & Sprints Tracker

![App Screenshot](./public/appScreenshot.png)

A high-performance Next.js application designed for tracking weekly earnings and managing 15-day sprints. Featuring explicit user separation, it serves as a dual-tenant tracker for users "Lucky" and "Gagan" with complete data isolation.

## ✨ Features

- 📊 **Weekly Earnings Tracking**: Monitor and log earnings across custom date ranges.
- 🎯 **15-Day Sprint Management**: Define, track, and accomplish focused sprint goals.
- 👥 **Strict User Separation**: Complete data isolation between tenants "Lucky" and "Gagan".
- 💾 **Reliable Persistence**: All data is securely stored in MongoDB with user-safe update rules.
- 📱 **Responsive UI**: A fluid experience built with Tailwind CSS, functional across desktop and mobile devices.

---

## 👥 User Separation
The application currently supports two predefined users:
- **Lucky**
- **Gagan**

Each user maintains an exclusively isolated state across their:
- Weekly earnings matrix
- Active and historical sprint records
- Daily execution and habit logs
- Checklists and secondary goals

> **Pro Tip:** Switch between users instantly using the persistent selector located in the top-right corner of the navigation bar.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB database (Local instance or MongoDB Atlas)
- npm or pnpm package manager

### 1. Installation

Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Configure the Database
Create a `.env.local` file in the root of your project:
```env
MONGODB_URI=your_mongodb_connection_string
```

**Using MongoDB Atlas (Recommended):**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Deploy a new cluster and acquire your connection string.
3. Replace `your_mongodb_connection_string` in your `.env.local` file.
*(Example: `mongodb+srv://user:pass@cluster.mongodb.net/earnings-tracker?retryWrites=true&w=majority`)*

**Using Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/earnings-tracker
```

### 3. Start Development Server
Boot up the local development environment:
```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage Guide

### Switching Users
1. Locate the user selector in the top-right corner.
2. The current active user is displayed alongside a user icon.
3. Click "Switch to [User]" to change contexts. All data will instantly adapt to the newly selected user.

### Logging Weekly Earnings
1. Navigate to the **Weekly Earnings** tab.
2. Select your date range using the calendar selector.
3. Click on any week row to input or edit your earnings.
4. Data saves automatically to the MongoDB instance.

### Sprint Management
**Creating a New Sprint:**
1. Navigate to the **Active Sprint** tab and click **Start New Sprint**.
2. Enter your primary sprint goal and any optional secondary goals.
3. The sprint initiates with a rigorous 15-day countdown duration.

**During an Active Sprint:**
- Log your daily progress in the execution log.
- Track daily execution metrics via checkboxes.
- Complete and tick off secondary goals as you progress.
- Record key notes during daily sync-ups.

**Wrapping up a Sprint:**
- You can end a sprint early by clicking **Stop Sprint**.
- Finalize the sprint by marking it as either **Completed** or **Failed**.
- The sprint record automatically archives to your Sprint History.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: [MongoDB](https://www.mongodb.com/) powered by [Mongoose](https://mongoosejs.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **State Management**: React Context API
- **Type Safety**: TypeScript

---

## 📁 Project Structure highlights
```text
├── app/
│   ├── api/              # Core API routes (users, earnings, sprints)
│   ├── layout.tsx        # Root layout with global providers
│   └── page.tsx          # Main entry route
├── components/           # React tracking and UI components
├── contexts/             # User state management layer
├── lib/
│   ├── mongodb.ts        # Database connection logic
│   ├── models/           # Mongoose schemas (User, Earnings, Sprint)
│   └── sprint-utils.ts   # Core business logic for sprints
└── .env.local            # Environment configuration
```

---

## 🛡 API Endpoints

### Users
- `GET /api/users` - Fetch all users
- `POST /api/users` - Create a new user

### Earnings
- `GET /api/earnings?userId=[ID]` - Fetch user-specific earnings
- `POST /api/earnings` - Create or update earnings
- `DELETE /api/earnings?userId=[ID]&weekId=[ID]` - Delete an earning record

### Sprints
- `GET /api/sprints?userId=[ID]&status=active` - Fetch active user sprints
- `POST /api/sprints` - Spin up a new sprint
- `PUT /api/sprints` - Update sprint payload (`sprintId`, `userId`, `updates`)
- `DELETE /api/sprints?sprintId=[ID]&userId=[ID]` - Terminate a sprint

---

## ⚠️ Troubleshooting

**MongoDB Connection Issues:**
If you encounter a `"Please add your MONGODB_URI to .env.local"` error:
1. Ensure `.env.local` exists in the exact root folder.
2. Verify the `MONGODB_URI` string is pasted correctly.
3. Restart the `npm run dev` server.

**Data Not Persisting:**
1. Check the browser's developer console for API rejection errors.
2. Ensure the MongoDB cluster is active and your network IP is whitelisted.
3. Confirm a user is actively selected in the application header.

---
**License:** MIT
