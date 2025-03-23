# Financial Dashboard

A modern financial dashboard with inventory management, built with Next.js, React, and IndexedDB.

## Features

- **Inventory Management**: Track items, manage stock levels, and generate labels
- **Bulk Upload**: Import inventory items using CSV files
- **Masters Management**: Configure dropdowns for categories, metals, purity, etc.
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Uses IndexedDB for client-side data storage

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd financial-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project can be easily deployed on Vercel:

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Import the project on [Vercel](https://vercel.com)
3. Deploy with default settings

## Project Structure

```
financial-dashboard/
├── app/                    # Next.js app directory
│   ├── inventory/          # Inventory management pages
│   ├── masters/            # Masters management pages
│   └── ...                 # Other app pages
├── components/             # React components
│   ├── inventory/          # Inventory-related components
│   ├── ui/                 # UI components
│   └── ...                 # Other components
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and database schema
├── public/                 # Static assets
└── styles/                 # Global styles
```

## Local Data Storage

This application uses IndexedDB (via Dexie.js) for client-side data storage. Data is stored locally in the user's browser.

**Important Note**: 
- Data is stored only in the browser and doesn't sync between devices
- Clearing browser data will erase all application data
- For production use with data sharing, consider adding a backend database

## CSV Format for Bulk Upload

When using the bulk upload feature, your CSV file should have the following format:

**Headers:**
```
category,name,description,quantity,cost,supplier,weight,metal,purity
```

**Example:**
```
Necklace,,"Gold chain necklace, 24 inch",10,12500,"Chains Corner",15.5,Gold,91.6
```

## License

[MIT](LICENSE) 