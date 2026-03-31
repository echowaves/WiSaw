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

export const createWave = async ({ name, description, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation createWave($name: String!, $description: String!, $uuid: String!) {
          createWave(name: $name, description: $description, uuid: $uuid) {
            waveUuid
            name
            description
            createdAt
            updatedAt
            createdBy
          }
        }
      `,
      variables: {
        name,
        description,
        uuid
      }
    })
    return response.data.createWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const updateWave = async ({ waveUuid, uuid, name, description }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation updateWave($waveUuid: String!, $uuid: String!, $name: String!, $description: String!) {
          updateWave(waveUuid: $waveUuid, uuid: $uuid, name: $name, description: $description) {
            waveUuid
            name
            description
            createdAt
            updatedAt
            createdBy
          }
        }
      `,
      variables: {
        waveUuid,
        uuid,
        name,
        description
      }
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

export const removePhotoFromWave = async ({ waveUuid, photoId }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation removePhotoFromWave($waveUuid: String!, $photoId: String!) {
          removePhotoFromWave(waveUuid: $waveUuid, photoId: $photoId)
        }
      `,
      variables: {
        waveUuid,
        photoId
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
