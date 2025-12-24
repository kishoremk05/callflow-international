import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CallQueueUploadProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (queueId: string) => void;
}

export function CallQueueUpload({
  open,
  onClose,
  onSuccess,
}: CallQueueUploadProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ name: string; number: string }[]>(
    []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseXLSX = (arrayBuffer: ArrayBuffer) => {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

    const contacts: { name: string; number: string }[] = [];

    // Skip header row (first row)
    const startIndex = 1;

    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      if (row.length >= 2) {
        const name = String(row[0] || "").trim();
        const number = String(row[1] || "")
          .trim()
          .replace(/\s+/g, "");

        // Validate phone number (basic validation)
        if (name && number.match(/^\+?[0-9]{10,15}$/)) {
          contacts.push({ name, number });
        }
      } else if (row.length === 1) {
        // Just number, no name
        const number = String(row[0] || "")
          .trim()
          .replace(/\s+/g, "");
        if (number.match(/^\+?[0-9]{10,15}$/)) {
          contacts.push({ name: "Unknown", number });
        }
      }
    }

    return contacts;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx")) {
      toast.error("Please select an XLSX file");
      return;
    }

    setFile(selectedFile);

    // Read and preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const contacts = parseXLSX(arrayBuffer);

      if (contacts.length === 0) {
        toast.error("No valid contacts found in XLSX");
        setFile(null);
        return;
      }

      setPreview(contacts.slice(0, 5)); // Show first 5 as preview
      toast.success(`Found ${contacts.length} contacts`);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please login to continue");
        setLoading(false);
        return;
      }

      // Read file
      const reader = new FileReader();

      reader.onerror = () => {
        toast.error("Failed to read file");
        setLoading(false);
      };

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const contacts = parseXLSX(arrayBuffer);

          if (contacts.length === 0) {
            toast.error("No valid contacts found");
            setLoading(false);
            return;
          }

          console.log("Uploading contacts:", contacts);

          // Send to backend
          const response = await fetch(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:5000"
            }/api/call-queue/upload`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ contacts }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error("Upload failed:", data);
            throw new Error(data.error || "Failed to upload queue");
          }

          console.log("Queue created:", data);
          toast.success(`Call queue created with ${contacts.length} contacts!`);
          onSuccess(data.queueId);
          setLoading(false);
          onClose();
        } catch (error: any) {
          console.error("Error uploading queue:", error);
          toast.error(error.message || "Failed to upload");
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error("Error in upload handler:", error);
      toast.error(error.message || "Failed to upload");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1a365d]">
            <Upload className="w-5 h-5 text-[#0891b2]" />
            Upload Call Queue
          </DialogTitle>
          <DialogDescription>
            Upload an XLSX file with customer names and phone numbers to create
            a call queue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* XLSX Format Info */}
          <Card className="border-[#0891b2]/20 bg-[#0891b2]/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#0891b2] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#1a365d] mb-1">
                    XLSX Format (Excel)
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Your Excel file should have 2 columns: Name, Number
                  </p>
                  <div className="bg-white/50 p-2 rounded text-xs font-mono">
                    <strong>Column A: Name | Column B: Number</strong>
                    <br />
                    John Doe | +916381179491
                    <br />
                    Jane Smith | +919876543210
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-[#0891b2] hover:bg-[#0891b2]/5"
            >
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-[#0891b2]" />
                <div>
                  <p className="font-medium text-[#1a365d]">
                    {file ? file.name : "Choose XLSX File"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Click to browse or drag and drop
                  </p>
                </div>
              </div>
            </Button>

            {/* Preview */}
            {preview.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-[#1a365d] mb-3">
                    Preview (first 5 contacts):
                  </p>
                  <div className="space-y-2">
                    {preview.map((contact, index) => {
                      // Format number to show country code separately
                      const formatNumber = (num: string) => {
                        const raw = num.replace(/[\s+]/g, "");

                        // India: 91 + 10 digits = 12 total
                        if (raw.startsWith("91") && raw.length === 12) {
                          return "+91 " + raw.substring(2);
                        }
                        // US/Canada: 1 + 10 digits = 11 total
                        else if (raw.startsWith("1") && raw.length === 11) {
                          return "+1 " + raw.substring(1);
                        }
                        // UK: 44 + 10 digits = 12 total
                        else if (raw.startsWith("44") && raw.length === 12) {
                          return "+44 " + raw.substring(2);
                        }
                        // UAE: 971 + 9 digits = 12 total
                        else if (raw.startsWith("971") && raw.length === 12) {
                          return "+971 " + raw.substring(3);
                        }
                        // Already has +
                        else if (num.includes("+")) {
                          return num;
                        }
                        // 10 digits only - assume India
                        else if (raw.length === 10) {
                          return "+91 " + raw;
                        }
                        // Default: first 2 digits as country code
                        else if (raw.length > 10) {
                          return (
                            "+" + raw.substring(0, 2) + " " + raw.substring(2)
                          );
                        }
                        return num;
                      };

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">{contact.name}</span>
                          <span className="text-gray-600 font-mono">
                            {formatNumber(contact.number)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:from-[#0e7490] hover:to-[#0891b2]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Create Queue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
