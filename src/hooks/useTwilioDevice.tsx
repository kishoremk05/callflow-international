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
  const [callState, setCallState] = useState<
    "idle" | "connecting" | "ringing" | "answered"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const callAnsweredTimeRef = useRef<number | null>(null);
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

          // Handle token expiration
          if (
            error.message?.includes("AccessTokenExpired") ||
            error.message?.includes("20104")
          ) {
            console.log("🔄 Token expired, refreshing...");
            setError("Token expired, refreshing...");
            setIsConnected(false);

            // Destroy current device
            if (newDevice) {
              newDevice.destroy();
            }

            // Reinitialize with new token after a short delay
            setTimeout(() => {
              console.log("♻️ Reinitializing Twilio Device...");
              initializeDevice();
            }, 1000);
          } else {
            setError(error.message);
          }
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
    callerIdNumber?: string,
    retryCount = 0,
  ) => {
    try {
      if (!device) {
        if (retryCount < 2) {
          console.log("🔄 Device not ready, reinitializing...");
          await initializeDevice();
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for device to be ready
          return makeCall(
            toNumber,
            countryCode,
            callerIdType,
            callerIdNumber,
            retryCount + 1,
          );
        }
        throw new Error(
          "Device not initialized. Backend server may not be running.",
        );
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      // Check pricing and balance before initiating call
      const fullNumber = `${countryCode}${toNumber}`;
      const pricingResponse = await fetch(
        `${API_URL}/api/pricing/check-balance`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            toNumber: fullNumber,
            estimatedMinutes: 5,
          }),
        },
      );

      const pricingData = await pricingResponse.json();

      if (pricingData.success && !pricingData.hasSufficientFunds) {
        throw new Error(
          `Insufficient balance. You need $${pricingData.requiredAmount.toFixed(4)} but have $${pricingData.currentBalance.toFixed(2)}. Please add credits to your wallet.`,
        );
      }

      // Show cost preview to user
      if (pricingData.success && pricingData.costEstimate) {
        const { costEstimate } = pricingData;
        console.log(
          `💰 Call to ${costEstimate.countryName} (${costEstimate.phoneType}): $${costEstimate.ratePerMinute.toFixed(4)}/min - Est. cost: $${costEstimate.estimatedCost.toFixed(4)}`,
        );
        toast.info(
          `Call to ${costEstimate.countryName}: $${costEstimate.ratePerMinute.toFixed(4)}/min`,
          { duration: 3000 },
        );
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

      // Store tempCallSid for later linking
      const tempCallSid = data.tempCallSid;

      const callerIdParam = callerIdNumber || (await getPublicNumber());

      const params: any = {
        To: `${countryCode}${toNumber}`,
        CallId: data.callId,
      };

      if (callerIdParam) {
        params.CallerId = callerIdParam;
      }

      try {
        const call = await device.connect({ params });
        setCallState("connecting");
        callStartTimeRef.current = Date.now();

        // Capture and store the Twilio CallSid
        call.on("accept", async () => {
          console.log("Call accepted and connected!");
          const twilioCallSid = call.parameters?.CallSid;

          if (twilioCallSid) {
            console.log(`📞 Twilio CallSid: ${twilioCallSid}`);

            // Update our database with the real Twilio CallSid
            try {
              await fetch(`${API_URL}/api/calls/update-sid`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  callId: data.callId,
                  twilioCallSid: twilioCallSid,
                  tempCallSid: tempCallSid, // Link temp CallSid to real CallSid
                }),
              });
              console.log(
                `✅ Successfully linked call ${data.callId} with CallSid ${twilioCallSid}`,
              );
            } catch (error) {
              console.error("Failed to update call with CallSid:", error);
            }
          } else {
            console.warn("⚠️ No CallSid found in call parameters");
          }

          // Set to answered when call is accepted (connected)
          setCallState("answered");
          callAnsweredTimeRef.current = Date.now();
          toast.success("Call connected!");
        });

        call.on("ringing", () => {
          console.log("Call is ringing");
          setCallState("ringing");
          toast.info("Ringing...");
        });

        call.on("disconnect", async () => {
          console.log("Call disconnected");
          const twilioCallSid = call.parameters?.CallSid;
          const duration = callAnsweredTimeRef.current
            ? Math.floor((Date.now() - callAnsweredTimeRef.current) / 1000)
            : 0;

          await endCallOnBackend(data.callId, duration, twilioCallSid);

          setCurrentCall(null);
          setCallState("idle");
          callStartTimeRef.current = null;
          callAnsweredTimeRef.current = null;

          if (duration > 0) {
            toast.info(
              `Call ended - ${Math.floor(duration / 60)}:${(duration % 60)
                .toString()
                .padStart(2, "0")}`,
            );
          } else {
            toast.info("Call ended - No answer");
          }
        });

        call.on("error", (error) => {
          console.error("Call error:", error);
          toast.error("Call error: " + error.message);
        });

        setCurrentCall(call);
        return call;
      } catch (connectError: any) {
        console.error("Connection error:", connectError);

        // Handle destroyed device - retry
        if (
          connectError.message?.includes("Device has been destroyed") &&
          retryCount < 2
        ) {
          console.log(
            "🔄 Device destroyed during connection, reinitializing...",
          );
          toast.info("Reconnecting...");
          await initializeDevice();
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return makeCall(
            toNumber,
            countryCode,
            callerIdType,
            callerIdNumber,
            retryCount + 1,
          );
        }

        toast.error(connectError.message || "Connection failed");
        throw connectError;
      }
    } catch (error: any) {
      console.error("Failed to make call:", error);

      // Handle destroyed device error
      if (
        error.message?.includes("Device has been destroyed") &&
        retryCount < 2
      ) {
        console.log("🔄 Device destroyed, reinitializing and retrying...");
        toast.info("Reconnecting...");
        await initializeDevice();
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return makeCall(
          toNumber,
          countryCode,
          callerIdType,
          callerIdNumber,
          retryCount + 1,
        );
      }

      toast.error(error.message || "Failed to make call");
      throw error;
    }
  };

  const endCallOnBackend = async (
    callId: string,
    durationSeconds: number,
    twilioCallSid?: string,
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/api/calls/end`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callId,
          durationSeconds,
          twilioCallSid,
        }),
      });

      const result = await response.json();

      // Show cost to user after call ends
      if (result.success && result.billedAmount > 0) {
        const minutes = Math.ceil(durationSeconds / 60);
        const profitInfo =
          result.profitMargin > 0
            ? ` | Profit: $${result.profitMargin.toFixed(4)}`
            : "";

        // Show detailed cost breakdown
        const costMessage = result.costBreakdown
          ? `Call ended: ${result.costBreakdown.billedMinutes} min × $${parseFloat(result.costBreakdown.finalRate).toFixed(4)}/min = $${result.billedAmount.toFixed(4)}${profitInfo}`
          : `Call cost: $${result.billedAmount.toFixed(4)} (${minutes} min)${profitInfo}`;

        toast.success(costMessage, { duration: 6000 });

        // Log detailed breakdown for debugging
        if (result.costBreakdown) {
          console.log("💰 Call Cost Breakdown:", {
            duration: `${durationSeconds}s`,
            billedMinutes: result.costBreakdown.billedMinutes,
            baseRate: `$${parseFloat(result.costBreakdown.baseRate).toFixed(6)}/min`,
            markup: `${result.costBreakdown.markupPercentage}%`,
            finalRate: `$${parseFloat(result.costBreakdown.finalRate).toFixed(6)}/min`,
            twilioBaseCost: `$${result.costBreakdown.twilioBaseCost}`,
            profit: `$${result.costBreakdown.profitAmount}`,
            totalCharged: `$${result.costBreakdown.totalCharged}`,
          });
        }
      }
    } catch (error) {
      console.error("Failed to end call on backend:", error);
    }
  };

  const hangupCall = () => {
    if (currentCall) {
      currentCall.disconnect();
    }
    setCallState("idle");
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

  const markCallAnswered = () => {
    if (currentCall && callState === "ringing") {
      console.log("Call manually marked as answered");
      callAnsweredTimeRef.current = Date.now();
      setCallState("answered");
      toast.success("Call answered - timer started!");
    }
  };

  return {
    device,
    isConnected,
    isInitializing,
    currentCall,
    callState,
    error,
    makeCall,
    hangupCall,
    markCallAnswered,
    getPublicNumber,
    retryConnection,
  };
}
