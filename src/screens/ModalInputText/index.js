import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'

import { StyleSheet, TextInput, useWindowDimensions } from 'react-native'

import { Button, Icon, Text } from '@rneui/themed'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { FontAwesome, Ionicons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts'

import * as reducer from '../../components/Photo/reducer'

const maxStringLength = 140

const ModalInputText = ({ route }) => {
  const navigation = useNavigation()
  const { photo, topOffset, uuid } = route.params
  const { height } = useWindowDimensions()

  const [inputText, _setInputText] = useState('')

  const inputTextRef = React.useRef(inputText)
  const setInputText = (data) => {
    inputTextRef.current = data
    _setInputText(data)
  }

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONST.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => navigation.goBack()}
    />
  )
  const handleSubmit = () => {
    reducer.submitComment({
      inputText: inputTextRef.current.trim(),
      uuid,
      photo,
    })
    navigation.pop()
  }

  const renderHeaderRight = () => (
    <Ionicons
      onPress={() => {
        handleSubmit()
      }}
      name="send"
      size={30}
      style={{
        marginRight: 10,
        color: CONST.MAIN_COLOR,
      }}
    />
  )

  useEffect(() => {
    navigation.setOptions({
      headerLeft: renderHeaderLeft,
      headerTitle: 'Enter comment',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  }, [])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  })

  return (
    <KeyboardAwareScrollView style={styles.container}>
      <CachedImage
        source={{ uri: `${photo.thumbUrl}` }}
        cacheKey={`${photo.id}t`}
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
        style={{
          color: CONST.MAIN_COLOR,
          height: height < 700 ? 150 : 200,
          margin: 12,
          padding: 10,
          borderWidth: 1,
          borderColor: CONST.MAIN_COLOR,
          fontSize: 20,
          textAlignVertical: 'top',
        }}
        onChangeText={(inputValue) => {
          setInputText(inputValue.slice(0, maxStringLength))
        }}
        value={inputText}
      />
      <Text
        style={{
          flex: 1,
          flexDirection: 'row',
          position: 'absolute',
          top: 12,
          right: 12,
          color: CONST.MAIN_COLOR,
        }}
      >
        {maxStringLength - inputText.length}
      </Text>
      <Button
        onPress={() => handleSubmit()}
        name="send"
        size="lg"
        iconRight
        color={CONST.MAIN_COLOR}
      >
        {`   Submit`}
        <Icon name="send" color="white" />
      </Button>
    </KeyboardAwareScrollView>
  )
}

ModalInputText.propTypes = {
  photo: PropTypes.object,
  route: PropTypes.object.isRequired,
}

export default ModalInputText
