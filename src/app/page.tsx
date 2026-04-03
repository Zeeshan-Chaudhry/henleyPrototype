"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

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

// Pre-recorded demo conversation
const DEMO_CONVERSATION: Message[] = [
  { role: "user", content: "Hi" },
  {
    role: "assistant",
    content:
      "Hey! Thanks for reaching out to Henley Contracting. Happy to help you out. What's your name?",
  },
  { role: "user", content: "Sarah Mitchell" },
  {
    role: "assistant",
    content:
      "Nice to meet you, Sarah! What kind of project are you thinking about?",
  },
  {
    role: "user",
    content:
      "We want to redo our kitchen completely and maybe convert part of the garage into a mudroom",
  },
  {
    role: "assistant",
    content:
      "That sounds like a great project. For the kitchen, are you thinking full gut with new layout, or keeping the same footprint and updating cabinets and finishes?",
  },
  {
    role: "user",
    content:
      "Full gut. New layout, new cabinets, new everything. The mudroom we're less sure about.",
  },
  {
    role: "assistant",
    content:
      "Got it, full kitchen reno plus a possible garage-to-mudroom conversion. What's the address of the property?",
  },
  { role: "user", content: "47 Maple Drive, Oakville ON" },
  {
    role: "assistant",
    content:
      "Perfect, Oakville is right in our area. Do you have a rough budget in mind? A lot of people find it easier to think in ranges: under $50K, $50-100K, $100-250K, or $250K+?",
  },
  {
    role: "user",
    content: "Honestly I have no idea. We haven't figured that out yet.",
  },
  {
    role: "assistant",
    content:
      "Totally fair, most people don't at this stage. Just to give you a frame of reference: a full kitchen reno plus a garage-to-mudroom conversion in Oakville typically runs $80-120K depending on finishes and structural work. Does that sound about right, or were you hoping to stay well below that?",
  },
  {
    role: "user",
    content: "That's probably about right, maybe up to $150K if it's worth it.",
  },
  {
    role: "assistant",
    content:
      "Good to know, that gives us plenty to work with. What's your timeline? Any hard deadlines?",
  },
  {
    role: "user",
    content:
      "We'd love to be done before next winter. So maybe start in the summer?",
  },
  {
    role: "assistant",
    content:
      "That's realistic for this scope. How did you hear about Henley?",
  },
  {
    role: "user",
    content:
      "Our neighbours had their basement done by you guys and it looked amazing.",
  },
  {
    role: "assistant",
    content:
      "That's awesome to hear! What made you decide to reach out to us specifically?",
  },
  {
    role: "user",
    content: "They said you were really easy to work with and kept them in the loop the whole time.",
  },
  {
    role: "assistant",
    content:
      "Love that. Last thing, what's the best email to send you project details at?",
  },
  { role: "user", content: "sarah.m@gmail.com" },
  {
    role: "assistant",
    content:
      "Perfect. Sarah, based on everything you've told me, I think this would be a great fit for a free on-site consultation. The team will walk through the kitchen and garage with you and talk through your options in person. Here's a link to pick a time that works: [Calendly Link]",
  },
  { role: "user", content: "Booked! Thursday at 2pm." },
  {
    role: "assistant",
    content:
      "You're all set for Thursday at 2pm. Confirmation is heading to sarah.m@gmail.com. If you have any photos of the kitchen or garage you want to share beforehand, just send them here. It helps the team come prepared. Talk soon, Sarah!",
  },
];

const DEMO_LEAD_DATA: LeadData = {
  conversation_complete: true,
  qualified: true,
  lead: {
    name: "Sarah Mitchell",
    email: "sarah.m@gmail.com",
    phone: "WhatsApp (auto-captured)",
    address: "47 Maple Drive, Oakville ON",
    project_type: "Renovation + Addition",
    scope:
      "Full kitchen gut renovation (new layout, cabinets, finishes) plus possible garage-to-mudroom conversion",
    budget_range: "$100K-150K",
    timeline: "Start summer, complete before winter",
    referral_source: "Neighbour referral (basement project)",
    why_henley:
      "Neighbours said Henley was easy to work with and kept them informed throughout",
  },
  qualification: {
    budget_meets_minimum: true,
    in_service_area: true,
    valid_project_type: true,
    timeline_within_12_months: true,
  },
  disqualification_reason: "",
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [started, setStarted] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoPlayRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (started && !isLoading && !isAutoPlay) {
      inputRef.current?.focus();
    }
  }, [started, isLoading, isAutoPlay]);

  // Auto-play logic
  const runAutoPlay = useCallback(async () => {
    autoPlayRef.current = true;
    setIsAutoPlay(true);
    setStarted(true);

    const displayed: Message[] = [];

    for (let i = 0; i < DEMO_CONVERSATION.length; i++) {
      if (!autoPlayRef.current) break;

      const msg = DEMO_CONVERSATION[i];
      displayed.push(msg);

      if (msg.role === "assistant") {
        // Show typing indicator first
        setIsLoading(true);
        setMessages([...displayed.slice(0, -1)]);
        await sleep(800);
        if (!autoPlayRef.current) break;
        setIsLoading(false);

        // Type out the message character by character
        const fullText = msg.content;
        for (let c = 0; c <= fullText.length; c += 3) {
          if (!autoPlayRef.current) break;
          setMessages([
            ...displayed.slice(0, -1),
            { role: "assistant", content: fullText.slice(0, c) },
          ]);
          await sleep(15);
        }
        setMessages([...displayed]);
        await sleep(600);
      } else {
        // User message appears instantly
        setMessages([...displayed]);
        await sleep(1000);
      }
    }

    if (autoPlayRef.current) {
      setLeadData(DEMO_LEAD_DATA);
      setIsAutoPlay(false);
    }
  }, []);

  const stopAutoPlay = () => {
    autoPlayRef.current = false;
    setIsAutoPlay(false);
  };

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
    setMessageCount(0);

    const initial: Message[] = [{ role: "user", content: "Hi" }];

    try {
      await streamResponse(initial, initial);
      setMessageCount(2);
    } catch {
      setMessages([
        ...initial,
        {
          role: "assistant",
          content:
            "Hey! Thanks for reaching out to Henley Contracting. What's your name?",
        },
      ]);
      setMessageCount(2);
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
    const newCount = messageCount + 2;
    setMessageCount(newCount);

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
    stopAutoPlay();
    setMessages([]);
    setInput("");
    setLeadData(null);
    setStarted(false);
    setIsLoading(false);
    setMessageCount(0);
  };

  // Fallback: manually generate summary from conversation
  const generateSummaryFallback = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              role: "user",
              content: "That's everything, thanks!",
            },
          ],
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = JSON.parse(line.slice(6));
          if (json.type === "delta") fullText += json.text;
          if (json.type === "done" && json.leadData) {
            setLeadData(json.leadData);
          }
        }
      }

      // If still no lead data, try parsing from fullText
      if (!leadData) {
        const jsonMatch = fullText.match(/```json:lead_data\n([\s\S]*?)```/);
        if (jsonMatch) {
          try {
            setLeadData(JSON.parse(jsonMatch[1]));
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  };

  // ─── Landing Page ───
  if (!started) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white overflow-hidden relative">
        {/* Floating gradient orbs */}
        <div className="orb-1 absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-[#CAab06]/20 rounded-full blur-[120px]" />
        <div className="orb-2 absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] bg-[#CAab06]/10 rounded-full blur-[100px]" />

        {/* Nav */}
        <nav className="nav-animate relative z-10 flex items-center justify-between px-6 sm:px-8 py-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Image src="/henley-logo.svg" alt="Henley" width={36} height={36} className="invert" />
            <span className="font-semibold text-lg tracking-tight">
              Henley Contracting
            </span>
          </div>
          <span className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-3 py-1 hidden sm:inline">
            Prototype Demo
          </span>
        </nav>

        {/* Hero */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 pt-10 sm:pt-16 pb-20 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div>
              <div className="hero-badge pill-shimmer inline-flex items-center gap-2 border border-[#CAab06]/20 rounded-full px-4 py-1.5 mb-6">
                <div className="w-2 h-2 bg-[#CAab06] rounded-full animate-pulse" />
                <span className="text-xs text-[#CAab06] font-medium">
                  AI-Powered Lead Intake
                </span>
              </div>

              <h1 className="hero-title text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-6">
                Every lead, qualified
                <br />
                <span className="text-[#CAab06]">before you show up.</span>
              </h1>

              <p className="hero-desc text-base sm:text-lg text-gray-400 leading-relaxed mb-4 max-w-lg">
                Closing the gap between Step 1.1 and Step 1.2. By the time your
                team walks onto a site, they already have the scope, budget,
                timeline, and a pre-filled Client Intake Form. No repeated
                questions.
              </p>

              <p className="hero-desc text-sm text-gray-600 mb-8 max-w-lg">
                The AI handles lead intake over WhatsApp, qualifies against your
                thresholds, books the consultation via Calendly, and syncs
                everything to HubSpot and Buildertrend automatically.
              </p>

              <div className="hero-cta flex flex-col sm:flex-row gap-3">
                <button
                  onClick={startConversation}
                  className="cta-glow group bg-[#CAab06] hover:bg-[#b89a05] text-white font-semibold py-4 px-8 rounded-xl text-base transition-all cursor-pointer hover:translate-y-[-1px]"
                >
                  Try It Yourself
                  <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </button>
                <button
                  onClick={runAutoPlay}
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 font-semibold py-4 px-8 rounded-xl text-base transition-all cursor-pointer"
                >
                  <span className="mr-2">&#9654;</span>
                  Watch a Demo
                </button>
              </div>

              <p className="hero-hint mt-4 text-sm text-gray-600">
                &ldquo;Try It Yourself&rdquo; uses live AI. &ldquo;Watch a
                Demo&rdquo; plays a pre-recorded conversation.
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
                description="Every field maps to HubSpot and Buildertrend. A briefing packet gets generated with a pre-filled Estimating Worksheet so the field team is not starting from scratch."
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

        </div>
      </div>
    );
  }

  // ─── Chat View ───
  const showSummaryButton = !leadData && !isLoading && !isAutoPlay && messageCount >= 10;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0f1117]">
      {/* Chat panel */}
      <div
        className={`flex flex-col ${leadData ? "lg:w-3/5" : "w-full max-w-3xl mx-auto"} h-screen transition-all duration-500`}
      >
        {/* Chat header */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white p-1">
            <Image src="/henley-logo.svg" alt="Henley" width={32} height={32} />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-base">Henley Contracting</h1>
            <p className="text-xs text-green-200">
              {isLoading ? "typing..." : isAutoPlay ? "demo playing..." : "online"}
            </p>
          </div>
          {isAutoPlay && (
            <button
              onClick={stopAutoPlay}
              className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg px-3 py-1.5 transition-colors cursor-pointer mr-2"
            >
              Stop
            </button>
          )}
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

        {/* Fallback summary button */}
        {showSummaryButton && (
          <div className="bg-[#e5ddd5] px-4 pb-1">
            <button
              onClick={generateSummaryFallback}
              className="w-full bg-[#075e54] hover:bg-[#064d44] text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Conversation done? Generate Lead Summary
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAutoPlay ? "Demo playing..." : "Type a message..."}
            disabled={isLoading || isAutoPlay}
            className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm text-gray-800 outline-none shadow-sm disabled:opacity-50 placeholder-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || isAutoPlay}
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
              Auto-generated from conversation. Ready for HubSpot +
              Buildertrend.
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
                <h3 className="font-semibold text-[#CAab06] text-sm mb-4">
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
                    detail="Lead books on-site consultation (Step 1.1)"
                    done
                  />
                  <PipelineStep
                    step="3"
                    label="Briefing Packet"
                    detail="Pre-filled Intake Form + Estimating Worksheet"
                    done
                  />
                  <PipelineStep
                    step="4"
                    label="Buildertrend Sync"
                    detail="Project record + Quo AI summary merged"
                    done
                  />
                  <PipelineStep
                    step="5"
                    label="On-Site Consultation (Step 1.2)"
                    detail="Team arrives with full context, no repeated questions"
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

// ─── Helpers ───

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    <div
      className={`${className} group bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] hover:border-[#CAab06]/20 transition-all`}
    >
      <div className="flex gap-4">
        <span className="text-[#CAab06]/40 text-sm font-mono font-bold mt-0.5">
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
            ? "bg-[#CAab06] text-white"
            : done
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-white/5 text-gray-600 border border-white/10"
        }`}
      >
        {done && !active ? "\u2713" : step}
      </div>
      <div>
        <p
          className={`text-sm font-medium ${active ? "text-[#CAab06]" : "text-gray-300"}`}
        >
          {label}
        </p>
        <p className="text-xs text-gray-600">{detail}</p>
      </div>
    </div>
  );
}
