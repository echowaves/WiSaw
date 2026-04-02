/* global console */
import { gql } from '@apollo/client'
import * as CONST from '../../consts'

export { removePhotoFromWave, updateWave, deleteWave, mergeWaves } from '../Waves/reducer'

export const fetchWavePhotos = async ({ waveUuid, pageNumber, batch, sortBy, sortDirection }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForWave($waveUuid: String!, $pageNumber: Int!, $batch: String!, $sortBy: String, $sortDirection: String) {
          feedForWave(waveUuid: $waveUuid, pageNumber: $pageNumber, batch: $batch, sortBy: $sortBy, sortDirection: $sortDirection) {
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
      variables: {
        pageNumber,
        batch,
        waveUuid,
        sortBy,
        sortDirection
      }
    })
    return {
      photos: response.data.feedForWave.photos || [],
      batch: response.data.feedForWave.batch,
      noMoreData: response.data.feedForWave.noMoreData
    }
  } catch (err) {
    console.error('Failed to fetch wave photos:', err)
    throw err
  }
}
