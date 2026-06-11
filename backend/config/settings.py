from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN")