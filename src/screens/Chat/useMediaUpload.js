import * as Crypto from 'expo-crypto'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'
import * as MediaLibrary from 'expo-media-library'
import moment from 'moment'
import { Alert } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'

import * as CONST from '../../consts'
import * as friendsHelper from '../FriendsList/friends_helper'
import * as reducer from './reducer'

/**
 * Custom hook to handle media upload (camera and photo picking)
 * @param {Object} params
 * @param {string} params.chatUuid - Chat UUID
 * @param {string} params.uuid - Current user UUID
 * @param {Array} params.friendsList - List of friends
 * @param {Function} params.setMessages - Function to update messages
 * @param {number} params.toastTopOffset - Toast top offset for positioning
 * @returns {Object} Object containing pickAsset and takePhoto functions
 */
export const useMediaUpload = ({ chatUuid, uuid, friendsList, setMessages, toastTopOffset }) => {
  const uploadAsset = async ({ uri }) => {
    const fileContents = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    })
    const chatPhotoHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      fileContents
    )

    const messageUuid = Crypto.randomUUID()

    reducer.queueFileForUpload({ assetUrl: uri, chatPhotoHash, messageUuid })

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [
        {
          _id: messageUuid,
          text: '',
          pending: true,
          createdAt: moment(),
          user: {
            _id: uuid,
            name: friendsHelper.getLocalContactName({
              uuid,
              friendUuid: uuid,
              friendsList
            })
          },
          image: `${CONST.PRIVATE_IMG_HOST}${chatPhotoHash}-thumb`,
          chatPhotoHash
        }
      ])
    )

    await reducer.sendMessage({
      chatUuid,
      uuid,
      messageUuid,
      text: '',
      pending: true,
      chatPhotoHash
    })

    reducer.uploadPendingPhotos({ chatUuid, uuid, topOffset: toastTopOffset })
  }

  const pickAsset = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert(
        'Do you want to use photos from your albom?',
        "Why don't you enable this permission in settings?",
        [
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings()
            }
          }
        ]
      )
      return
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync()

    const { uri } = pickerResult
    uploadAsset({ uri })
  }

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert(
        'Do you want to take photo with wisaw?',
        "Why don't you enable this permission in settings?",
        [
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings()
            }
          }
        ]
      )
      return
    }

    const cameraReturn = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1.0,
      exif: true
    })

    if (cameraReturn.canceled === true) {
      return
    }

    await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)

    const { uri } = cameraReturn.assets[0]
    uploadAsset({ uri })
  }

  return { pickAsset, takePhoto }
}
