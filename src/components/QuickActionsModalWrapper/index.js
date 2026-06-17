import React, { useState, forwardRef, useImperativeHandle, memo } from 'react'
import QuickActionsModal from '../QuickActionsModal'

const QuickActionsModalWrapper = memo(
  forwardRef(({ onPhotoDeleted, onPhotoRemovedFromWave }, ref) => {
    const [longPressPhoto, setLongPressPhoto] = useState(null)

    useImperativeHandle(ref, () => ({
      open: (photo) => setLongPressPhoto(photo)
    }), [])

    return (
      <QuickActionsModal
        visible={!!longPressPhoto}
        photo={longPressPhoto}
        onClose={() => setLongPressPhoto(null)}
        onPhotoDeleted={(photoId) => {
          setLongPressPhoto(null)
          if (onPhotoDeleted) onPhotoDeleted(photoId)
        }}
        onPhotoRemovedFromWave={(photoId) => {
          setLongPressPhoto(null)
          if (onPhotoRemovedFromWave) onPhotoRemovedFromWave(photoId)
        }}
      />
    )
  })
)

export default QuickActionsModalWrapper
