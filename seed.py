"""
seed.py — Run once after migrations to populate the database.
Usage:
    cd backend
    python seed.py
"""

from app.database import SessionLocal, engine
from app.models import User, Level, Task, Progress, Mentor, Roadmap
from app.database import Base

# ── Create all tables (safe to run even if they exist) ────────────────────────
Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    try:
        # ── Guard: skip if already seeded ────────────────────────────────────
        if db.query(Level).count() > 0:
            print("✅ Database already seeded. Skipping.")
            return

        print("🌱 Seeding database...")

        # ─────────────────────────────────────────────────────────────────────
        # 1. LEVELS
        # ─────────────────────────────────────────────────────────────────────
        levels_data = [
            {"id": 1, "name": "Basics",        "order": 1, "xp_required": 0,   "badge_icon": "book",        "description": "Learn Python fundamentals — variables, loops, functions, OOP."},
            {"id": 2, "name": "DSA",            "order": 2, "xp_required": 200, "badge_icon": "code",        "description": "Data Structures & Algorithms — arrays, trees, graphs, dynamic programming."},
            {"id": 3, "name": "Projects",       "order": 3, "xp_required": 500, "badge_icon": "hammer",      "description": "Build real backend projects — APIs, databases, authentication."},
            {"id": 4, "name": "Resume",         "order": 4, "xp_required": 900, "badge_icon": "file-text",   "description": "Craft a job-winning resume and GitHub profile."},
            {"id": 5, "name": "Interview Prep", "order": 5, "xp_required": 1200,"badge_icon": "mic",         "description": "Mock interviews, system design, HR rounds, behavioural questions."},
            {"id": 6, "name": "Job Apply",      "order": 6, "xp_required": 1600,"badge_icon": "briefcase",   "description": "Apply strategically — LinkedIn, cold outreach, referrals, follow-ups."},
        ]
        levels = [Level(**l) for l in levels_data]
        db.add_all(levels)
        db.flush()  # get IDs without committing

        # ─────────────────────────────────────────────────────────────────────
        # 2. TASKS  (each task has xp_reward; completing all → level up)
        # ─────────────────────────────────────────────────────────────────────
        tasks_data = [
            # Level 1 — Basics
            {"level_id": 1, "order": 1,  "xp_reward": 20, "title": "Install Python & set up VS Code",          "description": "Install Python 3.11+, set up VS Code with Python extension."},
            {"level_id": 1, "order": 2,  "xp_reward": 20, "title": "Learn variables, data types & operators",  "description": "int, float, str, bool. Arithmetic, comparison, logical operators."},
            {"level_id": 1, "order": 3,  "xp_reward": 20, "title": "Control flow — if/else, loops",            "description": "if-elif-else, for loop, while loop, break & continue."},
            {"level_id": 1, "order": 4,  "xp_reward": 30, "title": "Functions & scope",                        "description": "def, return, *args, **kwargs, global vs local scope."},
            {"level_id": 1, "order": 5,  "xp_reward": 30, "title": "Lists, dicts, sets & tuples",              "description": "CRUD operations on each collection type, comprehensions."},
            {"level_id": 1, "order": 6,  "xp_reward": 40, "title": "OOP — Classes, inheritance, polymorphism", "description": "class, __init__, self, inheritance, dunder methods."},
            {"level_id": 1, "order": 7,  "xp_reward": 40, "title": "File I/O & exception handling",            "description": "open(), read/write files, try-except-finally."},

            # Level 2 — DSA
            {"level_id": 2, "order": 1,  "xp_reward": 20, "title": "Arrays & strings",                         "description": "Sliding window, two-pointer, prefix sums."},
            {"level_id": 2, "order": 2,  "xp_reward": 25, "title": "Linked lists",                             "description": "Singly & doubly linked, reversal, cycle detection (Floyd)."},
            {"level_id": 2, "order": 3,  "xp_reward": 25, "title": "Stacks & queues",                         "description": "Monotonic stack, BFS queue, LRU Cache."},
            {"level_id": 2, "order": 4,  "xp_reward": 30, "title": "Trees — BST, traversals",                  "description": "Inorder/preorder/postorder, BFS, height, lowest common ancestor."},
            {"level_id": 2, "order": 5,  "xp_reward": 35, "title": "Graphs — BFS & DFS",                       "description": "Adjacency list/matrix, topological sort, shortest path."},
            {"level_id": 2, "order": 6,  "xp_reward": 35, "title": "Sorting & searching",                      "description": "Merge sort, quick sort, binary search and variants."},
            {"level_id": 2, "order": 7,  "xp_reward": 50, "title": "Dynamic programming",                      "description": "Memoization, tabulation, 0/1 knapsack, LCS, coin change."},

            # Level 3 — Projects
            {"level_id": 3, "order": 1,  "xp_reward": 30, "title": "Build a REST API with FastAPI",             "description": "Endpoints, Pydantic schemas, status codes, error handling."},
            {"level_id": 3, "order": 2,  "xp_reward": 30, "title": "Connect PostgreSQL with SQLAlchemy",        "description": "Models, relationships, migrations with Alembic."},
            {"level_id": 3, "order": 3,  "xp_reward": 40, "title": "JWT Authentication system",                 "description": "Signup, login, protected routes, token refresh."},
            {"level_id": 3, "order": 4,  "xp_reward": 50, "title": "Deploy API on AWS EC2 / Railway",           "description": "Docker, Nginx reverse proxy, HTTPS with Certbot."},
            {"level_id": 3, "order": 5,  "xp_reward": 60, "title": "Build this Gamified Learning Tracker 🚀",   "description": "You are doing it right now! Full backend + React frontend."},

            # Level 4 — Resume
            {"level_id": 4, "order": 1,  "xp_reward": 20, "title": "Write a strong professional summary",       "description": "3-4 lines. Mention your stack, years learning, goals."},
            {"level_id": 4, "order": 2,  "xp_reward": 25, "title": "List projects with impact metrics",         "description": "Use numbers: 'Reduced load time by 40%', 'Served 500+ users'."},
            {"level_id": 4, "order": 3,  "xp_reward": 20, "title": "Optimise GitHub profile",                   "description": "Pinned repos, good READMEs, consistent commit history."},
            {"level_id": 4, "order": 4,  "xp_reward": 20, "title": "Complete LinkedIn profile",                 "description": "About section, skills, projects, open-to-work banner."},
            {"level_id": 4, "order": 5,  "xp_reward": 25, "title": "Get resume reviewed",                       "description": "Share with seniors, use resumeworded.com or ask mentor."},

            # Level 5 — Interview Prep
            {"level_id": 5, "order": 1,  "xp_reward": 30, "title": "Solve 50 LeetCode problems",               "description": "10 easy, 30 medium, 10 hard. Focus on patterns, not memorising."},
            {"level_id": 5, "order": 2,  "xp_reward": 40, "title": "System design — basics",                   "description": "Load balancers, databases, caching, CDN, CAP theorem."},
            {"level_id": 5, "order": 3,  "xp_reward": 40, "title": "Mock technical interviews",                 "description": "Use Pramp or ask a peer. Do at least 5 full mock interviews."},
            {"level_id": 5, "order": 4,  "xp_reward": 30, "title": "Prepare HR & behavioural questions",        "description": "Tell me about yourself, strengths/weaknesses, STAR method."},
            {"level_id": 5, "order": 5,  "xp_reward": 30, "title": "Study company-specific interview patterns", "description": "Research past questions from Glassdoor, LeetCode discuss."},

            # Level 6 — Job Apply
            {"level_id": 6, "order": 1,  "xp_reward": 20, "title": "Build target company list",                 "description": "50 companies: 10 dream, 20 target, 20 backup. Research each."},
            {"level_id": 6, "order": 2,  "xp_reward": 20, "title": "Apply on LinkedIn & company portals daily", "description": "Apply to 5-10 jobs per day consistently."},
            {"level_id": 6, "order": 3,  "xp_reward": 30, "title": "Cold email / LinkedIn outreach",            "description": "Connect with engineers. Personalised message, not spam."},
            {"level_id": 6, "order": 4,  "xp_reward": 20, "title": "Ask for referrals",                         "description": "Ex-classmates, hackathon friends, LinkedIn connections at target co."},
            {"level_id": 6, "order": 5,  "xp_reward": 30, "title": "Track all applications",                    "description": "Use a spreadsheet: company, role, date applied, status, follow-up date."},
        ]
        tasks = [Task(**t) for t in tasks_data]
        db.add_all(tasks)
        db.flush()

        # ─────────────────────────────────────────────────────────────────────
        # 3. ROADMAP STEPS  (high-level guide per level, shown on Roadmap page)
        # ─────────────────────────────────────────────────────────────────────
        roadmap_data = [
            # Level 1
            {"level_id": 1, "order": 1, "is_milestone": False, "step_title": "Set up your development environment",    "description": "Python, VS Code, pip, virtual environments."},
            {"level_id": 1, "order": 2, "is_milestone": False, "step_title": "Master Python fundamentals",             "description": "Variables, control flow, functions, OOP."},
            {"level_id": 1, "order": 3, "is_milestone": True,  "step_title": "Build 2 small Python projects",          "description": "Calculator + todo list. Apply everything you learned."},

            # Level 2
            {"level_id": 2, "order": 1, "is_milestone": False, "step_title": "Study arrays, strings & hashing",        "description": "Most common pattern in interviews. Do 20 problems."},
            {"level_id": 2, "order": 2, "is_milestone": False, "step_title": "Learn trees & graphs",                   "description": "BFS, DFS, recursion. Do 15 problems."},
            {"level_id": 2, "order": 3, "is_milestone": True,  "step_title": "Solve 50 LeetCode problems",              "description": "Mix of easy and medium. Time yourself."},

            # Level 3
            {"level_id": 3, "order": 1, "is_milestone": False, "step_title": "Learn FastAPI & REST principles",         "description": "Build a basic CRUD API."},
            {"level_id": 3, "order": 2, "is_milestone": False, "step_title": "Add PostgreSQL + SQLAlchemy",             "description": "Model relationships, migrations."},
            {"level_id": 3, "order": 3, "is_milestone": True,  "step_title": "Ship a deployed, working API",            "description": "On Railway or EC2 with a real domain."},

            # Level 4
            {"level_id": 4, "order": 1, "is_milestone": False, "step_title": "Write resume first draft",                "description": "Focus on impact, not just responsibilities."},
            {"level_id": 4, "order": 2, "is_milestone": True,  "step_title": "Get resume peer-reviewed",               "description": "3 people minimum. Iterate."},

            # Level 5
            {"level_id": 5, "order": 1, "is_milestone": False, "step_title": "Daily LeetCode practice",                 "description": "At least 1 problem per day."},
            {"level_id": 5, "order": 2, "is_milestone": False, "step_title": "System design deep dives",                "description": "Design Twitter, URL shortener, WhatsApp."},
            {"level_id": 5, "order": 3, "is_milestone": True,  "step_title": "Complete 5 mock interviews",              "description": "Video mock with a friend or on Pramp."},

            # Level 6
            {"level_id": 6, "order": 1, "is_milestone": False, "step_title": "Apply to 5-10 jobs daily",                "description": "Consistency beats perfection."},
            {"level_id": 6, "order": 2, "is_milestone": False, "step_title": "Reach out to 3 people weekly",            "description": "LinkedIn cold outreach with personalised message."},
            {"level_id": 6, "order": 3, "is_milestone": True,  "step_title": "Land your first interview",               "description": "🎉 The journey pays off. You are ready."},
        ]
        roadmap_steps = [Roadmap(**r) for r in roadmap_data]
        db.add_all(roadmap_steps)
        db.flush()

        # ─────────────────────────────────────────────────────────────────────
        # 4. MENTORS  (dummy data — replace with real seniors later)
        # ─────────────────────────────────────────────────────────────────────
        mentors_data = [
            {
                "name": "Arjun Sharma",
                "expertise": "Backend Development, FastAPI, PostgreSQL",
                "current_level": 6,
                "advice_text": "Focus on building real projects from day 1. Reading theory without coding is like reading a swimming manual without getting into a pool. Ship something broken, then fix it.",
                "linkedin_url": "https://linkedin.com/in/arjunsharma",
                "github_url": "https://github.com/arjunsharma",
            },
            {
                "name": "Priya Patel",
                "expertise": "DSA, Competitive Programming, FAANG Interviews",
                "current_level": 5,
                "advice_text": "Don't memorise solutions — understand patterns. Once you see the sliding window pattern, you can solve 30 problems with one idea. Focus on patterns, not problem count.",
                "linkedin_url": "https://linkedin.com/in/priyapatel",
                "github_url": "https://github.com/priyapatel",
            },
            {
                "name": "Rahul Verma",
                "expertise": "Full Stack, React, System Design",
                "current_level": 6,
                "advice_text": "Your GitHub is your resume before the resume. Make every project README look professional. Recruiters Google your name — make sure they find great code.",
                "linkedin_url": "https://linkedin.com/in/rahulverma",
                "github_url": "https://github.com/rahulverma",
            },
            {
                "name": "Sneha Iyer",
                "expertise": "DevOps, AWS, Docker, CI/CD",
                "current_level": 5,
                "advice_text": "Deploy early, deploy often. A deployed project — even a simple one — shows more initiative than a perfect local project nobody can see. Get comfortable with the terminal.",
                "linkedin_url": "https://linkedin.com/in/snehaiyer",
                "github_url": "https://github.com/snehaiyer",
            },
            {
                "name": "Karan Mehta",
                "expertise": "Machine Learning, Python, Data Science",
                "current_level": 4,
                "advice_text": "Strong Python fundamentals will take you further than jumping to ML frameworks. I spent 3 months on basics and it made everything else 10x easier.",
                "linkedin_url": "https://linkedin.com/in/karanmehta",
                "github_url": "https://github.com/karanmehta",
            },
        ]
        mentors = [Mentor(**m) for m in mentors_data]
        db.add_all(mentors)

        # ── Commit everything ─────────────────────────────────────────────────
        db.commit()
        print("✅ Seeding complete!")
        print(f"   → {len(levels_data)} levels")
        print(f"   → {len(tasks_data)} tasks")
        print(f"   → {len(roadmap_data)} roadmap steps")
        print(f"   → {len(mentors_data)} mentors")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()