# Nibble

Five-minute, beginner-friendly algorithm practice. This Expo app uses the supplied Figma Make designs for its visual style. It has 13 playable lessons across arrays, strings, trees, search, and dynamic programming, with Easy, Medium, and Hard questions. Lessons use short choices, visual tree traversal, and code assembly. The beaver mascot is composed from the supplied SVG artwork.

`frontend/` is the Expo app. `backend/` serves Gemini chat and account progress. Keep API keys and database credentials only in `backend/.env`.

## Run the demo on this Mac

Requirements: Node.js 22+ and npm. Xcode is not currently installed on this Mac, so use the web target for the presentation. The same React Native code can run on iOS once Xcode and an iOS Simulator are installed.

```bash
cd "/Users/angelacheng/nibble"
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run web
```

Open the URL printed by Expo. For a phone-sized presentation window, set the browser viewport to about **390 × 844**. The lessons work without a Gemini key, and the first Ask Nibble hint has an authored fallback. You can replay completed lessons.

## Auth0 sign in for the web demo

The **You** tab has Sign up, Log in, and Sign out actions powered by the official Auth0 React SDK. Redirects use the current site origin. For the local demo, add `http://localhost:8081/` to the Auth0 SPA's Allowed Callback URLs and Allowed Logout URLs, and `http://localhost:8081` to Allowed Web Origins. Add the deployed HTTPS origin to those three settings before publishing. After Auth0 returns to the home screen, open **You** to see the signed-in profile.

Auth0 currently covers the browser demo. The iOS and Android app can use Auth0's React Native SDK after creating a Native application, adding bundle/package identifiers and callback URLs, and building a development client. Expo Go cannot load that native SDK.

## Account progress with Tiger Data

The default demo saves guest progress on this device. Signed-in progress is account-specific in local storage until cloud sync is configured. To turn on account sync:

1. Create a Tiger Data PostgreSQL service using Shared / Free compute and download its connection string.
2. In Auth0, create an API named `Nibble API` with identifier `https://nibble-api`.
3. Add `DATABASE_URL` (the Tiger Data connection string), `AUTH0_ISSUER_BASE_URL`, and `AUTH0_AUDIENCE=https://nibble-api` to `backend/.env`. See `backend/.env.example`. The backend includes Tiger Data's CA certificate for verified TLS.
4. Add `EXPO_PUBLIC_PROGRESS_API_URL=http://127.0.0.1:8787` and `EXPO_PUBLIC_AUTH0_AUDIENCE=https://nibble-api` to `frontend/.env`. Restart both `npm run hints` and `npm run web`.

The backend verifies Auth0 access tokens and uses the verified user ID for all progress queries. Each completed or replayed lesson records a practice date. XP is awarded once per distinct lesson. The **You** tab shows whether progress is saved to the account or this device. Existing guest progress is kept locally and is not imported into an account.

## Ask Nibble chat

Each lesson question has an **Ask Nibble** chat. The learner can ask for a hint, ask about the algorithm pattern, or type a follow-up question. Gemini receives the current exercise and recent chat turns; the backend instructs it to coach without revealing the solution. The questions and answers are authored locally. The first hint has an authored fallback if Gemini is unavailable.

Put the key in `backend/.env` as `GEMINI_API_KEY=...`; never put it in an `EXPO_PUBLIC_` variable or mobile source. `.env` files are ignored by Git. In a second terminal at the project root, run:

```bash
npm run hints
```

Set `EXPO_PUBLIC_HINT_API_URL=http://127.0.0.1:8787/hint` in `frontend/.env` and restart `npm run web`. The chat uses the same server at `/chat`. The server listens on `127.0.0.1:8787` for the Mac demo. A physical phone would need a reachable server address.

## Deploy the web demo

The production site is `https://nibble.wiki`. In the Auth0 SPA application settings, keep the local entries and add:

| Setting | Production value |
| --- | --- |
| Allowed Callback URLs | `https://nibble.wiki/` |
| Allowed Logout URLs | `https://nibble.wiki/` |
| Allowed Web Origins | `https://nibble.wiki` |

Deploy the GitHub repository as **one Vercel project**, with the repository root as the Root Directory and Framework Preset **Other**. The root `vercel.json` exports the Expo web app to `frontend/dist`, keeps deep links working, and deploys the four Node functions in `api/`. Keep the local `.env` files for rehearsal; Git ignores them.

In Vercel Project Settings → Environment Variables, set these **private** values for Production (and Preview if you will test preview deployments):

| Name | Value |
| --- | --- |
| `GEMINI_API_KEY` | Your Gemini key |
| `DATABASE_URL` | Your Tiger Data PostgreSQL connection string |
| `AUTH0_ISSUER_BASE_URL` | Your Auth0 tenant URL, ending in `/` |
| `AUTH0_AUDIENCE` | `https://nibble-api` |
| `FRONTEND_ORIGIN` | `https://nibble.wiki` |

The web app calls `/api/hint`, `/api/chat`, `/api/progress`, and `/api/practice` on its own origin; public API URL variables are unnecessary on Vercel. If you use a different Auth0 tenant or API identifier, also set `EXPO_PUBLIC_AUTH0_DOMAIN`, `EXPO_PUBLIC_AUTH0_CLIENT_ID`, and `EXPO_PUBLIC_AUTH0_AUDIENCE` at build time. The current demo Auth0 values are the defaults. Keep the Gemini key and database URL out of `EXPO_PUBLIC_` variables.

Add `nibble.wiki` in Vercel Project Settings → Domains. In Porkbun DNS, replace the parking records with the exact A/CNAME records Vercel shows, then wait for Vercel to verify the domain and issue HTTPS. Leave Porkbun's nameservers unchanged. Finally test sign in, Ask Nibble on a tree question, a completed lesson, and progress after refresh at `https://nibble.wiki`. The in-memory chat limit is best effort across Vercel Function instances; add a platform rate limit for a public launch.

## Checks

```bash
npm run typecheck
npm run lint
npm run export:web
```
