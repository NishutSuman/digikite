# Digikite Server

Backend API for **Digikite Infomatrix Technology** - A robust and professional-grade server built with Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Features

- **Modern Tech Stack**: Node.js + Express + JavaScript + Prisma + PostgreSQL
- **Security First**: Helmet, CORS, Rate limiting, JWT authentication
- **Professional Architecture**: Organized folder structure with separation of concerns
- **Database Management**: Prisma ORM with PostgreSQL
- **Environment Configuration**: Comprehensive environment variable management
- **Health Monitoring**: Built-in health check endpoints
- **Error Handling**: Centralized error handling with proper logging
- **Role-based Access**: Support for USER, ADMIN, and SUPER_ADMIN roles

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digikite-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Update the .env file with your database credentials and other configurations
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # (Optional) Seed the database
   npm run db:seed
   ```

## 🚀 Getting Started

### Development Mode
```bash
npm run dev
```

### Production
```bash
npm start
```

### Database Commands
```bash
# Generate Prisma client
npm run db:generate

# Create and apply new migration
npm run db:migrate

# Deploy migrations (production)
npm run db:deploy

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (careful!)
npm run db:reset
```

## 📁 Project Structure

```
digikite-server/
├── src/
│   ├── config/          # Configuration files (database, environment)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, validation, etc.)
│   ├── models/          # Database models and schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── generated/       # Prisma generated files
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── dist/                # Built JavaScript files
├── .env                 # Environment variables
└── package.json
```

## 🔧 API Endpoints

### Health Check
- `GET /api/v1/health` - Comprehensive health check
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/live` - Liveness probe

### Base API
- `GET /api/v1/` - API information and available endpoints

## 🛡️ Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents abuse with configurable limits
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Request validation using express-validator
- **Error Handling**: Secure error responses without sensitive data leakage

## 🗄️ Database Schema

Current models:
- **User**: User management with role-based access (USER, ADMIN, SUPER_ADMIN)
- **Ticket**: Support ticket system with status and priority tracking
- **Payment**: Payment processing and tracking

## 📝 Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/digikite_db"

# Server
NODE_ENV="development"
PORT=3000

# Security
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

## 🧪 Testing

```bash
npm test
```

## 📦 Production Deployment

```bash
npm start
```

## 🐳 Docker Support

*Coming soon - Docker configuration for containerized deployment*

## 📄 License

ISC License - Digikite Infomatrix Technology

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and queries, please contact Digikite Infomatrix Technology.

---

**Built with ❤️ by Digikite Infomatrix Technology**