@echo off
REM Build and Push Docker Image Script for Windows
REM Usage: scripts\build-push.bat

setlocal enabledelayedexpansion

REM Docker image configuration
set DOCKER_USERNAME=nakharina
set IMAGE_NAME=stock-viz
set FULL_IMAGE_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%

REM File paths
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set DEPLOYMENT_FILE=%PROJECT_ROOT%\manifests\stock-api.deployment.yaml
set VERSION_FILE=%SCRIPT_DIR%VERSION

echo ========================================
echo   Docker Build ^& Push Script
echo ========================================
echo.

REM Extract current version from deployment
set CURRENT_VERSION=
if exist "%DEPLOYMENT_FILE%" (
  for /f "tokens=2 delims=:" %%a in ('findstr /r "image:.*nakharina/stock-viz:" "%DEPLOYMENT_FILE%"') do (
    for /f "tokens=2 delims=:" %%b in ("%%a") do (
      set CURRENT_VERSION=%%b
      goto :found_version
    )
  )
)
:found_version

REM Remove leading/trailing spaces
if defined CURRENT_VERSION (
  for /f "tokens=* delims= " %%a in ("!CURRENT_VERSION!") do set CURRENT_VERSION=%%a
)

REM Calculate suggested version
set SUGGESTED_VERSION=1.0.0
if defined CURRENT_VERSION (
  echo Current version in deployment: !CURRENT_VERSION!

  REM Parse version parts
  for /f "tokens=1,2,3 delims=." %%a in ("!CURRENT_VERSION!") do (
    set MAJOR=%%a
    set MINOR=%%b
    set /a PATCH=%%c+1
  )
  set SUGGESTED_VERSION=!MAJOR!.!MINOR!.!PATCH!
  echo Suggested next version: !SUGGESTED_VERSION!
) else (
  echo Could not detect current version from deployment.
)
echo.

REM Prompt for tag
set /p TAG="Enter the image tag (or press Enter to use %SUGGESTED_VERSION%): "

if "!TAG!"=="" (
  set TAG=!SUGGESTED_VERSION!
  echo Using suggested version: !TAG!
)

set IMAGE_WITH_TAG=%FULL_IMAGE_NAME%:!TAG!

echo.
echo Building Docker image: !IMAGE_WITH_TAG!
echo.

REM Navigate to backend directory
cd /d "%PROJECT_ROOT%\backend"

REM Build Docker image
docker build --platform=linux/amd64 -t !IMAGE_WITH_TAG! .

if %errorlevel% equ 0 (
  echo.
  echo Build successful!
  echo.

  REM Prompt for push confirmation
  set /p PUSH_CONFIRM="Do you want to push the image to Docker Hub? (y/n): "

  if /i "!PUSH_CONFIRM!"=="y" (
    echo.
    echo Pushing image: !IMAGE_WITH_TAG!
    echo.

    docker push !IMAGE_WITH_TAG!

    if !errorlevel! equ 0 (
      echo.
      echo Image pushed successfully!
      echo.

      REM Update deployment file
      echo Updating deployment manifest...

      if exist "%DEPLOYMENT_FILE%" (
        REM Create backup
        copy "%DEPLOYMENT_FILE%" "%DEPLOYMENT_FILE%.bak" >nul

        REM Update image tag using PowerShell
        powershell -Command "(Get-Content '%DEPLOYMENT_FILE%') -replace 'image: nakharina/stock-viz:.*', 'image: nakharina/stock-viz:!TAG!' | Set-Content '%DEPLOYMENT_FILE%'"

        echo Deployment manifest updated
        echo   File: manifests\stock-api.deployment.yaml
      )

      REM Store version in VERSION file
      echo !TAG! > "%VERSION_FILE%"
      echo Version stored in scripts\VERSION

      echo.
      echo ========================================
      echo Success!
      echo Image: !IMAGE_WITH_TAG!
      echo Version: !TAG!
      echo ========================================
      echo.
      echo Next steps:
      echo   1. Review changes: git diff manifests\stock-api.deployment.yaml
      echo   2. Commit changes: git add . ^&^& git commit -m "chore: bump image version to !TAG!"
      echo   3. Push to trigger ArgoCD: git push
    ) else (
      echo.
      echo Failed to push image. Make sure you're logged in:
      echo   docker login
      exit /b 1
    )
  ) else (
    echo.
    echo Skipped push. Image is built locally.
  )
) else (
  echo.
  echo Build failed. Please check the errors above.
  exit /b 1
)

endlocal
