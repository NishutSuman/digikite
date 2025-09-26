# DigiKite Client

React frontend application for DigiKite with authentication support.

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **@react-oauth/google** - Google OAuth integration
- **Lottie React** - Animations

## Features

- ✅ Email/Password Authentication
- ✅ Google OAuth Integration
- ✅ Protected Routes
- ✅ Form Validation
- ✅ Responsive Design
- ✅ TypeScript Support
- ✅ Modern Build Pipeline

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Update environment variables:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   └── common/        # Shared components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── pages/             # Page components
├── services/          # API services
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## Authentication Flow

1. **Login Page**: Users can sign in with email/password or Google OAuth
2. **Protected Routes**: Dashboard and other pages require authentication
3. **Token Management**: JWT tokens stored in localStorage
4. **Auto Redirect**: Unauthenticated users redirected to login
5. **User Context**: Global auth state management

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID

## Backend Integration

This frontend connects to the DigiKite server API endpoints:

- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout