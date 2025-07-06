# Assignment Calendar Web Application

A mobile-friendly assignment management calendar web application with cloud database integration for managing coursework data efficiently.

## ✨ Features

- 📅 2-week calendar view with weekly navigation
- 📚 Subject-based assignment management with pagination
- 🔍 Advanced filtering options (hide completed/overdue assignments)
- ➕ **Manual assignment creation with floating add button**
- ✅ **Real-time assignment completion tracking**
- 📱 Mobile-optimized responsive design
- ⚡ Modern ES6 modules architecture
- 🎨 Custom CSS with TailwindCSS integration
- 📊 Assignment status tracking and due date management
- 🚀 Cache busting for optimal performance
- 🔧 Enhanced browser compatibility
- 🎯 Optimized UI/UX with clean layout design
- ☁️ **Cloud database integration with Supabase**

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Styling**: Custom CSS + TailwindCSS CDN
- **Database**: Supabase PostgreSQL
- **Cloud Platform**: Supabase Backend-as-a-Service
- **Deployment**: Vercel (Static Site Hosting)

## 📁 Project Structure

```
/
├── index.html              # Main HTML entry point with add assignment modal
├── css/
│   ├── styles.css         # Global layout and base styles
│   └── components.css     # Component-specific styles + floating button
├── js/
│   ├── app.js            # Main application controller + assignment CRUD
│   ├── calendar.js       # Calendar rendering and navigation
│   ├── assignments.js    # Assignment list management + completion tracking
│   ├── subjects.js       # Subject-based view with pagination
│   ├── supabase-service.js # Supabase database integration layer
│   └── utils.js          # Utility functions
├── package.json          # Project metadata and scripts
├── vercel.json           # Vercel deployment configuration
└── .gitignore            # Git ignore rules
```

## 🚀 Local Development

### Prerequisites
- Node.js (for local development server)
- Modern web browser with ES6 module support
- Supabase account and project setup

### Getting Started

1. Clone the repository
```bash
git clone <repository-url>
cd html-assignment-calendar
```

2. Start local development server
```bash
# Using npm scripts (Node.js http-server)
npm run dev

# Or directly with npx
npx http-server -p 8000
```

3. Open in browser
```
http://localhost:8000
```

### Development Scripts

```bash
npm run dev      # Start Node.js development server on port 8000
npm run start    # Start Node.js development server on port 8000
npm run preview  # Start preview server on port 8000
npm run build    # No build step needed (static site)
```

## 🌐 Vercel Deployment

### Automatic Deployment

1. **Connect GitHub Repository**
   - Push your project to GitHub
   - Visit [Vercel](https://vercel.com) and sign in
   - Click "New Project" and connect your GitHub repository

2. **Deployment Configuration**
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: `./` (root directory)
   - **Install Command**: Leave empty
   - **Configuration File**: `vercel.json` included for deployment settings

3. **Auto-Deploy Setup**
   - Pushes to `main` branch trigger production deployments
   - Pushes to other branches create preview deployments
   - No additional configuration files needed

### Manual Deployment with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
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

### 2. Configure Environment

Update `js/supabase-service.js` with your Supabase credentials:

```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. Database Schema

The application expects the following table structure:

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

## 📊 Data Management

### Assignment Operations

The application provides full CRUD operations:

- **Create**: Add new assignments via floating button and modal form
- **Read**: View assignments in calendar and subject views
- **Update**: Toggle completion status with visual feedback
- **Delete**: Remove assignments (if implemented)

### Assignment Data Structure

```javascript
{
  "id": 26,                           // Auto-generated by database
  "courseName": "Mobile Programming",
  "round": "1st Assignment", 
  "title": "Development Environment Setup",
  "dueDate": "2025-06-01",           // YYYY-MM-DD format
  "dueTime": "23:59",                // HH:MM format
  "platform": "teams",               // "teams" or "openlms"
  "completed": false,                // Boolean completion status
  "createdAt": "2025-01-06T...",     // Auto-generated
  "updatedAt": "2025-01-06T..."      // Auto-generated
}
```

### Adding New Assignments

1. Click the floating "+" button in the bottom right
2. Fill out the assignment form:
   - **Course Name**: Subject/course name
   - **Round**: Assignment number or round
   - **Title**: Assignment description
   - **Due Date**: Select from date picker
   - **Due Time**: Select time
   - **Platform**: Choose Teams or OpenLMS
3. Click "追加" (Add) to save to database
4. Assignment appears immediately in the interface

### Recent Improvements

- **Supabase Integration**: Migrated from static data to cloud database
- **Manual Assignment Creation**: Added floating button and modal form
- **Real-time Updates**: Instant UI updates after database operations
- **Completion Tracking**: Toggle assignment completion with visual feedback
- **Error Handling**: Robust error handling for database operations
- **PostgreSQL Optimization**: Proper SERIAL column handling for auto-increment IDs

## 🎨 Customization

### Styling

- **Global Styles**: `css/styles.css` - Layout, typography, and base styles
- **Components**: `css/components.css` - Individual component styles including floating button
- **TailwindCSS**: Available via CDN for rapid styling

### Adding Features

- **Modular Architecture**: Each feature is separated into dedicated modules
- **ES6 Imports**: Use `import`/`export` syntax for code organization
- **Event Handling**: Centralized in `app.js` with delegation to specific modules
- **Database Layer**: `supabase-service.js` handles all database operations

### Configuration

Key configuration options in `app.js`:

```javascript
config: {
    referenceToday: new Date(),        // Current date reference
    pagination: {
        itemsPerPage: 3                // Items per page in subjects view
    },
    filters: {
        unsubmittedOnly: false,        // Filter for incomplete assignments
        hideOverdueCalendar: true,     // Hide overdue in calendar view
        hideOverdueSubjects: true      // Hide overdue in subjects view
    }
}
```

### Database Operations

Core database functions in `supabase-service.js`:

```javascript
// Create
await addAssignment(assignmentData);

// Read
const assignments = await getAllAssignments();
const assignment = await getAssignmentsByDate(date);

// Update
await updateAssignmentCompletion(id, completed);
await updateAssignment(id, assignmentData);

// Delete
await deleteAssignment(id);
```

## 🌍 Browser Support

- **Chrome**: 61+
- **Firefox**: 60+
- **Safari**: 11+
- **Edge**: 16+

All modern browsers with ES6 module support.

## 🔧 Development Notes

### Module Architecture

- **Separation of Concerns**: Each JavaScript file handles specific functionality
- **Import/Export**: Clean module boundaries with explicit dependencies
- **No Build Step**: Direct ES6 module loading in browsers
- **Database Layer**: Dedicated service layer for Supabase integration
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Mobile-First Design

- **Touch-Friendly**: Large tap targets and swipe gestures
- **Responsive**: Adapts to different screen sizes and devices
- **Floating UI**: Accessible floating action button for quick assignment creation

### Database Best Practices

- **PostgreSQL SERIAL**: Proper auto-increment ID handling
- **Data Validation**: Client and server-side validation
- **Error Recovery**: Graceful handling of database connection issues
- **Performance**: Optimized queries and data transformation

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check Supabase URL and API key in `supabase-service.js`
   - Verify RLS policies allow operations
   - Check browser network tab for HTTP errors

2. **Assignment Not Saving**
   - Ensure all required fields are filled
   - Check browser console for JavaScript errors
   - Verify database table schema matches expected structure

3. **ID Conflicts (23505 Errors)**
   - Usually resolved automatically with proper SERIAL column setup
   - If persistent, check PostgreSQL sequence synchronization

### Performance Optimization

- **Cache Busting**: JavaScript modules loaded with version parameters
- **CDN Optimization**: Tailwind CSS loaded via CDN with warning suppression
- **Module Loading**: Optimized ES6 module imports for faster loading
- **Database Indexing**: Proper indexing on frequently queried columns

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL SERIAL Documentation](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-SERIAL)
- [ES6 Modules Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Vercel Static Site Deployment](https://vercel.com/docs/concepts/get-started)
- [TailwindCSS CDN Usage](https://tailwindcss.com/docs/installation/play-cdn)