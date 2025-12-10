import { useState, useEffect, useRef } from "react";
import { Device, Call } from "@twilio/voice-sdk";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useTwilioDevice() {
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const hasShownReadyToast = useRef(false);
  const initAttempted = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const checkAndInitialize = async () => {
      // Only attempt initialization once
      if (initAttempted.current) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && isMounted && !device) {
        initAttempted.current = true;
        initializeDevice();
      }
    };

    checkAndInitialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !device && isMounted && !initAttempted.current) {
        initAttempted.current = true;
        initializeDevice();
      } else if (!session && device) {
        device.destroy();
        setDevice(null);
        setIsConnected(false);
        initAttempted.current = false;
      }
    });

    return () => {
      isMounted = false;
      device?.destroy();
      subscription.unsubscribe();
    };
  }, []);

  const initializeDevice = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, skipping Twilio device initialization");
        setIsInitializing(false);
        return;
      }

      // Silent fetch - don't show error toast for connection issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const response = await fetch(`${API_URL}/api/twilio/token`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to get Twilio token");
        }

        const newDevice = new Device(data.token, {
          logLevel: 0, // Suppress Twilio SDK logs
          codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        });

        newDevice.on("registered", () => {
          console.log("✅ Twilio Device registered and ready");
          setIsConnected(true);
          setError(null);
          if (!hasShownReadyToast.current) {
            toast.success("Ready to make calls!");
            hasShownReadyToast.current = true;
          }
        });

        newDevice.on("error", (error) => {
          console.error("Twilio Device error:", error);
          setError(error.message);
        });

        newDevice.on("incoming", (call) => {
          console.log("Incoming call:", call);
        });

        await newDevice.register();
        setDevice(newDevice);
      } catch (fetchError: any) {
        // Silently handle fetch errors (backend not running)
        if (fetchError.name === "AbortError") {
          setError("Backend server timeout");
        } else if (fetchError.message?.includes("Failed to fetch")) {
          setError("Backend server not available");
        } else {
          setError(fetchError.message);
        }
        setIsConnected(false);
      }
    } catch (error: any) {
      setError(error.message);
      setIsConnected(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const makeCall = async (
    toNumber: string,
    countryCode: string,
    callerIdType: string,
    callerIdNumber?: string
  ) => {
    try {
      if (!device) {
        throw new Error("Device not initialized. Backend server may not be running.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      const response = await fetch(`${API_URL}/api/calls/initiate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toNumber,
          toCountryCode: countryCode,
          callerIdType,
          callerIdNumber,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to initiate call");
      }

      const callerIdParam = callerIdNumber || (await getPublicNumber());

      const params: any = {
        To: `${countryCode}${toNumber}`,
        CallId: data.callId,
      };

      if (callerIdParam) {
        params.CallerId = callerIdParam;
      }

      const call = await device.connect({ params });

      call.on("accept", () => {
        console.log("Call accepted");
        callStartTimeRef.current = Date.now();
        toast.success("Call connected!");
      });

      call.on("disconnect", async () => {
        console.log("Call disconnected");
        const duration = callStartTimeRef.current
          ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
          : 0;

        await endCallOnBackend(data.callId, duration);

        setCurrentCall(null);
        callStartTimeRef.current = null;
        toast.info("Call ended");
      });

      call.on("error", (error) => {
        console.error("Call error:", error);
        toast.error("Call error: " + error.message);
      });

      setCurrentCall(call);
      return call;
    } catch (error: any) {
      console.error("Failed to make call:", error);
      toast.error(error.message || "Failed to make call");
      throw error;
    }
  };

  const endCallOnBackend = async (callId: string, durationSeconds: number) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`${API_URL}/api/calls/end`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callId,
          durationSeconds,
        }),
      });
    } catch (error) {
      console.error("Failed to end call on backend:", error);
    }
  };

  const hangupCall = () => {
    if (currentCall) {
      currentCall.disconnect();
    }
  };

  const getPublicNumber = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      const response = await fetch(`${API_URL}/api/twilio/public-number`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      return data.success ? data.number : null;
    } catch (error) {
      console.error("Failed to get public number:", error);
      return null;
    }
  };

  const retryConnection = () => {
    initAttempted.current = false;
    setError(null);
    initializeDevice();
  };

  return {
    device,
    isConnected,
    isInitializing,
    currentCall,
    error,
    makeCall,
    hangupCall,
    getPublicNumber,
    retryConnection,
  };
}
