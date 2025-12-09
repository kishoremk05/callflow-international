import { useState } from "react";
import { Phone, Delete, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dialPad = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
];

const countryCodes = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
];

interface DialerProps {
  onCall?: (number: string, countryCode: string) => void;
  disabled?: boolean;
}

export function Dialer({ onCall, disabled }: DialerProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");

  const handleDigitPress = (digit: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (phoneNumber.length >= 7 && onCall) {
      onCall(phoneNumber, countryCode);
    }
  };

  const formatPhoneNumber = (num: string) => {
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
  };

  return (
    <Card className="border-2 border-orange-100 bg-white rounded-2xl shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Make a Call
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger className="w-28 border-orange-200 bg-gradient-to-br from-orange-50 to-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500/60" />
            <input
              type="text"
              value={formatPhoneNumber(phoneNumber)}
              readOnly
              placeholder="Enter number"
              className="w-full h-10 pl-10 pr-10 text-lg font-mono bg-orange-50 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 transition-all"
            />
            {phoneNumber && (
              <button
                onClick={handleDelete}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Delete className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {dialPad.map(({ digit, letters }) => (
            <button
              key={digit}
              onClick={() => handleDigitPress(digit)}
              className="group flex flex-col items-center justify-center h-16 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 hover:border-orange-300 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-2xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                {digit}
              </span>
              {letters && (
                <span className="text-[10px] text-gray-500 tracking-widest">
                  {letters}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button
          onClick={handleCall}
          disabled={phoneNumber.length < 7 || disabled}
          className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold"
          size="lg"
        >
          <Phone className="w-5 h-5 mr-2" />
          Call {countryCode} {formatPhoneNumber(phoneNumber)}
        </Button>
      </CardContent>
    </Card>
  );
}
