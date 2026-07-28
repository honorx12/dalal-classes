# LeadDesk Mini

A full-stack lead capture application built with React, Supabase, and WebGL animations.

## Overview

LeadDesk Mini is a lead management system featuring:
- **Public Landing Page**: Animated lead capture form with validation
- **Admin Dashboard**: Secure lead management with status tracking
- **Real Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: JWT-based session management
- **Liquid Chrome Animation**: Custom WebGL shader background

## Live URLs

- **Landing Page**: `/` (Home)
- **Admin Dashboard**: `/admin`
- **Test Admin Credentials**: (Create via Supabase auth)

## Data Model

### Leads Table

```sql
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- Lead's full name
  email TEXT NOT NULL,                   -- Contact email (validated)
  budget_range TEXT NOT NULL,            -- Selected budget tier
  message TEXT NOT NULL,                 -- Project description
  status TEXT DEFAULT 'new'              -- Workflow status
    CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Budget Range Values:**
- `under-5k`: Under $5,000
- `5k-10k`: $5,000 - $10,000
- `10k-25k`: $10,000 - $25,000
- `25k-50k`: $25,000 - $50,000
- `50k-plus`: $50,000+

**Status Workflow:**
1. `new` → Default status when lead is submitted
2. `contacted` → Admin has reached out
3. `closed` → Lead is won, lost, or no longer active

### Indexes

- `idx_leads_status`: For filtering by status
- `idx_leads_created_at`: For chronological ordering
- `idx_leads_email`: For email lookups

### Row Level Security (RLS)

**Policies:**
1. **INSERT**: Anyone can submit leads (public form)
2. **SELECT**: Only admins can view leads
3. **UPDATE**: Only admins can update leads
4. **DELETE**: Only admins can delete leads

## Authentication Approach

### Session Management

We use **Supabase Auth** with JWT-based sessions:

1. **Login Flow**:
   - User submits email/password
   - Supabase validates credentials
   - Returns JWT access token + refresh token
   - Tokens stored in memory (not localStorage for security)

2. **Session Persistence**:
   - Access token: Short-lived (1 hour)
   - Refresh token: Long-lived (7 days)
   - Auto-refresh handled by Supabase client

3. **Admin Verification**:
   - After login, check user's role in `profiles` table
   - Only users with `role = 'admin'` can access dashboard
   - Role check enforced on both client and server (RLS)

### Security Features

- **Password hashing**: bcrypt (handled by Supabase)
- **CSRF protection**: Built into Supabase Auth
- **Secure headers**: XSS protection, content-type nosniff
- **RLS policies**: Database-level access control
- **Input validation**: Client-side + server-side

## Architecture

### Frontend Stack

- **React 18**: Component-based UI
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations and transitions
- **Zustand**: State management

### Custom Components

#### LiquidChrome

A WebGL-based liquid metal chrome background effect using:
- **Fragment Shader**: Real-time noise generation with Simplex noise
- **FBM (Fractal Brownian Motion)**: Layered noise for organic flow
- **Mouse Interaction**: Subtle distortion following cursor
- **Color Blending**: Three-color gradient mixing

```jsx
<LiquidChrome 
  intensity={0.4}      // Noise distortion strength
  speed={0.25}         // Animation speed
  color1="#7C3AED"     // Primary color
  color2="#06B6D4"     // Secondary color  
  color3="#D946EF"     // Accent color
/>
```

### Backend Stack

- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Relational database
- **Row Level Security**: Fine-grained access control

## Project Structure

```
src/
├── components/
│   └── LiquidChrome.jsx      # WebGL background animation
├── pages/
│   ├── LeadCapturePage.jsx   # Public lead form
│   └── AdminDashboard.jsx    # Admin lead management
├── store/
│   └── useAuthStore.js       # Authentication state
├── lib/
│   └── supabaseClient.js     # Database client
└── App.jsx                   # Router configuration

supabase/
└── migrations/
    └── 005_leads_table.sql   # Database schema
```

## Form Validation

### Client-Side

- **Name**: Minimum 2 characters, required
- **Email**: Valid email format (regex), required
- **Budget**: Must select from dropdown, required
- **Message**: Minimum 10 characters, required

### Server-Side

- Same validations applied via CHECK constraints
- SQL injection prevention via parameterized queries
- XSS prevention via HTML encoding

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env file:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Run migrations
# Apply 005_leads_table.sql in Supabase SQL Editor

# Start dev server
npm run dev
```

### Database Setup

1. Create a Supabase project
2. Run migration: `supabase/migrations/005_leads_table.sql`
3. Create admin user:
   ```sql
   -- Create user via Supabase Auth UI
   -- Then update role:
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
   ```

## Deployment

### Build

```bash
npm run build
```

### Deploy

Upload `dist/` folder to your hosting platform (Cloudflare Pages, Vercel, Netlify, etc.)

## Credits

LeadDesk Mini - A lead capture and management system built with React and Supabase.

## License

MIT
