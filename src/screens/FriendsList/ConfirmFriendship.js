import { useNavigation } from '@react-navigation/native'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'

import { SafeAreaView, StyleSheet } from 'react-native'

import Toast from 'react-native-toast-message'

import { FontAwesome } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import NamePicker from '../../components/NamePicker'

import * as CONST from '../../consts'
import * as STATE from '../../state'

import * as reducer from './reducer'

import * as friendsHelper from './friends_helper'

const ConfirmFriendship = ({ route }) => {
  const { friendshipUuid } = route.params

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const navigation = useNavigation()

  const [showNamePicker, setShowNamePicker] = useState(true)

  const renderHeaderRight = () => {}

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONST.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => navigation.goBack()}
    />
  )

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

  const setContactName = async (contactName) => {
    try {
      await friendsHelper.confirmFriendship({ friendshipUuid, uuid })
      await friendsHelper.addFriendshipLocally({ friendshipUuid, contactName })
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

      await navigation.popToTop()
      await navigation.navigate('FriendsList')
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
    <SafeAreaView style={styles.container}>
      <NamePicker
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
