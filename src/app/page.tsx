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

  const streamResponse = async (
    apiMessages: Message[],
    beforeMessages: Message[]
  ) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (!res.ok || !res.body) throw new Error("Stream failed");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let streamedText = "";
    let buffer = "";

    setMessages([...beforeMessages, { role: "assistant", content: "" }]);
    setIsLoading(false);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = JSON.parse(line.slice(6));

        if (json.type === "delta") {
          streamedText += json.text;
          const display = streamedText
            .replace(/```json:lead_data[\s\S]*$/, "")
            .trim();
          setMessages([
            ...beforeMessages,
            { role: "assistant", content: display },
          ]);
        } else if (json.type === "done") {
          const finalText = json.displayText || streamedText;
          setMessages([
            ...beforeMessages,
            { role: "assistant", content: finalText },
          ]);
          if (json.leadData) {
            setLeadData(json.leadData);
          }
        }
      }
    }
  };

  const startConversation = async () => {
    setStarted(true);
    setIsLoading(true);

    const initial: Message[] = [{ role: "user", content: "Hi" }];

    try {
      await streamResponse(initial, initial);
    } catch {
      setMessages([
        ...initial,
        {
          role: "assistant",
          content:
            "Hey! Thanks for reaching out to Henley Contracting. What's your name?",
        },
      ]);
      setIsLoading(false);
    }
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
      await streamResponse(newMessages, newMessages);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Can you try again?",
        },
      ]);
      setIsLoading(false);
    }
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

  // ─── Landing Page ───
  if (!started) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white overflow-hidden relative">
        {/* Floating gradient orbs */}
        <div className="orb-1 absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-[#E87722]/20 rounded-full blur-[120px]" />
        <div className="orb-2 absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] bg-[#E87722]/10 rounded-full blur-[100px]" />

        {/* Nav */}
        <nav className="nav-animate relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E87722] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Henley Contracting
            </span>
          </div>
          <span className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            Prototype Demo
          </span>
        </nav>

        {/* Hero */}
        <div className="relative z-10 max-w-6xl mx-auto px-8 pt-16 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <div className="hero-badge pill-shimmer inline-flex items-center gap-2 border border-[#E87722]/20 rounded-full px-4 py-1.5 mb-6">
                <div className="w-2 h-2 bg-[#E87722] rounded-full animate-pulse" />
                <span className="text-xs text-[#E87722] font-medium">
                  AI-Powered Lead Intake
                </span>
              </div>

              <h1 className="hero-title text-5xl font-bold leading-tight tracking-tight mb-6">
                Every lead, qualified
                <br />
                <span className="text-[#E87722]">before you show up.</span>
              </h1>

              <p className="hero-desc text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                An AI assistant that talks to your leads on WhatsApp, collects
                project details naturally, qualifies them against your
                thresholds, and builds a briefing packet so your team walks onto
                every site ready.
              </p>

              <button
                onClick={startConversation}
                className="hero-cta cta-glow group bg-[#E87722] hover:bg-[#d06a1e] text-white font-semibold py-4 px-8 rounded-xl text-base transition-all cursor-pointer hover:translate-y-[-1px]"
              >
                Try the Live Demo
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </button>

              <p className="hero-hint mt-4 text-sm text-gray-600">
                Play the role of a lead. See how the AI handles it.
              </p>
            </div>

            {/* Right: feature cards */}
            <div className="space-y-4">
              <FeatureCard
                number="01"
                title="Conversational Intake"
                description="The AI chats naturally with leads over WhatsApp. No forms, no friction. It collects name, scope, budget, timeline, and more through casual conversation."
                className="feature-card-1"
              />
              <FeatureCard
                number="02"
                title="Instant Qualification"
                description="The moment the conversation ends, the system checks budget, location, project type, and timeline against Henley's thresholds. Qualified leads get a Calendly link immediately."
                className="feature-card-2"
              />
              <FeatureCard
                number="03"
                title="Structured Data Output"
                description="Every field lands in HubSpot and Buildertrend automatically. A briefing packet gets generated so the field team has full context before the site visit."
                className="feature-card-3"
              />
              <FeatureCard
                number="04"
                title="Handles the Hard Stuff"
                description={`"I don't know my budget" is the most common answer. The AI anchors with a realistic local range for their project type and gets a usable number without pressure.`}
                className="feature-card-4"
              />
            </div>
          </div>

          {/* Bottom: tech stack pills */}
          <div className="tech-stack mt-20 pt-10 border-t border-white/5">
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">
              Built with
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "Claude API (Anthropic)",
                "WhatsApp Business API",
                "Portkey",
                "HubSpot CRM",
                "Buildertrend",
                "Calendly",
                "Next.js",
              ].map((tool) => (
                <span
                  key={tool}
                  className="text-sm text-gray-400 bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Chat View ───
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0f1117]">
      {/* Chat panel */}
      <div
        className={`flex flex-col ${leadData ? "lg:w-3/5" : "w-full max-w-3xl mx-auto"} h-screen transition-all duration-500`}
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
            Reset Demo
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
        <div className="lg:w-2/5 bg-[#161922] border-l border-white/5 h-screen overflow-y-auto summary-appear">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white">Lead Summary</h2>
              <span
                className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${
                  leadData.qualified
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {leadData.qualified ? "QUALIFIED" : "NOT QUALIFIED"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Auto-generated from conversation. Ready for HubSpot + Buildertrend.
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
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <p className="text-sm text-red-400">
                    <span className="font-semibold">Reason: </span>
                    {leadData.disqualification_reason}
                  </p>
                </div>
              )}

              {/* Pipeline visualization */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-[#E87722] text-sm mb-4">
                  Production Pipeline
                </h3>
                <div className="space-y-3">
                  <PipelineStep
                    step="1"
                    label="Push to HubSpot"
                    detail="Contact + Deal created"
                    done
                  />
                  <PipelineStep
                    step="2"
                    label="Calendly Link Sent"
                    detail="Lead books on-site consultation"
                    done
                  />
                  <PipelineStep
                    step="3"
                    label="Briefing Packet"
                    detail="Auto-generated PDF emailed to team"
                    done
                  />
                  <PipelineStep
                    step="4"
                    label="Buildertrend Sync"
                    detail="Project record created with all data"
                    done
                  />
                  <PipelineStep
                    step="5"
                    label="Walk Onto Site"
                    detail="Team arrives with full context"
                    active
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Components ───

function FeatureCard({
  number,
  title,
  description,
  className = "",
}: {
  number: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={`${className} group bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] hover:border-[#E87722]/20 transition-all`}>
      <div className="flex gap-4">
        <span className="text-[#E87722]/40 text-sm font-mono font-bold mt-0.5">
          {number}
        </span>
        <div>
          <h3 className="font-semibold text-white text-base mb-1">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>
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
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-600">{label}</p>
      <p className="text-sm text-gray-200">{value || "Not provided"}</p>
    </div>
  );
}

function QualCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
          passed
            ? "bg-green-500/10 text-green-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {passed ? "\u2713" : "\u2717"}
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </div>
  );
}

function PipelineStep({
  step,
  label,
  detail,
  done,
  active,
}: {
  step: string;
  label: string;
  detail: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          active
            ? "bg-[#E87722] text-white"
            : done
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-white/5 text-gray-600 border border-white/10"
        }`}
      >
        {done && !active ? "\u2713" : step}
      </div>
      <div>
        <p
          className={`text-sm font-medium ${active ? "text-[#E87722]" : "text-gray-300"}`}
        >
          {label}
        </p>
        <p className="text-xs text-gray-600">{detail}</p>
      </div>
    </div>
  );
}
