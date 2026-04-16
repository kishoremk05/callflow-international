import { useEffect, useState, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingCallButtonProps {
  callState: "idle" | "connecting" | "ringing" | "answered";
  duration: number;
  toNumber: string;
  onEndCall: () => void;
  onMuteToggle?: () => void;
  isMuted?: boolean;
}

export const FloatingCallButton = ({
  callState,
  duration,
  toNumber,
  onEndCall,
  onMuteToggle,
  isMuted = false,
}: FloatingCallButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Show only when there's an active call
  const showButton = callState !== "idle";

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get call status text
  const getStatusText = () => {
    switch (callState) {
      case "connecting":
        return "Connecting...";
      case "ringing":
        return "Ringing...";
      case "answered":
        return formatDuration(duration);
      default:
        return "";
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (callState) {
      case "connecting":
        return "bg-yellow-500";
      case "ringing":
        return "bg-blue-500 animate-pulse";
      case "answered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const navigateToMakeCall = () => {
    const targetUrl = "/dashboard#make-a-call";

    if (window.location.pathname === "/dashboard") {
      window.dispatchEvent(new Event("focus-make-call"));
      window.location.hash = "make-a-call";
      return;
    }

    window.location.href = targetUrl;
  };

  const handleEndCallClick = () => {
    try {
      onEndCall();
    } catch (error) {
      console.error("End call handler failed:", error);
    } finally {
      navigateToMakeCall();
    }
  };

  return (
    <AnimatePresence>
      {showButton && (
        <motion.div
          ref={buttonRef}
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-[9999]"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          {isExpanded ? (
            // Expanded view
            <div
              onClick={navigateToMakeCall}
              className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl border border-gray-700 overflow-hidden backdrop-blur-lg cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigateToMakeCall();
                }
              }}
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor()}`}
                  ></div>
                  <span className="text-xs font-medium text-gray-300">
                    {callState === "answered" ? "In Call" : "Calling"}
                  </span>
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Call Info */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {toNumber || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-400">{getStatusText()}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  {/* Mute button */}
                  {onMuteToggle && callState === "answered" && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onMuteToggle();
                      }}
                      className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        isMuted
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {isMuted ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {isMuted ? "Unmute" : "Mute"}
                      </span>
                    </button>
                  )}

                  {/* End Call button */}
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleEndCallClick();
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span className="text-sm">End Call</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Minimized view
            <motion.button
              onClick={() => setIsExpanded(true)}
              className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full shadow-2xl border-2 border-gray-700 flex items-center justify-center group hover:scale-110 transition-transform"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Phone className="w-7 h-7 text-white" />
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()}`}
                ></div>
              </div>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
