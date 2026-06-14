#!/bin/bash

# Build and Push Docker Image Script for Mac/Linux
# Usage: ./scripts/build-push.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Docker image configuration
DOCKER_USERNAME="nakharina"
IMAGE_NAME="stock-viz"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}"

# File paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/.."
DEPLOYMENT_FILE="${PROJECT_ROOT}/manifests/stock-api.deployment.yaml"
VERSION_FILE="${SCRIPT_DIR}/VERSION"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Docker Build & Push Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to extract current version from deployment
get_current_version() {
  if [ -f "$DEPLOYMENT_FILE" ]; then
    grep -oP 'image: nakharina/stock-viz:\K[0-9]+\.[0-9]+\.[0-9]+' "$DEPLOYMENT_FILE" | head -1
  else
    echo ""
  fi
}

# Function to increment version
increment_version() {
  local version=$1
  local IFS='.'
  local -a parts=($version)
  ((parts[2]++))
  echo "${parts[0]}.${parts[1]}.${parts[2]}"
}

# Get current version
CURRENT_VERSION=$(get_current_version)

if [ -n "$CURRENT_VERSION" ]; then
  SUGGESTED_VERSION=$(increment_version "$CURRENT_VERSION")
  echo -e "${BLUE}Current version in deployment: ${GREEN}${CURRENT_VERSION}${NC}"
  echo -e "${BLUE}Suggested next version: ${GREEN}${SUGGESTED_VERSION}${NC}"
  echo ""
else
  echo -e "${YELLOW}Could not detect current version from deployment.${NC}"
  SUGGESTED_VERSION="1.0.0"
  echo ""
fi

# Prompt for tag
echo -e "${YELLOW}Enter the image tag (or press Enter to use ${SUGGESTED_VERSION}):${NC}"
read -p "Tag: " TAG

if [ -z "$TAG" ]; then
  TAG="$SUGGESTED_VERSION"
  echo -e "${BLUE}Using suggested version: ${TAG}${NC}"
fi

IMAGE_WITH_TAG="${FULL_IMAGE_NAME}:${TAG}"

echo ""
echo -e "${GREEN}Building Docker image: ${IMAGE_WITH_TAG}${NC}"
echo ""

# Navigate to backend directory
cd "${PROJECT_ROOT}/backend"

# Build Docker image
docker build --platform=linux/amd64 -t "${IMAGE_WITH_TAG}" .

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ Build successful!${NC}"
  echo ""

  # Prompt for push confirmation
  echo -e "${YELLOW}Do you want to push the image to Docker Hub? (y/n):${NC}"
  read -p "Push? " PUSH_CONFIRM

  if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
    echo ""
    echo -e "${GREEN}Pushing image: ${IMAGE_WITH_TAG}${NC}"
    echo ""

    docker push "${IMAGE_WITH_TAG}"

    if [ $? -eq 0 ]; then
      echo ""
      echo -e "${GREEN}✓ Image pushed successfully!${NC}"

      # Update deployment file
      echo ""
      echo -e "${YELLOW}Updating deployment manifest...${NC}"

      if [ -f "$DEPLOYMENT_FILE" ]; then
        # Create backup
        cp "$DEPLOYMENT_FILE" "${DEPLOYMENT_FILE}.bak"

        # Update image tag in deployment
        sed -i.tmp "s|image: nakharina/stock-viz:.*|image: nakharina/stock-viz:${TAG}|g" "$DEPLOYMENT_FILE"
        rm -f "${DEPLOYMENT_FILE}.tmp"

        echo -e "${GREEN}✓ Deployment manifest updated${NC}"
        echo -e "${BLUE}  File: manifests/stock-api.deployment.yaml${NC}"
      fi

      # Store version in VERSION file
      echo "$TAG" > "$VERSION_FILE"
      echo -e "${GREEN}✓ Version stored in scripts/VERSION${NC}"

      echo ""
      echo -e "${GREEN}========================================${NC}"
      echo -e "${GREEN}✓ Success!${NC}"
      echo -e "${GREEN}Image: ${IMAGE_WITH_TAG}${NC}"
      echo -e "${GREEN}Version: ${TAG}${NC}"
      echo -e "${GREEN}========================================${NC}"
      echo ""
      echo -e "${YELLOW}Next steps:${NC}"
      echo -e "  1. Review changes: ${BLUE}git diff manifests/stock-api.deployment.yaml${NC}"
      echo -e "  2. Commit changes: ${BLUE}git add . && git commit -m 'chore: bump image version to ${TAG}'${NC}"
      echo -e "  3. Push to trigger ArgoCD: ${BLUE}git push${NC}"
    else
      echo ""
      echo -e "${RED}Failed to push image. Make sure you're logged in:${NC}"
      echo -e "${YELLOW}  docker login${NC}"
      exit 1
    fi
  else
    echo ""
    echo -e "${BLUE}Skipped push. Image is built locally.${NC}"
  fi
else
  echo ""
  echo -e "${RED}Build failed. Please check the errors above.${NC}"
  exit 1
fi
