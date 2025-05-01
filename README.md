# Support Chat Application

A lightweight customer support application featuring real-time video chat and AI-powered assistance.

## Features

- Real-time video chat between support agents and users
- AI-powered chatbot using OpenAI
- Agent dashboard with session tracking
- Modern, responsive UI built with React and Tailwind CSS

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Create a `.env` file in the server directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Start the development servers:
   ```bash
   npm run dev
   ```

## Development

- Frontend runs on: http://localhost:5173
- Backend runs on: http://localhost:3000

## Project Structure

```
├── client/             # React frontend
├── server/             # Node.js backend
└── package.json        # Root package.json
```

## Technologies Used

- Frontend:

  - React
  - TypeScript
  - Tailwind CSS
  - Socket.IO Client
  - WebRTC

- Backend:
  - Node.js
  - Express
  - Socket.IO
  - SQLite
  - OpenAI API
