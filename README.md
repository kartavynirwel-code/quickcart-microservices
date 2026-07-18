# QuickCart

A minimal 3-service microservices practice project. No auth, no fancy patterns —
just enough structure to practice wiring services together, MySQL, and basic
observability (metrics + tracing + structured logs).

**Not included on purpose** (you said you'd handle these yourself): Dockerfiles,
docker-compose.yml, Kubernetes manifests/NetworkPolicies.

## Structure

```
quickcart/
├── schema.sql                  # Run manually against MySQL to create tables
├── frontend/                   # Plain React app (Create React App style)
├── product-order-service/      # Spring Boot (Java 21) — products + orders
└── payment-service/            # FastAPI (Python) — payment verification
```

## Services

### frontend (React)
- Fetches products from `GET /api/products`
- Lets you add/remove items from an in-memory cart
- `POST /api/checkout` on checkout, shows the raw JSON response
- Configure the backend URL via `REACT_APP_API_BASE_URL` (see `.env.example`)

Run locally:
```bash
cd frontend
npm install
npm start
```

### product-order-service (Spring Boot / Java 21 / Maven)
- `GET /api/products` — all products from MySQL
- `POST /api/checkout` — verifies payment via payment-service, saves the order, returns the result
- `GET /api/orders` — all past orders
- `GET /actuator/health`, `GET /actuator/prometheus` — health + metrics
- Structured JSON logs (traceId/spanId auto-attached) via logstash-logback-encoder
- Tracing via Micrometer's OTel bridge, exported over OTLP

Config is fully externalized via env vars — see `.env.example`. Key ones:
`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PAYMENT_SERVICE_URL`.

Run locally (needs MySQL + Java 21 + Maven):
```bash
cd product-order-service
export DB_HOST=localhost DB_USER=root DB_PASSWORD=yourpassword PAYMENT_SERVICE_URL=http://localhost:8000
./mvnw spring-boot:run
```

### payment-service (FastAPI / Python)
- `POST /api/verify-payment` — 80% success / 20% failure, with a small artificial delay
- `GET /api/payments` — all past payment attempts
- `GET /metrics` — Prometheus metrics
- Structured JSON logs (trace_id/span_id auto-attached) via python-json-logger
- Tracing via opentelemetry-instrumentation-fastapi, exported over OTLP

Run locally (needs MySQL + Python 3.11+):
```bash
cd payment-service
pip install -r requirements.txt
export DB_HOST=localhost DB_USER=root DB_PASSWORD=yourpassword
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Database

Run `schema.sql` once against your MySQL server to create the `quickcart`
database and its tables (`products`, `orders`, `payments`), pre-seeded with
5 products. Both services are also configured to auto-create/seed their own
tables on startup for convenience during local dev — feel free to switch
`ddl-auto` to `none` in `product-order-service`'s `application.yml` if you'd
rather rely solely on `schema.sql`.

## Notes for later

- OTLP tracing endpoints in both services default to
  `http://tempo.tracing.svc.cluster.local:4318/v1/traces` — update once your
  collector is deployed.
- `product-order-service` calls `payment-service` using its service hostname
  (`http://payment-service:8000` by default), so it'll resolve correctly once
  both are deployed in the same Kubernetes namespace.
