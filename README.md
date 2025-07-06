# Assignment Calendar Web Application

A mobile-friendly assignment management calendar web application for efficiently managing Japanese coursework data.

## ✨ Features

- 📅 2-week calendar view with weekly navigation
- 📚 Subject-based assignment management with pagination
- 🔍 Advanced filtering options (hide completed/overdue assignments)
- 📱 Mobile-optimized responsive design
- ⚡ Modern ES6 modules architecture
- 🎨 Custom CSS with TailwindCSS integration
- 📊 Assignment status tracking and due date management
- 🚀 Cache busting for optimal performance
- 🔧 Enhanced browser compatibility
- 🎯 Optimized UI/UX with clean layout design

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Styling**: Custom CSS + TailwindCSS CDN
- **Data**: JavaScript modules (no external database)
- **Deployment**: Vercel (Static Site Hosting)

## 📁 Project Structure

```
/
├── index.html              # Main HTML entry point with cache busting
├── css/
│   ├── styles.css         # Global layout and base styles
│   └── components.css     # Component-specific styles
├── js/
│   ├── app.js            # Main application controller
│   ├── calendar.js       # Calendar rendering and navigation
│   ├── assignments.js    # Assignment list management
│   ├── subjects.js       # Subject-based view with pagination
│   └── utils.js          # Utility functions
├── data/
│   └── assignments.js    # Assignment data (ES6 module export)
├── img/                    # Image assets directory
├── package.json          # Project metadata and scripts
├── vercel.json           # Vercel deployment configuration
└── .gitignore            # Git ignore rules
```

## 🚀 Local Development

### Prerequisites
- Node.js (for local development server)
- Modern web browser with ES6 module support

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

## 📊 Data Management

### Assignment Data Structure

Edit `data/assignments.js` to modify assignment data:

```javascript
export const assignmentsData = [
    {
        "id": 1,
        "courseName": "Mobile Programming",
        "round": "1st Assignment",
        "title": "Development Environment Setup",
        "dueDate": "2025-06-01",
        "dueTime": "23:59",
        "platform": "teams", // or "openlms"
        "completed": false
    }
    // ... more assignments
];
```

### Data Migration Note

- **Previous**: `data/assignments.json` (JSON file)
- **Current**: `data/assignments.js` (ES6 module)
- This change enables better integration with the modular architecture

### Recent Improvements

- **UI Optimization**: Removed unnecessary header elements for cleaner layout
- **Performance**: Implemented cache busting for JavaScript modules
- **Browser Compatibility**: Enhanced cross-browser support and error handling
- **Code Quality**: Removed deprecated functions and optimized module structure

## 🎨 Customization

### Styling

- **Global Styles**: `css/styles.css` - Layout, typography, and base styles
- **Components**: `css/components.css` - Individual component styles
- **TailwindCSS**: Available via CDN for rapid styling

### Adding Features

- **Modular Architecture**: Each feature is separated into dedicated modules
- **ES6 Imports**: Use `import`/`export` syntax for code organization
- **Event Handling**: Centralized in `app.js` with delegation to specific modules

### Configuration

Key configuration options in `app.js`:

```javascript
config: {
    referenceToday: new Date(2025, 5, 3), // Reference date for testing
    pagination: {
        itemsPerPage: 3 // Items per page in subjects view
    },
    filters: {
        unsubmittedOnly: false,
        hideOverdueCalendar: true,
        hideOverdueSubjects: true
    }
}
```

### Performance Features

- **Cache Busting**: JavaScript modules loaded with version parameters
- **CDN Optimization**: Tailwind CSS loaded via CDN with warning suppression
- **Module Loading**: Optimized ES6 module imports for faster loading

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
- **Code Optimization**: Removed deprecated functions and unnecessary components
- **Error Handling**: Enhanced browser compatibility and graceful degradation

### Mobile-First Design

- **Touch-Friendly**: Large tap targets and swipe gestures
- **Responsive**: Adapts to different screen sizes and devices

## 📚 Additional Resources

- [ES6 Modules Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Vercel Static Site Deployment](https://vercel.com/docs/concepts/get-started)
- [TailwindCSS CDN Usage](https://tailwindcss.com/docs/installation/play-cdn)