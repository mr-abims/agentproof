# AgentProof Logo Assets

Production-ready logo files for AgentProof. Use the SVGs wherever possible — they scale to any size and stay crisp.

## SVG files (vector — preferred)

| File | Use |
|---|---|
| `agentproof-mark.svg` | Primary mark, full color. Use on dark surfaces. |
| `agentproof-mark-mono-light.svg` | Monochrome, light fill. Single-color print, accents. |
| `agentproof-mark-mono-dark.svg` | Monochrome, dark fill. Use on light surfaces, audit reports, watermarks. |
| `agentproof-mark-verified.svg` | All-green variant. Use *only* inside "verified" affordances (badges, success states). |
| `agentproof-lockup-dark.svg` | Horizontal mark + wordmark, dark mode. 320×80 viewBox. |
| `agentproof-lockup-light.svg` | Horizontal mark + wordmark, light mode. 320×80 viewBox. |
| `agentproof-app-icon.svg` | Mark on midnight squircle plate. 512×512 viewBox. |

## PNG files (raster)

In `png/`. Use the SVG above if your target supports it — these are for places that need raster (favicons, app stores, image-only embeds).

- `agentproof-mark-{16,32,64,128,256,512,1024}.png` — primary mark, transparent bg
- `agentproof-app-icon-{180,192,512,1024}.png` — squircle app icon (iOS 180, Android 192, app stores 512/1024)
- `agentproof-mark-mono-light-{64,256}.png` — light monochrome on transparent
- `agentproof-mark-mono-dark-{64,256}.png` — dark monochrome on transparent
- `agentproof-lockup-{dark,light}-{320,640,1280}.png` — horizontal lockup @1x/2x/4x

## Brand colors

Beams gradient: `#7cd0f0` → `#a98be5` (cyan → violet)
Check gradient: `#7be39e` → `#52cca0` (verified green)
Ground / surface: `#16182a` (midnight)

## Clear-space rule

Reserve a margin equal to the height of the focal node on all sides of the mark. Don't crowd it.

## Don'ts

- Don't rotate the mark.
- Don't recolor the check — it must read as verified-green.
- Don't drop the beams — they're the "private inputs" half of the story.
- Don't distort the proportions.
- Don't place on busy imagery without a solid plate.

## HTML usage

Favicon:
```html
<link rel="icon" type="image/svg+xml" href="/logo/agentproof-mark.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/logo/png/agentproof-mark-32.png">
<link rel="apple-touch-icon" href="/logo/png/agentproof-app-icon-180.png">
```

Inline (preserves crispness, allows CSS color overrides):
```html
<img src="/logo/agentproof-mark.svg" alt="AgentProof" width="32" height="32">
```
