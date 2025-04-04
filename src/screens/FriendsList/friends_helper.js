import { gql } from '@apollo/client'

import { Storage } from 'expo-storage'
import * as CONST from '../../consts'

export const addFriendshipLocally = async ({ friendshipUuid, contactName }) => {
  const key = `${CONST.FRIENDSHIP_PREFIX}:${friendshipUuid}`
  await Storage.removeItem({ key }) // always cleanup first
  await Storage.setItem({ key, contactName })
}

export const deleteFriendship = async ({ friendshipUuid }) => {
  // cleanup local contact
  const key = `${CONST.FRIENDSHIP_PREFIX}:${friendshipUuid}`
  await Storage.removeItem({ key })

  const { deleteFriendship } = (
    await CONST.gqlClient.mutate({
      mutation: gql`
        mutation deleteFriendship($friendshipUuid: String!) {
          deleteFriendship(friendshipUuid: $friendshipUuid)
        }
      `,
      variables: {
        friendshipUuid,
      },
    })
  ).data

  // console.log({ deleteFriendship })

  if (deleteFriendship !== 'OK') {
    throw Error('Deleting Friendship failed')
  }
}

export const getLocalContactName = ({ uuid, friendUuid, friendsList }) => {
  if (uuid === friendUuid) {
    return 'me'
  }
  const enhancedFriend = friendsList.find(
    (friendship) =>
      friendship.uuid1 === friendUuid || friendship.uuid2 === friendUuid,
  )
  if (!enhancedFriend) {
    return 'anonym'
  }
  return enhancedFriend?.contact
}

export const confirmFriendship = async ({ friendshipUuid, uuid }) => {
  // console.log({ friendshipUuid, uuid })
  const { friendship, chat, chatUser } = (
    await CONST.gqlClient.mutate({
      mutation: gql`
        mutation acceptFriendshipRequest(
          $friendshipUuid: String!
          $uuid: String!
        ) {
          acceptFriendshipRequest(
            friendshipUuid: $friendshipUuid
            uuid: $uuid
          ) {
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
    })
  ).data.acceptFriendshipRequest
  // console.log({ friendship, chat, chatUser })
  return { friendship, chat, chatUser }
}

export const getEnhancedListOfFriendships = async ({ uuid }) => {
  const [remoteFriendships, unreadCountsList] = await Promise.all([
    getRemoteListOfFriendships({ uuid }),
    getUnreadCountsList({ uuid }),
  ])

  // console.log({ remoteFriendships })

  const enhancedFriendships = await Promise.all(
    // not sure if this is going to scale
    remoteFriendships.map(async (friendship) => {
      const { friendshipUuid } = friendship
      const contact = await getLocalContact({ friendshipUuid })
      const unread = unreadCountsList.find(
        (unreadChat) => unreadChat.chatUuid === friendship.chatUuid,
      )

      const localContact = {
        key: friendship.friendshipUuid,
        contact,
        ...friendship,
        unreadCount: unread?.unread || 0,
        updatedAt: unread?.updatedAt || Date.now(),
      }
      // console.log({ localContact })
      return localContact
    }),
  )
  // console.log({ enhancedFriendships }, "--------------------------------------")
  return enhancedFriendships.sort(
    (a, b) => new Date(a.updatedAt).getTime() < new Date(b.updatedAt).getTime(),
  )
}

export const resetUnreadCount = async ({ chatUuid, uuid }) => {
  const lastReadAt = await CONST.gqlClient.mutate({
    mutation: gql`
      mutation resetUnreadCount($chatUuid: String!, $uuid: String!) {
        resetUnreadCount(chatUuid: $chatUuid, uuid: $uuid)
      }
    `,
    variables: {
      chatUuid,
      uuid,
    },
  })
  // console.log({ lastReadAt })
  return lastReadAt
}

const getLocalContact = async ({ friendshipUuid }) => {
  const key = `${CONST.FRIENDSHIP_PREFIX}:${friendshipUuid}`
  const localFriendshipName = JSON.parse(await Storage.getItem({ key }))
  if (!localFriendshipName) {
    return null
  }
  // console.log({ friendshipUuid, localFriendshipName })
  return localFriendshipName
}

export const getUnreadCountsList = async ({ uuid }) => {
  try {
    const unreadCountsList = (
      await CONST.gqlClient.query({
        query: gql`
          query getUnreadCountsList($uuid: String!) {
            getUnreadCountsList(uuid: $uuid) {
              chatUuid
              unread
              updatedAt
            }
          }
        `,
        variables: {
          uuid,
        },
        fetchPolicy: 'network-only',
      })
    ).data.getUnreadCountsList
    return unreadCountsList
  } catch (err61) {
    // eslint-disable-next-line no-console
    console.log({ err61 }) // eslint-disable-line
  }
  return []
}

const getRemoteListOfFriendships = async ({ uuid }) => {
  try {
    const friendsList = (
      await CONST.gqlClient.query({
        query: gql`
          query getFriendshipsList($uuid: String!) {
            getFriendshipsList(uuid: $uuid) {
              chatUuid
              createdAt
              friendshipUuid
              uuid1
              uuid2
            }
          }
        `,
        variables: {
          uuid,
        },
        fetchPolicy: 'network-only',
      })
    ).data.getFriendshipsList
    return friendsList
  } catch (err555) {
    // eslint-disable-next-line no-console
    console.log({ err555 }) // eslint-disable-line
  }
  return []
}
