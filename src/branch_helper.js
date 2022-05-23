import Branch,
{ BranchEvent }
from 'react-native-branch'
import { Alert } from 'react-native'

export const initBranch = async ({ navigation }) => {
  // eslint-disable-next-line
    // if (!__DEV__) {
  // const ExpoBranch = await import('expo-branch')
  // const Branch = ExpoBranch.default

  // eslint-disable-next-line global-require
  // const Branch = require("expo-branch").default

  // console.log('...................................................................................1')
  // console.log({ Branch })
  // alert(JSON.stringify({ Branch }))
  Branch.subscribe(async bundle => {
    // alert(JSON.stringify({ bundle: bundle === true, params: bundle?.params === true, notError: !bundle?.error }))

    // alert(JSON.stringify({ bundle }))
    if (bundle && bundle?.params && !bundle?.error) {
      // // `bundle.params` contains all the info about the link.
      _navigateByParams({ params: bundle.params, navigation })
    // } else if (bundle?.error === 'Warning. Session initialization already happened.') {
    //   // this could be android path, because it always contains error "Session initializaion already happened"
    //   Alert.alert(
    //     "You may want to close WiSaw application and then click on the deep link to make it open correctly.",
    //     "This is a known issue which will be eventually fixed in one of the depencencies libararies"
    //   )
    } else {
      const latestParams = await Branch.getLatestReferringParams()
      _navigateByParams({ params: latestParams, navigation })
    }
  })
  // }
}

const _navigateByParams = async ({ params, navigation }) => {
  // alert(JSON.stringify({ params }))
  // alert(JSON.stringify({ params, hello: "hello" }))
  if (params?.photoId) {
    // alert(JSON.stringify({ photoId: bundle?.params?.photoId }))
    await navigation.popToTop()
    await navigation.navigate('PhotosDetailsShared', { photoId: params?.photoId })
  }
  if (params?.friendshipUuid) {
    // alert(JSON.stringify({ friendshipUuid: params?.friendshipUuid }))
    await navigation.popToTop()
    await navigation.navigate('ConfirmFriendship', { friendshipUuid: params?.friendshipUuid })
  }
}

export const sharePhoto = async ({ photo, photoDetails }) => {
  const _branchUniversalObject = await Branch.createBranchUniversalObject(
    `${photo?.id}`,
    {
      // title: photo.id,
      contentImageUrl: photo.imgUrl,
      // contentDescription: photo.id,
      // This metadata can be used to easily navigate back to this screen
      // when implementing deep linking with `Branch.subscribe`.
      metadata: {
        // screen: 'photoScreen',
        params: JSON.stringify({ photoId: photo?.id },),
        // params: { photoId: photo?.id },
      },
      contentMetadata: {
        customMetadata: {
          photoId: photo?.id, // your userId field would be defined under customMetadata
        },
      },
    }
  )

  let messageBody = `Check out what I saw today${photo?.video ? " (video)" : ''}:`
  // const messageHeader = 'Check out what I saw today:'
  const emailSubject = 'WiSaw: Check out what I saw today'

  if (photoDetails.comments) {
    // get only the 3 comments
    messageBody = `${messageBody}\n\n${
      photoDetails.comments.slice(0, 3).map(
        comment => (
          comment.comment
        )
      ).join('\n\n')}\n\n`
  }

  const shareOptions = {
    messageHeader: "What I Saw today...",
    messageBody,
    emailSubject,
  }
  //   alert(JSON.stringify({ _branchUniversalObject }))
  await _branchUniversalObject.showShareSheet(shareOptions)
}

export const shareFriend = async ({ friendshipUuid, contactName }) => {
  const _branchUniversalObject = await Branch.createBranchUniversalObject(
    `${friendshipUuid}`,
    {
      locallyIndex: false,
      title: 'Inviting friend to collaborate on WiSaw',
      // contentImageUrl: photo.imgUrl,
      contentDescription: "Let's talk.",
      // This metadata can be used to easily navigate back to this screen
      // when implementing deep linking with `Branch.subscribe`.
      contentMetadata: {
        customMetadata: {
          friendshipUuid, // your userId field would be defined under customMetadata
        },
      },
    }
  )
  const messageBody = `${contactName}, you've got WiSaw friendship request.
  To confirm, follow the url:`

  const shareOptions = {
    messageHeader: "What I Saw today...",
    messageBody,
    emailSubject: 'What I Saw today friendship request...',
  }
  // alert(JSON.stringify({ branchUniversalObject }))
  await _branchUniversalObject.showShareSheet(shareOptions)
}