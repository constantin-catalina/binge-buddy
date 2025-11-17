# BingeBuddy 🎬

A full-stack web application for tracking your favorite movies and TV shows, managing your watchlist, and monitoring your viewing progress across all devices.

## Description

BingeBuddy is your go-to platform to track your favorite shows, discover new content, and connect with fellow binge watchers. The application allows users to:

- **Browse & Discover**: Explore trending movies and TV shows with advanced filtering options
- **Track Progress**: Monitor your viewing history with detailed statistics and progress tracking
- **Manage Watchlist**: Create and manage your personal watchlist across devices
- **User Dashboard**: View comprehensive stats including watch time, episodes watched, and monthly reviews
- **Admin Panel**: Full CRUD operations for managing shows and users
- **Cross-Device Sync**: Keep your watch history synced across all devices

## Technologies Used

### Frontend
- React (with Vite)
- React Router
- Tailwind CSS
- Clerk (authentication)
- Lucide React (icons)
- Sonner (toast notifications)
- TypeScript (API utilities)

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Clerk Express (authentication middleware)
- Inngest (background job processing)
- TMDB API (movie/TV show data)
- Axios (HTTP requests)

## Project Structure

```
project/
├── backend/
│   ├── configs/
│   ├── controllers/
│   ├── inngest/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── vercel.json
└── frontend/
    ├── public/
    ├── src/
    ├── .env
    ├── package.json
    ├── vercel.json
    └── vite.config.js
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Clerk Account
- TMDB API Key

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```
MONGODB_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
TMDB_API_KEY=your_tmdb_api_key
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Running the Application

### Development Mode

**Start the backend server:**

```bash
cd backend
npm start
```

**Start the frontend development server:**

```bash
cd frontend
npm run dev
```

## Key Features

- Browse Movies & TV Shows
- Search
- Watchlist Management
- Progress Tracking
- User Dashboard
- Responsive Design

## API Endpoints

- Public: `/api/show/movies`, `/api/tv/shows`, `/api/search`, `/api/discover`
- Protected: `/api/watchlist`, `/api/progress`, `/api/stats/month`
- Admin: `/api/admin/summary`, `/api/admin/shows`, `/api/admin/users`

## Environment Variables

### Backend
- MONGODB_URI
- CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- TMDB_API_KEY

### Frontend
- VITE_API_URL
- VITE_CLERK_PUBLISHABLE_KEY

## License

This project is licensed under the MIT License.