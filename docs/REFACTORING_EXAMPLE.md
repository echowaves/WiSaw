// BEFORE: Manual platform-specific code everywhere

// PhotosDetails/index.js
import { SafeAreaView, StatusBar, Platform } from 'react-native'

const renderCustomHeader = () => (
<SafeAreaView
style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    }}

>

    {/* header content */}

  </SafeAreaView>
)

// app/(drawer)/\_layout.tsx
headerStyle: {
backgroundColor: CONST.HEADER_GRADIENT_END,
borderBottomWidth: 1,
borderBottomColor: CONST.HEADER_BORDER_COLOR,
...(Platform.OS === 'android' && {
paddingTop: StatusBar.currentHeight,
height: 56 + (StatusBar.currentHeight || 0),
}),
}

// AFTER: Clean, reusable code

// PhotosDetails/index.js
import SafeAreaView from '../../components/SafeAreaView'

const renderCustomHeader = () => (
<SafeAreaView
style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    }}

>

    {/* header content */}

  </SafeAreaView>
)

// app/(drawer)/\_layout.tsx
import { getDefaultHeaderStyle } from '../../src/utils/navigationStyles'

headerStyle: getDefaultHeaderStyle()

// Or with custom overrides:
headerStyle: getDefaultHeaderStyle({
backgroundColor: 'rgba(0, 0, 0, 0.3)', // transparent header
})

// Alternative: Using hooks in components
import { useHeaderStyle } from '../../hooks/useStatusBarHeight'

const MyComponent = () => {
const headerStyle = useHeaderStyle({
backgroundColor: 'rgba(0, 0, 0, 0.3)',
})

return (
<View style={headerStyle}>
{/_ content _/}
</View>
)
}
