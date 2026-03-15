/* global console */
import { gql } from '@apollo/client'
import * as CONST from '../../consts'

export { removePhotoFromWave, updateWave, deleteWave } from '../Waves/reducer'

export const fetchWavePhotos = async ({ waveUuid, uuid, pageNumber, batch }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForWatcher($uuid: String!, $pageNumber: Int!, $batch: String!, $waveUuid: String) {
          feedForWatcher(uuid: $uuid, pageNumber: $pageNumber, batch: $batch, waveUuid: $waveUuid) {
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
        uuid,
        pageNumber,
        batch,
        waveUuid
      },
      fetchPolicy: 'network-only'
    })
    return {
      photos: response.data.feedForWatcher.photos || [],
      batch: response.data.feedForWatcher.batch,
      noMoreData: response.data.feedForWatcher.noMoreData
    }
  } catch (err) {
    console.error('Failed to fetch wave photos:', err)
    throw err
  }
}
