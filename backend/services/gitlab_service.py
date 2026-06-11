import gitlab
from config.settings import GITLAB_TOKEN
import base64

gl = gitlab.Gitlab(
    "https://gitlab.com",
    private_token=GITLAB_TOKEN
)

def get_issue(project_id: int, issue_iid: int):
    project = gl.projects.get(project_id)
    issue = project.issues.get(issue_iid)
    return {
        "title": issue.title,
        "description": issue.description,
        "author": issue.author['username'],
    }

def get_repo_files(project_id: int, branch: str = "main"):
    project = gl.projects.get(project_id)
    items = project.repository_tree(ref=branch, recursive=True, all=True)
    files = [item['path'] for item in items if item['type'] == 'blob']
    return files

def get_file_content(project_id: int, file_path: str, branch: str = "main"):
    project = gl.projects.get(project_id)
    f = project.files.get(file_path=file_path, ref=branch)
    return base64.b64decode(f.content).decode("utf-8")

def create_branch(project_id: int, branch_name: str, ref: str = "main"):
    project = gl.projects.get(project_id)
    project.branches.create({'branch': branch_name, 'ref': ref})

def commit_changes(project_id: int, branch_name: str, commit_message: str, actions: list):
    project = gl.projects.get(project_id)
    data = {
        'branch': branch_name,
        'commit_message': commit_message,
        'actions': actions
    }
    project.commits.create(data)

def create_merge_request(project_id: int, source_branch: str, target_branch: str, title: str, description: str):
    project = gl.projects.get(project_id)
    mr = project.mergerequests.create({
        'source_branch': source_branch,
        'target_branch': target_branch,
        'title': title,
        'description': description
    })
    return mr.web_url