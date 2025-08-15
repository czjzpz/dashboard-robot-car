"use client"

interface PerformancePanelProps {
  isConnected: boolean
  lastMessage: string
  robotMode: number
}

export function PerformancePanel({ isConnected, lastMessage, robotMode }: PerformancePanelProps) {
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
