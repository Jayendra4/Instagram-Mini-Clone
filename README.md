# Instagram Mini Clone

A full-stack Instagram-like social media application built with React and Node.js.

## Features

- User authentication (Sign up, Login)
- Create and share posts with images
- Like and comment on posts
- Follow/Unfollow users
- User profiles
- Feed with posts from followed users

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- bcryptjs

## Project Structure

```
instagram Mini Clone/
├── Backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── post.js
│   ├── server.js
│   └── package.json
├── frontend/
│   └── react-ui/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   └── pages/
│       ├── package.json
│       └── vite.config.js
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Backend directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/instagram_clone
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend/react-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/follow/:id` - Follow a user
- `POST /api/auth/unfollow/:id` - Unfollow a user
- `GET /api/auth/profile/:id` - Get user profile

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/feed` - Get feed posts
- `GET /api/posts/user/:userId` - Get user posts
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id/like` - Like a post
- `PUT /api/posts/:id/unlike` - Unlike a post
- `POST /api/posts/:id/comment` - Add comment
- `DELETE /api/posts/:id` - Delete a post

## Usage

1. Start MongoDB if running locally
2. Start the backend server
3. Start the frontend development server
4. Open `http://localhost:5173` in your browser
5. Sign up for a new account or login
6. Start creating posts and interacting with the app

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Notes

- Make sure MongoDB is running before starting the backend
- The app uses JWT tokens for authentication
- Images are stored as URLs (no local file upload)
- CORS is enabled for all origins in development

