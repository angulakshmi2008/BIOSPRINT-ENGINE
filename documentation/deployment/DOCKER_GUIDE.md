# Docker Containerization & Deployment Guide
## BioSprint Engine: Production Multi-Container Orchestration
**Document Identifier:** DOC-DEP-DOCKER-001  

---

## 1. Quick Local Launch

The application includes a production-grade multi-container `docker-compose.yml` linking the React Nginx frontend and the Node.js Express REST API backend with persistent volumes.

To build and run all services in one command:

```bash
docker compose up --build -d
```

### Verified Endpoints:
- **Frontend Application:** `http://localhost:3000`
- **Backend API & Health:** `http://localhost:5000/health`

---

## 2. Managing Containers & Logs

### View Container Status:
```bash
docker compose ps
```

### View Live Logs:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Stop Services Without Data Loss:
```bash
docker compose down
```
*(Persistent data remains stored safely in the named volumes `biosprint_db_data` and `biosprint_uploads`).*

### Complete Reset (Wipe Volumes):
```bash
docker compose down -v
```

---

## 3. Container Security & Production Hardening

1. **Non-Root Execution:** The backend container drops root privileges and executes as standard `node:node` user (UID 1000).
2. **Process Reaping:** `dumb-init` runs as PID 1 to handle SIGTERM/SIGINT signals cleanly and avoid zombie processes.
3. **Healthchecks:** Automated polling against `/health` ensures the frontend container only routes traffic after the backend reports healthy readiness.
