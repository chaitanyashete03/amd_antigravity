# 🏆 VyapaarAI - The Intelligent Retail Assistant

**VyapaarAI** is a comprehensive, AI-powered Full-Stack SaaS platform designed to democratize advanced retail analytics for small and medium-sized businesses. 

By leveraging cutting-edge Retrieval-Augmented Generation (RAG) and Semantic Vector Search, VyapaarAI transforms a retailer's raw inventory and sales data into an interactive, multilingual conversational assistant.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://vyaparai.in)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black.svg)](https://amd-antigravity.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-blue.svg)](https://vyapaarai-backend.onrender.com)

## 🚀 Key Features

* **Multilingual AI Chatbot (RAG):** Speak to your business in your native language! The system dynamically embeds conversational queries using `@xenova/transformers` (running locally via Node.js!) and performs cosine-similarity searches across the PostgreSQL db to inject real-time context directly into an external LLM (Google AI Studio / Sarvam).
* **Dual-Database Architecture:**
  * **PostgreSQL (Neon) + pgvector:** Hosts structured catalog data securely while accelerating deep similarity logic across all available products.
  * **MongoDB (Atlas):** Acts as the high-throughput engine for historical sales analytics and complete conversation history logging without schema constraints.
* **Automated Business Insights Engine:** A background `node-cron` orchestrator mathematically sweeps the database daily to flag:
  * ⚠️ Low-Stock Alerts
  * 🔥 Trending Items (Last 7 Days)
  * 🐢 Slow-Moving Inventory (Dead weight)
  * 💰 AI-Suggested Price Optimizations
* **Secure Enterprise Authentication:** Complete JWT implementation with bcrypt-hashed credentials to ensure strict tenant/retailer data isolation.

## 🛠️ Tech Stack

### Frontend (User Interface)
* **Framework:** React + Vite
* **Styling:** Vanilla CSS / Tailwind (Responsive Design)
* **Deployment:** Vercel automatically routed via `vercel.json`

### Backend (API Server)
* **Runtime:** Node.js (v20) + Express.js v4
* **Databases:** PostgreSQL (`pg`), MongoDB (`mongodb`)
* **Vector Integration:** `pgvector`
* **Local Embeddings:** HF pipeline `all-MiniLM-L6-v2` (`@xenova/transformers`)
* **Generative AI:** `@google/genai`
* **Deployment:** Render automatically deployed via `render.yaml` Infrastructure-as-Code

## 💻 Local Development Setup

To run this project on your own machine, you'll need Node.js `v20` installed.

### 1. Clone the repository
```bash
git clone https://github.com/chaitanyashete03/amd_antigravity.git
cd amd_antigravity
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder and add:
```ini
NODE_ENV=development
PORT=5000
PG_CONNECTION_STRING=your_neon_postgresql_uri
MONGO_CONNECTION_STRING=your_mongodb_cluster_uri
JWT_SECRET=super_secret_key_123
GEMINI_API_KEY=your_google_ai_studio_api_key
```
Start the local server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` folder and add:
```ini
VITE_API_URL=http://localhost:5000
```
Start the local React server:
```bash
npm run dev
```

## 🧠 The RAG Architecture Flow

1. **User asks:** "What should I restock today?" in Hindi.
2. Express controller receives the prompt.
3. Node spins up the `pipeline` and converts the raw text into a 384-dimensional vector.
4. Server queries PostgreSQL computing cosine distances against all existing inventory vectors in milliseconds.
5. Top 5 most semantically similar items and the 5 most recent sales ledgers are aggregated from MongoDB into a strictly structured English prompt.
6. The combined context is forwarded to the LLM to generate the output and perfectly translate the findings back into the user's requested language.
7. Total RTT logged securely within MongoDB to provide personalized future memories.

## 📝 License
This project is submitted as an open-source solution for demonstration purposes. Feel free to copy, modify, and build upon it!
