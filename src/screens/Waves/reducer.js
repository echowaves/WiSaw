/* global console */
import { gql } from '@apollo/client'
import * as CONST from '../../consts'

export const listWaves = async ({ pageNumber, batch, uuid, sortBy, sortDirection, searchTerm }) => {
  try {
    const variables = { pageNumber, batch, uuid }
    if (sortBy) variables.sortBy = sortBy
    if (sortDirection) variables.sortDirection = sortDirection
    if (searchTerm) variables.searchTerm = searchTerm

    const response = await CONST.gqlClient.query({
      query: gql`
        query listWaves($pageNumber: Int!, $batch: String!, $uuid: String!, $sortBy: String, $sortDirection: String, $searchTerm: String) {
          listWaves(pageNumber: $pageNumber, batch: $batch, uuid: $uuid, sortBy: $sortBy, sortDirection: $sortDirection, searchTerm: $searchTerm) {
            waves {
              waveUuid
              name
              description
              createdAt
              updatedAt
              createdBy
              photosCount
              open
              splashDate
              freezeDate
              isFrozen
              freezeMode
              myRole
              joinUrl
              location
              radius
              photos {
                id
                thumbUrl
              }
            }
            batch
            noMoreData
          }
        }
      `,
      variables,
    })
    return response.data.listWaves
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const createWave = async ({ name, description, uuid, lat, lon, radius }) => {
  try {
    const variables = { name, description, uuid }
    if (lat !== undefined) variables.lat = lat
    if (lon !== undefined) variables.lon = lon
    if (radius !== undefined) variables.radius = radius

    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation createWave($name: String!, $description: String!, $uuid: String!, $lat: Float, $lon: Float, $radius: Int) {
          createWave(name: $name, description: $description, uuid: $uuid, lat: $lat, lon: $lon, radius: $radius) {
            waveUuid
            name
            description
            createdAt
            updatedAt
            createdBy
            open
            splashDate
            freezeDate
            isFrozen
            freezeMode
            myRole
            joinUrl
            location
            radius
          }
        }
      `,
      variables
    })
    return response.data.createWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const getWave = async ({ waveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query getWave($waveUuid: String!, $uuid: String!) {
          getWave(waveUuid: $waveUuid, uuid: $uuid) {
            waveUuid
            name
            description
            createdAt
            updatedAt
            createdBy
            open
            splashDate
            freezeDate
            isFrozen
            freezeMode
            myRole
            joinUrl
            location
            radius
          }
        }
      `,
      variables: { waveUuid, uuid },
      fetchPolicy: 'network-only'
    })
    return response.data.getWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const updateWave = async ({ waveUuid, uuid, name, description, lat, lon, radius, open, splashDate, freezeDate, freezeMode }) => {
  try {
    const variables = { waveUuid, uuid }
    if (name !== undefined) variables.name = name
    if (description !== undefined) variables.description = description
    if (lat !== undefined) variables.lat = lat
    if (lon !== undefined) variables.lon = lon
    if (radius !== undefined) variables.radius = radius
    if (open !== undefined) variables.open = open
    if (splashDate !== undefined) variables.splashDate = splashDate
    if (freezeDate !== undefined) variables.freezeDate = freezeDate
    if (freezeMode !== undefined) variables.freezeMode = freezeMode

    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation updateWave($waveUuid: String!, $uuid: String!, $name: String, $description: String, $lat: Float, $lon: Float, $radius: Int, $open: Boolean, $splashDate: AWSDateTime, $freezeDate: AWSDateTime, $freezeMode: WaveFreezeMode) {
          updateWave(waveUuid: $waveUuid, uuid: $uuid, name: $name, description: $description, lat: $lat, lon: $lon, radius: $radius, open: $open, splashDate: $splashDate, freezeDate: $freezeDate, freezeMode: $freezeMode) {
            waveUuid
            name
            description
            createdAt
            updatedAt
            createdBy
            open
            splashDate
            freezeDate
            isFrozen
            freezeMode
            myRole
            joinUrl
            location
            radius
          }
        }
      `,
      variables
    })
    return response.data.updateWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const deleteWave = async ({ waveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation deleteWave($waveUuid: String!, $uuid: String!) {
          deleteWave(waveUuid: $waveUuid, uuid: $uuid)
        }
      `,
      variables: {
        waveUuid,
        uuid
      }
    })
    return response.data.deleteWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const autoGroupPhotos = async ({ uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation autoGroupPhotosIntoWaves($uuid: String!) {
          autoGroupPhotosIntoWaves(uuid: $uuid) {
            waveUuid
            name
            photosGrouped
            photosRemaining
            hasMore
          }
        }
      `,
      variables: {
        uuid
      }
    })
    return response.data.autoGroupPhotosIntoWaves
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const addPhotoToWave = async ({ waveUuid, photoId, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation addPhotoToWave($waveUuid: String!, $photoId: String!, $uuid: String!) {
          addPhotoToWave(waveUuid: $waveUuid, photoId: $photoId, uuid: $uuid)
        }
      `,
      variables: {
        waveUuid,
        photoId,
        uuid
      }
    })
    return response.data.addPhotoToWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const removePhotoFromWave = async ({ waveUuid, photoId, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation removePhotoFromWave($waveUuid: String!, $photoId: String!, $uuid: String!) {
          removePhotoFromWave(waveUuid: $waveUuid, photoId: $photoId, uuid: $uuid)
        }
      `,
      variables: {
        waveUuid,
        photoId,
        uuid
      }
    })
    return response.data.removePhotoFromWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const mergeWaves = async ({ targetWaveUuid, sourceWaveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation mergeWaves($targetWaveUuid: String!, $sourceWaveUuid: String!, $uuid: String!) {
          mergeWaves(targetWaveUuid: $targetWaveUuid, sourceWaveUuid: $sourceWaveUuid, uuid: $uuid) {
            waveUuid
            name
            description
            createdAt
            updatedAt
            createdBy
            photosCount
          }
        }
      `,
      variables: {
        targetWaveUuid,
        sourceWaveUuid,
        uuid
      }
    })
    return response.data.mergeWaves
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const getUngroupedPhotosCount = async ({ uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query getUngroupedPhotosCount($uuid: String!) {
          getUngroupedPhotosCount(uuid: $uuid)
        }
      `,
      variables: { uuid },
    })
    return response.data.getUngroupedPhotosCount
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const getWavesCount = async ({ uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query getWavesCount($uuid: String!) {
          getWavesCount(uuid: $uuid)
        }
      `,
      variables: { uuid },
    })
    return response.data.getWavesCount
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const getBookmarksCount = async ({ uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query getWatchedCount($uuid: String!) {
          getWatchedCount(uuid: $uuid)
        }
      `,
      variables: { uuid },
    })
    return response.data.getWatchedCount
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const requestUngroupedPhotos = async ({ uuid, pageNumber, batch }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForUngrouped($uuid: String!, $pageNumber: Int!, $batch: String!) {
          feedForUngrouped(uuid: $uuid, pageNumber: $pageNumber, batch: $batch) {
            photos {
              row_number
              id
              uuid
              imgUrl
              thumbUrl
              videoUrl
              video
              commentsCount
              watchersCount
              lastComment
              createdAt
              width
              height
            }
            batch
            noMoreData
          }
        }
      `,
      variables: { uuid, pageNumber, batch },
    })
    return {
      photos: response.data.feedForUngrouped.photos || [],
      batch: response.data.feedForUngrouped.batch,
      noMoreData: response.data.feedForUngrouped.noMoreData
    }
  } catch (err) {
    console.error({ err })
    throw err
  }
}

// =============================================================================
// Wave Join & Invite Operations
// =============================================================================

const WAVE_FIELDS = `
  waveUuid
  name
  description
  createdAt
  updatedAt
  createdBy
  photosCount
  open
  splashDate
  freezeDate
  isFrozen
  myRole
  joinUrl
  location
  radius
`

export const joinOpenWave = async ({ waveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation joinOpenWave($waveUuid: String!, $uuid: String!) {
          joinOpenWave(waveUuid: $waveUuid, uuid: $uuid) {
            ${WAVE_FIELDS}
          }
        }
      `,
      variables: { waveUuid, uuid }
    })
    return response.data.joinOpenWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const joinWaveByInvite = async ({ inviteToken, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation joinWaveByInvite($inviteToken: String!, $uuid: String!) {
          joinWaveByInvite(inviteToken: $inviteToken, uuid: $uuid) {
            ${WAVE_FIELDS}
          }
        }
      `,
      variables: { inviteToken, uuid }
    })
    return response.data.joinWaveByInvite
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const createWaveInvite = async ({ waveUuid, uuid, expiresAt, maxUses }) => {
  try {
    const variables = { waveUuid, uuid }
    if (expiresAt !== undefined) variables.expiresAt = expiresAt
    if (maxUses !== undefined) variables.maxUses = maxUses

    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation createWaveInvite($waveUuid: String!, $uuid: String!, $expiresAt: AWSDateTime, $maxUses: Int) {
          createWaveInvite(waveUuid: $waveUuid, uuid: $uuid, expiresAt: $expiresAt, maxUses: $maxUses) {
            inviteToken
            waveUuid
            deepLink
            expiresAt
            maxUses
            useCount
            active
            createdAt
          }
        }
      `,
      variables
    })
    return response.data.createWaveInvite
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const revokeWaveInvite = async ({ inviteToken, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation revokeWaveInvite($inviteToken: String!, $uuid: String!) {
          revokeWaveInvite(inviteToken: $inviteToken, uuid: $uuid)
        }
      `,
      variables: { inviteToken, uuid }
    })
    return response.data.revokeWaveInvite
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const listWaveInvites = async ({ waveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query listWaveInvites($waveUuid: String!, $uuid: String!) {
          listWaveInvites(waveUuid: $waveUuid, uuid: $uuid) {
            inviteToken
            waveUuid
            deepLink
            expiresAt
            maxUses
            useCount
            active
            createdAt
          }
        }
      `,
      variables: { waveUuid, uuid }
    })
    return response.data.listWaveInvites
  } catch (err) {
    console.error({ err })
    throw err
  }
}

// =============================================================================
// Member Management Operations
// =============================================================================

export const listWaveMembers = async ({ waveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query listWaveMembers($waveUuid: String!, $uuid: String!) {
          listWaveMembers(waveUuid: $waveUuid, uuid: $uuid) {
            uuid
            nickName
            role
            createdAt
          }
        }
      `,
      variables: { waveUuid, uuid }
    })
    return response.data.listWaveMembers
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const assignFacilitator = async ({ waveUuid, targetUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation assignFacilitator($waveUuid: String!, $targetUuid: String!, $uuid: String!) {
          assignFacilitator(waveUuid: $waveUuid, targetUuid: $targetUuid, uuid: $uuid)
        }
      `,
      variables: { waveUuid, targetUuid, uuid }
    })
    return response.data.assignFacilitator
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const removeFacilitator = async ({ waveUuid, targetUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation removeFacilitator($waveUuid: String!, $targetUuid: String!, $uuid: String!) {
          removeFacilitator(waveUuid: $waveUuid, targetUuid: $targetUuid, uuid: $uuid)
        }
      `,
      variables: { waveUuid, targetUuid, uuid }
    })
    return response.data.removeFacilitator
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const removeUserFromWave = async ({ waveUuid, targetUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation removeUserFromWave($waveUuid: String!, $targetUuid: String!, $uuid: String!) {
          removeUserFromWave(waveUuid: $waveUuid, targetUuid: $targetUuid, uuid: $uuid)
        }
      `,
      variables: { waveUuid, targetUuid, uuid }
    })
    return response.data.removeUserFromWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

// =============================================================================
// Moderation Operations
// =============================================================================

export const reportWavePhoto = async ({ waveUuid, photoId, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation reportWavePhoto($waveUuid: String!, $photoId: String!, $uuid: String!) {
          reportWavePhoto(waveUuid: $waveUuid, photoId: $photoId, uuid: $uuid) {
            id
            photoId
            uuid
            createdAt
            updatedAt
          }
        }
      `,
      variables: { waveUuid, photoId, uuid }
    })
    return response.data.reportWavePhoto
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const dismissWaveReport = async ({ reportId, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation dismissWaveReport($reportId: ID!, $uuid: String!) {
          dismissWaveReport(reportId: $reportId, uuid: $uuid)
        }
      `,
      variables: { reportId, uuid }
    })
    return response.data.dismissWaveReport
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const banUserFromWave = async ({ waveUuid, targetUuid, uuid, reason }) => {
  try {
    const variables = { waveUuid, targetUuid, uuid }
    if (reason !== undefined) variables.reason = reason

    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation banUserFromWave($waveUuid: String!, $targetUuid: String!, $uuid: String!, $reason: String) {
          banUserFromWave(waveUuid: $waveUuid, targetUuid: $targetUuid, uuid: $uuid, reason: $reason)
        }
      `,
      variables
    })
    return response.data.banUserFromWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const listWaveAbuseReports = async ({ waveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query listWaveAbuseReports($waveUuid: String!, $uuid: String!) {
          listWaveAbuseReports(waveUuid: $waveUuid, uuid: $uuid) {
            id
            photoId
            uuid
            createdAt
            updatedAt
          }
        }
      `,
      variables: { waveUuid, uuid }
    })
    return response.data.listWaveAbuseReports
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const listWaveBans = async ({ waveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query listWaveBans($waveUuid: String!, $uuid: String!) {
          listWaveBans(waveUuid: $waveUuid, uuid: $uuid) {
            uuid
            bannedBy
            reason
            createdAt
          }
        }
      `,
      variables: { waveUuid, uuid }
    })
    return response.data.listWaveBans
  } catch (err) {
    console.error({ err })
    throw err
  }
}
