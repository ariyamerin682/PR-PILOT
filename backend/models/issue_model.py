from pydantic import BaseModel

class PlanRequest(BaseModel):
    issue_url: str
    
class ExecuteRequest(BaseModel):
    issue_url: str
    plan: str
    target_file: str