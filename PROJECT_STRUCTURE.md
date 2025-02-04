# Project Structure

## Root Directory
```
/home/project/
├── dist/                      # Build output directory
│   ├── _redirects            # Netlify redirects configuration
│   ├── assets/              # Compiled assets
│   └── index.html           # Built HTML file
│
├── public/                    # Static assets
│   └── _redirects            # Netlify redirects configuration
│
├── src/                       # Source code
│   ├── components/           # React components
│   │   ├── Attachments/     # Attachment-related components
│   │   ├── auth/           # Authentication components
│   │   ├── Board/          # Board-related components
│   │   ├── Comments/       # Comment-related components
│   │   ├── Contacts/       # Contact management components
│   │   ├── Dashboard/      # Dashboard components
│   │   ├── layouts/        # Layout components
│   │   ├── List/          # List-related components
│   │   ├── PrivateBoards/ # Private boards components
│   │   ├── Search/        # Search functionality components
│   │   ├── Settings/      # Settings-related components
│   │   ├── SharedTasks/   # Shared tasks components
│   │   ├── Task/          # Task-related components
│   │   ├── Team/          # Team management components
│   │   ├── ui/            # Reusable UI components
│   │   └── UserProfile/   # User profile components
│   │
│   ├── data/               # Mock data and constants
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Library configurations
│   ├── services/           # API and service layer
│   │   ├── api/           # API-related services
│   │   ├── auth/          # Authentication services
│   │   ├── board/         # Board-related services
│   │   ├── errors/        # Error handling
│   │   ├── ghl/           # GoHighLevel integration
│   │   ├── location/      # Location services
│   │   ├── task/          # Task-related services
│   │   └── team/          # Team management services
│   │
│   ├── store/             # State management (Zustand)
│   ├── styles/            # Global styles and themes
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root React component
│   ├── index.css          # Global styles
│   ├── main.tsx          # Application entry point
│   └── vite-env.d.ts     # Vite environment types
│
├── supabase/              # Supabase configuration
│   └── migrations/       # Database migrations
│
├── .env                   # Environment variables
├── .gitignore            # Git ignore configuration
├── eslint.config.js      # ESLint configuration
├── package.json          # Project dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.app.json     # TypeScript configuration for app
├── tsconfig.json         # Main TypeScript configuration
├── tsconfig.node.json    # TypeScript configuration for Node
└── vite.config.ts        # Vite configuration
```

## Key Directories and Their Purposes

### `/src/components`
Contains all React components organized by feature or functionality:
- `Attachments/`: File and link attachment handling
- `auth/`: Authentication-related components
- `Board/`: Board management and display
- `Comments/`: Comment system for tasks
- `Contacts/`: Contact management from GHL
- `Dashboard/`: Main dashboard views
- `PrivateBoards/`: User-specific private boards
- `Task/`: Task management components
- `Team/`: Team member management
- `ui/`: Reusable UI components

### `/src/services`
Houses all service-layer code:
- `api/`: API client and request handling
- `auth/`: Authentication services
- `board/`: Board and list management
- `ghl/`: GoHighLevel integration
- `task/`: Task management services
- `team/`: Team member services

### `/src/hooks`
Custom React hooks for shared logic:
- Task management
- Authentication
- Data synchronization
- Real-time updates
- Form handling

### `/src/store`
Zustand store configurations:
- `authStore`: Authentication state
- `boardStore`: Board management
- `teamStore`: Team member management
- `contactStore`: Contact management
- `customFieldsStore`: Custom fields configuration
- `locationStore`: Location management
- `apiStore`: API configuration

### `/src/types`
TypeScript type definitions:
- Database models
- API responses
- Component props
- Store states

## Component Organization

Components are organized following a feature-first approach:
- Main component file
- Related sub-components
- Feature-specific hooks
- Feature-specific types
- Shared utilities

## State Management

The application uses Zustand for state management:
- Persistent stores for configuration
- Real-time synchronization
- Optimistic updates
- Error handling
- Loading states

## Database Structure

The database schema includes:
- Shared boards and tasks
- Private boards and tasks
- Comments system
- Custom fields
- Team members
- Contacts

## GHL Integration

Comprehensive integration with GoHighLevel:
- Task synchronization
- Contact management
- Team member management
- OAuth authentication
- Webhook handling

## Build and Configuration

The project uses:
- Vite for build tooling
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code linting
- PostCSS for CSS processing
- Supabase for database and real-time features