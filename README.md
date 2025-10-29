# The Enlift Hub - CDS Preparation Platform

A comprehensive web application for Combined Defence Services (CDS) exam preparation, featuring digital notes, mock tests, SSB practice, and progress tracking.

## 🚀 Features

- **Digital Notes Management**: Create, organize, and download study notes as PDFs
- **Mock Tests**: Practice CDS questions with detailed analytics
- **Previous Year Questions (PYQs)**: Access and solve past exam questions
- **SSB Practice**: Comprehensive Services Selection Board preparation tools
  - PPDT (Picture Perception & Description Test)
  - TAT (Thematic Apperception Test)
  - WAT (Word Association Test)
  - SRT (Situation Reaction Test)
  - OIR (Officer Intelligence Rating)
- **Study Planner**: Track progress and manage study schedules
- **Admin Dashboard**: Content management and student monitoring
- **Real-time Notifications**: Stay updated with admin announcements
- **Progress Analytics**: Track your preparation journey

## 📋 Prerequisites

- Node.js 18+ or higher
- npm or yarn package manager
- Firebase account (for authentication and database)
- Git (for version control)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd notescafe-main
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication (Email/Password)
4. Create Firestore Database
5. Deploy Firestore Rules:

```bash
firebase deploy --only firestore:rules
```

6. (Optional) Deploy Firestore Indexes:

```bash
firebase deploy --only firestore:indexes
```

## 🚀 Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 📁 Project Structure

```
notescafe-main/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components (sidebar, etc.)
│   ├── login/          # Login/signup forms
│   ├── notes/          # Notes management
│   └── profile/        # User profile
├── contexts/           # React contexts (Auth, etc.)
├── firebase/           # Firebase configuration and services
├── hooks/              # Custom React hooks
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   ├── admin/         # Admin dashboard
│   ├── student-desk/  # Student dashboard and features
│   └── ...
├── public/            # Static assets
├── styles/            # Global styles
├── utils/             # Utility functions
├── .env.local         # Environment variables (not in git)
├── .env.example       # Environment template
├── firestore.rules    # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
└── next.config.mjs    # Next.js configuration
```

## 🔐 Authentication Flow

1. **Landing Page** (`/`): Public homepage
2. **Register** (`/register`): New user signup
3. **Login** (`/login`): Existing user login
4. **Profile Setup** (`/profile-setup`): Complete profile after signup
5. **Dashboard** (`/student-desk/dashboard`): Main student dashboard
6. **Admin** (`/admin`): Admin panel (requires admin role)

## 🗃️ Firestore Collections

- `users` - User profiles and settings
- `notes` - Student study notes
- `mockTests` - Available mock tests
- `subjects` - Subjects and PDFs
- `adminNotifications` - System notifications
- `ssb_*` - SSB practice content (PPDT, TAT, WAT, SRT, OIR)
- `tasks` - Study planner tasks
- `userLogins` - Login tracking for streaks

## 🔒 Security

- Firestore security rules enforce data access control
- Authentication required for all protected routes
- Admin-only access for content management
- Client-side and server-side validation
- Secure environment variable handling

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- DigitalOcean App Platform

## 📝 Admin Setup

To make a user admin:

1. User must register first
2. Run the admin setup script:

```bash
node scripts/update-admin-access.js <user-email>
```

Or manually update Firestore:
- Navigate to `users` collection
- Find the user document
- Set `isAdmin: true`

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build test
npm run build

# Analyze bundle
npm run analyze
```

## 📊 Performance Optimization

- React Server Components where applicable
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Static asset caching
- Bundle size monitoring
- Firestore query optimization

## 🐛 Troubleshooting

### Common Issues

**Problem**: Firebase connection errors
- Solution: Check `.env.local` configuration
- Ensure Firebase project is active

**Problem**: Authentication not working
- Solution: Enable Email/Password in Firebase Console
- Check Firestore rules are deployed

**Problem**: Pages not loading
- Solution: Clear `.next` cache and rebuild
- Check for JavaScript errors in console

**Problem**: Firestore permission denied
- Solution: Deploy firestore.rules
- Ensure user is authenticated

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and queries:
- Email: support@enlifthub.com
- Create an issue in the repository

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] AI-powered study recommendations
- [ ] Video lectures integration
- [ ] Peer-to-peer study groups
- [ ] Advanced analytics dashboard
- [ ] Offline mode support

---

**Made with ❤️ for CDS Aspirants**
