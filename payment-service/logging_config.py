import logging

from opentelemetry import trace
from pythonjsonlogger import jsonlogger


class TraceContextFilter(logging.Filter):
    """Attaches the current OpenTelemetry trace_id/span_id to every log record,
    similar to how MDC works for the Java service."""

    def filter(self, record: logging.LogRecord) -> bool:
        span = trace.get_current_span()
        span_context = span.get_span_context()

        if span_context and span_context.is_valid:
            record.trace_id = format(span_context.trace_id, "032x")
            record.span_id = format(span_context.span_id, "016x")
        else:
            record.trace_id = None
            record.span_id = None

        return True


def configure_logging() -> None:
    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s %(trace_id)s %(span_id)s",
        rename_fields={"trace_id": "traceId", "span_id": "spanId"},
    )
    handler.setFormatter(formatter)
    handler.addFilter(TraceContextFilter())

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(logging.INFO)
