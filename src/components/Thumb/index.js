import React, { Component } from 'react'
import { connect } from 'react-redux'
import FastImage from 'react-native-fast-image'

import {
  View,
  StyleSheet,
  TouchableHighlight,
  Text,
} from 'react-native'

import {
  Icon,
} from 'native-base'

import PropTypes from 'prop-types'
import { setCurrentPhotoIndex } from './reducer'

import * as CONST from '../../consts.js'

class Thumb extends Component {
  constructor(props) {
    super(props)
  }

  onThumbPress(item) {
    const { navigation, index, setCurrentPhotoIndex } = this.props
    setCurrentPhotoIndex(index)
    navigation.navigate('PhotosDetails')
  }

  render() {
    const { item, thumbWidth } = this.props

    // alert(this.thumbD)
    const thumbWidthStyles = {
      width: thumbWidth,
      height: thumbWidth,
    }

    return (
      <View>
        <TouchableHighlight
          onPress={() => this.onThumbPress(item)}
          style={[
            styles.container,
            thumbWidthStyles,
          ]}>
          <FastImage
            source={{ uri: item.getThumbUrl }}
            style={styles.thumbnail}
            fallback={item.fallback}
          />
        </TouchableHighlight>
        { item.commentsCount > 0 && (
          <View
            style={
              {
                fontSize: 30,
                color: CONST.MAIN_COLOR,
                position: 'absolute',
                bottom: 2,
                right: 5,
              }
            }>
            <Icon
              type="FontAwesome"
              name="comment"
              style={
                {
                  fontSize: 30,
                  color: CONST.SECONDARY_COLOR,
                }
              }
            />
            <Text
              style={
                {
                  fontSize: 10,
                  color: CONST.TEXT_COLOR,
                  position: 'absolute',
                  right: 8,
                  top: 12,
                }
              }>
              {item.commentsCount > 99 ? '+99' : item.commentsCount}
            </Text>
          </View>
        )}
        { item.likes > 0 && (
          <View
            style={
              {
                fontSize: 30,
                color: CONST.MAIN_COLOR,
                position: 'absolute',
                bottom: 2,
                left: 5,
              }
            }>
            <Icon
              type="FontAwesome"
              name="thumbs-up"
              style={
                {
                  fontSize: 30,
                  color: CONST.SECONDARY_COLOR,
                }
              }
            />
            <Text
              style={
                {
                  fontSize: 10,
                  color: CONST.TEXT_COLOR,
                  position: 'absolute',
                  right: 5,
                  top: 12,
                }
              }>
              {item.likes > 99 ? '+ 99' : item.likes}
            </Text>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(100,100,100,0.1)',
  },
  thumbnail: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    // resizeMode: 'contain',
  },
})

const mapStateToProps = null

const mapDispatchToProps = {
  setCurrentPhotoIndex, // will be wrapped into a dispatch call
}

Thumb.propTypes = {
  navigation: PropTypes.object.isRequired,
  setCurrentPhotoIndex: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  thumbWidth: PropTypes.number,
}

Thumb.defaultProps = {
  thumbWidth: 100,
}

export default connect(mapStateToProps, mapDispatchToProps)(Thumb)
