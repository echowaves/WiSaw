import React, { useEffect, useState } from 'react'
// import { useNavigation } from '@react-navigation/native'
// import { useDispatch, useSelector } from "react-redux"
import { useDimensions } from '@react-native-community/hooks'
import * as Linking from 'expo-linking'
import * as Contacts from 'expo-contacts'

import {
  View,
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native'

import {
  Text,
  ListItem,
  SearchBar,
  Header,
} from 'react-native-elements'

import {
  FontAwesome, Ionicons,
} from '@expo/vector-icons'

import {
  Col,
  // Row,
  // Grid,
} from "react-native-easy-grid"

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

const LocalContacts = ({
  show, setShow, setContactId, headerText,
}) => {
  // const navigation = useNavigation()
  // const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState([])
  const [permissionGranted, setPermissionGranted] = useState(false)

  const {
    width,
    // height,
  } = useDimensions().window

  useEffect(() => {
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
        return
      }
      setPermissionGranted(status === 'granted')
    }
  }

  const _submitSearch = async searchString => {
    if (searchString.length === 0) {
      return
    }
    // console.log('--------------------------------------------------')
    // console.log({ searchString })
    const { data } = await Contacts.getContactsAsync({
      name: searchString,
      fields: [/* Contacts.Fields.Emails, */Contacts.Fields.PhoneNumbers],
    })
    // console.log({ data })
    // console.log(data.length)
    setContacts(data.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase()))
  }

  const renderHeaderLeft = () => (
    <FontAwesome
      name="close"
      size={30}
      style={
        {
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }
      }
      onPress={
        () => setShow(false)
      }
    />
  )

  const renderHeaderRight = () => (
    <Ionicons
      name="add-circle"
      style={
        {
          fontSize: 30,
          color: CONST.MAIN_COLOR,
        }
      }
      onPress={
        async () => {
          await Contacts.presentFormAsync(null, {}, {
            isNew: true,
            allowsActions: false,
          })
          _submitSearch(searchTerm)
        }
      }
    />

  )

  return (
    <Modal
      animationType="slide"
      transparent={false}
      // style={styles.container}
      visible={show}
      backgroundColor="white">
      <SafeAreaView>
        <Header
          containerStyle={{
            backgroundColor: '#ffffff',
          }}
          centerContainerStyle={{
            justifyContent: 'center',
          }}
          leftComponent={renderHeaderLeft()}
          centerComponent={
            {
              text: 'Find your friend in contacts.',
              style: {
                color: CONST.MAIN_COLOR,
              },
            }
          }
          rightComponent={renderHeaderRight()}
        />
        {headerText && (
          <Text
            style={{
              textAlign: 'center',
            }}>{headerText}
          </Text>
        )}
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
                // navigation.navigate('ContactDetails', { contactId: contact.id })
                  // console.log({ contactId: contact.id })
                  setContactId(contact.id)
                  setShow(false)
                }}>
                <ListItem.Content>
                  <ListItem.Title>{contact.name}</ListItem.Title>
                  {/* <ListItem.Subtitle>{JSON.stringify(contact.emails)}{JSON.stringify(contact.phoneNumbers)}</ListItem.Subtitle> */}
                </ListItem.Content>
                <ListItem.Chevron size={40} color={CONST.MAIN_COLOR} />
              </ListItem>
            ))
          }
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
            }}
            onPress={
              async () => {
                await Contacts.presentFormAsync(null, {}, {
                  isNew: true,
                  allowsActions: false,
                })
                _submitSearch(searchTerm)
              }
            }>
            <Col
              size={1}
            />
            <Col
              size={10}
              style={{ flex: 5, justifyContent: "center", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 25,
                  color: CONST.MAIN_COLOR,
                }}>
                Or Add new contact to Phone book
              </Text>
            </Col>
            <Col
              size={1}>
              <Ionicons
                name="add-circle"
                style={
                  {
                    fontSize: 45,
                    color: CONST.MAIN_COLOR,
                  }
                }
              />
            </Col>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

LocalContacts.propTypes = {
  // route: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  setContactId: PropTypes.func.isRequired,
  headerText: PropTypes.string.isRequired,
}

export default LocalContacts
