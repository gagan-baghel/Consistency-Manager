# Personal Earnings & Sprints Tracker

A Next.js application for tracking weekly earnings and managing 15-day sprints with explicit user separation for Pal and Gagan.

## Features

- 📊 **Weekly Earnings Tracking**: Track earnings across custom date ranges
- 🎯 **15-Day Sprint Management**: Create and manage focused sprint goals
- 👥 **User Separation**: Complete data isolation between Pal and Gagan
- 💾 **MongoDB Persistence**: All data persisted reliably across sessions
- 🔄 **Reliable Persistence**: Earnings and sprints persist in MongoDB with user-safe update rules
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## User Separation

The application supports exactly two predefined users:
- **Pal**
- **Gagan**

Each user has completely isolated data across:
- Weekly earnings
- Active and historical sprints
- Daily execution logs
- Checklists and secondary goals

Switch between users using the persistent selector in the top-right corner.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- npm or pnpm package manager

## Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure MongoDB

Create a `.env.local` file in the project root:

\`\`\`env
MONGODB_URI=your_mongodb_connection_string
\`\`\`

**Option A: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `your_mongodb_connection_string` with your Atlas URI

Example:
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/earnings-tracker?retryWrites=true&w=majority
\`\`\`

**Option B: Local MongoDB**
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/earnings-tracker
\`\`\`

### 3. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

### 4. Open Application

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Switching Users

1. Look for the user selector in the top-right corner
2. Current user is displayed with a user icon
3. Click "Switch to [User]" button to change users
4. All data automatically loads for the selected user

### Weekly Earnings

1. Navigate to the "Weekly Earnings" tab
2. Select your date range using the date selector
3. Click on any week to enter earnings
4. Data saves automatically to MongoDB

### Sprint Management

**Creating a Sprint:**
1. Go to "Active Sprint" tab
2. Click "Start New Sprint"
3. Enter your main goal
4. Add optional secondary goals
5. Sprint is created with 15-day duration

**During a Sprint:**
- Log daily progress in the execution log
- Check off daily execution checkboxes
- Mark secondary goals as complete
- Perform daily sync-ups

**Completing a Sprint:**
- Click "Stop Sprint" to end early
- Mark as "Completed" or "Failed"
- Sprint moves to history

### Sprint History

View all your completed and terminated sprints in the "Sprint History" tab.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with Mongoose ODM
- **UI**: Radix UI components with Tailwind CSS
- **State Management**: React Context API
- **Type Safety**: TypeScript

## Project Structure

\`\`\`
├── app/
│   ├── api/              # API routes
│   │   ├── users/        # User management
│   │   ├── earnings/     # Earnings CRUD
│   │   └── sprints/      # Sprint CRUD
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Main page
├── components/           # React components
│   ├── earnings-tracker.tsx
│   ├── weekly-tracker.tsx
│   ├── sprint-tracker.tsx
│   ├── user-selector.tsx
│   └── ui/               # Reusable UI components
├── contexts/
│   └── UserContext.tsx   # User state management
├── lib/
│   ├── mongodb.ts        # MongoDB connection
│   ├── models/           # Mongoose models
│   │   ├── User.ts
│   │   ├── Earnings.ts
│   │   └── Sprint.ts
│   └── sprint-utils.ts   # Sprint utilities
└── .env.local            # Environment variables
\`\`\`

## API Routes

### Users
- `GET /api/users` - Fetch all users
- `POST /api/users` - Create user

### Earnings
- `GET /api/earnings?userId=Pal` - Fetch user earnings
- `POST /api/earnings` - Create/update earnings
- `DELETE /api/earnings?userId=Pal&weekId=week-1` - Delete earnings

### Sprints
- `GET /api/sprints?userId=Pal&status=active` - Fetch sprints
- `POST /api/sprints` - Create sprint
- `PUT /api/sprints` - Update sprint (`sprintId`, `userId`, `updates`)
- `DELETE /api/sprints?sprintId=sprint-123&userId=Pal` - Delete sprint

## Data Isolation

All data is completely isolated between users:
- Each API call requires a `userId` parameter
- MongoDB queries filter by `userId`
- Frontend components fetch data based on current user
- No shared state or data leakage between users

## Development

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
\`\`\`

## Troubleshooting

### MongoDB Connection Issues

If you see "Please add your MONGODB_URI to .env.local":
1. Ensure `.env.local` exists in project root
2. Verify `MONGODB_URI` is set correctly
3. Check MongoDB connection string is valid
4. Restart the development server

### Data Not Persisting

1. Check browser console for API errors
2. Verify MongoDB connection is active
3. Ensure user is selected in the header
4. Check network tab for failed API calls

## License

MIT

## Support

For issues or questions, please check the browser console for error messages and verify your MongoDB connection.
