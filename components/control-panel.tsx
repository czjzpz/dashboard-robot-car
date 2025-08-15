"use client"

import { useState } from "react"

interface ControlPanelProps {
  isAutonomous: boolean
  onAutonomousToggle: (value: boolean) => void
  activeKeys: Set<string>
  sendCommand: (endpoint: string, data?: any) => Promise<any>
  robotMode: number
  setRobotMode: (mode: number) => void
  apiUrl: string
  setApiUrl: (url: string) => void
  cameraUrl: string
  setCameraUrl: (url: string) => void
}

export function ControlPanel({
  isAutonomous,
  onAutonomousToggle,
  sendCommand,
  robotMode,
  setRobotMode,
  apiUrl,
  setApiUrl,
  cameraUrl,
  setCameraUrl,
}: ControlPanelProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl)
  const [tempCameraUrl, setTempCameraUrl] = useState(cameraUrl)
  const [uiMode, setUiMode] = useState<"standby" | "default" | "advanced">("standby")
  const [apiStatus, setApiStatus] = useState<"unknown" | "testing" | "connected" | "failed">("unknown")
  const [cameraStatus, setCameraStatus] = useState<"unknown" | "testing" | "connected" | "failed">("unknown")

  const testApiConnection = async () => {
    setApiStatus("testing")
    try {
      const response = await fetch(`${tempApiUrl}/healthz`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      })
      if (response.ok) {
        setApiStatus("connected")
      } else {
        setApiStatus("failed")
      }
    } catch (error) {
      setApiStatus("failed")
    }
  }

  const testCameraConnection = async () => {
    setCameraStatus("testing")
    try {
      const response = await fetch(tempCameraUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(3000),
      })
      if (response.ok) {
        setCameraStatus("connected")
      } else {
        setCameraStatus("failed")
      }
    } catch (error) {
      setCameraStatus("failed")
    }
  }

  const handleModeChange = (mode: number) => {
    setRobotMode(mode)
    sendCommand("/mode", { mode })
  }

  const handleServo = (angle: number) => {
    sendCommand("/servo", { servo_id: 1, angle })
  }

  const handleLights = (r: number, g: number, b: number) => {
    sendCommand("/lights", { sequence: 1, r, g, b })
  }

  const saveSettings = () => {
    setApiUrl(tempApiUrl)
    setCameraUrl(tempCameraUrl)
    setShowSettings(false)
    // Reset status indicators
    setApiStatus("unknown")
    setCameraStatus("unknown")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-400"
      case "failed":
        return "text-red-400"
      case "testing":
        return "text-yellow-400"
      default:
        return "text-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "OK"
      case "failed":
        return "FAIL"
      case "testing":
        return "TEST"
      default:
        return "UNK"
    }
  }

  return (
    <>
      <div className="h-full bg-gray-900 border border-gray-700 p-2">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-400 font-mono">CTRL</div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-xs font-mono px-2 py-1 border bg-gray-800 border-gray-600 text-gray-300"
          >
            SET
          </button>
        </div>

        <div className="space-y-2">
          <div className="border-b border-gray-700 pb-2 mb-2">
            <div className="text-xs text-gray-500 mb-1">UI MODE</div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setUiMode("standby")}
                className={`text-xs font-mono py-1 px-1 border ${
                  uiMode === "standby" ? "bg-yellow-700 border-yellow-600" : "bg-gray-800 border-gray-600"
                }`}
              >
                STBY
              </button>
              <button
                onClick={() => setUiMode("default")}
                className={`text-xs font-mono py-1 px-1 border ${
                  uiMode === "default" ? "bg-green-700 border-green-600" : "bg-gray-800 border-gray-600"
                }`}
              >
                DEF
              </button>
              <button
                onClick={() => setUiMode("advanced")}
                className={`text-xs font-mono py-1 px-1 border ${
                  uiMode === "advanced" ? "bg-blue-700 border-blue-600" : "bg-gray-800 border-gray-600"
                }`}
              >
                ADV
              </button>
            </div>
          </div>

          {uiMode === "standby" && (
            <div className="text-xs text-gray-500 font-mono text-center py-4">
              STANDBY MODE
              <br />
              SELECT UI MODE
            </div>
          )}

          {(uiMode === "default" || uiMode === "advanced") && (
            <>
              <button
                onClick={() => onAutonomousToggle(false)}
                className={`w-full text-xs font-mono py-2 px-2 border ${
                  !isAutonomous
                    ? "bg-green-700 border-green-600 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-300"
                }`}
              >
                MANUAL
              </button>

              <button
                onClick={() => onAutonomousToggle(true)}
                className={`w-full text-xs font-mono py-2 px-2 border ${
                  isAutonomous
                    ? "bg-green-700 border-green-600 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-300"
                }`}
              >
                AUTO
              </button>

              {uiMode === "advanced" && (
                <>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="text-xs text-gray-500 mb-1">MODE</div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleModeChange(1)}
                        className={`text-xs font-mono py-1 px-1 border ${
                          robotMode === 1 ? "bg-blue-700 border-blue-600" : "bg-gray-800 border-gray-600"
                        }`}
                      >
                        LINE
                      </button>
                      <button
                        onClick={() => handleModeChange(2)}
                        className={`text-xs font-mono py-1 px-1 border ${
                          robotMode === 2 ? "bg-blue-700 border-blue-600" : "bg-gray-800 border-gray-600"
                        }`}
                      >
                        AVOID
                      </button>
                      <button
                        onClick={() => handleModeChange(3)}
                        className={`text-xs font-mono py-1 px-1 border ${
                          robotMode === 3 ? "bg-blue-700 border-blue-600" : "bg-gray-800 border-gray-600"
                        }`}
                      >
                        FOLLOW
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="text-xs text-gray-500 mb-1">SERVO</div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleServo(45)}
                        className="text-xs font-mono py-1 px-1 border bg-gray-800 border-gray-600"
                      >
                        L
                      </button>
                      <button
                        onClick={() => handleServo(90)}
                        className="text-xs font-mono py-1 px-1 border bg-gray-800 border-gray-600"
                      >
                        C
                      </button>
                      <button
                        onClick={() => handleServo(135)}
                        className="text-xs font-mono py-1 px-1 border bg-gray-800 border-gray-600"
                      >
                        R
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="text-xs text-gray-500 mb-1">LED</div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleLights(255, 0, 0)}
                        className="text-xs font-mono py-1 px-1 border bg-red-800 border-red-600"
                      >
                        R
                      </button>
                      <button
                        onClick={() => handleLights(0, 255, 0)}
                        className="text-xs font-mono py-1 px-1 border bg-green-800 border-green-600"
                      >
                        G
                      </button>
                      <button
                        onClick={() => handleLights(0, 0, 255)}
                        className="text-xs font-mono py-1 px-1 border bg-blue-800 border-blue-600"
                      >
                        B
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 p-4 w-96">
            <div className="text-xs text-gray-400 font-mono mb-4">SETTINGS</div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1 font-mono">ROBOT API URL</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempApiUrl}
                    onChange={(e) => setTempApiUrl(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 text-gray-300 text-xs font-mono p-2"
                    placeholder="http://192.168.1.100:8000"
                  />
                  <button
                    onClick={testApiConnection}
                    disabled={apiStatus === "testing"}
                    className="text-xs font-mono px-2 py-2 border bg-gray-800 border-gray-600 text-gray-300 min-w-[60px]"
                  >
                    <span className={getStatusColor(apiStatus)}>{getStatusText(apiStatus)}</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1 font-mono">CAMERA STREAM URL</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempCameraUrl}
                    onChange={(e) => setTempCameraUrl(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 text-gray-300 text-xs font-mono p-2"
                    placeholder="http://192.168.1.101/stream"
                  />
                  <button
                    onClick={testCameraConnection}
                    disabled={cameraStatus === "testing"}
                    className="text-xs font-mono px-2 py-2 border bg-gray-800 border-gray-600 text-gray-300 min-w-[60px]"
                  >
                    <span className={getStatusColor(cameraStatus)}>{getStatusText(cameraStatus)}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={saveSettings}
                className="flex-1 text-xs font-mono py-2 px-2 border bg-green-700 border-green-600 text-white"
              >
                SAVE
              </button>
              <button
                onClick={() => {
                  setShowSettings(false)
                  setTempApiUrl(apiUrl)
                  setTempCameraUrl(cameraUrl)
                  setApiStatus("unknown")
                  setCameraStatus("unknown")
                }}
                className="flex-1 text-xs font-mono py-2 px-2 border bg-gray-800 border-gray-600 text-gray-300"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
