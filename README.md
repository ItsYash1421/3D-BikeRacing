# 🏍️ 3D BIKE RACING | HAND GESTURE CONTROLLED

A thrilling 3D first-person bike racing game controlled entirely by hand gestures using your webcam. Experience realistic bike racing with procedurally generated traffic, dynamic physics, and immersive audio.

![Game Banner](https://img.shields.io/badge/Version-1.0.0-blue) ![Tech](https://img.shields.io/badge/Tech-Three.js%20%7C%20MediaPipe-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ FEATURES

### 🎮 Advanced Hand Gesture Controls
- **Both Fists Open** → Accelerate ⚡
- **Both Fists Closed** → Brake 🛑
- **Left Fist Only Closed** → Switch to Left Lane ⬅️
- **Right Fist Only Closed** → Switch to Right Lane ➡️
- **Keyboard Alternative**: Arrow keys for lane switching

### 🏍️ Realistic Bike Selection
Choose from 5 meticulously modeled bikes:
- **Kawasaki Ninja H2** - Max: 300 km/h | Acceleration: ⚡⚡⚡⚡⚡
- **BMW S1000 RR** - Max: 299 km/h | Acceleration: ⚡⚡⚡⚡⚡
- **TVS Apache RR 310** - Max: 165 km/h | Acceleration: ⚡⚡⚡⚡
- **Royal Enfield GT 650** - Max: 175 km/h | Acceleration: ⚡⚡⚡
- **Royal Enfield Classic 650** - Max: 160 km/h | Acceleration: ⚡⚡⚡

### 🎥 First-Person Perspective (FPP)
- Visible handlebars, dashboard, and mirrors
- Animated rider hands on grips
- Dynamic camera FOV based on speed
- Cockpit varies by bike style (Sport Clip-ons vs Retro Bars)

### 🚗 Intelligent Traffic System
- Dynamic vehicle spawning (Cars, SUVs, Trucks)
- Realistic relative speed physics
- Progressive difficulty scaling
- Collision detection with visual feedback

### 🔊 Procedural Audio Engine
- Real-time engine sound synthesis (Web Audio API)
- RPM-based pitch modulation
- Speed-dependent wind noise
- Dynamic audio filtering

### 🎯 Game Modes
1. **Endless Ride** - Ride as far as possible, ends on collision
2. **2-Minute Challenge** - Maximize distance within 120 seconds

### 📊 Live HUD
- Real-time speedometer (KM/H)
- Distance tracker (Meters)
- Countdown timer (Timed mode)
- Hand gesture status indicator
- Animated dashboard (Speed, RPM, Gear)

---

## 🛠️ TECH STACK

### Frontend
- **Three.js** - 3D rendering and scene management
- **MediaPipe Hands** - Dual-hand pose detection
- **Web Audio API** - Procedural sound synthesis
- **Vite** - Build tool and dev server

### Backend
- **Node.js + Express** - REST API server
- **MongoDB + Mongoose** - Database and ODM
- **CORS** - Cross-origin resource sharing

---

## ⚡ INSTALLATION & SETUP

### Prerequisites
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** ([Installation Guide](https://www.mongodb.com/docs/manual/installation/))
- **Webcam** (Required for hand tracking)

### Setup Instructions

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd 3D-BikeRacing
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bike-racing
   PORT=5002
   ```
   
   Start backend:
   ```bash
   npm start
   ```

3. **Frontend Setup** (New Terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Play the Game**
   - Open `http://localhost:5174` in your browser
   - Allow webcam access when prompted
   - Position hands in camera view
   - Enjoy! 🏍️

---

## 🎮 HOW TO PLAY

### Starting the Game
1. Enter your **Rider Name**
2. Click **SELECT BIKE** and choose your motorcycle
3. Select **Game Mode** (Endless / 2-Minute Challenge)
4. Position both hands in the camera view (top-right corner)

### Controls Reference

| Gesture | Action | Alternative |
|---------|--------|-------------|
| **Both Fists OPEN** | Accelerate | - |
| **Both Fists CLOSED** | Brake | - |
| **Left Fist CLOSED** (only) | Move to Left Lane | ← Arrow Key |
| **Right Fist CLOSED** (only) | Move to Right Lane | → Arrow Key |

### Tips for Best Experience
- Ensure good lighting for hand tracking
- Keep hands within camera frame (widened view)
- Use smooth, deliberate gestures
- Watch for collision warnings
- Upgrade to faster bikes for higher scores

---

## 📁 PROJECT STRUCTURE

```
3D-BikeRacing/
├── frontend/
│   ├── src/
│   │   ├── assets/bikes/       # Bike model definitions
│   │   ├── core/               # GameEngine
│   │   ├── game/               # Bike, Road, Traffic, Audio
│   │   ├── tracking/           # HandTracker (MediaPipe)
│   │   ├── ui/                 # GameUI manager
│   │   ├── utils/              # API client
│   │   └── main.js             # Entry point
│   ├── styles/                 # CSS (Cyberpunk theme)
│   ├── index.html              # Main HTML
│   └── vite.config.js          # Vite configuration
│
└── backend/
    ├── models/                 # MongoDB schemas
    ├── routes/                 # API routes
    └── server.js               # Express server
```

---

## 🎨 DESIGN PHILOSOPHY

### Visual Aesthetics
- **Cyberpunk Racing Theme** with neon accents
- Dark gradient backgrounds with glowing borders
- Smooth animations and transitions
- High-contrast UI for visibility

### Game Physics
- Torque-based acceleration curves
- Realistic braking dynamics
- Lane-switching inertia
- Speed-dependent camera effects

### Performance Optimizations
- Capped delta time for physics stability
- Pixel ratio limiting (max 1.5x)
- Efficient geometry pooling
- Memory cleanup on game restart

---

## 🚀 FUTURE ENHANCEMENTS

- [ ] **Multiplayer Mode** - Real-time racing with friends
- [ ] **More Bikes** - Additional motorcycles from different brands
- [ ] **Power-ups** - Nitro boost, shields, score multipliers
- [ ] **Custom Tracks** - City, highway, mountain routes
- [ ] **Mobile Support** - Touch controls for mobile devices
- [ ] **Achievement System** - Unlock badges and rewards
- [ ] **Weather Effects** - Rain, fog, night mode
- [ ] **Replay System** - Save and share your best runs

---

## 🐛 KNOWN ISSUES

- Hand tracking requires good lighting conditions
- Lane switching has 500ms debounce (prevents accidental triggers)
- Browser must support WebGL and Web Audio API

---

## 📝 LICENSE

MIT License - Feel free to modify and distribute.

---

## 👨‍💻 DEVELOPER

**Yash Kumar Meena**  
Part of the Games-Creation Project

---

## 🙏 ACKNOWLEDGMENTS

- **Three.js** - 3D graphics library
- **MediaPipe** - Hand pose estimation
- **Google Fonts** - Orbitron & Rajdhani typefaces

---

**Enjoy the Ride! 🏁**
