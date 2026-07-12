# IRL RPG

IRL RPG is an SSC study app that turns exam preparation into a game-style learning dashboard.

It helps a learner study SSC subjects, ask AI doubts, attempt mock tests, review mistakes, follow exam news, and track quests/XP.

## Main Features

- Dashboard with level, XP, timer, course cards, and progress graph
- Study Library for Maths, Reasoning, English, and General Awareness
- Chapter lessons from noob to master
- AI Explainer for SSC doubts
- Voice input and browser voice reading
- News Hub for exam updates and current affairs
- Mock Tests with 20 questions and 10 minute timer
- Mistake Review classroom after mocks
- Quest Board that suggests what to study next
- Theme settings and learner profile

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express
- Electron
- Electron Builder
- JSON file database

## Run Locally

Install dependencies:

```bash
npm install
```

Start the web app:

```bash
npm start
```

Open in browser:

```text
http://localhost:3000
```

## Run As Desktop App

Start Electron:

```bash
npm run app
```

## Build Windows Installer

Create the Windows setup app:

```bash
npm run build
```

The installer will be created in:

```text
dist/IRL RPG Setup 1.0.0.exe
```

Do not upload `node_modules/` or `dist/` into normal Git commits. They are ignored by `.gitignore`.

## GitHub Release Upload

To share the software app, create a GitHub Release and attach:

```text
dist/IRL RPG Setup 1.0.0.exe
```

Users can download the `.exe` from the Releases page and install IRL RPG on Windows.

## AI Setup

Create a `.env` file in the project folder.

Use `.env.example` as the template.

Example:

```env
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=nova
```

Important: never upload your real `.env` file to GitHub.

## Project Structure

```text
IRL/
  Public/
    index.html
    style.css
    app.js
  database.json
  server.js
  main.js
  package.json
  .env.example
  .gitignore
```

## Study Goal

IRL RPG is built for SSC preparation. It focuses on:

- SSC CGL
- SSC CHSL
- SSC MTS
- SSC GD
- SSC CPO
- SSC Stenographer
- SSC JE
- SSC Selection Post

The learner can choose a target exam in Settings, and the app can shape the study path around that target.

## Current Status

This is an early learning build. The app already has the main study flow, mock test flow, AI explainer, news hub, profile, themes, and quest board.

More chapters, more mock questions, and stronger live exam updates can be added over time.