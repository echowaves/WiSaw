import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import * as Contacts from 'expo-contacts'

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
import * as Linking from 'expo-linking'

import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

const ChatAdd = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const headerHeight = useSelector(state => state.photosList.headerHeight)

  const uuid = useSelector(state => state.secret.uuid)

  useEffect(() => {
    _requestContactPermissions()
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'add chat',
      headerTintColor: CONST.MAIN_COLOR,
      // headerRight: renderHeaderRight,
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

  const _requestContactPermissions = async () => {
    const { status } = await Contacts.requestPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        "Do you want to chat with people you know?",
        "Why don't you enable contancst permission?",
        [
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings()
            },
          },
        ],
      )
    }
  }

  // const renderHeaderRight = () => (
  //   <Ionicons
  //     name="add-circle"
  //     size={30}
  //     style={
  //       {
  //         marginRight: 10,
  //         color: CONST.MAIN_COLOR,
  //         width: 60,
  //       }
  //     }
  //     onPress={
  //       () => _handleAddChat()
  //     }
  //   />
  // )

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
    console.log('handling')
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
export default ChatAdd
