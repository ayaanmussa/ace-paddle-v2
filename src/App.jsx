/* eslint-disable */
import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const MOCK_MEMBERS = [
  { id:"m0", name:"Demo Member",    email:"demo@ace.com",   phone:"0880000000", points:100,  tier:"Bronze",  avatar:"DM", gender:"male",   joined:"2026-01-01", bookings:0,  wins:0,  ratingTotal:0,   ratingCount:0,  showOnLeaderboard:true, showRating:true },
  { id:"m1", name:"Ayaan Mussa",    email:"ayaan@ace.com",  phone:"0881234567", points:2450, tier:"Gold",    avatar:"AM", gender:"male",   joined:"2025-01-10", bookings:34, wins:18, ratingTotal:186, ratingCount:42, showOnLeaderboard:true, showRating:true },
  { id:"m2", name:"Zara Ahmed",     email:"zara@ace.com",   phone:"0882345678", points:3600, tier:"Platinum",avatar:"ZA", gender:"female", joined:"2024-11-05", bookings:58, wins:31, ratingTotal:276, ratingCount:60, showOnLeaderboard:true, showRating:true },
  { id:"m3", name:"Tariq Hassan",   email:"tariq@ace.com",  phone:"0883456789", points:1850, tier:"Silver",  avatar:"TH", gender:"male",   joined:"2025-03-22", bookings:19, wins:9,  ratingTotal:72,  ratingCount:18, showOnLeaderboard:true, showRating:true },
  { id:"m4", name:"Nadia Patel",    email:"nadia@ace.com",  phone:"0884567890", points:420,  tier:"Bronze",  avatar:"NP", gender:"female", joined:"2025-05-01", bookings:6,  wins:2,  ratingTotal:18,  ratingCount:5,  showOnLeaderboard:true, showRating:true },
  { id:"m5", name:"Omar Rashid",    email:"omar@ace.com",   phone:"0885678901", points:2800, tier:"Gold",    avatar:"OR", gender:"male",   joined:"2025-02-14", bookings:44, wins:22, ratingTotal:210, ratingCount:46, showOnLeaderboard:true, showRating:true },
  { id:"m6", name:"Layla Ibrahim",  email:"layla@ace.com",  phone:"0886789012", points:980,  tier:"Bronze",  avatar:"LI", gender:"female", joined:"2025-04-18", bookings:11, wins:4,  ratingTotal:44,  ratingCount:12, showOnLeaderboard:true, showRating:true },
];

const avgRating = m => m.ratingCount > 0 ? (m.ratingTotal / m.ratingCount) : 0;


const MOCK_REWARDS = [
  { id:"r1", title:"MWK 10,000 Off Peak Session",     points:950,  tier:"Bronze",   uses:0, maxUses:null, active:true, desc:"MWK 10,000 discount on any peak hour booking" },
  { id:"r2", title:"MWK 10,000 Off Off-Peak Session", points:700,  tier:"Bronze",   uses:0, maxUses:null, active:true, desc:"MWK 10,000 discount on any off-peak booking" },
  { id:"r3", title:"Free 1-Hour Off-Peak Session",    points:2000, tier:"Silver",   uses:0, maxUses:null, active:true, desc:"One free hour at off-peak rate — any day" },
  { id:"r4", title:"MWK 20,000 Off Peak Session",     points:2800, tier:"Silver",   uses:0, maxUses:null, active:true, desc:"MWK 20,000 discount on any peak hour booking" },
  { id:"r5", title:"MWK 20,000 Off Off-Peak Session", points:2300, tier:"Silver",   uses:0, maxUses:null, active:true, desc:"MWK 20,000 discount on any off-peak booking" },
  { id:"r6", title:"Free 1-Hour Peak Session",        points:3600, tier:"Gold",     uses:0, maxUses:null, active:true, desc:"One free peak hour — any day" },
];

const TIERS = [
  { name:"Bronze",   min:0,    max:1799, color:"#cd7f32", bg:"rgba(205,127,50,.15)",  icon:"🥉" },
  { name:"Silver",   min:1800, max:2399, color:"#c0c0c0", bg:"rgba(192,192,192,.15)", icon:"🥈" },
  { name:"Gold",     min:2400, max:3499, color:"#f0c040", bg:"rgba(240,192,64,.15)",  icon:"🥇" },
  { name:"Platinum", min:3500, max:Infinity, color:"#e5e4e2", bg:"rgba(229,228,226,.15)", icon:"💎" },
];

const getTier = pts => TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];
const fmt = n => Number(n).toLocaleString();

// ── PRICING DEFAULTS (overridable via admin Settings) ──
const DEFAULT_PRICES = {
  offPeak: 30000,   // per hour off-peak
  peak:    65000,   // per hour peak
  twoHour: 125000,  // 2-hour flat
};
// Settings stored in Root state — loaded from localStorage key "ace_settings"
function loadSettings() {
  try { return JSON.parse(localStorage.getItem("ace_settings")||"null")||{...DEFAULT_PRICES}; } catch { return {...DEFAULT_PRICES}; }
}
function saveSettings(s) { try { localStorage.setItem("ace_settings",JSON.stringify(s)); } catch {} }

// ── THEME TOKENS ──────────────────────────────────────────────────────────────
const DARK = {
  bg:"#05080f",        bgCard:"#060c16",    bgCard2:"#080f1c",  bgInput:"#050810",
  bgSection:"#0d1520", bgSection2:"#080e1a",
  border:"#0c1828",    borderMid:"#1a2e44", borderLight:"#0c1828",
  text:"#dce8f5",      textMid:"#3a5878",   textFaint:"#2a4060", textTiny:"#1e3050",
  accent:"#f97316",    success:"#22c55e",   cyan:"#06b6d4",      purple:"#a78bfa",
  headerBg:"linear-gradient(160deg,#0d1520 0%,#05080f 60%)",
  // Slot colours
  slotOff:"rgba(34,197,94,.07)",      slotOffBorder:"rgba(34,197,94,.3)",   slotOffText:"#22c55e",
  slotPk:"rgba(249,115,22,.07)",      slotPkBorder:"rgba(249,115,22,.3)",   slotPkText:"#f97316",
  slotFull:"rgba(124,58,237,.08)",    slotFullBorder:"rgba(124,58,237,.3)", slotFullText:"#6b3aaa",
  slotWait:"rgba(124,58,237,.15)",    slotWaitText:"#a78bfa",
  nav:"rgba(6,10,20,.97)", navBorder:"#0c1828", navText:"#2a4060", navActive:"#f97316",
  logoBg:"#ede7de", logoText:"#1e1a16", splashBg:"#111",
};
const LIGHT = {
  bg:"#f5f3f0",        bgCard:"#ffffff",    bgCard2:"#f0ede8",  bgInput:"#ece8e2",
  bgSection:"#ffffff", bgSection2:"#f0ede8",
  border:"rgba(30,26,22,.1)", borderMid:"rgba(30,26,22,.18)", borderLight:"rgba(30,26,22,.06)",
  text:"#1e1a16",      textMid:"#7a7068",   textFaint:"#b0a898", textTiny:"#c0b8b0",
  accent:"#1e1a16",    success:"#2d6a4f",   cyan:"#1d5fa0",      purple:"#5d3aad",
  headerBg:"#ffffff",
  // Slot colours — warm neutrals for light mode
  slotOff:"rgba(30,26,22,.05)",       slotOffBorder:"rgba(30,26,22,.18)",   slotOffText:"#2d6a4f",
  slotPk:"rgba(30,26,22,.08)",        slotPkBorder:"rgba(30,26,22,.22)",    slotPkText:"#1e1a16",
  slotFull:"rgba(30,26,22,.04)",      slotFullBorder:"rgba(30,26,22,.15)",  slotFullText:"rgba(30,26,22,.4)",
  slotWait:"rgba(109,58,237,.12)",    slotWaitText:"#5d3aad",
  nav:"rgba(255,255,255,.97)", navBorder:"rgba(30,26,22,.1)", navText:"#c0b8b0", navActive:"#1e1a16",
  logoBg:"#ffffff", logoText:"rgba(30,26,22,.25)", splashBg:"#f5f3f0",
};

function loadTheme() {
  try { return localStorage.getItem("ace_theme")||"dark"; } catch { return "dark"; }
}
function saveTheme(t) { try { localStorage.setItem("ace_theme",t); } catch {} }


// ── SESSION PERSISTENCE (Remember Me) ──
// When Supabase is connected, replace these with supabase.auth session handling
function saveSession(member) {
  try { localStorage.setItem("ace_session", JSON.stringify({id:member.id, email:member.email, savedAt:Date.now()})); } catch {}
}
function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem("ace_session")||"null");
    if(!s) return null;
    // Session expires after 30 days
    if(Date.now() - s.savedAt > 30*24*60*60*1000) { clearSession(); return null; }
    return s;
  } catch { return null; }
}
function clearSession() { try { localStorage.removeItem("ace_session"); } catch {} }

// ── SUPABASE ADAPTER (swap this section when connecting Supabase) ──
// Currently uses local React state. Once Supabase is set up:
//   1. Replace supadb.getBookings()  → supabase.from("bookings").select("*")
//   2. Replace supadb.addBooking(bk) → supabase.from("bookings").insert(bk)
//   3. Add real-time: supabase.channel("bookings").on("INSERT", ...).subscribe()
// All booking reads/writes in the app already go through onBook / bookings prop
// so wiring Supabase only requires changing Root — not individual components.
const supadb = {
  // Placeholder — will be replaced with real Supabase calls
  isConnected: false,
};

// ── SLOT HELPERS ──
// Build 30-min slots for a date key
function buildSlots30(dateKey) {
  // Core slots: 05:00 to 23:30
  const s = [];
  for(let h=5;h<24;h++){s.push(String(h).padStart(2,"0")+":00");s.push(String(h).padStart(2,"0")+":30");}
  return s;
}

function buildHourSlots(dateKey, durH) {
  const d = durH||1;
  const slots = [];
  // Core: 05:00 to 22:00 (for 1h, last slot 23:00 ends midnight; for 2h, last slot 22:00 ends midnight)
  for(let h=5;h<24;h++){
    if(h+d<=24) slots.push(String(h).padStart(2,"0")+":00");
  }
  return [...new Set(slots)];
}

function isPeak(startTime) {
  // Off-peak: 05:00–15:59. Peak: 16:00 onwards (including late night 00:xx)
  const h = Number(startTime.split(":")[0]);
  return h>=16 || h<5; // midnight slots (00, 01) are peak
}

function calcPrice(startTime, durH, prices) {
  if(durH===2) return prices.twoHour||DEFAULT_PRICES.twoHour;
  return isPeak(startTime) ? (prices.peak||DEFAULT_PRICES.peak) : (prices.offPeak||DEFAULT_PRICES.offPeak);
}
function slotEndTime(startTime, durH) {
  const [h,m] = startTime.split(":").map(Number);
  const mins = h*60+m+durH*60;
  return String(Math.floor(mins/60)%24).padStart(2,"0")+":"+String(mins%60).padStart(2,"0");
}
// Check if a time slot is booked (checks all slots within the duration)
function isSlotBooked(bookings, courtId, dateKey, startTime, durH, blockouts) {
  const slots30 = buildSlots30(dateKey);
  const si = slots30.indexOf(startTime);
  if(si===-1) return false;
  // Check blockouts
  for(const bl of (blockouts||[])) {
    if(bl.dateKey!==dateKey) continue;
    if(bl.courtId && bl.courtId!==courtId) continue;
    if(bl.allDay) return true;
    // Time-based blockout
    if(bl.startTime && bl.endTime) {
      const bsi=slots30.indexOf(bl.startTime), bei=slots30.indexOf(bl.endTime);
      const needSlots=durH*2;
      for(let k=0;k<needSlots;k++){if(si+k>=bsi&&si+k<bei) return true;}
    }
  }
  // Check existing bookings
  const occupied = new Set();
  for(const b of (bookings||[])) {
    if(b.courtId!==courtId||b.dateKey!==dateKey||b.status==="cancelled") continue;
    const bi = slots30.indexOf(b.time);
    if(bi===-1) continue;
    const bDurSlots = (b.dur||1)*2;
    for(let k=0;k<bDurSlots;k++) occupied.add(bi+k);
  }
  const needSlots = durH*2;
  for(let k=0;k<needSlots;k++){if(occupied.has(si+k)) return true;}
  return false;
}

// ═══════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════
export default function Root() {
  const [screen,   setScreen]   = useState("splash");
  const [themeKey, setThemeKey] = useState(loadTheme); // "dark" | "light"
  const TH = themeKey==="light" ? LIGHT : DARK;
  function toggleTheme() { const n=themeKey==="dark"?"light":"dark"; setThemeKey(n); saveTheme(n); }
  const [member,   setMember]   = useState(null);
  const [members,  setMembers]  = useState(MOCK_MEMBERS);
  const [rewards,  setRewards]  = useState(MOCK_REWARDS);
  const [friends,  setFriends]  = useState(["m2","m5"]);
  const [bookings,       setBookings]       = useState([]);
  const [notifications,  setNotifications]  = useState([]);
  const [waitlist,  setWaitlist]  = useState([]);
  const [blockouts, setBlockouts] = useState([]);
  const [myRatings,    setMyRatings]    = useState({});
  const [redemptions,  setRedemptions]  = useState([]); // [{id,rewardId,memberId,code,redeemedAt,used}]
  const [tournaments, setTournaments] = useState([]);
  const [gameScores,  setGameScores]  = useState([]);
  const [playerPool,  setPlayerPool]  = useState([]); // [{id,memberId,name,avatar,note,date,slots,joinedAt}]
  const [openGames,   setOpenGames]   = useState([]); // [{id,memberId,name,avatar,note,date,time,court,spotsNeeded,players,joinedAt}]
  const [settings,    setSettings]    = useState(loadSettings);
  const [promoOffers, setPromoOffers] = useState([
    {id:"p1",title:"Friday Night Special",desc:"20% off all bookings",discType:"pct",discVal:20,dateType:"weekday",weekday:"5",timeFrom:"18:00",timeTo:"23:00",active:true,createdAt:"2025-06-01"},
    {id:"p2",title:"Off-Peak Bonanza",desc:"MWK 10,000 off every off-peak session",discType:"fixed",discVal:10000,dateType:"always",weekday:"",timeFrom:"05:00",timeTo:"16:00",active:false,createdAt:"2025-06-01"},
  ]);

  // Splash auto-advance
  useEffect(()=>{ if(screen==="splash"){ const t=setTimeout(()=>setScreen("home"),2200); return()=>clearTimeout(t); }},[screen]);

  const addPoints = (memberId, pts) => {
    setMembers(ms=>ms.map(m=>m.id===memberId?{...m,points:m.points+pts}:m));
    if(member?.id===memberId) setMember(m=>({...m,points:m.points+pts}));
  };

  const ratePlayer = (targetId, stars) => {
    const prev = myRatings[targetId];
    setMyRatings(r=>({...r,[targetId]:stars}));
    setMembers(ms=>ms.map(m=>{
      if(m.id!==targetId) return m;
      // Remove old rating if re-rating, then add new
      const prevTotal = prev ? m.ratingTotal - prev : m.ratingTotal;
      const prevCount = prev ? m.ratingCount - 1  : m.ratingCount;
      return {...m, ratingTotal: prevTotal + stars, ratingCount: prevCount + 1};
    }));
  };

  const navItems = [
    {id:"home",       icon:"⚡", label:"Home"},
    {id:"book",       icon:"🎾", label:"Book"},
    {id:"play",       icon:"🏓", label:"Play"},
    {id:"leaderboard",icon:"🏆", label:"Ranks"},
    {id:"profile",    icon:"👤", label:"Me"},
  ];

  const showNav = !["splash","register","login"].includes(screen);

  return (
    <div style={{minHeight:"100vh",background:TH.bg,fontFamily:"'Outfit',sans-serif",color:TH.text,maxWidth:430,margin:"0 auto",position:"relative",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Josefin+Sans:wght@100;200;300&family=Outfit:wght@300;400;500;600;700;800;900&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:0;height:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pop{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px #f9731440}50%{box-shadow:0 0 40px #f9731480}}
        .fu{animation:fadeUp .4s ease both}
        .fi{animation:fadeIn .3s ease both}
        input::placeholder{color:#3a5878}
        input:focus{outline:none}
        textarea:focus{outline:none}
      `}</style>

      {screen==="splash"   && <SplashScreen/>}
      {screen==="home"     && <HomeScreen member={member} onNav={setScreen} onLogin={()=>setScreen("login")} onRegister={()=>setScreen("register")} TH={TH} themeKey={themeKey} onToggleTheme={toggleTheme}/>}
      {screen==="book"     && <BookScreen
          TH={TH}
          member={member}
          bookings={bookings}
          waitlist={waitlist}
          onBook={async bk=>{
            // Step 1: Optimistic — block slot in local state IMMEDIATELY
            setBookings(bs=>[bk,...bs]);
            setNotifications(ns=>[{id:"n"+Date.now(),bookingId:bk.id,type:"new",msg:"📩 New: "+bk.name+" — Court "+bk.courtId+" · "+bk.date+" · "+bk.time+"–"+bk.endTime+" · "+bk.ref,time:new Date().toISOString(),read:false},...ns]);
            // Step 2 (TODO — Supabase): persist to database
            // if(supadb.isConnected) {
            //   const {error} = await supabase.from("bookings").insert([bk]);
            //   if(error) { setBookings(bs=>bs.filter(b=>b.id!==bk.id)); alert("Booking failed — please try again"); }
            // }
            // Real-time subscription in Root will broadcast to all devices automatically.
          }}
          onWaitlist={w=>setWaitlist(ws=>[w,...ws])}
          onCancelWaitlist={id=>setWaitlist(ws=>ws.filter(w=>w.id!==id))}
          onCancelBooking={id=>setBookings(bs=>bs.map(b=>b.id===id?{...b,status:"cancelled"}:b))}
          onPoints={(p)=>member&&addPoints(member.id,p)}
          onRegister={()=>setScreen('register')}
          onLogin={()=>setScreen('login')}
          promoOffers={promoOffers} settings={settings} blockouts={blockouts}/>}
      {screen==="play"       && <PlayScreen
          TH={TH}
          member={member} members={members} friends={friends}
          bookings={bookings} gameScores={gameScores}
          tournaments={tournaments}
          onAddScore={s=>setGameScores(gs=>[s,...gs])}
          onCreateTournament={t=>setTournaments(ts=>[t,...ts])}
          onUpdateTournament={(id,p)=>setTournaments(ts=>ts.map(t=>t.id===id?{...t,...p}:t))}
          onRegister={()=>setScreen("register")}
          onLogin={()=>setScreen("login")}
          onAddPoints={addPoints}
          playerPool={playerPool}
          openGames={openGames}
          onJoinPool={e=>setPlayerPool(p=>[e,...p])}
          onLeavePool={id=>setPlayerPool(p=>p.filter(x=>x.id!==id))}
          onPostGame={g=>setOpenGames(gs=>[g,...gs])}
          onJoinGame={(gid)=>setOpenGames(gs=>gs.map(g=>g.id===gid?{...g,players:[...(g.players||[]),{id:member?.id,name:member?.name,avatar:member?.avatar}]}:g))}
          onCloseGame={id=>setOpenGames(gs=>gs.filter(g=>g.id!==id))}/>}
      {screen==="leaderboard"&&<LeaderboardScreen TH={TH} members={members} member={member} friends={friends} myRatings={myRatings} onRate={ratePlayer} onRegister={()=>setScreen("register")} onLogin={()=>setScreen("login")}/>}
      {screen==="offers"   && <OffersScreen TH={TH} rewards={rewards} member={member}
          redemptions={redemptions}
          onRedeem={(rewardId)=>{
            const r=rewards.find(x=>x.id===rewardId); if(!r||!member) return;
            setMembers(ms=>ms.map(m=>m.id===member.id?{...m,points:Math.max(0,m.points-r.points)}:m));
            setMember(m=>({...m,points:Math.max(0,m.points-r.points)}));
            setRewards(rs=>rs.map(x=>x.id===rewardId?{...x,uses:(x.uses||0)+1}:x));
            const code="RWD-"+Math.random().toString(36).slice(2,7).toUpperCase();
            setRedemptions(rs=>[{id:"rdm"+Date.now(),rewardId,memberId:member.id,memberName:member.name,rewardTitle:r.title,pointsCost:r.points,code,redeemedAt:new Date().toISOString(),used:false},...rs]);
          }}/>}
      {screen==="profile"  && <ProfileScreen TH={TH} member={member} members={members} friends={friends} setFriends={setFriends} setMembers={setMembers} setMember={setMember} bookings={bookings} onNav={setScreen} onLogin={()=>setScreen("login")} onRegister={()=>setScreen("register")} onLogout={()=>{setMember(null);clearSession();setScreen("home");}}/>}
      {screen==="register" && <RegisterScreen TH={TH} onDone={(m)=>{setMember(m);setMembers(ms=>[...ms,m]);setScreen("home");}} onBack={()=>setScreen("home")} onLogin={()=>setScreen("login")}/>}
      {screen==="login"    && <LoginScreen TH={TH} members={members} onDone={(m)=>{setMember(m);setScreen("home");}} onBack={()=>setScreen("home")} onRegister={()=>setScreen("register")}/>}
      {screen==="admin"    && <AdminScreen
          TH={TH}
          members={members} rewards={rewards} bookings={bookings} waitlist={waitlist}
          promoOffers={promoOffers} setPromoOffers={setPromoOffers} tournaments={tournaments}
          setRewards={setRewards} onAddPoints={addPoints}
          onUpdateTournament={(id,p)=>setTournaments(ts=>ts.map(t=>t.id===id?{...t,...p}:t))}
          onCreateTournament={t=>setTournaments(ts=>[t,...ts])}
          onUpdateBooking={(id,p)=>setBookings(bs=>bs.map(b=>b.id===id?{...b,...p}:b))}
          onCancelWaitlist={(id)=>setWaitlist(ws=>ws.filter(w=>w.id!==id))}
          settings={settings}
          onSaveSettings={(s)=>{setSettings(s);saveSettings(s);}}
          blockouts={blockouts}
          onAddBlockout={bl=>setBlockouts(bs=>[{...bl,id:"bl"+Date.now()},...bs])}
          onRemoveBlockout={id=>setBlockouts(bs=>bs.filter(b=>b.id!==id))}
          notifications={notifications}
          onMarkRead={(id)=>setNotifications(ns=>ns.map(n=>n.id===id?{...n,read:true}:n))}
          onClearNotifs={()=>setNotifications(ns=>ns.map(n=>({...n,read:true})))}
          redemptions={redemptions}
          onMarkRedemptionUsed={(id)=>setRedemptions(rs=>rs.map(r=>r.id===id?{...r,used:true}:r))}
          onBack={()=>setScreen("home")}/>}

      {showNav && (
        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:TH.nav,borderTop:"1px solid "+TH.navBorder,backdropFilter:"blur(20px)",display:"flex",zIndex:100}}>
          {navItems.map(n=>{
            const active = screen===n.id || (n.id==="profile"&&["register","login"].includes(screen));
            return(
              <button key={n.id} onClick={()=>setScreen(n.id)} style={{flex:1,padding:"10px 0 14px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all .2s"}}>
                <span style={{fontSize:20,filter:active?"none":"grayscale(1)",opacity:active?1:.45}}>{n.icon}</span>
                <span style={{fontSize:9,fontWeight:800,letterSpacing:1,textTransform:"uppercase",color:active?TH.navActive:TH.navText}}>{n.label}</span>
                {active&&<span style={{width:4,height:4,borderRadius:"50%",background:"#f97316",animation:"pulse 2s infinite"}}/>}
              </button>
            );
          })}
          {/* Hidden admin access */}
          <button onClick={()=>setScreen("admin")} style={{position:"absolute",right:0,top:0,width:44,height:44,opacity:.01,border:"none",background:"transparent",cursor:"pointer"}}/>
        </nav>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SPLASH
// ═══════════════════════════════════════════════════════════════
function SplashScreen() {
  const th = loadTheme();
  // Dark logo: cream bg, dark text. Light logo: white bg, lighter text (as per ace-app-light.pdf)
  const iconBg   = th==="light" ? "#ffffff" : "#ede7de";
  const iconText = th==="light" ? "rgba(42,36,32,.35)" : "#1e1a16";
  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:th==="light"?"#f5f3f0":"#111",position:"relative",overflow:"hidden"}}>

      {/* App icon — exact match */}
      <div style={{
        width:180,height:180,borderRadius:44,
        background:iconBg,
        display:"flex",alignItems:"center",justifyContent:"center",
        position:"relative",overflow:"hidden",
        boxShadow:"0 2px 4px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.4), 0 24px 60px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.6)",
        animation:"pop .65s cubic-bezier(.34,1.56,.64,1) .2s both",
      }}>
        {/* Warm gradient overlay */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,rgba(255,255,255,.18) 0%,transparent 60%)",borderRadius:"inherit",pointerEvents:"none"}}/>
        <div style={{
          fontFamily:"'Josefin Sans',sans-serif",
          fontWeight:100,
          fontSize:48,
          letterSpacing:"0.35em",
          marginRight:"-0.35em",
          color:iconText,
          textTransform:"uppercase",
          lineHeight:1,
          position:"relative",zIndex:1,
        }}>ACE</div>
      </div>

      {/* App label below icon */}
      <div style={{
        marginTop:16,
        fontFamily:"'Josefin Sans',sans-serif",
        fontWeight:300,
        fontSize:13,
        letterSpacing:"0.25em",
        color:th==="light"?"rgba(30,26,22,.7)":"rgba(255,255,255,.85)",
        textTransform:"uppercase",
        animation:"fadeUp .5s ease .7s both",
      }}>ACE</div>

      {/* PLAY COMPETE RECOVER */}
      <div style={{
        marginTop:7,
        fontFamily:"'Josefin Sans',sans-serif",
        fontWeight:300,
        fontSize:10,
        letterSpacing:"0.28em",
        color:th==="light"?"rgba(30,26,22,.5)":"rgba(255,255,255,.55)",
        textTransform:"uppercase",
        animation:"fadeUp .5s ease .85s both",
      }}>PLAY COMPETE RECOVER</div>

      {/* Loading dots */}
      <div style={{marginTop:44,display:"flex",gap:7,animation:"fadeUp .4s ease 1.1s both"}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{
            width:4,height:4,borderRadius:"50%",
            background:th==="light"?"rgba(30,26,22,.25)":"rgba(255,255,255,.2)",
            animation:`pulse 1.2s ease ${i*.25}s infinite`,
          }}/>
        ))}
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════════
function HomeScreen({member, onNav, onLogin, onRegister, TH, themeKey, onToggleTheme}) {
  const tier = member ? getTier(member.points) : null;
  const nextTier = member ? TIERS[TIERS.findIndex(t=>t.name===tier.name)+1] : null;
  const progress = member && nextTier ? ((member.points - tier.min)/(nextTier.min - tier.min))*100 : 100;

  return(
    <div style={{minHeight:"100vh",paddingBottom:80,background:TH.bg}}>

      {/* ── HERO ── */}
      <div style={{position:"relative",overflow:"hidden",
        background:themeKey==="dark"?"#1e1a16":"#ffffff",
        minHeight:300,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:"70px 22px 40px"}}>

        {/* Light mode: subtle warm gloss */}
        {themeKey==="light"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,rgba(255,255,255,.3) 0%,transparent 55%)",pointerEvents:"none"}}/>}

        {/* BIG ACE */}
        <div style={{
          fontFamily:"'Josefin Sans',sans-serif",
          fontWeight:100,
          fontSize:"clamp(72px,22vw,120px)",
          letterSpacing:"0.5em",
          marginRight:"-0.5em",
          color:themeKey==="dark"?"#ede7de":"rgba(30,26,22,.3)",
          textTransform:"uppercase",
          lineHeight:1,
          position:"relative",zIndex:1,
        }}>ACE</div>

        {/* Tagline with dots — dark: #a09080, light: rgba(30,26,22,.35) */}
        <div style={{
          marginTop:18,
          display:"flex",alignItems:"center",gap:12,
          fontFamily:"'Josefin Sans',sans-serif",
          fontWeight:300,
          fontSize:11,
          letterSpacing:"0.28em",
          marginRight:"-0.28em",
          color:themeKey==="dark"?"#a09080":"rgba(30,26,22,.4)",
          textTransform:"uppercase",
          position:"relative",zIndex:1,
        }}>
          PLAY
          <span style={{width:3,height:3,borderRadius:"50%",background:themeKey==="dark"?"#a09080":"rgba(30,26,22,.3)",flexShrink:0,display:"inline-block"}}/>
          COMPETE
          <span style={{width:3,height:3,borderRadius:"50%",background:themeKey==="dark"?"#a09080":"rgba(30,26,22,.3)",flexShrink:0,display:"inline-block"}}/>
          RECOVER
        </div>

        {/* Theme toggle */}
        <button onClick={onToggleTheme} style={{position:"absolute",top:18,right:18,zIndex:3,background:"transparent",border:"none",cursor:"pointer",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,opacity:.45}}>
          {themeKey==="dark"?"☀️":"🌙"}
        </button>

        {/* Welcome / member info — bottom of hero */}
        <div style={{position:"absolute",bottom:16,left:20,right:20,display:"flex",justifyContent:"space-between",alignItems:"flex-end",zIndex:2}}>
          <div>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:themeKey==="dark"?"rgba(237,231,222,.35)":"rgba(30,26,22,.35)",textTransform:"uppercase",marginBottom:3}}>Welcome back</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2,color:themeKey==="dark"?"#ede7de":"#1e1a16",lineHeight:1}}>{member?member.name.split(" ")[0]:"Guest"}</div>
          </div>
          {member&&tier&&(
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:themeKey==="dark"?tier.color:tier.color,textTransform:"uppercase"}}>{tier.icon} {tier.name}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:themeKey==="dark"?"#ede7de":"#1e1a16",lineHeight:1}}>{fmt(member.points)} pts</div>
            </div>
          )}
        </div>
      </div>

      {/* Tier progress bar */}
      {member&&nextTier&&(
        <div style={{background:themeKey==="dark"?"#1e1a16":"#ffffff",padding:"0 20px 14px"}}>
          <div style={{height:2,background:themeKey==="dark"?"rgba(237,231,222,.1)":"rgba(30,26,22,.1)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(100,progress)}%`,background:tier.color,borderRadius:2,transition:"width .6s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
            <span style={{fontSize:9,color:themeKey==="dark"?"#a09080":"rgba(30,26,22,.4)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{tier.name}</span>
            <span style={{fontSize:9,color:themeKey==="dark"?"#a09080":"rgba(30,26,22,.4)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{fmt(nextTier.min-member.points)} pts to {nextTier.name}</span>
          </div>
        </div>
      )}

      {/* Guest CTAs */}
      {!member&&(
        <div style={{background:themeKey==="dark"?"#1e1a16":"#ffffff",padding:"0 20px 20px",display:"flex",gap:10}}>
          <button onClick={onRegister} style={{flex:1,padding:"13px",borderRadius:12,border:"none",background:themeKey==="dark"?"#ede7de":"#1e1a16",color:themeKey==="dark"?"#1e1a16":"#ede7de",fontSize:13,fontWeight:300,cursor:"pointer",fontFamily:"'Josefin Sans',sans-serif",letterSpacing:"0.2em",textTransform:"uppercase"}}>Join</button>
          <button onClick={onLogin} style={{flex:1,padding:"13px",borderRadius:12,border:"1px solid "+(themeKey==="dark"?"rgba(237,231,222,.2)":"rgba(30,26,22,.2)"),background:"transparent",color:themeKey==="dark"?"#ede7de":"#1e1a16",fontSize:13,fontWeight:300,cursor:"pointer",fontFamily:"'Josefin Sans',sans-serif",letterSpacing:"0.2em",textTransform:"uppercase"}}>Sign In</button>
        </div>
      )}

      <div style={{padding:"20px 18px",display:"flex",flexDirection:"column",gap:14,background:TH.bg}} className="fu">
        {/* Quick Book */}
        <button onClick={()=>onNav("book")} style={{width:"100%",padding:"20px",borderRadius:20,border:"none",background:TH.bgCard,backgroundImage:"none",cursor:"pointer",textAlign:"left",position:"relative",overflow:"hidden",border:"1px solid "+TH.border,boxShadow:"0 4px 20px rgba(0,0,0,.08)"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,background:"radial-gradient(circle,#06b6d418 0%,transparent 70%)"}}/>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:TH.accent,textTransform:"uppercase",marginBottom:6}}>Quick Action</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:TH.text,marginBottom:4}}>Book a Court</div>
          <div style={{fontSize:12,color:TH.textMid}}>2 courts available today · From MWK 30,000/hr</div>
          <div style={{marginTop:14,display:"inline-flex",alignItems:"center",gap:6,background:TH.bgInput,border:"1px solid "+TH.border,borderRadius:50,padding:"6px 14px"}}>
            <span style={{fontSize:11,fontWeight:800,color:TH.accent}}>Book Now →</span>
          </div>
        </button>

        {/* Stats row */}
        {member&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[{l:"Sessions",v:member.bookings},{l:"Points",v:fmt(member.points)},{l:"Friends",v:3}].map(s=>(
              <div key={s.l} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:16,padding:"14px 12px",textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:TH.accent,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:9,color:TH.textFaint,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginTop:3}}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Today's slots teaser */}
        <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:20,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:800,color:TH.text}}>Today's Availability</div>
            <button onClick={()=>onNav("book")} style={{fontSize:11,color:TH.accent,fontWeight:700,background:"transparent",border:"none",cursor:"pointer"}}>View all →</button>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {["07:00","09:00","11:00","14:00","17:00","19:00"].map((t)=>(
              <div key={t} style={{padding:"7px 12px",borderRadius:50,background:TH===LIGHT?"rgba(30,26,22,.07)":"rgba(34,197,94,.1)",border:"1px solid "+(TH===LIGHT?"rgba(30,26,22,.15)":"rgba(34,197,94,.3)"),fontSize:12,fontWeight:700,color:TH===LIGHT?"#1e1a16":"#22c55e"}}>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Offers teaser */}
        <div onClick={()=>onNav("offers")} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:20,padding:"16px 18px",cursor:"pointer",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(124,58,237,.06),transparent)",backgroundSize:"200% auto",animation:"shimmer 3s linear infinite"}}/>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:TH.accent,textTransform:"uppercase",marginBottom:6}}>Member Rewards</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:TH.text,marginBottom:4}}>{MOCK_REWARDS.length} Active Offers Available</div>
          <div style={{fontSize:12,color:TH.textMid}}>Redeem your points for free sessions and discounts</div>
        </div>

        {/* Waitlist feature highlight */}
        <div onClick={()=>onNav("book")} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:20,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:46,height:46,borderRadius:14,background:"rgba(124,58,237,.2)",border:"1px solid rgba(167,139,250,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>⏳</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
              <span style={{fontSize:13,fontWeight:800,color:TH.text}}>Court Waitlist</span>
              <span style={{fontSize:8,fontWeight:800,color:TH.purple,background:"rgba(124,58,237,.2)",border:"1px solid rgba(167,139,250,.3)",borderRadius:50,padding:"2px 7px"}}>MEMBERS ONLY</span>
            </div>
            <div style={{fontSize:12,color:TH.textMid,lineHeight:1.5}}>Slot fully booked? Join the waitlist and get notified the moment it opens up.</div>
          </div>
          <div style={{fontSize:16,color:"#7c3aed"}}>→</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOOK SCREEN — full 14-day date selector + confirm modal + ref number
// ═══════════════════════════════════════════════════════════════
function makeDay(n) {
  const d = new Date(); d.setDate(d.getDate()+n);
  const dow = d.getDay();
  return {
    key: d.toISOString().slice(0,10),
    top: n===0?"Today":n===1?"Tomorrow":d.toLocaleDateString("en-GB",{weekday:"short"}),
    bot: d.toLocaleDateString("en-GB",{day:"numeric",month:"short"}),
    full: d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}),
    isFriSat: dow===5||dow===6,
    isWedThu: dow===3||dow===4,
  };
}
const DAYS14 = Array.from({length:30},(_,i)=>makeDay(i)); // 30-day window

function getFull(dateKey, court) {
  // No pre-filled bookings — all slots open by default
  // Real availability comes from Supabase once connected
  return [];
}

function genRef() {
  return "ACE-" + Math.random().toString(36).slice(2,7).toUpperCase();
}

// Returns true if booking can be cancelled (>24h before session start)
function canCancelBooking(booking) {
  if(!booking || !booking.dateKey || !booking.time) return true; // allow if no date info
  try {
    const [h, m] = booking.time.split(":").map(Number);
    const sessionDate = new Date(booking.dateKey);
    sessionDate.setHours(h, m, 0, 0);
    const hoursUntil = (sessionDate - new Date()) / 36e5;
    return hoursUntil > 24;
  } catch(e) { return true; }
}

function BookScreen({TH, member, bookings, waitlist, promoOffers, settings, blockouts, onBook, onWaitlist, onCancelWaitlist, onCancelBooking, onPoints, onRegister, onLogin}) {
  const [tab,     setTab]     = useState("book");
  const [day,     setDay]     = useState(DAYS14[0].key);

  // Always start on the Book tab when navigating here
  useEffect(()=>{ setTab("book"); },[]);
  const [dur,     setDur]     = useState(1);
  const [pending, setPending] = useState(null);     // slot selected → confirm sheet
  const [wlSlot,  setWlSlot]  = useState(null);     // full slot tapped → waitlist sheet
  const [wlGate,  setWlGate]  = useState(false);    // guest tapped waitlist → gate sheet
  const [form,    setForm]    = useState({name:"",phone:""});
  const [booked,  setBooked]  = useState(null);     // success screen
  const [err,     setErr]     = useState("");

  const cur       = DAYS14.find(d=>d.key===day);
  const prices    = settings||DEFAULT_PRICES;
  // Slots filtered by duration — 2h mode only shows start times with room for 2 hours
  const slots     = buildHourSlots(day, dur);

  // My bookings for this user
  const myBookings = member
    ? (bookings||[]).filter(b=>b.memberId===member.id)
    : [];

  const myWaitlist = member
    ? (waitlist||[]).filter(w=>w.memberId===member.id)
    : [];

  function tapSlot(courtId, t, isFull) {
    if(isFull) {
      if(!member) { setWlGate(true); return; }
      const endT = slotEndTime(t, dur);
      setWlSlot({courtId, time:t, endTime:endT, date:cur?.full, dateKey:day});
      return;
    }
    const endT  = slotEndTime(t, dur);
    const pk    = isPeak(t);
    const price = calcPrice(t, dur, prices);
    const isFri = new Date(day).getDay()===5;
    // Points: peak=80, off-peak=50 (80 on Fridays), 2h doubles
    const ptsBase = pk ? 80 : (isFri ? 80 : 50);
    const pts   = dur===2 ? ptsBase*2 : ptsBase;
    setPending({courtId, time:t, endTime:endT, date:cur?.full, dateKey:day, pts, price, pk, dur});
    setForm({name:member?.name||"", phone:member?.phone||""});
    setErr("");
  }

  function confirm() {
    if(!form.name.trim()){setErr("Please enter your name");return;}
    if(!form.phone.trim()){setErr("Please enter your phone number");return;}
    const bk = {
      ...pending,
      id:"bk"+Date.now(),
      ref:genRef(),
      dur:dur,
      name:form.name.trim(),
      phone:form.phone.trim(),
      memberId:member?.id||null,
      status:"confirmed",
      createdAt:new Date().toISOString()
    };
    // ── OPTIMISTIC UPDATE ──
    // Slot is blocked in local state INSTANTLY — no waiting for server.
    // When Supabase is connected, onBook() will ALSO call:
    //   await supabase.from("bookings").insert(bk)
    //   The real-time subscription on all other devices picks it up in <1 second.
    if(onBook) onBook(bk);
    setBooked(bk);
    setPending(null);
    if(member) onPoints(bk.pts);
  }

  function joinWaitlist() {
    const w = {
      id:"wl"+Date.now(),
      courtId:wlSlot.courtId, time:wlSlot.time, endTime:wlSlot.endTime,
      date:wlSlot.date, dateKey:wlSlot.dateKey,
      memberId:member.id, name:member.name, phone:member.phone,
      joinedAt:new Date().toISOString()
    };
    if(onWaitlist) onWaitlist(w);
    setWlSlot(null);
  }

  function reset() { setBooked(null); setForm({name:"",phone:""}); setErr(""); }

  // ── SUCCESS ──
  if(booked) return(
    <div style={{minHeight:"100vh",paddingBottom:180,overflowY:"auto"}} className="fu">
      <div style={{padding:"50px 22px 30px",textAlign:"center"}}>
        <div style={{width:76,height:76,borderRadius:"50%",margin:"0 auto 16px",background:"linear-gradient(135deg,#22c55e,#15803d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,boxShadow:"0 0 40px #22c55e55",animation:"pop .5s cubic-bezier(.34,1.56,.64,1)"}}>✓</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,letterSpacing:3,color:TH.text,marginBottom:4}}>Booking Confirmed!</div>
        <div style={{fontSize:12,color:TH.textMid,marginBottom:20}}>See you on the court — pay at reception</div>
        <div style={{background:TH.bgCard,border:"1px solid rgba(6,182,212,.3)",borderRadius:20,padding:"20px",marginBottom:14,textAlign:"left"}}>
          <div style={{textAlign:"center",marginBottom:16,paddingBottom:14,borderBottom:"1px solid "+TH.border}}>
            <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:TH.textFaint,textTransform:"uppercase",marginBottom:3}}>Booking Reference</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:5,color:"#06b6d4"}}>{booked.ref}</div>
            <div style={{fontSize:11,color:TH.textMid,marginTop:1}}>Screenshot & quote at reception</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:14}}>
            {[["Name",booked.name],["Phone",booked.phone],["Court","Court "+booked.courtId],["Date",booked.date],["Time",booked.time+" – "+booked.endTime],["Duration",booked.dur===2?"2 Hours":"1 Hour"],["Session",booked.pk?"Peak":"Off-Peak"]].map(([k,v])=>(
              <div key={k} style={{gridColumn:k==="Date"||k==="Name"?"span 2":undefined}}>
                <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{paddingTop:12,borderTop:"1px solid "+TH.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:2}}>Amount Due</div>
              <div style={{fontSize:11,color:TH.textMid}}>Cash at reception</div>
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:booked.pk?"#f97316":"#22c55e",lineHeight:1}}>MWK {Number(booked.price).toLocaleString()}</div>
          </div>
        </div>
        {member&&(
          <div style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.25)",borderRadius:14,padding:"11px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:"#22c55e",fontWeight:700}}>Points earned</span>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#22c55e"}}>+{booked.pts} pts 🎉</span>
          </div>
        )}
        <div style={{padding:"11px 14px",background:"rgba(249,115,22,.07)",border:"1px solid rgba(249,115,22,.2)",borderRadius:12,marginBottom:20,textAlign:"left"}}>
          <div style={{fontSize:11,color:"#f97316",fontWeight:700,marginBottom:3}}>Remember</div>
          <div style={{fontSize:11,color:TH.textMid,lineHeight:1.7}}>Screenshot this for your records · Arrive 5 min early · Pay cash at reception · Free cancellation 24h+ before session</div>
        </div>
      </div>
      {/* Sticky button — sits above the bottom nav bar */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,padding:"12px 20px 86px",background:"linear-gradient(0deg,"+TH.bg+" 70%,transparent)",zIndex:110}}>
        <button
          onClick={()=>{ reset(); }}
          style={{display:"block",width:"100%",padding:"17px",borderRadius:14,border:"none",
            background:"linear-gradient(135deg,#06b6d4,#0369a1)",color:TH.text,
            fontSize:16,fontWeight:900,cursor:"pointer",
            boxShadow:"0 8px 28px rgba(6,182,212,.4)",
            touchAction:"manipulation",
            WebkitTapHighlightColor:"transparent",
            WebkitAppearance:"none"}}>
          Book Another Session
        </button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",paddingBottom:90,background:TH.bg}}>

      {/* ── HEADER ── */}
      <div style={{background:TH.headerBg,padding:"50px 18px 0"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:TH.text}}>Book a Court</div>
        {member&&<div style={{fontSize:11,color:"#22c55e",fontWeight:700,marginTop:2}}>⚡ Earn points on every booking</div>}
        {/* Tabs */}
        <div style={{display:"flex",gap:0,marginTop:14,borderBottom:"1px solid "+TH.border}}>
          {[["book","🎾 Book"],["mybooking","📋 My Bookings"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"10px 20px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:tab===id?TH.text:TH.textMid,borderBottom:tab===id?"2px solid #f97316":"2px solid transparent"}}>
              {lbl}
              {id==="mybooking"&&myWaitlist.length>0&&<span style={{marginLeft:5,background:"#7c3aed",color:TH.text,borderRadius:50,padding:"1px 6px",fontSize:9,fontWeight:800}}>{myWaitlist.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── MY BOOKINGS TAB ── */}
      {tab==="mybooking"&&(
        <div style={{padding:"16px"}} className="fu">

          {/* ── GATE: not logged in ── */}
          {!member&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"50px 16px"}}>
              <div style={{width:72,height:72,borderRadius:22,background:TH.bgCard,border:"1px solid rgba(249,115,22,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:20,boxShadow:"0 0 30px rgba(249,115,22,.15)"}}>📋</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:TH.text,marginBottom:6}}>Members Only</div>
              <div style={{fontSize:13,color:TH.textMid,marginBottom:6,lineHeight:1.6}}>Sign in to see your bookings, manage sessions, and track your history.</div>
              <div style={{fontSize:12,color:TH.textTiny,marginBottom:24,padding:"10px 14px",background:"rgba(249,115,22,.06)",border:"1px solid rgba(249,115,22,.15)",borderRadius:12,lineHeight:1.7}}>
                Your bookings, cancellations, and waitlist entries are all saved to your account.
              </div>
              <button onClick={onRegister} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 24px #f9731440",marginBottom:10,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
                Create Free Account →
              </button>
              <button onClick={()=>onLogin&&onLogin()} style={{width:"100%",padding:"13px",borderRadius:14,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                Sign In Instead
              </button>
            </div>
          )}

          {/* ── MEMBER: show their bookings ── */}
          {member&&(
            <>
              {/* Waitlist entries */}
              {myWaitlist.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:"#7c3aed",textTransform:"uppercase",marginBottom:10}}>⏳ Your Waitlist</div>
                  {myWaitlist.map(w=>(
                    <div key={w.id} style={{background:"linear-gradient(135deg,#130825,#0a0518)",border:"1px solid #7c3aed44",borderRadius:16,padding:"14px 16px",marginBottom:8,position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(124,58,237,.05),transparent)",backgroundSize:"200%",animation:"shimmer 3s linear infinite"}}/>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                        <div style={{width:36,height:36,borderRadius:10,background:"rgba(124,58,237,.2)",border:"1.5px solid rgba(167,139,250,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⏳</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:800,color:"#c4b5fd"}}>On the Waitlist</div>
                          <div style={{fontSize:10,color:"#6b5a8a",marginTop:1}}>You'll be notified if this slot opens up</div>
                        </div>
                        <div style={{background:"rgba(124,58,237,.2)",border:"1px solid rgba(167,139,250,.3)",borderRadius:50,padding:"3px 10px",fontSize:9,fontWeight:800,color:TH.purple}}>WAITING</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px",marginBottom:12}}>
                        {[["Court","Court "+w.courtId],["Date",w.date],["Time",w.time+" – "+w.endTime]].map(([k,v])=>(
                          <div key={k} style={{gridColumn:k==="Date"?"span 2":undefined}}>
                            <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:1}}>{k}</div>
                            <div style={{fontSize:12,fontWeight:700,color:TH.text}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>onCancelWaitlist&&onCancelWaitlist(w.id)} style={{width:"100%",padding:"9px",borderRadius:10,border:"1.5px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                        Leave Waitlist
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bookings */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase"}}>Your Bookings ({myBookings.filter(b=>b.status!=="cancelled").length})</div>
                {myBookings.length>0&&<div style={{fontSize:10,color:TH.textFaint}}>{myBookings.filter(b=>b.status==="confirmed").length} confirmed</div>}
              </div>

              {myBookings.length===0&&(
                <div style={{textAlign:"center",padding:"40px 0"}}>
                  <div style={{fontSize:36,marginBottom:10}}>📋</div>
                  <div style={{fontSize:13,fontWeight:700,color:TH.textFaint}}>No bookings yet</div>
                  <div style={{fontSize:11,color:TH.borderMid,marginTop:4}}>Your sessions will appear here once you book</div>
                  <button onClick={()=>setTab("book")} style={{marginTop:16,padding:"11px 24px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:13,fontWeight:800,cursor:"pointer"}}>Book a Court →</button>
                </div>
              )}

              {myBookings.map((b,i)=>{
                const sC = b.status==="confirmed"?"#22c55e":b.status==="cancelled"?"#ef4444":"#f59e0b";
                return(
                  <div key={b.id} style={{background:TH.bgCard,border:"1px solid "+(b.status==="confirmed"?"rgba(34,197,94,.15)":TH.border),borderRadius:16,padding:"14px 16px",marginBottom:10,animation:"fadeUp .3s ease "+i*.05+"s both"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:3,color:"#06b6d4"}}>{b.ref}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {b.paid&&<span style={{fontSize:9,fontWeight:800,color:"#22c55e",background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.3)",borderRadius:50,padding:"2px 7px"}}>💰 PAID</span>}
                        <span style={{fontSize:9,fontWeight:800,color:sC,background:sC+"18",border:"1px solid "+sC+"40",borderRadius:50,padding:"2px 8px"}}>{b.status.toUpperCase()}</span>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px",marginBottom:b.status!=="cancelled"?12:0}}>
                      {[["Court","Court "+b.courtId],["Date",b.date],["Time",b.time+" – "+b.endTime],["Duration",b.dur===2?"2 Hours":"1 Hour"],["Amount","MWK "+Number(b.price).toLocaleString()]].map(([k,v])=>(
                        <div key={k} style={{gridColumn:k==="Date"?"span 2":undefined}}>
                          <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:1}}>{k}</div>
                          <div style={{fontSize:12,fontWeight:700,color:TH.text}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {b.status!=="cancelled"&&(
                      canCancelBooking(b) ? (
                        <button onClick={()=>onCancelBooking&&onCancelBooking(b.id)} style={{width:"100%",padding:"9px",borderRadius:10,border:"1.5px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                          Cancel Booking
                        </button>
                      ) : (
                        <div style={{width:"100%",padding:"9px",borderRadius:10,background:"rgba(245,158,11,.07)",border:"1.5px solid rgba(245,158,11,.3)",textAlign:"center"}}>
                          <div style={{fontSize:11,fontWeight:700,color:"#f59e0b"}}>⚠ Cannot Cancel</div>
                          <div style={{fontSize:10,color:"#7a5a00",marginTop:2}}>Within 24h of session · Payment expected</div>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── BOOK TAB ── */}
      {tab==="book"&&(
        <div>
          {/* Date + Duration */}
          <div style={{padding:"14px 18px 0",background:TH.headerBg}}>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
              {DAYS14.map(d=>{
                const a=d.key===day;
                return(
                  <button key={d.key} onClick={()=>setDay(d.key)} style={{flexShrink:0,minWidth:72,padding:"10px 8px",borderRadius:14,border:"1.5px solid",cursor:"pointer",textAlign:"center",borderColor:a?"#f97316":TH.border,background:a?"rgba(249,115,22,.14)":TH.bgCard2,boxShadow:a?"0 0 14px #f9731625":"none"}}>
                    <div style={{fontSize:9,fontWeight:800,letterSpacing:.8,textTransform:"uppercase",color:a?"#f97316":TH.textMid}}>{d.top}</div>
                    <div style={{fontSize:12,fontWeight:600,marginTop:2,color:a?"#fff":TH.textMid}}>{d.bot}</div>
                    
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",gap:8,paddingBottom:14,marginTop:10}}>
              {[{v:1,l:"1 Hour"},{v:2,l:"2 Hours"}].map(opt=>(
                <button key={opt.v} onClick={()=>setDur(opt.v)} style={{padding:"8px 18px",borderRadius:50,border:"1.5px solid",cursor:"pointer",borderColor:dur===opt.v?"#06b6d4":TH.border,background:dur===opt.v?"rgba(6,182,212,.14)":TH.bgCard2,color:dur===opt.v?"#06b6d4":TH.textMid,fontSize:12,fontWeight:800}}>{opt.l}</button>
              ))}
            </div>
          </div>

          <div style={{padding:"12px 14px"}}>
            {/* Active promos for selected day */}
            {(()=>{
              const dow = new Date(day).getDay();
              const active = (promoOffers||[]).filter(o=>{
                if(!o.active) return false;
                if(o.dateType==="weekday" && String(dow)!==o.weekday) return false;
                if(o.dateType==="date" && o.specificDate!==day) return false;
                return true;
              });
              if(active.length===0) return null;
              return(
                <div style={{marginBottom:12,display:"flex",flexDirection:"column",gap:7}}>
                  {active.map(o=>(
                    <div key={o.id} style={{background:"linear-gradient(135deg,rgba(249,115,22,.12),rgba(249,115,22,.05))",border:"1px solid rgba(249,115,22,.35)",borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:12,position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(249,115,22,.05),transparent)",backgroundSize:"200%",animation:"shimmer 3s linear infinite"}}/>
                      <div style={{width:38,height:38,borderRadius:11,background:"rgba(249,115,22,.2)",border:"1px solid rgba(249,115,22,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🏷</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:800,color:TH.text,marginBottom:2}}>{o.title}</div>
                        <div style={{fontSize:11,color:TH.textMid}}>{o.desc}</div>
                        {(o.timeFrom||o.timeTo)&&<div style={{fontSize:10,color:"#f97316",fontWeight:700,marginTop:2}}>⏰ {o.timeFrom||"Open"} – {o.timeTo||"Close"}</div>}
                      </div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#f97316",lineHeight:1,textAlign:"right",flexShrink:0}}>
                        {o.discType==="pct"?o.discVal+"%":"MWK "+Number(o.discVal).toLocaleString()}<br/>
                        <span style={{fontSize:10,color:TH.textMid}}>OFF</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {[{id:1,color:"#f97316",name:"COURT 1"},{id:2,color:"#06b6d4",name:"COURT 2"}].map(court=>{
              const offPk=slots.filter(t=>!isPeak(t));
              const pk=slots.filter(t=>isPeak(t));

              function SlotBtn({t}) {
                // Check if specifically blocked out (vs just booked)
                const blockout = (blockouts||[]).find(bl=>{
                  if(bl.dateKey!==day) return false;
                  if(bl.courtId && bl.courtId!==court.id) return false;
                  if(bl.allDay) return true;
                  if(bl.startTime && bl.endTime){
                    const slots30=buildSlots30(day);
                    const bsi=slots30.indexOf(bl.startTime), bei=slots30.indexOf(bl.endTime);
                    const si=slots30.indexOf(t);
                    return si>=bsi && si<bei;
                  }
                  return false;
                });
                const isFull=isSlotBooked(bookings,court.id,day,t,dur,blockouts);
                const alreadyWaiting=member&&(waitlist||[]).some(w=>w.memberId===member.id&&w.courtId===court.id&&w.dateKey===day&&w.time===t);
                const pk2=isPeak(t);
                const endT=slotEndTime(t,dur);
                const label=dur===2?`${t} – ${endT}`:t;

                // ── BLOCKED OUT ──
                if(blockout) return(
                  <div style={{padding:"9px 4px",borderRadius:10,border:"1.5px solid rgba(239,68,68,.25)",
                    background:"rgba(239,68,68,.06)",
                    textAlign:"center",lineHeight:1.3,cursor:"default"}}>
                    <div style={{fontSize:dur===2?10:9,fontWeight:800,color:"#ef4444",marginBottom:1}}>{dur===2?label:"🚫"}</div>
                    <div style={{fontSize:7,fontWeight:700,color:"#ef4444",opacity:.7,textTransform:"uppercase",letterSpacing:.3}}>
                      {blockout.reason||"Closed"}
                    </div>
                  </div>
                );

                // ── BOOKED / FULL ──
                if(isFull) return(
                  <button onClick={()=>tapSlot(court.id,t,true)} style={{padding:"11px 4px",borderRadius:10,border:"1.5px solid",fontSize:dur===2?11:10,fontWeight:700,cursor:"pointer",touchAction:"manipulation",
                    borderColor:alreadyWaiting?"#7c3aed44":"#1a0c30",
                    background:alreadyWaiting?TH.slotWait:TH.slotFull,
                    color:alreadyWaiting?TH.slotWaitText:TH.slotFullText,
                    lineHeight:1.3,textAlign:"center"}}>
                    {alreadyWaiting?<>⏳<br/><span style={{fontSize:8}}>Waiting</span></>:<><span style={{fontSize:dur===2?10:9}}>{dur===2?label:"FULL"}</span><br/><span style={{fontSize:8,color:TH.slotFullText}}>+ Waitlist</span></>}
                  </button>
                );

                // ── AVAILABLE ──
                return(
                  <button onClick={()=>tapSlot(court.id,t,false)} style={{padding:dur===2?"13px 8px":"10px 4px",borderRadius:10,border:"1.5px solid",fontSize:dur===2?12:12,fontWeight:700,cursor:"pointer",touchAction:"manipulation",
                    borderColor:pk2?"#f9731644":(TH.accentGreen+"44"),
                    background:pk2?TH.slotPk:TH.slotOff,
                    color:pk2?TH.slotPkText:TH.slotOffText,
                    textAlign:"center",lineHeight:1.4}}>
                    {dur===2?<><span style={{fontSize:11}}>{t}</span><br/><span style={{fontSize:9,opacity:.7}}>↓</span><br/><span style={{fontSize:11}}>{endT}</span></>:t}
                  </button>
                );
              }

              return(
                <div key={court.id} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:20,overflow:"hidden",marginBottom:12}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid "+TH.border,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:court.color,boxShadow:"0 0 8px "+court.color}}/>
                    <div style={{fontWeight:800,color:court.color,fontSize:12,letterSpacing:1}}>{court.name}</div>
                    <div style={{marginLeft:"auto",fontSize:9,color:TH.textMid,fontWeight:700}}>{dur===2?"MWK 125K flat":"MWK 30K–65K/hr"}</div>
                  </div>
                  <div style={{padding:"10px 10px",background:TH.bgCard}}>
                    {offPk.length>0&&<>
                      <div style={{fontSize:8,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:6,paddingLeft:2}}>🌅 Off-Peak</div>
                      <div style={{display:"grid",gridTemplateColumns:dur===2?"repeat(2,1fr)":"repeat(3,1fr)",gap:6,marginBottom:10}}>
                        {offPk.map(t=><SlotBtn key={t} t={t}/>)}
                      </div>
                    </>}
                    {pk.length>0&&<>
                      <div style={{fontSize:8,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:6,paddingLeft:2}}>🌙 Peak</div>
                      <div style={{display:"grid",gridTemplateColumns:dur===2?"repeat(2,1fr)":"repeat(3,1fr)",gap:6}}>
                        {pk.map(t=><SlotBtn key={t} t={t}/>)}
                      </div>
                    </>}
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginTop:4,marginBottom:4}}>
              {[
                ["rgba(34,197,94,.1)","#22c55e44","#22c55e","Free"],
                ["rgba(249,115,22,.07)","#f9731644","#f97316","Peak"],
                ["rgba(124,58,237,.06)","#1a0c30","#4a2a70","Full · waitlist"],
                ["rgba(239,68,68,.06)","rgba(239,68,68,.25)","#ef4444","Blocked"],
              ].map(([bg,bd,c2,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:TH.textMid}}>
                  <div style={{width:18,height:11,borderRadius:3,background:bg,border:"1px solid "+bd}}/>
                  <span style={{color:c2}}>{l}</span>
                </div>
              ))}
            </div>

            {!member&&(
              <div style={{marginTop:10,padding:"12px 16px",background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.25)",borderRadius:14,textAlign:"center"}}>
                <div style={{fontSize:12,color:"#f97316",fontWeight:700}}>Sign in to earn points & access the waitlist 🎾</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONFIRM MODAL ── */}
      {pending&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:TH.bgCard==="TH.bgCard"?"rgba(2,5,12,.88)":"rgba(240,237,232,.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setPending(null)}>
          <div style={{width:"100%",maxWidth:430,background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:"24px 24px 0 0",padding:"26px 22px 48px",animation:"slideUp .3s cubic-bezier(.34,1.1,.64,1)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:TH.text}}>Confirm Booking</div>
              <button onClick={()=>setPending(null)} style={{width:32,height:32,borderRadius:"50%",border:"1.5px solid "+TH.borderMid,background:TH.bgInput,color:TH.textMid,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{background:TH.bgCard2,border:"1px solid "+TH.border,borderRadius:14,padding:"13px 15px",marginBottom:16}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px"}}>
                {[["Court","Court "+pending.courtId],["Date",cur?.full],["Time",pending.time+" – "+pending.endTime],["Duration",dur===2?"2 Hours":"1 Hour"],["Session",pending.pk?"Peak (MWK "+Number(pending.price).toLocaleString()+")":"Off-Peak (MWK "+Number(pending.price).toLocaleString()+")"]].map(([k,v])=>(
                  <div key={k} style={{gridColumn:k==="Date"||k==="Session"?"span 2":undefined}}>
                    <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {member ? (
              <div style={{background:TH.slotOff,border:"1px solid rgba(34,197,94,.2)",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(34,197,94,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"#22c55e",flexShrink:0}}>{member.avatar}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{member.name}</div>
                  <div style={{fontSize:11,color:TH.textMid}}>{member.phone} · +{pending.pts} pts earned</div>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase"}}>Your Details</div>
                <input placeholder="Full name *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={{width:"100%",background:TH.bgInput,border:"1.5px solid",borderColor:form.name?"#1a3050":TH.border,borderRadius:13,padding:"13px 15px",color:TH.text,fontSize:14,outline:"none"}}/>
                <input type="tel" placeholder="Phone number *" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} style={{width:"100%",background:TH.bgInput,border:"1.5px solid",borderColor:form.phone?"#1a3050":TH.border,borderRadius:13,padding:"13px 15px",color:TH.text,fontSize:14,outline:"none"}}/>
                {err&&<div style={{color:"#f87171",fontSize:12,fontWeight:700}}>{err}</div>}
              </div>
            )}
            <button onClick={confirm} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:pending.pk?"linear-gradient(135deg,#f97316,#b45309)":"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
              Confirm · MWK {Number(pending.price).toLocaleString()} →
            </button>
          </div>
        </div>
      )}

      {/* ── WAITLIST MODAL (member) ── */}
      {wlSlot&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:TH.bgCard==="#ffffff"?"rgba(240,237,232,.9)":"rgba(2,5,12,.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setWlSlot(null)}>
          <div style={{width:"100%",maxWidth:430,background:TH.bgCard,border:"1px solid #7c3aed44",borderRadius:"24px 24px 0 0",padding:"26px 22px 48px",animation:"slideUp .3s cubic-bezier(.34,1.1,.64,1)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:"#c4b5fd"}}>Join Waitlist</div>
              <button onClick={()=>setWlSlot(null)} style={{width:32,height:32,borderRadius:"50%",border:"1.5px solid "+TH.borderMid,background:TH.bgInput,color:TH.textMid,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{fontSize:12,color:"#6b5a8a",marginBottom:16}}>This slot is fully booked. Join the waitlist and we'll notify you if it opens up.</div>
            <div style={{background:"rgba(124,58,237,.1)",border:"1px solid #7c3aed44",borderRadius:14,padding:"13px 15px",marginBottom:16}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px"}}>
                {[["Court","Court "+wlSlot.courtId],["Date",wlSlot.date],["Time",wlSlot.time+" – "+wlSlot.endTime]].map(([k,v])=>(
                  <div key={k} style={{gridColumn:k==="Date"?"span 2":undefined}}>
                    <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#c4b5fd"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"rgba(124,58,237,.07)",border:"1px solid rgba(167,139,250,.2)",borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(124,58,237,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:TH.purple,flexShrink:0}}>{member?.avatar}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{member?.name}</div>
                <div style={{fontSize:11,color:"#6b5a8a"}}>{member?.phone} · We'll contact you if a slot opens</div>
              </div>
            </div>
            <button onClick={joinWaitlist} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#7c3aed,#4c1d95)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 24px rgba(124,58,237,.4)",touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
              ⏳ Add Me to Waitlist
            </button>
            <button onClick={()=>setWlSlot(null)} style={{width:"100%",padding:"11px",borderRadius:13,border:"1.5px solid "+TH.border,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:8}}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── WAITLIST GATE MODAL (guest) ── */}
      {wlGate&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:TH.bgCard==="#ffffff"?"rgba(240,237,232,.9)":"rgba(2,5,12,.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setWlGate(false)}>
          <div style={{width:"100%",maxWidth:430,background:TH.bgCard,border:"1px solid #7c3aed44",borderRadius:"24px 24px 0 0",padding:"30px 24px 52px",animation:"slideUp .3s cubic-bezier(.34,1.1,.64,1)",textAlign:"center"}}>
            <div style={{fontSize:42,marginBottom:14}}>⏳</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2,color:TH.text,marginBottom:8}}>Members Only Feature</div>
            <div style={{fontSize:13,color:"#6b5a8a",marginBottom:8,lineHeight:1.6}}>The waitlist is exclusive to ACE members.</div>
            <div style={{fontSize:12,color:"#4a3060",marginBottom:24,padding:"10px 14px",background:TH.slotFull,border:"1px solid rgba(124,58,237,.2)",borderRadius:12}}>
              Register for free to join the waitlist, earn points on every booking, and unlock exclusive member rewards.
            </div>
            <button onClick={()=>{setWlGate(false);if(onRegister)onRegister();}} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 24px #f9731440",marginBottom:10,touchAction:"manipulation"}}>
              Create Free Account →
            </button>
            <button onClick={()=>{setWlGate(false);if(onLogin)onLogin();}} style={{width:"100%",padding:"12px",borderRadius:13,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:8}}>
              Sign In Instead
            </button>
            <button onClick={()=>setWlGate(false)} style={{width:"100%",padding:"10px",borderRadius:13,border:"none",background:"transparent",color:TH.textFaint,fontSize:12,fontWeight:600,cursor:"pointer"}}>Continue as Guest</button>
          </div>
        </div>
      )}

    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// LEADERBOARD — Points + Ratings tabs
// ═══════════════════════════════════════════════════════════════
function LeaderboardScreen({TH, members, member, friends, myRatings, onRate, onRegister, onLogin}) {
  const [page,   setPage]   = useState("points");
  const [filter, setFilter] = useState("all");
  const [rateModal, setRateModal] = useState(null);
  const [rateGate,  setRateGate]  = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [justRated, setJustRated] = useState(null);

  // ── GATE — members only ──
  if(!member) return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"30px 24px 100px",textAlign:"center",background:TH.bg}}>
      <div style={{width:80,height:80,borderRadius:24,margin:"0 auto 20px",background:"linear-gradient(135deg,#1a0a00,#0d0500)",border:"1px solid rgba(249,115,22,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,boxShadow:"0 0 40px rgba(249,115,22,.2)"}}>🏆</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,letterSpacing:4,color:TH.text,marginBottom:6}}>Members Only</div>
      <div style={{fontSize:13,color:TH.textMid,marginBottom:6,lineHeight:1.6}}>The ACE Rankings are exclusive to members.</div>
      <div style={{fontSize:12,color:"#4a3020",marginBottom:28,padding:"12px 16px",background:"rgba(249,115,22,.07)",border:"1px solid rgba(249,115,22,.2)",borderRadius:14,lineHeight:1.7}}>
        Create a free account to see the full Points Leaderboard, Player Ratings, Male &amp; Female rankings, and rate your opponents.
      </div>
      <button onClick={onRegister} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 28px #f9731450",marginBottom:12,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
        Create Free Account →
      </button>
      <button onClick={onLogin||onRegister} style={{width:"100%",padding:"13px",borderRadius:14,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:14,fontWeight:700,cursor:"pointer"}}>
        Sign In Instead
      </button>
      <div style={{marginTop:28,display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
        {[["🏆","Points Board"],["⭐","Player Ratings"],["👦","Male Rankings"],["👧","Female Rankings"]].map(([ic,lbl])=>(
          <div key={lbl} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,opacity:.5}}>
            <div style={{fontSize:24}}>{ic}</div>
            <div style={{fontSize:9,fontWeight:700,color:TH.textFaint,letterSpacing:1,textTransform:"uppercase"}}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Points leaderboard — exclude members who opted out of leaderboard display
  const byPoints  = [...members].filter(m=>m.showOnLeaderboard!==false).sort((a,b)=>b.points-a.points);
  // Rating leaderboard — only show members with at least 1 rating AND who allow rating display
  const byRating  = [...members].filter(m=>m.ratingCount>0 && m.showRating!==false).sort((a,b)=>avgRating(b)-avgRating(a));

  const filterList = (list) => {
    let out = list;
    if(filter==="male")    out = out.filter(m=>m.gender==="male");
    if(filter==="female")  out = out.filter(m=>m.gender==="female");
    if(filter==="friends" && member) out = out.filter(m=>friends.includes(m.id)||m.id===member.id);
    return out;
  };

  function tapRate(m) {
    if(!member) { setRateGate(true); return; }
    if(m.id===member.id) return; // can't rate yourself
    setRateModal(m);
    setHoverStar(myRatings[m.id]||0);
  }

  function submitRating(stars) {
    if(!rateModal) return;
    onRate(rateModal.id, stars);
    setJustRated(rateModal.id);
    setRateModal(null);
    setTimeout(()=>setJustRated(null), 2000);
  }

  const Podium = ({list, valueKey, valueFn, unitLabel, color}) => {
    if(list.length < 3) return null;
    return(
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 1fr",gap:8,marginBottom:18,alignItems:"flex-end"}}>
        {[list[1],list[0],list[2]].map((m,i)=>{
          const t=getTier(m.points);
          const val = valueFn ? valueFn(m) : m[valueKey];
          const ht = i===1?"116px":"90px";
          return(
            <div key={m.id} style={{background:"linear-gradient(180deg,"+t.bg+","+TH.bgCard+")",border:"1px solid "+t.color+"44",borderRadius:16,padding:"12px 8px",textAlign:"center",height:ht,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,"+t.color+"60,"+t.color+"30)",border:"2px solid "+t.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:t.color}}>{m.avatar}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:TH.text,letterSpacing:1,lineHeight:1.1}}>{m.name.split(" ")[0]}</div>
              <div style={{fontSize:10,fontWeight:800,color:t.color}}>{val}{unitLabel}</div>
              <div style={{fontSize:15}}>{["🥈","🥇","🥉"][i]}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return(
    <div style={{minHeight:"100vh",paddingBottom:90,background:TH.bg}}>
      {/* Header */}
      <div style={{background:TH.headerBg,padding:"50px 18px 0"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:TH.text}}>Rankings</div>
        <div style={{fontSize:12,color:TH.textMid,marginTop:2}}>ACE Padel Club · Season 2025</div>

        {/* Page tabs */}
        <div style={{display:"flex",gap:0,marginTop:16,borderBottom:"1px solid "+TH.border}}>
          {[["points","🏆 Points"],["rating","⭐ Player Ratings"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setPage(id)} style={{flex:1,padding:"11px 10px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:page===id?"#fff":TH.textMid,borderBottom:page===id?"2px solid #f97316":"2px solid transparent"}}>{lbl}</button>
          ))}
        </div>

        {/* Filter row — All / Male / Female / Friends */}
        <div style={{display:"flex",gap:6,padding:"12px 0",overflowX:"auto",scrollbarWidth:"none"}}>
          {[
            ["all",  "All",    "#f97316"],
            ["male", "👦 Male",  "#06b6d4"],
            ["female","👧 Female","#f472b6"],
            ["friends","Friends","#22c55e"],
          ].map(([id,lbl,col])=>(
            <button key={id} onClick={()=>setFilter(id)} style={{flexShrink:0,padding:"6px 14px",borderRadius:50,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,
              borderColor:filter===id?col:TH.border,
              background:filter===id?col+"25":"transparent",
              color:filter===id?col:TH.textMid}}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── POINTS PAGE ── */}
      {page==="points"&&(
        <div style={{padding:"14px 16px"}} className="fu">
          {/* Privacy notice if member has opted out */}
          {member?.showOnLeaderboard===false&&(
            <div style={{padding:"10px 14px",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.25)",borderRadius:12,marginBottom:12,display:"flex",alignItems:"center",gap:9}}>
              <span style={{fontSize:16}}>🔒</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:800,color:"#f59e0b"}}>Your profile is hidden from this leaderboard</div>
                <div style={{fontSize:10,color:"#7a5a00",marginTop:1}}>Go to Me → Privacy Settings to change this</div>
              </div>
            </div>
          )}
          {/* Filter label */}
        {filter!=="all"&&(
          <div style={{marginBottom:12,padding:"8px 14px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid "+TH.border,fontSize:11,fontWeight:700,color:TH.textMid,display:"inline-flex",alignItems:"center",gap:6}}>
            <span style={{color:filter==="male"?"#06b6d4":filter==="female"?"#f472b6":"#22c55e"}}>
              {filter==="male"?"👦 Male Rankings":filter==="female"?"👧 Female Rankings":"Friends Rankings"}
            </span>
            <button onClick={()=>setFilter("all")} style={{background:"transparent",border:"none",color:TH.textMid,cursor:"pointer",fontSize:12,padding:0}}>✕</button>
          </div>
        )}
        <Podium list={filterList(byPoints).length>=3?filterList(byPoints):byPoints} valueFn={m=>fmt(m.points)} unitLabel=" pts" color="#f0c040"/>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {filterList(byPoints).map((m,i)=>{
              const rank = byPoints.indexOf(m)+1;
              const t    = getTier(m.points);
              const isMe = member?.id===m.id;
              const isFr = friends.includes(m.id);
              return(
                <div key={m.id} style={{background:isMe?"rgba(249,115,22,.08)":TH.bgCard,border:"1px solid "+(isMe?"#f9731640":isFr?"#06b6d420":TH.border),borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:11,animation:"fadeUp .25s ease "+(i*.025)+"s both"}}>
                  <div style={{width:26,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:rank<=3?"#f97316":TH.textFaint,flexShrink:0}}>{rank}</div>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,"+t.color+"50,"+t.color+"20)",border:"2px solid "+t.color+"60",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:t.color,flexShrink:0,overflow:"hidden"}}>{m.photoUrl?<img src={m.photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:m.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:800,color:TH.text}}>{m.name}</span>
                      {isMe&&<span style={{fontSize:8,fontWeight:800,color:"#f97316",background:"rgba(249,115,22,.15)",border:"1px solid rgba(249,115,22,.3)",borderRadius:50,padding:"1px 6px"}}>YOU</span>}
                      {isFr&&!isMe&&<span style={{fontSize:8,fontWeight:800,color:"#06b6d4",background:"rgba(6,182,212,.15)",border:"1px solid rgba(6,182,212,.3)",borderRadius:50,padding:"1px 6px"}}>FRIEND</span>}
                    </div>
                    <div style={{fontSize:10,color:TH.textMid,marginTop:1}}>{t.icon} {t.name} · {m.bookings} sessions</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:t.color,lineHeight:1}}>{fmt(m.points)}</div>
                    <div style={{fontSize:9,color:TH.textFaint,fontWeight:700}}>pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── RATINGS PAGE ── */}
      {page==="rating"&&(
        <div style={{padding:"14px 16px"}} className="fu">

          {/* Rate a player CTA */}
          <div style={{background:"linear-gradient(135deg,#1a0a00,#0d0500)",border:"1px solid rgba(249,115,22,.25)",borderRadius:18,padding:"16px 18px",marginBottom:16,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,background:"radial-gradient(circle,rgba(249,115,22,.12) 0%,transparent 70%)"}}/>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:"#f97316",textTransform:"uppercase",marginBottom:6}}>Members Only · Rate Players</div>
            <div style={{fontSize:13,fontWeight:700,color:TH.text,marginBottom:4}}>Played a match? Rate your opponent</div>
            <div style={{fontSize:11,color:"#4a3020",lineHeight:1.5,marginBottom:12}}>Help build the community ranking. Your ratings help other players find great opponents.</div>
            {!member ? (
              <button onClick={()=>setRateGate(true)} style={{padding:"10px 20px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:12,fontWeight:800,cursor:"pointer"}}>Sign In to Rate →</button>
            ) : (
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {members.filter(m=>m.id!==member.id && m.showRating!==false).map(m=>(
                  <button key={m.id} onClick={()=>tapRate(m)} style={{padding:"7px 14px",borderRadius:50,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,
                    borderColor:justRated===m.id?"#22c55e":myRatings[m.id]?"#f97316":TH.borderMid,
                    background:justRated===m.id?"rgba(34,197,94,.15)":myRatings[m.id]?"rgba(249,115,22,.12)":"rgba(255,255,255,.04)",
                    color:justRated===m.id?"#22c55e":myRatings[m.id]?"#f97316":TH.textMid}}>
                    {justRated===m.id?"✓ Rated":myRatings[m.id]?m.name.split(" ")[0]+" ★"+myRatings[m.id]:m.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rating leaderboard */}
          {/* Filter label */}
          {filter!=="all"&&(
            <div style={{marginBottom:12,padding:"8px 14px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid "+TH.border,fontSize:11,fontWeight:700,color:TH.textMid,display:"inline-flex",alignItems:"center",gap:6}}>
              <span style={{color:filter==="male"?"#06b6d4":filter==="female"?"#f472b6":"#22c55e"}}>
                {filter==="male"?"👦 Male Ratings":filter==="female"?"👧 Female Ratings":"Friends Ratings"}
              </span>
              <button onClick={()=>setFilter("all")} style={{background:"transparent",border:"none",color:TH.textMid,cursor:"pointer",fontSize:12,padding:0}}>✕</button>
            </div>
          )}
          {filterList(byRating).length===0 ? (
            <div style={{textAlign:"center",padding:"40px 0",color:TH.textTiny}}>
              <div style={{fontSize:36,marginBottom:10}}>⭐</div>
              <div style={{fontSize:14,fontWeight:700,color:TH.textFaint}}>No ratings yet</div>
              <div style={{fontSize:11,color:TH.borderMid,marginTop:4}}>Be the first to rate a player</div>
            </div>
          ) : (
            <>
              {/* Podium */}
              {filterList(byRating).length>=3&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 1fr",gap:8,marginBottom:18,alignItems:"flex-end"}}>
                  {[filterList(byRating)[1],filterList(byRating)[0],filterList(byRating)[2]].map((m,i)=>{ if(!m) return null;
                    const t=getTier(m.points);
                    const avg=avgRating(m);
                    const ht=i===1?"116px":"90px";
                    return(
                      <div key={m.id} style={{background:"linear-gradient(180deg,rgba(249,115,22,.1),"+TH.bgCard+")",border:"1px solid rgba(249,115,22,.3)",borderRadius:16,padding:"12px 8px",textAlign:"center",height:ht,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,"+t.color+"60,"+t.color+"30)",border:"2px solid "+t.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:t.color}}>{m.avatar}</div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:TH.text,letterSpacing:1}}>{m.name.split(" ")[0]}</div>
                        <div style={{fontSize:10,color:"#f97316",fontWeight:800}}>{avg.toFixed(1)} ⭐</div>
                        <div style={{fontSize:9,color:TH.textMid}}>{m.ratingCount} votes</div>
                        <div style={{fontSize:14}}>{["🥈","🥇","🥉"][i]}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full rating list */}
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {filterList(byRating).map((m,i)=>{
                  const rank    = byRating.indexOf(m)+1;
                  const t       = getTier(m.points);
                  const avg     = avgRating(m);
                  const isMe    = member?.id===m.id;
                  const isFr    = friends.includes(m.id);
                  const myStars = myRatings[m.id]||0;
                  // Star bar fill
                  const fillPct = (avg/5)*100;
                  return(
                    <div key={m.id} style={{background:isMe?"rgba(249,115,22,.06)":TH.bgCard,border:"1px solid "+(isMe?"#f9731630":TH.border),borderRadius:14,padding:"13px 14px",animation:"fadeUp .25s ease "+(i*.025)+"s both"}}>
                      <div style={{display:"flex",alignItems:"center",gap:11}}>
                        <div style={{width:26,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:rank<=3?"#f97316":TH.textFaint,flexShrink:0}}>{rank}</div>
                        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,"+t.color+"50,"+t.color+"20)",border:"2px solid "+t.color+"60",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:t.color,flexShrink:0,overflow:"hidden"}}>{m.photoUrl?<img src={m.photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:m.avatar}</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                            <span style={{fontSize:13,fontWeight:800,color:TH.text}}>{m.name}</span>
                            {isMe&&<span style={{fontSize:8,fontWeight:800,color:"#f97316",background:"rgba(249,115,22,.15)",border:"1px solid rgba(249,115,22,.3)",borderRadius:50,padding:"1px 6px"}}>YOU</span>}
                            {isFr&&!isMe&&<span style={{fontSize:8,fontWeight:800,color:"#06b6d4",background:"rgba(6,182,212,.15)",border:"1px solid rgba(6,182,212,.3)",borderRadius:50,padding:"1px 6px"}}>FRIEND</span>}
                          </div>
                          {/* Star bar */}
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <div style={{flex:1,height:5,background:TH.bgInput,borderRadius:3,overflow:"hidden",maxWidth:80}}>
                              <div style={{height:"100%",width:fillPct+"%",background:"linear-gradient(90deg,#f97316,#f59e0b)",borderRadius:3}}/>
                            </div>
                            <span style={{fontSize:11,fontWeight:800,color:"#f97316"}}>{avg.toFixed(1)}</span>
                            <span style={{fontSize:9,color:TH.textFaint}}>({m.ratingCount} votes)</span>
                          </div>
                        </div>
                        {/* Rate button — only if member allows ratings */}
                        {member&&!isMe&&m.showRating!==false&&(
                          <button onClick={()=>tapRate(m)} style={{padding:"7px 12px",borderRadius:10,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,flexShrink:0,
                            borderColor:justRated===m.id?"#22c55e":myStars?"rgba(249,115,22,.4)":TH.borderMid,
                            background:justRated===m.id?"rgba(34,197,94,.12)":myStars?"rgba(249,115,22,.1)":"transparent",
                            color:justRated===m.id?"#22c55e":myStars?"#f97316":TH.textMid}}>
                            {justRated===m.id?"✓":myStars?"★"+myStars:"Rate"}
                          </button>
                        )}
                        {member&&!isMe&&m.showRating===false&&(
                          <span style={{fontSize:9,color:TH.textFaint,fontWeight:700,flexShrink:0}}>🔒 Private</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Members not yet rated */}
              {(() => {
                const unrated = filterList([...members]).filter(m=>m.id!==member?.id&&m.ratingCount===0&&m.showRating!==false);
                if(unrated.length===0) return null;
                return(
                  <div style={{marginTop:14}}>
                    <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textTiny,textTransform:"uppercase",marginBottom:8}}>Not Yet Rated</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {unrated.map(m=>{
                        const t=getTier(m.points);
                        return(
                          <div key={m.id} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,opacity:.6}}>
                            <div style={{width:34,height:34,borderRadius:"50%",background:t.color+"20",border:"2px solid "+t.color+"40",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:t.color+"80",flexShrink:0}}>{m.avatar}</div>
                            <div style={{flex:1}}>
                              <div style={{fontSize:12,fontWeight:700,color:TH.textMid}}>{m.name}</div>
                              <div style={{fontSize:10,color:TH.textTiny}}>{t.icon} {t.name} · No ratings yet</div>
                            </div>
                            {member&&(
                              <button onClick={()=>tapRate(m)} style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:11,fontWeight:700,cursor:"pointer"}}>Rate</button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* ── RATE MODAL ── */}
      {rateModal&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(2,5,12,.92)",backdropFilter:"blur(18px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setRateModal(null)}>
          <div style={{width:"100%",maxWidth:430,background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:"24px 24px 0 0",padding:"28px 24px 52px",animation:"slideUp .3s cubic-bezier(.34,1.1,.64,1)",textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
              <button onClick={()=>setRateModal(null)} style={{width:30,height:30,borderRadius:"50%",border:"1.5px solid "+TH.borderMid,background:TH.bgInput,color:TH.textMid,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            {(()=>{
              const t=getTier(rateModal.points);
              const prev=myRatings[rateModal.id]||0;
              return(
                <>
                  <div style={{width:64,height:64,borderRadius:"50%",margin:"0 auto 14px",background:"linear-gradient(135deg,"+t.color+"60,"+t.color+"20)",border:"3px solid "+t.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:22,color:t.color}}>{rateModal.avatar}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:TH.text,marginBottom:4}}>{rateModal.name}</div>
                  <div style={{fontSize:11,color:TH.textMid,marginBottom:8}}>{t.icon} {t.name} · {rateModal.bookings} sessions played</div>
                  {rateModal.ratingCount>0&&(
                    <div style={{fontSize:12,color:"#f97316",fontWeight:700,marginBottom:16}}>Current rating: {avgRating(rateModal).toFixed(1)} ⭐ ({rateModal.ratingCount} votes)</div>
                  )}
                  {prev>0&&<div style={{fontSize:11,color:TH.textMid,marginBottom:12}}>Your previous rating: {"★".repeat(prev)}</div>}
                  <div style={{fontSize:13,color:TH.textMid,marginBottom:18}}>Tap to rate {rateModal.name.split(" ")[0]}</div>
                  {/* Star selector */}
                  <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:24}} onMouseLeave={()=>setHoverStar(prev)}>
                    {[1,2,3,4,5].map(s=>(
                      <button key={s}
                        onMouseEnter={()=>setHoverStar(s)}
                        onClick={()=>submitRating(s)}
                        style={{width:52,height:52,borderRadius:14,border:"1.5px solid",cursor:"pointer",
                          background:s<=hoverStar?"rgba(249,115,22,.15)":"rgba(255,255,255,.03)",
                          borderColor:s<=hoverStar?"#f97316":TH.borderMid,
                          fontSize:26,display:"flex",alignItems:"center",justifyContent:"center",
                          transform:s<=hoverStar?"scale(1.1)":"scale(1)",transition:"all .12s"}}>
                        {s<=hoverStar?"★":"☆"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"center",gap:6}}>
                    {["Needs Work","OK","Good","Great","Elite"][hoverStar-1]&&(
                      <span style={{fontSize:13,fontWeight:700,color:"#f97316"}}>{["Needs Work","OK","Good","Great","Elite"][hoverStar-1]}</span>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── RATE GATE (guest) ── */}
      {rateGate&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:TH.bgCard==="#ffffff"?"rgba(240,237,232,.9)":"rgba(2,5,12,.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setRateGate(false)}>
          <div style={{width:"100%",maxWidth:430,background:TH.bgCard,border:"1px solid rgba(249,115,22,.3)",borderRadius:"24px 24px 0 0",padding:"30px 24px 52px",animation:"slideUp .3s cubic-bezier(.34,1.1,.64,1)",textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:14}}>⭐</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2,color:TH.text,marginBottom:8}}>Members Only</div>
            <div style={{fontSize:13,color:"#6b5a8a",marginBottom:8,lineHeight:1.6}}>Player ratings are exclusive to ACE members.</div>
            <div style={{fontSize:12,color:"#4a3020",marginBottom:24,padding:"10px 14px",background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.2)",borderRadius:12}}>
              Create a free account to rate players, earn points on every booking, and unlock exclusive rewards.
            </div>
            <button onClick={()=>{setRateGate(false);if(onRegister)onRegister();}} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 24px #f9731440",marginBottom:10,touchAction:"manipulation"}}>
              Create Free Account →
            </button>
            <button onClick={()=>setRateGate(false)} style={{width:"100%",padding:"11px",borderRadius:13,border:"1.5px solid "+TH.border,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>Continue as Guest</button>
          </div>
        </div>
      )}

    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// OFFERS
// ═══════════════════════════════════════════════════════════════
function OffersScreen({TH, rewards, member, redemptions, onRedeem}) {
  const [confirmReward, setConfirmReward] = useState(null); // reward to confirm before redeeming
  const [successCode,   setSuccessCode]   = useState(null); // show after redeem
  const t = member ? getTier(member.points) : null;

  const myRedemptions = (redemptions||[]).filter(r=>r.memberId===member?.id);

  function canRedeem(r) {
    if(!member) return false;
    if(member.points < r.points) return false;
    const tIdx = TIERS.findIndex(x=>x.name===r.tier);
    const mIdx = TIERS.findIndex(x=>x.name===t.name);
    if(mIdx < tIdx) return false;
    if(r.maxUses && r.uses >= r.maxUses) return false;
    return true;
  }

  function doRedeem(r) {
    onRedeem(r.id);
    // Find the code that was just created — it'll be newest redemption
    const code = "RWD-" + Math.random().toString(36).slice(2,7).toUpperCase();
    setSuccessCode({code, reward:r});
    setConfirmReward(null);
  }

  // Success / voucher screen
  if(successCode) return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"30px 24px 100px",textAlign:"center",background:TH.bgCard}} className="fu">
      <div style={{width:76,height:76,borderRadius:"50%",margin:"0 auto 16px",background:"linear-gradient(135deg,#7c3aed,#4c1d95)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,boxShadow:"0 0 40px rgba(124,58,237,.5)",animation:"pop .5s cubic-bezier(.34,1.56,.64,1)"}}>🎁</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,color:TH.text,marginBottom:4}}>Reward Redeemed!</div>
      <div style={{fontSize:12,color:"#6b5a8a",marginBottom:24}}>Show this code at reception to claim your reward</div>

      {/* Voucher card */}
      <div style={{width:"100%",background:"linear-gradient(135deg,#120828,#0a0518)",border:"1.5px solid rgba(167,139,250,.4)",borderRadius:24,padding:"24px 20px",marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:140,height:140,background:"radial-gradient(circle,rgba(124,58,237,.2) 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:-30,left:-30,width:120,height:120,background:"radial-gradient(circle,rgba(167,139,250,.1) 0%,transparent 70%)"}}/>

        <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:TH.purple,textTransform:"uppercase",marginBottom:16}}>ACE Padel Club · Reward Voucher</div>

        {/* Code */}
        <div style={{background:"rgba(167,139,250,.1)",border:"1.5px dashed rgba(167,139,250,.4)",borderRadius:16,padding:"18px 14px",marginBottom:16}}>
          <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:"#6b5a8a",textTransform:"uppercase",marginBottom:6}}>Redemption Code</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:6,color:TH.purple}}>{myRedemptions[0]?.code || successCode.code}</div>
          <div style={{fontSize:10,color:"#4a3060",marginTop:4}}>Quote this code at reception</div>
        </div>

        {/* Reward details */}
        <div style={{textAlign:"left"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px"}}>
            {[
              ["Reward",    successCode.reward.title],
              ["Member",    member.name],
              ["Points Used", fmt(successCode.reward.points)+" pts"],
              ["Redeemed",  new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})],
            ].map(([k,v])=>(
              <div key={k}>
                <div style={{fontSize:8,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                <div style={{fontSize:12,fontWeight:700,color:"#c4b5fd"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop:14,padding:"10px 12px",background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.2)",borderRadius:10}}>
          <div style={{fontSize:11,color:"#f97316",fontWeight:700}}>Remaining Balance</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#f97316",lineHeight:1.2}}>{fmt(member.points)} pts</div>
        </div>
      </div>

      <div style={{padding:"10px 14px",background:TH.slotFull,border:"1px solid rgba(124,58,237,.2)",borderRadius:12,marginBottom:20,textAlign:"left",width:"100%"}}>
        <div style={{fontSize:11,color:TH.purple,fontWeight:700,marginBottom:3}}>How to use your reward</div>
        <div style={{fontSize:11,color:"#4a3060",lineHeight:1.7}}>Screenshot this screen · Visit reception before your next session · Show the code · Staff will apply your reward</div>
      </div>

      <button onClick={()=>setSuccessCode(null)} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#7c3aed,#4c1d95)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 24px rgba(124,58,237,.4)",touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
        Back to Rewards
      </button>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",paddingBottom:90,background:TH.bg}}>
      <div style={{background:TH.bgCard,padding:"50px 20px 20px"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:TH.text}}>Rewards</div>
        <div style={{fontSize:12,color:"#6b5a8a",marginTop:2}}>Redeem your points for exclusive offers</div>
        {member&&(
          <div style={{marginTop:12,display:"inline-flex",alignItems:"center",gap:8,background:TH.slotWait,border:"1px solid rgba(124,58,237,.3)",borderRadius:50,padding:"6px 14px"}}>
            <span style={{fontSize:12,fontWeight:800,color:TH.purple}}>⚡ {fmt(member.points)} points available</span>
          </div>
        )}
      </div>

      <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:12}} className="fu">

        {/* My active redemptions */}
        {myRedemptions.filter(r=>!r.used).length>0&&(
          <div style={{background:"linear-gradient(135deg,#120828,#0a0518)",border:"1px solid rgba(167,139,250,.3)",borderRadius:18,padding:"14px 16px"}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.purple,textTransform:"uppercase",marginBottom:10}}>🎁 Your Active Vouchers</div>
            {myRedemptions.filter(r=>!r.used).map(r=>(
              <div key={r.id} style={{background:"rgba(167,139,250,.08)",border:"1.5px dashed rgba(167,139,250,.3)",borderRadius:13,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:800,color:"#c4b5fd"}}>{r.rewardTitle}</span>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:3,color:TH.purple}}>{r.code}</span>
                </div>
                <div style={{fontSize:10,color:"#4a3060"}}>Redeemed {new Date(r.redeemedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} · Show code at reception</div>
              </div>
            ))}
          </div>
        )}

        {!member&&(
          <div style={{padding:"16px",background:TH.slotFull,border:"1px solid rgba(124,58,237,.25)",borderRadius:16,textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:TH.purple,marginBottom:4}}>Members Only</div>
            <div style={{fontSize:12,color:"#6b5a8a"}}>Sign in or register to earn points and unlock rewards</div>
          </div>
        )}

        {rewards.filter(r=>r.active).map(r=>{
          const tierInfo  = TIERS.find(x=>x.name===r.tier)||TIERS[0];
          const redeemable= canRedeem(r);
          const locked    = member && !redeemable;
          const alreadyHas= myRedemptions.some(x=>x.rewardId===r.id&&!x.used);
          return(
            <div key={r.id} style={{background:redeemable?TH.bgSection:TH.bgCard,border:`1px solid ${redeemable?tierInfo.color+"44":TH.border}`,borderRadius:18,padding:"16px 18px",opacity:locked&&!alreadyHas?.65:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,fontWeight:800,color:TH.text}}>{r.title}</span>
                    <span style={{fontSize:9,fontWeight:800,color:tierInfo.color,background:tierInfo.bg,border:`1px solid ${tierInfo.color}44`,borderRadius:50,padding:"2px 7px"}}>{tierInfo.icon} {r.tier}+</span>
                  </div>
                  <div style={{fontSize:12,color:TH.textMid}}>{r.desc}</div>
                  {r.maxUses&&<div style={{fontSize:10,color:TH.textMid,marginTop:4}}>{r.maxUses-r.uses} remaining</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:tierInfo.color,lineHeight:1}}>{fmt(r.points)}</div>
                  <div style={{fontSize:9,color:TH.textMid,fontWeight:700}}>POINTS</div>
                </div>
              </div>
              {member&&(
                <button
                  onClick={()=>redeemable&&!alreadyHas&&setConfirmReward(r)}
                  disabled={!redeemable||alreadyHas}
                  style={{width:"100%",padding:"11px",borderRadius:11,border:"none",cursor:redeemable&&!alreadyHas?"pointer":"default",fontWeight:800,fontSize:13,transition:"all .2s",
                    background:alreadyHas?"rgba(124,58,237,.2)":redeemable?"linear-gradient(135deg,#7c3aed,#4c1d95)":TH.bgInput,
                    color:alreadyHas?"#a78bfa":redeemable?"#fff":TH.textFaint,
                    boxShadow:redeemable&&!alreadyHas?"0 4px 20px rgba(124,58,237,.4)":"none"}}>
                  {alreadyHas?"✓ Voucher Active — Show at Reception":redeemable?"Redeem Now →":locked?`Need ${fmt(r.points-member.points)} more pts`:"Sign in to redeem"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirmReward&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:TH.bgCard==="#ffffff"?"rgba(240,237,232,.9)":"rgba(2,5,12,.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setConfirmReward(null)}>
          <div style={{width:"100%",maxWidth:430,background:TH.bgCard,border:"1px solid rgba(124,58,237,.3)",borderRadius:"24px 24px 0 0",padding:"28px 24px 52px",animation:"slideUp .3s cubic-bezier(.34,1.1,.64,1)",textAlign:"center"}}>
            <div style={{width:60,height:60,borderRadius:"50%",margin:"0 auto 16px",background:"linear-gradient(135deg,#7c3aed,#4c1d95)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:"0 0 30px rgba(124,58,237,.4)"}}>🎁</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:TH.text,marginBottom:6}}>Confirm Redemption</div>
            <div style={{fontSize:13,color:"#6b5a8a",marginBottom:20,lineHeight:1.6}}>You're about to redeem <strong style={{color:"#c4b5fd"}}>{confirmReward.title}</strong></div>

            <div style={{background:"rgba(124,58,237,.1)",border:"1px solid rgba(167,139,250,.2)",borderRadius:14,padding:"14px",marginBottom:20,textAlign:"left"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px"}}>
                {[["Cost",fmt(confirmReward.points)+" pts"],["Your Balance",fmt(member.points)+" pts"],["After Redeem",fmt(member.points-confirmReward.points)+" pts"],["Reward",confirmReward.title]].map(([k,v])=>(
                  <div key={k}>
                    <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                    <div style={{fontSize:12,fontWeight:700,color:k==="After Redeem"?"#f97316":"#c4b5fd"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={()=>doRedeem(confirmReward)} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#7c3aed,#4c1d95)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 24px rgba(124,58,237,.4)",marginBottom:10,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
              Confirm & Get Code →
            </button>
            <button onClick={()=>setConfirmReward(null)} style={{width:"100%",padding:"11px",borderRadius:13,border:"1.5px solid "+TH.border,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════
function ProfileScreen({TH, member, members, friends, setFriends, setMembers, setMember, bookings, onNav, onLogin, onRegister, onLogout}) {
  const [tab, setTab] = useState("profile");
  const [search, setSearch] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const tier = member ? getTier(member.points) : null;
  const nextTier = member ? TIERS[TIERS.findIndex(t=>t.name===tier.name)+1] : null;
  const progress = member&&nextTier ? ((member.points-tier.min)/(nextTier.min-tier.min))*100 : 100;

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if(!file) return;
    if(file.size > 5*1024*1024) { alert("Photo must be under 5MB"); return; }
    setPhotoLoading(true);
    const reader = new FileReader();
    reader.onload = ev => {
      const photoUrl = ev.target.result;
      const updated = {...member, photoUrl};
      setMember(updated);
      setMembers(ms=>ms.map(m=>m.id===member.id?updated:m));
      setPhotoLoading(false);
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    const updated = {...member, photoUrl:null};
    setMember(updated);
    setMembers(ms=>ms.map(m=>m.id===member.id?updated:m));
  }

  if(!member) return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"30px 24px 100px",textAlign:"center"}}>
      <div style={{fontSize:60,marginBottom:20}}>👤</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:TH.text,marginBottom:8}}>Your Profile</div>
      <div style={{fontSize:13,color:TH.textMid,marginBottom:24}}>Sign in or register to access your profile, track points, and connect with friends.</div>
      <button onClick={onRegister} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",marginBottom:10,boxShadow:"0 4px 20px #f9731440"}}>Create Account</button>
      <button onClick={onLogin} style={{width:"100%",padding:"14px",borderRadius:14,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.text,fontSize:15,fontWeight:700,cursor:"pointer"}}>Sign In</button>
    </div>
  );

  const friendMembers = members.filter(m=>friends.includes(m.id));
  const searchResults = search.trim().length>1 ? members.filter(m=>m.id!==member.id&&m.name.toLowerCase().includes(search.toLowerCase())) : [];

  return(
    <div style={{minHeight:"100vh",paddingBottom:90,background:TH.bg}}>
      {/* Header */}
      <div style={{background:TH.headerBg,padding:"50px 20px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
          <div style={{width:58,height:58,borderRadius:18,background:`linear-gradient(135deg,${tier.color}60,${tier.color}20)`,border:`2px solid ${tier.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:tier.color,flexShrink:0,overflow:"hidden"}}>
            {member.photoUrl
              ? <img src={member.photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : member.avatar
            }</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:TH.text,lineHeight:1}}>{member.name}</div>
            <div style={{fontSize:11,color:tier.color,fontWeight:700,marginTop:2}}>{tier.icon} {tier.name} Member</div>
            <div style={{fontSize:10,color:TH.textMid,marginTop:1}}>Member since {new Date(member.joined).toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</div>
          </div>
          <button onClick={onLogout} style={{padding:"7px 13px",borderRadius:10,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:11,fontWeight:700,cursor:"pointer"}}>Sign Out</button>
        </div>
        {/* Points bar */}
        <div style={{background:"rgba(255,255,255,.04)",borderRadius:14,padding:"12px 14px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:tier.color}}>{fmt(member.points)} pts</span>
            {nextTier&&<span style={{fontSize:11,color:TH.textMid,fontWeight:700}}>{fmt(nextTier.min-member.points)} to {nextTier.name}</span>}
          </div>
          {nextTier&&<div style={{height:6,background:TH.bgInput,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,progress)}%`,background:`linear-gradient(90deg,${tier.color},${tier.color}99)`,borderRadius:3}}/></div>}
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:0,borderBottom:"1px solid "+TH.border}}>
          {[["profile","Profile"],["friends","Friends"],["bookings","Bookings"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:tab===id?TH.text:TH.textMid,borderBottom:tab===id?"2px solid #f97316":"2px solid transparent"}}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"16px"}} className="fu">
        {tab==="profile"&&(
          <><div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{l:"Sessions",v:member.bookings,c:"#f97316"},{l:"Points",v:fmt(member.points),c:tier.color},{l:"Friends",v:friendMembers.length,c:"#06b6d4"},{l:"Tier",v:tier.name,c:tier.color}].map(s=>(
                <div key={s.l} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:16,padding:"14px"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:s.c,lineHeight:1}}>{s.v}</div>
                  <div style={{fontSize:9,color:TH.textFaint,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:1,color:TH.textMid,textTransform:"uppercase",marginBottom:12}}>How to Earn Points</div>
              {[["Sign up","100 pts"],["Off-peak booking","50 pts"],["Off-peak on Friday","80 pts"],["Peak booking","80 pts"],["2-hour session","2× points"]].map(([a,b])=>(
                <div key={a} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+TH.border,alignItems:"center"}}>
                  <span style={{fontSize:12,color:TH.textMid}}>{a}</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#22c55e"}}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── PROFILE PHOTO ── */}
          <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:14}}>📷 Profile Photo</div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              {/* Current photo / avatar */}
              <div style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${tier.color}60,${tier.color}20)`,border:`2px solid ${tier.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:24,color:tier.color,flexShrink:0,overflow:"hidden",position:"relative"}}>
                {member.photoUrl
                  ? <img src={member.photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : member.avatar
                }
                {photoLoading&&(
                  <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⏳</div>
                )}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:TH.text,fontWeight:600,marginBottom:4}}>
                  {member.photoUrl ? "Photo uploaded" : "No photo yet"}
                </div>
                <div style={{fontSize:11,color:TH.textFaint,marginBottom:10,lineHeight:1.5}}>JPG or PNG · Max 5MB · Square crops best</div>
                <div style={{display:"flex",gap:8}}>
                  {/* Hidden file input */}
                  <label style={{padding:"8px 14px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",touchAction:"manipulation"}}>
                    {member.photoUrl?"Change Photo":"Upload Photo"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{display:"none"}}/>
                  </label>
                  {member.photoUrl&&(
                    <button onClick={removePhoto} style={{padding:"8px 12px",borderRadius:10,border:"1.5px solid rgba(239,68,68,.3)",background:"transparent",color:"#ef4444",fontSize:12,fontWeight:700,cursor:"pointer"}}>Remove</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── PRIVACY SETTINGS ── */}
          <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:4}}>🔒 Privacy Settings</div>
            <div style={{fontSize:11,color:TH.textFaint,marginBottom:12,lineHeight:1.5}}>Control what other members can see about you.</div>
            {[
              {k:"showOnLeaderboard",icon:"🏆",title:"Show on Points Leaderboard",desc:"Your name & points appear in the rankings"},
              {k:"showRating",       icon:"⭐",title:"Show My Player Rating",     desc:"Members can see and submit ratings for you"},
            ].map(({k,icon,title,desc})=>{
              const isOn = member[k]!==false; // default true if not set
              const toggle = ()=>{
                const updated={...member,[k]:!isOn};
                setMember(updated);
                setMembers&&setMembers(ms=>ms.map(m=>m.id===member.id?updated:m));
              }
              return(
                <div key={k} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid "+TH.border}}>
                  <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{title}</div>
                    <div style={{fontSize:11,color:TH.textMid,marginTop:2}}>{desc}</div>
                    <div style={{fontSize:10,marginTop:3,fontWeight:700,color:isOn?"#22c55e":"#f59e0b"}}>{isOn?"Visible to others":"Hidden from others"}</div>
                  </div>
                  <button onClick={toggle}
                    style={{flexShrink:0,width:44,height:24,borderRadius:50,border:"none",cursor:"pointer",position:"relative",transition:"background .25s",
                      background:isOn?"linear-gradient(135deg,#22c55e,#15803d)":TH.borderMid}}>
                    <span style={{position:"absolute",top:3,left:isOn?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
                  </button>
                </div>
              );
            })}
          </div>
        </>)}

        {tab==="friends"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input placeholder="Search members to add..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{width:"100%",background:TH.bgCard,border:"1.5px solid "+TH.border,borderRadius:13,padding:"12px 15px",color:TH.text,fontSize:14}}/>
            {searchResults.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:TH.textMid,textTransform:"uppercase"}}>Search Results</div>
                {searchResults.map(m=>{
                  const t=getTier(m.points);
                  const isFriend=friends.includes(m.id);
                  return(
                    <div key={m.id} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:38,height:38,borderRadius:"50%",background:`${t.color}30`,border:`2px solid ${t.color}60`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:t.color}}>{m.avatar}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{m.name}</div>
                        <div style={{fontSize:10,color:TH.textMid}}>{t.icon} {t.name} · {fmt(m.points)} pts</div>
                      </div>
                      <button onClick={()=>isFriend?setFriends(f=>f.filter(x=>x!==m.id)):setFriends(f=>[...f,m.id])}
                        style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,
                          borderColor:isFriend?"#ef4444":"#22c55e",background:isFriend?"rgba(239,68,68,.1)":"rgba(34,197,94,.1)",color:isFriend?"#ef4444":"#22c55e"}}>
                        {isFriend?"Remove":"+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:TH.textMid,textTransform:"uppercase",marginTop:4}}>Your Friends ({friendMembers.length})</div>
            {friendMembers.length===0&&<div style={{textAlign:"center",padding:"30px",color:TH.textTiny,fontSize:13}}>No friends yet — search to add some</div>}
            {friendMembers.map(m=>{
              const t=getTier(m.points);
              return(
                <div key={m.id} style={{background:TH.bgCard,border:"1px solid rgba(6,182,212,.2)",borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:`${t.color}30`,border:`2px solid ${t.color}60`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:t.color}}>{m.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{m.name}</div>
                    <div style={{fontSize:10,color:TH.textMid}}>{t.icon} {t.name} · {m.bookings} sessions · {fmt(m.points)} pts</div>
                  </div>
                  <button onClick={()=>alert("Challenge feature coming soon!")} style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid "+TH.border,background:"transparent",color:TH.textMid,fontSize:11,fontWeight:700,cursor:"pointer"}}>Challenge</button>
                </div>
              );
            })}
          </div>
        )}

        {tab==="bookings"&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {(()=>{
              const myBks = (bookings||[]).filter(b=>b.memberId===member.id).sort((a,b2)=>b2.createdAt?.localeCompare(a.createdAt||"")||0);
              if(myBks.length===0) return(
                <div style={{textAlign:"center",padding:"40px 0"}}>
                  <div style={{fontSize:36,marginBottom:10}}>📋</div>
                  <div style={{fontSize:13,fontWeight:700,color:TH.textFaint}}>No bookings yet</div>
                  <div style={{fontSize:11,color:TH.borderMid,marginTop:4}}>Your sessions will appear here</div>
                </div>
              );
              return myBks.map(b=>{
                const sC=b.status==="confirmed"?"#22c55e":b.status==="cancelled"?"#ef4444":"#f59e0b";
                return(
                  <div key={b.id} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:14,padding:"13px 15px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,alignItems:"center"}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:2,color:"#06b6d4"}}>{b.ref}</span>
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        {b.paid&&<span style={{fontSize:9,fontWeight:800,color:"#22c55e",background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.3)",borderRadius:50,padding:"2px 6px"}}>💰 PAID</span>}
                        <span style={{fontSize:9,fontWeight:800,color:sC,background:sC+"18",border:"1px solid "+sC+"40",borderRadius:50,padding:"2px 7px"}}>{b.status.toUpperCase()}</span>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:TH.textMid}}>Court {b.courtId} · {b.date} · {b.time}–{b.endTime}</div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                      <span style={{fontSize:11,color:"#22c55e",fontWeight:700}}>+{b.pts} pts earned</span>
                      <span style={{fontSize:11,color:b.pk?"#f97316":"#22c55e",fontWeight:700}}>MWK {Number(b.price||0).toLocaleString()}</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════════
function RegisterScreen({TH, onDone, onBack, onLogin}) {
  const [f, setF] = useState({name:"",email:"",phone:"",password:"",gender:"",showOnLeaderboard:true,showRating:true});
  const [step, setStep] = useState(1); // 1=form, 2=success
  const [err, setErr] = useState("");

  function submit() {
    if(!f.name.trim()||!f.email.trim()||!f.phone.trim()||!f.password.trim()){setErr("All fields required");return;}
    if(!f.gender){setErr("Please select your gender");return;}
    const initials = f.name.trim().split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
    const m = {id:"m"+Date.now(),name:f.name.trim(),email:f.email.trim(),phone:f.phone.trim(),password:f.password.trim(),gender:f.gender,points:100,tier:"Bronze",avatar:initials,joined:new Date().toISOString().slice(0,10),bookings:0,wins:0,ratingTotal:0,ratingCount:0,showOnLeaderboard:f.showOnLeaderboard,showRating:f.showRating};
    setStep(2);
    setTimeout(()=>onDone(m),1800);
  }

  const I = {width:"100%",background:TH.bgCard,border:"1.5px solid "+TH.border,borderRadius:13,padding:"14px 16px",color:TH.text,fontSize:14,fontWeight:500};

  if(step===2) return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",textAlign:"center"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#22c55e,#15803d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,boxShadow:"0 0 40px #22c55e50",marginBottom:20,animation:"pop .5s cubic-bezier(.34,1.56,.64,1)"}}>✓</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:TH.text,marginBottom:8}}>Welcome to ACE!</div>
      <div style={{fontSize:13,color:TH.textMid,marginBottom:16}}>Your account is ready. You've been given 100 welcome points.</div>
      <div style={{background:"rgba(249,115,22,.1)",border:"1px solid rgba(249,115,22,.3)",borderRadius:14,padding:"12px 20px"}}>
        <div style={{fontSize:12,color:"#f97316",fontWeight:700}}>🎁 100 Welcome Points Added!</div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",padding:"60px 22px 40px",background:TH.bg}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:24,display:"flex",alignItems:"center",gap:6}}>← Back</button>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:3,color:TH.text,marginBottom:6}}>Join ACE</div>
      <div style={{fontSize:13,color:TH.textMid,marginBottom:28}}>Create your member account and start earning points</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {[{k:"name",p:"Full name *",t:"text"},{k:"email",p:"Email address *",t:"email"},{k:"phone",p:"Phone number *",t:"tel"},{k:"password",p:"Create password *",t:"password"}].map(x=>(
          <input key={x.k} type={x.t} placeholder={x.p} value={f[x.k]} onChange={e=>setF(p=>({...p,[x.k]:e.target.value}))} style={{...I,borderColor:f[x.k]?"#1a3050":TH.border}}/>
        ))}
        <div>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:8}}>Gender *</div>
          <div style={{display:"flex",gap:10}}>
            {[["male","👦 Male"],["female","👧 Female"]].map(([v,l])=>(
              <button key={v} type="button" onClick={()=>setF(p=>({...p,gender:v}))} style={{flex:1,padding:"11px",borderRadius:13,border:"1.5px solid",cursor:"pointer",fontSize:13,fontWeight:800,borderColor:f.gender===v?"#f97316":TH.border,background:f.gender===v?"rgba(249,115,22,.15)":TH.bgCard,color:f.gender===v?"#f97316":TH.textMid}}>{l}</button>
            ))}
          </div>
        </div>
        {/* ── PRIVACY SETTINGS ── */}
        <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:16,padding:"16px"}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:4}}>🔒 Privacy</div>
          <div style={{fontSize:11,color:TH.textFaint,marginBottom:12,lineHeight:1.5}}>You can change these anytime in your profile settings.</div>
          {[
            {k:"showOnLeaderboard",icon:"🏆",title:"Show on Points Leaderboard",desc:"Other members can see your name and points ranking"},
            {k:"showRating",       icon:"⭐",title:"Show My Player Rating",     desc:"Other members can see and submit ratings for you"},
          ].map(({k,icon,title,desc})=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:"1px solid "+TH.border}}>
              <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{title}</div>
                <div style={{fontSize:11,color:TH.textMid,marginTop:2}}>{desc}</div>
              </div>
              <button type="button" onClick={()=>setF(p=>({...p,[k]:!p[k]}))}
                style={{flexShrink:0,width:44,height:24,borderRadius:50,border:"none",cursor:"pointer",position:"relative",transition:"background .25s",
                  background:f[k]?"linear-gradient(135deg,#22c55e,#15803d)":TH.borderMid}}>
                <span style={{position:"absolute",top:3,left:f[k]?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
              </button>
            </div>
          ))}
        </div>
        {err&&<div style={{color:"#f87171",fontSize:13,fontWeight:600}}>{err}</div>}
        <div style={{background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.2)",borderRadius:13,padding:"12px 14px",fontSize:12,color:"#f97316"}}>
          🎁 Get <strong>100 welcome points</strong> just for signing up — redeemable on your first booking!
        </div>
        <button onClick={submit} style={{padding:"15px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 24px #f9731440",marginTop:4}}>Create Account →</button>
        <div style={{textAlign:"center",fontSize:12,color:TH.textFaint}}>
          Already have an account? <span onClick={()=>onLogin&&onLogin()} style={{color:"#f97316",cursor:"pointer",fontWeight:700}}>Sign in</span>
        </div>
        <div style={{borderTop:"1px solid "+TH.border,paddingTop:16,textAlign:"center"}}>
          <button onClick={onBack} style={{padding:"12px 24px",borderRadius:12,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>Continue as Guest →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
function LoginScreen({TH, members, onDone, onBack, onRegister}) {
  const [email,      setEmail]      = useState("");
  const [pw,         setPw]         = useState("");
  const [rememberMe, setRememberMe] = useState(true); // default ON
  const [err,        setErr]        = useState("");

  function login() {
    const m = members.find(x=>x.email.toLowerCase()===email.trim().toLowerCase());
    if(!m){setErr("No account found with that email");return;}
    if(!pw.trim()){setErr("Please enter your password");return;}
    const correct = m.password||"demo1234";
    if(pw!==correct){setErr("Incorrect password");return;}
    // Save session if Remember Me is on
    if(rememberMe) saveSession(m);
    else clearSession();
    onDone(m);
  }

  const I = {width:"100%",background:TH.bgCard,border:"1.5px solid "+TH.border,borderRadius:13,padding:"14px 16px",color:TH.text,fontSize:14};

  return(
    <div style={{minHeight:"100vh",padding:"60px 22px 40px",background:TH.bg}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:24}}>← Back</button>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:3,color:TH.text,marginBottom:6}}>Sign In</div>
      <div style={{fontSize:13,color:TH.textMid,marginBottom:28}}>Welcome back to ACE Padel Club</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <input type="email" placeholder="Email address" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} style={{...I,borderColor:email?"#1a3050":TH.border}}/>
        <input type="password" placeholder="Password" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&login()} style={{...I,borderColor:pw?"#1a3050":TH.border}}/>
        {/* Remember Me */}
        <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 14px",background:TH.bgCard,border:"1px solid "+(rememberMe?"rgba(249,115,22,.3)":TH.border),borderRadius:12,transition:"border-color .2s"}}>
          <div onClick={()=>setRememberMe(p=>!p)}
            style={{width:22,height:22,borderRadius:6,border:"2px solid "+(rememberMe?"#f97316":TH.borderMid),background:rememberMe?"#f97316":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0,cursor:"pointer"}}>
            {rememberMe&&<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:TH.text}}>Remember me</div>
            <div style={{fontSize:10,color:TH.textMid,marginTop:1}}>Stay signed in for 30 days</div>
          </div>
          <div style={{fontSize:10,fontWeight:800,color:rememberMe?"#f97316":TH.textFaint}}>{rememberMe?"ON":"OFF"}</div>
        </label>
        {err&&<div style={{color:"#f87171",fontSize:13,fontWeight:600}}>{err}</div>}
        <div style={{fontSize:11,color:TH.textMid,background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:11,padding:"10px 13px"}}>
          Demo account: <strong style={{color:"#06b6d4"}}>demo@ace.com</strong> · password: <strong style={{color:"#06b6d4"}}>demo1234</strong>
        </div>
        <button onClick={login} style={{padding:"15px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 24px #f9731440",marginTop:4}}>Sign In →</button>
        <div style={{borderTop:"1px solid "+TH.border,paddingTop:16,textAlign:"center"}}>
          <div style={{fontSize:12,color:TH.textFaint,marginBottom:10}}>Don't have an account? <span onClick={onRegister||onBack} style={{color:"#f97316",fontWeight:700,cursor:"pointer"}}>Create one free →</span></div>
          <button onClick={onBack} style={{padding:"12px 24px",borderRadius:12,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>Continue as Guest →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN — FULL PORTAL
// ═══════════════════════════════════════════════════════════════
const ADMIN_PASS = "ace2024";

function AdminScreen({TH, members,rewards,bookings,waitlist,promoOffers,setPromoOffers,tournaments,settings,onSaveSettings,blockouts,onAddBlockout,onRemoveBlockout,notifications,onMarkRead,onClearNotifs,setRewards,onAddPoints,onUpdateBooking,onCancelWaitlist,onUpdateTournament,onCreateTournament,redemptions,onMarkRedemptionUsed,onBack}) {
  const [auth,   setAuth]  = useState(false);
  const [pw,     setPw]    = useState("");
  const [pwErr,  setPwErr] = useState("");
  const [tab,    setTab]   = useState("today");

  if(!auth) return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{width:"100%",maxWidth:380,background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:28,padding:"40px 28px",textAlign:"center"}} className="fu">
        <div style={{width:64,height:64,borderRadius:18,margin:"0 auto 18px",background:"linear-gradient(135deg,#0c1e30,#080e1a)",border:"1px solid "+TH.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🔐</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:TH.text,marginBottom:4}}>Admin Portal</div>
        <div style={{fontSize:12,color:TH.textMid,marginBottom:22}}>Staff access only</div>
        <input type="password" placeholder="Password" value={pw}
          onChange={e=>{setPw(e.target.value);setPwErr("");}}
          onKeyDown={e=>e.key==="Enter"&&(pw===ADMIN_PASS?setAuth(true):setPwErr("Incorrect password"))}
          style={{width:"100%",background:TH.bgInput,border:"1.5px solid "+TH.border,borderRadius:13,padding:"13px 15px",color:TH.text,fontSize:14,marginBottom:10,outline:"none"}}/>
        {pwErr&&<div style={{color:"#f87171",fontSize:13,marginBottom:10}}>{pwErr}</div>}
        <button onClick={()=>pw===ADMIN_PASS?setAuth(true):setPwErr("Incorrect password")}
          style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b91c1c)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",marginBottom:10}}>
          Sign In →
        </button>
        <button onClick={onBack} style={{width:"100%",padding:"11px",borderRadius:13,border:"1.5px solid "+TH.border,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>← Back</button>
        <div style={{fontSize:10,color:TH.borderMid,marginTop:14}}>Password: ace2024</div>
      </div>
    </div>
  );

  const todayKey = new Date().toISOString().slice(0,10);
  const todayBks = (bookings||[]).filter(b=>b.dateKey===todayKey);
  const totalRev = todayBks.reduce((s,b)=>s+(b.price||0),0);
  const pending  = todayBks.filter(b=>b.status==="pending").length;
  const confirmed= todayBks.filter(b=>b.status==="confirmed").length;

  const unread = (notifications||[]).filter(n=>!n.read).length;
  const tabs=[
    ["today","📊 Today"],["bookings","📋 Bookings"],["members","👥 Members"],
    ["waitlist","⏳ Waitlist"],["blockouts","🚫 Block-outs"],["tournaments","🏓 Tournaments"],
    ["redemptions","🎁 Redemptions"],["specials","🏷 Specials"],["rewards","🎁 Rewards"],
    ["points","⭐ Points"],["settings","⚙ Settings"],["notifs",`🔔${unread>0?" ("+unread+")":""}`],["export","📥 Export"],
  ];

  const SI={background:TH.bgCard,border:"1.5px solid "+TH.border,borderRadius:11,padding:"10px 13px",color:TH.text,fontSize:13,width:"100%",outline:"none"};

  return(
    <div style={{minHeight:"100vh",paddingBottom:40,background:TH.bg}}>
      {/* Header */}
      <div style={{background:"rgba(5,8,15,.97)",borderBottom:"1px solid "+TH.border,padding:"0 18px",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,paddingTop:48,paddingBottom:10}}>
          <button onClick={onBack} style={{background:"transparent",border:"none",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>←</button>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:3,color:TH.text}}>ACE Admin</div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:9,fontWeight:800,color:"#f97316",background:"rgba(249,115,22,.15)",border:"1px solid rgba(249,115,22,.3)",borderRadius:50,padding:"3px 9px"}}>ADMIN</div>
            <button onClick={()=>{setAuth(false);setPw("");}} style={{padding:"5px 12px",borderRadius:9,border:"1.5px solid "+TH.border,background:"transparent",color:TH.textMid,fontSize:11,fontWeight:700,cursor:"pointer"}}>Sign Out</button>
          </div>
        </div>
        <div style={{display:"flex",gap:0,overflowX:"auto",scrollbarWidth:"none"}}>
          {tabs.map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flexShrink:0,padding:"9px 14px",border:"none",background:"transparent",cursor:"pointer",fontSize:11,fontWeight:700,color:tab===id?TH.text:TH.textMid,borderBottom:tab===id?"2px solid #f97316":"2px solid transparent",whiteSpace:"nowrap"}}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"16px"}}>

        {/* ── TODAY ── */}
        {tab==="today"&&(
          <div className="fu">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:18}}>
              {[
                {l:"Today's Bookings",v:todayBks.length,c:"#f97316"},
                {l:"Confirmed",v:confirmed,c:"#22c55e"},
                {l:"Pending",v:pending,c:"#f59e0b"},
                {l:"Revenue",v:"MWK "+fmt(totalRev),c:"#06b6d4"},
                {l:"Total Members",v:members.length,c:"#a78bfa"},
                {l:"Waitlist",v:(waitlist||[]).length,c:"#7c3aed"},
              ].map(s=>(
                <div key={s.l} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:14,padding:"13px 12px"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:typeof s.v==="number"?26:16,color:s.c,lineHeight:1}}>{s.v}</div>
                  <div style={{fontSize:9,color:TH.textFaint,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginTop:4,lineHeight:1.3}}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Today's schedule */}
            <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:10}}>Today's Schedule</div>
            {todayBks.length===0?(
              <div style={{textAlign:"center",padding:"32px",color:TH.textTiny,fontSize:13}}>No bookings today</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {[...todayBks].sort((a,b)=>a.time?.localeCompare(b.time)).map(b=>{
                  const sC=b.status==="confirmed"?"#22c55e":b.status==="cancelled"?"#ef4444":"#f59e0b";
                  return(
                    <div key={b.id} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#f97316",flexShrink:0,width:44}}>{b.time}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{b.name}</div>
                        <div style={{fontSize:10,color:TH.textMid}}>Court {b.courtId} · {b.time}–{b.endTime} · {b.ref}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <span style={{fontSize:9,fontWeight:800,color:sC,background:sC+"18",border:"1px solid "+sC+"40",borderRadius:50,padding:"2px 7px"}}>{b.status.toUpperCase()}</span>
                        {b.status==="pending"&&<button onClick={()=>onUpdateBooking(b.id,{status:"confirmed"})} style={{fontSize:9,fontWeight:800,color:"#22c55e",background:TH.slotOff,border:"1px solid rgba(34,197,94,.3)",borderRadius:50,padding:"2px 9px",cursor:"pointer"}}>✓ Confirm</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab==="bookings"&&(
          <div className="fu">
            <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:12}}>All Bookings ({(bookings||[]).length})</div>
            {(bookings||[]).length===0?(
              <div style={{textAlign:"center",padding:"40px",color:TH.textTiny,fontSize:13}}>No bookings yet</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[...(bookings||[])].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||"")).map((b,i)=>{
                  const sC=b.status==="confirmed"?"#22c55e":b.status==="cancelled"?"#ef4444":"#f59e0b";
                  return(
                    <div key={b.id} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:14,padding:"13px 14px",animation:"fadeUp .3s ease "+i*.03+"s both"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:2,color:"#06b6d4"}}>{b.ref}</span>
                        <span style={{fontSize:9,fontWeight:800,color:sC,background:sC+"18",border:"1px solid "+sC+"40",borderRadius:50,padding:"2px 6px"}}>{b.status?.toUpperCase()}</span>
                        {b.paid&&<span style={{fontSize:9,fontWeight:800,color:"#22c55e",background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.3)",borderRadius:50,padding:"2px 7px"}}>💰 PAID</span>}
                        <span style={{marginLeft:"auto",fontSize:13,fontWeight:800,color:b.pk?"#f97316":"#22c55e"}}>MWK {fmt(b.price||0)}</span>
                      </div>
                      <div style={{fontSize:12,color:TH.text,fontWeight:700,marginBottom:2}}>{b.name} · {b.phone}</div>
                      <div style={{fontSize:11,color:TH.textMid}}>Court {b.courtId} · {b.date} · {b.time}–{b.endTime}</div>
                      <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                        {b.status==="pending"&&<button onClick={()=>onUpdateBooking(b.id,{status:"confirmed"})} style={{padding:"5px 12px",borderRadius:8,border:"1px solid rgba(34,197,94,.3)",background:TH.slotOff,color:"#22c55e",fontSize:10,fontWeight:700,cursor:"pointer"}}>✓ Confirm</button>}
                        {b.status==="confirmed"&&<button onClick={()=>onUpdateBooking(b.id,{status:"pending"})} style={{padding:"5px 12px",borderRadius:8,border:"1px solid "+TH.border,background:"transparent",color:TH.textMid,fontSize:10,fontWeight:700,cursor:"pointer"}}>↩ Unconfirm</button>}
                        {b.status!=="cancelled"&&<button onClick={()=>onUpdateBooking(b.id,{status:"cancelled"})} style={{padding:"5px 12px",borderRadius:8,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.08)",color:"#ef4444",fontSize:10,fontWeight:700,cursor:"pointer"}}>✕ Cancel</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERS ── */}
        {tab==="members"&&(
          <div className="fu">
            {/* Tier breakdown */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
              {TIERS.map(t=>{
                const cnt=members.filter(m=>getTier(m.points).name===t.name).length;
                return(
                  <div key={t.name} style={{background:TH.bgCard,border:"1px solid "+t.color+"33",borderRadius:13,padding:"11px 8px",textAlign:"center"}}>
                    <div style={{fontSize:18}}>{t.icon}</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:t.color,lineHeight:1.1}}>{cnt}</div>
                    <div style={{fontSize:8,color:TH.textFaint,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginTop:2}}>{t.name}</div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[...members].sort((a,b)=>b.points-a.points).map((m,i)=>{
                const t=getTier(m.points);
                return(
                  <div key={m.id} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,animation:"fadeUp .3s ease "+i*.03+"s both"}}>
                    <div style={{width:10,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:TH.textFaint,flexShrink:0}}>{i+1}</div>
                    <div style={{width:38,height:38,borderRadius:"50%",background:t.color+"30",border:"2px solid "+t.color+"60",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:t.color,flexShrink:0,overflow:"hidden"}}>{m.photoUrl?<img src={m.photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:m.avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{m.name}</div>
                      <div style={{fontSize:10,color:TH.textMid,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.icon} {t.name} · {m.bookings} sessions · {m.phone}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:t.color,lineHeight:1}}>{fmt(m.points)}</div>
                      <div style={{fontSize:9,color:TH.textFaint,fontWeight:700}}>pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── WAITLIST ── */}
        {tab==="waitlist"&&(
          <div className="fu">
            <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:12}}>Active Waitlist ({(waitlist||[]).length})</div>
            {(waitlist||[]).length===0?(
              <div style={{textAlign:"center",padding:"40px",color:TH.textTiny,fontSize:13}}>No one on the waitlist</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {(waitlist||[]).map((w,i)=>(
                  <div key={w.id} style={{background:TH.bgCard,border:"1px solid rgba(124,58,237,.25)",borderRadius:14,padding:"13px 14px",animation:"fadeUp .3s ease "+i*.03+"s both"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(124,58,237,.2)",border:"1.5px solid rgba(167,139,250,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>⏳</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{w.name}</div>
                        <div style={{fontSize:10,color:"#6b5a8a"}}>{w.phone}</div>
                      </div>
                      <div style={{background:TH.slotWait,border:"1px solid rgba(167,139,250,.3)",borderRadius:50,padding:"3px 9px",fontSize:9,fontWeight:800,color:TH.purple}}>WAITING</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px",marginBottom:10}}>
                      {[["Court","Court "+w.courtId],["Date",w.date],["Time",w.time+" – "+w.endTime]].map(([k,v])=>(
                        <div key={k} style={{gridColumn:k==="Date"?"span 2":undefined}}>
                          <div style={{fontSize:8,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:1}}>{k}</div>
                          <div style={{fontSize:11,fontWeight:700,color:"#c4b5fd"}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <a href={"tel:"+w.phone} style={{flex:1,padding:"7px",borderRadius:9,border:"1px solid rgba(34,197,94,.3)",background:"rgba(34,197,94,.08)",color:"#22c55e",fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"none",textAlign:"center"}}>📞 Call</a>
                      <button onClick={()=>onCancelWaitlist&&onCancelWaitlist(w.id)} style={{flex:1,padding:"7px",borderRadius:9,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REWARDS ── */}
        {tab==="specials"&&(
          <AdminSpecialsTab TH={TH} promoOffers={promoOffers||[]} setPromoOffers={setPromoOffers} SI={SI}/>
        )}

        {/* ── REDEMPTIONS ── */}
        {tab==="redemptions"&&(
          <div className="fu">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase"}}>
                Reward Redemptions ({(redemptions||[]).length})
              </div>
              <div style={{fontSize:10,color:TH.textMid}}>
                {(redemptions||[]).filter(r=>!r.used).length} pending · {(redemptions||[]).filter(r=>r.used).length} used
              </div>
            </div>
            {(redemptions||[]).length===0?(
              <div style={{textAlign:"center",padding:"40px",color:TH.textTiny,fontSize:13}}>No redemptions yet</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[...(redemptions||[])].sort((a,b)=>b.redeemedAt.localeCompare(a.redeemedAt)).map((r,i)=>(
                  <div key={r.id} style={{background:TH.bgCard,border:"1px solid "+(r.used?TH.border:"rgba(167,139,250,.25)"),borderRadius:14,padding:"13px 14px",opacity:r.used?.6:1,animation:"fadeUp .25s ease "+(i*.03)+"s both"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:3,color:TH.purple}}>{r.code}</span>
                          <span style={{fontSize:9,fontWeight:800,color:r.used?TH.textMid:"#22c55e",background:r.used?TH.bgCard2:"rgba(34,197,94,.12)",border:"1px solid "+(r.used?TH.border:"rgba(34,197,94,.3)"),borderRadius:50,padding:"2px 7px"}}>{r.used?"USED":"PENDING"}</span>
                        </div>
                        <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:2}}>{r.rewardTitle}</div>
                        <div style={{fontSize:10,color:TH.textMid}}>{r.memberName} · {r.pointsCost?.toLocaleString()} pts · {new Date(r.redeemedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                      </div>
                    </div>
                    {!r.used&&(
                      <button onClick={()=>onMarkRedemptionUsed&&onMarkRedemptionUsed(r.id)}
                        style={{width:"100%",padding:"9px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:12,fontWeight:800,cursor:"pointer"}}>
                        ✓ Mark as Used
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BLOCKOUTS ── */}
        {tab==="blockouts"&&(
          <AdminBlockoutsTab TH={TH} blockouts={blockouts||[]} onAdd={onAddBlockout} onRemove={onRemoveBlockout}/>
        )}

        {/* ── SETTINGS ── */}
        {tab==="settings"&&(
          <AdminSettingsTab TH={TH} settings={settings||DEFAULT_PRICES} onSave={onSaveSettings}/>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab==="notifs"&&(
          <AdminNotifsTab TH={TH} notifications={notifications||[]} onMarkRead={onMarkRead} onClear={onClearNotifs}/>
        )}

        {/* ── TOURNAMENTS ADMIN ── */}
        {tab==="tournaments"&&(
          <AdminTournamentsTab TH={TH} tournaments={tournaments||[]} members={members}
            onUpdate={onUpdateTournament} onCreate={onCreateTournament} SI={SI}/>
        )}

        {tab==="rewards"&&(
          <AdminRewardsTab TH={TH} rewards={rewards} setRewards={setRewards} SI={SI}/>
        )}

        {/* ── POINTS ── */}
        {tab==="points"&&(
          <AdminPointsTab TH={TH} members={members} onAddPoints={onAddPoints} SI={SI}/>
        )}

        {/* ── EXPORT ── */}
        {tab==="export"&&(
          <AdminExportTab TH={TH} bookings={bookings||[]} members={members} waitlist={waitlist||[]} promoOffers={promoOffers||[]}/>
        )}

      </div>
    </div>
  );
}

function AdminSpecialsTab({TH, promoOffers, setPromoOffers, SI}) {
  const DAYS_OF_WEEK = [
    {v:"1",l:"Monday"},{v:"2",l:"Tuesday"},{v:"3",l:"Wednesday"},
    {v:"4",l:"Thursday"},{v:"5",l:"Friday"},{v:"6",l:"Saturday"},{v:"0",l:"Sunday"},
  ];
  const blank = {title:"",desc:"",discType:"pct",discVal:"",dateType:"always",weekday:"",specificDate:"",timeFrom:"",timeTo:"",active:true};
  const [f,   setF]   = useState(blank);
  const [err, setErr] = useState("");
  const [exp, setExp] = useState(false);
  const [editId, setEditId] = useState(null);

  const timeOpts = [];
  for(let h=5;h<24;h++){timeOpts.push(String(h).padStart(2,"0")+":00");timeOpts.push(String(h).padStart(2,"0")+":30");}
  timeOpts.push("00:00","00:30","01:00");

  function save() {
    if(!f.title.trim()){setErr("Title required");return;}
    if(!f.discVal||Number(f.discVal)<1){setErr("Enter a discount value");return;}
    if(f.discType==="pct"&&Number(f.discVal)>100){setErr("Percentage can't exceed 100");return;}
    if(f.dateType==="weekday"&&!f.weekday){setErr("Select a day");return;}
    if(f.dateType==="date"&&!f.specificDate){setErr("Select a date");return;}
    const offer = {
      id: editId || "p"+Date.now(),
      title:f.title.trim(), desc:f.desc.trim(),
      discType:f.discType, discVal:Number(f.discVal),
      dateType:f.dateType, weekday:f.weekday,
      specificDate:f.specificDate,
      timeFrom:f.timeFrom||"", timeTo:f.timeTo||"",
      active:f.active,
      createdAt: new Date().toISOString().slice(0,10),
    };
    if(editId) {
      setPromoOffers(ps=>ps.map(p=>p.id===editId?offer:p));
      setEditId(null);
    } else {
      setPromoOffers(ps=>[offer,...ps]);
    }
    setF(blank); setErr(""); setExp(false);
  }

  function startEdit(o) {
    setF({title:o.title,desc:o.desc,discType:o.discType,discVal:String(o.discVal),dateType:o.dateType,weekday:o.weekday||"",specificDate:o.specificDate||"",timeFrom:o.timeFrom||"",timeTo:o.timeTo||"",active:o.active});
    setEditId(o.id); setExp(true); setErr("");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function toggleActive(id) { setPromoOffers(ps=>ps.map(p=>p.id===id?{...p,active:!p.active}:p)); }
  function remove(id) { setPromoOffers(ps=>ps.filter(p=>p.id!==id)); }

  function offerSchedule(o) {
    const parts = [];
    if(o.dateType==="weekday") parts.push(DAYS_OF_WEEK.find(d=>d.v===o.weekday)?.l+"s only" || "");
    if(o.dateType==="date")    parts.push("On "+o.specificDate);
    if(o.dateType==="always")  parts.push("Every day");
    if(o.timeFrom&&o.timeTo)   parts.push(o.timeFrom+"–"+o.timeTo);
    else if(o.timeFrom)        parts.push("From "+o.timeFrom);
    else if(o.timeTo)          parts.push("Until "+o.timeTo);
    return parts.join(" · ");
  }

  const activeCount = promoOffers.filter(p=>p.active).length;

  return(
    <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>

      {/* Summary pill */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.2)",borderRadius:12}}>
        <span style={{fontSize:13,fontWeight:800,color:"#f97316"}}>🏷 {activeCount} Active Special{activeCount!==1?"s":""}</span>
        <span style={{fontSize:11,color:"#4a3020"}}>Visible to customers on booking screen</span>
      </div>

      {/* Create / Edit form */}
      <div style={{background:TH.bgCard,border:"1px solid "+(editId?"rgba(6,182,212,.3)":TH.border),borderRadius:18,padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:editId?"#06b6d4":TH.textMid,textTransform:"uppercase"}}>
            {editId?"✏ Editing Offer":"Create New Special Offer"}
          </div>
          {!editId&&(
            <button onClick={()=>setExp(p=>!p)} style={{fontSize:11,fontWeight:700,color:"#06b6d4",background:"rgba(6,182,212,.1)",border:"1px solid rgba(6,182,212,.25)",borderRadius:50,padding:"4px 12px",cursor:"pointer"}}>{exp?"Collapse ▲":"Expand ▼"}</button>
          )}
          {editId&&(
            <button onClick={()=>{setEditId(null);setF(blank);setErr("");setExp(false);}} style={{fontSize:11,fontWeight:700,color:"#ef4444",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",borderRadius:50,padding:"4px 12px",cursor:"pointer"}}>Cancel Edit</button>
          )}
        </div>

        {(exp||editId)&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {/* Title + desc */}
            <input placeholder="Offer title e.g. Friday Night Special *" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} style={SI}/>
            <input placeholder="Short description e.g. 20% off all bookings on Fridays" value={f.desc} onChange={e=>setF(p=>({...p,desc:e.target.value}))} style={SI}/>

            {/* Discount type */}
            <div>
              <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:7}}>Discount Type</div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                {[["pct","% Off"],["fixed","MWK Off"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setF(p=>({...p,discType:v}))} style={{flex:1,padding:"9px",borderRadius:10,border:"1.5px solid",cursor:"pointer",fontSize:12,fontWeight:800,borderColor:f.discType===v?"#f97316":TH.border,background:f.discType===v?"rgba(249,115,22,.14)":TH.bgInput,color:f.discType===v?"#f97316":TH.textMid}}>{l}</button>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {f.discType==="fixed"&&<span style={{fontSize:13,fontWeight:700,color:TH.textMid,flexShrink:0}}>MWK</span>}
                <input type="number" min="1" placeholder={f.discType==="pct"?"e.g. 20":"e.g. 10000"} value={f.discVal} onChange={e=>setF(p=>({...p,discVal:e.target.value}))} style={{...SI,flex:1}}/>
                {f.discType==="pct"&&<span style={{fontSize:13,fontWeight:700,color:TH.textMid,flexShrink:0}}>% off</span>}
                {f.discType==="fixed"&&<span style={{fontSize:13,fontWeight:700,color:TH.textMid,flexShrink:0}}>off</span>}
              </div>
            </div>

            {/* Date type */}
            <div>
              <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:7}}>When does this apply?</div>
              <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
                {[["always","Every Day"],["weekday","Specific Day"],["date","Specific Date"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setF(p=>({...p,dateType:v,weekday:"",specificDate:""}))} style={{padding:"8px 14px",borderRadius:50,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,borderColor:f.dateType===v?"#a78bfa":TH.border,background:f.dateType===v?"rgba(167,139,250,.15)":TH.bgInput,color:f.dateType===v?"#a78bfa":TH.textMid}}>{l}</button>
                ))}
              </div>
              {f.dateType==="weekday"&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                  {DAYS_OF_WEEK.map(d=>(
                    <button key={d.v} onClick={()=>setF(p=>({...p,weekday:d.v}))} style={{padding:"6px 12px",borderRadius:50,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,borderColor:f.weekday===d.v?"#f97316":TH.border,background:f.weekday===d.v?"rgba(249,115,22,.15)":TH.bgInput,color:f.weekday===d.v?"#f97316":TH.textMid}}>{d.l.slice(0,3)}</button>
                  ))}
                </div>
              )}
              {f.dateType==="date"&&(
                <input type="date" value={f.specificDate} onChange={e=>setF(p=>({...p,specificDate:e.target.value}))} style={{...SI,marginBottom:10,cursor:"pointer"}}/>
              )}
            </div>

            {/* Time window */}
            <div>
              <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:7}}>Time Window (optional — leave blank for all day)</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
                <select value={f.timeFrom} onChange={e=>setF(p=>({...p,timeFrom:e.target.value}))} style={{...SI,cursor:"pointer"}}>
                  <option value="">Any start time</option>
                  {timeOpts.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{fontSize:12,color:TH.textMid,fontWeight:700}}>to</span>
                <select value={f.timeTo} onChange={e=>setF(p=>({...p,timeTo:e.target.value}))} style={{...SI,cursor:"pointer"}}>
                  <option value="">Any end time</option>
                  {timeOpts.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Active toggle */}
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 14px",background:TH.bgCard2,borderRadius:11}}>
              <input type="checkbox" checked={f.active} onChange={e=>setF(p=>({...p,active:e.target.checked}))} style={{width:16,height:16,accentColor:"#22c55e"}}/>
              <span style={{fontSize:12,fontWeight:700,color:f.active?"#22c55e":TH.textMid}}>{f.active?"Active — visible to customers":"Inactive — hidden from customers"}</span>
            </label>

            {/* Live preview */}
            {f.title&&f.discVal&&(
              <div style={{background:"linear-gradient(135deg,rgba(249,115,22,.1),rgba(249,115,22,.05))",border:"1px solid rgba(249,115,22,.3)",borderRadius:13,padding:"12px 14px"}}>
                <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:"#f97316",textTransform:"uppercase",marginBottom:6}}>Preview — what customers see</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:TH.text}}>{f.title}</div>
                    <div style={{fontSize:11,color:"#4a3020",marginTop:2}}>{f.desc||"No description"}</div>
                    <div style={{fontSize:10,color:"#f97316",marginTop:3,fontWeight:700}}>
                      {f.dateType==="weekday"&&f.weekday?DAYS_OF_WEEK.find(d=>d.v===f.weekday)?.l+"s":f.dateType==="date"&&f.specificDate?f.specificDate:"Every day"}
                      {f.timeFrom&&f.timeTo?" · "+f.timeFrom+"–"+f.timeTo:""}
                    </div>
                  </div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#f97316",textAlign:"right",lineHeight:1}}>
                    {f.discType==="pct"?f.discVal+"%":"MWK "+Number(f.discVal||0).toLocaleString()}<br/>
                    <span style={{fontSize:11,color:TH.textMid}}>OFF</span>
                  </div>
                </div>
              </div>
            )}

            {err&&<div style={{color:"#f87171",fontSize:12,fontWeight:700}}>{err}</div>}
            <button onClick={save} style={{padding:"12px",borderRadius:12,border:"none",background:editId?"linear-gradient(135deg,#06b6d4,#0369a1)":"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:13,fontWeight:800,cursor:"pointer",boxShadow:editId?"0 4px 16px rgba(6,182,212,.3)":"0 4px 16px rgba(34,197,94,.3)"}}>
              {editId?"Save Changes":"Create Offer"}
            </button>
          </div>
        )}

        {!exp&&!editId&&(
          <button onClick={()=>setExp(true)} style={{width:"100%",padding:"11px",borderRadius:11,border:"1.5px dashed #1a3050",background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Add New Special Offer</button>
        )}
      </div>

      {/* Offer list */}
      {promoOffers.length===0&&(
        <div style={{textAlign:"center",padding:"32px",color:TH.textTiny,fontSize:13}}>No special offers yet</div>
      )}
      {promoOffers.map((o,i)=>{
        const discLabel = o.discType==="pct" ? o.discVal+"% off" : "MWK "+Number(o.discVal).toLocaleString()+" off";
        const schedule  = offerSchedule(o);
        return(
          <div key={o.id} style={{background:TH.bgCard,border:"1px solid "+(o.active?"rgba(249,115,22,.25)":TH.border),borderRadius:16,padding:"14px 16px",opacity:o.active?1:.55,animation:"fadeUp .25s ease "+(i*.04)+"s both"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
              <div style={{width:42,height:42,borderRadius:12,background:o.active?"rgba(249,115,22,.15)":TH.bgCard3,border:"1.5px solid "+(o.active?"rgba(249,115,22,.3)":TH.border),display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏷</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:800,color:TH.text}}>{o.title}</span>
                  <span style={{fontSize:9,fontWeight:800,color:o.active?"#22c55e":"#ef4444",background:o.active?"rgba(34,197,94,.12)":"rgba(239,68,68,.1)",border:"1px solid "+(o.active?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"),borderRadius:50,padding:"2px 7px"}}>{o.active?"LIVE":"OFF"}</span>
                  <span style={{fontSize:12,fontWeight:800,color:"#f97316"}}>{discLabel}</span>
                </div>
                {o.desc&&<div style={{fontSize:11,color:TH.textMid,marginBottom:4}}>{o.desc}</div>}
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {o.dateType==="weekday"&&<span style={{fontSize:9,fontWeight:700,color:TH.purple,background:"rgba(167,139,250,.12)",border:"1px solid rgba(167,139,250,.3)",borderRadius:50,padding:"2px 8px"}}>📅 {DAYS_OF_WEEK.find(d=>d.v===o.weekday)?.l}s</span>}
                  {o.dateType==="date"&&<span style={{fontSize:9,fontWeight:700,color:TH.purple,background:"rgba(167,139,250,.12)",border:"1px solid rgba(167,139,250,.3)",borderRadius:50,padding:"2px 8px"}}>📅 {o.specificDate}</span>}
                  {o.dateType==="always"&&<span style={{fontSize:9,fontWeight:700,color:TH.textMid,background:TH.bgCard3,border:"1px solid "+TH.border,borderRadius:50,padding:"2px 8px"}}>Every day</span>}
                  {(o.timeFrom||o.timeTo)&&<span style={{fontSize:9,fontWeight:700,color:"#06b6d4",background:"rgba(6,182,212,.12)",border:"1px solid rgba(6,182,212,.3)",borderRadius:50,padding:"2px 8px"}}>⏰ {o.timeFrom||"Open"}–{o.timeTo||"Close"}</span>}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>startEdit(o)} style={{flex:1,padding:"7px",borderRadius:9,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:11,fontWeight:700,cursor:"pointer"}}>✏ Edit</button>
              <button onClick={()=>toggleActive(o.id)} style={{flex:1,padding:"7px",borderRadius:9,border:"1.5px solid "+(o.active?"rgba(239,68,68,.3)":"rgba(34,197,94,.3)"),background:o.active?"rgba(239,68,68,.07)":"rgba(34,197,94,.07)",color:o.active?"#ef4444":"#22c55e",fontSize:11,fontWeight:700,cursor:"pointer"}}>{o.active?"Pause":"Activate"}</button>
              <button onClick={()=>remove(o.id)} style={{padding:"7px 12px",borderRadius:9,border:"1.5px solid rgba(239,68,68,.25)",background:"transparent",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>🗑</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// AMERICANO TOURNAMENT ENGINE
// ═══════════════════════════════════════════════════════════════

function genCode() {
  return "ACE-" + Math.random().toString(36).slice(2,5).toUpperCase() + "-" + Math.random().toString(36).slice(2,5).toUpperCase();
}

// Build an Americano schedule: everyone partners everyone (as much as possible)
// 12 players, 2 courts = 2 games/round (8 playing, 4 resting)
// Returns array of rounds, each round = array of {court, t1:[p1,p2], t2:[p3,p4]}
function buildSchedule(playerIds, numCourts) {
  const n = playerIds.length;
  const rounds = [];
  const partnerCount = {};
  playerIds.forEach(p=>{ partnerCount[p]={}; playerIds.forEach(q=>{ partnerCount[p][q]=0; }); });

  const COURTS = numCourts||2;
  const numRounds = Math.min(11, Math.ceil(n*(n-1)/(COURTS*2))); // enough for everyone to play

  for(let r=0;r<numRounds;r++){
    // Build a round: pick players, pair them minimising repeat partnerships
    const available = [...playerIds];
    // Shuffle
    for(let i=available.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[available[i],available[j]]=[available[j],available[i]];}
    // Pick best pairings
    const used = new Set();
    const games = [];
    for(let c=0;c<COURTS&&available.length-used.size>=4;c++){
      // Pick 4 players not yet used this round — prefer least-partnered pairs
      const pool=available.filter(p=>!used.has(p));
      if(pool.length<4) break;
      // Find best pair from pool (least times partnered)
      let bestScore=Infinity, bestPair=[pool[0],pool[1]];
      for(let i=0;i<pool.length;i++) for(let j=i+1;j<pool.length;j++){
        const s=(partnerCount[pool[i]][pool[j]]||0);
        if(s<bestScore){bestScore=s;bestPair=[pool[i],pool[j]];}
      }
      const [p1,p2]=bestPair;
      used.add(p1); used.add(p2);
      // Pick opponent pair
      const pool2=pool.filter(p=>!used.has(p));
      let bestScore2=Infinity, bestPair2=[pool2[0],pool2[1]];
      for(let i=0;i<pool2.length;i++) for(let j=i+1;j<pool2.length;j++){
        const s=(partnerCount[pool2[i]][pool2[j]]||0);
        if(s<bestScore2){bestScore2=s;bestPair2=[pool2[i],pool2[j]];}
      }
      const [p3,p4]=bestPair2;
      used.add(p3); used.add(p4);
      games.push({court:c+1, t1:[p1,p2], t2:[p3,p4], score1:null, score2:null});
      // Record partnerships
      partnerCount[p1][p2]=(partnerCount[p1][p2]||0)+1;
      partnerCount[p2][p1]=(partnerCount[p2][p1]||0)+1;
      partnerCount[p3][p4]=(partnerCount[p3][p4]||0)+1;
      partnerCount[p4][p3]=(partnerCount[p4][p3]||0)+1;
    }
    if(games.length>0) rounds.push({id:"r"+r, games, resting:available.filter(p=>!used.has(p))});
  }
  return rounds;
}

function calcStandings(players, rounds) {
  const stats = {};
  players.forEach(p=>{ stats[p]={pts:0,wins:0,played:0,pointsFor:0,pointsAgainst:0}; });
  (rounds||[]).forEach(round=>{
    (round.games||[]).forEach(g=>{
      if(g.score1==null||g.score2==null) return;
      const s1=Number(g.score1), s2=Number(g.score2);
      [...g.t1].forEach(p=>{
        if(!stats[p]) stats[p]={pts:0,wins:0,played:0,pointsFor:0,pointsAgainst:0};
        stats[p].played++;
        stats[p].pointsFor+=s1;
        stats[p].pointsAgainst+=s2;
        if(s1>s2){stats[p].wins++;stats[p].pts+=3;}
        else if(s1===s2){stats[p].pts+=1;}
      });
      [...g.t2].forEach(p=>{
        if(!stats[p]) stats[p]={pts:0,wins:0,played:0,pointsFor:0,pointsAgainst:0};
        stats[p].played++;
        stats[p].pointsFor+=s2;
        stats[p].pointsAgainst+=s1;
        if(s2>s1){stats[p].wins++;stats[p].pts+=3;}
        else if(s1===s2){stats[p].pts+=1;}
      });
    });
  });
  return stats;
}

// ═══════════════════════════════════════════════════════════════
// PLAY SCREEN — Friends, Scores, Americano
// ═══════════════════════════════════════════════════════════════
function PlayScreen({TH, member, members, friends, bookings, gameScores, tournaments, onAddScore, onCreateTournament, onUpdateTournament, onRegister, onLogin, onAddPoints, playerPool, openGames, onJoinPool, onLeavePool, onPostGame, onJoinGame, onCloseGame}) {
  const [tab, setTab] = useState("social"); // social | scores | tournament
  const [selectedT, setSelectedT] = useState(null); // viewing a tournament

  if(selectedT) {
    const t = tournaments.find(x=>x.id===selectedT);
    if(t) return <TournamentView TH={TH} tournament={t} members={members} member={member}
      onUpdate={p=>onUpdateTournament(t.id,p)} onBack={()=>setSelectedT(null)} onAddPoints={onAddPoints}/>;
  }

  const activeTournaments = tournaments.filter(t=>t.status!=="complete");
  const hasNewTournament  = activeTournaments.length>0;

  return(
    <div style={{minHeight:"100vh",paddingBottom:90,background:TH.bg}}>
      <div style={{background:TH.headerBg,padding:"50px 18px 0"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:TH.text}}>Play</div>
        <div style={{fontSize:12,color:TH.textMid,marginTop:2}}>Social · Scores · Americano</div>
        <div style={{display:"flex",gap:0,marginTop:14,borderBottom:"1px solid "+TH.border,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["social","👥 Social"],["scores","🎯 Scores"],["lfp","🙋 Need Players"],["tournament","🏓 Americano"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flexShrink:0,padding:"10px 12px",border:"none",background:"transparent",cursor:"pointer",fontSize:11,fontWeight:700,color:tab===id?TH.text:TH.textMid,borderBottom:tab===id?"2px solid #f97316":"2px solid transparent",position:"relative",whiteSpace:"nowrap"}}>
              {lbl}
              {id==="tournament"&&hasNewTournament&&<span style={{position:"absolute",top:6,right:4,width:7,height:7,borderRadius:"50%",background:"#f97316",animation:"pulse 2s infinite"}}/>}
            </button>
          ))}
        </div>
      </div>

      {/* ── SOCIAL ── */}
      {tab==="social"&&<SocialTab TH={TH} member={member} members={members} friends={friends} gameScores={gameScores} bookings={bookings} onRegister={onRegister} onLogin={onLogin}/>}

      {/* ── SCORES ── */}
      {tab==="scores"&&<ScoresTab TH={TH} member={member} members={members} gameScores={gameScores} onAddScore={onAddScore} onRegister={onRegister} onLogin={onLogin}/>}

      {/* ── LOOKING FOR PLAYERS ── */}
      {tab==="lfp"&&<LFPTab TH={TH} member={member} members={members} playerPool={playerPool||[]} openGames={openGames||[]} onJoinPool={onJoinPool} onLeavePool={onLeavePool} onPostGame={onPostGame} onJoinGame={onJoinGame} onCloseGame={onCloseGame} onRegister={onRegister} onLogin={onLogin}/>}

      {/* ── AMERICANO ── */}
      {tab==="tournament"&&<TournamentListTab TH={TH} member={member} members={members} tournaments={tournaments} bookings={bookings} onSelect={setSelectedT} onCreateTournament={onCreateTournament} onUpdateTournament={onUpdateTournament} onRegister={onRegister} onLogin={onLogin}/>}
    </div>
  );
}

// ── LOOKING FOR PLAYERS TAB ───────────────────────────────────
function LFPTab({TH, member, members, playerPool, openGames, onJoinPool, onLeavePool, onPostGame, onJoinGame, onCloseGame, onRegister, onLogin}) {
  const [activeForm, setActiveForm] = useState(null); // "pool" | "game"
  const [poolForm,  setPoolForm]  = useState({note:"",date:"",slots:[]});
  const [gameForm,  setGameForm]  = useState({note:"",date:"",time:"",court:"1",spotsNeeded:"1"});
  const [err,       setErr]       = useState("");
  const [done,      setDone]      = useState("");

  const SLOT_OPTIONS = ["Morning (6–11)","Afternoon (12–16)","Evening (17–22)","Any time"];
  const TIME_OPTIONS = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];

  const myPoolEntry  = playerPool.find(p=>p.memberId===member?.id);
  const myOpenGame   = openGames.find(g=>g.memberId===member?.id&&g.status!=="closed");

  function joinPool() {
    if(!poolForm.date){setErr("Select a date");return;}
    if(poolForm.slots.length===0){setErr("Select at least one time slot");return;}
    if(myPoolEntry) { setErr("You're already in the pool — remove yourself first"); return; }
    onJoinPool({
      id:"lp"+Date.now(), memberId:member.id, name:member.name, avatar:member.avatar,
      note:poolForm.note||"Available to play!", date:poolForm.date, slots:poolForm.slots,
      joinedAt:new Date().toISOString()
    });
    setPoolForm({note:"",date:"",slots:[]}); setActiveForm(null); setDone("pool");
    setTimeout(()=>setDone(""),3000);
  }

  function postGame() {
    if(!gameForm.date||!gameForm.time){setErr("Select date and time");return;}
    if(myOpenGame) { setErr("You already have an open game request"); return; }
    onPostGame({
      id:"og"+Date.now(), memberId:member.id, name:member.name, avatar:member.avatar,
      note:gameForm.note||"Looking for players!", date:gameForm.date, time:gameForm.time,
      court:gameForm.court, spotsNeeded:Number(gameForm.spotsNeeded)||1,
      players:[], status:"open", postedAt:new Date().toISOString()
    });
    setGameForm({note:"",date:"",time:"",court:"1",spotsNeeded:"1"}); setActiveForm(null); setDone("game");
    setTimeout(()=>setDone(""),3000);
  }

  function joinGame(gid) {
    const g = openGames.find(x=>x.id===gid); if(!g) return;
    if((g.players||[]).some(p=>p.id===member.id)){return;}
    onJoinGame(gid);
  }

  const SI={background:TH.bgCard,border:"1.5px solid "+TH.border,borderRadius:11,padding:"9px 12px",color:TH.text,fontSize:13,outline:"none",cursor:"pointer",width:"100%"};
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const minDate = tomorrow.toISOString().slice(0,10);
  const maxDate = new Date(Date.now()+14*86400000).toISOString().slice(0,10);

  if(!member) return(
    <div style={{padding:"40px 20px",textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:14}}>🙋</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:TH.text,marginBottom:8}}>Members Only</div>
      <div style={{fontSize:13,color:TH.textMid,marginBottom:20}}>Sign in to join the player pool or post open game requests.</div>
      <button onClick={onRegister} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer"}}>Create Account →</button>
    </div>
  );

  return(
    <div style={{padding:"16px"}} className="fu">

      {/* Success toasts */}
      {done==="pool"&&<div style={{padding:"11px 14px",background:TH.slotOff,border:"1px solid rgba(34,197,94,.3)",borderRadius:12,marginBottom:12,fontSize:12,fontWeight:700,color:"#22c55e",textAlign:"center"}}>✓ You're in the player pool! Others can now invite you.</div>}
      {done==="game"&&<div style={{padding:"11px 14px",background:"rgba(6,182,212,.1)",border:"1px solid rgba(6,182,212,.3)",borderRadius:12,marginBottom:12,fontSize:12,fontWeight:700,color:"#06b6d4",textAlign:"center"}}>✓ Game request posted! Players can now join you.</div>}

      {/* Two action cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {/* Join the pool */}
        <button onClick={()=>{setActiveForm(activeForm==="pool"?null:"pool");setErr("");}}
          style={{padding:"14px 10px",borderRadius:16,border:"1.5px solid",cursor:"pointer",textAlign:"center",
            borderColor:myPoolEntry?"#22c55e":activeForm==="pool"?"#f97316":TH.border,
            background:myPoolEntry?"rgba(34,197,94,.08)":activeForm==="pool"?"rgba(249,115,22,.1)":TH.bgCard}}>
          <div style={{fontSize:24,marginBottom:6}}>🙋</div>
          <div style={{fontSize:11,fontWeight:800,color:myPoolEntry?"#22c55e":activeForm==="pool"?"#f97316":TH.text,marginBottom:3}}>I Want to Play</div>
          <div style={{fontSize:9,color:TH.textMid,lineHeight:1.4}}>{myPoolEntry?"You're in the pool":"Add yourself — others can invite you"}</div>
        </button>
        {/* Post open game */}
        <button onClick={()=>{setActiveForm(activeForm==="game"?null:"game");setErr("");}}
          style={{padding:"14px 10px",borderRadius:16,border:"1.5px solid",cursor:"pointer",textAlign:"center",
            borderColor:myOpenGame?"#06b6d4":activeForm==="game"?"#f97316":TH.border,
            background:myOpenGame?"rgba(6,182,212,.08)":activeForm==="game"?"rgba(249,115,22,.1)":TH.bgCard}}>
          <div style={{fontSize:24,marginBottom:6}}>📢</div>
          <div style={{fontSize:11,fontWeight:800,color:myOpenGame?"#06b6d4":activeForm==="game"?"#f97316":TH.text,marginBottom:3}}>Need Players</div>
          <div style={{fontSize:9,color:TH.textMid,lineHeight:1.4}}>{myOpenGame?"Game posted":"I have a slot — need players"}</div>
        </button>
      </div>

      {/* Pool form */}
      {activeForm==="pool"&&!myPoolEntry&&(
        <div style={{background:TH.bgCard,border:"1px solid rgba(34,197,94,.25)",borderRadius:16,padding:"16px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:"#22c55e",marginBottom:12}}>🙋 Add yourself to the player pool</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input placeholder="Note e.g. Intermediate player, love baseline rallies" value={poolForm.note} onChange={e=>setPoolForm(p=>({...p,note:e.target.value}))} style={SI}/>
            <div>
              <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Available date *</div>
              <input type="date" min={minDate} max={maxDate} value={poolForm.date} onChange={e=>setPoolForm(p=>({...p,date:e.target.value}))} style={SI}/>
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Preferred time slots *</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {SLOT_OPTIONS.map(s=>(
                  <button key={s} type="button" onClick={()=>setPoolForm(p=>({...p,slots:p.slots.includes(s)?p.slots.filter(x=>x!==s):[...p.slots,s]}))}
                    style={{padding:"6px 12px",borderRadius:50,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,
                      borderColor:poolForm.slots.includes(s)?"#22c55e":TH.border,
                      background:poolForm.slots.includes(s)?"rgba(34,197,94,.15)":"transparent",
                      color:poolForm.slots.includes(s)?"#22c55e":TH.textMid}}>{s}</button>
                ))}
              </div>
            </div>
            {err&&<div style={{color:"#f87171",fontSize:12,fontWeight:700}}>{err}</div>}
            <button onClick={joinPool} style={{padding:"11px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:13,fontWeight:800,cursor:"pointer"}}>Add Me to Pool</button>
          </div>
        </div>
      )}

      {/* Remove from pool */}
      {myPoolEntry&&(
        <div style={{background:TH.slotOff,border:"1px solid rgba(34,197,94,.25)",borderRadius:14,padding:"12px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:800,color:"#22c55e",marginBottom:2}}>You're in the player pool</div>
            <div style={{fontSize:10,color:TH.textMid}}>{myPoolEntry.date} · {myPoolEntry.slots.join(", ")}</div>
          </div>
          <button onClick={()=>onLeavePool(myPoolEntry.id)} style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.08)",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>Remove Me</button>
        </div>
      )}

      {/* Open game form */}
      {activeForm==="game"&&!myOpenGame&&(
        <div style={{background:TH.bgCard,border:"1px solid rgba(6,182,212,.25)",borderRadius:16,padding:"16px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:"#06b6d4",marginBottom:12}}>📢 Post a game — looking for players</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input placeholder="Note e.g. Court 1 booked, need 2 more players" value={gameForm.note} onChange={e=>setGameForm(p=>({...p,note:e.target.value}))} style={SI}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>
                <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Date *</div>
                <input type="date" min={minDate} max={maxDate} value={gameForm.date} onChange={e=>setGameForm(p=>({...p,date:e.target.value}))} style={SI}/>
              </div>
              <div>
                <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Time *</div>
                <select value={gameForm.time} onChange={e=>setGameForm(p=>({...p,time:e.target.value}))} style={SI}>
                  <option value="">Select</option>
                  {TIME_OPTIONS.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>
                <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Court</div>
                <select value={gameForm.court} onChange={e=>setGameForm(p=>({...p,court:e.target.value}))} style={SI}>
                  <option value="1">Court 1</option>
                  <option value="2">Court 2</option>
                </select>
              </div>
              <div>
                <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Spots Needed</div>
                <select value={gameForm.spotsNeeded} onChange={e=>setGameForm(p=>({...p,spotsNeeded:e.target.value}))} style={SI}>
                  {["1","2","3"].map(n=><option key={n} value={n}>{n} player{n!=="1"?"s":""}</option>)}
                </select>
              </div>
            </div>
            {err&&<div style={{color:"#f87171",fontSize:12,fontWeight:700}}>{err}</div>}
            <button onClick={postGame} style={{padding:"11px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#06b6d4,#0369a1)",color:TH.text,fontSize:13,fontWeight:800,cursor:"pointer"}}>Post Game Request</button>
          </div>
        </div>
      )}

      {/* My open game */}
      {myOpenGame&&(
        <div style={{background:"rgba(6,182,212,.07)",border:"1px solid rgba(6,182,212,.25)",borderRadius:14,padding:"12px 14px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:800,color:"#06b6d4"}}>Your Open Game Request</div>
            <button onClick={()=>onCloseGame(myOpenGame.id)} style={{padding:"4px 10px",borderRadius:7,border:"1.5px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.08)",color:"#ef4444",fontSize:10,fontWeight:700,cursor:"pointer"}}>Close</button>
          </div>
          <div style={{fontSize:11,color:TH.textMid,marginBottom:6}}>{myOpenGame.date} · {myOpenGame.time} · Court {myOpenGame.court} · {myOpenGame.spotsNeeded} spot{myOpenGame.spotsNeeded!==1?"s":""} needed</div>
          <div style={{fontSize:11,color:TH.textMid}}>{(myOpenGame.players||[]).length} player{(myOpenGame.players||[]).length!==1?"s":""} joined: {(myOpenGame.players||[]).map(p=>p.name?.split(" ")[0]).join(", ")||"None yet"}</div>
        </div>
      )}

      {/* ── OPEN GAME REQUESTS ── */}
      <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:"#06b6d4",textTransform:"uppercase",marginBottom:10,marginTop:8}}>
        📢 Open Game Requests ({openGames.filter(g=>g.status!=="closed"&&g.memberId!==member.id).length})
      </div>
      {openGames.filter(g=>g.status!=="closed"&&g.memberId!==member.id).length===0?(
        <div style={{textAlign:"center",padding:"20px",background:TH.bgCard,borderRadius:14,fontSize:12,color:TH.textFaint,marginBottom:16}}>No open game requests right now</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {openGames.filter(g=>g.status!=="closed"&&g.memberId!==member.id).map(g=>{
            const alreadyJoined=(g.players||[]).some(p=>p.id===member.id);
            const spotsLeft=g.spotsNeeded-(g.players||[]).length;
            const m=members.find(x=>x.id===g.memberId);
            const t2=m?getTier(m.points):TIERS[0];
            return(
              <div key={g.id} style={{background:TH.bgCard,border:"1px solid rgba(6,182,212,.2)",borderRadius:14,padding:"13px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:t2.color+"30",border:"2px solid "+t2.color+"60",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:t2.color,flexShrink:0}}>{g.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:TH.text}}>{g.name}</div>
                    <div style={{fontSize:10,color:TH.textMid}}>{g.date} · {g.time} · Court {g.court}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:12,fontWeight:800,color:spotsLeft>0?"#06b6d4":TH.textMid}}>{spotsLeft} spot{spotsLeft!==1?"s":""} left</div>
                  </div>
                </div>
                {g.note&&<div style={{fontSize:11,color:TH.textMid,marginBottom:10,fontStyle:"italic"}}>"{g.note}"</div>}
                {(g.players||[]).length>0&&<div style={{fontSize:10,color:TH.textMid,marginBottom:8}}>Joined: {(g.players||[]).map(p=>p.name?.split(" ")[0]).join(", ")}</div>}
                <button onClick={()=>!alreadyJoined&&spotsLeft>0&&joinGame(g.id)}
                  disabled={alreadyJoined||spotsLeft<=0}
                  style={{width:"100%",padding:"9px",borderRadius:10,border:"none",cursor:alreadyJoined||spotsLeft<=0?"default":"pointer",fontWeight:800,fontSize:12,
                    background:alreadyJoined?"rgba(34,197,94,.15)":spotsLeft<=0?TH.bgCard2:"linear-gradient(135deg,#06b6d4,#0369a1)",
                    color:alreadyJoined?"#22c55e":spotsLeft<=0?TH.textFaint:"#fff",
                    boxShadow:!alreadyJoined&&spotsLeft>0?"0 3px 12px rgba(6,182,212,.3)":"none"}}>
                  {alreadyJoined?"✓ You're In":spotsLeft<=0?"Full":"Join This Game"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PLAYER POOL ── */}
      <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:"#22c55e",textTransform:"uppercase",marginBottom:10}}>
        🙋 Available to Play ({playerPool.filter(p=>p.memberId!==member.id).length})
      </div>
      {playerPool.filter(p=>p.memberId!==member.id).length===0?(
        <div style={{textAlign:"center",padding:"20px",background:TH.bgCard,borderRadius:14,fontSize:12,color:TH.textFaint}}>No players in the pool right now</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {playerPool.filter(p=>p.memberId!==member.id).map(p=>{
            const m=members.find(x=>x.id===p.memberId);
            const t2=m?getTier(m.points):TIERS[0];
            return(
              <div key={p.id} style={{background:TH.bgCard,border:"1px solid rgba(34,197,94,.2)",borderRadius:14,padding:"13px 14px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:t2.color+"30",border:"2px solid "+t2.color+"60",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:t2.color,flexShrink:0,overflow:"hidden"}}>{m?.photoUrl?<img src={m.photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:p.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:800,color:TH.text}}>{p.name}</div>
                  <div style={{fontSize:10,color:TH.textMid,marginBottom:2}}>{p.date} · {p.slots.join(", ")}</div>
                  {p.note&&<div style={{fontSize:10,color:TH.textMid,fontStyle:"italic"}}>"{p.note}"</div>}
                </div>
                {m&&<div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:9,fontWeight:800,color:t2.color}}>{t2.icon} {t2.name}</div>
                  <div style={{fontSize:8,color:TH.textFaint,marginTop:1}}>{m.bookings} sessions</div>
                </div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SOCIAL TAB ─────────────────────────────────────────────────
function SocialTab({TH, member, members, friends, gameScores, bookings, onRegister, onLogin}) {
  if(!member) return(
    <div style={{padding:"40px 20px",textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:14}}>👥</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:TH.text,marginBottom:8}}>Members Only</div>
      <div style={{fontSize:13,color:TH.textMid,marginBottom:20}}>Sign in to see friends activity, challenge players, and track your social game.</div>
      <button onClick={onRegister} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer"}}>Join to See Friends Activity →</button>
    </div>
  );

  const friendMembers = members.filter(m=>friends.includes(m.id));
  const friendScores  = gameScores.filter(s=>s.players.some(pid=>friends.includes(pid)||pid===member.id)).slice(0,10);

  return(
    <div style={{padding:"16px"}} className="fu">
      {/* Friends quick stats */}
      <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:10}}>Friends Leaderboard</div>
      {friendMembers.length===0?(
        <div style={{textAlign:"center",padding:"24px",background:TH.bgCard,borderRadius:16,marginBottom:14}}>
          <div style={{fontSize:13,color:TH.textFaint}}>No friends added yet — go to your profile to add friends</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
          {[member,...friendMembers].sort((a,b)=>b.points-a.points).map((m,i)=>{
            const t=getTier(m.points); const isMe=m.id===member.id;
            const mScores=gameScores.filter(s=>s.players.includes(m.id));
            const wins=mScores.filter(s=>(s.winners||[]).includes(m.id)).length;
            return(
              <div key={m.id} style={{background:isMe?"rgba(249,115,22,.08)":TH.bgCard,border:"1px solid "+(isMe?"#f9731640":TH.border),borderRadius:13,padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:24,fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:i<3?"#f97316":TH.textFaint,flexShrink:0}}>{i+1}</div>
                <div style={{width:36,height:36,borderRadius:"50%",background:t.color+"30",border:"2px solid "+t.color+"60",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:t.color,flexShrink:0,overflow:"hidden"}}>{m.photoUrl?<img src={m.photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:m.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:800,color:TH.text}}>{m.name}{isMe?" (You)":""}</div>
                  <div style={{fontSize:10,color:TH.textMid}}>{t.icon} {t.name} · {wins} wins</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:t.color,lineHeight:1}}>{fmt(m.points)}</div>
                  <div style={{fontSize:8,color:TH.textFaint,fontWeight:700}}>PTS</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity feed */}
      <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:10}}>Recent Activity</div>
      {friendScores.length===0?(
        <div style={{textAlign:"center",padding:"24px",background:TH.bgCard,borderRadius:16,fontSize:12,color:TH.textFaint}}>No recent games yet — play a match and log the score!</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {friendScores.map(s=>{
            const [p1,p2]=s.t1||[];const [p3,p4]=s.t2||[];
            const m1=members.find(m=>m.id===p1), m2=members.find(m=>m.id===p2);
            const m3=members.find(m=>m.id===p3), m4=members.find(m=>m.id===p4);
            const t1wins = s.score1>s.score2;
            return(
              <div key={s.id} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:14,padding:"13px 14px"}}>
                <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:8}}>
                  {s.date} · {s.time||""}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:800,color:t1wins?"#22c55e":TH.textMid}}>{m1?.name.split(" ")[0]||"?"} & {m2?.name.split(" ")[0]||"?"}</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:t1wins?"#22c55e":TH.text,lineHeight:1}}>{s.score1}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:800,color:TH.textFaint}}>vs</div>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:800,color:!t1wins&&s.score2!==s.score1?"#22c55e":TH.textMid}}>{m3?.name.split(" ")[0]||"?"} & {m4?.name.split(" ")[0]||"?"}</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:!t1wins&&s.score2!==s.score1?"#22c55e":TH.text,lineHeight:1}}>{s.score2}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SCORES TAB ─────────────────────────────────────────────────
function ScoresTab({TH, member, members, gameScores, onAddScore, onRegister, onLogin}) {
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({t1p1:"",t1p2:"",t2p1:"",t2p2:"",score1:"",score2:""});
  const [err, setErr] = useState("");

  if(!member) return(
    <div style={{padding:"40px 20px",textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:14}}>🎯</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:TH.text,marginBottom:8}}>Members Only</div>
      <div style={{fontSize:13,color:TH.textMid,marginBottom:20}}>Sign in to log match scores and track your win record.</div>
      <button onClick={onRegister} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer",marginBottom:10}}>Create Account →</button>
      <button onClick={onLogin||onRegister} style={{width:"100%",padding:"12px",borderRadius:14,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>Sign In Instead</button>
    </div>
  );

  const myScores = gameScores.filter(s=>s.players.includes(member.id));
  const myWins   = myScores.filter(s=>(s.winners||[]).includes(member.id)).length;
  const myPtsFor = myScores.reduce((a,s)=>{
    if((s.t1||[]).includes(member.id)) return a+Number(s.score1||0);
    if((s.t2||[]).includes(member.id)) return a+Number(s.score2||0);
    return a;
  },0);

  function submitScore() {
    if(!f.t1p1||!f.t1p2||!f.t2p1||!f.t2p2){setErr("Select all 4 players");return;}
    if(f.score1===""||f.score2===""){setErr("Enter both scores");return;}
    const s1=Number(f.score1),s2=Number(f.score2);
    if(isNaN(s1)||isNaN(s2)||s1<0||s2<0){setErr("Scores must be numbers");return;}
    const winners = s1>s2?[f.t1p1,f.t1p2]:s2>s1?[f.t2p1,f.t2p2]:[];
    onAddScore({
      id:"gs"+Date.now(), t1:[f.t1p1,f.t1p2], t2:[f.t2p1,f.t2p2],
      players:[f.t1p1,f.t1p2,f.t2p1,f.t2p2],
      score1:s1, score2:s2, winners,
      date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
      time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),
      loggedBy:member.id,
    });
    setShowForm(false); setF({t1p1:"",t1p2:"",t2p1:"",t2p2:"",score1:"",score2:""}); setErr("");
  }

  const SI={background:TH.bgCard,border:"1.5px solid "+TH.border,borderRadius:11,padding:"9px 12px",color:TH.text,fontSize:13,width:"100%",outline:"none",cursor:"pointer"};

  return(
    <div style={{padding:"16px"}} className="fu">
      {/* My stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:16}}>
        {[{l:"Games",v:myScores.length,c:"#f97316"},{l:"Wins",v:myWins,c:"#22c55e"},{l:"Points For",v:myPtsFor,c:"#06b6d4"}].map(s=>(
          <div key={s.l} style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:13,padding:"12px 10px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:9,color:TH.textFaint,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Log score button */}
      {!showForm&&(
        <button onClick={()=>setShowForm(true)} style={{width:"100%",padding:"13px",borderRadius:13,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer",marginBottom:16,boxShadow:"0 4px 20px #f9731440"}}>
          + Log a Match Score
        </button>
      )}

      {/* Score form */}
      {showForm&&(
        <div style={{background:TH.bgCard,border:"1px solid rgba(249,115,22,.3)",borderRadius:18,padding:"16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:"#f97316"}}>Log Match Score</div>
            <button onClick={()=>{setShowForm(false);setErr("");}} style={{background:"transparent",border:"none",color:TH.textMid,cursor:"pointer",fontSize:13}}>✕</button>
          </div>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:"#f97316",textTransform:"uppercase",marginBottom:8}}>Team 1</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <select value={f.t1p1} onChange={e=>setF(p=>({...p,t1p1:e.target.value}))} style={SI}>
              <option value="">Player 1</option>
              {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={f.t1p2} onChange={e=>setF(p=>({...p,t1p2:e.target.value}))} style={SI}>
              <option value="">Player 2</option>
              {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:"#06b6d4",textTransform:"uppercase",marginBottom:8}}>Team 2</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <select value={f.t2p1} onChange={e=>setF(p=>({...p,t2p1:e.target.value}))} style={SI}>
              <option value="">Player 3</option>
              {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={f.t2p2} onChange={e=>setF(p=>({...p,t2p2:e.target.value}))} style={SI}>
              <option value="">Player 4</option>
              {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:8}}>Scores (first to 21)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:12}}>
            <input type="number" min="0" max="21" placeholder="Team 1" value={f.score1} onChange={e=>setF(p=>({...p,score1:e.target.value}))}
              style={{...SI,cursor:"text",textAlign:"center",fontSize:20,fontWeight:900,fontFamily:"'Bebas Neue',sans-serif"}}/>
            <span style={{fontWeight:900,color:TH.textFaint,textAlign:"center"}}>–</span>
            <input type="number" min="0" max="21" placeholder="Team 2" value={f.score2} onChange={e=>setF(p=>({...p,score2:e.target.value}))}
              style={{...SI,cursor:"text",textAlign:"center",fontSize:20,fontWeight:900,fontFamily:"'Bebas Neue',sans-serif"}}/>
          </div>
          {err&&<div style={{color:"#f87171",fontSize:12,marginBottom:10,fontWeight:700}}>{err}</div>}
          <button onClick={submitScore} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:13,fontWeight:900,cursor:"pointer"}}>Save Score</button>
        </div>
      )}

      {/* Score history */}
      <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:10}}>Recent Games</div>
      {myScores.length===0&&<div style={{textAlign:"center",padding:"30px",background:TH.bgCard,borderRadius:16,fontSize:12,color:TH.textFaint}}>No games logged yet</div>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {myScores.slice(0,20).map(s=>{
          const [p1,p2]=s.t1||[]; const [p3,p4]=s.t2||[];
          const m1=members.find(m=>m.id===p1), m2=members.find(m=>m.id===p2);
          const m3=members.find(m=>m.id===p3), m4=members.find(m=>m.id===p4);
          const iWon=(s.winners||[]).includes(member.id);
          const t1wins=s.score1>s.score2;
          return(
            <div key={s.id} style={{background:TH.bgCard,border:"1px solid "+(iWon?"rgba(34,197,94,.25)":TH.border),borderRadius:14,padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:9,fontWeight:800,color:TH.textFaint}}>{s.date}</span>
                <span style={{fontSize:9,fontWeight:800,color:iWon?"#22c55e":TH.textMid,background:iWon?"rgba(34,197,94,.12)":TH.bgCard3,border:"1px solid "+(iWon?"rgba(34,197,94,.3)":TH.border),borderRadius:50,padding:"1px 7px"}}>{iWon?"WIN":"LOSS"}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:700,color:t1wins?"#22c55e":TH.textMid}}>{m1?.name.split(" ")[0]||"?"} & {m2?.name.split(" ")[0]||"?"}</div>
                </div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:TH.text,letterSpacing:2}}>{s.score1}–{s.score2}</div>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:700,color:!t1wins&&s.score2!==s.score1?"#22c55e":TH.textMid}}>{m3?.name.split(" ")[0]||"?"} & {m4?.name.split(" ")[0]||"?"}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TOURNAMENT LIST TAB ────────────────────────────────────────
function TournamentListTab({TH, member, members, tournaments, onSelect, onCreateTournament, onUpdateTournament, onRegister, onLogin, bookings}) {
  const [creating, setCreating] = useState(false);
  const [f, setF]   = useState({name:"", courts:"2", date:""});
  // 12 slots — slot 0 is always the creator (pre-filled, locked)
  const [slots, setSlots] = useState(Array(12).fill(""));
  const [err,   setErr]   = useState("");

  if(!member) return(
    <div style={{padding:"40px 20px",textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:14}}>🏓</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:TH.text,marginBottom:8}}>Members Only</div>
      <div style={{fontSize:13,color:TH.textMid,marginBottom:20}}>Sign in to create or join Americano tournaments.</div>
      <button onClick={onRegister} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer",marginBottom:10}}>Create Account →</button>
      <button onClick={onLogin||onRegister} style={{width:"100%",padding:"12px",borderRadius:14,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer"}}>Sign In Instead</button>
    </div>
  );

  // Must have a CONFIRMED booking at ACE Padel to host a tournament
  const hasBooking = (bookings||[]).some(b=>b.memberId===member.id && b.status==="confirmed");

  // Count filled slots (slot 0 = creator, always filled)
  const filledCount = 1 + slots.filter(s=>s.trim()).length;

  function createTournament() {
    if(!hasBooking){setErr("You need a confirmed court booking at ACE Padel to host a tournament");return;}
    if(!f.name.trim()){setErr("Give your tournament a name");return;}
    if(!f.date){setErr("Select a date");return;}
    if(filledCount<6){setErr(`Add at least 6 players (currently ${filledCount})`);return;}
    const allPlayers = [
      {id:member.id, name:member.name, avatar:member.avatar},
      ...slots
        .map((s,i)=>({name:s.trim(),idx:i}))
        .filter(x=>x.name)
        .map(x=>({id:"g"+Date.now()+x.idx, name:x.name, avatar:x.name.slice(0,2).toUpperCase(), isGuest:true}))
    ];
    onCreateTournament({
      id:"t"+Date.now(),
      name:f.name.trim(),
      date:f.date,
      maxPlayers:allPlayers.length,
      courts:Number(f.courts),
      createdBy:member.id,
      creatorName:member.name,
      status:"open",
      players:allPlayers,
      rounds:[],
      currentRound:0,
      createdAt:new Date().toISOString(),
    });
    setCreating(false);
    setF({name:"",courts:"2",date:""});
    setSlots(Array(12).fill(""));
    setErr("");
  }

  const myTournaments  = tournaments.filter(t=>t.players?.some(p=>p.id===member.id));
  const otherOpen      = tournaments.filter(t=>t.status==="open"&&!t.players?.some(p=>p.id===member.id));
  const SI={background:TH.bgInput,border:"1.5px solid "+TH.border,borderRadius:11,padding:"9px 12px",color:TH.text,fontSize:13,width:"100%",outline:"none"};
  const minDate = new Date().toISOString().slice(0,10);
  const maxDate = new Date(Date.now()+30*86400000).toISOString().slice(0,10);

  return(
    <div style={{padding:"16px"}} className="fu">

      {/* How it works */}
      {!creating&&(
        <div style={{background:"linear-gradient(135deg,#0a1a0a,#050f05)",border:"1px solid rgba(34,197,94,.2)",borderRadius:16,padding:"14px 16px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:"#22c55e",textTransform:"uppercase",marginBottom:8}}>Americano · Free to Play</div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {["6–12 players across 1–2 courts — free to play","Partners rotate every round — no fixed teams","First to 21 points wins each game","Standings update live after every score is saved","Winner = most league points · tiebreaker on points scored"].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
                <span style={{color:"#22c55e",fontSize:11,flexShrink:0,marginTop:1}}>✦</span>
                <span style={{fontSize:12,color:TH.textMid,lineHeight:1.4}}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create button / gate */}
      {!creating?(
        <>
          {hasBooking?(
            <button onClick={()=>setCreating(true)} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:"0 4px 20px rgba(34,197,94,.35)",marginBottom:16}}>
              + Create Americano Tournament
            </button>
          ):(
            <div style={{padding:"12px 14px",background:"rgba(245,158,11,.07)",border:"1px solid rgba(245,158,11,.2)",borderRadius:13,marginBottom:16,fontSize:12,color:"#f59e0b",fontWeight:700,textAlign:"center"}}>
              📋 You need a confirmed ACE Padel court booking to host a tournament — book a court first
            </div>
          )}
        </>
      ):(
        /* ── CREATE FORM ── */
        <div style={{background:TH.bgCard,border:"1px solid rgba(34,197,94,.25)",borderRadius:18,padding:"16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:"#22c55e"}}>🏓 New Americano Tournament</div>
            <button onClick={()=>{setCreating(false);setErr("");setSlots(Array(12).fill(""));}} style={{background:"transparent",border:"none",color:TH.textMid,cursor:"pointer",fontSize:14}}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>

            {/* Name + date + courts */}
            <input placeholder="Tournament name *" value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} style={SI}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              <div>
                <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Date *</div>
                <input type="date" min={minDate} max={maxDate} value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))} style={{...SI,cursor:"pointer"}}/>
              </div>
              <div>
                <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Courts</div>
                <select value={f.courts} onChange={e=>setF(p=>({...p,courts:e.target.value}))} style={{...SI,cursor:"pointer"}}>
                  <option value="1">1 Court</option>
                  <option value="2">2 Courts</option>
                </select>
              </div>
            </div>

            {/* 12 player slots */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5}}>Players</div>
                <div style={{fontSize:11,fontWeight:700,color:filledCount>=6?"#22c55e":"#f59e0b"}}>{filledCount} / 12 {filledCount>=6?"✓ ready":"(need 6 min)"}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>

                {/* Slot 0 — creator locked */}
                <div style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",background:"rgba(249,115,22,.08)",border:"1.5px solid rgba(249,115,22,.3)",borderRadius:11}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:TH.text,flexShrink:0}}>1</div>
                  <span style={{flex:1,fontSize:13,fontWeight:700,color:"#f97316"}}>{member.name}</span>
                  <span style={{fontSize:9,fontWeight:800,color:"#f97316",opacity:.7}}>YOU</span>
                </div>

                {/* Slots 1–11 */}
                {slots.map((name,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:name.trim()?"rgba(34,197,94,.2)":TH.bgCard3,border:"1.5px solid "+(name.trim()?"rgba(34,197,94,.4)":TH.borderMid),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:name.trim()?"#22c55e":TH.textFaint,flexShrink:0}}>{i+2}</div>
                    <input
                      placeholder={`Player ${i+2} name${i<5?" *":""}`}
                      value={name}
                      onChange={e=>setSlots(prev=>{const n=[...prev];n[i]=e.target.value;return n;})}
                      style={{...SI,flex:1,borderColor:name.trim()?"rgba(34,197,94,.35)":TH.border,color:name.trim()?TH.text:TH.textMid}}
                    />
                    {name.trim()&&(
                      <button onClick={()=>setSlots(prev=>{const n=[...prev];n[i]="";return n;})}
                        style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16,padding:"0 4px",flexShrink:0}}>×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {err&&<div style={{padding:"8px 12px",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",borderRadius:9,color:"#f87171",fontSize:12,fontWeight:700}}>{err}</div>}
            <button onClick={createTournament}
              style={{padding:"13px",borderRadius:12,border:"none",background:filledCount>=6?"linear-gradient(135deg,#22c55e,#15803d)":TH.bgInput,color:filledCount>=6?"#fff":TH.textFaint,fontSize:14,fontWeight:900,cursor:filledCount>=6?"pointer":"default",boxShadow:filledCount>=6?"0 4px 16px rgba(34,197,94,.3)":"none",transition:"all .25s"}}>
              {filledCount>=6?`Create Tournament · ${filledCount} Players →`:`Add ${Math.max(0,6-filledCount)} more player${6-filledCount!==1?"s":""} to continue`}
            </button>
          </div>
        </div>
      )}

      {/* My tournaments */}
      {myTournaments.length>0&&(
        <>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:10}}>My Tournaments</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {myTournaments.map(t=>{
              const sC=t.status==="live"?"#f97316":t.status==="complete"?"#22c55e":"#06b6d4";
              return(
                <button key={t.id} onClick={()=>onSelect(t.id)} style={{background:TH.bgCard,border:"1px solid "+sC+"33",borderRadius:14,padding:"13px 14px",textAlign:"left",cursor:"pointer",width:"100%"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{flex:1,fontSize:13,fontWeight:800,color:TH.text}}>{t.name}</span>
                    <span style={{fontSize:9,fontWeight:800,color:sC,background:sC+"18",border:"1px solid "+sC+"40",borderRadius:50,padding:"2px 8px"}}>{t.status==="live"?"🔴 LIVE":t.status?.toUpperCase()}</span>
                  </div>
                  <div style={{fontSize:11,color:TH.textMid}}>{t.date} · {(t.players||[]).length} players · {t.courts} court{t.courts>1?"s":""} · Tap to view →</div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Other open tournaments to join */}
      {otherOpen.length>0&&(
        <>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:10}}>Open Tournaments</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {otherOpen.map(t=>{
              const spots=(t.maxPlayers||12)-(t.players||[]).length;
              return(
                <button key={t.id} onClick={()=>onSelect(t.id)} style={{background:TH.bgCard,border:"1px solid rgba(6,182,212,.25)",borderRadius:14,padding:"13px 14px",textAlign:"left",cursor:"pointer",width:"100%"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:800,color:TH.text}}>{t.name}</span>
                    <span style={{fontSize:11,fontWeight:700,color:spots>0?"#22c55e":"#ef4444"}}>{spots>0?spots+" spots":"FULL"}</span>
                  </div>
                  <div style={{fontSize:11,color:TH.textMid}}>{t.date} · Created by {t.creatorName} · Tap to view</div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {myTournaments.length===0&&otherOpen.length===0&&!creating&&(
        <div style={{textAlign:"center",padding:"30px",background:TH.bgCard,borderRadius:16,fontSize:12,color:TH.textFaint}}>No tournaments yet — create one above!</div>
      )}
    </div>
  );
}

// ── TOURNAMENT VIEW ────────────────────────────────────────────
function TournamentView({TH, tournament, members, member, onUpdate, onBack}) {
  const [viewTab, setViewTab] = useState("fixtures"); // fixtures | standings
  const [scores,  setScores]  = useState({}); // {roundIdx-gameIdx: {s1,s2}}

  const t = tournament;
  const players = t.players || [];
  const isCreator = t.createdBy === member?.id;
  const courts = t.courts || 2;

  function getName(id) {
    const m = players.find(p=>p.id===id) || members.find(m=>m.id===id);
    return m ? m.name.split(" ")[0] : id;
  }
  function getAvatar(id) {
    const m = players.find(p=>p.id===id) || members.find(m=>m.id===id);
    return m ? (m.avatar||m.name.slice(0,2).toUpperCase()) : "??";
  }
  function getTierColor(id) {
    const m = members.find(x=>x.id===id);
    return m ? getTier(m.points).color : TH.textMid;
  }

  // ── Start: generate fixtures ──
  function startTournament() {
    if(players.length<4){alert("Need at least 4 players");return;}
    const schedule = buildSchedule(players.map(p=>p.id), courts);
    onUpdate({status:"live", rounds:schedule, currentRound:0, startedAt:new Date().toISOString()});
  }

  // ── Save a game score ──
  function saveScore(rIdx, gIdx) {
    const key = rIdx+"-"+gIdx;
    const {s1,s2} = scores[key]||{};
    if(s1==null||s1===""||s2==null||s2==="") return;
    const n1=Number(s1), n2=Number(s2);
    if(isNaN(n1)||isNaN(n2)) return;
    const rounds = t.rounds.map((r,ri)=>ri!==rIdx?r:{...r,games:r.games.map((g,gi)=>gi!==gIdx?g:{...g,score1:n1,score2:n2})});
    onUpdate({rounds});
    setScores(p=>{const n={...p};delete n[key];return n;});
  }

  // ── Advance to next round ──
  function nextRound() {
    const next = (t.currentRound||0)+1;
    if(next>=(t.rounds||[]).length) {
      onUpdate({status:"complete", completedAt:new Date().toISOString()});
    } else {
      onUpdate({currentRound:next});
      setViewTab("fixtures");
    }
  }

  // ── Standings calc ──
  const playerIds = players.map(p=>p.id);
  const standings = calcStandings(playerIds, t.rounds||[]);
  const ranked = [...playerIds].sort((a,b)=>{
    const sa=standings[a]||{}, sb=standings[b]||{};
    if((sb.pts||0)!==(sa.pts||0)) return (sb.pts||0)-(sa.pts||0);
    return (sb.pointsFor||0)-(sa.pointsFor||0);
  });

  const currentRound = (t.rounds||[])[(t.currentRound||0)];
  const roundDone = currentRound && currentRound.games.every(g=>g.score1!=null&&g.score2!=null);
  const isLastRound = (t.currentRound||0)>=(t.rounds||[]).length-1;
  const sC = t.status==="live"?"#f97316":t.status==="complete"?"#22c55e":"#06b6d4";

  return(
    <div style={{minHeight:"100vh",paddingBottom:90,background:TH.bg}}>

      {/* Header */}
      <div style={{background:TH.bgCard,padding:"50px 18px 0",borderBottom:"1px solid "+TH.border}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:TH.textMid,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",gap:4}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2,color:TH.text,flex:1}}>{t.name}</div>
          <span style={{fontSize:9,fontWeight:800,color:sC,background:sC+"18",border:"1px solid "+sC+"40",borderRadius:50,padding:"3px 9px"}}>
            {t.status==="live"?"🔴 LIVE":t.status==="complete"?"✓ DONE":"OPEN"}
          </span>
        </div>
        <div style={{fontSize:11,color:TH.textMid,marginBottom:12}}>
          {t.date} · {players.length} players · {courts} court{courts>1?"s":""} · Americano · First to 21
        </div>
        <div style={{display:"flex",gap:0,borderBottom:"1px solid "+TH.border}}>
          {[["fixtures","🏓 Fixtures"],["standings","🏆 Standings"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setViewTab(id)} style={{padding:"10px 18px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:viewTab===id?"#fff":TH.textMid,borderBottom:viewTab===id?"2px solid #f97316":"2px solid transparent"}}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"14px 16px"}}>

        {/* ── STANDINGS ── */}
        {viewTab==="standings"&&(
          <div className="fu">

            {/* Winner banner */}
            {t.status==="complete"&&ranked.length>0&&(
              <div style={{background:"linear-gradient(135deg,rgba(240,192,64,.15),"+TH.bg+")",border:"1px solid rgba(240,192,64,.4)",borderRadius:20,padding:"20px",marginBottom:16,textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:8}}>🏆</div>
                <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:"#f0c040",textTransform:"uppercase",marginBottom:4}}>Tournament Winner</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:TH.text}}>{getName(ranked[0])}</div>
                <div style={{fontSize:12,color:"#f0c040",marginTop:4}}>
                  {standings[ranked[0]]?.pts||0} league pts · {standings[ranked[0]]?.wins||0} wins · {standings[ranked[0]]?.pointsFor||0} pts scored
                </div>
              </div>
            )}

            {/* Standings table */}
            {ranked.length===0?(
              <div style={{textAlign:"center",padding:"40px",color:TH.textTiny,fontSize:13}}>Play some games to see standings</div>
            ):(
              <>
                {/* Table header */}
                <div style={{display:"grid",gridTemplateColumns:"32px 1fr 36px 36px 36px 48px",gap:4,padding:"6px 10px",marginBottom:4}}>
                  {["#","Player","P","W","Pts","Scored"].map((h,i)=>(
                    <div key={h} style={{fontSize:8,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1,textAlign:i>1?"center":"left"}}>{h}</div>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {ranked.map((pid,i)=>{
                    const s=standings[pid]||{};
                    const tc=getTierColor(pid);
                    const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
                    const isMe=pid===member?.id;
                    return(
                      <div key={pid} style={{display:"grid",gridTemplateColumns:"32px 1fr 36px 36px 36px 48px",gap:4,padding:"10px",background:isMe?"rgba(249,115,22,.06)":i===0?"rgba(240,192,64,.07)":TH.bgCard,border:"1px solid "+(isMe?"#f9731620":i===0?"rgba(240,192,64,.2)":TH.border),borderRadius:11,alignItems:"center",animation:"fadeUp .2s ease "+i*.03+"s both"}}>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:medal?"#f0c040":TH.textFaint,textAlign:"center"}}>{medal||i+1}</div>
                        <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:tc+"30",border:"1.5px solid "+tc+"60",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:10,color:tc,flexShrink:0}}>{getAvatar(pid)}</div>
                          <span style={{fontSize:12,fontWeight:700,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{getName(pid)}{isMe?" (You)":""}</span>
                        </div>
                        <div style={{fontSize:12,fontWeight:700,color:TH.textMid,textAlign:"center"}}>{s.played||0}</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#22c55e",textAlign:"center"}}>{s.wins||0}</div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:i===0?"#f0c040":"#f97316",textAlign:"center",lineHeight:1}}>{s.pts||0}</div>
                        <div style={{fontSize:11,fontWeight:700,color:"#06b6d4",textAlign:"center"}}>{s.pointsFor||0}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:14,marginTop:10,padding:"8px 10px",fontSize:9,color:TH.textFaint}}>
                  <span>P = Games Played</span><span>W = Wins</span><span>Pts = League Points</span><span>Scored = Points Scored</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── FIXTURES ── */}
        {viewTab==="fixtures"&&(
          <div className="fu">

            {/* Not started — player list + start button */}
            {t.status==="open"&&(
              <div>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:10}}>
                  Players ({players.length}/{t.maxPlayers})
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:16}}>
                  {players.map(p=>{
                    const tc=getTierColor(p.id);
                    const isMe=p.id===member?.id;
                    return(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",background:TH.bgCard,border:"1px solid "+(isMe?"rgba(249,115,22,.3)":"rgba(34,197,94,.2)"),borderRadius:11}}>
                        <div style={{width:30,height:30,borderRadius:"50%",background:tc+"30",border:"1.5px solid "+tc+"60",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:10,color:tc,flexShrink:0}}>{getAvatar(p.id)}</div>
                        <span style={{fontSize:11,fontWeight:700,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name.split(" ")[0]}{isMe?" ★":""}</span>
                      </div>
                    );
                  })}
                </div>
                {isCreator&&players.length>=4&&(
                  <button onClick={startTournament} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 24px rgba(34,197,94,.35)"}}>
                    🏓 Generate Fixtures & Start
                  </button>
                )}
                {isCreator&&players.length<4&&(
                  <div style={{textAlign:"center",padding:"12px",fontSize:12,color:TH.textMid}}>Add at least 4 players to generate fixtures</div>
                )}
                {!isCreator&&(
                  <div style={{textAlign:"center",padding:"12px",fontSize:12,color:TH.textMid}}>Waiting for {t.creatorName} to start the tournament</div>
                )}
              </div>
            )}

            {/* Live — show current round */}
            {t.status==="live"&&currentRound&&(
              <>
                {/* Round progress bar */}
                <div style={{display:"flex",gap:4,marginBottom:16}}>
                  {(t.rounds||[]).map((_,ri)=>{
                    const done=(t.rounds[ri].games||[]).every(g=>g.score1!=null&&g.score2!=null);
                    const active=ri===(t.currentRound||0);
                    return(
                      <div key={ri} style={{flex:1,height:4,borderRadius:2,background:done?"#22c55e":active?"#f97316":TH.border,transition:"background .3s"}}/>
                    );
                  })}
                </div>

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#f97316",letterSpacing:1}}>
                    Round {(t.currentRound||0)+1} <span style={{fontSize:13,color:TH.textMid}}>of {(t.rounds||[]).length}</span>
                  </div>
                  {currentRound.resting?.length>0&&(
                    <div style={{fontSize:10,color:TH.textMid}}>Resting: {currentRound.resting.map(id=>getName(id)).join(", ")}</div>
                  )}
                </div>

                {/* Games */}
                {currentRound.games.map((g,gi)=>{
                  const key=(t.currentRound||0)+"-"+gi;
                  const inp=scores[key]||{};
                  const scored=g.score1!=null&&g.score2!=null;
                  const t1wins=scored&&g.score1>g.score2;
                  const t2wins=scored&&g.score2>g.score1;
                  return(
                    <div key={gi} style={{background:TH.bgCard,border:"1px solid rgba(249,115,22,.2)",borderRadius:16,padding:"14px",marginBottom:10}}>
                      <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:"#f97316",textTransform:"uppercase",marginBottom:10}}>Court {g.court}</div>

                      {/* Teams vs score */}
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {/* Team 1 */}
                        <div style={{flex:1,textAlign:"center"}}>
                          {g.t1.map(pid=>(
                            <div key={pid} style={{fontSize:11,fontWeight:800,color:t1wins?"#22c55e":scored?TH.textMid:TH.text,marginBottom:2}}>{getName(pid)}</div>
                          ))}
                        </div>

                        {/* Score */}
                        {scored?(
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:2,textAlign:"center",flexShrink:0,minWidth:70,color:TH.text}}>
                            {g.score1}<span style={{color:TH.textFaint,fontSize:20}}>–</span>{g.score2}
                          </div>
                        ):(
                          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                            <input type="number" min="0" max="21" placeholder="0" value={inp.s1||""} onChange={e=>setScores(p=>({...p,[key]:{...inp,s1:e.target.value}}))}
                              style={{width:46,background:TH.bgInput,border:"1.5px solid "+TH.borderMid,borderRadius:9,padding:"8px 4px",color:"#f97316",fontSize:20,fontWeight:900,textAlign:"center",outline:"none",fontFamily:"'Bebas Neue',sans-serif"}}/>
                            <span style={{color:TH.textFaint,fontWeight:900,fontSize:16}}>–</span>
                            <input type="number" min="0" max="21" placeholder="0" value={inp.s2||""} onChange={e=>setScores(p=>({...p,[key]:{...inp,s2:e.target.value}}))}
                              style={{width:46,background:TH.bgInput,border:"1.5px solid "+TH.borderMid,borderRadius:9,padding:"8px 4px",color:"#06b6d4",fontSize:20,fontWeight:900,textAlign:"center",outline:"none",fontFamily:"'Bebas Neue',sans-serif"}}/>
                          </div>
                        )}

                        {/* Team 2 */}
                        <div style={{flex:1,textAlign:"center"}}>
                          {g.t2.map(pid=>(
                            <div key={pid} style={{fontSize:11,fontWeight:800,color:t2wins?"#22c55e":scored?TH.textMid:TH.text,marginBottom:2}}>{getName(pid)}</div>
                          ))}
                        </div>
                      </div>

                      {/* Save / result row */}
                      {!scored&&(()=>{
                        const canSave=!!(inp.s1||inp.s1===0)&&!!(inp.s2||inp.s2===0);
                        return(
                          <button onClick={()=>saveScore(t.currentRound||0,gi)}
                            disabled={!canSave}
                            style={{width:"100%",padding:"9px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:12,fontWeight:800,cursor:"pointer",marginTop:10,opacity:canSave?1:.4}}>
                            Save Score
                          </button>
                        );
                      })()}
                      {scored&&(
                        <div style={{marginTop:8,textAlign:"center",fontSize:11,fontWeight:700,color:t1wins?"#22c55e":t2wins?"#06b6d4":"#f59e0b"}}>
                          {t1wins?g.t1.map(id=>getName(id)).join(" & ")+" WIN":t2wins?g.t2.map(id=>getName(id)).join(" & ")+" WIN":"DRAW"}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Live standings mini-table */}
                {ranked.filter(p=>standings[p]?.played>0).length>0&&(
                  <div style={{background:"rgba(240,192,64,.06)",border:"1px solid rgba(240,192,64,.2)",borderRadius:14,padding:"12px 14px",marginBottom:12}}>
                    <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:"#f0c040",textTransform:"uppercase",marginBottom:8}}>Live Standings</div>
                    {ranked.map((pid,i)=>{
                      const s=standings[pid]||{};
                      const tc=getTierColor(pid);
                      return(
                        <div key={pid} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid rgba(240,192,64,.1)"}}>
                          <span style={{width:16,fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:i<3?"#f0c040":TH.textFaint,flexShrink:0}}>{i+1}</span>
                          <div style={{width:24,height:24,borderRadius:"50%",background:tc+"30",border:"1.5px solid "+tc+"60",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:9,color:tc,flexShrink:0}}>{getAvatar(pid)}</div>
                          <span style={{flex:1,fontSize:11,fontWeight:700,color:TH.text}}>{getName(pid)}</span>
                          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#f97316",lineHeight:1}}>{s.pts||0}</span>
                          <span style={{fontSize:9,color:TH.textFaint,width:14}}>pts</span>
                          <span style={{fontSize:10,color:"#06b6d4",fontWeight:700}}>{s.pointsFor||0}</span>
                          <span style={{fontSize:9,color:TH.textFaint}}>scored</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Next round / finish */}
                {roundDone&&(
                  <button onClick={nextRound} style={{width:"100%",padding:"13px",borderRadius:13,border:"none",background:isLastRound?"linear-gradient(135deg,#f0c040,#b8860b)":"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:"0 4px 20px "+(isLastRound?"rgba(240,192,64,.4)":"rgba(249,115,22,.4)")}}>
                    {isLastRound?"🏆 Finish Tournament →":"Next Round →"}
                  </button>
                )}
              </>
            )}

            {/* Complete */}
            {t.status==="complete"&&(
              <div style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{fontSize:50,marginBottom:12}}>🏆</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,color:"#f0c040",marginBottom:4}}>Tournament Complete!</div>
                <div style={{fontSize:13,color:TH.textMid,marginBottom:16}}>Winner: {getName(ranked[0])} · {standings[ranked[0]]?.pts||0} league points</div>
                <button onClick={()=>setViewTab("standings")} style={{padding:"12px 28px",borderRadius:13,border:"none",background:"linear-gradient(135deg,#f0c040,#b8860b)",color:TH.bg,fontSize:13,fontWeight:900,cursor:"pointer"}}>
                  View Full Standings →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN TOURNAMENTS TAB ──────────────────────────────────────
function AdminTournamentsTab({TH, tournaments, members, onUpdate, onCreate, SI}) {
  return(
    <div className="fu">
      <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:12}}>
        Member-Created Tournaments ({(tournaments||[]).length})
      </div>
      <div style={{padding:"11px 14px",background:"rgba(6,182,212,.06)",border:"1px solid rgba(6,182,212,.2)",borderRadius:12,marginBottom:14,fontSize:12,color:"#06b6d4"}}>
        Tournaments are now created by members directly from the Play → Americano screen. This tab shows a read-only overview.
      </div>
      {(tournaments||[]).length===0?(
        <div style={{textAlign:"center",padding:"40px",color:TH.textTiny,fontSize:13}}>No tournaments created yet</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[...(tournaments||[])].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||"")).map(t=>{
            const sC=t.status==="live"?"#f97316":t.status==="complete"?"#22c55e":"#06b6d4";
            const playerIds=(t.players||[]).map(p=>p.id);
            const standings=calcStandings(playerIds,t.rounds||[]);
            const ranked=[...playerIds].sort((a,b)=>((standings[b]?.pts||0)-(standings[a]?.pts||0)));
            return(
              <div key={t.id} style={{background:TH.bgCard,border:"1px solid "+sC+"33",borderRadius:14,padding:"14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{flex:1,fontSize:13,fontWeight:800,color:TH.text}}>{t.name}</span>
                  <span style={{fontSize:9,fontWeight:800,color:sC,background:sC+"18",border:"1px solid "+sC+"40",borderRadius:50,padding:"2px 8px"}}>{t.status?.toUpperCase()}</span>
                </div>
                <div style={{fontSize:11,color:TH.textMid,marginBottom:t.status!=="open"?8:0}}>
                  {t.date} · {(t.players||[]).length}/{t.maxPlayers} players · {t.courts} court{t.courts>1?"s":""} · Created by {t.creatorName}
                </div>
                {t.status!=="open"&&ranked.length>0&&(
                  <div style={{fontSize:11,color:"#f0c040",fontWeight:700}}>
                    {t.status==="complete"?"🏆 Winner:":"🔴 Leader:"} {(t.players||[]).find(p=>p.id===ranked[0])?.name||ranked[0]} ({standings[ranked[0]]?.pts||0} pts)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─── BLOCKOUTS TAB ────────────────────────────────────────────────────────────
function AdminBlockoutsTab({TH, blockouts, onAdd, onRemove}) {
  const [f,setF]=useState({courtId:"",dateKey:DAYS14[0].key,allDay:true,startTime:"",endTime:"",reason:""});
  const [err,setErr]=useState("");
  const SI={background:TH.bgInput,border:"1.5px solid "+TH.border,borderRadius:11,padding:"9px 12px",color:TH.text,fontSize:13,width:"100%",outline:"none",cursor:"pointer"};

  const hourSlots=buildHourSlots(f.dateKey, 1);

  function add(){
    if(!f.dateKey){setErr("Select a date");return;}
    if(!f.allDay&&(!f.startTime||!f.endTime)){setErr("Select start and end times");return;}
    if(!f.allDay&&f.startTime>=f.endTime){setErr("Start must be before end");return;}
    onAdd({courtId:f.courtId?Number(f.courtId):null,dateKey:f.dateKey,allDay:f.allDay,startTime:f.startTime||null,endTime:f.endTime||null,reason:f.reason});
    setF({courtId:"",dateKey:DAYS14[0].key,allDay:true,startTime:"",endTime:"",reason:""});setErr("");
  }

  return(
    <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:18,padding:"16px"}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:TH.textMid,textTransform:"uppercase",marginBottom:12}}>Add New Block-out</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:10}}>
          <div>
            <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Date</div>
            <select value={f.dateKey} onChange={e=>setF(p=>({...p,dateKey:e.target.value}))} style={SI}>
              {DAYS14.slice(0,30).map(d=><option key={d.key} value={d.key}>{d.top} · {d.bot}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:9,fontWeight:800,color:TH.textFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Court</div>
            <select value={f.courtId} onChange={e=>setF(p=>({...p,courtId:e.target.value}))} style={SI}>
              <option value="">Both Courts</option>
              <option value="1">Court 1</option>
              <option value="2">Court 2</option>
            </select>
          </div>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:10}}>
          <input type="checkbox" checked={f.allDay} onChange={e=>setF(p=>({...p,allDay:e.target.checked}))} style={{width:15,height:15,accentColor:"#f97316"}}/>
          <span style={{fontSize:13,color:TH.textMid,fontWeight:600}}>All day</span>
        </label>
        {!f.allDay&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:10}}>
            <select value={f.startTime} onChange={e=>setF(p=>({...p,startTime:e.target.value}))} style={SI}>
              <option value="">From time</option>
              {hourSlots.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <select value={f.endTime} onChange={e=>setF(p=>({...p,endTime:e.target.value}))} style={SI}>
              <option value="">Until time</option>
              {hourSlots.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
        <input placeholder="Reason e.g. Maintenance, Private event" value={f.reason} onChange={e=>setF(p=>({...p,reason:e.target.value}))} style={{...SI,cursor:"text",marginBottom:10}}/>
        {err&&<div style={{color:"#f87171",fontSize:12,marginBottom:8}}>{err}</div>}
        <button onClick={add} style={{padding:"10px 22px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:TH.text,fontSize:13,fontWeight:800,cursor:"pointer"}}>Add Block-out</button>
      </div>

      {blockouts.length===0?(
        <div style={{textAlign:"center",padding:"32px",color:TH.textTiny,fontSize:13}}>No block-outs set</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {[...blockouts].sort((a,b)=>a.dateKey.localeCompare(b.dateKey)).map((bl,i)=>{
            const d=DAYS14.find(d=>d.key===bl.dateKey);
            return(
              <div key={bl.id} style={{background:TH.bgCard,border:"1px solid rgba(239,68,68,.25)",borderRadius:14,padding:"13px 15px",display:"flex",alignItems:"center",gap:10,animation:"fadeUp .25s ease "+(i*.03)+"s both"}}>
                <div style={{width:38,height:38,borderRadius:11,background:"rgba(239,68,68,.12)",border:"1.5px solid rgba(239,68,68,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🚫</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:TH.text,marginBottom:2}}>{d?.full||bl.dateKey}</div>
                  <div style={{fontSize:11,color:TH.textMid}}>
                    {bl.courtId?"Court "+bl.courtId:"Both Courts"} · {bl.allDay?"All day":bl.startTime+"–"+bl.endTime}
                    {bl.reason&&" · "+bl.reason}
                  </div>
                </div>
                <button onClick={()=>onRemove(bl.id)} style={{padding:"5px 12px",borderRadius:9,border:"1.5px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.08)",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>Remove</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function AdminSettingsTab({TH, settings, onSave}) {
  const [f,setF]=useState({
    offPeak: settings?.offPeak||30000,
    peak:    settings?.peak||65000,
    twoHour: settings?.twoHour||125000,
  });
  const [saved,setSaved]=useState(false);

  // 1.5h special sessions toggle + price
  const [specialEnabled,setSpecialEnabled]=useState(settings?.specialEnabled||false);
  const [specialPrice,  setSpecialPrice]  =useState(settings?.specialPrice||100000);
  const [specialDays,   setSpecialDays]   =useState(settings?.specialDays||["Wednesday","Thursday"]);
  const [specialTime,   setSpecialTime]   =useState(settings?.specialTime||"20:00");

  function save(){
    const s={...f,
      offPeak:Number(f.offPeak),peak:Number(f.peak),twoHour:Number(f.twoHour),
      specialEnabled,specialPrice:Number(specialPrice),specialDays,specialTime
    };
    onSave(s);setSaved(true);setTimeout(()=>setSaved(false),2500);
  }

  const SI={background:TH.bgCard,border:"1.5px solid "+TH.border,borderRadius:11,padding:"10px 14px",color:"#f97316",fontSize:16,fontWeight:800,fontFamily:"'Bebas Neue',sans-serif",width:"100%",outline:"none",cursor:"text"};

  return(
    <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Pricing */}
      <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:18,padding:"18px"}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:TH.textMid,textTransform:"uppercase",marginBottom:14}}>Court Pricing (MWK)</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {k:"offPeak",l:"Off-Peak (per hour)",sub:"05:00 – 16:00",c:"#22c55e"},
            {k:"peak",   l:"Peak (per hour)",    sub:"16:00 – close", c:"#f97316"},
            {k:"twoHour",l:"2-Hour Flat Rate",   sub:"Any time",      c:"#06b6d4"},
          ].map(({k,l,sub,c})=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",background:TH.bgCard2,borderRadius:13}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:TH.text}}>{l}</div>
                <div style={{fontSize:10,color:TH.textMid}}>{sub}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:11,color:TH.textMid,fontWeight:700}}>MWK</span>
                <input type="number" min="1000" step="1000" value={f[k]}
                  onChange={e=>setF(p=>({...p,[k]:e.target.value}))}
                  style={{...SI,width:110,color:c}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1.5h Special Sessions */}
      <div style={{background:TH.bgCard,border:"1px solid "+(specialEnabled?"rgba(167,139,250,.3)":TH.border),borderRadius:18,padding:"18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:TH.text}}>1.5-Hour Special Sessions</div>
            <div style={{fontSize:11,color:TH.textMid,marginTop:2}}>Enable evening 1.5h sessions on specific days at a flat rate</div>
          </div>
          <label style={{cursor:"pointer"}}>
            <input type="checkbox" checked={specialEnabled} onChange={e=>setSpecialEnabled(e.target.checked)} style={{width:18,height:18,accentColor:"#a78bfa",cursor:"pointer"}}/>
          </label>
        </div>
        {specialEnabled&&(
          <div style={{display:"flex",flexDirection:"column",gap:10,padding:"14px",background:TH.slotFull,border:"1px solid rgba(167,139,250,.2)",borderRadius:13}}>
            <div>
              <div style={{fontSize:9,fontWeight:800,color:"#6b5a8a",textTransform:"uppercase",letterSpacing:1.5,marginBottom:7}}>Available on</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=>(
                  <button key={d} onClick={()=>setSpecialDays(ds=>ds.includes(d)?ds.filter(x=>x!==d):[...ds,d])}
                    style={{padding:"6px 12px",borderRadius:50,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,
                      borderColor:specialDays.includes(d)?"#a78bfa":TH.borderMid,
                      background:specialDays.includes(d)?"rgba(167,139,250,.15)":"transparent",
                      color:specialDays.includes(d)?"#a78bfa":TH.textMid}}>
                    {d.slice(0,3)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <div style={{fontSize:9,fontWeight:800,color:"#6b5a8a",textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Start time</div>
                <select value={specialTime} onChange={e=>setSpecialTime(e.target.value)}
                  style={{background:TH.bgInput,border:"1.5px solid "+TH.borderMid,borderRadius:11,padding:"9px 12px",color:"#c4b5fd",fontSize:13,width:"100%",outline:"none",cursor:"pointer"}}>
                  {["17:00","18:00","19:00","20:00","21:00"].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:9,fontWeight:800,color:"#6b5a8a",textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Price (MWK flat)</div>
                <input type="number" min="1000" step="1000" value={specialPrice} onChange={e=>setSpecialPrice(e.target.value)}
                  style={{background:TH.bgInput,border:"1.5px solid "+TH.borderMid,borderRadius:11,padding:"9px 12px",color:TH.purple,fontSize:15,fontWeight:800,fontFamily:"'Bebas Neue',sans-serif",width:"100%",outline:"none"}}/>
              </div>
            </div>
            <div style={{fontSize:11,color:"#6b5a8a",padding:"8px 10px",background:TH.slotFull,borderRadius:9}}>
              ✦ When enabled, a 1.5h booking option will appear on the Book screen for the selected days, starting at the time above for MWK {Number(specialPrice||0).toLocaleString()}.
            </div>
          </div>
        )}
      </div>

      {saved&&<div style={{padding:"11px 14px",background:TH.slotOff,border:"1px solid rgba(34,197,94,.3)",borderRadius:12,fontSize:12,fontWeight:700,color:"#22c55e",textAlign:"center"}}>✓ Settings saved!</div>}
      <button onClick={save} style={{padding:"13px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:"0 4px 20px rgba(34,197,94,.3)"}}>Save Settings</button>
    </div>
  );
}

// ─── NOTIFICATIONS TAB ────────────────────────────────────────────────────────
function AdminNotifsTab({TH, notifications, onMarkRead, onClear}) {
  const unread=(notifications||[]).filter(n=>!n.read).length;
  return(
    <div className="fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase"}}>
          Notifications ({(notifications||[]).length}) · {unread} unread
        </div>
        {unread>0&&<button onClick={onClear} style={{padding:"5px 12px",borderRadius:9,border:"1.5px solid "+TH.borderMid,background:"transparent",color:TH.textMid,fontSize:11,fontWeight:700,cursor:"pointer"}}>Mark all read</button>}
      </div>
      {(notifications||[]).length===0?(
        <div style={{textAlign:"center",padding:"40px",color:TH.textTiny,fontSize:13}}>No notifications yet</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {[...(notifications||[])].sort((a,b)=>b.time.localeCompare(a.time)).map((n,i)=>(
            <div key={n.id} onClick={()=>onMarkRead&&onMarkRead(n.id)}
              style={{background:n.read?TH.bgCard:TH.bgCard2,border:"1px solid "+(n.read?TH.border:TH.borderFaint),borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",animation:"fadeUp .25s ease "+(i*.02)+"s both"}}>
              <div style={{width:34,height:34,borderRadius:10,background:n.read?TH.bgCard2:"rgba(249,115,22,.14)",border:"1.5px solid "+(n.read?TH.border:"rgba(249,115,22,.3)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                {n.type==="new"?"📩":"⏳"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:n.read?TH.textMid:TH.text,marginBottom:3}}>{n.msg}</div>
                <div style={{fontSize:10,color:TH.textFaint}}>{new Date(n.time).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
              </div>
              {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:"#f97316",flexShrink:0,marginTop:4,boxShadow:"0 0 8px #f9731680"}}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── EXPORT TAB ──────────────────────────────────────────────────────────────
function AdminExportTab({TH, bookings, members, waitlist, promoOffers}) {
  const [busy, setBusy]     = useState(null); // which report is exporting
  const [done, setDone]     = useState(null); // which just finished
  const [err,  setErr]      = useState("");
  const [range, setRange]   = useState("all"); // all | today | week | month

  async function getXLSX() {
    if(window.XLSX) return window.XLSX;
    return new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload=()=>res(window.XLSX);
      s.onerror=()=>rej(new Error("Failed to load Excel library. Check your internet connection."));
      document.head.appendChild(s);
    });
  }

  function filterByRange(bks) {
    const now = new Date();
    const todayKey = now.toISOString().slice(0,10);
    if(range==="today")  return bks.filter(b=>b.dateKey===todayKey||b.createdAt?.slice(0,10)===todayKey);
    if(range==="week") {
      const wAgo = new Date(now); wAgo.setDate(wAgo.getDate()-7);
      return bks.filter(b=>(b.createdAt||b.dateKey||"")>=wAgo.toISOString().slice(0,10));
    }
    if(range==="month") {
      const mAgo = new Date(now); mAgo.setMonth(mAgo.getMonth()-1);
      return bks.filter(b=>(b.createdAt||b.dateKey||"")>=mAgo.toISOString().slice(0,10));
    }
    return bks;
  }

  async function exportBookings() {
    setBusy("bookings"); setErr("");
    try {
      const XLSX = await getXLSX();
      const filtered = filterByRange(bookings);
      const rows = filtered.map(b=>({
        "Reference":         b.ref||"",
        "Name":              b.name||"",
        "Phone":             b.phone||"",
        "Court":             "Court "+(b.courtId||""),
        "Date":              b.date||b.dateKey||"",
        "Start Time":        b.time||"",
        "End Time":          b.endTime||"",
        "Duration":          b.dur===2?"2 Hours":"1 Hour",
        "Session Type":      b.pk?"Peak":"Off-Peak",
        "Price (MWK)":       b.price||0,
        "Status":            b.status||"pending",
        "Member":            b.memberId?"Yes":"Guest",
        "Booked At":         b.createdAt?new Date(b.createdAt).toLocaleString("en-GB"):"",
      }));

      // Summary sheet
      const confirmed = filtered.filter(b=>b.status==="confirmed").length;
      const cancelled = filtered.filter(b=>b.status==="cancelled").length;
      const revenue   = filtered.reduce((s,b)=>s+(b.price||0),0);
      const peakBks   = filtered.filter(b=>b.pk);
      const offBks    = filtered.filter(b=>!b.pk);
      const summary   = [
        {Metric:"Report Period",         Value:range==="all"?"All Time":range==="today"?"Today":range==="week"?"Last 7 Days":"Last 30 Days"},
        {Metric:"Total Bookings",        Value:filtered.length},
        {Metric:"Confirmed",             Value:confirmed},
        {Metric:"Pending",               Value:filtered.filter(b=>b.status==="pending").length},
        {Metric:"Cancelled",             Value:cancelled},
        {Metric:"Total Revenue (MWK)",   Value:revenue},
        {Metric:"Peak Bookings",         Value:peakBks.length},
        {Metric:"Peak Revenue (MWK)",    Value:peakBks.reduce((s,b)=>s+(b.price||0),0)},
        {Metric:"Off-Peak Bookings",     Value:offBks.length},
        {Metric:"Off-Peak Revenue (MWK)",Value:offBks.reduce((s,b)=>s+(b.price||0),0)},
        {Metric:"Member Bookings",       Value:filtered.filter(b=>b.memberId).length},
        {Metric:"Guest Bookings",        Value:filtered.filter(b=>!b.memberId).length},
        {Metric:"Court 1 Bookings",      Value:filtered.filter(b=>b.courtId===1).length},
        {Metric:"Court 2 Bookings",      Value:filtered.filter(b=>b.courtId===2).length},
        {Metric:"Exported At",           Value:new Date().toLocaleString("en-GB")},
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary),  "Summary");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length?rows:[{Note:"No bookings in this period"}]), "Bookings");
      const fname = "ACE-Bookings-"+(range==="all"?"AllTime":range)+"-"+new Date().toISOString().slice(0,10)+".xlsx";
      XLSX.writeFile(wb, fname);
      setDone("bookings"); setTimeout(()=>setDone(null),3000);
    } catch(e){ setErr(e.message); }
    finally{ setBusy(null); }
  }

  async function exportRevenue() {
    setBusy("revenue"); setErr("");
    try {
      const XLSX = await getXLSX();
      const filtered = filterByRange(bookings);

      // Group by date
      const byDate = {};
      filtered.forEach(b=>{
        const dk = b.dateKey||b.date||"Unknown";
        if(!byDate[dk]) byDate[dk]={date:dk,bookings:0,revenue:0,peak:0,offPeak:0,confirmed:0,cancelled:0};
        byDate[dk].bookings++;
        byDate[dk].revenue += b.price||0;
        if(b.pk) byDate[dk].peak += b.price||0;
        else      byDate[dk].offPeak += b.price||0;
        if(b.status==="confirmed") byDate[dk].confirmed++;
        if(b.status==="cancelled") byDate[dk].cancelled++;
      });
      const dailyRows = Object.values(byDate).sort((a,b)=>a.date.localeCompare(b.date)).map(d=>({
        "Date":                   d.date,
        "Bookings":               d.bookings,
        "Confirmed":              d.confirmed,
        "Cancelled":              d.cancelled,
        "Total Revenue (MWK)":    d.revenue,
        "Peak Revenue (MWK)":     d.peak,
        "Off-Peak Revenue (MWK)": d.offPeak,
      }));

      // Totals row
      const total = {
        "Date":"TOTAL",
        "Bookings":filtered.length,
        "Confirmed":filtered.filter(b=>b.status==="confirmed").length,
        "Cancelled":filtered.filter(b=>b.status==="cancelled").length,
        "Total Revenue (MWK)":filtered.reduce((s,b)=>s+(b.price||0),0),
        "Peak Revenue (MWK)":filtered.filter(b=>b.pk).reduce((s,b)=>s+(b.price||0),0),
        "Off-Peak Revenue (MWK)":filtered.filter(b=>!b.pk).reduce((s,b)=>s+(b.price||0),0),
      };
      if(dailyRows.length) dailyRows.push(total);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailyRows.length?dailyRows:[{Note:"No revenue data"}]), "Daily Revenue");
      XLSX.writeFile(wb, "ACE-Revenue-"+new Date().toISOString().slice(0,10)+".xlsx");
      setDone("revenue"); setTimeout(()=>setDone(null),3000);
    } catch(e){ setErr(e.message); }
    finally{ setBusy(null); }
  }

  async function exportMembers() {
    setBusy("members"); setErr("");
    try {
      const XLSX = await getXLSX();
      const rows = [...members].sort((a,b)=>b.points-a.points).map((m,i)=>({
        "Rank":           i+1,
        "Name":           m.name,
        "Email":          m.email||"",
        "Phone":          m.phone||"",
        "Gender":         m.gender||"",
        "Tier":           m.tier||"Bronze",
        "Points":         m.points||0,
        "Sessions":       m.bookings||0,
        "Wins":           m.wins||0,
        "Avg Rating":     m.ratingCount>0?(m.ratingTotal/m.ratingCount).toFixed(1):"Not rated",
        "Rating Votes":   m.ratingCount||0,
        "Joined":         m.joined||"",
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length?rows:[{Note:"No members"}]), "Members");
      XLSX.writeFile(wb, "ACE-Members-"+new Date().toISOString().slice(0,10)+".xlsx");
      setDone("members"); setTimeout(()=>setDone(null),3000);
    } catch(e){ setErr(e.message); }
    finally{ setBusy(null); }
  }

  async function exportWaitlist() {
    setBusy("waitlist"); setErr("");
    try {
      const XLSX = await getXLSX();
      const rows = (waitlist||[]).map(w=>({
        "Name":       w.name||"",
        "Phone":      w.phone||"",
        "Court":      "Court "+(w.courtId||""),
        "Date":       w.date||w.dateKey||"",
        "Time":       w.time||"",
        "End Time":   w.endTime||"",
        "Joined At":  w.joinedAt?new Date(w.joinedAt).toLocaleString("en-GB"):"",
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length?rows:[{Note:"No waitlist entries"}]), "Waitlist");
      XLSX.writeFile(wb, "ACE-Waitlist-"+new Date().toISOString().slice(0,10)+".xlsx");
      setDone("waitlist"); setTimeout(()=>setDone(null),3000);
    } catch(e){ setErr(e.message); }
    finally{ setBusy(null); }
  }

  async function exportFull() {
    setBusy("full"); setErr("");
    try {
      const XLSX = await getXLSX();
      const filtered = filterByRange(bookings);

      const bkRows = filtered.map(b=>({
        "Reference":b.ref||"","Name":b.name||"","Phone":b.phone||"",
        "Court":"Court "+(b.courtId||""),"Date":b.date||b.dateKey||"",
        "Start":b.time||"","End":b.endTime||"","Duration":b.dur===2?"2h":"1h",
        "Type":b.pk?"Peak":"Off-Peak","Price (MWK)":b.price||0,
        "Status":b.status||"","Member":b.memberId?"Yes":"Guest",
        "Booked At":b.createdAt?new Date(b.createdAt).toLocaleString("en-GB"):"",
      }));

      const memRows = [...members].sort((a,b)=>b.points-a.points).map((m,i)=>({
        "Rank":i+1,"Name":m.name,"Email":m.email||"","Phone":m.phone||"",
        "Gender":m.gender||"","Tier":m.tier||"Bronze","Points":m.points||0,
        "Sessions":m.bookings||0,"Avg Rating":m.ratingCount>0?(m.ratingTotal/m.ratingCount).toFixed(1):"—",
        "Joined":m.joined||"",
      }));

      const wlRows = (waitlist||[]).map(w=>({
        "Name":w.name||"","Phone":w.phone||"","Court":"Court "+(w.courtId||""),
        "Date":w.date||w.dateKey||"","Time":w.time||"",
        "Joined At":w.joinedAt?new Date(w.joinedAt).toLocaleString("en-GB"):"",
      }));

      const total = filtered.reduce((s,b)=>s+(b.price||0),0);
      const summary = [
        {Metric:"Exported At",          Value:new Date().toLocaleString("en-GB")},
        {Metric:"Period",               Value:range==="all"?"All Time":range==="today"?"Today":range==="week"?"Last 7 Days":"Last 30 Days"},
        {Metric:"Total Bookings",       Value:filtered.length},
        {Metric:"Total Revenue (MWK)",  Value:total},
        {Metric:"Total Members",        Value:members.length},
        {Metric:"Active Waitlist",      Value:(waitlist||[]).length},
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary),                                            "Summary");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bkRows.length?bkRows:[{Note:"No bookings"}]),        "Bookings");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(memRows.length?memRows:[{Note:"No members"}]),       "Members");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wlRows.length?wlRows:[{Note:"No waitlist entries"}]),"Waitlist");
      XLSX.writeFile(wb, "ACE-FullReport-"+new Date().toISOString().slice(0,10)+".xlsx");
      setDone("full"); setTimeout(()=>setDone(null),3000);
    } catch(e){ setErr(e.message); }
    finally{ setBusy(null); }
  }

  const ExportCard = ({id, icon, title, desc, count, countLabel, color, onExport}) => {
    const isBusy = busy===id;
    const isDone = done===id;
    return(
      <div style={{background:TH.bgCard,border:"1px solid "+(isDone?"rgba(34,197,94,.3)":color+"22"),borderRadius:18,padding:"18px",transition:"border-color .3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:46,height:46,borderRadius:14,background:color+"18",border:"1px solid "+color+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:TH.text,marginBottom:2}}>{title}</div>
            <div style={{fontSize:11,color:TH.textMid}}>{desc}</div>
          </div>
          {count!==undefined&&(
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:color,lineHeight:1}}>{count}</div>
              <div style={{fontSize:9,color:TH.textFaint,fontWeight:700,textTransform:"uppercase"}}>{countLabel}</div>
            </div>
          )}
        </div>
        <button
          onClick={onExport}
          disabled={!!busy}
          style={{width:"100%",padding:"12px",borderRadius:12,border:"none",cursor:busy?"not-allowed":"pointer",fontWeight:800,fontSize:13,transition:"all .25s",
            background:isDone?"linear-gradient(135deg,#22c55e,#15803d)":isBusy?TH.bgCard2:"linear-gradient(135deg,"+color+","+color+"cc)",
            color:isBusy?TH.textFaint:"#fff",
            boxShadow:isDone?"0 4px 16px rgba(34,197,94,.3)":isBusy?"none":"0 4px 16px "+color+"30",
            opacity:busy&&!isBusy?.5:1}}>
          {isDone?"✓ Downloaded!":isBusy?"⏳ Preparing...":"📥 Download Excel"}
        </button>
      </div>
    );
  };

  return(
    <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Date range filter */}
      <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:16,padding:"14px 16px"}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase",marginBottom:10}}>Date Range</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {[["all","All Time"],["today","Today"],["week","Last 7 Days"],["month","Last 30 Days"]].map(([v,l])=>(
            <button key={v} onClick={()=>setRange(v)} style={{padding:"7px 14px",borderRadius:50,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,
              borderColor:range===v?"#f97316":TH.border,background:range===v?"rgba(249,115,22,.15)":"transparent",color:range===v?"#f97316":TH.textMid}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{marginTop:8,fontSize:11,color:TH.textFaint}}>
          {filterByRange(bookings).length} booking{filterByRange(bookings).length!==1?"s":""}
          {" · MWK "+filterByRange(bookings).reduce((s,b)=>s+(b.price||0),0).toLocaleString()+" total revenue"}
          {" in this period"}
        </div>
      </div>

      {err&&(
        <div style={{padding:"12px 14px",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:12,fontSize:12,color:"#f87171",fontWeight:700}}>
          ⚠ {err}
        </div>
      )}

      {/* Full report — featured */}
      <div style={{background:TH.bgSection,border:"1px solid rgba(6,182,212,.25)",borderRadius:18,padding:"18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,background:"radial-gradient(circle,rgba(6,182,212,.1) 0%,transparent 70%)"}}/>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:"#06b6d4",textTransform:"uppercase",marginBottom:6}}>⭐ Full Report</div>
        <div style={{fontSize:15,fontWeight:900,color:TH.text,marginBottom:4}}>Complete Club Report</div>
        <div style={{fontSize:12,color:TH.textMid,marginBottom:14}}>All data in one file — Bookings + Revenue + Members + Waitlist across 4 sheets</div>
        <button
          onClick={exportFull}
          disabled={!!busy}
          style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:busy?"not-allowed":"pointer",fontWeight:900,fontSize:14,
            background:done==="full"?"linear-gradient(135deg,#22c55e,#15803d)":busy==="full"?TH.bgCard2:"linear-gradient(135deg,#06b6d4,#0369a1)",
            color:busy==="full"?TH.textFaint:"#fff",
            boxShadow:done==="full"?"0 6px 20px rgba(34,197,94,.3)":busy==="full"?"none":"0 6px 20px rgba(6,182,212,.35)",
            opacity:busy&&busy!=="full"?.5:1,transition:"all .25s"}}>
          {done==="full"?"✓ Report Downloaded!":busy==="full"?"⏳ Building Report...":"📥 Download Full Report"}
        </button>
      </div>

      {/* Individual exports */}
      <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:TH.textMid,textTransform:"uppercase"}}>Individual Exports</div>

      <ExportCard id="bookings" icon="📋" title="Bookings" desc={"Ref, name, court, date, time, price, status for "+filterByRange(bookings).length+" booking"+(filterByRange(bookings).length!==1?"s":"")} count={filterByRange(bookings).length} countLabel="bookings" color="#f97316" onExport={exportBookings}/>
      <ExportCard id="revenue"  icon="💰" title="Revenue Report" desc="Daily breakdown — bookings count, peak vs off-peak, total per day" count={"MWK "+filterByRange(bookings).reduce((s,b)=>s+(b.price||0),0).toLocaleString()} countLabel="total" color="#22c55e" onExport={exportRevenue}/>
      <ExportCard id="members"  icon="👥" title="Members List" desc="All members — tier, points, sessions, rating, gender, contact" count={members.length} countLabel="members" color="#a78bfa" onExport={exportMembers}/>
      <ExportCard id="waitlist" icon="⏳" title="Waitlist" desc="Everyone currently waiting for a slot — name, phone, court, time" count={(waitlist||[]).length} countLabel="waiting" color="#7c3aed" onExport={exportWaitlist}/>

    </div>
  );
}

function AdminRewardsTab({TH, rewards,setRewards,SI}) {
  const [f,setF]=useState({title:"",points:"",tier:"Bronze",desc:"",maxUses:""});
  const [err,setErr]=useState("");
  function add(){
    if(!f.title.trim()||!f.points){setErr("Title and points required");return;}
    setRewards(r=>[...r,{id:"r"+Date.now(),title:f.title,points:Number(f.points),tier:f.tier,desc:f.desc,uses:0,maxUses:f.maxUses?Number(f.maxUses):null,active:true}]);
    setF({title:"",points:"",tier:"Bronze",desc:"",maxUses:""});setErr("");
  }
  return(
    <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:18,padding:"16px"}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:TH.textMid,textTransform:"uppercase",marginBottom:12}}>Create New Offer</div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <input placeholder="Offer title *" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} style={SI}/>
          <input placeholder="Description" value={f.desc} onChange={e=>setF(p=>({...p,desc:e.target.value}))} style={SI}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <input type="number" placeholder="Points cost *" value={f.points} onChange={e=>setF(p=>({...p,points:e.target.value}))} style={SI}/>
            <input type="number" placeholder="Max uses (opt.)" value={f.maxUses} onChange={e=>setF(p=>({...p,maxUses:e.target.value}))} style={SI}/>
          </div>
          <div>
            <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:TH.textFaint,textTransform:"uppercase",marginBottom:6}}>Minimum Tier</div>
            <div style={{display:"flex",gap:7}}>
              {TIERS.map(t=>(
                <button key={t.name} onClick={()=>setF(p=>({...p,tier:t.name}))} style={{flex:1,padding:"7px 4px",borderRadius:9,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:700,borderColor:f.tier===t.name?t.color:TH.border,background:f.tier===t.name?t.bg:TH.bgInput,color:f.tier===t.name?t.color:TH.textMid}}>{t.icon}</button>
              ))}
            </div>
          </div>
          {err&&<div style={{color:"#f87171",fontSize:12}}>{err}</div>}
          <button onClick={add} style={{padding:"11px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:TH.text,fontSize:13,fontWeight:800,cursor:"pointer"}}>Create Offer</button>
        </div>
      </div>
      {rewards.map(r=>{
        const t=TIERS.find(x=>x.name===r.tier)||TIERS[0];
        return(
          <div key={r.id} style={{background:TH.bgCard,border:"1px solid "+t.color+"33",borderRadius:14,padding:"13px 15px",display:"flex",alignItems:"center",gap:10,opacity:r.active?1:.55}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:TH.text,marginBottom:2}}>{r.title}</div>
              <div style={{fontSize:11,color:TH.textMid}}>{t.icon} {r.tier}+ · {(r.points||0).toLocaleString()} pts{r.maxUses?" · "+r.uses+"/"+r.maxUses+" used":""}</div>
              {r.desc&&<div style={{fontSize:10,color:TH.textFaint,marginTop:2}}>{r.desc}</div>}
            </div>
            <button onClick={()=>setRewards(rs=>rs.map(x=>x.id===r.id?{...x,active:!x.active}:x))} style={{padding:"5px 12px",borderRadius:8,border:"1.5px solid "+(r.active?"#ef444444":"#22c55e44"),background:r.active?"rgba(239,68,68,.08)":"rgba(34,197,94,.08)",color:r.active?"#ef4444":"#22c55e",fontSize:10,fontWeight:700,cursor:"pointer",flexShrink:0}}>
              {r.active?"Pause":"Activate"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function AdminPointsTab({TH, members,onAddPoints,SI}) {
  const [ptForm,setPtForm]=useState({memberId:"",pts:"",reason:""});
  const [done,setDone]=useState("");
  function grant(){
    if(!ptForm.memberId||!ptForm.pts){setDone("error");return;}
    onAddPoints(ptForm.memberId,Number(ptForm.pts));
    setDone("success");setTimeout(()=>setDone(""),2500);
    setPtForm({memberId:"",pts:"",reason:""});
  }
  return(
    <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:18,padding:"16px"}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:TH.textMid,textTransform:"uppercase",marginBottom:12}}>Grant Points to Member</div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <select value={ptForm.memberId} onChange={e=>setPtForm(p=>({...p,memberId:e.target.value}))} style={{...SI,cursor:"pointer"}}>
            <option value="">Select member...</option>
            {members.map(m=><option key={m.id} value={m.id}>{m.name} — {fmt(m.points)} pts</option>)}
          </select>
          <input type="number" placeholder="Points to add" value={ptForm.pts} onChange={e=>setPtForm(p=>({...p,pts:e.target.value}))} style={SI}/>
          <input placeholder="Reason (optional)" value={ptForm.reason} onChange={e=>setPtForm(p=>({...p,reason:e.target.value}))} style={SI}/>
          {done==="success"&&<div style={{color:"#22c55e",fontSize:13,fontWeight:700}}>✓ Points granted!</div>}
          {done==="error"&&<div style={{color:"#f87171",fontSize:13,fontWeight:700}}>Select a member and enter points</div>}
          <button onClick={grant} style={{padding:"11px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#f97316,#b45309)",color:TH.text,fontSize:13,fontWeight:800,cursor:"pointer"}}>Grant Points</button>
        </div>
      </div>
      <div style={{background:"rgba(249,115,22,.07)",border:"1px solid rgba(249,115,22,.2)",borderRadius:14,padding:"14px"}}>
        <div style={{fontSize:11,fontWeight:800,color:"#f97316",marginBottom:10}}>Points Earning Rules</div>
        {[["Sign up (welcome bonus)","100 pts"],["Off-peak booking (1h)","50 pts"],["Off-peak booking on Friday","80 pts"],["Peak booking (1h)","80 pts"],["2-hour session","2× the hourly pts"]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+TH.border,fontSize:12}}>
            <span style={{color:TH.textMid}}>{k}</span>
            <span style={{color:"#22c55e",fontWeight:700}}>{v}</span>
          </div>
        ))}
      </div>
      {/* Members points overview */}
      <div style={{background:TH.bgCard,border:"1px solid "+TH.border,borderRadius:16,padding:"14px"}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:TH.textMid,textTransform:"uppercase",marginBottom:10}}>Points Overview</div>
        {[...members].sort((a,b)=>b.points-a.points).map(m=>{
          const t=getTier(m.points);
          const next=TIERS[TIERS.findIndex(x=>x.name===t.name)+1];
          const prog=next?Math.min(100,((m.points-t.min)/(next.min-t.min))*100):100;
          return(
            <div key={m.id} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+TH.border}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,fontWeight:700,color:TH.text}}>{m.name}</span>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:t.color}}>{fmt(m.points)} pts</span>
              </div>
              <div style={{height:4,background:TH.bgInput,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:prog+"%",background:"linear-gradient(90deg,"+t.color+","+t.color+"88)",borderRadius:2}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                <span style={{fontSize:9,color:t.color,fontWeight:700}}>{t.icon} {t.name}</span>
                {next&&<span style={{fontSize:9,color:TH.textFaint}}>{fmt(next.min-m.points)} to {next.name}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
