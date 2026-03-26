# Smart Campus Management - Backend

Backend API for Smart Campus Management & Predictive Analytics Platform.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file with:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## Seeding Database

To populate the database with sample resources:

```bash
node seed.js
```

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (requires auth)

### Resource Endpoints

- `GET /resources` - Get all resources
- `GET /resources/:id` - Get single resource
- `POST /resources` - Create resource (admin only)
- `PUT /resources/:id` - Update resource (admin only)
- `DELETE /resources/:id` - Delete resource (admin only)

### Booking Endpoints

- `POST /bookings/create` - Create booking
- `GET /bookings/user/:userId` - Get user bookings
- `GET /bookings/all` - Get all bookings (admin/faculty)
- `PUT /bookings/cancel/:id` - Cancel booking
- `POST /bookings/check-availability` - Check availability

### Analytics Endpoints

- `GET /analytics/usage` - Usage analytics
- `GET /analytics/peak-hours` - Peak hours data
- `GET /analytics/top-resources` - Most used resources
- `GET /analytics/underutilized` - Underutilized resources
- `GET /analytics/stats` - Booking statistics

## Technologies

- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs
- CORS enabled
