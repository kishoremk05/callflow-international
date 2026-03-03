import { useCallContext } from "@/contexts/CallContext";
import { FloatingCallButton } from "@/components/dashboard/FloatingCallButton";

export const GlobalFloatingCallButton = () => {
  const { callState, callDuration, currentNumber, hangupCall } =
    useCallContext();

  return (
    <FloatingCallButton
      callState={callState}
      duration={callDuration}
      toNumber={currentNumber}
      onEndCall={hangupCall}
    />
  );
};
