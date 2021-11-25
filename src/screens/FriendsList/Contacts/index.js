import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import { useDimensions } from '@react-native-community/hooks'

import {
  View,
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
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
  FontAwesome, Ionicons, MaterialCommunityIcons, SimpleLineIcons, AntDesign,
} from '@expo/vector-icons'

import { Col, Row, Grid } from "react-native-easy-grid"

import PropTypes from 'prop-types'

import * as CONST from '../../../consts.js'

import * as reducer from '../reducer'

const Contacts = ({ route }) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('')

  const { width, height } = useDimensions().window

  const { friendshipUuid } = route.params

  // const headerHeight = useSelector(state => state.photosList.headerHeight)

  const uuid = useSelector(state => state.secret.uuid)
  const friendsList = useSelector(state => state.friendsList.friendsList)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Local Contacts',
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

  const _submitSearch = () => {
    console.log({ searchTerm })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
        <Text>
          {friendshipUuid}
        </Text>
        <View style={{
          flexDirection: 'row',
          backgroundColor: CONST.NAV_COLOR,
        }}>
          <SearchBar
            placeholder="Type Contact Name..."
            placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
            onChangeText={currentTerm => {
              setSearchTerm(currentTerm)
            }}
            value={searchTerm}
            onSubmitEditing={
              () => _submitSearch()
            }
            autoFocus
            containerStyle={{
              width: width - 60,
            }}
            style={
              {
                color: CONST.MAIN_COLOR,
                backgroundColor: "white",
                paddingLeft: 10,
                paddingRight: 10,
              }
            }
            rightIconContainerStyle={{
              margin: 10,
            }}
            lightTheme
          />
          <Ionicons
            onPress={
              () => _submitSearch()
            }
            name="send"
            size={30}
            style={
              {
                margin: 10,
                color: CONST.MAIN_COLOR,
                alignSelf: 'center',
              }
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

Contacts.propTypes = {
  route: PropTypes.object.isRequired,
}

export default Contacts
