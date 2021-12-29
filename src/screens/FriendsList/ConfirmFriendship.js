import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import * as Linking from 'expo-linking'

import * as Contacts from 'expo-contacts'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native'

import Toast from 'react-native-toast-message'

import {
  FontAwesome,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import LocalContacts from '../../components/LocalContacts'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

import * as friendsHelper from './friends_helper'

const ConfirmFriendship = ({ route }) => {
  const { friendshipUuid } = route.params

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const topOffset = useSelector(state => state.photosList.topOffset)

  const [permissionGranted, setPermissionGranted] = useState(false)
  const [showLocalContacts, setShowLocalContacts] = useState(true)

  const uuid = useSelector(state => state.secret.uuid)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Confirm friendship',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
    _checkPermission()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      alignItems: 'center',
      marginHorizontal: 0,
      paddingBottom: 300,
    },
  })

  const renderHeaderRight = () => {}

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={
        {
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }
      }
      onPress={
        () => navigation.goBack()
      }
    />
  )

  const _checkPermission = async () => {
    if (!permissionGranted) {
      const { status } = await Contacts.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          "In order to establish p4p identity, WiSaw needs to access contacts in your phone book.",
          "You need to enable Contacts in Settings and Try Again",
          [
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings()
              },
            },
          ],
        )
        return
      }
      setPermissionGranted(status === 'granted')
    }
  }

  const setContactId = async contactId => {
    try {
      await friendsHelper.confirmFriendship({ friendshipUuid, uuid })
      await friendsHelper.addFriendshipLocally({ friendshipUuid, contactId })
      dispatch(reducer.reloadFriendsList({ uuid }))
      dispatch(reducer.reloadUnreadCountsList({ uuid }))// the list of enhanced friends list has to be loaded earlier on

      await navigation.popToTop()
      await navigation.navigate('FriendsList')
    } catch (err) {
    // console.log({ err })
      Toast.show({
        text1: 'Unable to confirm Friendship',
        text2: err.toString(),
        type: "error",
        topOffset,
      })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LocalContacts
        show={showLocalContacts}
        setShow={setShowLocalContacts}
        setContactId={setContactId}
        headerText="You have received a friendship request. Did this message come from friend your know and trust? To confirm, pick your friend from the address book."
      />
    </SafeAreaView>
  )
}

ConfirmFriendship.propTypes = {
  route: PropTypes.object.isRequired,
}

export default ConfirmFriendship
