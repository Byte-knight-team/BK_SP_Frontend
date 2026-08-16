# BK_SP_Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Frontend application for the **BK Software Project** restaurant system.


## Project Overview

This frontend is the UI layer for the restaurant platform and consumes backend APIs for authentication, menu, orders, and role-based operations.

- Staff side: role-based dashboards and management workflows
- Customer Online/QR side flows

For domain rules and deeper architecture details, refer to the backend (https://github.com/Byte-knight-team/BK_SP_Backend) README.

## Tech Stack

- React 19 + Vite
- React Router (v7)
- Tailwind CSS (v4)
- React Query (Data Fetching/Caching)
- React Hook Form + Zod (Form Validation)
- Framer Motion (Animations)
- Recharts (Analytics Charts)
- StompJS / SockJS (WebSockets)
- Stripe React SDK (Secure Payments)
- ESLint + Prettier
- Vitest + Testing Library

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   Copy `.env.example` to `.env` and set values.

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to `http://localhost:5173`

## Environment Variables

Defined in .env.example:

- VITE_API_BASE_URL
  - Backend base URL.
  - If empty, frontend API helper falls back to http://localhost:8080.

- VITE_CLOUDINARY_CLOUD_NAME
  - Cloudinary cloud name for image uploads.

- VITE_CLOUDINARY_UPLOAD_PRESET
  - Cloudinary upload preset.

- VITE_GOOGLE_MAPS_CUSTOMER_API_KEY
  - Google Maps API Key used for the customer location picker.
  - If omitted, the location picker map will not display.

- VITE_STRIPE_PUBLISHABLE_KEY
  - Stripe publishable key (pk_test_...) used for secure payment element rendering.

## Available Scripts

- `npm run dev`: Start local dev server
- `npm run build`: Build production bundle
- `npm run preview`: Preview built app
- `npm run lint`: Run ESLint
- `npm run test`: Run tests in watch mode
- `npm run coverage`: Run tests with coverage

## Auth Model

- Staff auth uses token helpers in src/utils/authToken.js and protected routes.
- Customer auth uses customer_jwt in localStorage for protected customer routes.
- QR sessions use qr_session_token and can be upgraded to customer_jwt via OTP flow.

## API Integration

API helper location: src/apis/apiHelper.js

- buildApiUrl(path): creates absolute backend URL
- authFetch(...): authenticated staff requests + session handling
- customerApiFetch(...): public customer requests
- customerAuthFetch(...): customer authenticated requests with customer_jwt

## Project Structure (High Level)

- src/pages
  - Role-based pages and customer pages
- src/components
  - Shared and role-specific components
- src/apis
  - API wrappers and endpoint helpers
- src/context
  - Global app context (for example cart state)
- src/layouts
  - Main and role-specific layouts

## Real-Time Architecture (WebSockets)

The frontend uses **STOMP over WebSockets** to provide live UI updates without polling:
- **`GlobalNotificationProvider.jsx`**: Listens to global user topics to trigger instant toast notifications (e.g., order placed, payment refunded).
- **`useOrderStatusWebSocket`**: A custom hook that listens to specific order topics. It patches the local React state in real-time, instantly updating the UI on pages like `OrderConfirmationPage`.

## Stripe Payments

We use the **Stripe React SDK** to render secure `Payment Elements` for card transactions. The frontend securely collects payment details and relies on Stripe's redirect flow and backend webhooks to finalize the payment status.

---

## License

This project is licensed under the MIT License.
