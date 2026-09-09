from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Task, User
from app.schemas import TaskCreate, TaskPublic

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("", response_model=TaskPublic, status_code=status.HTTP_201_CREATED)
def create_task(
    body: TaskCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = Task(
        user_id=user.id,
        title=body.title.strip(),
        description=body.description.strip(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
