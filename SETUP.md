# Running Innovation Blood Donation Platform in VS Code

## Prerequisites

Make sure you have the following installed:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Git** (optional, for version control)

## Setup Steps

### 1. Download the Project Files
- Download all project files from Bolt
- Extract them to a folder on your computer (e.g., `innovation-blood-donation`)

### 2. Open in VS Code
```bash
# Navigate to the project directory
cd innovation-blood-donation

# Open in VS Code
code .
```

### 3. Install Dependencies
Open the integrated terminal in VS Code (`Ctrl+`` or `View > Terminal`) and run:

```bash
# Install all dependencies
npm install
```

### 4. Environment Setup
Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your API keys:
```env
# Tavus API Configuration
VITE_TAVUS_API_KEY=your_tavus_api_key_here
VITE_TAVUS_REPLICA_ID=your_replica_id_here

# Other API Keys
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

**Note:** The app will work in demo mode without real API keys.

### 5. Start the Development Server
```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

## Recommended VS Code Extensions

Install these extensions for better development experience:

1. **ES7+ React/Redux/React-Native snippets**
2. **Tailwind CSS IntelliSense**
3. **TypeScript Importer**
4. **Auto Rename Tag**
5. **Prettier - Code formatter**
6. **ESLint**
7. **GitLens** (if using Git)

## Project Structure

```
innovation-blood-donation/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── contexts/           # React contexts (Auth, ICP)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services (Tavus, HeyGen)
│   ├── types/              # TypeScript type definitions
│   └── data/               # Static data and configurations
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Features

- **Blockchain Integration**: Internet Computer Protocol for transparent donation records
- **AI Video Agent**: Tavus-powered Dr. Vita for interactive learning
- **Real-time Chat**: Conversational AI assistant
- **Premium Features**: Advanced matching, analytics, and enterprise tools
- **Video Tutorials**: Comprehensive learning platform
- **Responsive Design**: Works on desktop and mobile

## Troubleshooting

### Common Issues:

1. **Port already in use**: Change the port in `vite.config.ts` or kill the process using the port
2. **Module not found**: Run `npm install` again
3. **TypeScript errors**: Check that all dependencies are installed correctly
4. **Tailwind styles not working**: Ensure Tailwind CSS extension is installed

### Getting Help:

- Check the browser console for errors
- Review the terminal output for build errors
- Ensure all environment variables are set correctly