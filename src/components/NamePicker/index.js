import React, { useState } from 'react'
// import { useNavigation } from '@react-navigation/native'
// import { useDispatch, useSelector } from "react-redux"

import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native'

import { Text, Header, Input, Button } from 'react-native-elements'

import { FontAwesome } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

const NamePicker = ({ show, setShow, setContactName, headerText }) => {
  const {
    width,
    // height,
  } = useWindowDimensions()

  const [inputText, _setInputText] = useState('')
  const inputTextRef = React.useRef(inputText)
  const setInputText = (data) => {
    inputTextRef.current = data
    _setInputText(data)
  }

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

  const renderHeaderLeft = () => (
    <FontAwesome
      name="close"
      size={30}
      style={{
        marginLeft: 10,
        color: CONST.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => {
        setShow(false)
        setInputText('') // reset for next use
      }}
    />
  )

  // const renderHeaderRight = () => (
  //   <Ionicons
  //     name="send"
  //     style={
  //       {
  //         fontSize: 30,
  //         color: CONST.MAIN_COLOR,
  //       }
  //     }
  //     onPress={
  //       async () => {
  //         await setContactName(inputText)
  //         await setShow(false)
  //         await setInputText('')
  //       }
  //     }
  //   />

  // )

  return (
    <Modal
      animationType="slide"
      transparent={false}
      // style={styles.container}
      visible={show}
      backgroundColor="white"
    >
      <SafeAreaView>
        <Header
          containerStyle={{
            backgroundColor: '#ffffff',
          }}
          centerContainerStyle={{
            justifyContent: 'center',
          }}
          leftComponent={renderHeaderLeft()}
          centerComponent={{
            text: 'Friend Name.',
            style: {
              color: CONST.MAIN_COLOR,
            },
          }}
          // rightComponent={renderHeaderRight()}
        />
        {headerText && (
          <Text
            style={{
              textAlign: 'center',
            }}
          >
            {headerText}
          </Text>
        )}
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: 'column',
              backgroundColor: CONST.NAV_COLOR,
            }}
          >
            <Input
              placeholder="Type Friend Name..."
              placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
              // onSubmitEditing={
              //   () => _submitSearch()
              // }
              autoFocus
              containerStyle={{
                width,
              }}
              style={{
                color: CONST.MAIN_COLOR,
                backgroundColor: 'white',
                // paddingTop: 10,
                // paddingLeft: 10,
                // paddingRight: 10,
                margin: 10,
              }}
              // rightIconContainerStyle={{
              //   margin: 10,
              // }}
              lightTheme
              onChangeText={(inputValue) => {
                setInputText(inputValue.slice(0, 140))
              }}
              value={inputText}
            />

            <Button
              type="outline"
              titleStyle={{
                color: CONST.MAIN_COLOR,
              }}
              containerStyle={{
                margin: 10,
              }}
              icon={
                <FontAwesome
                  name="save"
                  style={{
                    fontSize: 30,
                    color: CONST.MAIN_COLOR,
                    marginRight: 10,
                  }}
                />
              }
              title="Save on Device"
              onPress={async () => {
                await setContactName(inputText)
                await setShow(false)
                await setInputText('')
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

NamePicker.propTypes = {
  // route: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  setContactName: PropTypes.func.isRequired,
  headerText: PropTypes.string.isRequired,
}

export default NamePicker
