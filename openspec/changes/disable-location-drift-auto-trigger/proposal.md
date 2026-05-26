# Disable Location Drift Auto-Trigger for Auto-Grouping

## What
Disable the automatic auto-grouping trigger that occurs when location drift exceeds a threshold, while preserving auto-grouping triggered after upload completion and manual triggers.

## Why
Currently, auto-grouping (flushUngroupedPhotos) is triggered in three places:
1. After upload queue completes (5-second delay in usePhotoUploader.js) - DESIRED
2. Location drift auto-trigger (WavesHub/index.js) - UNDESIRED  
3. Manual triggers (UngroupedPhotosCard and UI buttons) - DESIRED

Users report that auto-grouping is kicking in "not only after the upload completes" - specifically, the location drift trigger is causing unwanted automatic grouping that interrupts the user experience.

This change removes the location drift auto-trigger while keeping the upload-complete and manual triggers intact.

## Context
- File: src/screens/WavesHub/index.js
- Lines: 472-478 (useEffect block for location drift auto-trigger)
- Related: src/screens/PhotosList/upload/usePhotoUploader.js (lines 130-136 for upload-complete trigger)
- Related: Various manual trigger locations (UngroupedPhotosCard, UI buttons)

## Decision
Remove the location drift auto-trigger useEffect block from WavesHub/index.js while preserving all other auto-grouping triggers.