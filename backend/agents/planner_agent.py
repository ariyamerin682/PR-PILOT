import json
from services.gemini_service import ask_gemini

def create_plan(issue_text, repo_files):
    prompt = f"""
    You are a software engineering planner.

    Issue:
    {issue_text}
    
    Repository Files:
    {repo_files}

    Create a fix plan.
    Respond strictly in JSON format with no markdown formatting or extra text:
    {{
        "summary": "Brief summary of the issue",
        "target_file": "The single most likely file to edit from the repository files list",
        "plan": "Detailed step-by-step fix plan"
    }}
    """
    
    response_text = ask_gemini(prompt)
    try:
        # Clean up any potential markdown code blocks
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
    except Exception:
        return {
            "summary": "Could not parse plan",
            "target_file": "",
            "plan": response_text
        }