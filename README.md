# Nibble

Five-minute, beginner-friendly algorithm practice. This Expo app uses the supplied Figma Make designs for its visual style. The starting path has three playable lessons based on LeetCode #1 Two Sum, #20 Valid Parentheses, and #3 Longest Substring Without Repeating Characters. Each lesson ends with a code assembly question: drag lines into the solution, drag them out to undo, or tap them. The beaver mascot is composed from the supplied SVG artwork.

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

Open the URL printed by Expo. For a phone-sized presentation window, set the browser viewport to about **390 × 844**. The app works without a Gemini key. You can replay the lesson; use **You → Reset demo progress** to rehearse the first-time completion reward.

## Auth0 sign in for the web demo

The **You** tab has Sign up, Log in, and Sign out actions powered by the official Auth0 React SDK. The configured Auth0 SPA uses `http://localhost:8081/` for its callback and logout URLs, so run `npm run web` on that port and open the app at `http://localhost:8081/`. After Auth0 returns to the home screen, open **You** to see the signed-in profile.

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

## Checks

```bash
npm run typecheck
npm run lint
npm run export:web
```
