'use client'

import { useState } from 'react'
import { GlobalLoader } from './GlobalLoader'
import { Button } from './button'

export function LoadingTest() {
  const [showLoader, setShowLoader] = useState(false)

  const testLoader = () => {
    setShowLoader(true)
    setTimeout(() => setShowLoader(false), 3000)
  }

  return (
    <div className="p-4">
      <Button onClick={testLoader}>Test Global Loader</Button>
      <GlobalLoader isVisible={showLoader} />
    </div>
  )
}