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
  const remoteFriendships = await _getRemoteListOfFriendships({ uuid })
  await Promise.all(remoteFriendships.map(async friendship => {
    const { friendshipUuid } = friendship
    const contact = await _getLocalContact({ friendshipUuid })
    if (!contact) {
      deleteFriendship({ friendshipUuid })
    }
  }))
}

export const deleteFriendship = async ({ friendshipUuid }) => {
  // cleanup local contact
  const key = `${CONST.FRIENDSHIP_PREFIX}:${friendshipUuid}`
  await Storage.removeItem({ key })

  const { deleteFriendship } = (await CONST.gqlClient
    .mutate({
      mutation: gql`
          mutation 
          deleteFriendship($friendshipUuid: String!) {
            deleteFriendship(friendshipUuid: $friendshipUuid)                 
          }`,
      variables: {
        friendshipUuid,
      },
    })).data

  // console.log({ deleteFriendship })

  if (deleteFriendship !== "OK") {
    throw Error("Deleting Friendship failed")
  }
}

export const confirmFriendship = async ({ friendshipUuid, uuid }) => {
  // console.log({ friendshipUuid, uuid })
  const { friendship, chat, chatUser } = (await CONST.gqlClient
    .mutate({
      mutation: gql`
          mutation 
          acceptFriendshipRequest($friendshipUuid: String!, $uuid: String!) {
            acceptFriendshipRequest(friendshipUuid: $friendshipUuid, uuid: $uuid) {     
              chat {
                chatUuid
                createdAt
              }
              chatUser {
                chatUuid
                createdAt
                invitedByUuid
                lastReadAt
                uuid
              }                
              friendship {
                chatUuid
                createdAt
                friendshipUuid
                uuid1
                uuid2
              }
            }
          }
          `,
      variables: {
        friendshipUuid,
        uuid,
      },
    })).data.acceptFriendshipRequest

  // console.log({ friendship, chat, chatUser })
}

export const getEnhancedListOfFriendships = async ({ uuid }) => {
  const remoteFriendships = await _getRemoteListOfFriendships({ uuid })
  // console.log({ remoteFriendships })

  const enhancedFriendships = await Promise.all(// not sure if this is going to scale
    remoteFriendships.map(async friendship => {
      const { friendshipUuid } = friendship
      const contact = await _getLocalContact({ friendshipUuid })
      const localContact = { ...friendship, key: friendship.friendshipUuid, contact }
      // console.log({ localContact })
      return localContact
    })
  )
  // console.log({ enhancedFriendships })

  return enhancedFriendships
}

const _getLocalContact = async ({ friendshipUuid }) => {
  const key = `${CONST.FRIENDSHIP_PREFIX}:${friendshipUuid}`
  const localFriendshipId = JSON.parse(await Storage.getItem({ key }))
  if (!localFriendshipId) {
    return null
  }
  // console.log({ localFriendshipId })
  const contact = await Contacts.getContactByIdAsync(localFriendshipId)
  return contact
}

const _getRemoteListOfFriendships = async ({ uuid }) => {
  try {
    const friendsList = (await CONST.gqlClient
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