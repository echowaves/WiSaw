import Branch,
{ BranchEvent }
from 'expo-branch'

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
    const latestParams = await Branch.getLatestReferringParams()
    // alert(JSON.stringify({ params, installParams, bundle_params: bundle.params }))
    // alert(JSON.stringify({ bundle_params: bundle.params }))

    if (bundle && bundle?.params && !bundle.error) {
      // // `bundle.params` contains all the info about the link.
      _navigateByParams({ params: bundle.params, latestParams, navigation })
      // navigation.navigate('PhotosDetailsShared', { photoId: bundle?.params?.$canonical_identifier })
      // }
      // else {
      // const params = await Branch.getLatestReferringParams()
      // alert(JSON.stringify({ params }))
      // _navigateByParams({ params, navigation })
      // }
    }
  })
  // }
}

const _navigateByParams = async ({ params, latestParams, navigation }) => {
  // alert(JSON.stringify({ params }))
  await navigation.popToTop()
  if (params?.photoId || latestParams?.photoId) {
    // alert(JSON.stringify({ photoId: bundle?.params?.photoId }))
    await navigation.navigate('PhotosDetailsShared', { photoId: params?.photoId || latestParams?.photoId })
  }
  if (params?.friendshipUuid || latestParams?.friendshipUuid) {
    // alert(JSON.stringify({ friendshipUuid: params?.friendshipUuid }))
    await navigation.navigate('ConfirmFriendship', { friendshipUuid: params?.friendshipUuid || latestParams?.friendshipUuid })
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