from services.gemini_service import ask_gemini

def generate_patch(issue_text: str, plan: str, file_content: str):
    prompt = f"""
    You are a software engineering patch generator.

    Issue:
    {issue_text}
    
    Plan:
    {plan}
    
    File Content:
    {file_content}

    Generate ONLY the new, complete file content that implements the fix described in the plan. Do not use markdown code blocks or any explanation. Just the raw code.
    """

    return ask_gemini(prompt)
