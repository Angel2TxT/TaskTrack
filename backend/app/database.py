from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = "sqlite:///./tasktrack.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def ensure_schema():
    with engine.begin() as connection:
        tables = {
            row[0]
            for row in connection.execute(
                text("SELECT name FROM sqlite_master WHERE type='table'")
            )
        }
        if "tasks" not in tables:
            return

        columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(tasks)"))
        }
        if "estimated_minutes" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE tasks ADD COLUMN estimated_minutes INTEGER NOT NULL DEFAULT 30"
                )
            )
        if "elapsed_seconds" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE tasks ADD COLUMN elapsed_seconds INTEGER NOT NULL DEFAULT 0"
                )
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
