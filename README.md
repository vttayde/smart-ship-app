# 📦 Ship Smart - Logistics Aggregation Platform

A modern logistics platform that connects consumers with multiple courier service providers through a unified booking and tracking system.

## 🎯 Project Overview

**Ship Smart** is a Next.js-based logistics aggregation platform designed to simplify package shipping across India by:

- 🚚 **Multi-Courier Integration** - Compare prices from Delhivery, Shadowfax, Ekart
- 🔍 **Smart Comparison** - Find best rates and delivery options
- 🔐 **Guest Browsing** - Authentication only required for booking
- 📱 **Real-time Tracking** - Live GPS tracking across all partners
- 💳 **Secure Payments** - Integrated payment processing

## 🏗️ Technology Stack

### **Frontend & Backend**

- **Framework**: Next.js 15 + TypeScript (Full-stack)
- **Frontend**: React components, App Router, Server-Side Rendering
- **Backend**: Next.js API Routes (serverless functions)
- **Styling**: Tailwind CSS + Custom UI Components
- **State Management**: Redux Toolkit
- **Database**: PostgreSQL + Prisma ORM (planned)
- **Authentication**: NextAuth.js + JWT (planned)
- **Deployment**: Vercel

### **Integrations (Planned)**

- **Payment**: Razorpay Gateway
- **Maps**: Google Maps API
- **SMS/Email**: Twilio + SendGrid
- **Courier APIs**: Delhivery, Shadowfax, Ekart

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/vttayde/smart-ship-app.git
   cd smart-ship-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
ship-smart/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   └── signup/        # Registration page
│   │   ├── dashboard/         # User dashboard
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/            # React components
│   │   └── ui/               # UI components (Button, Input, Card)
│   ├── store/                # Redux store
│   │   ├── slices/           # Redux slices
│   │   └── hooks.ts          # Typed Redux hooks
│   ├── providers/            # Context providers
│   └── lib/                  # Utility functions
├── public/                   # Static assets
├── docs/                    # Project documentation
└── README.md               # This file
```

## 🎨 Features Implemented (Phase 1)

### ✅ **Core Features**

- [x] **Landing Page** - Professional homepage with search functionality
- [x] **Authentication UI** - Login and signup pages with form validation
- [x] **User Dashboard** - Basic dashboard with stats and quick actions
- [x] **Redux Store** - State management for auth and booking data
- [x] **Responsive Design** - Mobile-first approach with Tailwind CSS
- [x] **UI Components** - Reusable Button, Input, and Card components

### ✅ **User Experience**

- [x] **Guest Browsing** - Search and compare without authentication
- [x] **Authentication Gate** - Login required only for booking
- [x] **Professional UI** - Clean, modern design
- [x] **Navigation** - Seamless routing between pages

## 🔮 Roadmap

### **Phase 2: Backend & Database (Planned)**

- [ ] PostgreSQL database setup with Prisma
- [ ] Authentication system with NextAuth.js
- [ ] API routes for user management
- [ ] Session management and security

### **Phase 3: Courier Integration (Planned)**

- [ ] Delhivery API integration
- [ ] Shadowfax API integration
- [ ] Ekart API integration
- [ ] Real-time price comparison
- [ ] Service availability checking

### **Phase 4: Booking & Payments (Planned)**

- [ ] Booking flow implementation
- [ ] Razorpay payment integration
- [ ] Order management system
- [ ] Email/SMS notifications

### **Phase 5: Advanced Features (Planned)**

- [ ] Real-time tracking with GPS
- [ ] Advanced analytics dashboard
- [ ] Admin panel for operations
- [ ] Mobile app (React Native)

## 🧪 Development

### **Available Scripts**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### **Development Guidelines**

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Write descriptive commit messages
- Test features thoroughly

## 📚 Documentation

Detailed project documentation is available in the `/project-docs` folder:

- **PROJECT_ANALYSIS.md** - Technical analysis and requirements
- **LEARNING_GUIDE.md** - Development tutorials and resources
- **NEXTJS_IMPLEMENTATION.md** - Implementation details
- **wireframes/** - UI/UX designs and prototypes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Developer**: Vinod Tayde  
**Repository**: [https://github.com/vttayde/smart-ship-app](https://github.com/vttayde/smart-ship-app)

---

**📅 Last Updated**: August 28, 2025  
**📋 Status**: Phase 1 Complete - Ready for Phase 2 Development  
**🎯 Next**: Database integration and API development
