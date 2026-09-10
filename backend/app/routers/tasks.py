from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Task, User
from app.schemas import TaskCreate, TaskPublic, TaskTimeUpdate, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def get_owned_task(task_id: int, user: User, db: Session) -> Task:
    task = db.get(Task, task_id)
    if task is None or task.user_id != user.id:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return task


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
        estimated_minutes=body.estimated_minutes,
        elapsed_seconds=0,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=list[TaskPublic])
def list_tasks(
    completed: bool = False,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Task)
        .where(Task.user_id == user.id, Task.completed.is_(completed))
        .order_by(Task.created_at.desc())
    ).all()


@router.patch("/{task_id}/details", response_model=TaskPublic)
def update_task(
    task_id: int,
    body: TaskUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = get_owned_task(task_id, user, db)
    task.title = body.title.strip()
    task.description = body.description.strip()
    task.estimated_minutes = body.estimated_minutes
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/time", response_model=TaskPublic)
def update_task_time(
    task_id: int,
    body: TaskTimeUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = get_owned_task(task_id, user, db)
    task.elapsed_seconds = body.elapsed_seconds
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/complete", response_model=TaskPublic)
def complete_task(
    task_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = get_owned_task(task_id, user, db)
    task.completed = True
    db.commit()
    db.refresh(task)
    return task
