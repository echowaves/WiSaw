import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import { useDimensions } from '@react-native-community/hooks'
import * as Linking from 'expo-linking'

import * as Contacts from 'expo-contacts'

import validator from 'validator'
import { phone } from 'phone'

import {
  View,
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
  SearchBar,
} from 'react-native-elements'
// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome, Ionicons, MaterialCommunityIcons, SimpleLineIcons, AntDesign, MaterialIcons,
} from '@expo/vector-icons'

import { Col, Row, Grid } from "react-native-easy-grid"

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

  const { width, height } = useDimensions().window
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState([])

  const [showLocalContacts, setShowLocalContacts] = useState(true)

  // const [contact, setContact] = useState(null)

  // const topOffset = useSelector(state => state.photosList.topOffset)

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
      await dispatch(reducer.reloadListOfFriends({ uuid }))
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
        headerText="To store this connection request locally, pick your friend from the address book."
      />
    </SafeAreaView>
  )
}

ConfirmFriendship.propTypes = {
  route: PropTypes.object.isRequired,
}

export default ConfirmFriendship
