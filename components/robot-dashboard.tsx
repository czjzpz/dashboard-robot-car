"use client"

import { useState, useEffect, useCallback } from "react"
import { CameraFeed } from "./camera-feed"
import { PerformancePanel } from "./performance-panel"
import { ControlPanel } from "./control-panel"

interface RobotResponse {
  sent: any
  last_rx: string
}

interface HealthStatus {
  esp_host: string
  esp_port: number
  connected: boolean
  last_rx: string
}

export function RobotDashboard() {
  const [isAutonomous, setIsAutonomous] = useState(false)
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState("")
  const [robotMode, setRobotMode] = useState(1)
  const [apiUrl, setApiUrl] = useState("http://localhost:8000")
  const [cameraUrl, setCameraUrl] = useState("http://192.168.4.1:81/stream")

  const sendCommand = async (endpoint: string, data: any = {}) => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: endpoint === "/healthz" ? "GET" : "POST",
        headers: { "Content-Type": "application/json" },
        body: endpoint === "/healthz" ? undefined : JSON.stringify(data),
      })
      const result: RobotResponse = await response.json()
      setLastMessage(result.last_rx || "")
      return result
    } catch (error) {
      console.error("API Error:", error)
      setIsConnected(false)
    }
  }

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiUrl}/healthz`)
        const health: HealthStatus = await response.json()
        setIsConnected(health.connected)
        setLastMessage(health.last_rx)
      } catch {
        setIsConnected(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 2000)
    return () => clearInterval(interval)
  }, [apiUrl])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isAutonomous) return

      const key = event.key.toLowerCase()
      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright", " "].includes(key)) {
        event.preventDefault()
        setActiveKeys((prev) => new Set(prev).add(key))

        if (key === "w" || key === "arrowup") {
          sendCommand("/move", { direction: "forward", speed: 140 })
        } else if (key === "s" || key === "arrowdown") {
          sendCommand("/move", { direction: "back", speed: 140 })
        } else if (key === "a" || key === "arrowleft") {
          sendCommand("/move", { direction: "left", speed: 140 })
        } else if (key === "d" || key === "arrowright") {
          sendCommand("/move", { direction: "right", speed: 140 })
        } else if (key === " ") {
          sendCommand("/stop", {})
        }
      }
    },
    [isAutonomous],
  )

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright", " "].includes(key)) {
      event.preventDefault()
      setActiveKeys((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })

      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
        sendCommand("/stop", {})
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return (
    <div className="h-screen bg-black text-white p-2 grid grid-cols-4 gap-2 relative">

      {/* Camera Feed - Centered, takes most space */}
      <div className="col-span-3 bg-gray-900 border border-gray-700">
        <CameraFeed activeKeys={activeKeys} isConnected={isConnected} cameraUrl={cameraUrl} />
      </div>

      {/* Right Panel - Minimal stats and controls */}
      <div className="flex flex-col gap-2">
        <div className="flex-1">
          <PerformancePanel isConnected={isConnected} lastMessage={lastMessage} robotMode={robotMode} />
        </div>
        <div className="flex-1">
          <ControlPanel
            isAutonomous={isAutonomous}
            onAutonomousToggle={setIsAutonomous}
            activeKeys={activeKeys}
            sendCommand={sendCommand}
            robotMode={robotMode}
            setRobotMode={setRobotMode}
            apiUrl={apiUrl}
            setApiUrl={setApiUrl}
            cameraUrl={cameraUrl}
            setCameraUrl={setCameraUrl}
          />
        </div>
      </div>
    </div>
  )
}
