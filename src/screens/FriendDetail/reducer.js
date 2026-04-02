/* global console */
import { gql } from '@apollo/client'
import * as CONST from '../../consts'

export const fetchFriendPhotos = async ({ uuid, friendUuid, pageNumber, batch, sortBy, sortDirection }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForFriend($uuid: String!, $friendUuid: String!, $pageNumber: Int!, $batch: String!, $sortBy: String, $sortDirection: String) {
          feedForFriend(uuid: $uuid, friendUuid: $friendUuid, pageNumber: $pageNumber, batch: $batch, sortBy: $sortBy, sortDirection: $sortDirection) {
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
        friendUuid,
        pageNumber,
        batch,
        sortBy,
        sortDirection
      }
    })
    return {
      photos: response.data.feedForFriend.photos || [],
      batch: response.data.feedForFriend.batch,
      noMoreData: response.data.feedForFriend.noMoreData
    }
  } catch (err) {
    console.error('Failed to fetch friend photos:', err)
    throw err
  }
}
