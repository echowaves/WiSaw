import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import {
  SafeAreaView,
  StyleSheet,
} from 'react-native'

import Toast from 'react-native-toast-message'

import {
  FontAwesome,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import LocalContacts from '../../components/NamePicker'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

import * as friendsHelper from './friends_helper'

const ConfirmFriendship = ({ route }) => {
  const { friendshipUuid } = route.params

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const topOffset = useSelector(state => state.photosList.topOffset)

  const [showNamePicker, setShowNamePicker] = useState(true)

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

  const setContactName = async contactName => {
    try {
      await friendsHelper.confirmFriendship({ friendshipUuid, uuid })
      await friendsHelper.addFriendshipLocally({ friendshipUuid, contactName })
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
        show={showNamePicker}
        setShow={setShowNamePicker}
        setContactName={setContactName}
        headerText="You have received a friendship request. Did this message come from friend your know and trust? What is the name of the friend you've got the invitation from?"
      />
    </SafeAreaView>
  )
}

ConfirmFriendship.propTypes = {
  route: PropTypes.object.isRequired,
}

export default ConfirmFriendship
