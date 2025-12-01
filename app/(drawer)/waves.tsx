import { FontAwesome5 } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import AppHeader from '../../src/components/AppHeader'
import { emitAddWave } from '../../src/events/waveAddBus'
import Waves from '../../src/screens/Waves'
import { SHARED_STYLES } from '../../src/theme/sharedStyles'

export default function WavesScreen() {
  const router = useRouter()

  const handleAddWave = () => {
    emitAddWave()
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.replace('/')}
              title='Waves'
              rightSlot={
                <TouchableOpacity
                  onPress={handleAddWave}
                  style={[
                    SHARED_STYLES.interactive.headerButton,
                    {
                      backgroundColor:
                        SHARED_STYLES.theme.INTERACTIVE_BACKGROUND,
                      borderWidth: 1,
                      borderColor: SHARED_STYLES.theme.INTERACTIVE_BORDER
                    }
                  ]}
                >
                  <FontAwesome5
                    name='plus'
                    size={18}
                    color={SHARED_STYLES.theme.TEXT_PRIMARY}
                  />
                </TouchableOpacity>
              }
            />
          )
        }}
      />
      <Waves />
    </>
  )
}
