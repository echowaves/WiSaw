import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import Button from '../ui/Button'

const CARDS = [
  {
    icon: 'user-friends',
    title: 'Connect with Friends',
    body: 'Add friends to share photos privately. Your connections are secure and only visible to you.'
  },
  {
    icon: 'share-alt',
    title: 'Easy Sharing',
    body: 'Share a link or QR code to connect with someone. Once they accept, you can view each other\'s photos.'
  },
  {
    icon: 'images',
    title: 'Photo Sharing',
    body: 'See your friends\' photos in a dedicated feed. No phone numbers or emails needed.'
  }
]

const FriendsExplainerView = ({ theme, onAddFriend }) => {
  const styles = getStyles(theme)

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name='user-friends' size={36} color='#EA5E3D' />
        </View>
        <Text style={styles.title}>Connect with Friends</Text>
        <Text style={styles.subtitle}>
          Add friends to share photos privately. No accounts or phone numbers needed.
        </Text>
      </View>

      {CARDS.map((card) => (
        <View key={card.icon} style={styles.card}>
          <View style={styles.cardIconRow}>
            <FontAwesome5 name={card.icon} size={18} color='#EA5E3D' />
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>
          <Text style={styles.cardBody}>{card.body}</Text>
        </View>
      ))}

      <Button
        title='Add a Friend'
        icon={
          <FontAwesome5
            name='plus'
            size={18}
            color='white'
            style={{ marginRight: 8 }}
          />
        }
        size='lg'
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
        onPress={onAddFriend}
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

export default FriendsExplainerView
