"use client"

import { useState, useEffect } from "react"

interface PerformancePanelProps {
  isConnected: boolean
  lastMessage: string
  robotMode: number
}

export function PerformancePanel({ isConnected, lastMessage, robotMode }: PerformancePanelProps) {
  const [metrics, setMetrics] = useState({
    speed: 12,
    cpu: 45,
    gpu: 78,
    bat: 87,
    temp: 42,
    gyroX: 0,
    gyroY: 0,
    gyroZ: 0,
    wheelFL: 0,
    wheelFR: 0,
    wheelBL: 0,
    wheelBR: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setMetrics((prev) => ({
          speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 2),
          cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
          gpu: Math.max(0, Math.min(100, prev.gpu + (Math.random() - 0.5) * 8)),
          bat: Math.max(0, Math.min(100, prev.bat - 0.1)),
          temp: Math.max(35, Math.min(65, prev.temp + (Math.random() - 0.5) * 2)),
          gyroX: Math.max(-180, Math.min(180, prev.gyroX + (Math.random() - 0.5) * 5)),
          gyroY: Math.max(-90, Math.min(90, prev.gyroY + (Math.random() - 0.5) * 3)),
          gyroZ: Math.max(-180, Math.min(180, prev.gyroZ + (Math.random() - 0.5) * 4)),
          wheelFL: Math.max(-10, Math.min(10, prev.wheelFL + (Math.random() - 0.5) * 2)),
          wheelFR: Math.max(-10, Math.min(10, prev.wheelFR + (Math.random() - 0.5) * 2)),
          wheelBL: Math.max(-10, Math.min(10, prev.wheelBL + (Math.random() - 0.5) * 2)),
          wheelBR: Math.max(-10, Math.min(10, prev.wheelBR + (Math.random() - 0.5) * 2)),
        }))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isConnected])

  const getModeText = (mode: number) => {
    switch (mode) {
      case 1:
        return "LINE"
      case 2:
        return "AVOID"
      case 3:
        return "FOLLOW"
      default:
        return "MANUAL"
    }
  }

  return (
    <div className="h-full bg-gray-900 border border-gray-700 p-2">
      <div className="text-xs text-gray-400 mb-2 font-mono">STATS</div>

      <div className="space-y-1 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">con</span>
          <span className={isConnected ? "text-green-400" : "text-red-400"}>{isConnected ? "OK" : "ERR"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">mode</span>
          <span className="text-green-400">{getModeText(robotMode)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">spd</span>
          <span className="text-green-400">{metrics.speed.toFixed(1)}km/h</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">cpu</span>
          <span className="text-green-400">{metrics.cpu.toFixed(0)}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">gpu</span>
          <span className="text-green-400">{metrics.gpu.toFixed(0)}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">bat</span>
          <span className={metrics.bat > 20 ? "text-green-400" : "text-red-400"}>{metrics.bat.toFixed(0)}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">tmp</span>
          <span className="text-green-400">{metrics.temp.toFixed(0)}°C</span>
        </div>

        <div className="border-t border-gray-700 pt-1 mt-2">
          <div className="text-xs text-gray-500 mb-1">GYRO</div>
          <div className="flex justify-between">
            <span className="text-gray-400">x</span>
            <span className="text-green-400">{metrics.gyroX.toFixed(1)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">y</span>
            <span className="text-green-400">{metrics.gyroY.toFixed(1)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">z</span>
            <span className="text-green-400">{metrics.gyroZ.toFixed(1)}°</span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-1 mt-2">
          <div className="text-xs text-gray-500 mb-1">WHEEL</div>
          <div className="flex justify-between">
            <span className="text-gray-400">fl</span>
            <span className="text-green-400">{metrics.wheelFL.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">fr</span>
            <span className="text-green-400">{metrics.wheelFR.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">bl</span>
            <span className="text-green-400">{metrics.wheelBL.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">br</span>
            <span className="text-green-400">{metrics.wheelBR.toFixed(1)}</span>
          </div>
        </div>

        {lastMessage && (
          <div className="border-t border-gray-700 pt-1 mt-2">
            <div className="text-xs text-gray-500 mb-1">MSG</div>
            <div className="text-xs text-green-400 break-all">{lastMessage.slice(0, 20)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
