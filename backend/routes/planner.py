from fastapi import APIRouter, HTTPException
import re
from models.issue_model import PlanRequest, ExecuteRequest
from agents.planner_agent import create_plan
from services.gitlab_service import get_issue, get_repo_files
from urllib.parse import quote_plus

router = APIRouter()

def parse_gitlab_url(url: str):
    # e.g. https://gitlab.com/username/project/-/issues/1
    match = re.search(r"gitlab\.com/([^/]+/[^/]+)/-/issues/(\d+)", url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid GitLab issue URL")
    
    project_path = match.group(1)
    issue_iid = int(match.group(2))
    project_id = project_path # python-gitlab handles the encoding
    return project_id, issue_iid, project_path

@router.post("/analyze")
def analyze_issue(data: PlanRequest):
    project_id, issue_iid, project_path = parse_gitlab_url(data.issue_url)
    
    # 1. Fetch issue details
    try:
        issue = get_issue(project_id, issue_iid)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to fetch issue: {str(e)}")
        
    # 2. Fetch repo files context
    try:
        files = get_repo_files(project_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to fetch repo files: {str(e)}")
        
    # 3. Create plan
    issue_text = f"Title: {issue['title']}\nDescription: {issue['description']}"
    plan = create_plan(issue_text, files)
    
    return {
        "issue": issue,
        "plan": plan
    }
    
from agents.patch_agent import generate_patch
from agents.summarizer_agent import generate_summary
from services.gitlab_service import get_file_content, create_branch, commit_changes, create_merge_request

@router.post("/execute")
def execute_plan(data: ExecuteRequest):
    project_id, issue_iid, project_path = parse_gitlab_url(data.issue_url)
    
    # 1. Fetch issue details
    try:
        issue = get_issue(project_id, issue_iid)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to fetch issue: {str(e)}")
        
    issue_text = f"Title: {issue['title']}\nDescription: {issue['description']}"
    
    # 2. Fetch original file content
    try:
        file_content = get_file_content(project_id, data.target_file)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to fetch target file {data.target_file}: {str(e)}")
    
    # 3. Generate Patch
    new_content = generate_patch(issue_text, data.plan, file_content)
    
    # Clean code block if gemini hallucinated one
    if "```" in new_content:
        new_content = new_content.split("```")[1]
        if new_content.startswith("python") or new_content.startswith("javascript") or new_content.startswith("typescript"):
            new_content = new_content.split("\n", 1)[1]
    
    # 4. Generate Summary
    mr_summary = generate_summary(issue['title'], data.plan)
    
    # 5. GitLab execution
    branch_name = f"fix/issue-{issue_iid}-{str(hash(data.plan))[:6]}"
    
    try:
        create_branch(project_id, branch_name)
    except Exception as e:
        pass # Branch might already exist, continue
        
    actions = [
        {
            'action': 'update',
            'file_path': data.target_file,
            'content': new_content
        }
    ]
    
    try:
        commit_changes(project_id, branch_name, f"Fix issue {issue_iid}", actions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to commit changes: {str(e)}")
        
    try:
        mr_url = create_merge_request(project_id, branch_name, "main", f"Resolve Issue #{issue_iid}", mr_summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create MR: {str(e)}")
        
    return {
        "status": "success",
        "mr_url": mr_url,
        "branch": branch_name
    }