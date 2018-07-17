import { Navigation } from 'react-native-navigation'
import { Provider } from 'react-redux'

import ContactUsScreen from './src/screens/ContactUs/ContactUs'
import SideDrawer from './src/screens/SideDrawer/SideDrawer'
import configureStore from './src/store/configureStore'

const store = configureStore()

// Register Screens
Navigation.registerComponent(
  'wisaw.ContactUsScreen',
  () => ContactUsScreen,
  store,
  Provider,
)

Navigation.registerComponent(
  'wisaw.SideDrawer',
  () => SideDrawer,
  store,
  Provider,
);

// Start a App
export default () => Navigation.startSingleScreenApp({
  screen: {
    screen: 'wisaw.ContactUsScreen',
    title: 'Contact Us',
  },
})
