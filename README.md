# Freelancer Marketplace

## About

Freelancer Marketplace is a full-stack web application that connects clients with freelancers. Users can browse and purchase services (gigs), offer their own services, manage projects, and communicate in real-time. The platform provides a seamless experience for both service providers and buyers to collaborate and complete projects efficiently.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: Passport.js (JWT, OAuth2 Google)
- **File Management**: ImageKit
- **Email Service**: SMTP-based email service
- **Build Tool**: TypeScript Compiler (tsc)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Component Library**: Shadcn/ui
- **Real-time Communication**: Socket.io
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Deployment**: Vercel

### Development & Testing
- **Linting**: ESLint
- **Code Formatting**: ESLint configuration

## Features

### User Management
- User registration and authentication (Email & Google OAuth)
- Profile management with role-based access (Client, Freelancer, Admin)
- Password reset and recovery via email
- Secure JWT-based authentication

### Gig Management
- Browse and search gigs with category filters
- Create and manage gigs (freelancers)
- Gig details with pricing and descriptions
- Predefined categories for easy organization

### Purchasing & Orders
- Purchase gigs with secure payment handling
- Order/purchase history tracking
- Purchase management and status updates

### Real-time Messaging
- One-to-one chat functionality
- Real-time message delivery using WebSockets
- Message and chat history
- Unread message notifications

### Category Management
- Predefined service categories
- Easy gig categorization and filtering

### Image Management
- Image upload and validation
- Integration with ImageKit for optimized image delivery

### User Roles & Permissions
- Role-based middleware for access control
- Different features for clients and freelancers.

Made with love.!
