# BioSprint Engine — Google OAuth 2.0 & GIS Setup Guide

**Document ID:** GOOG-AUTH-2026-001  
**Target Platform:** BioSprint Engine (Web & Mobile Capacitor)  
**Security Standard:** Google Identity Services (GIS), OpenID Connect (OIDC), OAuth 2.0  
**Compliance Reference:** FDA 21 CFR Part 11 Electronic Signatures & Identity Verification  

---

## 1. Overview

BioSprint Engine utilizes **Google Identity Services (GIS)** for first-time account registration, identity verification, and access-code account recovery. 

When a researcher clicks **"Continue with Google"**, Google securely verifies the user's institutional identity and returns a cryptographically signed **Google ID Token (JWT)**. The BioSprint backend verifies this token against Google's public key infrastructure, authenticates the verified email, extracts the real name and avatar, and binds the account to an authoritative role.

---

## 2. Google Cloud Console Configuration Steps

To configure Google Sign-In for your local development and production environments, follow these exact steps in Google Cloud Console:

### Step 1: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown at the top and click **New Project**.
3. Enter Project Name: `BioSprint-Engine` (or your university/institution name).
4. Click **Create** and ensure the new project is selected.

### Step 2: Configure OAuth Consent Screen
1. In the left navigation menu, go to **APIs & Services** > **OAuth consent screen**.
2. Select User Type:
   - **Internal**: If deploying within a university or institutional Google Workspace domain.
   - **External**: For testing with any `@gmail.com` or university Google account.
3. Click **Create**.
4. Fill in the required application details:
   - **App name:** `BioSprint Engine`
   - **User support email:** Select your Google account email.
   - **Developer contact information:** Enter your email.
5. Click **Save and Continue**.
6. On the **Scopes** page, click **Add or Remove Scopes** and select:
   - `.../auth/userinfo.email` (See your primary Google Account email address)
   - `.../auth/userinfo.profile` (See your personal info, including any personal info you've made publicly available)
   - `openid` (Associate you with your personal info on Google)
7. Click **Save and Continue**.
8. If **External** was selected, add your test email addresses under **Test users** and click **Save and Continue**.

### Step 3: Create OAuth 2.0 Client Credentials
1. In the left navigation menu, go to **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. In the **Application type** dropdown, select **Web application**.
4. Set **Name:** `BioSprint Web Client`.
5. Under **Authorized JavaScript origins**, add the following exact URLs:
   - `http://localhost:3000` *(BioSprint Original Real App)*
   - `http://localhost:5000` *(BioSprint Original Backend API)*
   - `http://localhost:3001` *(BioSprint Faculty Demo App)*
   - `http://localhost:5001` *(BioSprint Faculty Demo Backend API)*
   - *(If deploying to cloud/Vercel, add your production origin, e.g. `https://your-domain.vercel.app`)*
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:3001/auth/callback`
7. Click **CREATE**.
8. A modal will appear displaying your **Client ID** and **Client Secret**. Copy both values.

---

## 3. Environment Variables Configuration

### Frontend Configuration (`.env` in project root)
Create or edit `.env` in the root `BIOSPRINT/` folder:

```bash
# BioSprint Engine Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
```

### Backend Configuration (`server/.env`)
Edit `server/.env`:

```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=biosprint_super_secret_jwt_key_fair_provenance_2026_laboratory
DB_FILE=data/biosprint.db
UPLOADS_DIR=uploads
CLIENT_ORIGIN=http://localhost:3000

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

---

## 4. Verification Workflow

1. Start the backend:
   ```powershell
   cd server
   npm start
   ```
2. Start the frontend:
   ```powershell
   npm run dev
   ```
3. Open `http://localhost:3000`.
4. Click **"Continue with Google"**.
5. Google's official sign-in dialog opens. Select your Google account.
6. Upon authentication, Google issues a signed ID token to the BioSprint client.
7. The BioSprint backend verifies the token directly with Google (`https://oauth2.googleapis.com/tokeninfo`), creates your real account with your actual name, email, and Google avatar, and enrolls you in the baseline **Research Scientist** role.
8. Set your personal BioSprint Access Code (minimum 6 characters).
9. You enter the clean, real BioSprint Engine with your genuine credentials!

---

## 5. Security & Compliance Principles

- **No Shared Passwords**: Credentials are never sent in plaintext. Google ID tokens are verified cryptographically via Google's OAuth2 endpoints.
- **Client Secret Isolation**: `GOOGLE_CLIENT_SECRET` resides strictly on the backend (`server/.env`) and is never exposed in client bundles.
- **No Self-Elevation**: Newly registered Google accounts receive the default baseline role (`Research Scientist`). Elevated roles (Principal Investigator or System Administrator) must be granted by an authorized Administrator in compliance with 21 CFR Part 11.
