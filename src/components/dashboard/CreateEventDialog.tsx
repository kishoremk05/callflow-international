import { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventData) => Promise<void>;
  loading?: boolean;
}

export interface CreateEventData {
  summary: string;
  description: string;
  location: string;
  start: string; // ISO 8601 format
  end: string; // ISO 8601 format
  addConference: boolean;
  attendees: string[];
}

export function CreateEventDialog({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: CreateEventDialogProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    summary: "",
    description: "",
    location: "",
    start: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
    end: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // 1 hour later
    addConference: false,
    attendees: [],
  });
  const [attendeeInput, setAttendeeInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as any;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError(null);
  };

  const handleAddAttendee = () => {
    const email = attendeeInput.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (formData.attendees.includes(email)) {
      setError("This attendee is already added");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      attendees: [...prev.attendees, email],
    }));
    setAttendeeInput("");
    setError(null);
  };

  const handleRemoveAttendee = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((a) => a !== email),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!formData.summary.trim()) {
      setError("Event title is required");
      return;
    }

    if (!formData.start || !formData.end) {
      setError("Start and end times are required");
      return;
    }

    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);

    if (endDate <= startDate) {
      setError("End time must be after start time");
      return;
    }

    // Prepare event data with proper ISO format
    const eventData = {
      summary: formData.summary.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      addConference: formData.addConference,
      attendees: formData.attendees,
    };

    try {
      await onSubmit(eventData);
      // Reset form on success
      setFormData({
        summary: "",
        description: "",
        location: "",
        start: new Date().toISOString().slice(0, 16),
        end: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        addConference: false,
        attendees: [],
      });
      setAttendeeInput("");
      onClose();
    } catch (err) {
      // Error is handled by parent component
    }
  };

  if (!isOpen) return null;

  const startDate = new Date(formData.start);
  const endDate = new Date(formData.end);
  const isValidDate = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0891b2]/10 to-transparent border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1a365d]">Create Event</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Title *
            </label>
            <Input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Meeting, Presentation, etc."
              disabled={loading}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add details about your event..."
              disabled={loading}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2]"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Conference Room A or Zoom Link"
              disabled={loading}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <Input
                type="datetime-local"
                name="start"
                value={formData.start}
                onChange={handleInputChange}
                disabled={loading}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date & Time *
              </label>
              <Input
                type="datetime-local"
                name="end"
                value={formData.end}
                onChange={handleInputChange}
                disabled={loading}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* Time display */}
          {isValidDate && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              <p>
                {format(startDate, "EEEE, MMMM d, yyyy")} from{" "}
                <strong>{format(startDate, "h:mm a")}</strong> to{" "}
                <strong>{format(endDate, "h:mm a")}</strong>
              </p>
            </div>
          )}

          {/* Add conference */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="addConference"
              name="addConference"
              checked={formData.addConference}
              onChange={handleInputChange}
              disabled={loading}
              className="w-4 h-4 rounded border-gray-300 text-[#0891b2] focus:ring-[#0891b2]"
            />
            <label
              htmlFor="addConference"
              className="text-sm font-medium text-gray-700 flex-1"
            >
              Add Google Meet video conference
            </label>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add Attendees
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                type="email"
                value={attendeeInput}
                onChange={(e) => {
                  setAttendeeInput(e.target.value);
                  setError(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAttendee();
                  }
                }}
                placeholder="someone@example.com"
                disabled={loading}
                className="bg-gray-50 border-gray-200 flex-1"
              />
              <Button
                type="button"
                onClick={handleAddAttendee}
                disabled={loading || !attendeeInput.trim()}
                className="bg-[#0891b2] hover:bg-[#0e7490] text-white px-4"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Attendees list */}
            {formData.attendees.length > 0 && (
              <div className="space-y-2">
                {formData.attendees.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-blue-700">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(email)}
                      disabled={loading}
                      className="text-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0891b2] hover:bg-[#0e7490] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
