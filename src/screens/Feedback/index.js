import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import {
  Text,
} from 'react-native'

import {
  Icon,
  Container,
  Content,
  Spinner,
  Form,
  Textarea,
  Item,
  Body,
  Card,
  CardItem,
  Button,
} from 'native-base'

import Modal from "react-native-modal"

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

const FeedbackScreen = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const feedbackText = useSelector(state => state.feedback.feedbackText)
  const loading = useSelector(state => state.feedback.loading)
  const errorMessage = useSelector(state => state.feedback.errorMessage)
  const finished = useSelector(state => state.feedback.finished)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: <Text>feedback form</Text>,
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerBackTitle: <Text />,
    })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const renderHeaderRight = () => (
    <Icon
      onPress={
        () => handleSubmit()
      }
      name="send"
      type="MaterialIcons"
      style={
        {
          marginRight: 10,
          color: CONST.MAIN_COLOR,
        }
      }
    />
  )

  const handleSubmit = () => {
    dispatch(reducer.submitFeedback({ feedbackText }))
  }

  if (finished && errorMessage.length === 0) {
    return (
      <Container>
        <Content padder>
          <Body>
            <Modal isVisible>
              <Content padder>
                <Card transparent>
                  <CardItem style={{ borderRadius: 10 }}>
                    <Text>Thank you for submitting your feedback.
                    </Text>
                  </CardItem>
                  <CardItem footer style={{ borderRadius: 10 }}>
                    <Body>
                      <Button
                        block
                        bordered
                        success
                        small
                        onPress={
                          () => {
                            navigation.goBack()
                            dispatch(reducer.resetForm())
                          }
                        }>
                        <Text> You are Welcome! </Text>
                      </Button>
                    </Body>
                  </CardItem>
                </Card>
              </Content>
            </Modal>
          </Body>
        </Content>
      </Container>
    )
  }
  return (
    <Container>
      <Content padder>
        { errorMessage.length !== 0 && (
          <Item error>
            <Text>{errorMessage}</Text>
            <Icon name="close-circle" />
          </Item>
        )}
        <Form>
          <Textarea
            rowSpan={5}
            bordered
            onChangeText={feedbackText => dispatch(reducer.setFeedbackText({ feedbackText }))}
            placeholder="Type your feedback here and click send."
            placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
            style={
              {
                color: CONST.MAIN_COLOR,
              }
            }
          />
        </Form>
      </Content>
      { loading && (
        <Spinner
          color={
            CONST.MAIN_COLOR
          }
          style={
            {
              flex: 1,
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
            }
          }
        />
      )}
    </Container>
  )
}
export default FeedbackScreen
