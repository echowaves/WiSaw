import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import { useDimensions } from '@react-native-community/hooks'
import * as Linking from 'expo-linking'
import * as Contacts from 'expo-contacts'

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

const LocalContacts = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState([])
  const [permissionGranted, setPermissionGranted] = useState(false)

  const { width, height } = useDimensions().window

  // const topOffset = useSelector(state => state.photosList.topOffset)

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
      }
      setPermissionGranted(status === 'granted')
    }
  }

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

  const _submitSearch = async searchString => {
    if (searchString.length === 0) {
      return
    }
    console.log('--------------------------------------------------')
    // console.log({ searchString })
    const { data } = await Contacts.getContactsAsync({
      name: searchString,
      fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
    })
    console.log({ data })
    console.log(data.length)
    setContacts(data.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase()))
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
        <Text>
          Find your friend in contacts.
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
              _submitSearch(currentTerm)
            }}
            value={searchTerm}
            // onSubmitEditing={
            //   () => _submitSearch()
            // }
            autoFocus
            containerStyle={{
              width,
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
        </View>
        {
          contacts.map((contact, index) => (
            <ListItem
              bottomDivider
              key={contact.id}
              style={{
                paddingBottom: 5,
                paddingLeft: 10,
                paddingRight: 10,
                width: '100%',
              }}
              onPress={() => {
                console.log(contact.id)
                navigation.navigate('ContactDetails', { pickedContact: contact })
              }}>
              <ListItem.Content>
                <ListItem.Title>{contact.name}</ListItem.Title>
                {/* <ListItem.Subtitle>{JSON.stringify(contact.emails)}{JSON.stringify(contact.phoneNumbers)}</ListItem.Subtitle> */}
              </ListItem.Content>
              <FontAwesome
                name="chevron-right"
                size={30}
                style={
                  {
                    color: CONST.MAIN_COLOR,
                  }
                }
              />
            </ListItem>
          ))
        }
      </ScrollView>
    </SafeAreaView>
  )
}

LocalContacts.propTypes = {
  route: PropTypes.object.isRequired,
}

export default LocalContacts
