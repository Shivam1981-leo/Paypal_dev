# PayGuard AI - Backend

Pre-Authorization Risk Intelligence Platform Backend API

## 🚀 Quick Start

### Prerequisites
- Node.js 22.11+ (LTS)
- PostgreSQL 17+
- Redis 7.4+
- PayPal Developer Account

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PAYPAL_CLIENT_ID` - From PayPal Developer Dashboard
- `PAYPAL_SECRET` - From PayPal Developer Dashboard
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`

### 3. Database Setup
```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Drizzle Studio to view database
npm run db:studio
```

### 4. Start Development Server
```bash
npm run dev
```

Server will start at: `http://localhost:3001`

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:seed` | Seed database with test data |
| `npm test` | Run tests |
| `npm run test:paypal` | Test PayPal integration |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |

## 🧪 Testing PayPal Integration

```bash
npm run test:paypal
```

This will:
1. Authenticate with PayPal
2. Create a test order
3. Retrieve order details
4. Verify the integration works

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── db/              # Database schema & migrations
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── tests/               # Test files
├── scripts/             # Utility scripts
└── package.json
```

## 🔧 Tech Stack

- **Framework:** Fastify 5.1.0
- **ORM:** Drizzle ORM 0.38.0
- **Database:** PostgreSQL 17
- **Cache:** Redis 7.4
- **Search:** Elasticsearch 8.16
- **Validation:** Zod 3.24.0
- **Auth:** Fastify JWT 9.0.0
- **Language:** TypeScript 5.7.0
- **Runtime:** Node.js 22.11.0 LTS

## 🌐 API Endpoints

### Health Check
```
GET /health
```

### Root
```
GET /
```

## 📝 Next Steps

1. ✅ Set up PayPal Developer Account
2. ✅ Configure environment variables
3. ✅ Run database migrations
4. ✅ Test PayPal integration
5. ⏳ Implement authentication routes
6. ⏳ Build transaction routes
7. ⏳ Add webhook handlers
8. ⏳ Implement risk check endpoint

## 🐛 Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env`
- Verify database exists: `psql -l`

### PayPal Authentication Failed
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`
- Ensure using sandbox credentials for development
- Check PayPal Developer Dashboard

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

## 📚 Resources

- [Fastify Documentation](https://fastify.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PayPal API Documentation](https://developer.paypal.com/docs/api/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Status:** 🚧 In Development (Week 1)  
**Last Updated:** 2026-11-04
