import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useState } from 'react'

import { SafeAreaView, StyleSheet } from 'react-native'

import Toast from 'react-native-toast-message'

import PropTypes from 'prop-types'

import NamePicker from '../../components/NamePicker'

import * as STATE from '../../state'

import * as reducer from './reducer'

import { useSafeAreaViewStyle } from '../../hooks/useStatusBarHeight'
import { SHARED_STYLES } from '../../theme/sharedStyles'
import * as friendsHelper from './friends_helper'

const ConfirmFriendship = ({ route }) => {
  const { friendshipUuid } = route.params

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const navigation = useNavigation()

  const [showNamePicker, setShowNamePicker] = useState(true)

  // Get safe area view style for proper status bar handling on Android
  const safeAreaViewStyle = useSafeAreaViewStyle()

  // Header styling is now controlled by the route configuration in app/(drawer)/(tabs)/_layout.tsx
  // No need for custom renderHeaderLeft or renderHeaderRight functions

  const styles = StyleSheet.create({
    container: {
      ...SHARED_STYLES.containers.main,
    },
    scrollView: {
      alignItems: 'center',
      marginHorizontal: 0,
      paddingBottom: 300,
    },
  })

  const setContactName = async ({ contactName }) => {
    try {
      // eslint-disable-next-line no-console
      console.log('ConfirmFriendship: setContactName called with:', {
        contactName,
        friendshipUuid,
      })

      await friendsHelper.confirmFriendship({ friendshipUuid, uuid })
      // eslint-disable-next-line no-console
      console.log('ConfirmFriendship: Friendship confirmed, now saving locally')

      await friendsHelper.addFriendshipLocally({ friendshipUuid, contactName })
      // eslint-disable-next-line no-console
      console.log(
        'ConfirmFriendship: Contact name saved locally, reloading friends list',
      )

      setFriendsList(
        await friendsHelper.getEnhancedListOfFriendships({
          uuid,
        }),
      )

      reducer.reloadUnreadCountsList({ uuid })

      Toast.show({
        text1: 'Friendship confirmed!',
        text2: `You are now friends with ${contactName}`,
        type: 'success',
        position: 'top',
        topOffset: 60,
      })

      router.dismissAll()
      router.push('/friends')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error confirming friendship:', err)
      Toast.show({
        text1: 'Unable to confirm Friendship',
        text2: err.message || err.toString(),
        type: 'error',
        position: 'top',
        topOffset: 60,
      })
    }
  }

  return (
    <SafeAreaView style={[styles.container, safeAreaViewStyle]}>
      <NamePicker
        show={showNamePicker}
        setShow={setShowNamePicker}
        setContactName={setContactName}
        friendshipUuid={friendshipUuid}
        headerText="You have received a friendship request. Did this message come from friend your know and trust? What is the name of the friend you've got the invitation from?"
      />
    </SafeAreaView>
  )
}

ConfirmFriendship.propTypes = {
  route: PropTypes.object.isRequired,
}

export default ConfirmFriendship
