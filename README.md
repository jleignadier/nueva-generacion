# Nueva Generación - Volunteer Management Platform

A comprehensive web application designed to connect volunteers, organizations, and administrators in a unified ecosystem for community service and social impact.

## 🌟 Features

### Multi-User System
- **Individual Volunteers**: Personal accounts for volunteer participation and tracking
- **Organizations**: Institutional accounts for managing events and volunteer coordination
- **Administrators**: Full platform management with analytics and oversight

### Core Functionality

#### 🎯 Event Management
- Create, edit, and manage volunteer events
- Event registration and participation tracking
- Event details with location, date, and description
- QR code-based event check-ins for streamlined attendance

#### 📊 Analytics & Tracking
- Personal contribution tracking for volunteers
- Organization performance metrics
- Leaderboard system to gamify volunteer participation
- Points-based achievement system

#### 💝 Donation Management
- Advanced donation tracking with sorting capabilities (most recent, oldest, amount)
- Comprehensive search functionality for donation types ("Evento", "General") and event titles
- Integration with volunteer activities and event participation
- Standardized date formatting (dd/mm/yyyy) across all donation records
- Transparency in fund allocation and impact tracking

#### 👤 Profile Management
- Comprehensive user profiles with personal information
- Organization profiles with descriptions and contact details
- Achievement badges and volunteer history
- Privacy controls and data management

#### 📱 Mobile-First Design
- Responsive design optimized for mobile devices
- Tab-based navigation (Home, Events, Donations, Leaderboard, Profile)
- Touch-friendly interface with intuitive navigation
- QR code scanner for mobile event check-ins with Spanish language support
- Latest event attendance display in user profiles

### Administrative Features

#### 🛠 Admin Dashboard
- **User Management**: View, edit, enable/disable user accounts
- **Organization Management**: Oversee organizational accounts and activities
- **Event Administration**: Create system-wide events and manage event participation
- **Settings Management**: Configure platform settings and parameters
- **Analytics Dashboard**: Comprehensive insights into platform usage and impact

#### 🔐 Security & Access Control
- Role-based access control (Individual, Organization, Admin)
- Secure authentication system
- Protected admin routes and functionality
- Data privacy compliance

### Technical Features

#### 🎨 Modern UI/UX
- Built with shadcn/ui components for consistent design
- Dark/light mode support
- Gradient-based theming with custom color palette
- Smooth animations and transitions
- Toast notifications for user feedback

#### 📊 Real-time Updates
- Live leaderboard updates
- Real-time event participation tracking
- Instant notification system
- Dynamic content updates
- Standardized date formatting (dd/mm/yyyy) across all components

### Data & Persistence
- **LocalStorage Integration**: Demo data persistence using browser localStorage
- **Mock Data System**: Comprehensive mock data for testing and demonstration
- **Date Standardization**: Consistent dd/mm/yyyy format across all date displays
- **User State Management**: Persistent authentication and user preferences

## 🚀 Getting Started

### Prerequisites
- Node.js (18+ recommended)
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nueva-generacion

# Install dependencies
npm install

# Start development server
npm run dev
```

### Demo Accounts

#### Admin Access
- **Email**: admin@ng.org.pa
- **Password**: admin123
- **Admin Key**: admin2024

#### Test Individual Account
- Create via signup form with "Individual" account type
- Fill in personal details and optional organization affiliation

#### Test Organization Account
- Create via signup form with "Organization" account type
- Include organization name and optional description

## 🛠 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with full TypeScript support
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: High-quality, accessible component library

### State Management
- **Zustand**: Lightweight state management for events and competitions
- **React Context**: Authentication and global app state
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for form inputs

### Routing & Navigation
- **React Router DOM**: Client-side routing with protected routes
- **Tab-based Navigation**: Mobile-first navigation pattern

### Additional Libraries
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization for analytics
- **React Query**: Server state management and caching
- **Sonner**: Toast notification system

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── admin/          # Admin-specific components
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom React hooks
├── layouts/            # Layout components (User, Admin)
├── pages/              # Page components
│   ├── admin/          # Admin dashboard pages
│   └── tabs/           # Tab navigation pages
├── store/              # Zustand stores
└── lib/                # Utility functions
```

## 🌐 Deployment

### Lovable Platform
1. Open the [Lovable Project](https://lovable.dev/projects/ed4d784c-89a9-4cd4-a409-4cc3ff8e1ec4)
2. Click Share → Publish
3. Configure custom domain if needed

### Self-Hosting
The application can be deployed to any static hosting platform:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

Compatible with Vercel, Netlify, GitHub Pages, and other static hosting providers.

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Setup
No environment variables required for basic functionality. The app uses localStorage for demo data persistence and includes:
- Mock user accounts and organizations
- Sample events and donation data  
- Persistent user authentication state
- Standardized dd/mm/yyyy date formatting throughout the application

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is built with Lovable and follows standard web development practices. All code is available in this repository.

## 🤝 Support & Community

- **Documentation**: [Lovable Docs](https://docs.lovable.dev/)
- **Community**: [Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Tutorials**: [YouTube Playlist](https://www.youtube.com/watch?v=9KHLTZaJcR8&list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO)

## 🎯 Roadmap

- [ ] Real Supabase backend integration
- [ ] Push notifications for events
- [ ] Advanced analytics dashboard
- [ ] Mobile app companion
- [ ] Integration with payment processors
- [x] Partial multi-language support (Spanish elements implemented)
- [ ] Complete multi-language internationalization
- [ ] Advanced reporting features
- [ ] Enhanced donation tracking and analytics

---

**Nueva Generación** - Empowering communities through organized volunteerism and social impact.