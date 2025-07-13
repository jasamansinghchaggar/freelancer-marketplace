# Copilot Instructions for Freelancer Marketplace

## Project Architecture
**Full-stack TypeScript application** with React (Vite) frontend and Node.js (Express) backend:
- **Frontend:** `frontend/` - React 19 + TypeScript + Vite + TailwindCSS v4
- **Backend:** `backend/` - Node.js + Express + TypeScript + MongoDB

## Critical Developer Workflows

### Backend Development
```bash
cd backend && npm install  # Install dependencies
npm run dev               # Build TypeScript + start server (port 3000)
npm run build            # TypeScript compilation only
npm start                # Production mode (requires build first)
```

### Frontend Development
```bash
cd frontend && npm install  # Install dependencies  
npm run dev                # Vite dev server (port 5173)
npm run build              # Production build
npm run preview            # Preview production build
```

### Environment Setup
- **Backend:** Requires `.env` with MongoDB URI, JWT secrets, Google OAuth, ImageKit keys
- **Frontend:** Uses `.env` with `VITE_API_BASE_URL=http://localhost:3000`

## Authentication & User Flow Architecture

### Dual Authentication System
1. **Traditional:** Email/password with JWT cookies (`userMiddleware` validates)
2. **Google OAuth:** Passport.js strategy with session-based auth flow

### User States & Role-Based Access
- **Roles:** `"guest"` (Google signup) → `"client"` or `"freelancer"` (after profile completion)
- **Profile completion flow:** Google users start as `role: "guest"` → must complete profile with password
- **Route protection:** Uses `requireRole()` and `requireAuth` middlewares in `backend/src/middlewares/`

### Key Auth Patterns
```typescript
// Backend JWT middleware pattern
export const userMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction)

// Frontend protected routes pattern  
<ProtectedRoute><Component /></ProtectedRoute>

// Frontend auth context usage
const { user, login, signup, loginWithGoogle, logout } = useAuth();
```

## Data Flow & API Patterns

### Backend MVC Structure
- **Controllers** (`controllers/`) handle HTTP requests/responses
- **Services** (`services/`) contain business logic and DB operations  
- **Routes** (`routes/`) map endpoints to controllers with middleware
- **Models** (`models/`) define Mongoose schemas

### Frontend State Management
- **AuthContext** manages user state globally via React Context
- **API Layer:** `services/api.ts` exports organized API functions
- **HTTP Client:** `utils/apiClient.ts` - Axios instance with interceptors and `withCredentials: true`

### Critical Integration Patterns
```typescript
// Backend: Cookie-based JWT auth
res.cookie("token", token, cookieOptions);

// Frontend: Automatic credential handling
const apiClient = axios.create({ withCredentials: true });

// Google OAuth redirect flow
loginWithGoogle = () => window.location.href = 'http://localhost:3000/auth/google';
```

## ImageKit Integration for File Uploads
- **Config:** `backend/src/configs/imageKit.config.ts`
- **Service:** `uploadImageToImageKit()` in `gigs.service.ts`
- **Controller pattern:** Multer middleware → ImageKit upload → store fileId + URL in MongoDB
- **Cleanup:** Automatic deletion of previous images on update/delete

## Project-Specific Conventions

### TypeScript Patterns
- **Backend:** CommonJS modules, strict types, Zod validation schemas
- **Frontend:** ES modules, React FC components, interface definitions for API responses

### File Organization
- **Feature-based:** Each domain (user, gig, auth) has dedicated controller/service/route/model files
- **Shared utilities:** JWT, password hashing, database connection in `utils/`
- **Environment-specific:** Development uses compilation + restart, production uses pre-built dist/

### Error Handling & Validation
- **Backend:** Zod schemas in `validations/`, consistent error response format
- **Frontend:** Axios interceptors for error handling, loading states in components

---

**Essential for new features:** Follow the MVC pattern (model → service → controller → route), add proper TypeScript types, implement role-based access control where needed.
