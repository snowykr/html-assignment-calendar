# Assignment Calendar

A responsive assignment management calendar web application built with Next.js 15, TypeScript, and Supabase for efficient coursework management.

## ✨ Features

- 📅 **Adaptive Calendar View** - 4 weeks on desktop, 2 weeks on mobile with easy navigation
- 📚 **Subject-based Assignment Management** - Organized management with pagination
- 🔍 **Advanced Filtering** - Hide completed/overdue assignments options
- ➕ **Floating Add Button** - Quick assignment creation
- ✅ **Real-time Assignment Tracking** - Instant status updates
- 🌐 **Multi-language Support** - Korean, Japanese, English (next-intl)
- 🔐 **Google OAuth Authentication** - Secure login with NextAuth.js v5
- 🎭 **Demo Mode** - Try features without login
- 📱 **Responsive Design** - Optimized for both desktop and mobile with intuitive UI
- ⚡ **Server-side Rendering** - Next.js App Router powered
- 🎨 **Modern UI/UX** - Clean design with TailwindCSS
- 📊 **Assignment Status Tracking** - Due date management and progress monitoring
- 🔧 **Type Safety** - Stable development with TypeScript
- ☁️ **Cloud Database** - Supabase PostgreSQL integration
- 📱 **PWA Support** - Installation and offline support on mobile and desktop

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + CSS Modules
- **Database**: Supabase PostgreSQL
- **Authentication**: NextAuth.js v5 + Google OAuth
- **Internationalization**: next-intl (Korean, Japanese, English)
- **State Management**: React Context API
- **Icons**: Heroicons
- **PWA**: @ducanh2912/next-pwa
- **Deployment**: Vercel
- **Development Tools**: ESLint, Autoprefixer, PostCSS

## 📁 Project Structure

```
/
├── app/
│   ├── [locale]/           # Internationalized routing
│   │   ├── layout.tsx      # Locale-specific layout
│   │   ├── page.tsx        # Home page (redirects to calendar)
│   │   ├── calendar/
│   │   │   └── page.tsx    # Calendar view page
│   │   ├── subjects/
│   │   │   └── page.tsx    # Subject management page
│   │   ├── settings/
│   │   │   └── page.tsx    # Settings page
│   │   └── demo/           # Demo mode
│   │       ├── layout.tsx  # Demo layout
│   │       ├── calendar/   # Demo calendar
│   │       ├── subjects/   # Demo subject management
│   │       └── settings/   # Demo settings
│   └── globals.css         # Global styles
├── components/
│   ├── Calendar.tsx        # Calendar component
│   ├── Assignments.tsx     # Assignment list component
│   ├── Subjects.tsx        # Subject view component
│   ├── NavigationWrapper.tsx # Navigation wrapper
│   ├── BottomTabs.tsx      # Bottom tab navigation
│   ├── FloatingAddButton.tsx # Floating add button
│   ├── AddAssignmentModal.tsx # Add assignment modal
│   ├── AssignmentPopup.tsx # Assignment detail popup
│   ├── GlobalModals.tsx    # Global modal management
│   └── LanguageSelector.tsx # Language selector
├── contexts/
│   └── AppContext.tsx      # Global state management
├── services/
│   ├── supabase-client.ts  # Supabase client
│   └── assignment-service.ts # Assignment CRUD operations
├── utils/
│   ├── utils.ts            # Utility functions
│   ├── pagination.ts       # Pagination utilities
│   ├── data-transformer.ts # Data transformation
│   └── retry-utils.ts      # Retry logic
├── messages/               # Internationalization messages
│   ├── ko.json            # Korean
│   ├── ja.json            # Japanese
│   └── en.json            # English
├── public/
│   ├── manifest.json       # PWA manifest
│   └── icons/              # App icons
├── auth.ts                 # NextAuth setup
├── auth.config.ts          # NextAuth configuration
├── i18n.ts                 # Internationalization setup
├── routing.ts              # Routing configuration
├── middleware.ts           # Next.js middleware
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── .env.local.example
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Google OAuth app (optional, for authentication features)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd kadai-calendar
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
```

Edit the `.env.local` file with your configuration:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# NextAuth Configuration
AUTH_SECRET=your-nextauth-secret

# Google OAuth (optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Demo Mode

To try the app without authentication, visit the `/demo` path:
- [http://localhost:3000/demo](http://localhost:3000/demo)
- Test all features without login
- Data is stored in local storage

## ☁️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Visit [Supabase](https://supabase.com) and create an account
2. Create a new project
3. Go to SQL Editor and create tables:

```sql
-- Create assignments table
CREATE TABLE assignments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_name TEXT NOT NULL,
  lesson TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  due_time TIME NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('teams', 'openlms')),
  completed BOOLEAN DEFAULT FALSE,
  user_id TEXT,  -- NextAuth user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NextAuth user tables (for NextAuth Adapter)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies (user-specific data access control)
CREATE POLICY "Users can manage their own assignments" ON assignments
FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own data" ON users
FOR ALL USING (auth.uid()::text = id);

CREATE POLICY "Users can manage their own accounts" ON accounts
FOR ALL USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage their own sessions" ON sessions
FOR ALL USING (auth.uid()::text = "userId");
```

### 2. Database Schema

#### assignments table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (AUTO) | Primary key, auto-generated |
| course_name | TEXT | Course/subject name |
| lesson | TEXT | Assignment lesson/number |
| title | TEXT | Assignment title/description |
| due_date | DATE | Due date (YYYY-MM-DD) |
| due_time | TIME | Due time (HH:MM) |
| platform | TEXT | Platform (teams/openlms) |
| completed | BOOLEAN | Completion status |
| user_id | TEXT | User ID (NextAuth) |
| created_at | TIMESTAMP | Creation time (auto) |
| updated_at | TIMESTAMP | Update time (auto) |

#### NextAuth tables
- **users**: User information
- **accounts**: OAuth account information
- **sessions**: Session information

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Set up environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
3. Deploy automatically

### Other Platforms

- **Netlify**: Run `npm run build` then deploy `.next` folder
- **Docker**: Dockerfile included for container deployment

## 📱 PWA Support

This app is configured as a Progressive Web App:

- **Offline Support**: Caching through service workers
- **Cross-Platform Installation**: Install as an app on mobile devices and desktop computers
- **Push Notifications**: Assignment due date notifications (planned)
- **Splash Screen**: Brand screen during app loading
- **Responsive Experience**: Adapts to different screen sizes and input methods

### Enabling PWA Features

1. Access via HTTPS environment
2. Click "Install" button in browser address bar (desktop) or "Add to Home Screen" (mobile)
3. Enjoy native app-like experience across all devices

## 🎨 Customization

### Adding New Features

1. **Components**: Add new components in `/components`
2. **Pages**: Create new routes in `/app/[locale]` directory
3. **State**: Update `AppContext` for global state
4. **Services**: Add new services in `/services`
5. **Internationalization**: Add translations to `messages/` files

### Theme Changes

Modify CSS variables in `app/globals.css`:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background-color: #ffffff;
}
```

### Adding Internationalization Messages

Add new translations to JSON files in `messages/` folder:

```json
{
  "newFeature": {
    "ko": "새 기능",
    "ja": "新機能",
    "en": "New Feature"
  }
}
```

### Component Styling

Modify component styles using TailwindCSS classes

## ⚙️ Configuration

### Next.js Internationalization Setup

Modify supported languages in `routing.ts`:

```typescript
export const locales = ['ko', 'ja', 'en'] as const;
export const defaultLocale = 'ja' as const;
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# NextAuth
AUTH_SECRET=your-nextauth-secret

# Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### Environment-specific Configuration

- **Development**: `.env.local`
- **Staging**: `.env.staging`
- **Production**: Vercel environment variables

## 🔧 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check environment variables
   - Verify project URL and keys
   - Check RLS policies

2. **Authentication Issues**
   - Check Google OAuth configuration
   - Verify redirect URI settings
   - Check NextAuth secret configuration

3. **Internationalization Issues**
   - Check browser language settings
   - Verify message file paths
   - Check middleware configuration

4. **Build Errors**
   - Check Node.js version (18+)
   - Clear `.next` directory
   - Delete `node_modules` and reinstall
   - Check TypeScript errors

5. **PWA Issues**
   - Check HTTPS environment
   - Verify service worker registration
   - Check manifest file

### Log Checking

```bash
# Development mode logs
npm run dev

# Production build logs
npm run build

# Vercel deployment logs
vercel logs
```

## 📚 Technical Documentation

### Key Library Documentation

- [Next.js 15](https://nextjs.org/docs)
- [NextAuth.js v5](https://authjs.dev/)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Supabase](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### API Reference

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [NextAuth.js API](https://authjs.dev/reference)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🌍 Internationalization (i18n)

This project supports multiple languages using `next-intl`:

### Supported Languages
- 🇯🇵 Japanese (ja) - Default language
- 🇰🇷 Korean (ko)
- 🇺🇸 English (en)

### Adding New Languages

1. Add new locale to `routing.ts`
2. Create new language file in `messages/` folder
3. Add translations for all text

### Usage

```typescript
import { useTranslations } from 'next-intl';

function Component(): JSX.Element {
  const t = useTranslations('namespace');
  return <h1>{t('title')}</h1>;
}
```
