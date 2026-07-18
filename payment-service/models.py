from sqlalchemy import Column, Integer, Numeric, String, DateTime
from sqlalchemy.sql import func

from database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    amount = Column(Numeric(10, 2), nullable=False)
    result = Column(String(20), nullable=False)  # SUCCESS or FAILED
    timestamp = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
