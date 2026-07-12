# IRL RPG

IRL RPG is an SSC study app that turns exam preparation into a game-style learning dashboard.

It helps a learner study SSC subjects, follow a chapter path, practice mock tests, review mistakes, read exam news, and track daily quests/XP.

## Main Features

- Dashboard with level, XP, course cards, action tiles, and progress graph
- Study Library for Maths, Reasoning, English, and General Awareness
- Chapter lessons from noob to master
- Doubt Helper that detects subject/chapter and creates SSC exam-style prompts
- Built-in SSC Brain for simple help without login or API
- External prompt buttons for DeepSeek, ChatGPT, and Gemini
- Voice input and browser voice reading
- News Hub for exam updates and current affairs
- Mock Tests with 20 questions and 10 minute timer
- Mistake Review classroom after mocks
- Quest Board that suggests what to study next
- Theme settings and learner profile
- Desktop app with the native menu bar hidden for a cleaner software feel

## Doubt Helper

Doubt Helper is not a forced-login AI chat. It is a study helper.

It can:

- Detect the likely subject and chapter from a doubt
- Give built-in SSC help for simple doubts
- Build a strong SSC exam-focused prompt
- Copy that prompt for the learner
- Open DeepSeek, ChatGPT, or Gemini when the learner chooses

The learner stays in control. IRL RPG does not store external AI logins.

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

## Optional AI Setup

IRL RPG works without API keys. Built-in SSC Brain and Doubt Helper are available by default.

Advanced users can still add AI keys in a local `.env` file for deeper explanations or cloud voice experiments. Use `.env.example` as a template.

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

This learning build includes the core study dashboard, Study Library, Doubt Helper, News Hub, Mock Tests, Mistake Review, Quest Board, profile, and themes.

The project is ready to push to GitHub as the current working version.