import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import Button from '../ui/Button'

const SHARED_CARDS = [
  {
    icon: 'water',
    title: 'What Are Waves?',
    body: 'Waves are collections of photos organized by time and location. They help you relive moments the way they happened.'
  }
]

const UNGROUPED_CARDS = [
  {
    icon: 'images',
    title: 'Photos Ready to Organize',
    body: 'You have photos that aren\'t in any wave yet. They can be automatically sorted into waves based on when and where they were taken.'
  },
  {
    icon: 'magic',
    title: 'Auto Group Does the Work',
    body: 'Tap the button below and the system will analyze your photos and group them into waves automatically. You can always reorganize later.'
  }
]

const NO_PHOTOS_CARDS = [
  {
    icon: 'camera',
    title: 'Start by Taking Photos',
    body: 'Take photos and they will be ready to group into waves later. Each photo captures a time and location that helps organize them.'
  },
  {
    icon: 'layer-group',
    title: 'Two Ways to Add Photos',
    body: 'Shoot directly into a wave from the camera, or take photos first and add them to waves later — whatever works best for you.'
  }
]

const WavesExplainerView = ({ theme, ungroupedCount, onAutoGroup, onNavigateHome }) => {
  const hasUngrouped = ungroupedCount > 0
  const variantCards = hasUngrouped ? UNGROUPED_CARDS : NO_PHOTOS_CARDS
  const cards = [...SHARED_CARDS, ...variantCards]
  const styles = getStyles(theme)

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name='water' size={36} color='#EA5E3D' />
        </View>
        <Text style={styles.title}>Organize Your Photos</Text>
        <Text style={styles.subtitle}>
          {hasUngrouped
            ? `You have ${ungroupedCount} photo${ungroupedCount !== 1 ? 's' : ''} ready to organize into waves.`
            : 'Take photos to start building your wave collection.'}
        </Text>
      </View>

      {cards.map((card) => (
        <View key={card.icon} style={styles.card}>
          <View style={styles.cardIconRow}>
            <FontAwesome5 name={card.icon} size={18} color='#EA5E3D' />
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>
          <Text style={styles.cardBody}>{card.body}</Text>
        </View>
      ))}

      <Button
        title={hasUngrouped ? `Auto Group ${ungroupedCount} Photo${ungroupedCount !== 1 ? 's' : ''}` : 'Take a Photo'}
        icon={
          <FontAwesome5
            name={hasUngrouped ? 'magic' : 'camera'}
            size={18}
            color='white'
            style={{ marginRight: 8 }}
          />
        }
        size='lg'
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
        onPress={hasUngrouped ? onAutoGroup : onNavigateHome}
      />
    </ScrollView>
  )
}

const getStyles = (theme) =>
  StyleSheet.create({
    scroll: {
      flex: 1
    },
    content: {
      padding: 20,
      paddingTop: 30,
      paddingBottom: 100
    },
    header: {
      alignItems: 'center',
      marginBottom: 24
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(234, 94, 61, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.TEXT_PRIMARY,
      textAlign: 'center',
      marginBottom: 8
    },
    subtitle: {
      fontSize: 16,
      color: theme.TEXT_SECONDARY,
      textAlign: 'center',
      lineHeight: 22
    },
    card: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT
    },
    cardIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.TEXT_PRIMARY,
      marginLeft: 10
    },
    cardBody: {
      fontSize: 15,
      color: theme.TEXT_SECONDARY,
      lineHeight: 22
    },
    button: {
      backgroundColor: '#EA5E3D',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      marginTop: 8,
      shadowColor: '#EA5E3D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8
    },
    buttonTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600'
    }
  })

export default WavesExplainerView
