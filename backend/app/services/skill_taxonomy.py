import re
from typing import Dict, List, Set, Tuple

# Comprehensive taxonomy of skills mapped to categories
SKILL_TAXONOMY: Dict[str, Dict[str, List[str]]] = {
    "Languages": {
        "python": ["python", "python3", "py"],
        "javascript": ["javascript", "js", "ecmascript"],
        "typescript": ["typescript", "ts"],
        "java": ["java", "jvm"],
        "c++": ["c++", "cpp"],
        "c#": ["c#", "csharp", "dotnet", ".net"],
        "go": ["go", "golang"],
        "rust": ["rust"],
        "ruby": ["ruby", "ruby on rails", "rails"],
        "php": ["php"],
        "swift": ["swift"],
        "kotlin": ["kotlin"],
        "scala": ["scala"],
        "sql": ["sql", "t-sql", "pl/sql", "ansi-sql"],
        "r": ["r language", "r-lang"],
        "bash": ["bash", "shell", "powershell", "sh", "zsh"],
        "html": ["html", "html5"],
        "css": ["css", "css3", "sass", "scss", "less"],
    },
    "Frameworks & Libraries": {
        "react": ["react", "react.js", "reactjs"],
        "vue": ["vue", "vue.js", "vuejs"],
        "angular": ["angular", "angular.js", "angularjs"],
        "next.js": ["next.js", "nextjs"],
        "node.js": ["node", "node.js", "nodejs"],
        "express": ["express", "express.js", "expressjs"],
        "fastapi": ["fastapi", "fast-api"],
        "django": ["django"],
        "flask": ["flask"],
        "spring boot": ["spring", "spring boot", "springboot"],
        "tailwind css": ["tailwind", "tailwindcss", "tailwind-css"],
        "bootstrap": ["bootstrap"],
        "redux": ["redux", "redux toolkit"],
        "graphql": ["graphql", "apollo"],
        "rest api": ["rest", "restful", "rest api", "rest apis", "restful apis"],
    },
    "Databases & Storage": {
        "postgresql": ["postgresql", "postgres", "psql"],
        "mysql": ["mysql"],
        "mongodb": ["mongodb", "mongo"],
        "redis": ["redis"],
        "elasticsearch": ["elasticsearch", "elastic search", "opensearch"],
        "sqlite": ["sqlite", "sqlite3"],
        "cassandra": ["cassandra"],
        "dynamodb": ["dynamodb"],
        "firebase": ["firebase", "firestore"],
        "oracle": ["oracle db", "oracle database"],
    },
    "Cloud & DevOps": {
        "aws": ["aws", "amazon web services", "ec2", "s3", "lambda", "ecs", "eks"],
        "azure": ["azure", "microsoft azure"],
        "gcp": ["gcp", "google cloud", "google cloud platform"],
        "docker": ["docker", "containerization", "containers"],
        "kubernetes": ["kubernetes", "k8s"],
        "terraform": ["terraform", "iac", "infrastructure as code"],
        "ci/cd": ["ci/cd", "ci-cd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
        "linux": ["linux", "ubuntu", "debian", "centos", "redhat"],
        "nginx": ["nginx"],
        "ansible": ["ansible"],
        "kafka": ["kafka", "apache kafka"],
        "rabbitmq": ["rabbitmq"],
    },
    "Data & AI / ML": {
        "machine learning": ["machine learning", "ml"],
        "deep learning": ["deep learning", "dl"],
        "artificial intelligence": ["artificial intelligence", "ai"],
        "nlp": ["nlp", "natural language processing"],
        "computer vision": ["computer vision", "cv"],
        "pytorch": ["pytorch"],
        "tensorflow": ["tensorflow", "tf"],
        "scikit-learn": ["scikit-learn", "sklearn"],
        "pandas": ["pandas"],
        "numpy": ["numpy"],
        "data analysis": ["data analysis", "data analytics"],
        "data engineering": ["data engineering", "etl"],
        "spark": ["spark", "apache spark", "pyspark"],
        "bigquery": ["bigquery"],
    },
    "Testing & Tools": {
        "git": ["git", "github", "gitlab"],
        "unit testing": ["unit testing", "pytest", "jest", "junit", "mocha"],
        "integration testing": ["integration testing"],
        "end-to-end testing": ["e2e", "cypress", "playwright", "selenium"],
        "agile / scrum": ["agile", "scrum", "kanban", "sprint"],
        "jira": ["jira", "confluence"],
        "postman": ["postman"],
        "microservices": ["microservices", "microservice architecture"],
        "system design": ["system design", "distributed systems"],
    },
    "Professional & Soft Skills": {
        "leadership": ["leadership", "team lead", "mentorship", "mentoring"],
        "communication": ["communication", "technical writing", "presentation"],
        "problem solving": ["problem solving", "analytical thinking", "critical thinking"],
        "collaboration": ["collaboration", "cross-functional", "team player"],
        "project management": ["project management", "stakeholder management"],
    }
}

def extract_skills_from_text(text: str) -> Tuple[List[str], Dict[str, List[str]]]:
    """
    Extracts recognized skills and maps them to categories.
    Returns:
        (unique_skill_names_list, categorized_skills_dict)
    """
    lowered = " " + text.lower() + " "
    # Replace common punctuation marks with spaces, but preserve dots when part of tech names (e.g. node.js)
    cleaned = re.sub(r'[,;:!?()\[\]{}"\'`\\|/]', ' ', lowered)
    # Remove dots at the end of words or sentences
    cleaned = re.sub(r'\.(?=\s|$)', ' ', cleaned)
    
    found_skills: Set[str] = set()
    categorized: Dict[str, List[str]] = {}

    for category, skills in SKILL_TAXONOMY.items():
        categorized[category] = []
        for canonical_name, aliases in skills.items():
            for alias in aliases:
                # Word boundary check using non-word characters
                pattern = r"(?<![a-zA-Z0-9])" + re.escape(alias) + r"(?![a-zA-Z0-9])"
                if re.search(pattern, cleaned):
                    found_skills.add(canonical_name)
                    categorized[category].append(canonical_name)
                    break
        if not categorized[category]:
            del categorized[category]

    return sorted(list(found_skills)), categorized

