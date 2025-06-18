# E-Commerce Backend API Documentation

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Authentication & Authorization](#authentication--authorization)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [File Upload](#file-upload)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)

## Overview

This is a robust e-commerce backend API built with Node.js and Express.js, featuring role-based access control, product management, category management, and wishlist functionality. The system supports three user types: regular users, admins, and super admins.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer
- **Input Validation**: Custom middleware
- **Error Handling**: Custom error classes and middleware
- **Logging**: Custom logging utility

## Project Structure

```
backend/
├── logs/              # Application logs
│   ├── combined.log     # Combined logs from all sources
│   ├── error.log       # Error-specific logs
│   ├── exceptions.log  # Exception and crash logs
│   └── rejections.log  # Promise rejection logs
├── node_modules/     # Node.js dependencies
├── src/             # Source code
│   ├── app.js         # Express app configuration
│   ├── server.js      # Server entry point
│   ├── config/        # Configuration files
│   │   ├── cloudinary.js
│   │   └── upload.js
│   ├── controllers/   # Route controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   └── wishlistController.js
│   ├── middlewares/   # Custom middlewares
│   │   ├── authMiddleware.js
│   │   ├── checkProductOwnership.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/       # Mongoose models
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── User.js
│   │   └── Wishlist.js
│   ├── routes/       # API routes
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── category.js
│   │   ├── product.js
│   │   └── wishlist.js
│   ├── services/     # Business logic
│   │   ├── adminService.js
│   │   └── productService.js
│   ├── utils/        # Utility functions
│   │   ├── asyncHandler.js
│   │   ├── errors.js
│   │   └── logger.js
│   └── validations/  # Input validation schemas
│       ├── adminValidations.js
│       └── productValidations.js
├── uploads/         # File upload directory
├── .env            # Environment variables
├── .gitignore      # Git ignore configuration
├── package.json    # Project dependencies and scripts
└── package-lock.json # Locked dependencies versions
```

## Authentication & Authorization

### User Types

1. **Regular Users**

   - Can create, update, and delete their own products
   - Can manage their wishlist
   - Can view all products and categories

2. **Admins**

   - All regular user permissions
   - Can delete any product
   - Can manage categories (CRUD operations)
   - Can delete users

3. **Super Admins**
   - All admin permissions
   - Can manage other admins (create, update, delete)
   - Cannot be deleted by other admins

### Authentication Flow

- JWT-based authentication
- Access tokens with configurable expiration
- Protected routes using `authMiddleware`
- Role-based access control using `restrictTo` middleware

## Features

### User Management

- User registration with validation
- Secure password hashing using bcrypt
- Login with JWT token generation
- Role-based permissions
- Admin management by super admins

### Product Management

- CRUD operations for products
- Product ownership validation
- Pagination support
- Category association
- Search and filter capabilities

### Category Management

- Hierarchical category structure
- CRUD operations for categories
- Parent-child relationship
- Category validation
- Admin-only access

### Wishlist System

- Add/remove products to wishlist
- View wishlist items
- User-specific wishlists
- Wishlist item validation

### Admin Features

- User management
- Product moderation
- Category management
- Admin user management (super admin only)

## API Endpoints

### Authentication

```
POST /api/auth/register     # Register new user
POST /api/auth/login        # User login
```

### Products

```
GET    /api/products        # Get all products (with pagination)
POST   /api/products        # Create new product
GET    /api/products/:id    # Get single product
PUT    /api/products/:id    # Update product
DELETE /api/products/:id    # Delete product
```

### Categories

```
GET    /api/categories      # Get all categories
POST   /api/categories      # Create category (admin)
PUT    /api/categories/:id  # Update category (admin)
DELETE /api/categories/:id  # Delete category (admin)
```

### Admin Routes

```
GET    /api/admin/users     # Get all users (admin)
DELETE /api/admin/users/:id # Delete user (admin)
GET    /api/admin/admins    # Get all admins (super_admin)
POST   /api/admin/admins    # Create admin (super_admin)
PUT    /api/admin/admins/:id # Update admin (super_admin)
DELETE /api/admin/admins/:id # Delete admin (super_admin)
```

### Wishlist

```
GET    /api/wishlist       # Get user's wishlist
POST   /api/wishlist/:id   # Add product to wishlist
DELETE /api/wishlist/:id   # Remove from wishlist
```

## Error Handling

- Custom error classes for different types of errors
- Centralized error handling middleware
- Consistent error response format
- Detailed error messages in development
- Sanitized error messages in production

## File Upload

- Multer middleware for handling multipart/form-data
- File type validation
- File size limits
- Automatic cleanup of unused files

## Database Schema

### User Schema

```javascript
{
  username: String,
  email: String,
  password: String,
  type: Enum['user', 'admin', 'super_admin'],
  name: String
}
```

### Product Schema

```javascript
{
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: ObjectId,
  user: ObjectId
}
```

### Category Schema

```javascript
{
  name: String,
  parent: ObjectId,
  level: Number
}
```

### Wishlist Schema

```javascript
{
  user: ObjectId,
  products: [ObjectId]
}
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository

```bash
git clone <repository-url>
```

2. Install dependencies

```bash
cd backend
npm install
npm start
```

```bash
cd frontend
npm install
npm start
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Environment Variables

```
PORT=4000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## Security Features

- Password hashing with bcrypt
- JWT token validation
- Request rate limiting
- Input validation and sanitization
- Secure headers with helmet
- CORS configuration
- File upload validation
- Error message sanitization in production

## Best Practices Implemented

- MVC architecture
- Service layer pattern
- Middleware-based authentication
- Centralized error handling
- Input validation
- Async/await with proper error handling
- Environment-based configurations
- Modular and maintainable code structure
- Comprehensive logging system
- Scalable file structure

## Logging System

The application implements a comprehensive logging system that tracks various types of events and stores them in separate log files:

### Log Files Structure

```
logs/
├── combined.log    # Combined logs from all sources
├── error.log      # Error-specific logs
├── exceptions.log # Exception and crash logs
└── rejections.log # Promise rejection logs
```

### Logging Features

- **Combined Logging**:

  - All application logs in one file
  - Includes info, warnings, and errors
  - Timestamp for each entry
  - Request details and responses

- **Error Logging**:

  - Application errors
  - Database errors
  - Validation errors
  - Authentication failures

- **Exception Logging**:

  - Uncaught exceptions
  - Critical system errors
  - Stack traces
  - Error context information

- **Promise Rejection Logging**:
  - Unhandled promise rejections
  - Async operation failures
  - API call failures
  - Database query failures

### Log Management

- Automatic log creation
- Log level filtering
- Timestamp-based entries
- JSON formatted logs for easy parsing
