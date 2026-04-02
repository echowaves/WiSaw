import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import ActionMenu from '../../src/components/ActionMenu'
import AppHeader from '../../src/components/AppHeader'
import { emitAddFriend } from '../../src/events/friendAddBus'
import FriendsList from '../../src/screens/FriendsList'
import { SHARED_STYLES, getTheme } from '../../src/theme/sharedStyles'
import { ScreenIconTitle } from '../../src/theme/screenIcons'
import * as STATE from '../../src/state'

export default function Friends () {
  const router = useRouter()
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [sortBy, setSortBy] = useAtom(STATE.friendsSortBy)
  const [sortDirection, setSortDirection] = useAtom(STATE.friendsSortDirection)
  const [menuVisible, setMenuVisible] = useState(false)
  const theme = getTheme(isDarkMode)

  const handleAddFriend = () => {
    emitAddFriend()
  }

  const sortOptions = [
    { label: 'Alphabetical A-Z', sortBy: 'alphabetical', sortDirection: 'asc', icon: 'sort-alphabetical-ascending' },
    { label: 'Alphabetical Z-A', sortBy: 'alphabetical', sortDirection: 'desc', icon: 'sort-alphabetical-descending' },
    { label: 'Recently Added', sortBy: 'recentlyAdded', sortDirection: 'desc', icon: 'sort-descending' }
  ]

  const menuItems = sortOptions.map((opt, i) => ({
    key: `sort-${i}`,
    icon: opt.icon,
    label: opt.label,
    checked: opt.sortBy === sortBy && opt.sortDirection === sortDirection,
    onPress: () => {
      setSortBy(opt.sortBy)
      setSortDirection(opt.sortDirection)
    }
  }))

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.replace('/')}
              title={<ScreenIconTitle screenKey='friends' />}
              rightSlot={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    onPress={handleAddFriend}
                    style={[
                      SHARED_STYLES.interactive.headerButton,
                      {
                        backgroundColor:
                          theme.INTERACTIVE_BACKGROUND,
                        borderWidth: 1,
                        borderColor: theme.INTERACTIVE_BORDER
                      }
                    ]}
                  >
                    <FontAwesome5
                      name='plus'
                      size={18}
                      color={theme.TEXT_PRIMARY}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={[
                      SHARED_STYLES.interactive.headerButton,
                      {
                        backgroundColor:
                          theme.INTERACTIVE_BACKGROUND,
                        borderWidth: 1,
                        borderColor: theme.INTERACTIVE_BORDER
                      }
                    ]}
                  >
                    <MaterialCommunityIcons
                      name='dots-vertical'
                      size={22}
                      color={theme.TEXT_PRIMARY}
                    />
                  </TouchableOpacity>
                </View>
              }
            />
          )
        }}
      />
      <FriendsList />
      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
      />
    </>
  )
}
