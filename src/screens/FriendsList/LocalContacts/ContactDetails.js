import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import { useDimensions } from '@react-native-community/hooks'
import * as Linking from 'expo-linking'
import * as Contacts from 'expo-contacts'
import validator from 'validator'
import { phone } from 'phone'

import {
  View,
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  FontAwesome, Ionicons, MaterialCommunityIcons, SimpleLineIcons, AntDesign, MaterialIcons,
} from '@expo/vector-icons'

import { Col, Row, Grid } from "react-native-easy-grid"

import PropTypes from 'prop-types'

import * as CONST from '../../../consts.js'

import * as reducer from '../reducer'

const ContactDetails = ({ route }) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const { width, height } = useDimensions().window

  const { pickedContact } = route.params

  // const topOffset = useSelector(state => state.photosList.topOffset)

  const uuid = useSelector(state => state.secret.uuid)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Pick Phone or Email',
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
  const _addPhone = ({ addedPhone }) => {
    const resultPhone = phone(addedPhone)
    console.log({ resultPhone })

    if (resultPhone.isValid) {
      console.log({ addedPhone })
    } else {
      setAddedPhoneError('Not a valid phone number')
    }
  }

  const _addEmail = ({ addedEmail }) => {
    if (validator.isEmail(addedEmail)) {
      console.log({ addedEmail })
    } else {
      setAddedEmailError('Not a valid email')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
        <Text>
          Pick where you want to send your invitation for:
        </Text>
        <Text h3>
          {pickedContact.name}
        </Text>

        {
          pickedContact.phoneNumbers?.map((phone, index) => (
            <ListItem
              bottomDivider
              key={phone.id}
              style={{
                paddingBottom: 5,
                paddingLeft: 10,
                paddingRight: 10,
                width: '100%',
              }}
              onPress={() => {
                console.log(phone.id)
              }}>
              <ListItem.Content>
                <ListItem.Title>{phone.number}</ListItem.Title>
                <ListItem.Subtitle>{phone.label}</ListItem.Subtitle>
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
        {
          pickedContact.emails?.map((email, index) => (
            <ListItem
              bottomDivider
              key={email.id}
              style={{
                paddingBottom: 5,
                paddingLeft: 10,
                paddingRight: 10,
                width: '100%',
              }}
              onPress={() => {
                console.log(email.id)
              }}>
              <ListItem.Content>
                <ListItem.Title>{email.email}</ListItem.Title>
                <ListItem.Subtitle>{email.label}</ListItem.Subtitle>
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
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
          onPress={
            () => Contacts.presentFormAsync(pickedContact.id)
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
              Edit contact in Phone book
            </Text>
          </Col>
          <Col
            size={1}>
            <MaterialIcons
              name="update" style={
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
  )
}

ContactDetails.propTypes = {
  route: PropTypes.object.isRequired,
}

export default ContactDetails
