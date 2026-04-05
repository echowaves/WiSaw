import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import AppHeader from '../../../src/components/AppHeader'
import WaveDetail from '../../../src/screens/WaveDetail'
import * as STATE from '../../../src/state'
import { getTheme, SHARED_STYLES } from '../../../src/theme/sharedStyles'
import * as CONST from '../../../src/consts'

const ROLE_CONFIG = {
  owner: { label: 'Owner', color: CONST.MAIN_COLOR },
  facilitator: { label: 'Facilitator', color: '#8B5CF6' },
  contributor: { label: 'Contributor', color: '#6B7280' }
}

export default function WaveDetailScreen() {
  const router = useRouter()
  const { waveUuid, waveName, myRole, isFrozen } = useLocalSearchParams()
  const waveDetailRef = useRef<{ showHeaderMenu: () => void }>(null)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)

  const frozen = isFrozen === '1'
  const roleConfig = typeof myRole === 'string' ? ROLE_CONFIG[myRole] : null

  const headerTitle = (
    <View style={{ alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {frozen && (
          <MaterialCommunityIcons
            name='snowflake'
            size={16}
            color='#60A5FA'
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          style={{ color: theme.TEXT_PRIMARY, fontSize: 16, fontWeight: '600' }}
          numberOfLines={1}
        >
          {String(waveName || 'Wave')}
        </Text>
      </View>
      {roleConfig && (
        <Text
          style={{
            fontSize: 11,
            color: roleConfig.color,
            fontWeight: '600',
            marginTop: 2
          }}
        >
          {roleConfig.label}
        </Text>
      )}
    </View>
  )

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.back()}
              title={headerTitle}
              rightSlot={
                <TouchableOpacity
                  onPress={() => waveDetailRef.current?.showHeaderMenu()}
                  style={[
                    SHARED_STYLES.interactive.headerButton,
                    {
                      backgroundColor: theme.INTERACTIVE_BACKGROUND,
                      borderWidth: 1,
                      borderColor: theme.INTERACTIVE_BORDER
                    }
                  ]}
                >
                  <MaterialCommunityIcons name='dots-vertical' size={22} color={theme.TEXT_PRIMARY} />
                </TouchableOpacity>
              }
            />
          )
        }}
      />
      <WaveDetail ref={waveDetailRef} isFrozen={frozen} myRole={String(myRole || '')} />
    </>
  )
}
