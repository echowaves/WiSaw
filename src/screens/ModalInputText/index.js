import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import { useDimensions } from '@react-native-community/hooks'

import {
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
} from 'react-native'

import { FontAwesome, Ionicons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts.js'

import * as reducer from '../../components/Photo/reducer'

const maxStringLength = 140

const ModalInputText = ({ route }) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { item } = route.params
  const { height } = useDimensions().window

  const uuid = useSelector(state => state.photosList.uuid)

  const [inputText, _setInputText] = useState('')

  const inputTextRef = React.useRef(inputText)
  const setInputText = data => {
    inputTextRef.current = data
    _setInputText(data)
  }

  useEffect(() => {
    navigation.setOptions({
      headerLeft: renderHeaderLeft,
      headerTitle: <Text>Enter comment</Text>,
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerBackTitle: <Text />,
    })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  })

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={
        {
          backgroundColor: '#ffffff',
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

  const renderHeaderRight = () => (
    <Ionicons
      onPress={
        () => {
          handleSubmit()
        }
      }
      name="send"
      size={30}
      style={
        {
          marginRight: 10,
          color: CONST.MAIN_COLOR,
        }
      }
    />
  )

  const handleSubmit = () => {
    dispatch(reducer.submitComment({ inputText: inputTextRef.current.trim(), uuid, item }))
    navigation.pop()
  }

  return (
    <SafeAreaView style={styles.container}>
      <CachedImage
        source={{ uri: `${item.thumbUrl}` }}
        cacheKey={`${item.id}t`}
        style={{
          alignSelf: 'center',
          width: height < 700 ? 100 : 150,
          height: height < 700 ? 100 : 150,
          borderRadius: 10,
          marginTop: 10,
        }}
      />
      <TextInput
        autoFocus
        blurOnSubmit={false}
        rowSpan={5}
        multiline
        numberOfLines={10}
        placeholder="Wanna share any thoughts?"
        placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
        maxLength={maxStringLength}
        style={
          {
            color: CONST.MAIN_COLOR,
            height: height < 700 ? 150 : 200,
            margin: 12,
            padding: 10,
            borderWidth: 1,
            borderColor: CONST.MAIN_COLOR,
            fontSize: 20,
            textAlignVertical: 'top',
          }
        }
        onChangeText={inputValue => {
          setInputText(inputValue.slice(0, maxStringLength))
        }}
        value={inputText}
      />
      <Text style={{
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        top: 12,
        right: 12,
        color: CONST.MAIN_COLOR,

      }}>
        {maxStringLength - inputText.length}
      </Text>
    </SafeAreaView>

  )
}
ModalInputText.defaultProps = {
  item: {},
}

ModalInputText.propTypes = {
  item: PropTypes.object,
  route: PropTypes.object.isRequired,
}

export default ModalInputText
