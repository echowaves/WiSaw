import { gql } from "@apollo/client"

import { Storage } from 'expo-storage'
import * as CONST from '../../consts.js'

export const addFriendshipLocally = async ({ friendshipUuid, contactId }) => {
  const localFriends = JSON.parse(
    await Storage.getItem({ key: CONST.CONTACTS_KEY })
  )
  const updatedLocalFriends = [...localFriends, { friendshipUuid, contactId }]
  await Storage.setItem({
    key: CONST.CONTACTS_KEY,
    value: JSON.stringify(updatedLocalFriends),
  })
  return updatedLocalFriends
}

export const getFriendship = ({ friendshipUuid }) => {

}

export const getEnhancedListOfFriendships = async ({ uuid }) => {
  let friendsList = []
  try {
    friendsList = (await CONST.gqlClient
      .query({
        query: gql`
      query getfriendshipsList($uuid: String!) {
        getfriendshipsList(uuid: $uuid){
          chatUuid
          createdAt
          friendshipUuid
          uuid1
          uuid2
        }
      }`,
        variables: {
          uuid,
        },
        fetchPolicy: "network-only",
      })).data.getfriendshipsList
    return friendsList
  } catch (err5) {
    // eslint-disable-next-line no-console
    console.log({ err5 })// eslint-disable-line      
  }
}