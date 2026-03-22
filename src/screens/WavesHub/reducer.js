/* global console */
import { gql } from '@apollo/client'
import * as CONST from '../../consts'
import * as Crypto from 'expo-crypto'

export {
  listWaves,
  createWave,
  updateWave,
  deleteWave,
  autoGroupPhotos,
  addPhotoToWave,
  removePhotoFromWave,
  getUngroupedPhotosCount,
  mergeWaves
} from '../Waves/reducer'

export const fetchWaveThumbnails = async ({ waveUuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForWave($waveUuid: String!, $pageNumber: Int!, $batch: String!) {
          feedForWave(waveUuid: $waveUuid, pageNumber: $pageNumber, batch: $batch) {
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
        pageNumber: 0,
        batch: Crypto.randomUUID(),
        waveUuid
      },
      fetchPolicy: 'network-only'
    })
    return (response.data.feedForWave.photos || []).slice(0, 4)
  } catch (err) {
    console.error('Failed to fetch wave thumbnails:', err)
    return []
  }
}
