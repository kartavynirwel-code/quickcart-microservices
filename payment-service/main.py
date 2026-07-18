import logging
import os
import random
import time

from fastapi import Depends, FastAPI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from logging_config import configure_logging
from models import Payment

# --- Structured JSON logging (trace_id/span_id auto-attached) ---
configure_logging()
logger = logging.getLogger("payment-service")

# --- OpenTelemetry tracing setup ---
# TODO: update this endpoint once your OTel collector / Tempo instance is deployed.
OTLP_ENDPOINT = os.getenv(
    "OTEL_EXPORTER_OTLP_ENDPOINT",
    "http://tempo.tracing.svc.cluster.local:4318/v1/traces",
)

resource = Resource.create({"service.name": "payment-service"})
tracer_provider = TracerProvider(resource=resource)
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=OTLP_ENDPOINT)))
trace.set_tracer_provider(tracer_provider)

# --- Create tables if they don't exist (simple dev-friendly setup) ---
Base.metadata.create_all(bind=engine)

app = FastAPI(title="payment-service")

# Auto-instrument all incoming requests for tracing
FastAPIInstrumentor.instrument_app(app)

# Expose /metrics for Prometheus scraping
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


class VerifyPaymentRequest(BaseModel):
    amount: float


class VerifyPaymentResponse(BaseModel):
    success: bool


@app.post("/api/verify-payment", response_model=VerifyPaymentResponse)
def verify_payment(payload: VerifyPaymentRequest, db: Session = Depends(get_db)):
    # Simulate a real payment gateway call with some latency.
    delay = random.uniform(0.2, 1.5)
    time.sleep(delay)

    # 80% success / 20% failure
    success = random.random() < 0.8
    result = "SUCCESS" if success else "FAILED"

    payment = Payment(amount=payload.amount, result=result)
    db.add(payment)
    db.commit()
    db.refresh(payment)

    logger.info(
        "Processed payment verification",
        extra={"amount": payload.amount, "result": result, "delay_seconds": round(delay, 3)},
    )

    return VerifyPaymentResponse(success=success)


@app.get("/api/payments")
def get_payments(db: Session = Depends(get_db)):
    payments = db.query(Payment).all()
    return [
        {
            "id": p.id,
            "amount": float(p.amount),
            "result": p.result,
            "timestamp": p.timestamp.isoformat() if p.timestamp else None,
        }
        for p in payments
    ]
