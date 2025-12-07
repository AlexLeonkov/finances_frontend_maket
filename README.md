# SolarSaaS - Finance Management Frontend

A modern React + TypeScript application for managing solar installation operations, teams, warehouse, and invoices.

## Features

- 📊 **Dashboard** - Overview with KPIs, charts, and project insights
- 👥 **Teams** - Team management and performance tracking
- 📦 **Warehouse** - Inventory management with stock levels
- 🔧 **Operations** - Project and operation tracking
- 💰 **Invoices** - Invoice creation and management

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
finances_frontend/
├── src/
│   ├── components/
│   │   └── SolarSaaS.tsx    # Main application component
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles with Tailwind
├── index.html                # HTML template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
└── tailwind.config.js        # Tailwind config
```

## Development

The application uses:
- TypeScript for type safety
- Tailwind CSS for utility-first styling
- React Hooks for state management
- Responsive design for mobile and desktop

