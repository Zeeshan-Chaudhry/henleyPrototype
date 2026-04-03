"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LeadData {
  conversation_complete: boolean;
  qualified: boolean;
  lead: {
    name: string;
    email: string;
    phone: string;
    address: string;
    project_type: string;
    scope: string;
    budget_range: string;
    timeline: string;
    referral_source: string;
    why_henley: string;
  };
  qualification: {
    budget_meets_minimum: boolean;
    in_service_area: boolean;
    valid_project_type: boolean;
    timeline_within_12_months: boolean;
  };
  disqualification_reason: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (started && !isLoading) {
      inputRef.current?.focus();
    }
  }, [started, isLoading]);

  const startConversation = async () => {
    setStarted(true);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hi" }],
        }),
      });

      const data = await res.json();
      setMessages([
        { role: "user", content: "Hi" },
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages([
        { role: "user", content: "Hi" },
        {
          role: "assistant",
          content:
            "Hey! Thanks for reaching out to Henley Contracting. I'd love to help get you started. What's your name?",
        },
      ]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Can you try again?",
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.message },
        ]);

        if (data.leadData) {
          setLeadData(data.leadData);
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Can you try again?",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
    setLeadData(null);
    setStarted(false);
    setIsLoading(false);
  };

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
        <div className="max-w-2xl text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-[#E87722] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">H</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Henley Contracting
            </h1>
            <p className="text-lg text-gray-500">
              AI Lead Intake System
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              How it works
            </h2>
            <div className="text-left space-y-3 text-gray-600">
              <div className="flex gap-3">
                <span className="text-[#E87722] font-bold shrink-0">1.</span>
                <p>
                  A lead messages Henley on WhatsApp (simulated here as a chat)
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#E87722] font-bold shrink-0">2.</span>
                <p>
                  The AI has a natural conversation to collect project details,
                  budget, timeline, and more
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#E87722] font-bold shrink-0">3.</span>
                <p>
                  It qualifies the lead against Henley&apos;s thresholds
                  automatically
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-[#E87722] font-bold shrink-0">4.</span>
                <p>
                  A structured lead summary is generated, ready to push to
                  HubSpot and Buildertrend
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={startConversation}
            className="bg-[#E87722] hover:bg-[#d06a1e] text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors cursor-pointer shadow-md"
          >
            Start Demo Conversation
          </button>

          <p className="mt-4 text-sm text-gray-400">
            Try being a lead. Say anything. See how the AI handles it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Chat panel */}
      <div
        className={`flex flex-col ${leadData ? "lg:w-3/5" : "w-full max-w-3xl mx-auto"} h-screen`}
      >
        {/* Chat header */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-base">Henley Contracting</h1>
            <p className="text-xs text-green-200">
              {isLoading ? "typing..." : "online"}
            </p>
          </div>
          <button
            onClick={resetChat}
            className="text-xs bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Chat messages */}
        <div
          className="flex-1 overflow-y-auto chat-scroll px-4 py-4 space-y-2"
          style={{ backgroundColor: "#e5ddd5" }}
        >
          <div className="flex justify-center mb-4">
            <span className="bg-white/80 text-gray-500 text-xs px-3 py-1 rounded-lg shadow-sm">
              Today
            </span>
          </div>

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} message-appear`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 shadow-sm ${
                  msg.role === "user" ? "bubble-ai" : "bubble-lead"
                }`}
              >
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p className="text-[10px] text-gray-400 text-right mt-1">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start message-appear">
              <div className="bubble-lead px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm text-gray-800 outline-none shadow-sm disabled:opacity-50 placeholder-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-[#075e54] hover:bg-[#064d44] rounded-full flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Lead summary panel */}
      {leadData && (
        <div className="lg:w-2/5 bg-white border-l border-gray-200 h-screen overflow-y-auto summary-appear">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-3 h-3 rounded-full ${leadData.qualified ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <h2 className="text-xl font-bold text-gray-900">
                Lead Summary
              </h2>
              <span
                className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${
                  leadData.qualified
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {leadData.qualified ? "QUALIFIED" : "NOT QUALIFIED"}
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-6">
              This data would be pushed to HubSpot + Buildertrend automatically
            </p>

            <div className="space-y-4">
              <SummarySection title="Contact Information">
                <SummaryField label="Name" value={leadData.lead.name} />
                <SummaryField label="Email" value={leadData.lead.email} />
                <SummaryField label="Phone" value={leadData.lead.phone} />
                <SummaryField label="Address" value={leadData.lead.address} />
              </SummarySection>

              <SummarySection title="Project Details">
                <SummaryField
                  label="Project Type"
                  value={leadData.lead.project_type}
                />
                <SummaryField label="Scope" value={leadData.lead.scope} />
                <SummaryField
                  label="Budget Range"
                  value={leadData.lead.budget_range}
                />
                <SummaryField
                  label="Timeline"
                  value={leadData.lead.timeline}
                />
              </SummarySection>

              <SummarySection title="Source">
                <SummaryField
                  label="How they found us"
                  value={leadData.lead.referral_source}
                />
                <SummaryField
                  label="Why Henley"
                  value={leadData.lead.why_henley}
                />
              </SummarySection>

              <SummarySection title="Qualification Checks">
                <QualCheck
                  label="Budget above minimum ($30K)"
                  passed={leadData.qualification.budget_meets_minimum}
                />
                <QualCheck
                  label="In service area (GTA)"
                  passed={leadData.qualification.in_service_area}
                />
                <QualCheck
                  label="Valid project type"
                  passed={leadData.qualification.valid_project_type}
                />
                <QualCheck
                  label="Timeline within 12 months"
                  passed={leadData.qualification.timeline_within_12_months}
                />
              </SummarySection>

              {leadData.disqualification_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">
                    <span className="font-semibold">Reason: </span>
                    {leadData.disqualification_reason}
                  </p>
                </div>
              )}

              <div className="bg-[#FFF8F0] border border-[#E87722]/20 rounded-lg p-4">
                <h3 className="font-semibold text-[#E87722] text-sm mb-2">
                  What happens next in production
                </h3>
                <ul className="text-xs text-gray-600 space-y-1.5">
                  <li>1. This data gets pushed to HubSpot (contact + deal)</li>
                  <li>2. Lead books via Calendly link sent in WhatsApp</li>
                  <li>3. Briefing packet auto-generated and emailed to team</li>
                  <li>4. Data synced to Buildertrend project record</li>
                  <li>5. Team walks onto site with full context</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800">{value || "Not provided"}</p>
    </div>
  );
}

function QualCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${passed ? "text-green-500" : "text-red-500"}`}>
        {passed ? "Pass" : "Fail"}
      </span>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}
