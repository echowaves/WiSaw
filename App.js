/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,

} from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};

export default class App extends Component<Props> {
  state = {
      placeName: '',
      places: [],
  }

  placeNameChandegHandler = val => {
    this.setState({
      placeName: val,
    })
  }

  placeSubmitHandler = () => {
    if(this.state.placeName.trim() === '') {
      return
    }
    this.setState(prevState => {
      return {
        places: prevState.places.concat(prevState.placeName),
      }
    })
  }

  render() {
    const placesOutput = this.state.places.map((place, i) => (
      <Text key={i}>{place}</Text>
    ))
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="An awesome place"
            value={this.state.placeName}
            onChangeText={this.placeNameChandegHandler}
            style={styles.placeInput}
          />
          <Button
            title='Add'
            style={styles.placeButton}
            onPress={this.placeSubmitHandler}
          />
        </View>
        <View>
          {placesOutput}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 26,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  inputContainer: {
    // flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeInput: {
    width: '70%',
  },
  placeButton: {
    width: '30%',
  },
});
