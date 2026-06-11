from services.gemini_service import ask_gemini

def generate_summary(issue_title: str, plan: str):
    prompt = f"""
    You are a software engineering technical writer.

    Issue Title: {issue_title}
    
    Plan:
    {plan}

    Write a clear and professional Merge Request description. Include:
    1. A summary of the changes.
    2. The reasoning behind the fix.
    3. A brief test checklist.
    """

    return ask_gemini(prompt)
