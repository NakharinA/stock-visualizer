# Build and Deployment Scripts

This directory contains scripts for building and pushing Docker images with automatic version management.

## Prerequisites

- Docker installed and running
- Docker Hub account credentials
- Logged into Docker Hub: `docker login`

## Scripts

### `build-push.sh` (Mac/Linux)

Builds and pushes the Docker image to Docker Hub with automatic version management.

**Usage:**
```bash
./scripts/build-push.sh
```

**What it does:**
1. **Reads current version** from `manifests/stock-api.deployment.yaml`
2. **Auto-suggests next version** (increments patch version)
3. Prompts you to enter an image tag (or press Enter to accept suggestion)
4. Builds the Docker image with platform `linux/amd64`
5. Asks if you want to push to Docker Hub
6. Pushes the image if confirmed
7. **Automatically updates** the deployment manifest with new version
8. **Stores version** in `scripts/VERSION` file
9. Shows next steps for git commit

### `build-push.bat` (Windows)

Same functionality as the shell script, but for Windows.

**Usage:**
```cmd
scripts\build-push.bat
```

## Version Management

### VERSION File

The `scripts/VERSION` file stores the current/latest version that was built and pushed. This makes it easy to:
- Quickly check the current deployed version
- Reference in CI/CD pipelines
- Track version history through git

### Auto-Increment Logic

The scripts automatically:
1. Read the current version from deployment manifest (e.g., `1.0.1`)
2. Increment the patch version (e.g., suggest `1.0.2`)
3. Allow you to override with custom version if needed

### Deployment Manifest Update

After a successful push, the scripts automatically:
- Update `manifests/stock-api.deployment.yaml` with the new image tag
- Create a backup of the old manifest (`.bak` file)
- Ready for git commit and ArgoCD deployment

## Configuration

Both scripts use the following configuration:
- **Docker Username:** `nakharina`
- **Image Name:** `stock-viz`
- **Full Image:** `nakharina/stock-viz`
- **Deployment File:** `manifests/stock-api.deployment.yaml`
- **Version File:** `scripts/VERSION`

To change these values, edit the variables at the top of each script.

## Example Workflow

**Scenario: Current version is 1.0.1, you want to deploy 1.0.2**

1. Make changes to your backend code
2. Test locally
3. Run the build script:
   ```bash
   # Mac/Linux
   ./scripts/build-push.sh

   # Windows
   scripts\build-push.bat
   ```

4. See the output:
   ```
   Current version in deployment: 1.0.1
   Suggested next version: 1.0.2

   Enter the image tag (or press Enter to use 1.0.2):
   Tag: [Press Enter]
   ```

5. Build completes and asks:
   ```
   Do you want to push the image to Docker Hub? (y/n): y
   ```

6. After successful push:
   ```
   ✓ Image pushed successfully!
   ✓ Deployment manifest updated
   ✓ Version stored in scripts/VERSION

   Next steps:
     1. Review changes: git diff manifests/stock-api.deployment.yaml
     2. Commit changes: git add . && git commit -m 'chore: bump image version to 1.0.2'
     3. Push to trigger ArgoCD: git push
   ```

7. Commit and push:
   ```bash
   git add .
   git commit -m "chore: bump image version to 1.0.2"
   git push
   ```

8. ArgoCD will detect the change and deploy the new version

## Custom Version Tags

You can also use custom versions:

```
Enter the image tag: 2.0.0-beta
```

Or use descriptive tags:
```
Enter the image tag: 1.0.2-hotfix
```

## Files Modified by Scripts

- `manifests/stock-api.deployment.yaml` - Image tag updated
- `scripts/VERSION` - Current version stored
- `manifests/stock-api.deployment.yaml.bak` - Backup of previous manifest (Mac/Linux)

## Troubleshooting

**"docker: command not found"**
- Make sure Docker is installed and running

**"unauthorized: authentication required"**
- Run `docker login` and enter your Docker Hub credentials

**Build fails**
- Check the Dockerfile for errors
- Ensure you're in the correct directory
- Check Docker daemon is running

**Version not detected**
- Ensure `manifests/stock-api.deployment.yaml` exists
- Check the image line format: `image: nakharina/stock-viz:1.0.1`

**Manifest not updated (Windows)**
- Requires PowerShell to be available
- Check file permissions on the manifest file
