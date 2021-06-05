import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import {
  Text,
  View,
  TextInput,
} from 'react-native'

import { FontAwesome, Ionicons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from '../../components/CachedImage'

import * as CONST from '../../consts.js'

import * as reducer from '../../components/Photo/reducer'

const maxStringLength = 140

const ModalInputText = ({ route }) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { item } = route.params

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

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={
        {
          backgroundColor: '#ffffff',
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
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
    <Container>
      <Content
        padder>
        <CachedImage
          source={{ uri: `${item.getThumbUrl}` }}
          cacheKey={`${item.id}t`}
          style={{
            alignSelf: 'center',
            width: 150,
            height: 100,
            borderRadius: 10,
          }}
        />
        <TextInput
          autoFocus
          blurOnSubmit={false}
          rowSpan={5}
          bordered
          placeholder="Wanna share any thoughts?"
          placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
          style={
            {
              color: CONST.MAIN_COLOR,
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

      </Content>

    </Container>

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
