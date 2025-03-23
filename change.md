Below is a detailed step-by-step plan to implement the signup/login feature with phone number and OTP authentication using Google Firestore (via Firebase) in your Inventory Management app. This plan assumes you're starting from your existing codebase and will guide you through each task, focusing on practical steps to achieve the desired outcome.

---

### Step-by-Step Plan

#### Step 1: Set Up Firebase Project
1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Click "Add Project," name it (e.g., "InventoryApp"), and follow the setup prompts.
   - Enable Authentication and Firestore Database in the Firebase Console.

2. **Enable Phone Authentication**:
   - In the Firebase Console, go to Authentication > Sign-in method.
   - Enable "Phone" as a sign-in provider.
   - Configure reCAPTCHA (Firebase provides an invisible reCAPTCHA by default for web apps).

3. **Get Firebase Configuration**:
   - In the Firebase Console, go to Project Settings.
   - Under "Your apps," add a web app (register it with a nickname like "InventoryWeb").
   - Copy the Firebase config object (containing `apiKey`, `authDomain`, etc.).

#### Step 2: Install and Configure Firebase in Your Project
1. **Install Firebase**:
   - Open your terminal in the project root.
   - Run: `npm install firebase`.

2. **Create Firebase Config File**:
   - Create a new file: `lib/firebase.ts`.
   - Add the Firebase initialization logic:
     - Paste your Firebase config object from the console.
     - Initialize Firebase and export `auth` and `db` (Firestore) instances.

3. **Add Environment Variables** (Optional for Security):
   - Create a `.env.local` file in the root directory.
   - Add your Firebase config as environment variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).
   - Update `lib/firebase.ts` to use these variables instead of hardcoding.

#### Step 3: Create Authentication Context
1. **Create Auth Context File**:
   - Create `contexts/auth-context.tsx`.
   - Define an `AuthContext` with a type for user state (e.g., `user`, `loading`, `signInWithPhone`, `signOut`).
   - Implement an `AuthProvider` component that uses Firebase’s `onAuthStateChanged` to track the user.

2. **Set Up Context Logic**:
   - Use `useState` for `user` (Firebase `User` object or null) and `loading`.
   - Add a `signInWithPhone` function placeholder (to be implemented later).
   - Add a `signOut` function using Firebase’s `signOut(auth)`.

#### Step 4: Create Login/Signup Page
1. **Create Auth Page**:
   - Create `app/auth/page.tsx`.
   - Set up a basic layout with a heading ("Login / Sign Up").

2. **Design Phone Number Input**:
   - Add an input field for the phone number (use your existing `Input` component).
   - Include a "Send OTP" button (`Button` component).

3. **Design OTP Input**:
   - Add a conditional section (visible after OTP is sent) with an OTP input field (consider using `input-otp` from your dependencies).
   - Include a "Verify OTP" button.

4. **Add reCAPTCHA Container**:
   - Add a `<div id="recaptcha-container"></div>` for Firebase’s invisible reCAPTCHA.

#### Step 5: Implement Phone Authentication Logic
1. **Handle Phone Number Submission**:
   - In `app/auth/page.tsx`, add state for phone number and OTP (`useState`).
   - On "Send OTP" click:
     - Validate the phone number format (e.g., using a regex).
     - Use Firebase’s `signInWithPhoneNumber` with the phone number and reCAPTCHA verifier.

2. **Set Up reCAPTCHA**:
   - Initialize Firebase’s `RecaptchaVerifier` in a `useEffect` hook in `app/auth/page.tsx`.
   - Pass the verifier to `signInWithPhoneNumber`.

3. **Handle OTP Verification**:
   - After sending OTP, store the `ConfirmationResult` from `signInWithPhoneNumber`.
   - On "Verify OTP" click:
     - Call `confirmationResult.confirm(otp)` to authenticate the user.
     - Handle success (e.g., redirect) and errors (e.g., show toast with `sonner`).

#### Step 6: Protect Routes and Update Layout
1. **Modify Root Layout**:
   - Open `app/layout.tsx`.
   - Wrap the `{children}` with `AuthProvider` from `contexts/auth-context.tsx`.
   - Add logic to check auth state and redirect:
     - Use `useContext(AuthContext)` and `useRouter`.
     - If `user` is null and not loading, redirect to `/auth`.
     - If `user` exists and on `/auth`, redirect to `/`.

2. **Protect Dashboard**:
   - Open `app/page.tsx`.
   - Use a custom hook (e.g., create `hooks/use-auth.tsx`) to access auth state.
   - Redirect to `/auth` if unauthenticated.

#### Step 7: Update Sidebar Navigation
1. **Modify Sidebar**:
   - Open `components/sidebar.tsx`.
   - Use `useContext(AuthContext)` to get the user state.
   - Conditionally render navigation items:
     - Show only a "Login" link (pointing to `/auth`) if unauthenticated.
     - Show full navigation (Dashboard, Inventory, etc.) if authenticated.

2. **Handle Logout**:
   - Add a "Logout" item to `bottomNavigation` in `sidebar.tsx`.
   - On click, call the `signOut` function from `AuthContext`.

#### Step 8: Handle Post-Login Redirect
1. **Redirect After Login**:
   - In `app/auth/page.tsx`, after successful OTP verification:
     - Use `useRouter` from `next/navigation`.
     - Redirect to `/` (dashboard).

2. **Persist Session**:
   - Ensure `onAuthStateChanged` in `auth-context.tsx` updates the `user` state on page reloads.

#### Step 9: Test and Refine
1. **Test the Flow**:
   - Start the app (`npm run dev`).
   - Verify that `/auth` is the default page.
   - Test phone number input, OTP sending, and verification with a real phone number.
   - Check redirects work (unauthenticated → `/auth`, authenticated → `/`).

2. **Handle Edge Cases**:
   - Add error handling for invalid phone numbers, expired OTPs, etc., using toast notifications.


#### Step 10: Final Touches
1. **Style the Auth Page**:
   - Use Tailwind CSS classes from `styles/globals.css` to match your app’s theme.
   - Ensure responsiveness (e.g., adjust layout for mobile).

2. **Update Dependencies**:
   - Open `package.json`.
   - Verify `firebase` is listed under `dependencies`.

3. **Commit Changes**:
   - Stage and commit your changes with a clear message (e.g., "Add phone auth with Firebase").

---