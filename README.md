# BK_SP_Frontend

Frontend application for the Byte Knights restaurant system.


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
- ESLint + Prettier
- Vitest + Testing Library

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

1. Install dependencies:

   npm install

2. Create environment file:

   Copy .env.example to .env and set values.

3. Start development server:

   npm run dev

4. Open browser:

   http://localhost:5173

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

## Available Scripts

- npm run dev
  - Start local dev server

- npm run build
  - Build production bundle

- npm run preview
  - Preview built app

- npm run lint
  - Run ESLint

- npm run test
  - Run tests in watch mode

- npm run coverage
  - Run tests with coverage


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

