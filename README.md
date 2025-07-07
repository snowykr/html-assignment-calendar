# Assignment Calendar Next.js Application

A mobile-friendly assignment management calendar web application built with Next.js 14, TypeScript, and Supabase for managing coursework data efficiently.

## ✨ Features

- 📅 2-week calendar view with weekly navigation
- 📚 Subject-based assignment management with pagination
- 🔍 Advanced filtering options (hide completed/overdue assignments)
- ➕ **Manual assignment creation with floating add button**
- ✅ **Real-time assignment completion tracking**
- 📱 Mobile-optimized responsive design
- ⚡ Server-side rendering with Next.js App Router
- 🎨 TailwindCSS for styling
- 📊 Assignment status tracking and due date management
- 🔧 TypeScript for type safety
- 🎯 Optimized UI/UX with clean layout design
- ☁️ **Cloud database integration with Supabase**
- 📱 **PWA support for mobile installation**

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase PostgreSQL
- **State Management**: React Context API
- **Deployment**: Vercel
- **PWA**: next-pwa

## 📁 Project Structure

```
/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Home page (redirects to /calendar)
│   ├── globals.css         # Global styles
│   ├── calendar/
│   │   └── page.tsx        # Calendar view page
│   ├── subjects/
│   │   └── page.tsx        # Subjects view page
│   └── settings/
│       └── page.tsx        # Settings page
├── components/
│   ├── Calendar.tsx        # Calendar component
│   ├── Assignments.tsx     # Assignments list component
│   ├── Subjects.tsx        # Subjects view component
│   ├── BottomTabs.tsx      # Navigation tabs
│   ├── FloatingAddButton.tsx
│   ├── AddAssignmentModal.tsx
│   └── AssignmentPopup.tsx
├── contexts/
│   └── AppContext.tsx      # Global state management
├── services/
│   ├── supabase-client.ts  # Supabase client setup
│   └── assignment-service.ts # Assignment CRUD operations
├── utils/
│   ├── utils.ts            # Utility functions
│   ├── pagination.ts       # Pagination utilities
│   ├── data-transformer.ts # Data transformation
│   └── retry-utils.ts      # Retry logic
├── config/
│   └── supabase-config.ts  # Supabase configuration
├── public/
│   ├── manifest.json       # PWA manifest
│   └── icons/              # App icons
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

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd assignment-calendar
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## ☁️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Visit [Supabase](https://supabase.com) and create an account
2. Create a new project
3. Navigate to SQL Editor and create the assignments table:

```sql
CREATE TABLE assignments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_name TEXT NOT NULL,
  round TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  due_time TIME NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('teams', 'openlms')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
CREATE POLICY "Allow all operations on assignments" ON assignments
FOR ALL USING (true) WITH CHECK (true);
```

### 2. Database Schema

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (AUTO) | Primary key, auto-generated |
| course_name | TEXT | Course/subject name |
| round | TEXT | Assignment round/number |
| title | TEXT | Assignment title/description |
| due_date | DATE | Due date (YYYY-MM-DD) |
| due_time | TIME | Due time (HH:MM) |
| platform | TEXT | Platform (teams/openlms) |
| completed | BOOLEAN | Completion status |
| created_at | TIMESTAMP | Auto-generated creation time |
| updated_at | TIMESTAMP | Auto-generated update time |

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 📱 PWA Support

The application includes PWA support for installation on mobile devices:

- Add to home screen functionality
- Offline support (service worker)
- App-like experience
- Custom app icons

## 🎨 Customization

### Adding New Features

1. **Components**: Add new components in `/components`
2. **Pages**: Create new routes in `/app` directory
3. **State**: Update `AppContext` for global state
4. **Services**: Add new services in `/services`

### Styling

- Global styles: `app/globals.css`
- Tailwind configuration: `tailwind.config.js`
- Component-specific styles: Use Tailwind classes or CSS modules

## 🔧 Configuration

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Next.js Configuration

See `next.config.js` for:
- PWA configuration
- Other Next.js settings

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify environment variables
   - Check Supabase project status
   - Verify RLS policies

2. **Build Errors**
   - Clear `.next` directory
   - Delete `node_modules` and reinstall
   - Check TypeScript errors

3. **PWA Not Working**
   - Ensure HTTPS in production
   - Check manifest.json configuration
   - Verify service worker registration

## 📚 Tech Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📄 License

MIT