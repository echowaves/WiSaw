import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { connect } from 'react-redux'

// import { authLogout } from '../../store/actions/index'

class SideDrawer extends Component {
  render() {
    return (
      <View>
        <TouchableOpacity onPress={this.props.onLogout}>
          <View style={styles.drawerItem}>
            <Text>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    backgroundColor: 'white',
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#eee',
  },
  drawerItemIcon: {
    marginRight: 10,
  },
});

const mapDispatchToProps = dispatch => ({
  onLogout: () => dispatch(
    // authLogout()
  ),
})

export default connect(null, mapDispatchToProps)(SideDrawer)
