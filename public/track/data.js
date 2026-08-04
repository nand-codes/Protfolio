const ROADMAP = {
  startDate: "2026-07-24",
  endDate: "2027-01-24",
  phases: [
    {
      id: "phase1",
      title: "Foundations",
      month: "Month 1",
      dates: "Jul 24 – Aug 23",
      color: "#6C63FF",
      icon: "🧱",
      topics: [
        {
          id: "python-adv",
          title: "Python (Advanced)",
          icon: "🐍",
          subtasks: [
            "Decorators, generators, context managers",
            "OOP: classes, inheritance, metaclasses",
            "Type hints & dataclasses",
            "Async/await & concurrency",
            "Testing with pytest",
            "Packaging & virtual environments"
          ]
        },
        {
          id: "sql",
          title: "SQL",
          icon: "🗄️",
          subtasks: [
            "Joins, subqueries, CTEs",
            "Window functions",
            "Query optimization & indexing",
            "Stored procedures",
            "Data modeling & normalization"
          ]
        },
        {
          id: "numpy-pandas",
          title: "NumPy + Pandas",
          icon: "📊",
          subtasks: [
            "NumPy arrays & broadcasting",
            "Pandas DataFrames & Series",
            "Data cleaning & wrangling",
            "GroupBy, pivot, merge operations",
            "Vectorized operations & performance",
            "Data visualization with Matplotlib/Seaborn"
          ]
        }
      ]
    },
    {
      id: "phase2",
      title: "Math & Classical ML",
      month: "Month 2",
      dates: "Aug 24 – Sep 23",
      color: "#FF6B9D",
      icon: "📐",
      topics: [
        {
          id: "stats-prob",
          title: "Statistics & Probability",
          icon: "🎲",
          subtasks: [
            "Descriptive statistics & distributions",
            "Hypothesis testing & p-values",
            "Bayesian thinking",
            "Correlation & regression analysis",
            "A/B testing methodology"
          ]
        },
        {
          id: "sklearn",
          title: "Scikit-learn",
          icon: "⚙️",
          subtasks: [
            "Preprocessing & pipelines",
            "Cross-validation strategies",
            "Hyperparameter tuning (Grid/Random/Bayesian)",
            "Feature engineering & selection",
            "Model evaluation metrics"
          ]
        },
        {
          id: "ml-algos",
          title: "ML Algorithms",
          icon: "🤖",
          subtasks: [
            "Linear & logistic regression",
            "Decision trees & random forests",
            "SVM & kernel methods",
            "K-means & DBSCAN clustering",
            "Gradient boosting (XGBoost, LightGBM)",
            "Ensemble methods & stacking"
          ]
        }
      ]
    },
    {
      id: "phase3",
      title: "Deep Learning",
      month: "Month 3",
      dates: "Sep 24 – Oct 23",
      color: "#00D2FF",
      icon: "🔮",
      topics: [
        {
          id: "pytorch",
          title: "PyTorch",
          icon: "🔥",
          subtasks: [
            "Tensors & autograd",
            "nn.Module & custom layers",
            "DataLoaders & Datasets",
            "Training loops & optimizers",
            "GPU acceleration & mixed precision",
            "Model saving & loading"
          ]
        },
        {
          id: "deep-learning",
          title: "Deep Learning",
          icon: "🧬",
          subtasks: [
            "CNNs for computer vision",
            "RNNs, LSTMs, GRUs",
            "Attention mechanisms",
            "Transfer learning & fine-tuning",
            "Regularization techniques",
            "Architecture design patterns"
          ]
        }
      ]
    },
    {
      id: "phase4",
      title: "Advanced AI",
      month: "Month 4",
      dates: "Oct 24 – Nov 23",
      color: "#FFD93D",
      icon: "✨",
      topics: [
        {
          id: "nlp-transformers",
          title: "NLP & Transformers",
          icon: "📝",
          subtasks: [
            "Tokenization & embeddings",
            "Transformer architecture deep dive",
            "HuggingFace ecosystem",
            "Text classification & NER",
            "Sequence-to-sequence models",
            "Fine-tuning pretrained models"
          ]
        },
        {
          id: "llm-rag",
          title: "LLMs + RAG + LangChain",
          icon: "🦜",
          subtasks: [
            "LLM fundamentals & prompt engineering",
            "RAG architecture & vector databases",
            "LangChain chains & agents",
            "Embedding models & similarity search",
            "Evaluation of LLM systems",
            "Building production chatbots"
          ]
        }
      ]
    },
    {
      id: "phase5",
      title: "MLOps & Engineering",
      month: "Month 5",
      dates: "Nov 24 – Dec 23",
      color: "#FF8C42",
      icon: "🛠️",
      topics: [
        {
          id: "docker",
          title: "Docker",
          icon: "🐳",
          subtasks: [
            "Dockerfiles & image building",
            "Docker Compose for multi-service apps",
            "Container networking & volumes",
            "Optimizing image sizes for ML"
          ]
        },
        {
          id: "fastapi",
          title: "FastAPI",
          icon: "⚡",
          subtasks: [
            "REST API design & routing",
            "Pydantic models & validation",
            "Async endpoints for ML inference",
            "Authentication & middleware",
            "Serving ML models via API"
          ]
        },
        {
          id: "mlflow",
          title: "MLflow",
          icon: "📦",
          subtasks: [
            "Experiment tracking & logging",
            "Model registry & versioning",
            "MLflow Projects & reproducibility",
            "Model deployment with MLflow"
          ]
        },
        {
          id: "kubernetes",
          title: "Kubernetes",
          icon: "☸️",
          subtasks: [
            "Pods, Services, Deployments",
            "Scaling ML workloads",
            "Helm charts for ML pipelines",
            "Monitoring & observability"
          ]
        }
      ]
    },
    {
      id: "phase6",
      title: "Cloud & Production",
      month: "Month 6",
      dates: "Dec 24 – Jan 23",
      color: "#7BF1A8",
      icon: "☁️",
      topics: [
        {
          id: "aws-azure",
          title: "AWS or Azure",
          icon: "☁️",
          subtasks: [
            "Cloud ML services (SageMaker / Azure ML)",
            "S3/Blob storage for datasets",
            "EC2/VM instances & GPU setup",
            "IAM & security best practices",
            "CI/CD pipelines for ML"
          ]
        },
        {
          id: "spark",
          title: "Spark / Databricks",
          icon: "⚡",
          subtasks: [
            "PySpark fundamentals",
            "Distributed data processing",
            "Spark MLlib basics",
            "Databricks notebooks & workflows"
          ]
        },
        {
          id: "system-design",
          title: "System Design for ML",
          icon: "🏗️",
          subtasks: [
            "ML system architecture patterns",
            "Data pipelines & feature stores",
            "Model serving at scale",
            "A/B testing infrastructure",
            "Monitoring & drift detection"
          ]
        }
      ]
    }
  ]
};
