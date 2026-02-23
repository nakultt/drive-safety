# Smart Driver Safety System - Dashboard UI

A professional, enterprise-grade dashboard application for the **Smart Driver Safety System – Edge AI Traffic Monitoring** project. Built with React, TypeScript, Tailwind CSS, and Recharts.

## 🎯 Features

- **Modern Dashboard Interface** - Overview of all safety metrics and live alerts
- **Violations Management** - Comprehensive table with filtering and search
- **Driver Distractions** - Monitor phone usage and driver focus
- **Pothole Reporting** - Track road infrastructure issues
- **Animal Alerts** - Real-time alerts for animals on roadways
- **Analytics** - Advanced charts and data visualization
- **Device Management** - Monitor connected IoT devices and their status
- **Event Log** - Master log with full event history and details
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Clean Architecture** - Modular components with TypeScript support

## 🛠 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4 with @tailwindcss/vite
- **Routing**: React Router DOM v7
- **Charts**: Recharts
- **Icons**: Lucide React
- **Development**: Babel, ESLint, Dev Server

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # Main layout wrapper
│   │   ├── Sidebar.tsx          # Collapsible sidebar navigation
│   │   ├── Header.tsx           # Top header with search & profile
│   │   ├── StatCard.tsx         # Stat card with icon & trend
│   │   ├── ChartCard.tsx        # Chart card container
│   │   ├── DataTable.tsx        # Reusable data table with pagination
│   │   ├── Badge.tsx            # Status badges
│   │   ├── AlertCard.tsx        # Alert/notification card
│   │   ├── DeviceCard.tsx       # Device status card
│   │   └── index.ts             # Component exports
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard with stats & charts
│   │   ├── Violations.tsx       # Violations data table
│   │   ├── Distractions.tsx     # Driver distraction monitoring
│   │   ├── Potholes.tsx         # Pothole tracking
│   │   ├── AnimalAlerts.tsx     # Animal detection alerts
│   │   ├── Analytics.tsx        # Advanced analytics page
│   │   ├── Devices.tsx          # Device management
│   │   ├── Events.tsx           # Event log master list
│   │   ├── EventDetails.tsx     # Single event detail view
│   │   └── index.ts             # Page exports
│   │
│   ├── layouts/
│   │   └── Layout.tsx           # Main layout component
│   │
│   ├── data/
│   │   └── mockData.ts          # Mock data for development
│   │
│   ├── services/
│   │   └── index.ts             # Future API service imports
│   │
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # React DOM render
│   └── index.css                # Global styles & Tailwind
│
├── index.html                   # HTML entry point
├── tailwind.config.ts           # Tailwind CSS configuration
├── vite.config.ts               # Vite configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm preview

# Run linter
npm run lint
```

## 📋 Routes & Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Redirect | Redirects to `/dashboard` |
| `/dashboard` | Dashboard | Main overview with stats, charts & alerts |
| `/violations` | Violations | Data table of traffic violations |
| `/distractions` | Distractions | Driver distraction monitoring cards |
| `/potholes` | Potholes | Pothole tracking with map placeholder |
| `/animal-alerts` | Animal Alerts | Real-time animal detection alerts |
| `/analytics` | Analytics | Advanced charts and data insights |
| `/devices` | Devices | IoT device management and status |
| `/events` | Events | Complete event log with filtering |
| `/events/:id` | Event Details | Detailed view of a single event |

## 🎨 Design System

### Colors
- **Primary**: Indigo (`#4f46e5`)
- **Background**: Slate (light: `#f8fafc`, dark: `#0f172a`)
- **Text**: Slate (900: `#0f172a`, 600: `#475569`)
- **Accents**: Green (success), Amber (warning), Red (error)

### Components

All components use responsive Tailwind classes and support:
- Light/Dark modes ready
- Smooth transitions
- Rounded-2xl corners for modern look
- Shadow effects (shadow-sm/md)
- Hover states

### Responsive Breakpoints
- Mobile-first approach
- `sm:` (640px) - Tablets
- `lg:` (1024px) - Desktops

## 📊 Mock Data

All data is currently mocked in `src/data/mockData.ts`. The following entities are available:

- **Violations** - Traffic violations with fines
- **Distractions** - Phone usage detection
- **Potholes** - Road infrastructure issues
- **Animal Alerts** - Wildlife on roads
- **Events** - Master event log
- **Devices** - IoT camera devices
- **Dashboard Stats** - Summary metrics
- **Charts Data** - Daily trends, location analysis, device performance

## 🔌 API Integration (Future)

When ready to integrate with real APIs:

1. Create service files in `src/services/`
2. Define API call functions
3. Replace mock data imports with API calls
4. Add error handling and loading states

Example service structure:

```typescript
// src/services/violationService.ts
export const violationService = {
  getAll: async () => {
    const response = await fetch('/api/violations');
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`/api/violations/${id}`);
    return response.json();
  }
};
```

## 🧩 Component Usage Examples

### Using StatCard
```tsx
<StatCard
  icon={AlertTriangle}
  title="Total Violations"
  value={1247}
  trend={{ value: 12, direction: 'up' }}
  backgroundColor="bg-red-50"
  iconColor="text-red-600"
/>
```

### Using DataTable
```tsx
<DataTable
  data={violations}
  columns={violationColumns}
  itemsPerPage={10}
  searchable={true}
  searchFields={['vehicleNumber', 'location']}
  filterOptions={[...]}
  rowLink={(row) => `/violations/${row.id}`}
/>
```

### Using Badge
```tsx
<Badge variant="success" size="sm">
  Resolved
</Badge>

<Badge variant="error" size="lg">
  Critical
</Badge>
```

## 📱 Responsive Features

- **Collapsible Sidebar** - Closes on mobile, opens on desktop
- **Sticky Header** - Always visible with search bar
- **Responsive Grid** - Adapts from 1 → 2 → 3 columns
- **Touch-friendly** - Larger tap targets on mobile
- **Mobile Menu** - Hamburger menu for navigation

## 🎯 UI/UX Highlights

✅ Clean, minimal design  
✅ Consistent spacing and typography  
✅ Smooth hover transitions  
✅ Clear visual hierarchy  
✅ Status indicators with badges  
✅ Progress bars for system metrics  
✅ Professional color palette  
✅ Enterprise-grade appearance  

## 🔄 State Management

Currently using React hooks for state management. For larger applications, consider:
- Redux or Zustand for global state
- React Query for server state
- Context API for theme/auth

## 🚀 Performance Optimizations

- Code splitting via Vite
- Component lazy loading ready
- Memoization with React.memo
- Image optimization placeholders
- Minimal re-renders with proper hooks

## 📝 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔐 Security Notes

⚠️ **This is a frontend-only application with mock data**

Before deploying to production:
- Implement proper authentication
- Add API security (JWT tokens, CORS)
- Sanitize user inputs
- Implement proper error boundaries
- Add rate limiting
- Use environment variables for API endpoints

## 🐛 Known Limitations

- Uses mock data (no real API integration)
- Map features are placeholders
- File upload not implemented
- Real-time WebSocket connections not included
- Export to PDF/CSV not implemented

## 📈 Future Enhancements

- [ ] Dark mode toggle
- [ ] Export reports (PDF, CSV)
- [ ] Real-time notifications
- [ ] Map integration (Google Maps/Mapbox)
- [ ] Document upload system
- [ ] Advanced filtering options
- [ ] User permissions & roles
- [ ] Audit logs
- [ ] Multi-language support

## 🤝 Contributing

This dashboard is designed to be modular and extensible. To add new features:

1. Create new page in `src/pages/`
2. Add route in `App.tsx`
3. Add menu item in `Sidebar.tsx`
4. Create reusable components as needed
5. Use Tailwind classes for styling
6. Follow existing code patterns

## 📄 License

This project is part of the Smart Driver Safety System initiative.

## 👨‍💻 Technical Notes

### TypeScript
- Strict mode enabled
- Interface-based component props
- Full type safety throughout

### Tailwind CSS
- Utility-first approach
- Custom config with brand colors
- Responsive classes for mobile-first design
- @layer directives for custom components

### React Router
- Version 7 with latest features
- Efficient route matching
- Browser history integration
- Dynamic route parameters

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

---

**Built with ❤️ for Smart Driver Safety**

For questions or improvements, please contact the development team.
