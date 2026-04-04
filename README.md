# 🎯 HireSense — AI Interview Coach

> HireSense is an AI-powered interview coach offering resume-based questions, real-time answer evaluation & voice interaction. Get instant feedback and performance insights to ace your next interview.

---

## ✨ Features

- 🤖 **AI-Powered Questions** — Generates personalized interview questions based on your resume
- 📝 **Real-Time Answer Evaluation** — Instant feedback powered by Groq AI
- 🎙️ **Voice Interaction** — Practice with speech recognition & text-to-speech
- 📄 **Resume Parsing** — Tailors questions to your experience and skills
- 📊 **Session Summary** — Detailed performance insights after every session
- 💡 **Improvement Suggestions** — Actionable tips to sharpen your answers

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router DOM, Tailwind CSS |
| Build Tool | Vite |
| AI Model | Groq API |
| Voice | Web Speech API (Browser Native) |
| Styling | Tailwind CSS + PostCSS |

---

## 📁 Project Structure

```
Hire-Sense-AI-Interview-Platform/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-level components
│   └── services/          # API & AI service handlers
├── index.html
├── .env                   # Environment variables
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher — [Download](https://nodejs.org/)
- **Groq API Key** — [Get yours here](https://console.groq.com/)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/DeeptanshNagar/Hire-Sense-AI-Interview-Platform.git
cd Hire-Sense-AI-Interview-Platform
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

**4. Start the development server**

```bash
npm run dev
```

Open your browser at `http://localhost:5173`

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GROQ_API_KEY` | Your Groq API key | ✅ Yes |

> ⚠️ **Never commit your `.env` file.** Make sure it's listed in `.gitignore`.

---

## 🌐 Deployment

**Build the project:**

```bash
npm run build
```

The production-ready files will be in the `dist/` folder. You can deploy to:
- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [GitHub Pages](https://pages.github.com/)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ by <a href="https://github.com/DeeptanshNagar">DeeptanshNagar</a></p>
