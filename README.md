# Neural Time Capsules – AI-Powered Memory Reconstruction

Neural Time Capsules is a full-stack platform designed to help Alzheimer’s and dementia patients recall personal memories. By weaving together photos, voice recordings, and text notes, the system uses simulated AI logic to reconstruct "Memory Capsules"—immersive sensory experiences that foster emotional connection and cognitive stimulation.

## 🚀 Features

- **Caregiver Portal**: Securely manage patient profiles and upload multi-modal memory data.
- **AI Narrative Engine**: Automatically generates emotional stories from fragmented memory descriptions.
- **Immersive Multi-Modal Viewer**: A high-contrast, accessible patient interface for viewing reconstructed memories with visual and auditory cues.
- **Neural Aesthetic**: Modern glassmorphic UI designed for clarity and impact.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Framer Motion (Animations), Lucide React (Icons)
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Authentication**: JWT & Bcryptjs
- **File Handling**: Multer (Local storage for prototype)

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** running locally on `mongodb://localhost:27017`

## 🏃 Getting Started

1. **Clone the project**
2. **Install all dependencies**:
   ```bash
   npm run install-all
   ```
3. **Start the application**:
   ```bash
   npm run dev
   ```
   - Frontend will be at: `http://localhost:5173`
   - Backend will be at: `http://localhost:5000`

## 🧪 Demo Instructions

1. **Register** as a Caregiver.
2. **Add a Patient** (e.g., "Grandpa John").
3. Go to **Memory Bank** for the patient.
4. **Upload items**:
   - A photo with a description (e.g., "Family picnic at the park, 1985").
   - A text note about a specific feeling or person.
5. Click **"Generate Capsule"** to trigger the AI reconstruction.
6. Switch to **Patient View** or click **"Reconstruct"** to enter the immersive experience.

## 🧠 AI Simulation Logic
In this prototype, the AI logic identifies semantic links between memory descriptions and synthesizes them into a cohesive narrative stored within the "Capsule" model. This demonstrates the potential for LLM integration in healthcare settings.

---
*Developed for Social Impact & Healthcare Innovation Hackathon.*
