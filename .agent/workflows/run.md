---
description: Start all project components (Express Server, Vite Frontend, and Flask AI Backend)
---

This workflow starts all three main components of the project simultaneously using a single command.

1. Ensure you are in the root directory of the project.
// turbo
2. Run the development environment:
```powershell
npm run dev
```

This will concurrently start:
- **Express Server**: Node.js backend on `server/`
- **Vite Frontend**: React/Vite application on `client/`
- **Flask Server**: AI/Python backend on `flask_server/`
