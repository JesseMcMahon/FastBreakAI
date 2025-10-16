# 🏀 Sports Connect - Event Management Platform

A modern, full-stack sports event management application built with Next.js 15, TypeScript, and Supabase. This project was developed with the assistance of [Cursor](https://cursor.sh/), leveraging AI-powered development to create a robust and user-friendly platform for managing sports events and venues.

![Sports Connect](https://img.shields.io/badge/Next.js-15.5.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.75.0-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔐 Authentication & Security

- **Email/Password Authentication** with Supabase Auth
- **Protected Routes** with automatic redirects
- **Row Level Security (RLS)** for data protection
- **Session Management** with automatic token refresh

### 🏟️ Venue Management

- **Create & Manage Venues** with detailed information
- **Search & Filter** venues by name, address, or city
- **Edit & Delete** venues with confirmation modals
- **Capacity Tracking** and location details
- **User-specific Venues** (users only see their own venues)

### 🎯 Event Management

- **Comprehensive Event Creation** with multiple venue support
- **Primary & Secondary Venues** for complex events
- **Date Range Support** (start date to end date)
- **Sport Type Categorization** (Basketball, Football, Soccer, etc.)
- **Search & Filter** by event name, description, or sport type
- **Event Descriptions** with rich text support
- **Real-time Updates** with optimistic UI

### 🎨 Modern UI/UX

- **Responsive Design** optimized for all devices
- **Shadcn/ui Components** for consistent design system
- **React Hook Form** with Zod validation
- **Toast Notifications** for user feedback
- **Loading States** and error handling
- **Confirmation Modals** for destructive actions
- **Smooth Animations** and transitions

### 🔍 Advanced Features

- **Real-time Search** with debounced input
- **Multi-filter Support** (sport type, city, text search)
- **Data Persistence** with Supabase PostgreSQL
- **Server Actions** for secure data operations
- **Type Safety** throughout the application
- **Error Boundaries** and graceful error handling

## 🚀 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### Backend & Database

- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Database-level security
- **Server Actions** - Secure server-side operations

### Development Tools

- **Cursor** - AI-powered code editor
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Turbopack** - Fast bundling

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd fastbreak-dashboard
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Setup

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_venues ENABLE ROW LEVEL SECURITY;

-- Venues policies
CREATE POLICY "Users can view their own venues" ON venues FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert their own venues" ON venues FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own venues" ON venues FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own venues" ON venues FOR DELETE USING (auth.uid() = created_by);

-- Events policies
CREATE POLICY "Users can view their own events" ON events FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert their own events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = created_by);

-- Event venues policies
CREATE POLICY "Users can view event venues" ON event_venues FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = event_venues.event_id AND events.created_by = auth.uid())
);
CREATE POLICY "Users can insert event venues" ON event_venues FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM events WHERE events.id = event_venues.event_id AND events.created_by = auth.uid())
);
CREATE POLICY "Users can update event venues" ON event_venues FOR UPDATE USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = event_venues.event_id AND events.created_by = auth.uid())
);
CREATE POLICY "Users can delete event venues" ON event_venues FOR DELETE USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = event_venues.event_id AND events.created_by = auth.uid())
);
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
fastbreak-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── events/             # Event management pages
│   │   │   ├── add/           # Create new event
│   │   │   └── edit/[id]/     # Edit existing event
│   │   ├── venues/             # Venue management pages
│   │   │   ├── add/           # Create new venue
│   │   │   └── edit/[id]/     # Edit existing venue
│   │   ├── login/             # Authentication pages
│   │   ├── signup/
│   │   └── page.tsx           # Landing page
│   ├── components/             # Reusable components
│   │   ├── ui/                # Shadcn/ui components
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication state
│   ├── hooks/                 # Custom React hooks
│   │   └── useConfirmationModal.ts
│   └── lib/                   # Utility functions
│       ├── actions/           # Server actions
│       │   ├── events.ts      # Event CRUD operations
│       │   └── venues.ts      # Venue CRUD operations
│       ├── supabase/          # Database client
│       └── utils.ts           # Helper functions
├── public/                    # Static assets
└── package.json
```

## 🎯 Key Features Explained

### Authentication Flow

- **Sign Up/Login** with email and password
- **Protected Routes** automatically redirect unauthenticated users
- **Session Persistence** across browser refreshes
- **Automatic Logout** on token expiration

### Event Management

- **Multi-venue Support** - Events can have multiple venues
- **Primary Venue** designation for main location
- **Date Range Support** - Single day or multi-day events
- **Sport Categorization** - Organized by sport type
- **Rich Descriptions** - Detailed event information

### Search & Filtering

- **Real-time Search** - Instant results as you type
- **Debounced Input** - Optimized performance
- **Multi-criteria Filtering** - Search by multiple fields
- **Clear Filters** - Easy reset functionality

### Data Management

- **Server Actions** - Secure server-side operations
- **Optimistic Updates** - Immediate UI feedback
- **Error Handling** - Graceful error recovery
- **Data Validation** - Client and server-side validation

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cursor** - AI-powered development assistance
- **Vercel** - Deployment platform
- **Supabase** - Backend infrastructure
- **Shadcn/ui** - Beautiful component library
- **Next.js Team** - Amazing React framework

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Built with ❤️ using Cursor AI and modern web technologies**
