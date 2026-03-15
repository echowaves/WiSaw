/* global console */
import { gql } from '@apollo/client'
import * as CONST from '../../consts'

export {
  listWaves,
  createWave,
  updateWave,
  deleteWave,
  autoGroupPhotos,
  addPhotoToWave,
  removePhotoFromWave
} from '../Waves/reducer'

export const fetchWaveThumbnails = async ({ waveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForWatcher($uuid: String!, $pageNumber: Int!, $batch: String!, $waveUuid: String) {
          feedForWatcher(uuid: $uuid, pageNumber: $pageNumber, batch: $batch, waveUuid: $waveUuid) {
            photos {
              id
              thumbUrl
            }
            batch
            noMoreData
          }
        }
      `,
      variables: {
        uuid,
        pageNumber: 0,
        batch: String(Math.random()),
        waveUuid
      },
      fetchPolicy: 'network-only'
    })
    return (response.data.feedForWatcher.photos || []).slice(0, 4)
  } catch (err) {
    console.error('Failed to fetch wave thumbnails:', err)
    return []
  }
}
