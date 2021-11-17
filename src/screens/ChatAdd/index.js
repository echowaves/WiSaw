import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import * as Contacts from 'expo-contacts'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
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
import * as Linking from 'expo-linking'

import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useDimensions } from '@react-native-community/hooks'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

const ChatAdd = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const { width, height } = useDimensions().window

  const headerHeight = useSelector(state => state.photosList.headerHeight)

  const uuid = useSelector(state => state.secret.uuid)

  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState([])

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

  const _submitSearch = async searchString => {
    if (!searchString || searchString.trim().length === 0) return []
    const { data } = await Contacts.getContactsAsync({
      // fields: [Contacts.Fields.Emails],
      name: searchString,
    })
    console.log({ data })
    // if (!data) return []
    return data
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
        <View style={{
          flexDirection: 'row',
          backgroundColor: CONST.NAV_COLOR,
        }}>
          <SearchBar
            placeholder="Find Existing Contact..."
            placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
            onChangeText={async currentTerm => {
              setSearchTerm(currentTerm)
              setContacts(await _submitSearch(currentTerm))
            }}
            value={searchTerm}
            onSubmitEditing={
              async () => setContacts(await _submitSearch(searchTerm))
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
              async () => setContacts(await _submitSearch(searchTerm))
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
        {
          contacts.map((l, i) => (
            <ListItem key={i} bottomDivider>
              {/* <Avatar source={{ uri: l.avatar_url }} /> */}
              <ListItem.Content>
                <ListItem.Title>{l.name}</ListItem.Title>
                <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))
        }
      </ScrollView>
    </SafeAreaView>
  )
}
export default ChatAdd
