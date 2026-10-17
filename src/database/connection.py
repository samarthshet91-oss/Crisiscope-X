import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")


def get_engine() -> Engine:
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is missing. Create a .env file in the project root."
        )

    if not database_url.startswith(("postgresql+psycopg://", "postgresql://")):
        raise RuntimeError("DATABASE_URL must use PostgreSQL (postgresql+psycopg://...).")

    return create_engine(
        database_url.replace("postgresql://", "postgresql+psycopg://", 1),
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=5,
        connect_args={"options": "-c timezone=UTC"},
    )


def check_connection() -> dict[str, str]:
    """Return safe PostgreSQL health details without exposing connection credentials."""
    engine = get_engine()
    try:
        with engine.connect() as connection:
            row = connection.execute(text("SELECT current_database(), current_user, version()")).one()
            return {"database": row[0], "user": row[1], "server": row[2].split(",")[0]}
    finally:
        engine.dispose()


def test_connection() -> None:
    result = check_connection()
    print(f"Database: {result['database']}\nUser: {result['user']}\nPostgreSQL: {result['server']}")


if __name__ == "__main__":
    test_connection()
