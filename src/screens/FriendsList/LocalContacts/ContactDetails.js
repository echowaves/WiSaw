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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
        <Text>
          Pick where do you want to send your invitation to.
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
      </ScrollView>
    </SafeAreaView>
  )
}

ContactDetails.propTypes = {
  route: PropTypes.object.isRequired,
}

export default ContactDetails
