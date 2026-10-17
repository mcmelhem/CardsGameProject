# 🃏 Multiplayer Cards Game

A real-time multiplayer web app that brings three card games together in one place. Players sign in, join game rooms, play against each other, and chat during the game.


**Live demo:** <!-- TODO: add link, or remove this line -->

---

## ✨ Features

- 🎮 **Three card games in one app:** Cards Game, UNO, and <!-- TODO: third game -->
- 👤 **User accounts:** sign up, log in, and keep a player profile
- 🚪 **Game rooms:** create or join a room and play with other players
- 💬 **In-game chat:** talk to other players while you play
- ⚡ **Real-time updates:** every player sees moves as they happen

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, JavaScript, CSS |
| Real-time | <!-- TODO: e.g. Socket.IO or Firebase Realtime Database --> |
| Backend | <!-- TODO: e.g. Node.js + Express, or Firebase --> |
| Auth | <!-- TODO: e.g. Firebase Authentication --> |
| Database | <!-- TODO: e.g. Firestore or MongoDB --> |


---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mcmelhem/CardsGameProject.git
cd CardsGameProject
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```
# TODO: list the real keys your app needs, for example:
REACT_APP_API_URL=your_backend_url
```

### 4. Run the app

```bash
npm start
```

Then open http://localhost:3000 in your browser.

---

## ⚙️ How It Works

1. A player signs in and lands in the lobby.
2. They create a new game room or join an existing one.
3. Once enough players join, the game starts.
4. Each move is sent to the other players in real time, and the game state stays in sync.
5. Players can chat in the room throughout the game.

---

## 🔮 Future Improvements

- AI opponent for single-player mode
- Leaderboards and player statistics
- Mobile-friendly layout
- Automated tests and a GitHub Actions CI pipeline

---

## 👩‍💻 Author

Built by **Marie Claire Melhem**: [GitHub](https://github.com/mcmelhem) · [LinkedIn](https://www.linkedin.com/in/marieclairemelhem)

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
