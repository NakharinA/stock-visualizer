#!/bin/bash

# Quick script to check ArgoCD application status
# Usage: ./scripts/check-argo-status.sh

echo "Checking ArgoCD application status..."
echo ""

# Get the ingress resource details
echo "=== Ingress Resource Status ==="
kubectl get ingress stock-api -n pueyleng -o yaml

echo ""
echo "=== Ingress Controller Pods ==="
kubectl get pods -n ingress-nginx

echo ""
echo "=== Recent Events ==="
kubectl get events -n pueyleng --sort-by='.lastTimestamp' | tail -20
