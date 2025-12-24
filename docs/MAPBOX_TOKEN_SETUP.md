# Mapbox Access Token Setup

## Overview
The vector-draw page and other map-related features require a Mapbox access token to render tiles and enable drawing controls.

## Configuration
Store your Mapbox access token in `.env.local` at the root of the frontend workspace:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
```

**Important:**
- `.env.local` is ignored by git and should **never** be committed to the repository.
- Rotate your access token monthly for security best practices.
- Use restricted tokens with only the scopes required for your application (typically `styles:read` and `tiles:read` for frontend usage).

## Token Rotation
1. Generate a new token from [Mapbox account](https://account.mapbox.com/access-tokens/).
2. Update the value in `.env.local`.
3. Restart the Next.js dev server (`npm run dev`) to pick up the new value.
4. Revoke the old token in your Mapbox account after verifying the new token works.

## Usage in Code
Access the token in client components via:

```typescript
const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
```

This value is embedded at build time and exposed to the browser. Never use secret tokens or keys with the `NEXT_PUBLIC_` prefix.
