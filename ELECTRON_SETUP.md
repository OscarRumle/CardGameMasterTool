# Electron Desktop App Setup

Your Card Game Master Tool has been converted to an Electron desktop application!

## Quick Start (One-Time Setup)

1. **Install dependencies** (only needed once):
   ```bash
   npm install
   ```

2. **Build the .exe file**:
   ```bash
   npm run build:exe
   ```

3. **Find your .exe**:
   - Look in: `dist-electron/`
   - File: `Card Game Master Tool Setup.exe`
   - Double-click to install and run!

## Development Mode (Faster)

For quick testing without building .exe:

```bash
npm run electron:dev
```

This opens the app in a desktop window instantly. Changes auto-reload!

## Available Commands

| Command | What it does |
|---------|-------------|
| `npm run electron:dev` | Open app in window (fast, for testing) |
| `npm run build:exe` | Create Windows .exe installer |
| `npm run electron:build` | Build for all platforms |

## Your New Workflow

1. **Pull latest changes** from repo
2. Run `npm run electron:dev` to see changes instantly
3. OR run `npm run build:exe` to get fresh .exe

## File Structure

```
CardGameMasterTool/
├── electron/
│   └── main.js           # Electron entry point
├── src/                  # Your React app (unchanged)
├── dist-electron/        # Built .exe files (after build)
└── package.json          # Updated with Electron config
```

## Troubleshooting

**Problem:** `npm run build:exe` fails
- **Solution:** Make sure you ran `npm install` first

**Problem:** .exe won't open
- **Solution:** Windows might block it. Right-click > Properties > Unblock

**Problem:** Changes not showing in .exe
- **Solution:** Run `npm run build:exe` again to rebuild

## Notes

- The .exe is about 150MB (includes everything - no browser needed)
- First install creates desktop shortcut
- Each rebuild overwrites previous .exe
- You can uninstall from Windows Settings like any program
