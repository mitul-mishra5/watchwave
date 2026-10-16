# WatchWave movie media setup

The catalogue now contains eight real Blender Open Movies. To avoid unreliable third-party sample URLs, the player expects each movie as a local MP4 under `apps/web/public/videos/`.

## 1. Download the movie files

Use the official movie pages below and choose a downloadable MP4 version where available. Keep the downloaded video files; do not save the HTML page or a ZIP archive under an `.mp4` filename.

| Catalogue title | Official source | Required local filename |
|---|---|---|
| Big Buck Bunny (2008) | https://peach.blender.org/download/ | `big-buck-bunny.mp4` |
| Sintel (2010) | https://durian.blender.org/download/ | `sintel.mp4` |
| Elephants Dream (2006) | https://orange.blender.org/download/ | `elephants-dream.mp4` |
| Tears of Steel (2012) | https://mango.blender.org/download/ | `tears-of-steel.mp4` |
| Spring (2019) | https://studio.blender.org/projects/spring/ | `spring.mp4` |
| Sprite Fright (2021) | https://studio.blender.org/projects/sprite-fright/ | `sprite-fright.mp4` |
| Charge (2022) | https://studio.blender.org/projects/charge/ | `charge.mp4` |
| Cosmos Laundromat: First Cycle (2015) | https://studio.blender.org/projects/cosmos-laundromat/ | `cosmos-laundromat.mp4` |

Some official pages offer several resolutions or package formats. Prefer MP4 with H.264 video and AAC audio for Chrome compatibility. Downloading the full movies can take significant disk space. If an official page only offers a video player or an archive, use its official download option rather than guessing a media URL. Do not bypass access controls.

## 2. Put the files in the expected folder

Create this folder if it does not exist:

`apps/web/public/videos/`

Place the eight MP4s in that folder with the exact filenames in the table. Next.js serves them at `/videos/<filename>`.

## 3. Verify the files

From the project root in Windows PowerShell, run:

```powershell
.\scripts\check-videos.ps1
```

The script reports any missing or suspiciously small files. It does not download movies automatically and cannot verify their content or licensing.

## 4. Start WatchWave

From the project root:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. Each catalogue entry now uses a different local URL. If a video is missing, the room player displays a message naming the missing film.

## Licensing and attribution

These are Blender Open Movies, but each release has its own license and attribution requirements. Check the license on each official page before redistributing the video files or deploying WatchWave publicly. The project ZIP intentionally does not bundle the films.
