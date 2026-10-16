# 🌌 WatchWave — Better Together

<p align="center">
  <strong>A movie night should never depend on being in the same room.</strong>
  <br />
  Watch together, chat in real time, share reactions, and build playlists with friends.
</p>

<p align="center">
  <a href="https://github.com/mitul-mishra5/watchwave">
    <img src="https://img.shields.io/badge/Project-WatchWave-8B5CF6?style=for-the-badge&logo=github&logoColor=white" alt="WatchWave project" />
  </a>
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Realtime-Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
</p>

---

## ✨ What is WatchWave?

**WatchWave** is a real-time, shared movie-watching application built around one simple idea: great stories are better when experienced together.

Create a watch room, invite others, and enjoy synchronized playback with interactive features designed to make online movie nights feel more social.

## 🚀 Features

| Feature | What it does |
|---|---|
| 🎬 Synchronized playback | Coordinate video playback across participants in a room. |
| 🏠 Watch rooms | Create and join shared viewing sessions. |
| 💬 Live chat | Talk with other viewers during the movie. |
| ❤️ Reactions | Add real-time reactions to the shared experience. |
| 📊 Interactive polls | Let room participants vote together. |
| 🎞️ Shared playlists | Collaboratively manage movies for the room. |
| 👑 Host transfer | Transfer room hosting to another participant. |
| 🔄 Room recovery | Support rejoining a room after a refresh or reconnection. |
| 🔎 Movie catalogue | Browse available titles and select what to watch. |

## 🛠️ Built With

- **Next.js and React** — web interface
- **TypeScript** — frontend type safety
- **Node.js** — application server
- **Socket.IO** — real-time communication
- **SQLite** — local application data
- **CSS** — custom cinematic interface

## 🧱 Project Structure

```text
watchwave/
├── apps/
│   ├── server/
│   │   ├── src/
│   │   │   ├── catalog.js
│   │   │   ├── database.js
│   │   │   ├── index.js
│   │   │   ├── room-manager.js
│   │   │   └── socket-handlers.js
│   │   ├── test/
│   │   └── package.json
│   └── web/
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── public/
├── docs/
├── scripts/
├── package.json
└── README.md
```

## ⚡ Getting Started

### Prerequisites

- Node.js and npm
- Git
- The required local video assets for full catalogue playback

### 1. Clone the repository

```bash
git clone https://github.com/mitul-mishra5/watchwave.git
cd watchwave
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the environment

Use `.env.example` as a reference for the supported configuration variables. Configure the environment required by the application before starting the server.

### 4. Add the video assets

Large video files are intentionally excluded from Git. Follow [`docs/MEDIA_SETUP.md`](docs/MEDIA_SETUP.md) to obtain the required media and place it in the expected directory.

### 5. Start the application

```bash
npm run dev
```

Open the local URL printed by the frontend development server, typically `http://localhost:3000`.

> Run the application locally first and follow the project configuration if your environment requires additional setup.

## 🧪 Testing

Run the automated test suite:

```bash
npm test
```

Build the application:

```bash
npm run build
```

The repository also includes testing documentation in [`docs/TESTING.md`](docs/TESTING.md).

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Media setup](docs/MEDIA_SETUP.md)
- [Testing guide](docs/TESTING.md)
- [Verification status](docs/VERIFICATION_STATUS.md)

## 🎥 Media and Repository Size

WatchWave's source code and documentation are maintained in this repository. Large movie assets are kept outside Git to avoid unnecessarily increasing repository size.

The full catalogue requires the corresponding media files to be available locally. See the media setup guide for details.

## 🗺️ Project Status

WatchWave is an actively developed project. Features, compatibility, and verification status may evolve as development continues.

## 🤝 Contributing

Suggestions, bug reports, and improvements are welcome. Please open an issue to discuss a proposed change before submitting a pull request.

## 📄 License

No open-source license has been specified yet. Unless a license is added, the repository's code is not automatically granted permission for unrestricted reuse.

---

<p align="center">
  <strong>WatchWave</strong>
  <br />
  <em>Different places. One movie night.</em>
</p>
