# Kubernetes Deployment & Operations Guide
## BioSprint Engine: Cluster Orchestration & Scaling
**Document Identifier:** DOC-DEP-KUBE-001  
**Target Cluster:** Kubernetes 1.25+ (Minikube, kind, EKS, GKE, AKS)  

---

## 1. Directory Structure

All manifests are organized under `deployment/kubernetes/`:
- `00-namespace.yaml`: Isolated namespace `biosprint-engine`.
- `01-configmap.yaml`: Non-sensitive environment variables.
- `02-secrets-template.yaml`: Sensitive JWT keys and DB credentials.
- `03-pvc.yaml`: Persistent volume claims for data and uploaded files.
- `04-backend.yaml`: Backend Deployment (2 replicas, liveness/readiness probes) and ClusterIP Service.
- `05-frontend-ingress.yaml`: Frontend Deployment (2 replicas), Service, and Nginx Ingress route with TLS termination.

---

## 2. Step-by-Step Deployment Procedure

### Step 1: Create Namespace & Secrets
```bash
kubectl apply -f deployment/kubernetes/00-namespace.yaml
kubectl apply -f deployment/kubernetes/01-configmap.yaml

# Generate strong production secret:
kubectl create secret generic biosprint-secrets \
  --namespace=biosprint-engine \
  --from-literal=JWT_SECRET="YOUR_HIGH_ENTROPY_64_CHAR_KEY"
```

### Step 2: Apply Persistent Storage & Workloads
```bash
kubectl apply -f deployment/kubernetes/03-pvc.yaml
kubectl apply -f deployment/kubernetes/04-backend.yaml
kubectl apply -f deployment/kubernetes/05-frontend-ingress.yaml
```

### Step 3: Verify Pod Health & Rollout
```bash
kubectl get pods -n biosprint-engine -o wide
kubectl get services -n biosprint-engine
kubectl rollout status deployment/biosprint-backend -n biosprint-engine
kubectl rollout status deployment/biosprint-frontend -n biosprint-engine
```

---

## 3. Scaling & Zero-Downtime Rolling Updates

The deployment specifies `maxSurge: 1` and `maxUnavailable: 0` with HTTP health probes on `/health`. During image updates (`kubectl set image deployment/biosprint-backend backend=biosprint/backend:1.1.0 -n biosprint-engine`), new pods must pass readiness checks before older pods are terminated, ensuring 100% zero downtime.
