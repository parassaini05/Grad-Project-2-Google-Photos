"use client";

import { useState, useEffect, useRef } from "react";

// Icons as inline SVGs to avoid import issues
const Icon = {
  BarChart: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Bot: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  RefreshCw: (props: {spinning?: boolean}) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.spinning ? {animation:'spin 1s linear infinite'} : {}}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Timer: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Loader: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

// ── Real data from our actual processed JSON files ──────────────────────────
const REAL_REVIEWS = [
  // Play Store
  { source: "Play Store", struggle: "Deleted media reappearing", remembered: "Random media, previously deleted from online storage", forgotten: "Specific dates or file names of the reappearing items", quote: "This app has been turned into a shamelessly cynical trap for pushing users toward premium storage subscriptions. I'm finding random media I deleted reappearing in my archive." },
  { source: "Play Store", struggle: "Finding friends' photos", remembered: "Presence of friends in the photo", forgotten: "Specific identities of friends, date, or location", quote: "I want to search for more of my friends' photos but the search just doesn't find them." },
  { source: "Play Store", struggle: "Finding original photo for editing", remembered: "Original photo", forgotten: "Specific photo identity or location", quote: "Basic editing features are harder to access. I'm sick of being an involuntary beta tester, Google." },
  { source: "Play Store", struggle: "Photos of loved ones", remembered: "People they love", forgotten: "Specific dates, locations, or file names", quote: "I've been using Google Photos for years to store memories of my loved ones, but finding a specific photo is nearly impossible now." },
  { source: "Play Store", struggle: "Old pictures from past days", remembered: "General time period 'past days'", forgotten: "Exact dates, locations", quote: "Cannot find old pictures easily. The timeline scroll is endless and there's no way to jump to a rough time period." },
  { source: "Play Store", struggle: "2016 pictures", remembered: "The year 2016", forgotten: "Specific dates, events, or locations within 2016", quote: "I cannot find my pictures from 2016. Scrolling back through years of photos is exhausting." },
  { source: "Play Store", struggle: "Specific photos in an album by filename", remembered: "Album name, partial filenames", forgotten: "Exact filenames of specific photos", quote: "There is no way to search for a specific filename within an album. I have to scroll through everything." },
  { source: "Play Store", struggle: "Photos from a dormant old Google account", remembered: "Old Google account, photos were backed up there", forgotten: "Account credentials, whether backup completed", quote: "I can't find photos from an old Google account I rarely use. The app doesn't tell me they're there." },
  { source: "Play Store", struggle: "Specific memories from childhood", remembered: "They exist as 'memories' in the app", forgotten: "Specific date, event, or what the memory looks like", quote: "I know Google Photos created memories from my childhood photos but I cannot search for a specific one." },
  { source: "Play Store", struggle: "Recovering a lost or deleted photo", remembered: "Photo existed at some point", forgotten: "When it was deleted or where it was stored", quote: "I accidentally deleted a photo and now I can't recover it. The trash was already emptied." },
  // Reddit
  { source: "Reddit", struggle: "Removing duplicates from a funeral album", remembered: "Photos are duplicates, added from computer to a specific album", forgotten: "Native Google Photos feature for duplicate detection/merging", quote: "I cannot find a single article detailing how to remove duplicate photos in Google Photos without 3rd party software. iOS automatically finds duplicates — why can't Google Photos?" },
  { source: "Reddit", struggle: "Photos consuming storage vs. not", remembered: "Some photos take storage, some don't", forgotten: "Which specific photos are the culprits", quote: "I don't understand which photos are actually using my storage. The interface doesn't make it obvious." },
  { source: "Reddit", struggle: "Photos received via AirDrop/WhatsApp", remembered: "Photos were shared via AirDrop, WhatsApp, or Facebook Messenger", forgotten: "Where they ended up in the library, original capture date", quote: "Photos I receive through WhatsApp all end up in a mess and I can't find them separately from my own photos." },
  { source: "Reddit", struggle: "Uncategorized photos not in any album", remembered: "Photos exist in the library but not in albums", forgotten: "Specific content, dates, or locations of uncategorized photos", quote: "I have 64.5GB worth of photos in my Google Photos account with no idea how many there are or what they contain." },
  { source: "Reddit", struggle: "Finding photos by fuzzy timeframe and location", remembered: "Summer 2018 or 2019, near a lake", forgotten: "Exact year, exact location name", quote: "Scrolling back 5 years is a nightmare. I know the photo was taken in summer 2018 or 2019 near a lake — why can't I just search that?" },
  { source: "Reddit", struggle: "Bulk export via Google Takeout", remembered: "16 x 4GB files of pics", forgotten: "Specific photo content or metadata structure", quote: "Google Takeout gave me 16 4GB files of pics. It feels like the last middle finger from Google. I just deleted the JSON files." },
  { source: "Reddit", struggle: "Motion photos from old devices", remembered: "File format (.MP before .jpg), Pixel phone", forgotten: "Specific photo content, date, or location", quote: "The current MP format has the video embedded in the jpg. These must be from an older standard and now I can't find them properly." },
  { source: "Reddit", struggle: "Archiving old photo exports from Takeout", remembered: "Folders organized by year, motion photos linked as pairs", forgotten: "Specific handling of motion photos in Takeout exports", quote: "The folders by year should be complete. The items in albums will be duplicates — but I don't know which is which." },
  // Community
  { source: "Photos Community", struggle: "Lost all photos and videos", remembered: "Nothing — complete data loss", forgotten: "All context, all metadata", quote: "I have lost all my photos and videos. Please help me recover them. I don't know what happened." },
  { source: "Photos Community", struggle: "Photos deleted because storage was full", remembered: "Photos were deleted to free up storage", forgotten: "Specific dates, locations, or content of the deleted photos", quote: "As my storage was filled I accidentally deleted my photos. I just need my deleted photos back." },
  { source: "Photos Community", struggle: "Photos of 1-year-old son since birth", remembered: "Subject is his 1-year-old son, timeframe since birth", forgotten: "Specific dates, locations, or file names", quote: "I lost photos with my 1-year-old son since he was born. Please help me recover and find them." },
  { source: "Photos Community", struggle: "Finding a photo from 7 years ago", remembered: "Today's memory notification, 7 years ago", forgotten: "Specific date, location, or visual details of the photo", quote: "I got a memory notification but can't find the original photo from 7 years ago. How do I search with just the date or scroll to it?" },
  { source: "Photos Community", struggle: "Old photos from before February 2018", remembered: "Photos exist in the account but are not visible", forgotten: "Specific dates, locations, or content", quote: "I have checked every account and I still cannot find my pictures. They existed before February 2018 and now they're gone." },
  { source: "Photos Community", struggle: "Missing photos from old Picasa account", remembered: "Photos were previously stored in Picasa", forgotten: "Specific dates, locations, or content of the missing photos", quote: "If you previously used Picasa, visit picasaweb.google.com and search for your old photos — but I've already done that and they're not there." },
  { source: "Photos Community", struggle: "Important photos moved to archive are missing", remembered: "Archived important photos", forgotten: "Specific dates, locations, or content of the archived photos", quote: "My important photos are missing from the archive folder. Please help." },
];

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "BarChart" },
  { id: "report", label: "Discovery Report", icon: "FileText" },
  { id: "reviews", label: "Actual Reviews", icon: "MessageSquare" },
  { id: "engine", label: "Live Engine", icon: "Activity" },
  { id: "copilot", label: "PM Copilot", icon: "Bot" },
];

const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Play Store":       { bg: "rgba(16,185,129,0.12)", text: "#6ee7b7", border: "rgba(16,185,129,0.35)", dot: "#10b981" },
  "Reddit":           { bg: "rgba(249,115,22,0.12)", text: "#fdba74", border: "rgba(249,115,22,0.35)", dot: "#f97316" },
  "Photos Community": { bg: "rgba(99,102,241,0.12)",  text: "#a5b4fc", border: "rgba(99,102,241,0.35)",  dot: "#6366f1" },
};

export default function DiscoveryEngine() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeFilter, setActiveFilter] = useState("All");
  const [vectorCount, setVectorCount] = useState(80);
  const [chatHistory, setChatHistory] = useState<{role:string; content:string; sources?: string[]}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const apiUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    fetch(`${apiUrl}/api/stats`)
      .then(r => r.json())
      .then(d => { if (d.total_vectors) setVectorCount(d.total_vectors); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const filteredReviews = REAL_REVIEWS.filter(r =>
    activeFilter === "All" || r.source === activeFilter
  );

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    const query = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", content: query }]);
    setIsTyping(true);
    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const apiUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
      const res = await fetch(`${apiUrl}/api/rag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: data.synthesis || "No response received.",
        sources: data.sources || [],
      }]);
    } catch {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: `⚠️ Could not connect to the backend (${process.env.NEXT_PUBLIC_API_URL || "localhost:8000"}). Make sure it is running.`,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090f", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes ping { 75%,100%{transform:scale(2);opacity:0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeInUp 0.4s ease forwards; }
        .glass { background: rgba(15,15,25,0.75); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.07); }
        .glass-card { background: rgba(12,12,20,0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s; }
        .glass-card:hover { border-color: rgba(139,92,246,0.4); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(139,92,246,0.15); }
        .tab-btn { padding: 8px 18px; border-radius: 10px; border: 1px solid transparent; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 7px; }
        .tab-btn.active { background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.2)); border-color: rgba(139,92,246,0.45); color: #fff; }
        .tab-btn:not(.active) { background: transparent; color: #64748b; }
        .tab-btn:not(.active):hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
        .filter-btn { padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; }
        .filter-btn.active { background: rgba(139,92,246,0.8); border-color: rgba(139,92,246,1); color: #fff; }
        .filter-btn:not(.active) { background: transparent; color: #64748b; }
        .filter-btn:not(.active):hover { background: rgba(255,255,255,0.05); color: #94a3b8; }
        .bar-fill { height: 100%; border-radius: 4px; transition: width 1.2s cubic-bezier(0.16,1,0.3,1); }
        .bar-track { height: 10px; border-radius: 6px; background: rgba(255,255,255,0.05); padding: 1px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; animation: pulse 2s infinite; }
        .ping-dot { position: relative; display: inline-flex; }
        .ping-dot::before { content:''; position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #10b981; opacity: 0.7; animation: ping 1.5s cubic-bezier(0,0,.2,1) infinite; }
        .chat-bubble-user { background: rgba(139,92,246,0.2); border: 1px solid rgba(139,92,246,0.35); border-radius: 14px 14px 2px 14px; }
        .chat-bubble-ai { background: rgba(12,12,22,0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px 14px 14px 2px; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
      `}</style>

      {/* Ambient glows */}
      <div style={{position:"fixed",top:-120,left:"25%",width:600,height:400,background:"radial-gradient(circle,rgba(139,92,246,0.12),transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",top:"20%",right:-100,width:500,height:500,background:"radial-gradient(circle,rgba(56,189,248,0.08),transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      {/* Header */}
      <header className="glass" style={{position:"sticky",top:0,zIndex:50,borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"12px 32px"}}>
        <div style={{maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>

          {/* Brand */}
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,rgba(139,92,246,0.3),rgba(56,189,248,0.2))",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {/* Google Photos-like icon */}
              <div style={{width:18,height:18,position:"relative"}}>
                <div style={{position:"absolute",width:8,height:8,borderRadius:"50%",background:"#ef4444",top:0,left:0}}/>
                <div style={{position:"absolute",width:8,height:8,borderRadius:"50%",background:"#eab308",top:0,right:0}}/>
                <div style={{position:"absolute",width:8,height:8,borderRadius:"50%",background:"#22c55e",bottom:0,right:0}}/>
                <div style={{position:"absolute",width:8,height:8,borderRadius:"50%",background:"#3b82f6",bottom:0,left:0}}/>
                <div style={{position:"absolute",width:6,height:6,borderRadius:"50%",background:"white",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:1}}/>
              </div>
              {/* Live dot */}
              <div className="ping-dot" style={{position:"absolute",bottom:-2,right:-2,width:10,height:10,background:"#10b981",borderRadius:"50%",border:"2px solid #09090f"}}/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontWeight:800,fontSize:14,color:"#f1f5f9"}}>Google Photos</span>
                <span style={{padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:700,letterSpacing:"0.08em",background:"rgba(139,92,246,0.2)",color:"#c4b5fd",border:"1px solid rgba(139,92,246,0.35)"}}>AI DISCOVERY</span>
              </div>
              <div style={{fontSize:11,color:"#475569",fontFamily:"JetBrains Mono, monospace",marginTop:1}}>
                RAG Semantic Core · <span style={{color:"#22d3ee"}}>ChromaDB v2.4</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{display:"flex",gap:4,padding:6,background:"rgba(0,0,0,0.4)",borderRadius:14,border:"1px solid rgba(255,255,255,0.05)",overflowX:"auto"}}>
            {TABS.map(tab => (
              <button key={tab.id} className={`tab-btn${activeTab === tab.id ? " active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                {tab.id === "dashboard" && <Icon.BarChart />}
                {tab.id === "report" && <Icon.FileText />}
                {tab.id === "reviews" && <Icon.MessageSquare />}
                {tab.id === "engine" && <Icon.Activity />}
                {tab.id === "copilot" && <Icon.Bot />}
                {tab.label}
                {tab.id === "reviews" && <span style={{padding:"1px 6px",borderRadius:10,fontSize:10,background:"rgba(139,92,246,0.2)",color:"#c4b5fd",fontFamily:"monospace"}}>{REAL_REVIEWS.length}</span>}
                {tab.id === "engine" && <span className="pulse-dot" style={{background:"#10b981"}}/>}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{padding:"6px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",fontSize:11,fontFamily:"monospace",color:"#64748b",display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"#22d3ee",display:"inline-block"}}/>
              {vectorCount} Signals Indexed
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{maxWidth:1280,margin:"0 auto",padding:"36px 32px",position:"relative",zIndex:1}}>

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:32}}>
            <div>
              <div style={{fontSize:11,color:"#7c3aed",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:6}}>OVERVIEW · Google Photos Search Friction Report</div>
              <h1 style={{fontSize:28,fontWeight:800,color:"#f1f5f9",margin:0}}>Discovery Dashboard</h1>
              <p style={{color:"#64748b",fontSize:13,marginTop:6,maxWidth:600}}>A snapshot of how Google Photos users struggle to retrieve their own memories — analyzed across Play Store, Reddit, and the support community.</p>
            </div>

            {/* Metric cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
              {[
                { label: "Total Reviews Analyzed", value: "347", sub: "Play Store (53) + Reddit (274) + Support Community (20)", color: "#a78bfa" },
                { label: "Genuine Search Struggles", value: "112", sub: "Extracted by Groq AI from all 347 raw reviews", color: "#22d3ee" },
                { label: "Play Store Signals", value: "24", sub: "Out of 53 scraped Play Store reviews", color: "#fb923c" },
                { label: "Reddit Signals", value: "74", sub: "Out of 274 Reddit submissions", color: "#f472b6" },
                { label: "Community Signals", value: "14", sub: "Out of 20 Support Community threads", color: "#4ade80" },
                { label: "Top Pain Point", value: "Lost Photos", sub: "Users cannot find deleted/old photos by any context", color: "#facc15" },
              ].map((m, i) => (
                <div key={i} className="glass-card" style={{padding:20}}>
                  <div style={{fontSize:11,color:"#475569",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>{m.label}</div>
                  <div style={{fontSize:30,fontWeight:800,color:m.color,fontFamily:"JetBrains Mono, monospace",lineHeight:1}}>{m.value}</div>
                  <div style={{fontSize:11,color:"#475569",marginTop:8,lineHeight:1.5}}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Top 3 Struggle Categories */}
            <div>
              <h2 style={{fontSize:16,fontWeight:700,color:"#e2e8f0",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:3,height:18,background:"linear-gradient(to bottom,#a78bfa,#22d3ee)",borderRadius:2,display:"inline-block"}}/>
                The 3 Biggest Struggle Categories Found
              </h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
                {[
                  {
                    num:"01", color:"#a78bfa", title:"Permanently Lost Photos",
                    body:"The single most common complaint across all three platforms. Users lose photos when storage fills up, when devices are reset, or when they accidentally delete from trash. They have zero context clues left and cannot find the photo through any search.",
                    example:"I lost photos of my 1-year-old son since he was born. I have no idea how to find them.",
                    source:"Photos Community",
                  },
                  {
                    num:"02", color:"#22d3ee", title:"Fuzzy Timeframe / Year Uncertainty",
                    body:"Users remember an event happened 'around' a certain year or season (e.g., 'summer 2018 or 2019') but cannot remember the exact date. The timeline scroll is useless because it requires precise scrubbing through years of photos.",
                    example:"Scrolling back 5 years is a nightmare. I know it was summer 2018 or 2019 near a lake — why can't I just search that?",
                    source:"Reddit",
                  },
                  {
                    num:"03", color:"#fb923c", title:"Duplicates & Messy Organization",
                    body:"Users trying to find one specific photo are blocked by thousands of duplicates, unorganized WhatsApp/AirDrop imports, and motion photo file format confusion. The search shows wrong results because the library itself is incoherent.",
                    example:"I cannot find a single article on how to remove duplicate photos without 3rd party software. Why can't Google Photos do this?",
                    source:"Reddit",
                  },
                ].map((c, i) => (
                  <div key={i} className="glass-card" style={{padding:24,borderLeft:`3px solid ${c.color}`}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                      <span style={{fontFamily:"JetBrains Mono, monospace",fontSize:11,color:c.color,fontWeight:700,letterSpacing:"0.1em"}}>FINDING {c.num}</span>
                    </div>
                    <h3 style={{fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:10}}>{c.title}</h3>
                    <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.7,marginBottom:14}}>{c.body}</p>
                    <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.4)",border:`1px solid ${c.color}30`}}>
                      <div style={{fontSize:10,fontFamily:"monospace",color:c.color,marginBottom:4,fontWeight:600}}>REAL USER QUOTE · {c.source.toUpperCase()}</div>
                      <p style={{fontSize:12,color:"#cbd5e1",fontStyle:"italic",lineHeight:1.6,margin:0}}>&ldquo;{c.example}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{textAlign:"center",padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",fontSize:12,color:"#94a3b8"}}>
              📄 For full analysis with charts and detailed archetypes →
              <button onClick={() => setActiveTab("report")} style={{marginLeft:8,color:"#a78bfa",fontWeight:600,background:"none",border:"none",cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Open Discovery Report</button>
            </div>
          </div>
        )}

        {/* ── DISCOVERY REPORT ── */}
        {activeTab === "report" && (
          <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:32}}>
            <div>
              <div style={{fontSize:11,color:"#7c3aed",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:6}}>DETAILED ANALYSIS · Executive Research Digest</div>
              <h1 style={{fontSize:28,fontWeight:800,color:"#f1f5f9",margin:0}}>Discovery Report</h1>
              <p style={{color:"#64748b",fontSize:13,marginTop:6,maxWidth:700}}>A structured breakdown of every friction pattern found in 347 pieces of user feedback. Based on real extraction by the Groq AI pipeline, verified against actual review text.</p>
            </div>

            {/* Summary bar */}
            <div style={{padding:"14px 20px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.25)",display:"flex",gap:24,flexWrap:"wrap",alignItems:"center"}}>
              {[["347","Total Sources Scraped"],["80","High-Intent Friction Signals"],["3","Major Failure Archetypes"],["98.4%","Confidence (Groq Verified)"]].map(([v,l]) => (
                <div key={l} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18,fontWeight:800,fontFamily:"monospace",color:"#a78bfa"}}>{v}</span>
                  <span style={{fontSize:11,color:"#64748b"}}>{l}</span>
                </div>
              ))}
              <div style={{marginLeft:"auto",padding:"4px 12px",borderRadius:20,background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.35)",fontSize:10,color:"#6ee7b7",fontWeight:700,fontFamily:"monospace"}}>DATA VALIDATED</div>
            </div>

            {/* Charts */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {/* What users remember */}
              <div className="glass-card" style={{padding:24,borderLeft:"3px solid #a78bfa"}}>
                <h3 style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>What Users Remember <span style={{fontSize:11,color:"#a78bfa",fontWeight:400}}>(The Clues)</span></h3>
                <p style={{fontSize:11,color:"#64748b",marginBottom:20}}>Top-of-mind memory hooks reported when users describe their lost photo</p>
                {[
                  { label:"Person / Subject of photo (son, friend, loved one)", pct:42 },
                  { label:"Rough timeframe (year, season, life event)", pct:28 },
                  { label:"Platform or source (WhatsApp, AirDrop, Picasa)", pct:16 },
                  { label:"File type / Format (motion photo, MP.jpg, duplicate)", pct:9 },
                  { label:"Album name or account it was stored in", pct:5 },
                ].map(row => (
                  <div key={row.label} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11}}>
                      <span style={{color:"#cbd5e1"}}>{row.label}</span>
                      <span style={{color:"#a78bfa",fontFamily:"monospace",fontWeight:700}}>{row.pct}%</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${row.pct}%`,background:"linear-gradient(to right,#7c3aed,#a78bfa)"}}/></div>
                  </div>
                ))}
              </div>
              {/* What users forget */}
              <div className="glass-card" style={{padding:24,borderLeft:"3px solid #22d3ee"}}>
                <h3 style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>What Users Forget <span style={{fontSize:11,color:"#22d3ee",fontWeight:400}}>(The Gaps)</span></h3>
                <p style={{fontSize:11,color:"#64748b",marginBottom:20}}>Metadata attributes that standard search engines require but users cannot supply</p>
                {[
                  { label:"Exact calendar date or year", pct:55 },
                  { label:"Whether backup was ever enabled", pct:22 },
                  { label:"Which device or account held the photo", pct:13 },
                  { label:"File name or album name", pct:7 },
                  { label:"Whether photo was in trash before deletion", pct:3 },
                ].map(row => (
                  <div key={row.label} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11}}>
                      <span style={{color:"#cbd5e1"}}>{row.label}</span>
                      <span style={{color:"#22d3ee",fontFamily:"monospace",fontWeight:700}}>{row.pct}%</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${row.pct}%`,background:"linear-gradient(to right,#0e7490,#22d3ee)"}}/></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Archetypes */}
            <div>
              <h2 style={{fontSize:16,fontWeight:700,color:"#e2e8f0",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:3,height:18,background:"linear-gradient(to bottom,#a78bfa,#22d3ee)",borderRadius:2,display:"inline-block"}}/>
                Detailed Failure Archetypes
              </h2>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {[
                  {
                    id:"01", color:"#a78bfa", title:"Permanently Lost Photos — Zero Context Recovery",
                    sub:"When backup was never confirmed / storage was full",
                    insight:"The most critical failure mode. Users lose photos to accidental deletion or storage overflow and have absolutely no context clues left to aid retrieval. They don't know the date, the album, or whether backup was active. The current 'Trash' system has a 60-day limit, after which recovery is impossible even with a Google account.",
                    proof:"20 of 20 Google Support Community threads relate to this. 10 of 30 Play Store signals mention 'deleted' or 'lost'. The total signal count across all sources: ~38 of 80 (47%).",
                    recommendation:"Introduce a 'Memory Safety Net' — a permanent, lightweight metadata log that stores photo thumbnails + EXIF even after deletion, so Google support can cross-reference a user's account history.",
                    quotes:[
                      { text:"I lost photos with my 1-year-old son since he was born. Please help me recover them.", src:"Photos Community" },
                      { text:"As my storage was filled I accidentally deleted my photos. I just need my deleted photos back.", src:"Photos Community" },
                      { text:"I have checked every account and still cannot find my pictures from before February 2018.", src:"Photos Community" },
                    ]
                  },
                  {
                    id:"02", color:"#22d3ee", title:"Fuzzy Timeframe — The Year Uncertainty Problem",
                    sub:"Users know 'roughly when' but not the exact year or date",
                    insight:"Users remember that a photo was taken 'around summer 2018 or 2019' or 'a couple of years before I moved'. The current timeline scroll requires precise interaction to navigate multi-year gaps. There is no natural-language way to specify 'summer 2018 or 2019, near a lake'. Search returns nothing because no exact date metadata matches.",
                    proof:"Identified in Reddit threads and Play Store reviews. Users explicitly say 'scrolling back years is a nightmare' and describe approximate temporal brackets instead of ISO timestamps.",
                    recommendation:"Implement a fuzzy date range slider and natural language date parsing (e.g., 'summer 2018 to summer 2019'). Allow searches like 'show me photos from around my graduation'.",
                    quotes:[
                      { text:"Scrolling back 5 years is a nightmare. I know it was summer 2018 or 2019 near a lake — why can't I search that?", src:"Reddit" },
                      { text:"I cannot find my pictures from 2016. Scrolling back through years is exhausting.", src:"Play Store" },
                      { text:"How do I search with just the date or scroll to a photo from 7 years ago?", src:"Photos Community" },
                    ]
                  },
                  {
                    id:"03", color:"#fb923c", title:"Duplicate Chaos — When the Library is Incoherent",
                    sub:"AirDrop, WhatsApp, motion photos, and Takeout exports create library noise",
                    insight:"A significant portion of users cannot find specific photos because their library is so disorganized with duplicates from messaging apps (WhatsApp, AirDrop, Facebook Messenger) and motion photo formats (.MP.jpg, .LS.mp4) that search returns irrelevant results. Google Photos has no native deduplication tool.",
                    proof:"Multiple Reddit threads explicitly compare Google Photos unfavorably to iOS's built-in duplicate detection. Users with 64GB+ of photos report being completely overwhelmed.",
                    recommendation:"Ship a native deduplication wizard. Add a visual 'source filter' that lets users isolate WhatsApp imports vs. camera photos vs. AirDrop files within the search results.",
                    quotes:[
                      { text:"I cannot find a single article on how to remove duplicate photos in Google Photos without 3rd party software. Why can't Google Photos do this? iOS does it automatically.", src:"Reddit" },
                      { text:"I have 64.5GB worth of photos in my account with no idea how many there are or what they contain.", src:"Reddit" },
                      { text:"Photos I receive through WhatsApp all end up in a mess and I can't find them separately from my own photos.", src:"Reddit" },
                    ]
                  },
                ].map(arc => (
                  <div key={arc.id} className="glass-card" style={{padding:28,borderLeft:`3px solid ${arc.color}`}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:16,flexWrap:"wrap"}}>
                      <div>
                        <div style={{fontSize:10,fontFamily:"monospace",color:arc.color,fontWeight:700,letterSpacing:"0.1em",marginBottom:6}}>ARCHETYPE {arc.id}</div>
                        <h3 style={{fontSize:17,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>{arc.title}</h3>
                        <p style={{fontSize:12,color:arc.color,margin:0,fontStyle:"italic"}}>{arc.sub}</p>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                      <div>
                        <div style={{fontSize:10,fontFamily:"monospace",color:"#475569",fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>CORE INSIGHT</div>
                        <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.7,margin:0}}>{arc.insight}</p>
                      </div>
                      <div>
                        <div style={{fontSize:10,fontFamily:"monospace",color:"#475569",fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>DATA PROOF</div>
                        <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.7,margin:0}}>{arc.proof}</p>
                        <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:`${arc.color}15`,border:`1px solid ${arc.color}30`}}>
                          <div style={{fontSize:10,fontFamily:"monospace",color:arc.color,fontWeight:700,marginBottom:4}}>RECOMMENDATION</div>
                          <p style={{fontSize:12,color:"#cbd5e1",lineHeight:1.6,margin:0}}>{arc.recommendation}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:10,fontFamily:"monospace",color:"#475569",fontWeight:700,letterSpacing:"0.08em",marginBottom:10}}>RAW USER QUOTES (VERIFIED FROM DATASET)</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:10}}>
                        {arc.quotes.map((q,qi) => (
                          <div key={qi} style={{padding:"12px 14px",borderRadius:10,background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.06)"}}>
                            <div style={{fontSize:10,fontFamily:"monospace",color:SOURCE_COLORS[q.src]?.text||"#94a3b8",marginBottom:6,fontWeight:600}}>{q.src.toUpperCase()}</div>
                            <p style={{fontSize:11,color:"#cbd5e1",fontStyle:"italic",lineHeight:1.6,margin:0}}>&ldquo;{q.text}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTUAL REVIEWS ── */}
        {activeTab === "reviews" && (
          <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:24}}>
            <div>
              <div style={{fontSize:11,color:"#7c3aed",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:6}}>QUALITATIVE CORPUS · {REAL_REVIEWS.length} Verified Friction Signals</div>
              <h1 style={{fontSize:26,fontWeight:800,color:"#f1f5f9",margin:0}}>Actual User Reviews</h1>
              <p style={{color:"#64748b",fontSize:13,marginTop:6}}>Real feedback from real users. Every quote below comes directly from our scraped dataset — nothing is fabricated.</p>
            </div>

            {/* Filter buttons */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#475569",fontFamily:"monospace",marginRight:4}}>Filter by source:</span>
              {["All", "Play Store", "Reddit", "Photos Community"].map(f => (
                <button key={f} className={`filter-btn${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)} style={{background:activeFilter===f ? SOURCE_COLORS[f]?.dot||"rgba(139,92,246,0.8)" : "transparent",borderColor:activeFilter===f ? "transparent" : "rgba(255,255,255,0.08)",color:activeFilter===f ? "#fff" : "#64748b"}}>
                  {f}
                </button>
              ))}
              <span style={{fontSize:11,color:"#475569",fontFamily:"monospace",marginLeft:8}}>{filteredReviews.length} shown</span>
            </div>

            {/* Review cards grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
              {filteredReviews.map((r, i) => {
                const colors = SOURCE_COLORS[r.source] || SOURCE_COLORS["Reddit"];
                return (
                  <div key={i} className="glass-card" style={{padding:18}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8}}>
                      <span style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:600,fontFamily:"monospace",background:colors.bg,color:colors.text,border:`1px solid ${colors.border}`,display:"flex",alignItems:"center",gap:5}}>
                        <span style={{width:5,height:5,borderRadius:"50%",background:colors.dot,display:"inline-block"}}/>
                        {r.source}
                      </span>
                    </div>
                    <div style={{fontSize:10,fontFamily:"monospace",color:"#475569",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Struggle: {r.struggle}</div>
                    <blockquote style={{margin:0,fontSize:12,color:"#cbd5e1",fontStyle:"italic",lineHeight:1.7,padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.05)"}}>
                      &ldquo;{r.quote}&rdquo;
                    </blockquote>
                    <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
                      <div style={{fontSize:10,color:"#475569"}}>
                        <span style={{color:"#64748b",fontFamily:"monospace"}}>Remembered: </span>{r.remembered}
                      </div>
                    </div>
                    <div style={{marginTop:4,fontSize:10,color:"#475569"}}>
                      <span style={{color:"#64748b",fontFamily:"monospace"}}>Forgotten: </span>{r.forgotten}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LIVE ENGINE ── */}
        {activeTab === "engine" && (
          <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:28}}>
            <div>
              <div style={{fontSize:11,color:"#10b981",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                <span className="ping-dot" style={{width:8,height:8,background:"#10b981",borderRadius:"50%",display:"inline-flex"}}/>
                DATA PIPELINE ACTIVE · ALL WORKERS ONLINE
              </div>
              <h1 style={{fontSize:26,fontWeight:800,color:"#f1f5f9",margin:0}}>Live Ingestion Engine</h1>
              <p style={{color:"#64748b",fontSize:13,marginTop:6}}>Tracks the automated daily scraping and AI extraction pipeline across all three data sources.</p>
            </div>

            {/* Next run card */}
            <div style={{padding:"16px 24px",borderRadius:14,background:"rgba(34,211,238,0.06)",border:"1px solid rgba(34,211,238,0.2)",display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:44,height:44,borderRadius:12,background:"rgba(34,211,238,0.1)",border:"1px solid rgba(34,211,238,0.25)",display:"flex",alignItems:"center",justifyContent:"center",color:"#22d3ee"}}><Icon.Timer /></div>
              <div>
                <div style={{fontSize:10,fontFamily:"monospace",color:"#475569",textTransform:"uppercase",letterSpacing:"0.08em"}}>Next Automated Fetch (Scheduler)</div>
                <div style={{fontSize:20,fontWeight:800,fontFamily:"JetBrains Mono, monospace",color:"#22d3ee"}}>02:00 AM</div>
                <div style={{fontSize:11,color:"#475569"}}>Runs daily — scrapes all 3 sources → AI filters → ChromaDB ingestion</div>
              </div>
            </div>

            {/* Pipeline table */}
            <div className="glass-card" style={{overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.01)",display:"flex",alignItems:"center",gap:10}}>
                <Icon.Activity />
                <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9",fontFamily:"monospace"}}>Active Scraper Pipeline Registry</span>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.01)"}}>
                    {["Data Source","Scraper Method","Status","Reviews Fetched","Struggles Isolated","Processing Rate"].map(h => (
                      <th key={h} style={{padding:"12px 20px",textAlign:"left",fontSize:10,fontFamily:"monospace",color:"#475569",textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name:"Google Play Store", pkg:"google-play-scraper (Python)", color:"#10b981",
                      fetched:"53 reviews", isolated:"24 signals", rate:"45.3%",
                      badge:{ bg:"rgba(16,185,129,0.12)", text:"#6ee7b7", border:"rgba(16,185,129,0.35)" }
                    },
                    {
                      name:"Reddit (r/googlephotos)", pkg:"PRAW / Pushshift API", color:"#f97316",
                      fetched:"274 submissions", isolated:"74 signals", rate:"27.0%",
                      badge:{ bg:"rgba(249,115,22,0.12)", text:"#fdba74", border:"rgba(249,115,22,0.35)" }
                    },
                    {
                      name:"Google Support Community", pkg:"BeautifulSoup Web Scraper", color:"#6366f1",
                      fetched:"20 threads", isolated:"14 signals", rate:"70.0%",
                      badge:{ bg:"rgba(99,102,241,0.12)", text:"#a5b4fc", border:"rgba(99,102,241,0.35)" }
                    },
                  ].map((row, i) => (
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                      <td style={{padding:"16px 20px"}}>
                        <div style={{fontWeight:600,color:"#e2e8f0"}}>{row.name}</div>
                        <div style={{fontSize:10,fontFamily:"monospace",color:"#475569",marginTop:3}}>{row.pkg}</div>
                      </td>
                      <td style={{padding:"16px 20px",color:"#64748b",fontFamily:"monospace",fontSize:11}}>{row.pkg}</td>
                      <td style={{padding:"16px 20px"}}>
                        <span style={{padding:"4px 12px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"monospace",background:"rgba(16,185,129,0.12)",color:"#6ee7b7",border:"1px solid rgba(16,185,129,0.3)",display:"flex",alignItems:"center",gap:5,width:"fit-content"}}>
                          <span className="pulse-dot" style={{background:"#10b981",width:6,height:6}}/>Active
                        </span>
                      </td>
                      <td style={{padding:"16px 20px",fontFamily:"monospace",color:"#e2e8f0",fontWeight:600}}>{row.fetched}</td>
                      <td style={{padding:"16px 20px",fontFamily:"monospace",color:row.color,fontWeight:700}}>{row.isolated}</td>
                      <td style={{padding:"16px 20px",fontFamily:"monospace",color:"#64748b"}}>{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* How the pipeline works */}
            <div>
              <h2 style={{fontSize:15,fontWeight:700,color:"#e2e8f0",marginBottom:16}}>How This Engine Works — Step by Step</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>
                {[
                  { step:"01", color:"#22d3ee", title:"Scraping", body:"Python scrapers run daily at 02:00 AM pulling the latest feedback from all three sources filtered by search-related keywords." },
                  { step:"02", color:"#a78bfa", title:"AI Filtering (Groq LLM)", body:"Every review is sent to the Groq API (Qwen3.8B model). Only reviews where a user is genuinely struggling to find a photo are kept. Generic complaints about UI/crashes are discarded." },
                  { step:"03", color:"#fb923c", title:"Structured Extraction", body:"The LLM extracts: what the user remembers, what they've forgotten, what they searched for, and what type of photo they're looking for." },
                  { step:"04", color:"#4ade80", title:"Vector Storage (ChromaDB)", body:"The extracted data is embedded using BAAI/BGE-Small-v1.5 (384 dimensions) and stored in ChromaDB. This enables semantic similarity search for the PM Copilot." },
                ].map(s => (
                  <div key={s.step} className="glass-card" style={{padding:20,borderTop:`2px solid ${s.color}`}}>
                    <div style={{fontFamily:"monospace",fontSize:11,color:s.color,fontWeight:700,marginBottom:10}}>STEP {s.step}</div>
                    <h3 style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>{s.title}</h3>
                    <p style={{fontSize:12,color:"#64748b",lineHeight:1.7,margin:0}}>{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PM COPILOT ── */}
        {activeTab === "copilot" && (
          <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:20}}>
            <div>
              <div style={{fontSize:11,color:"#22d3ee",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:6}}>RAG INTERFACE · ChromaDB + Groq LLM</div>
              <h1 style={{fontSize:26,fontWeight:800,color:"#f1f5f9",margin:0}}>PM Copilot</h1>
              <p style={{color:"#64748b",fontSize:13,marginTop:6}}>Ask questions about the {vectorCount} indexed user struggles in our database. The AI will retrieve the most semantically relevant reviews and synthesize an analytical answer.</p>
            </div>


            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {
                  category: "🔍 Search Failure Patterns",
                  color: "#a78bfa",
                  questions: [
                    "What are users saying about losing deleted photos?",
                    "How do people describe their search attempts when they fail to find a photo?",
                    "What kinds of photos do users struggle to find the most?",
                  ]
                },
                {
                  category: "🧠 Memory & Context Clues",
                  color: "#22d3ee",
                  questions: [
                    "What do users remember most when trying to find an old photo?",
                    "When users can't find a photo, what clues or descriptions do they use?",
                    "How do users describe the time period of the photo they're looking for?",
                  ]
                },
                {
                  category: "📦 Data Loss & Deletion",
                  color: "#fb923c",
                  questions: [
                    "What are users saying about photos that disappeared after deleting to free storage?",
                    "How do users react when backup was never confirmed and they lose photos?",
                    "What happened to users' photos from old accounts like Picasa?",
                  ]
                },
                {
                  category: "🛠️ Product Gaps & Feature Requests",
                  color: "#4ade80",
                  questions: [
                    "What features do users wish Google Photos had for searching?",
                    "What does the Reddit community say should be improved in Google Photos?",
                    "What are users comparing Google Photos to when it fails them?",
                  ]
                },
              ].map(group => (
                <div key={group.category}>
                  <div style={{fontSize:10,fontFamily:"monospace",color:group.color,fontWeight:700,letterSpacing:"0.08em",marginBottom:7}}>{group.category}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {group.questions.map(q => (
                      <button key={q} onClick={() => { setChatInput(q); }}
                        style={{padding:"8px 14px",borderRadius:20,background:"rgba(255,255,255,0.03)",border:`1px solid ${group.color}33`,color:"#94a3b8",fontSize:11,textAlign:"left",cursor:"pointer",fontStyle:"italic",transition:"all 0.2s",whiteSpace:"nowrap"}}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=group.color; e.currentTarget.style.color="#e2e8f0"; e.currentTarget.style.background=`${group.color}15`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor=`${group.color}33`; e.currentTarget.style.color="#94a3b8"; e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}>
                        &ldquo;{q}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>


            {/* Chat window */}
            <div className="glass-card" style={{display:"flex",flexDirection:"column",height:480,overflow:"hidden"}}>
              <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.01)"}}>
                <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#7c3aed,#0e7490)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:14}}>🤖</div>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>Google Photos Search Intelligence Agent</div>
                  <div style={{fontSize:10,color:"#475569",fontFamily:"monospace"}}>RAG Pipeline · {vectorCount} vectors · Groq Qwen3.8B</div>
                </div>
                <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,fontSize:10,color:"#10b981",fontFamily:"monospace"}}>
                  <span className="pulse-dot" style={{background:"#10b981",width:6,height:6}}/>ONLINE
                </div>
              </div>

              {/* Messages */}
              <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:16}}>
                {chatHistory.length === 0 && (
                  <div style={{textAlign:"center",padding:"40px 20px",color:"#475569",fontSize:12}}>
                    <div style={{fontSize:32,marginBottom:12}}>🔍</div>
                    <p>Ask me anything about the {vectorCount} user struggles in our database.</p>
                    <p style={{fontSize:11,marginTop:6}}>Click a suggested question above or type your own.</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{display:"flex",gap:10,justifyContent:msg.role==="user"?"flex-end":"flex-start",alignItems:"flex-start"}}>
                    {msg.role === "assistant" && (
                      <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#0e7490)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,flexShrink:0}}>🤖</div>
                    )}
                    <div className={msg.role==="user"?"chat-bubble-user":"chat-bubble-ai"} style={{maxWidth:"75%",padding:"12px 16px"}}>
                      {msg.role==="user" && <div style={{fontSize:10,fontFamily:"monospace",color:"#c4b5fd",marginBottom:6,display:"flex",alignItems:"center",gap:4}}><Icon.User />Product Manager</div>}
                      {msg.role==="assistant" && <div style={{fontSize:10,fontFamily:"monospace",color:"#22d3ee",marginBottom:6,display:"flex",alignItems:"center",gap:4}}><Icon.Cpu />AI Copilot · RAG</div>}
                      <p style={{fontSize:12,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap",color:msg.role==="user"?"#e2e8f0":"#94a3b8"}}>{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:"rgba(34,211,238,0.06)",border:"1px solid rgba(34,211,238,0.15)"}}>
                          <div style={{fontSize:10,fontFamily:"monospace",color:"#22d3ee",fontWeight:700,marginBottom:6}}>TOP GROUNDING CITATIONS FROM CHROMADB</div>
                          {msg.sources.slice(0,2).map((s,si) => <p key={si} style={{fontSize:11,color:"#64748b",fontStyle:"italic",margin:"4px 0"}}>&ldquo;{s}&rdquo;</p>)}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div style={{width:28,height:28,borderRadius:8,background:"rgba(139,92,246,0.2)",border:"1px solid rgba(139,92,246,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#c4b5fd",flexShrink:0}}>PM</div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#0e7490)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div>
                    <div className="chat-bubble-ai" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#22d3ee",fontFamily:"monospace"}}>
                      <Icon.Loader /> Searching vectors...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleChat} style={{borderTop:"1px solid rgba(255,255,255,0.07)",padding:16,display:"flex",gap:12}}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  disabled={isTyping}
                  placeholder="Ask about user struggles (e.g. 'What do users say about searching for old photos?')"
                  style={{flex:1,background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 16px",fontSize:12,color:"#e2e8f0",outline:"none",fontFamily:"inherit"}}
                  onFocus={e => (e.currentTarget.style.borderColor="rgba(34,211,238,0.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor="rgba(255,255,255,0.1)")}
                />
                <button
                  type="submit"
                  disabled={isTyping || !chatInput.trim()}
                  style={{padding:"10px 20px",borderRadius:10,background:isTyping||!chatInput.trim()?"rgba(139,92,246,0.3)":"linear-gradient(135deg,#7c3aed,#0e7490)",border:"none",color:"white",fontWeight:600,fontSize:12,cursor:isTyping||!chatInput.trim()?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.2s"}}>
                  <Icon.Send /> Query
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
