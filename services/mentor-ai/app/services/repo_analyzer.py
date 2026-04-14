import httpx
import re
from typing import Dict, Optional

class RepoAnalyzer:
    """
    Analyzes public GitHub/GitLab repositories to provide technical context 
    to the AI Mentor for architectural planning.
    """

    @staticmethod
    async def get_repo_context(repo_url: str) -> Dict[str, Optional[str]]:
        """
        Fetches README and basic file tree from a public repository.
        Currently supports GitHub.
        """
        if not repo_url or "github.com" not in repo_url:
            return {"readme": None, "tech_stack": None}

        try:
            # 1. Parse owner and repo name
            # Format: https://github.com/owner/repo
            match = re.search(r"github\.com/([^/]+)/([^/]+)", repo_url)
            if not match:
                return {"readme": None, "tech_stack": None}

            owner, repo = match.groups()
            repo = repo.replace(".git", "")

            async with httpx.AsyncClient(timeout=10.0) as client:
                # 2. Fetch Repository Info (to find default branch)
                repo_info_url = f"https://api.github.com/repos/{owner}/{repo}"
                resp = await client.get(repo_info_url)
                if resp.status_code != 200:
                    return {"readme": None, "tech_stack": None}
                
                data = resp.json()
                default_branch = data.get("default_branch", "main")
                description = data.get("description", "")

                # 3. Fetch README
                readme_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/README.md"
                readme_resp = await client.get(readme_url)
                readme_content = readme_resp.text if readme_resp.status_code == 200 else None

                # 4. Fetch File Tree (Simplified)
                # We prioritize looking for high-level config files
                tree_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
                tree_resp = await client.get(tree_url)
                files = [f["name"] for f in tree_resp.json()] if tree_resp.status_code == 200 else []

                # 5. Master Architect: Source-Code Only Detection
                # We IGNORE existing Docker, Compose, Helm, or TF files
                tech_stack = []
                
                # JavaScript/Node frameworks
                if "package.json" in files:
                    tech_stack.append("Node.js")
                    if "next.config.js" in files or "next.config.mjs" in files: tech_stack.append("Next.js")
                    if "nuxt.config.js" in files: tech_stack.append("Nuxt.js")
                
                # Python frameworks
                if "requirements.txt" in files or "pyproject.toml" in files:
                    tech_stack.append("Python")
                    # Deducing microservice needs from common libs
                    if readme_content:
                        if "fastapi" in readme_content.lower(): tech_stack.append("FastAPI")
                        if "flask" in readme_content.lower(): tech_stack.append("Flask")
                        if "django" in readme_content.lower(): tech_stack.append("Django")
                
                # Go frameworks
                if "go.mod" in files:
                    tech_stack.append("Go")
                    if readme_content:
                        if "gin" in readme_content.lower(): tech_stack.append("Gin")
                        if "echo" in readme_content.lower(): tech_stack.append("Echo")
                
                # Java/Spring
                if "pom.xml" in files or "build.gradle" in files:
                    tech_stack.append("Java/JVM")
                    tech_stack.append("Spring Boot")

                # Database indicators (deduced from source)
                if readme_content:
                    if "postgres" in readme_content.lower() or " pg " in readme_content.lower(): tech_stack.append("PostgreSQL Storage")
                    if "redis" in readme_content.lower(): tech_stack.append("Redis Cache")
                    if "mongodb" in readme_content.lower(): tech_stack.append("MongoDB")
                    if "kafka" in readme_content.lower(): tech_stack.append("Kafka Streams")

                return {
                    "project_name": repo,
                    "description": description,
                    "readme_snippet": readme_content[:4000] if readme_content else None,
                    "detected_source_tech": ", ".join(tech_stack) if tech_stack else "Source Code Detected",
                    "architect_mode": "Zero-Basing (Ignoring existing infra)"
                }

        except Exception as e:
            print(f"Repo Analysis Error: {e}")
            return {"readme": None, "tech_stack": None}
