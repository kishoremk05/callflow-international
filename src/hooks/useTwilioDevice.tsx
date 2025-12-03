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
  const callStartTimeRef = useRef<number | null>(null);
  const hasShownReadyToast = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Check if user is authenticated before initializing
    const checkAndInitialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && isMounted && !device) {
        initializeDevice();
      }
    };

    checkAndInitialize();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !device && isMounted) {
        initializeDevice();
      } else if (!session && device) {
        device.destroy();
        setDevice(null);
        setIsConnected(false);
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

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, skipping Twilio device initialization");
        return;
      }

      console.log("Fetching Twilio token from:", `${API_URL}/api/twilio/token`);

      const response = await fetch(`${API_URL}/api/twilio/token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Twilio token response:", data);

      if (!data.success) {
        throw new Error(data.error || "Failed to get Twilio token");
      }

      console.log("Creating Twilio Device...");
      const newDevice = new Device(data.token, {
        logLevel: 1,
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      });

      newDevice.on("registered", () => {
        console.log("✅ Twilio Device registered and ready");
        setIsConnected(true);
        // Only show toast once
        if (!hasShownReadyToast.current) {
          toast.success("Ready to make calls!");
          hasShownReadyToast.current = true;
        }
      });

      newDevice.on("error", (error) => {
        console.error("Twilio Device error:", error);
        toast.error("Device error: " + error.message);
      });

      newDevice.on("incoming", (call) => {
        console.log("Incoming call:", call);
        // Handle incoming call if needed
      });

      console.log("Registering Twilio Device...");
      await newDevice.register();
      setDevice(newDevice);
      console.log("Device registration initiated");
    } catch (error: any) {
      console.error("❌ Failed to initialize device:", error);
      // Only show error toast if it's not a session issue
      if (error.message !== "No session found") {
        toast.error("Failed to initialize calling device: " + error.message);
      }
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
        throw new Error("Device not initialized");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      // Initiate call on backend
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

      // Get caller ID to use
      const callerIdParam = callerIdNumber || (await getPublicNumber());

      // Build params object, only include CallerId if it exists
      const params: any = {
        To: `${countryCode}${toNumber}`,
        CallId: data.callId,
      };

      if (callerIdParam) {
        params.CallerId = callerIdParam;
      }

      const call = await device.connect({ params });

      console.log("Call initiated with params:", params);

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

        // End call on backend
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

  return {
    device,
    isConnected,
    isInitializing,
    currentCall,
    makeCall,
    hangupCall,
    getPublicNumber,
  };
}
