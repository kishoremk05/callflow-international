import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";

interface CallContextType {
  callState: "idle" | "connecting" | "ringing" | "answered";
  currentNumber: string;
  currentCountryCode: string;
  callDuration: number;
  isConnected: boolean;
  isInitializing: boolean;
  currentCall: any;
  makeCall: (
    toNumber: string,
    countryCode: string,
    callerIdType: string,
    callerIdNumber?: string,
    retryCount?: number,
  ) => Promise<any>;
  hangupCall: () => void;
  markCallAnswered: () => void;
  error: string | null;
  retryConnection: () => void;
  setCurrentNumber: (number: string) => void;
  setCurrentCountryCode: (code: string) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within a CallProvider");
  }
  return context;
};

interface CallProviderProps {
  children: ReactNode;
}

export const CallProvider = ({ children }: CallProviderProps) => {
  const twilioDevice = useTwilioDevice();
  const [currentNumber, setCurrentNumber] = useState("");
  const [currentCountryCode, setCurrentCountryCode] = useState("");
  const [callDuration, setCallDuration] = useState(0);

  // Update call duration when call is answered
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (twilioDevice.callState === "answered") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
      if (twilioDevice.callState === "idle") {
        setCallDuration(0);
        setCurrentNumber("");
        setCurrentCountryCode("");
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [twilioDevice.callState]);

  const value: CallContextType = {
    callState: twilioDevice.callState,
    currentNumber,
    currentCountryCode,
    callDuration,
    isConnected: twilioDevice.isConnected,
    isInitializing: twilioDevice.isInitializing,
    currentCall: twilioDevice.currentCall,
    makeCall: twilioDevice.makeCall,
    hangupCall: twilioDevice.hangupCall,
    markCallAnswered: twilioDevice.markCallAnswered,
    error: twilioDevice.error,
    retryConnection: twilioDevice.retryConnection,
    setCurrentNumber,
    setCurrentCountryCode,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
