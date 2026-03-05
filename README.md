# demo_

Audio demo player built with Expo + React Native (web, iOS, Android).

## Live

- GitHub Pages: `https://rizramen.github.io/demo_/`

## Features

- Play/pause
- Skip `-15s` / `+15s`
- Seek slider
- Responsive layout for desktop and mobile
- Track list with newest files on top
- Dynamic track manifest generated from `assets/demo_tracks`

## How Tracks Work

Drop audio files into:

`assets/demo_tracks`

Supported formats:

- `.mp3`
- `.wav`
- `.m4a`
- `.aac`
- `.ogg`
- `.flac`

Then generate/refresh the track list:

```bash
npm run refresh:tracks
```

The app reads from the generated manifest:

`src/data/tracks.generated.ts`

## Development

1. Install dependencies

```bash
npm install
```

2. Start app

```bash
npm start
```

Useful scripts:

- `npm run generate:tracks` generate manifest from audio files
- `npm run refresh:tracks` alias for generate
- `npm run ios` run on iOS simulator
- `npm run android` run on Android emulator
- `npm run web` run on web
- `npm run lint` run lint checks

## Deploy to GitHub Pages

1. Build static web output

```bash
npm run predeploy
```

2. Deploy to `gh-pages`

```bash
npm run deploy
```

Required once:

```bash
npm i -D gh-pages
```

## Project Structure

- `app/(tabs)/index.tsx` main player screen
- `scripts/generate-tracks-manifest.js` scans `assets/demo_tracks`
- `src/services/tracks.service.ts` loads and sorts tracks
- `src/hooks/useTracks.ts` track loading hook
- `src/hooks/useAudioTrackPlayer.ts` audio player hook
- `src/data/tracks.generated.ts` generated track manifest
