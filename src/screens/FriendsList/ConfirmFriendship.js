import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useState } from 'react'

import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Toast from 'react-native-toast-message'

import PropTypes from 'prop-types'

import EmptyStateCard from '../../components/EmptyStateCard'
import NamePicker from '../../components/NamePicker'

import * as STATE from '../../state'

import * as reducer from './reducer'

import { SHARED_STYLES } from '../../theme/sharedStyles'
import * as friendsHelper from './friends_helper'

const ConfirmFriendship = ({ route }) => {
  const { friendshipUuid } = route.params

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const navigation = useNavigation()

  const [showNamePicker, setShowNamePicker] = useState(true)

  // Header styling is now controlled by the route configuration in app/(drawer)/(tabs)/_layout.tsx
  // No need for custom renderHeaderLeft or renderHeaderRight functions

  const styles = StyleSheet.create({
    container: {
      ...SHARED_STYLES.containers.main
    },
    scrollView: {
      alignItems: 'center',
      marginHorizontal: 0,
      paddingBottom: 300
    }
  })

  const setContactName = async ({ contactName }) => {
    try {
      // eslint-disable-next-line no-console
      console.log('ConfirmFriendship: setContactName called with:', {
        contactName,
        friendshipUuid
      })

      await friendsHelper.confirmFriendship({ friendshipUuid, uuid })
      // eslint-disable-next-line no-console
      console.log('ConfirmFriendship: Friendship confirmed, now saving locally')

      await friendsHelper.addFriendshipLocally({ friendshipUuid, contactName })
      // eslint-disable-next-line no-console
      console.log('ConfirmFriendship: Contact name saved locally, reloading friends list')

      setFriendsList(
        await friendsHelper.getEnhancedListOfFriendships({
          uuid
        })
      )

      reducer.reloadUnreadCountsList({ uuid })

      Toast.show({
        text1: 'Friendship confirmed!',
        text2: `You are now friends with ${contactName}`,
        type: 'success',
        position: 'top',
        topOffset: 60
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
        topOffset: 60
      })
    }
  }

  const [netAvailable] = useAtom(STATE.netAvailable)

  if (!netAvailable) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { justifyContent: 'center', paddingHorizontal: 20 }]}>
        <EmptyStateCard
          icon='wifi-off'
          iconType='MaterialIcons'
          title='No Internet Connection'
          subtitle='Confirming a friendship requires an internet connection. Please check your connection and try again.'
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
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
  route: PropTypes.object.isRequired
}

export default ConfirmFriendship
