# Waves Hub — WebSocket Subscription

## Requirement: OnPhotoUploadComplete Subscription Works Without Errors

**GIVEN** the WavesHub screen is mounted and user has a valid `uuid`
**WHEN** a WebSocket subscription to `OnPhotoUploadComplete` is established
**THEN** the subscription SHALL connect to AppSync's real-time API without throwing `.pipe is not a function` errors
**AND** the subscription SHALL use a raw WebSocket connection (not Apollo Client link system)
**AND** the subscription SHALL emit to the existing `uploadBus` event bus when a photo upload complete notification is received

## Requirement: Cross-Device Photo Upload Notification

**GIVEN** another device uploads a photo to the same wave
**WHEN** the `OnPhotoUploadComplete` subscription receives the notification
**THEN** the `emitUploadComplete` function SHALL be called on the `uploadBus`
**AND** existing listeners (WavesHub, WaveDetail, useFeedLoader) SHALL receive the notification and trigger refresh

## Requirement: Subscription Lifecycle Management

**GIVEN** the WavesHub component mounts
**WHEN** the component mounts, a WebSocket subscription SHALL be created lazily
**WHEN** the component unmounts, the WebSocket subscription SHALL be cleaned up
**AND** the subscription SHALL automatically reconnect on transient disconnects
