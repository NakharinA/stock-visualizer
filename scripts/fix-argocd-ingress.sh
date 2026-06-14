#!/bin/bash

# Script to fix ArgoCD Ingress health check issue
# This configures ArgoCD to consider all Ingress resources as healthy immediately

set -e

echo "========================================"
echo "  ArgoCD Ingress Health Check Fix"
echo "========================================"
echo ""

echo "This script will configure ArgoCD to mark Ingress resources as healthy"
echo "without waiting for LoadBalancer IP assignment."
echo ""

read -p "Continue? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Applying health check configuration to ArgoCD..."
echo ""

# Use kubectl patch to safely add the health check
kubectl patch configmap argocd-cm -n argocd --type merge -p '
{
  "data": {
    "resource.customizations.health.networking.k8s.io_Ingress": "hs = {}\nhs.status = \"Healthy\"\nhs.message = \"Ingress is healthy\"\nreturn hs"
  }
}'

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ ArgoCD ConfigMap updated successfully!"
  echo ""
  echo "Restarting ArgoCD server to apply changes..."
  kubectl rollout restart deployment argocd-server -n argocd

  if [ $? -eq 0 ]; then
    echo ""
    echo "✓ ArgoCD server restarted!"
    echo ""
    echo "========================================"
    echo "✓ Fix applied successfully!"
    echo "========================================"
    echo ""
    echo "Wait 30-60 seconds for ArgoCD server to restart,"
    echo "then refresh your ArgoCD UI to see the Ingress as healthy."
  else
    echo ""
    echo "Warning: Could not restart ArgoCD server."
    echo "Please restart it manually:"
    echo "  kubectl rollout restart deployment argocd-server -n argocd"
  fi
else
  echo ""
  echo "Error: Failed to patch ArgoCD ConfigMap"
  echo "Please check your kubectl access and try again."
  exit 1
fi
