Below is a detailed database schema design for your Inventory Management app using IndexedDB with Dexie.js as the middleware, followed by a step-by-step implementation plan to integrate it with your existing frontend. This schema will support the key functionalities of your app (e.g., customers, inventory, invoices, purchases, analytics) while ensuring efficient local storage and retrieval.

---

### Database Schema for IndexedDB

#### Overview
The schema is designed to mirror your app’s core entities and relationships, optimized for local storage with IndexedDB. Each table (store) will have a primary key and indexed fields for fast querying. Dexie.js will handle the abstraction over IndexedDB.

#### Tables (Stores)

1. **Users**
   - **Purpose**: Stores user authentication and profile data.
   - **Fields**:
     - `id` (string, primary key, auto-generated or Firebase UID)
     - `phone` (string, indexed) - User’s phone number for auth
     - `fullName` (string)
     - `email` (string, optional)
     - `avatar` (string, URL or base64)
     - `lastLogin` (timestamp)
   - **Indexes**: `phone`

2. **Customers**
   - **Purpose**: Stores customer details for tracking and management.
   - **Fields**:
     - `id` (string, primary key, e.g., "CUST-001")
     - `name` (string, indexed)
     - `email` (string, indexed)
     - `phone` (string, indexed)
     - `address` (string)
     - `reference` (string)
     - `createdAt` (timestamp)
     - `updatedAt` (timestamp)
   - **Indexes**: `name`, `email`, `phone`

3. **Inventory**
   - **Purpose**: Manages inventory items and their details.
   - **Fields**:
     - `id` (string, primary key, auto-generated)
     - `sku` (string, unique, indexed) - Stock Keeping Unit
     - `name` (string, indexed)
     - `category` (string, indexed)
     - `description` (string)
     - `quantity` (number)
     - `cost` (number) - Purchase cost
     - `supplier` (string, indexed)
     - `weight` (number, optional)
     - `image` (string, base64 or URL, optional)
     - `createdAt` (timestamp)
     - `updatedAt` (timestamp)
   - **Indexes**: `sku`, `name`, `category`, `supplier`

4. **Invoices**
   - **Purpose**: Tracks invoices and booking invoices linked to customers.
   - **Fields**:
     - `id` (string, primary key, e.g., "INV-001" or "BKG-001")
     - `customerId` (string, indexed) - Foreign key to Customers
     - `type` (string, "invoice" | "booking")
     - `date` (timestamp)
     - `dueDate` (timestamp, optional)
     - `bookingDate` (timestamp, optional)
     - `amount` (number)
     - `status` (string, "paid" | "unpaid" | "overdue" | "booking")
     - `createdAt` (timestamp)
     - `updatedAt` (timestamp)
   - **Indexes**: `customerId`, `type`, `status`

5. **Purchases**
   - **Purpose**: Records purchase transactions for inventory items.
   - **Fields**:
     - `id` (string, primary key, auto-generated)
     - `itemId` (string, indexed) - Foreign key to Inventory
     - `supplier` (string, indexed)
     - `quantity` (number)
     - `cost` (number)
     - `date` (timestamp)
     - `invoiceFile` (string, base64 or URL, optional) - Uploaded invoice file
     - `createdAt` (timestamp)
     - `updatedAt` (timestamp)
   - **Indexes**: `itemId`, `supplier`

6. **Settings**
   - **Purpose**: Stores user-specific settings (mirrors `UserSettings` from your context).
   - **Fields**:
     - `id` (string, primary key, e.g., user ID)
     - `avatar` (string)
     - `fullName` (string)
     - `email` (string)
     - `phone` (string)
     - `timezone` (string)
     - `language` (string)
     - `currency` (string)
     - `dateFormat` (string)
     - `fontSize` (number)
     - `theme` (string)
     - `layout` (string)
     - `firmDetails` (object) - Subfields: `firmName`, `firmLogo`, `address`, etc.
     - `notifications` (object) - Subfields: `email`, `push`, etc.
     - `privacy` (object) - Subfields: `analyticsSharing`, etc.
     - `updatedAt` (timestamp)
   - **Indexes**: None (single-row store per user)

7. **Analytics** (Optional)
   - **Purpose**: Stores aggregated data for offline analytics (e.g., cached reports).
   - **Fields**:
     - `id` (string, primary key, auto-generated)
     - `type` (string, indexed) - e.g., "overview", "revenue"
     - `data` (object) - JSON data for charts or metrics
     - `timestamp` (timestamp)
   - **Indexes**: `type`

#### Relationships
- **Customers ↔ Invoices**: One-to-many (via `customerId`).
- **Inventory ↔ Purchases**: One-to-many (via `itemId`).
- **Users ↔ Settings**: One-to-one (via `id`).

#### Notes
- Timestamps (`createdAt`, `updatedAt`) ensure data versioning and sync tracking.
- Indexed fields enable fast lookups and filtering (e.g., searching customers by name).
- Objects (e.g., `firmDetails`) are stored as JSON, supported by IndexedDB.

---

### Step-by-Step Implementation Plan

#### Step 1: Install Dexie.js
- Open your terminal in the project root.
- Install Dexie.js by running the appropriate npm command.
- Verify the installation by checking `package.json` for the new dependency.

#### Step 2: Create Database Configuration
- Create a new file in the `lib` directory named `db.ts`.
- Import Dexie from the installed package.
- Define a class extending Dexie to represent your database (e.g., `InventoryDB`).
- In the constructor, set the database name (e.g., "InventoryDB") and initialize it.
- Define the schema using the `version` method, specifying stores and their fields/indexes as per the schema above.
- Export an instance of this class for use across the app.

#### Step 3: Set Up Database Context
- Create a new file in the `contexts` directory named `db-context.tsx`.
- Define a context (`DBContext`) with a type that includes the database instance and basic CRUD methods (e.g., `add`, `get`, `update`, `delete`).
- Create a provider component (`DBProvider`) that initializes the Dexie instance from `lib/db.ts`.
- Wrap the provider around your app’s children in the context setup.
- Add a custom hook (e.g., `useDB`) to access the context.

#### Step 4: Integrate Database Context with Frontend
- Open `app/layout.tsx`.
- Import the `DBProvider` from `contexts/db-context.tsx`.
- Wrap the existing content (including `AuthProvider`, if present) with `DBProvider` to ensure the database is available app-wide.

#### Step 5: Seed Initial Data
- Open `lib/db.ts`.
- Add a function to seed initial data (e.g., sample customers, inventory items) using Dexie’s `bulkPut` method.
- Call this function in a `useEffect` hook within `DBProvider` (in `db-context.tsx`) to run on first load, checking if the database is empty.

#### Step 6: Update Customer Management
- Open `app/customers/page.tsx`.
- Use the `useDB` hook to access the database.
- Replace the `sampleCustomers` array with a query to fetch customers from the `customers` store.
- Update the `handleDelete` function to delete from the database instead of filtering the array.
- In `app/customers/add/page.tsx` and `app/customers/edit/[id]/page.tsx`, update `handleSubmit` to add or update records in the `customers` store.

#### Step 7: Update Inventory Management
- Open `app/inventory/add/page.tsx`.
- Use the `useDB` hook to access the database.
- Update `handleSubmit` to add a new item to the `inventory` store with all relevant fields (e.g., `sku`, `quantity`).
- Add a query in a new `app/inventory/page.tsx` (if not already present) to fetch and display inventory items from the `inventory` store.

#### Step 8: Update Invoices and Purchases
- Open `app/customers/[id]/page.tsx`.
- Replace `sampleInvoices` with a query to fetch invoices from the `invoices` store, filtered by `customerId`.
- Update `handleSaveBooking` to update the `invoices` store.
- In a new `app/purchases/page.tsx` (or existing file), fetch purchases from the `purchases` store and update the UI accordingly.

#### Step 9: Sync Settings with Database
- Open `contexts/settings-context.tsx`.
- Use the `useDB` hook to access the database.
- Modify `SettingsProvider` to load initial settings from the `settings` store (using the user’s ID as the key).
- Update `updateSettings`, `updateNotificationSettings`, etc., to persist changes to the `settings` store.

---

### Additional Considerations
- **Offline Support**: Dexie.js inherently supports offline use; ensure your UI reflects this (e.g., disable sync-dependent features when offline).
- **Data Migration**: Plan for schema updates by incrementing the Dexie version and defining upgrade logic in `lib/db.ts`.
