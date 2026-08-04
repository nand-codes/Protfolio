export const personalInfo = {
  name: "Nanda Kishor",
  title: "Software Engineer",
  tagline: "Python Backend | AI-powered Systems",
  email: "nandakishorpmofficial@gmail.com",
  phone: "+91 7510573622",
  location: "Calicut, Kerala",
  linkedin: "https://linkedin.com/in/nandakishorofficial",
  github: "https://github.com/nand-codes",
  profile:
    "Software Engineer at TCS building Python backends (Django, FastAPI, Flask) and AI/ML systems. Currently developing AIOps solutions for Nokia NAC — deploying time series forecasting, anomaly detection, and intelligent monitoring using Prophet, Kubeflow, Grafana, and Camunda BPMN. Skilled in RAG pipelines, LLMs, MLOps, and AWS deployment.",
};

export const experience = [
  {
    role: "Associate System Engineer",
    company: "Tata Consultancy Services",
    period: "Dec 2024 – Present",
    highlights: [
      "Built anomaly detection and time series forecasting systems using Prophet and Kubeflow pipelines for Nokia NAC telecom data",
      "Developed AIOps monitoring with Grafana dashboards, Kubernetes, and Camunda BPMN automation to improve observability and incident response",
      "Reduced manual incident response effort by ~40% using Camunda automation",
    ],
  },
  {
    role: "Intern",
    company: "Brototype",
    period: "Apr 2024 – Dec 2024",
    highlights: [
      "Built a full-stack e-commerce platform using Django, PostgreSQL, and JavaScript, handling product management, authentication, and order workflows",
      "Deployed the application on AWS using Docker and Nginx, ensuring scalability and production readiness",
    ],
  },
];

export const education = [
  {
    degree: "Masters of Computer Application (MCA)",
    institution: "Manipal University",
  },
  {
    degree: "Bachelor of Computer Applications (BCA)",
    institution: "University of Calicut, Kerala",
  },
];

export const skills = {
  Backend: ["Python", "Django", "FastAPI", "REST APIs", "Camunda"],
  Frontend: ["JavaScript", "React"],
  Databases: ["PostgreSQL", "MySQL", "MongoDB"],
  "DevOps & Cloud": ["Docker", "Kubernetes", "Git", "Grafana", "AWS"],
  "AI/ML": [
    "Machine Learning",
    "LangChain",
    "RAG Pipelines",
    "Fine Tuning",
    "Prophet",
    "Kubeflow",
  ],
};

export const projects = [
  {
    name: "Exel",
    subtitle: "Client Management Software",
    tech: ["Electron", "Node.js", "React", "SQLite"],
    description:
      "Production desktop application for a driving school client to manage student records, payments, and test schedules in a fully offline environment.",
    highlights: [
      "Integrated real-time WhatsApp notifications via Baileys/WhatsApp Web API",
      "Delivered as self-contained .exe with local SQLite — no internet required",
    ],
    gradient: "from-cyan-500/20 to-blue-600/20",
  },
  {
    name: "RAGTutor",
    subtitle: "AI Desktop Assistant",
    tech: ["Python", "LangChain", "ChromaDB", "NVIDIA LLM"],
    description:
      "Desktop AI assistant with PyQt GUI featuring a full RAG pipeline — ingestion → chunking → embedding → retrieval → generation.",
    highlights: [
      "Semantic search via ChromaDB and NVIDIA Nemotron-120B",
      "High-accuracy context-aware Q&A system",
    ],
    gradient: "from-violet-500/20 to-purple-600/20",
  },
  {
    name: "Timezone",
    subtitle: "E-commerce Platform",
    tech: ["Django", "React", "PostgreSQL", "Razorpay", "AWS", "Docker"],
    description:
      "Full-stack e-commerce with user/admin modules, order tracking, coupon system, and Chart.js revenue dashboards.",
    highlights: [
      "Razorpay payment integration",
      "Deployed on AWS EC2 with Docker and Nginx",
    ],
    gradient: "from-pink-500/20 to-rose-600/20",
  },
];

export const certificates = [
  { name: "Docker Essentials Certification", year: "2024" },
  { name: "Core Java Certification, Tata Consultancy Services (TCS)", year: "2024" },
];

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];
