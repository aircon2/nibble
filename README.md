# Nibble

Five-minute, beginner-friendly algorithm practice. This Expo app is a React Native translation of the three supplied Figma Make exports: the home screen, the Two Sum question screen, and the completion screen. The beaver mascot is composed from the supplied SVG artwork.

## Run the demo on this Mac

Requirements: Node.js 22+ and npm. Xcode is not currently installed on this Mac, so use the web target for the presentation. The same React Native code can run on iOS once Xcode and an iOS Simulator are installed.

```bash
cd "/Users/angelacheng/nibble"
npm install
cp .env.example .env
npm run web
```

Open the URL printed by Expo. For a phone-sized presentation window, set the browser viewport to about **390 × 844**. The app works without a Gemini key. You can replay the lesson; use **You → Reset demo progress** to rehearse the first-time completion reward.

## Auth0 sign in for the web demo

The **You** tab has Sign up, Log in, and Sign out actions powered by the official Auth0 React SDK. The configured Auth0 SPA uses `http://localhost:8081/` for its callback and logout URLs, so run `npm run web` on that port and open the app at `http://localhost:8081/`. After Auth0 returns to the home screen, open **You** to see the signed-in profile.

Auth0 currently covers the browser demo. The iOS and Android app can use Auth0's React Native SDK after creating a Native application, adding bundle/package identifiers and callback URLs, and building a development client. Expo Go cannot load that native SDK.

## Add Gemini hints later

Gemini is used for an optional, context-aware nudge when a learner asks for help. The three questions and answer checks are authored locally so the lesson remains reliable and works offline. AI-generated question variants can be added after a human reviews their answers and difficulty.

Put the key in `.env` as `GEMINI_API_KEY=...`; never put it in an `EXPO_PUBLIC_` variable or mobile source. `.env` is ignored by Git. Uncomment `EXPO_PUBLIC_HINT_API_URL` in `.env` once the key is ready. In a second terminal, run:

```bash
npm run hints
```

Restart `npm run web` after changing `.env`. The hint button falls back to its authored hint if the server or Gemini is unavailable. The server listens on `127.0.0.1:8787` for the Mac demo. A physical phone would need a reachable server address.

## Checks

```bash
npm run typecheck
npm run lint
npx expo export --platform web
```
