# World's 50 Best Bars 2024 Event Planner

A comprehensive event planning web application for World's 50 Best Bars 2024 awards week (October 4-10, 2024) across Hong Kong's premier districts.

## 🚀 Features

### Core Functionality
- **📅 Events Browser** - Discover exclusive events across Hong Kong with advanced filtering and search
- **⏰ Personal Agenda** - Create and manage your personalized event schedule
- **⭐ Bar Tracker** - Track visits to the world's top bars with progress visualization
- **🎯 Predictions** - Make your top 5 predictions for the awards ceremony
- **📰 News & Updates** - Stay informed with latest news and FAQ
- **🗺️ Map View** - View events by location with precise coordinates

### Technical Highlights
- **Modern Stack**: React 18 + TypeScript + Tailwind CSS + Supabase
- **Mobile-First Design**: Responsive design optimized for all devices
- **Real-time Data**: Live updates with Supabase integration
- **Authentication**: Secure user accounts with email/password
- **Smooth Animations**: Framer Motion for premium user experience
- **Location Services**: Precise event mapping with latitude/longitude coordinates

## 🛠 Setup Instructions

### 1. Environment Setup
1. Copy `.env.example` to `.env`
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 2. Database Setup
The app includes automatic database migration and seeding:

1. **Connect to Supabase** using the "Connect to Supabase" button in the app
2. **Database Schema** will be automatically created via migration files
3. **Sample Data** will be automatically seeded on first load

### 3. Manual Database Setup (if needed)
If automatic setup doesn't work, run these SQL commands in your Supabase SQL editor:

```sql
-- Run the migration files in order:
-- 1. supabase/migrations/create_initial_schema.sql
-- 2. supabase/migrations/insert_events_data.sql  
-- 3. supabase/migrations/insert_bars_data.sql
```

## 📱 Usage Guide

### For Event Attendees
1. **Browse Events** - Filter by Hong Kong district, date, or search by venue/bar
2. **Build Agenda** - Add events to your personal schedule
3. **Track Bar Visits** - Mark bars you've visited and track progress
4. **Make Predictions** - Predict the top 5 bars before the ceremony
5. **Map View** - Explore events geographically across Hong Kong

### For Event Organizers
- Real-time view of user engagement
- Popular events and venues analytics
- User agenda insights for planning

## 🎨 Design System

### Color Palette
- **Primary**: Deep black (#1a1a1a) for sophistication
- **Accent**: Cocktail gold (#d4af37) and warm amber (#f59e0b)
- **Surface**: Charcoal (#2d2d2d) for cards and components
- **Text**: High contrast white with muted gray secondaries

### Typography
- Clean, modern sans-serif fonts
- WCAG AA compliant contrast ratios
- Responsive font scaling

## 🏗 Architecture

### Component Structure
```
src/
├── components/
│   ├── Layout/          # Navigation and layout components
│   ├── Auth/            # Authentication modals and forms
│   ├── Events/          # Event browsing and management
│   ├── Agenda/          # Personal agenda management
│   ├── Bars/            # Bar tracking and discovery
│   ├── Predictions/     # Top 5 predictions interface
│   └── News/            # News and FAQ sections
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
└── data/                # Static data and seed files
```

### State Management
- **Zustand** for global state management
- **Supabase** for real-time data synchronization
- **Local Storage** for user preferences

## 🔒 Security

### Authentication
- Email/password authentication via Supabase Auth
- Row Level Security (RLS) for data protection
- Secure session management

### Data Protection
- User data isolated per account
- Public read access for events and bars
- Private user agenda and predictions

## 📊 Database Schema

### Core Tables
- **events** - Event information with location coordinates and version support
- **bars** - Bar rankings and information
- **user_agenda** - Personal event schedules
- **user_bar_visits** - Bar visit tracking
- **user_predictions** - Top 5 predictions

### New Features in V2
- **Location Coordinates** - Latitude and longitude for precise mapping
- **Event Versioning** - Support for multiple event series (Asia 2025, World 2024)
- **District-Level Filtering** - Hong Kong district-specific location filtering

### Relationships
- Users can have multiple agenda items
- Users can track visits to multiple bars
- Users can make one set of predictions

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Performance optimization enabled
- [ ] Error monitoring configured

### Performance Optimizations
- Code splitting for faster loading
- Image optimization with WebP
- Efficient database queries with indexes
- Caching strategies for static content

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Component-based architecture
- Responsive design principles

## 📞 Support

For technical issues or feature requests, please check the FAQ section in the app or contact the development team.

---

**Built with ❤️ for the global cocktail community**