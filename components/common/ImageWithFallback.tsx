'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
}

export default function ImageWithFallback({
  src,
  fallbackSrc = '/images/placeholder.jpg',
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setImageSrc(fallbackSrc)
      setHasError(true)
    }
  }

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={handleError}
    />
  )
}
