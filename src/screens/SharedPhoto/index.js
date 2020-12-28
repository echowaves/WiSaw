import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

import { useDispatch, useSelector } from "react-redux"

import PropTypes from 'prop-types'

import {
  StyleSheet,
  View,
  Alert,
  Text,
} from 'react-native'

import {
  Icon,
  Button,
  Container,
  Content,
  Body,
  Spinner,
} from 'native-base'

import Photo from '../../components/Photo'

import * as photoReducer from '../../components/Photo/reducer'

import * as reducer from './reducer'

import * as CONST from '../../consts.js'

const SharedPhoto = props => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const item = useSelector(state => state.sharedPhoto.item)
  const bans = useSelector(state => state.photo.bans)
  const watched = useSelector(state => state.photo.watched)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: <Text>shared photo</Text>,
      headerTintColor: CONST.SECONDARY_COLOR,
      headerLeft: (
        <View style={{
          flex: 1,
          flexDirection: "row",
        }}>
          <Button
            onPress={
              () => navigation.goBack()
            }
            style={{
              backgroundColor: '#ffffff',
            }}>
            <Icon
              name="angle-left"
              type="FontAwesome"
              style={{
                color: CONST.MAIN_COLOR,
              }}
            />
          </Button>
          <Button
            onPress={
              () => handleFlipWatch()
            }
            style={{
              backgroundColor: '#ffffff',
            }}>
            <Icon
              name={watched ? "eye" : "eye-slash"}
              type="FontAwesome"
              style={{ color: CONST.MAIN_COLOR }}
            />
          </Button>
        </View>
      ),
      headerRight: (!watched && (
        <View style={{
          flex: 1,
          flexDirection: "row",
        }}>
          <Icon
            onPress={
              () => handleBan()
            }
            name="ban"
            type="FontAwesome"
            style={{
              marginRight: 20,
              color: CONST.MAIN_COLOR,
            }}
          />
          <Icon
            onPress={
              () => handleDelete()
            }
            name="trash"
            type="FontAwesome"
            style={{ marginRight: 20, color: CONST.MAIN_COLOR }}
          />
        </View>
      )),
      headerBackTitle: null,
    })

    reducer.setItem({ item: props.item })

    dispatch(photoReducer.checkIsPhotoWatched({ item }))
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const isPhotoBannedByMe = ({ photoId }) => bans.includes(photoId)

  const handleBan = () => {
    if (isPhotoBannedByMe({ photoId: item.id })) {
      Alert.alert(
        'Looks like you already reported this Photo',
        'You can only report same Photo once.',
        [
          { text: 'OK', onPress: () => null },
        ],
      )
    } else {
      Alert.alert(
        'Report abusive Photo?',
        'The user who posted this photo will be banned. Are you sure?',
        [
          { text: 'No', onPress: () => null, style: 'cancel' },
          { text: 'Yes', onPress: () => dispatch(photoReducer.banPhoto({ item })) },
        ],
        { cancelable: true }
      )
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Photo?',
      'The photo will be deleted from the cloud and will never be seeing again by anyone. Are you sure?',
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            dispatch(photoReducer.deletePhoto({ item }))
          },
        },
      ],
      { cancelable: true }
    )
  }

  const handleFlipWatch = () => {
    if (watched) {
      dispatch(photoReducer.unwatchPhoto({ item, navigation }))
    } else {
      dispatch(photoReducer.watchPhoto({ item, navigation }))
    }
  }

  if (item) {
    return (
      <View style={styles.container}>
        <Photo item={item} key={item.id} />
      </View>
    )
  }

  return (
    <Container>
      <Content padder>
        <Body>
          <Spinner color={
            CONST.MAIN_COLOR
          }
          />
        </Body>
      </Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

// const mapStateToProps = state => (
//   {
//     item: state.sharedPhoto.item,
//     bans: state.photo.bans,
//     watched: state.photo.watched,
//   }
// )

// const mapDispatchToProps = {
//   banPhoto,
//   deletePhoto,
//   setItem,
//   watchPhoto,
//   unwatchPhoto,
//   checkIsPhotoWatched,
// }
//
// SharedPhoto.propTypes = {
//   navigation: PropTypes.object.isRequired,
//   banPhoto: PropTypes.func.isRequired,
//   deletePhoto: PropTypes.func.isRequired,
//   bans: PropTypes.array.isRequired,
//   item: PropTypes.object,
//   setItem: PropTypes.func.isRequired,
//   watched: PropTypes.bool.isRequired,
//   watchPhoto: PropTypes.func.isRequired,
//   unwatchPhoto: PropTypes.func.isRequired,
//   checkIsPhotoWatched: PropTypes.func.isRequired,
// }
//
// SharedPhoto.defaultProps = {
//   item: null,
// }
//
export default SharedPhoto
