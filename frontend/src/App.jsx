import React, { useEffect, useMemo, useState } from 'react';
import { Compass, MapPin, CalendarDays, Wallet, Sparkles, Bookmark, ArrowRight, Clock3, Users, CheckCircle2, Plane, Utensils, Trees, Landmark, RefreshCw, Trash2, Menu, X } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const INTERESTS = ['Culture', 'Food', 'Nature', 'Adventure', 'Shopping', 'History', 'Temples', 'Beaches'];
const today = new Date();
const dateString = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const plusDays = n => { const d = new Date(); d.setDate(d.getDate()+n); return dateString(d); };

function App() {
  const [form, setForm] = useState({
    destination: 'Jaipur, India', start_date: plusDays(7), end_date: plusDays(9),
    budget: '12000', interests: ['Culture', 'Food', 'History'], travel_style: 'balanced',
    group_size: '2', currency: 'INR'
  });
  const [trip, setTrip] = useState(null);
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('wayfarer-trips') || '[]'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => localStorage.setItem('wayfarer-trips', JSON.stringify(saved)), [saved]);
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleInterest = item => update('interests', form.interests.includes(item) ? form.interests.filter(x => x !== item) : [...form.interests, item]);

  async function generate(e) {
    e?.preventDefault();
    setError('');
    if (!form.destination.trim()) return setError('Please enter a destination.');
    if (form.end_date < form.start_date) return setError('End date must be on or after the start date.');
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/itineraries/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, budget: Number(form.budget), group_size: Number(form.group_size) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not generate itinerary.');
      setTrip(data); setActiveDay(0);
    } catch (err) {
      setError(`Could not reach the backend. Make sure FastAPI is running at ${API}. (${err.message})`);
    } finally { setLoading(false); }
  }

  function saveTrip() {
    if (!trip) return;
    const item = { ...trip, id: crypto.randomUUID(), savedAt: new Date().toISOString() };
    setSaved(prev => [item, ...prev]);
  }
  function removeSaved(id) { setSaved(prev => prev.filter(t => t.id !== id)); }
  function loadSaved(item) { setTrip(item); setActiveDay(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const currentDay = trip?.days?.[activeDay];
  const money = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: trip?.currency || 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Compass size={22}/></div><div>wayfarer<span>TRAVEL, THOUGHTFULLY</span></div><button className="close-menu" onClick={()=>setMobileMenu(false)}><X/></button></div>
      <div className="side-label">WORKSPACE</div>
      <a className="side-link active" href="#planner"><Compass size={18}/> Trip planner</a>
      <a className="side-link" href="#itinerary"><CalendarDays size={18}/> My itinerary</a>
      <a className="side-link" href="#saved"><Bookmark size={18}/> Saved trips <span className="count">{saved.length}</span></a>
      <div className="sidebar-bottom"><div className="side-illustration">✦</div><strong>Your next story starts here.</strong><p>Make room for the places you'll remember.</p></div>
    </aside>
    {mobileMenu && <button className="scrim" onClick={()=>setMobileMenu(false)} aria-label="Close menu"/>}
    <main className="main">
      <header className="topbar"><button className="mobile-toggle" onClick={()=>setMobileMenu(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> Trip planner</div><div className="top-right"><span className="status-dot"/> Your travel studio <div className="avatar">W</div></div></header>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL TRAVEL DESIGNER</div><h1>Less planning.<br/><em>More wandering.</em></h1><p>Tell us what makes a trip yours. We'll turn your ideas into a thoughtful, day-by-day travel plan.</p><a className="hero-link" href="#planner">Build your itinerary <ArrowRight size={16}/></a></div>
        <div className="hero-art"><div className="sun"/><div className="mountain m1"/><div className="mountain m2"/><div className="road"/><div className="art-card"><span>✦ CURATED FOR YOU</span><strong>Find your<br/>own somewhere.</strong><small>Good trips begin with a feeling.</small></div><div className="art-stamp"><Compass size={25}/><span>GO<br/>EXPLORE</span></div></div>
      </section>
      <div className="content-grid" id="planner">
        <section className="panel form-panel">
          <div className="section-heading"><div><div className="eyebrow muted">STEP 01 — THE DETAILS</div><h2>Design your getaway</h2><p>A few details help us make it feel like you.</p></div><div className="step-icon"><MapPin/></div></div>
          <form onSubmit={generate}>
            <label className="field-label">Where do you want to go?</label>
            <div className="input-wrap"><MapPin size={18}/><input value={form.destination} onChange={e=>update('destination',e.target.value)} placeholder="e.g. Jaipur, India" required maxLength="100"/></div>
            <div className="two-fields">
              <div><label className="field-label">Departure</label><div className="input-wrap"><CalendarDays size={17}/><input type="date" value={form.start_date} onChange={e=>update('start_date',e.target.value)} required/></div></div>
              <div><label className="field-label">Return</label><div className="input-wrap"><CalendarDays size={17}/><input type="date" value={form.end_date} min={form.start_date} onChange={e=>update('end_date',e.target.value)} required/></div></div>
            </div>
            <div className="two-fields">
              <div><label className="field-label">Total budget (₹)</label><div className="input-wrap"><Wallet size={17}/><input type="number" min="1" value={form.budget} onChange={e=>update('budget',e.target.value)} required/></div></div>
              <div><label className="field-label">Travellers</label><div className="input-wrap"><Users size={17}/><select value={form.group_size} onChange={e=>update('group_size',e.target.value)}>{[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n} {n===1?'traveller':'travellers'}</option>)}</select></div></div>
            </div>
            <label className="field-label">What are you in the mood for?</label><p className="field-hint">Choose as many as you like</p>
            <div className="interest-grid">{INTERESTS.map((item,i)=><button type="button" key={item} className={`interest ${form.interests.includes(item)?'selected':''}`} onClick={()=>toggleInterest(item)}>{i===0||i===5||i===6?<Landmark size={16}/>:i===1?<Utensils size={16}/>:i===2||i===3||i===7?<Trees size={16}/>:<Sparkles size={16}/>} {item}{form.interests.includes(item)&&<CheckCircle2 size={14}/>}</button>)}</div>
            <label className="field-label">Your travel pace</label><div className="style-options">{[['budget','Budget-friendly','Thoughtful spending'],['balanced','A bit of both','Comfort & value'],['premium','Treat yourself','A little extra comfort']].map(([value,title,sub])=><button type="button" key={value} onClick={()=>update('travel_style',value)} className={`style-option ${form.travel_style===value?'chosen':''}`}><span>{title}</span><small>{sub}</small></button>)}</div>
            {error&&<div className="error-box">{error}</div>}
            <button className="primary-button" type="submit" disabled={loading}>{loading?<><RefreshCw className="spin" size={17}/> Crafting your trip...</>:<><Sparkles size={17}/> Generate my itinerary <ArrowRight size={17}/></>}</button>
            <p className="privacy-note">✦ Made for inspiration. Always verify prices and opening times.</p>
          </form>
        </section>
        <section className="results-column" id="itinerary">
          {!trip ? <div className="empty-state"><div className="empty-art"><div className="empty-sun"/><div className="empty-hill one"/><div className="empty-hill two"/><Plane className="plane-icon"/></div><div className="eyebrow muted">YOUR CANVAS IS READY</div><h2>Your next adventure,<br/>beautifully planned.</h2><p>Your itinerary will appear here with daily ideas, local flavours, and room to explore.</p><div className="empty-features"><span><CheckCircle2 size={15}/> Day-by-day plan</span><span><CheckCircle2 size={15}/> Personalised ideas</span><span><CheckCircle2 size={15}/> Budget estimate</span></div></div>
          : <div className="itinerary-card">
            <div className="itinerary-top"><div><div className="eyebrow muted">YOUR PERSONAL ITINERARY</div><h2>{trip.destination}</h2><p><CalendarDays size={15}/> {trip.days[0]?.date} — {trip.days[trip.days.length-1]?.date} <span>·</span> {trip.days.length} days</p></div><button className="icon-button" onClick={saveTrip} title="Save trip"><Bookmark size={18}/></button></div>
            <div className="trip-stats"><div><span>TRIP BUDGET</span><strong>{money(trip.budget)}</strong></div><div><span>ESTIMATED ACTIVITIES</span><strong>{money(trip.estimated_total)}</strong></div><div><span>TRAVELLERS</span><strong>{form.group_size}</strong></div></div>
            <p className="trip-summary">{trip.summary}</p>
            <div className="day-tabs">{trip.days.map((day,i)=><button key={day.day} className={activeDay===i?'active':''} onClick={()=>setActiveDay(i)}><small>DAY {day.day}</small><strong>{new Date(day.date+'T12:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</strong></button>)}</div>
            {currentDay&&<div className="day-content"><div className="day-title"><div><span>DAY {currentDay.day}</span><h3>{currentDay.title}</h3></div><div className="day-total">{money(currentDay.estimated_total)}<small>est. activities</small></div></div>
              {currentDay.activities.map((a,i)=><div className="activity" key={i}><div className="activity-time"><Clock3 size={15}/><span>{a.time}</span></div><div className="activity-line"><div className="activity-dot"/></div><div className="activity-info"><div className="activity-meta">{a.category}</div><h4>{a.title}</h4><p>{a.description}</p><span className="activity-cost">{money(a.estimated_cost)} estimated</span></div></div>)}
            </div>}
            <div className="tip-box"><Sparkles size={17}/><div><strong>A little local wisdom</strong><p>{trip.tips?.[activeDay % trip.tips.length]}</p></div></div>
          </div>}
          <div className="saved-section" id="saved"><div className="saved-heading"><div><div className="eyebrow muted">KEEP THE GOOD IDEAS</div><h3>Saved journeys <span>{saved.length}</span></h3></div></div>
            {saved.length===0?<div className="saved-empty"><Bookmark size={18}/><span>Your saved trips will live here. Generate a plan and tap the bookmark to keep it.</span></div>:<div className="saved-list">{saved.map(item=><div className="saved-item" key={item.id}><div className="saved-pin"><MapPin size={17}/></div><button className="saved-load" onClick={()=>loadSaved(item)}><strong>{item.destination}</strong><span>{item.days.length} days · {moneyFor(item.budget,item.currency)}</span></button><button className="delete-button" onClick={()=>removeSaved(item.id)} aria-label="Delete saved trip"><Trash2 size={16}/></button></div>)}</div>}
          </div>
        </section>
      </div>
      <footer><div className="footer-brand"><Compass size={17}/> wayfarer</div><span>Travel thoughtfully. Leave room for wonder.</span><span>Student project · Estimates are illustrative</span></footer>
    </main>
  </div>;
}
function moneyFor(amount,currency='INR') { return new Intl.NumberFormat('en-IN',{style:'currency',currency,maximumFractionDigits:0}).format(amount||0); }
export default App;
