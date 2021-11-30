import { gql } from "@apollo/client"
import * as Contacts from 'expo-contacts'

import { Storage } from 'expo-storage'
import * as CONST from '../../consts.js'

export const addFriendshipLocally = async ({ friendshipUuid, contactId }) => {
  const key = `${CONST.FRIENDSHIP_PREFIX}:${friendshipUuid}`
  await Storage.removeItem({ key }) // always cleanup first
  await Storage.setItem({ key, value: JSON.stringify(contactId) })
}

export const cleanupAbandonedFriendships = async ({ uuid }) => {
  const remoteFriendships = _getRemoteListOfFriendships({ uuid })
}

export const getEnhancedListOfFriendships = async ({ uuid }) => {
  const remoteFriendships = _getRemoteListOfFriendships({ uuid })

  const enhancedFriendships = remoteFriendships.map(async friendship => {
    const key = `${CONST.FRIENDSHIP_PREFIX}:${friendship.friendshipUuid}`
    const localFriendship = JSON.parse(await Storage.getItem({ key }))
    const contact = await Contacts.getContactByIdAsync(localFriendship.contactId)
    return { ...friendship, contact }
  })
  return enhancedFriendships
}

const _getRemoteListOfFriendships = async ({ uuid }) => {
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