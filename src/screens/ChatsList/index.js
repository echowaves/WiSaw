import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import {
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
} from 'react-native-elements'
// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

const ChatsList = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const headerHeight = useSelector(state => state.photosList.headerHeight)

  const uuid = useSelector(state => state.secret.uuid)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'chats',
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

  const renderHeaderRight = () => (
    <Ionicons
      name="add-circle"
      size={30}
      style={
        {
          marginRight: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }
      }
      onPress={
        () => _handleAddChat()
      }
    />
    // <Ionicons
    //   onPress={
    //     () => handleSubmit()
    //   }
    //   name="send"
    //   size={30}
    //   style={
    //     {
    //       marginRight: 10,
    //       color: canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR,
    //     }
    //   }
    // />
  )

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

  const _handleAddChat = () => {

  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
        <Card containerStyle={{ padding: 0 }}>
          <ListItem>
            <Text>
              chats
            </Text>
          </ListItem>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}
export default ChatsList
