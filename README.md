# Blogify Backend

A RESTful API backend for a blogging platform built with Node.js, Express, and MongoDB. This project implements a Medium/blog-like system where users can create articles, follow other users, favorite articles, and comment on content.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Other**: Cookie-based auth with HTTP-only cookies

## Features

- **User Authentication**
  - Register, login, and logout functionality
  - JWT-based authentication with refresh tokens
  - Secure HTTP-only cookies
  
- **User Profiles**
  - View user profiles
  - Follow/unfollow users
  - Update user information
  
- **Articles**
  - Create, read, update, and delete articles
  - Auto-generation of SEO-friendly slugs
  - Tag articles with categories
  - Favorite/unfavorite articles
  
- **Comments**
  - Add comments to articles
  - View comments on articles
  - Delete comments (author only)
  
- **Tags**
  - List all unique tags used in articles
  
## Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd blogify-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory (see Environment Variables section below)

4. Start the server:
   ```
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# MongoDB Connection String
MONGODB=mongodb+srv://username:password@cluster.example.mongodb.net/?retryWrites=true&w=majority&appName=yourAppName

# JWT Secrets (generate strong random strings)
JWT_SECRET=your_jwt_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Node Environment
NODE_ENV=development
```

For production, set `NODE_ENV=production`

## API Endpoints

### Authentication
- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login
- `POST /api/users/logout` - Logout
- `POST /api/user/refresh-token` - Refresh access token

### User
- `GET /api/user` - Get current user
- `PUT /api/user` - Update user information

### Profiles
- `GET /api/profiles/:username` - Get a user's profile
- `POST /api/profiles/:username/follow` - Follow/unfollow a user

### Articles
- `GET /api/articles` - List all articles
- `GET /api/articles/:id` - Get a single article
- `POST /api/articles` - Create an article
- `PUT /api/articles/:id` - Update an article
- `DELETE /api/articles/:id` - Delete an article
- `POST /api/articles/:id/favorite` - Favorite/unfavorite an article

### Comments
- `GET /api/articles/:id/comments` - Get comments for an article
- `POST /api/articles/:id/comments` - Add a comment to an article
- `DELETE /api/articles/:id/comments/:commentId` - Delete a comment

### Tags
- `GET /api/tags` - Get all tags

## CORS Configuration

The API includes CORS configuration to handle cross-domain requests. By default, it accepts requests from:
- `https://playground-038-frontend.vercel.app`
- `http://localhost:5173`

To add more allowed origins, edit the `config/allowedOrigins.js` file.

## Deployment

This project is configured for deployment on Vercel using the included `vercel.json` configuration file, which routes all requests to the API entry point.

## Error Handling

The API uses express-async-handler for clean error handling. All controllers are wrapped with this middleware to catch exceptions and send appropriate error responses.

## Models

The application includes the following data models:
- User
- Article
- Comment
- Tag

## Security Features

- Password hashing with bcrypt
- HTTP-only cookies for token storage
- JWT token verification
- Cross-Origin Resource Sharing (CORS) protection
- Production/development environment-specific security settings

