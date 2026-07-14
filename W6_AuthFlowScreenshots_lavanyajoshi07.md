# Screenshot Guide - Week 6 Authentication & Security Module

This guide details the checklist of required screenshots to assemble into your `W6_AuthFlowScreenshots_lavanyajoshi07.pdf`.

---

## 📸 Checklist & Instructions

### 1. Registration Form
- **Where to Capture:** Go to `http://localhost:3000/auth/register` (or `http://localhost:3000/register` which redirects).
- **What to Capture:** Capture the registration inputs (Name, Email, Password, Confirm Password) showing the password strength requirements.

### 2. Registration Success
- **Where to Capture:** After successfully submitting a new account on the registration form.
- **What to Capture:** The visual redirect state or direct entrance to the onboarding dashboard showing that the account creation was successful.

### 3. Login Form
- **Where to Capture:** Go to `http://localhost:3000/auth/login` (or `/login`).
- **What to Capture:** The empty login form or pre-filled credentials ready to sign in.

### 4. Network Tab showing JWT
- **Where to Capture:** Log in using credentials, open Chrome Developer Tools (F12) ➔ **Network** tab.
- **What to Capture:** Filter by `/api/auth/login` request. Highlight the response headers or request payload containing the authorization cookies (`auth_token`) or JWT payloads.

### 5. Protected Page Redirecting to `/login`
- **Where to Capture:** Log out completely, then manually navigate to a protected page (e.g. `http://localhost:3000/dashboard` or `/analyzer`).
- **What to Capture:** Capture the rapid loader screen or instant URL redirection pushing you back to `/auth/login`.

### 6. Google OAuth Consent Screen
- **Where to Capture:** Click "Continue with Google" on the login or registration forms.
- **What to Capture:** Google's official accounts chooser consent screen displaying your Developer App credentials.

### 7. Logged In After Google
- **Where to Capture:** Click your Google account to log in, and wait for redirection.
- **What to Capture:** The application dashboard page showing your Google user name or profile avatar in the upper right.

### 8. Rate Limit 429 Response
- **Where to Capture:** Attempt login or registration with wrong info more than 5 times within 15 minutes.
- **What to Capture:** The network response showing HTTP status code `429 Too Many Requests` (or standard `429` error response on screen).
