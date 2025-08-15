"use client"

import { useState, useEffect, useRef } from "react"

interface CameraFeedProps {
  activeKeys: Set<string>
  isConnected: boolean
  cameraUrl: string
}

export function CameraFeed({ activeKeys, isConnected, cameraUrl }: CameraFeedProps) {
  const [objects, setObjects] = useState(8)
  const [fps, setFps] = useState(30)
  const [cameraConnected, setCameraConnected] = useState(false)
  const [actualFps, setActualFps] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() })

  useEffect(() => {
    if (!cameraUrl || !isConnected) {
      setCameraConnected(false)
      setActualFps(0)
      return
    }

    const img = imgRef.current
    if (!img) return

    const handleLoad = () => {
      setCameraConnected(true)
      // Calculate actual FPS
      const now = Date.now()
      const counter = fpsCounterRef.current
      counter.frames++

      if (now - counter.lastTime >= 1000) {
        setActualFps(Math.round((counter.frames * 1000) / (now - counter.lastTime)))
        counter.frames = 0
        counter.lastTime = now
      }
    }

    const handleError = () => {
      setCameraConnected(false)
      setActualFps(0)
    }

    img.onload = handleLoad
    img.onerror = handleError

    // Add timestamp to prevent caching for MJPEG stream
    const streamUrl = `${cameraUrl}?t=${Date.now()}`
    img.src = streamUrl

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [cameraUrl, isConnected])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected && cameraConnected) {
        setObjects(Math.floor(Math.random() * 5) + 6)
        setFps(actualFps || 28 + Math.floor(Math.random() * 5))
      } else {
        setObjects(0)
        setFps(0)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isConnected, cameraConnected, actualFps])

  return (
    <div className="relative w-full h-full bg-black">
      <div className="absolute inset-0 bg-gray-800">
        {cameraUrl && isConnected ? (
          <img
            ref={imgRef}
            className="w-full h-full object-contain"
            alt="Robot Camera Feed"
            style={{ display: cameraConnected ? "block" : "none" }}
          />
        ) : null}

        {(!cameraConnected || !isConnected) && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 font-mono text-lg mb-2">
                {!isConnected ? "API DISCONNECTED" : "CAMERA OFFLINE"}
              </div>
              <div className="text-gray-500 font-mono text-xs">
                {!isConnected ? "Robot API connection lost" : "Camera stream unavailable"}
              </div>
            </div>
          </div>
        )}
      </div>

      {isConnected && cameraConnected && (
        <>
          <div className="absolute bottom-1 left-1 text-xs text-green-400 font-mono bg-black/50 px-1">
            {fps}fps {objects}obj
          </div>

          <div className="absolute top-1 right-1 text-xs font-mono bg-black/50 px-1">
            <span className="text-green-400">LIVE</span>
          </div>
        </>
      )}
    </div>
  )
}
