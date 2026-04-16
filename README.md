# 🚀 SparkX

A full-stack AI-powered gamified learning platform designed to help students stay consistent, track their progress and build real-world skills through structured roadmaps, XP systems and community-driven motivation.

---

# 🧠 Project Idea

Traditional learning lacks motivation and structure.

👉 This platform transforms learning into a **game-like journey**:

* 🎮 Earn XP
* 🔥 Maintain streaks
* 📈 Level up
* 🧭 Follow structured roadmaps
* 🏆 Compete on leaderboards

---

# ✨ Core Features

## 🔐 Authentication System

* JWT-based login/signup
* Secure password hashing
* Protected routes
* Email integration (welcome email)

---

## 🎮 Gamification System

* XP points for completing tasks
* Level progression system
* Task-based learning
* Progress tracking

---

## 🔥 Streak System

* Daily activity tracking
* Current streak counter
* Consistency motivation

---

## 🧭 Learning Roadmap

Structured roadmap with levels:

1. Basics
2. DSA
3. Projects
4. Resume Building
5. Interview Preparation
6. Job Application

👉 Each level contains:

* Tasks
* Milestones
* Learning resources

---

## 🏆 Leaderboard

* XP-based ranking
* Weekly competition
* Track fastest learners

---

## 👤 Profile System

* Edit user profile
* View XP & level
* Track progress

---

## 👨‍🏫 Mentors Section

* Categorized mentors
* Guidance for different domains

---

## 💬 Feedback System

* User feedback submission
* Display on landing page

---

## 🤖 PathForge AI (AI Roadmap Generator)

* Generate personalized learning roadmap
* Based on:

  * User goal
  * Skill level
* Uses Gemini integration

---

# 💼 Resume & Career System (Advanced 🔥)

## 📄 ATS Resume Support

* ATS-friendly resume template
* Section-wise guidance:

  * Summary
  * Projects
  * Skills
* Good vs Bad examples

## 🚀 Career Guidance

* LinkedIn optimization
* GitHub improvement tips
* Job application strategy
* Cold DM technique

## 🔥 Motivation System

* Real-world guidance
* Consistency reminders
* “Apply 1000 jobs” mindset

---

# 🛠️ Tech Stack

## 💻 Frontend

* React (Vite)
* Tailwind CSS
* Modern UI (Glassmorphism)
* State Management (Custom store)

---

## ⚙️ Backend

* FastAPI (Python)
* REST API architecture
* JWT Authentication

---

## 🗄️ Database

* PostgreSQL
* SQLAlchemy ORM
* Alembic migrations

---

## 📧 Email

* SMTP (Gmail)
* Automated emails

---

## 🤖 AI Integration

* Gemini / OpenAI API
* Roadmap generation

---

# 📂 Project Structure

```
project/
│
├── app/                  # Backend
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── schemas/
│   └── main.py
│
├── frontend/             # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│
├── alembic/              # DB migrations
├── .gitignore
├── requirements.txt
└── README.md
```

---

# ⚙️ Setup Instructions

## 🔹 Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:

```
DATABASE_URL=your_database_url
SECRET_KEY=your_secret
GEMINI_API_KEY=your_key
```

Run server:

```bash
uvicorn app.main:app --reload
```

---

## 🔹 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

> ⚠️ `.env` file is NOT included for security reasons.

Create your own using:

```
DATABASE_URL=
SECRET_KEY=
GEMINI_API_KEY=
```

---

# 🚀 Future Enhancements

* 🤖 AI Resume Analyzer
* 📊 Analytics Dashboard
* 🌍 Global vs College Leaderboard
* 🧠 Smart Career Recommendations
* 📱 Mobile App Version

---

# 🧠 Key Learning Outcomes

* Full-stack development (React + FastAPI)
* Database design & migrations
* Authentication & security
* API design
* Real-world product thinking
* AI integration

---

# 👨‍💻 Author

Developed by **Himansu Sekhar B.**

---

# ⭐ Final Note

This project is not just a college project —
it is a **product-level platform** focused on solving real student problems using gamification and AI.

👉 If you like this project, consider giving it a ⭐ on GitHub!

---
