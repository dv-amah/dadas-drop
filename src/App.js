import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  ShoppingBag, Search, X, Plus, Minus, Trash2, Heart,
  ChevronDown, Check, MessageCircle, Truck, Smartphone,
  ArrowRight, Phone, Moon, Sun, ChevronLeft, ChevronRight,
  Package, MapPin, Star, Copy, CheckCircle, Globe, Menu,
  Home, Grid, User, Lock, BarChart2, Settings, LogOut,
  Edit, Trash, Eye, EyeOff, PlusCircle, Bell, TrendingUp,
  ShoppingCart, AlertCircle, Filter, ShieldCheck, Users,
  ChevronUp, Save, ArrowLeft
} from "lucide-react";

/* ═══════════════════════════════════════
   🌐 SUPABASE CLIENT
   ═══════════════════════════════════════ */
const SUPABASE_URL = "https://oypjgjhlqmsibunvzmwu.supabase.co";
const SUPABASE_KEY = "sb_publishable_p-h-HJ7_MK4fHiRh5OxC0w_h-SxK3lN";

const sb = {
  async get(table, params = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`Supabase GET ${table}: ${res.status}`);
    return res.json();
  },
  async post(table, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Supabase POST ${table}: ${res.status}`);
    return res.json();
  },
  async patch(table, id, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Supabase PATCH ${table}: ${res.status}`);
    return res.json();
  },
  async delete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`Supabase DELETE ${table}: ${res.status}`);
    return true;
  },
};

/* ═══════════════════════════════════════
   🎨 PALETTES & CONSTANTES GLOBALES
   ═══════════════════════════════════════ */

// Palette admin
const CA = {
  cream:"#FAF6EE", creamD:"#F0EBE0", gold:"#C9A84C", goldL:"#E8C96A",
  ink:"#1A1A1A", mute:"#8A7A6A", border:"#E0D8CC", card:"#FFFFFF",
  success:"#1A9E5E", danger:"#E05030", warning:"#E08030",
  dBg:"#0F0C08", dCard:"#1A1510", dBorder:"#2E2820", dMute:"#7A6A5A", dText:"#F5F0E8",
};

// Palette shop
const C = {
  cream:"#FAF6EE", creamD:"#F0EBE0", gold:"#C9A84C", goldL:"#E8C96A",
  ink:"#1A1A1A", inkSoft:"#3A3530", mute:"#8A7A6A", border:"#E0D8CC", card:"#FFFFFF",
  success:"#1A9E5E", danger:"#E05030",
  dBg:"#0F0C08", dCard:"#1A1510", dBorder:"#2E2820", dMute:"#7A6A5A", dText:"#F5F0E8",
};

const GRAD = `linear-gradient(135deg, ${C.gold} 0%, ${C.goldL} 100%)`;
const GRAD_A = `linear-gradient(135deg, ${CA.gold} 0%, ${CA.goldL} 100%)`;

// Formatage monétaire
const fcfa = n => (n || 0).toLocaleString("fr-FR") + " FCFA";
const fcfa_a = n => n?.toLocaleString("fr-FR") + " FCFA";

// Catégories
const CATS_FR = ["Tout","Sacs à main","Bandoulières","Pochettes","Chaussures","Bijoux","Parfums","Gloss","Vêtements"];
const CATS_EN = ["All","Handbags","Shoulder bags","Clutches","Shoes","Jewellery","Perfumes","Gloss","Clothing"];
const CATS_ADMIN = ["Sacs à main","Bandoulières","Pochettes","Chaussures","Bijoux","Parfums","Gloss","Vêtements"];

// Config
const CFG = {
  brand: "DADA'S DROP",
  whatsapp: "22670000000",
  orangeMoney: "+226 70 00 00 00",
  moovMoney: "+226 60 00 00 00",
  wave: "+226 77 00 00 00",
  city: "Ouagadougou",
  freeFrom: 20000,
  adminPass: "dada2025",
};

/* ═══════════════════════════════════════
   🔐 RÔLES ADMIN
   ═══════════════════════════════════════ */
const ROLES = {
  admin:    { label:"Administrateur", color:CA.gold,    badge:"👑" },
  manager:  { label:"Gestionnaire",   color:"#1DC0D4",  badge:"👩‍💼" },
  delivery: { label:"Livreur",        color:CA.success, badge:"🚴" },
};

/* ═══════════════════════════════════════
   📦 DONNÉES DÉMO (fallback si Supabase vide)
   ═══════════════════════════════════════ */
const INIT_USERS = [
  { id:1, name:"David Amah",    email:"david@dadasdrop.com",   role:"admin",    active:true },
  { id:2, name:"Ma Copine",     email:"copine@dadasdrop.com",  role:"manager",  active:true },
  { id:3, name:"Livreur Ouaga", email:"livreur@dadasdrop.com", role:"delivery", active:true },
];

const STATUS_LABELS = ["","En préparation","Expédiée","Livrée"];
const STATUS_COLORS = ["", CA.warning, "#1DC0D4", CA.success];
const PAYMENT_LABELS = {
  orange:"Orange Money", moov:"Moov Money", wave:"Wave", livraison:"À la livraison"
};

const initProducts = [
  { id:1, name:"Mini Boston Rose", nameEn:"Mini Boston Pink", brand:"Coach", price:25000,
    cat:"Sacs à main", catEn:"Handbags", stock:3, isNew:true, isBest:true,
    accent:["#F4A0B0","#E8175D"],
    imgs:["https://i.ibb.co/XrgMg8kL/dc4bf9bd-aa95-47aa-9e7f-f7fa7061b61d.jpg"],
    desc:"Petit sac Boston Coach monogrammé rose poudré, double anse + bandoulière réglable, finitions dorées.",
    descEn:"Pink monogram mini Boston bag, double handle + adjustable strap, gold finishes." },
  { id:2, name:"Mini Boston Bleu Denim", nameEn:"Mini Boston Denim Blue", brand:"Coach", price:25000,
    cat:"Sacs à main", catEn:"Handbags", stock:2, isNew:true, isBest:true,
    accent:["#A8C4D8","#5A8FAA"],
    imgs:["https://i.ibb.co/v4XQcD1Z/d3766d6c-cc2d-4fe4-ae36-128d07fbb530.jpg"],
    desc:"Mini Boston Coach en denim bleu ciel, look estival et frais. Bandoulière incluse.",
    descEn:"Coach mini Boston in sky blue denim, fresh summer vibe. Strap included." },
  { id:3, name:"Coach Torry Camel", nameEn:"Coach Torry Camel", brand:"Coach", price:22000,
    cat:"Bandoulières", catEn:"Shoulder bags", stock:4, isNew:false, isBest:true,
    accent:["#C49060","#8B5E30"],
    imgs:["https://i.ibb.co/rKMpTt3v/4ab98af4-0144-4abe-afd8-ae9e7001e0c8.jpg"],
    desc:"Sac Torry Coach monogrammé camel et cognac, chaîne dorée, look baguette très tendance.",
    descEn:"Coach Torry monogram bag in camel and cognac, gold chain, trendy baguette look." },
  { id:4, name:"Coach Torry — 4 coloris", nameEn:"Coach Torry — 4 colors", brand:"Coach", price:22000,
    cat:"Bandoulières", catEn:"Shoulder bags", stock:6, isNew:false, isBest:false,
    accent:["#3A3530","#C49060"],
    imgs:["https://i.ibb.co/nNPrjH0V/3edfe0d8-9988-4d70-adb8-bfea6d9a4c0c.jpg"],
    desc:"Sac Torry Coach disponible en 4 coloris : camel, beige, noir et camel/blanc. Précisez votre couleur.",
    descEn:"Coach Torry bag in 4 colors: camel, beige, black & camel/white. Specify your color." },
  { id:5, name:"Mini Boston Beige & Blanc", nameEn:"Mini Boston Beige & White", brand:"Coach", price:24000,
    cat:"Sacs à main", catEn:"Handbags", stock:5, isNew:true, isBest:false,
    accent:["#E8DFC8","#C8B89A"],
    imgs:["https://i.ibb.co/0yZqtSWT/0eeb033d-192f-45d6-8e60-480ff04c63ea.jpg"],
    desc:"Mini Boston Coach beige signature avec anses blanches, ultra élégant et polyvalent.",
    descEn:"Coach signature beige mini Boston with white handles, ultra elegant and versatile." },
  { id:6, name:"Tabby Coach — 8 coloris", nameEn:"Tabby Coach — 8 colors", brand:"Coach", price:35000,
    cat:"Bandoulières", catEn:"Shoulder bags", stock:8, isNew:true, isBest:true,
    accent:["#2A2A2A","#8B1A1A"],
    imgs:["https://i.ibb.co/nNPrjH0V/3edfe0d8-9988-4d70-adb8-bfea6d9a4c0c.jpg"],
    desc:"L'iconique Tabby Coach matelassé, chaîne dorée. 8 coloris disponibles. Précisez votre choix.",
    descEn:"The iconic quilted Coach Tabby, gold chain. 8 colors available. Specify your choice." },
];

const DEMO_ORDERS_TRACK = {
  "DD-001":{ status:1, name:"Awa Traoré",   items:["Mini Boston Rose x1"],             total:25000, date:"10/06/2025" },
  "DD-002":{ status:2, name:"Fatou Diallo", items:["Mini Boston Bleu Denim x2"],        total:50000, date:"12/06/2025" },
  "DD-003":{ status:3, name:"Mariam Koné",  items:["Coach Torry Camel x1","Tabby x1"], total:57000, date:"08/06/2025" },
};

/* ═══════════════════════════════════════
   🌍 TRADUCTIONS
   ═══════════════════════════════════════ */
const T = {
  fr: {
    search:"Que recherchez-vous ?", cart:"Mon panier", empty:"Votre panier est vide.",
    emptyHint:"Découvrez notre sélection 👜", order:"Commander", total:"Total",
    finalize:"Finaliser la commande", name:"Nom complet *", phone:"Téléphone (WhatsApp) *",
    city:"Ville *", district:"Quartier / adresse", payment:"Mode de règlement",
    orange:"Orange Money", moov:"Moov Money", wave:"Wave", delivery:"Paiement à la livraison",
    deliverySub:"Vous payez à réception", send:"Envoyer sur WhatsApp",
    sent:"Commande envoyée !", sentMsg:"Votre commande s'ouvre dans WhatsApp.",
    capture:"N'oubliez pas d'envoyer votre capture de paiement.",
    locMsg:"📍 Envoyez votre localisation WhatsApp pour estimer les frais de livraison.",
    shippingNote:"Frais de livraison selon votre zone. Livraison offerte dès",
    close:"Fermer", inStock:"En stock", outStock:"Épuisé", lowStock:"Plus que",
    newBadge:"Nouveau", bestSeller:"Sélection", noResult:"Aucun article trouvé.",
    noResultHint:"Essayez un autre mot ou une autre catégorie.",
    trackOrder:"Suivre ma commande", trackTitle:"Suivi de commande",
    trackBtn:"Rechercher", trackNotFound:"Commande introuvable.",
    statusPrep:"Préparation", statusShip:"Expédiée", statusDeliv:"Livrée",
    comment:"Laisser un avis", commentSend:"Envoyer",
    freeShip:"Livraison offerte dès", addCart:"Ajouter au panier",
    filterAll:"Tout", sortNew:"Nouveautés", sortAsc:"Prix croissant", sortDesc:"Prix décroissant",
    itemCount:"article", lang:"EN", contactUs:"Nous contacter",
    discover:"Découvrir la collection", heroTitle:"L'élégance, livrée chez vous.",
    heroSub:"Sacs & accessoires Coach sélectionnés avec soin, livrés à",
    menuTitle:"Collections", home:"Accueil", catalogue:"Catalogue", about:"À propos",
  },
  en: {
    search:"What are you looking for?", cart:"My bag", empty:"Your bag is empty.",
    emptyHint:"Discover our selection 👜", order:"Checkout", total:"Total",
    finalize:"Finalize order", name:"Full name *", phone:"Phone (WhatsApp) *",
    city:"City *", district:"Neighbourhood / address", payment:"Payment method",
    orange:"Orange Money", moov:"Moov Money", wave:"Wave", delivery:"Pay on delivery",
    deliverySub:"You pay upon receipt", send:"Send via WhatsApp",
    sent:"Order sent!", sentMsg:"Your order opens in WhatsApp.",
    capture:"Don't forget to send your payment screenshot.",
    locMsg:"📍 Send your WhatsApp location for delivery fee estimate.",
    shippingNote:"Delivery fees apply. Free delivery from",
    close:"Close", inStock:"In stock", outStock:"Sold out", lowStock:"Only",
    newBadge:"New", bestSeller:"Selection", noResult:"No items found.",
    noResultHint:"Try another word or category.",
    trackOrder:"Track order", trackTitle:"Order tracking",
    trackBtn:"Search", trackNotFound:"Order not found.",
    statusPrep:"Preparing", statusShip:"Shipped", statusDeliv:"Delivered",
    comment:"Leave a review", commentSend:"Send",
    freeShip:"Free delivery from", addCart:"Add to bag",
    filterAll:"All", sortNew:"New arrivals", sortAsc:"Price: low to high", sortDesc:"Price: high to low",
    itemCount:"item", lang:"FR", contactUs:"Contact us",
    discover:"Discover the collection", heroTitle:"Elegance, delivered to you.",
    heroSub:"Carefully selected Coach bags & accessories, delivered in",
    menuTitle:"Collections", home:"Home", catalogue:"Catalogue", about:"About",
  },
};

/* ═══════════════════════════════════════
   🎨 STYLES PARTAGÉS
   ═══════════════════════════════════════ */
const sheetStyle = dark => ({
  background: dark ? C.dCard : "#fff",
  borderRadius: 18, padding: 20, position: "relative",
  boxShadow: "0 24px 56px rgba(0,0,0,.22)"
});
const closeBtnStyle = dark => ({
  position:"absolute", top:12, right:12, width:30, height:30,
  borderRadius:999, border:"none",
  background: dark ? C.dBorder : C.creamD,
  cursor:"pointer", display:"grid", placeItems:"center",
  color: dark ? C.dText : C.ink, zIndex:2
});
const stepBtnStyle = dark => ({
  width:32, height:36, border:"none",
  background: dark ? C.dBorder : C.creamD,
  cursor:"pointer", display:"grid", placeItems:"center",
  color: dark ? C.dText : C.ink
});
const stepBtnSmStyle = dark => ({
  width:24, height:24, border:"none",
  background: dark ? C.dBorder : C.creamD,
  cursor:"pointer", display:"grid", placeItems:"center",
  color: dark ? C.dText : C.ink
});
const primaryBtn = {
  display:"inline-flex", alignItems:"center", gap:7,
  background: C.ink, color: C.gold,
  border:`1px solid ${C.gold}44`,
  borderRadius:10, padding:"11px 18px",
  fontWeight:700, fontSize:13.5, cursor:"pointer"
};
const secondaryBtn = dark => ({
  display:"inline-flex", alignItems:"center", gap:7,
  background:"none", color: dark ? C.dText : C.ink,
  border:`1px solid ${dark ? C.dBorder : C.border}`,
  borderRadius:10, padding:"11px 16px",
  fontWeight:600, fontSize:13.5, cursor:"pointer"
});
const iconBtn = dark => ({
  width:32, height:32, borderRadius:8,
  border:`1px solid ${dark ? C.dBorder : C.border}`,
  background:"none", cursor:"pointer",
  display:"grid", placeItems:"center",
  color: dark ? C.dText : C.ink
});
const inpStyle = dark => ({
  width:"100%", padding:"9px 11px", borderRadius:9,
  border:`1.5px solid ${dark ? C.dBorder : C.border}`,
  background: dark ? C.dCard : "#fff",
  fontSize:"16px", color: dark ? C.dText : C.ink,
  fontFamily:"inherit"
});

/* ═══════════════════════════════════════
   🔧 COMPOSANTS UTILITAIRES
   ═══════════════════════════════════════ */
const Field = ({ label, children, dark, flex }) => (
  <label style={{ display:"block", marginBottom:10, flex:flex?1:"none" }}>
    <span style={{ fontSize:11.5, fontWeight:600, color: dark ? C.dText : C.ink, display:"block", marginBottom:4 }}>{label}</span>
    {children}
  </label>
);

const Badge = ({ children, color }) => (
  <span style={{ background:`${color}22`, color, fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:999, border:`1px solid ${color}44` }}>
    {children}
  </span>
);

const StatCard = ({ icon, value, label, color, dark }) => (
  <div style={{ background: dark ? CA.dCard : CA.card, border:`1px solid ${dark ? CA.dBorder : CA.border}`, borderRadius:14, padding:"18px 18px" }}>
    <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, display:"grid", placeItems:"center", marginBottom:12 }}>
      {icon}
    </div>
    <div style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:700, color: dark ? CA.dText : CA.ink }}>{value}</div>
    <div style={{ fontSize:12.5, color: dark ? CA.dMute : CA.mute, marginTop:3 }}>{label}</div>
  </div>
);

function LogoDD({ size = 44 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.22, background:C.cream, border:`1.5px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", boxShadow:`0 2px 8px rgba(201,168,76,.2)`, flexShrink:0 }}>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", display:"flex", alignItems:"center" }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:size*0.38, fontWeight:700, color:C.ink, lineHeight:1 }}>D</span>
        <span style={{ fontFamily:"Georgia,serif", fontSize:size*0.38, fontWeight:700, color:C.gold, lineHeight:1 }}>D</span>
      </div>
    </div>
  );
}

function Thumb({ p, idx = 0 }) {
  if (p?.imgs?.[idx]) return (
    <img src={p.imgs[idx]} alt={p.name}
      style={{ width:"100%", height:"100%", objectFit:"cover" }}
      onError={e => e.target.style.display="none"} />
  );
  return (
    <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg,${p?.accent?.[0]||"#ccc"},${p?.accent?.[1]||"#999"})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <ShoppingBag size={44} color="rgba(255,255,255,.7)" strokeWidth={1.2} />
    </div>
  );
}

function Carousel({ p }) {
  const [idx, setIdx] = useState(0);
  const total = Math.max(p.imgs?.length || 1, 1);
  const arrowBtnStyle = side => ({
    position:"absolute", top:"50%", [side]:8, transform:"translateY(-50%)",
    width:28, height:28, borderRadius:999, border:"none",
    background:"rgba(255,255,255,.9)", cursor:"pointer", display:"grid", placeItems:"center"
  });
  return (
    <div style={{ position:"relative", aspectRatio:"4/3", borderRadius:12, overflow:"hidden", background:C.creamD }}>
      <Thumb p={p} idx={idx} />
      {total > 1 && (<>
        <button onClick={() => setIdx(i => (i - 1 + total) % total)} style={arrowBtnStyle("left")}><ChevronLeft size={16}/></button>
        <button onClick={() => setIdx(i => (i + 1) % total)} style={arrowBtnStyle("right")}><ChevronRight size={16}/></button>
        <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", display:"flex", gap:4 }}>
          {Array.from({length:total}).map((_,i) => (
            <div key={i} onClick={() => setIdx(i)} style={{ width:i===idx?14:5, height:5, borderRadius:99, background:i===idx?C.gold:"rgba(255,255,255,.5)", cursor:"pointer", transition:"all .2s" }}/>
          ))}
        </div>
      </>)}
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:14, animation:"ddFade .22s ease" }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   🛍 CARTE PRODUIT
   ═══════════════════════════════════════ */
function ProductCard({ p, t, onOpen, onAdd, dark, idx, mounted }) {
  const [fav, setFav] = useState(false);
  const out = p.stock === 0, low = p.stock > 0 && p.stock <= 2;
  const bg = dark ? C.dCard : C.card;
  const bord = dark ? C.dBorder : C.border;
  const text = dark ? C.dText : C.ink;
  const displayPrice = p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;

  return (
    <div onClick={() => onOpen(p)} className="dd-card"
      style={{ background:bg, borderRadius:16, overflow:"hidden", border:`1px solid ${bord}`, cursor:"pointer", opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(12px)", transition:`opacity .5s ${idx*40}ms, transform .5s ${idx*40}ms, box-shadow .2s` }}>
      <div style={{ position:"relative", aspectRatio:"1/1", background: dark ? "#1A1510" : C.creamD }}>
        <Thumb p={p}/>
        <div style={{ position:"absolute", top:8, left:8, display:"flex", flexDirection:"column", gap:3 }}>
          {p.isNew && <span style={{ background:C.ink, color:C.gold, fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:999, letterSpacing:.8, border:`1px solid ${C.gold}44` }}>{t.newBadge.toUpperCase()}</span>}
          {p.isBest && <span style={{ background:C.gold, color:C.ink, fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:999 }}>✦ TOP</span>}
        </div>
        {out && <span style={{ position:"absolute", top:8, right:8, background:"rgba(26,26,26,.85)", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>{t.outStock.toUpperCase()}</span>}
        {low && !out && <span style={{ position:"absolute", top:8, right:8, background:C.gold, color:C.ink, fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>{t.lowStock} {p.stock}!</span>}
        <button onClick={e => { e.stopPropagation(); setFav(v => !v); }}
          style={{ position:"absolute", bottom:8, right:8, width:28, height:28, borderRadius:999, border:"none", background:"rgba(255,255,255,.92)", display:"grid", placeItems:"center", cursor:"pointer" }}>
          <Heart size={13} color={fav ? C.gold : "#bbb"} fill={fav ? C.gold : "none"}/>
        </button>
      </div>
      <div style={{ padding:"11px 13px 14px" }}>
        <div style={{ fontSize:9.5, fontWeight:700, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:3 }}>{p.brand}</div>
        <div style={{ fontFamily:"Georgia,serif", fontWeight:400, color:text, fontSize:13.5, lineHeight:1.3, marginBottom:4 }}>{p.name}</div>
        <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:7 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{ fontSize:11, color: s <= (p.rating || 4) ? C.gold : (dark ? "#3A2E20" : "#ddd") }}>★</span>
          ))}
          <span style={{ fontSize:10.5, color: dark ? C.dMute : C.mute, marginLeft:2 }}>({p.reviews || 12})</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            {p.discount > 0 && <span style={{ fontSize:11, color: dark ? C.dMute : C.mute, textDecoration:"line-through", display:"block" }}>{fcfa(p.price)}</span>}
            <span style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:14, color: p.discount > 0 ? "#E05030" : text }}>{fcfa(displayPrice)}</span>
            {p.discount > 0 && <span style={{ fontSize:10, background:"#E05030", color:"#fff", padding:"2px 6px", borderRadius:999, marginLeft:6, fontWeight:700 }}>-{p.discount}%</span>}
          </div>
          <button disabled={out} onClick={e => { e.stopPropagation(); onAdd(p); }}
            style={{ width:32, height:32, borderRadius:9, border:"none", background: out ? "#ddd" : C.ink, color: out ? "#999" : C.gold, cursor: out ? "not-allowed" : "pointer", display:"grid", placeItems:"center" }}>
            <Plus size={16}/>
          </button>
        </div>
        <button onClick={e => {
          e.stopPropagation();
          const msg = `👜 ${p.name} — ${fcfa(displayPrice)} chez Dada's Drop ! 🛍️ Commande sur dadas-drop.vercel.app`;
          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
        }} style={{ width:"100%", marginTop:6, padding:"6px", border:`1px solid ${dark ? C.dBorder : C.border}`, borderRadius:8, background:"none", color: dark ? C.dMute : C.mute, cursor:"pointer", fontSize:11.5, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <MessageCircle size={12}/> Partager
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   🔍 FICHE PRODUIT (Modal)
   ═══════════════════════════════════════ */
function ProductModal({ p, t, onClose, onAdd, dark }) {
  const [qty, setQty] = useState(1);
  if (!p) return null;
  const out = p.stock === 0;
  const text = dark ? C.dText : C.ink;
  const displayPrice = p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:480, width:"100%" }} onClick={e => e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"90vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          <Carousel p={p}/>
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{p.brand}</div>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:22, color:text, margin:"0 0 4px" }}>{p.name}</h3>
            <div style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:20, color: p.discount > 0 ? "#E05030" : C.gold, margin:"0 0 6px" }}>{fcfa(displayPrice)}</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
              <div style={{ display:"flex", gap:2 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize:16, color: s <= (p.rating || 4) ? C.gold : (dark ? "#3A2E20" : "#ddd") }}>★</span>
                ))}
              </div>
              <span style={{ fontSize:13, color: dark ? C.dMute : C.mute }}>{p.reviews || 12} avis</span>
              <span style={{ marginLeft:"auto", fontSize:12, color: dark ? C.dMute : C.mute }}>👁️ {Math.floor(Math.random() * 30) + 5} personnes regardent</span>
            </div>
            {p.discount > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontFamily:"Georgia,serif", fontSize:16, color: dark ? C.dMute : C.mute, textDecoration:"line-through" }}>{fcfa(p.price)}</span>
                <span style={{ background:"#E05030", color:"#fff", fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:999 }}>-{p.discount}%</span>
              </div>
            )}
            <p style={{ color: dark ? C.dMute : C.mute, fontSize:13.5, lineHeight:1.6, margin:"0 0 12px" }}>{p.desc}</p>
            <div style={{ fontSize:12, color: out ? "#999" : C.success, fontWeight:600, marginBottom:14 }}>
              {out ? t.outStock : `${t.inStock} · ${p.stock} disponible${p.stock > 1 ? "s" : ""}`}
            </div>
            {!out && (
              <div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", border:`1px solid ${dark ? C.dBorder : C.border}`, borderRadius:9, overflow:"hidden" }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={stepBtnStyle(dark)}><Minus size={13}/></button>
                    <span style={{ width:32, textAlign:"center", fontWeight:700, color:text, fontSize:14 }}>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(p.stock, q + 1))} style={stepBtnStyle(dark)}><Plus size={13}/></button>
                  </div>
                  <button onClick={() => { onAdd(p, qty); onClose(); }} style={{ flex:1, ...primaryBtn, justifyContent:"center" }}>
                    <ShoppingBag size={15}/> {t.addCart}
                  </button>
                </div>
                <button onClick={() => {
                  const msg = `👜 ${p.name} — ${fcfa(displayPrice)} chez Dada's Drop ! 🛍️ dadas-drop.vercel.app`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                }} style={{ width:"100%", marginTop:10, padding:"10px", border:`1px solid ${dark ? C.dBorder : C.border}`, borderRadius:10, background:"none", color:"#25D366", cursor:"pointer", fontSize:13.5, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                  <MessageCircle size={16}/> Partager sur WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════
   🛒 PANIER
   ═══════════════════════════════════════ */
function CartDrawer({ open, cart, products, onClose, onQty, onRemove, onCheckout, t, dark }) {
  const lines = cart.map(it => ({ ...products.find(p => p.id === it.id), qty:it.qty })).filter(l => l.id);
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const bg = dark ? C.dCard : "#fff";
  const bord = dark ? C.dBorder : C.border;
  const text = dark ? C.dText : C.ink;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:60, opacity:open?1:0, pointerEvents:open?"auto":"none", transition:"opacity .3s" }}/>
      <aside style={{ position:"fixed", top:0, right:0, height:"100%", width:"min(380px,90vw)", background:bg, zIndex:61, transform:open?"translateX(0)":"translateX(105%)", transition:"transform .35s cubic-bezier(.2,.8,.2,1)", display:"flex", flexDirection:"column", boxShadow:"-8px 0 32px rgba(0,0,0,.15)" }}>
        <div style={{ padding:"16px 18px", borderBottom:`1px solid ${bord}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"Georgia,serif", fontSize:17, color:text }}>{t.cart}</span>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:text }}><X size={20}/></button>
        </div>
        {total >= CFG.freeFrom && (
          <div style={{ background:C.ink, color:C.gold, padding:"7px 16px", fontSize:12, fontWeight:600, textAlign:"center", letterSpacing:.5 }}>
            ✦ Livraison offerte pour cette commande
          </div>
        )}
        <div style={{ flex:1, overflowY:"auto", padding:14 }}>
          {lines.length === 0 ? (
            <div style={{ textAlign:"center", color: dark ? C.dMute : "#bbb", marginTop:50 }}>
              <ShoppingBag size={38} strokeWidth={1.2}/>
              <p style={{ marginTop:10, fontSize:13.5 }}>{t.empty}<br/>{t.emptyHint}</p>
            </div>
          ) : lines.map(l => (
            <div key={l.id} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:`1px solid ${bord}` }}>
              <div style={{ width:58, height:58, borderRadius:9, overflow:"hidden", flexShrink:0 }}><Thumb p={l}/></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"Georgia,serif", fontSize:13, color:text, marginBottom:2 }}>{l.name}</div>
                <div style={{ fontSize:12.5, color:C.gold, fontWeight:700 }}>{fcfa(l.price)}</div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:5 }}>
                  <div style={{ display:"flex", alignItems:"center", border:`1px solid ${bord}`, borderRadius:7 }}>
                    <button onClick={() => onQty(l.id, l.qty - 1)} style={stepBtnSmStyle(dark)}><Minus size={11}/></button>
                    <span style={{ width:22, textAlign:"center", fontSize:12, fontWeight:700, color:text }}>{l.qty}</span>
                    <button onClick={() => onQty(l.id, Math.min(l.stock, l.qty + 1))} style={stepBtnSmStyle(dark)}><Plus size={11}/></button>
                  </div>
                  <button onClick={() => onRemove(l.id)} style={{ border:"none", background:"none", cursor:"pointer", color:"#bbb" }}><Trash2 size={13}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div style={{ padding:16, borderTop:`1px solid ${bord}` }}>
            {total < CFG.freeFrom && <p style={{ fontSize:11, color:C.mute, margin:"0 0 8px" }}>Livraison offerte dès {fcfa(CFG.freeFrom)}</p>}
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ color: dark ? C.dMute : C.mute, fontSize:14 }}>{t.total}</span>
              <span style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:text }}>{fcfa(total)}</span>
            </div>
            <button onClick={onCheckout} style={{ width:"100%", ...primaryBtn, justifyContent:"center" }}>{t.order} <ArrowRight size={15}/></button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ═══════════════════════════════════════
   ✅ CHECKOUT — avec sauvegarde Supabase
   ═══════════════════════════════════════ */
function Checkout({ open, lines, total, onClose, t, dark, onOrderSaved }) {
  const [form, setForm] = useState({ nom:"", tel:"", ville:CFG.city, adresse:"", note:"" });
  const [pay, setPay] = useState("orange");
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orderNum] = useState(() => "DD-" + String(Math.floor(Math.random() * 9000) + 1000));
  const [copied, setCopied] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));
  const valid = form.nom.trim() && /^[0-9]{8}$/.test(form.tel.replace(/\s/g, "")) && form.ville.trim();
  if (!open) return null;
  const payLabels = { orange:t.orange, moov:t.moov, wave:t.wave, livraison:t.delivery };
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;

  const send = async () => {
    const items = lines.map(l => `• ${l.qty}x ${l.name} — ${fcfa(l.price * l.qty)}`).join("\n");
    const msg = `Bonjour ${CFG.brand} 👋\nCommande #${orderNum}\n\n${items}\n\n💰 Total : ${fcfa(total)}\n💳 Règlement : ${payLabels[pay]}\n\nNom : ${form.nom}\nTél : ${form.tel}\nVille : ${form.ville}\nAdresse : ${form.adresse || "—"}\nNote : ${form.note || "—"}\n\n📍 Je vous envoie ma localisation WhatsApp.${pay !== "livraison" ? "\n✅ Je joins la capture du paiement." : ""}`;
    window.open(`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");

    // Sauvegarder dans Supabase
    setSaving(true);
    try {
      await sb.post("orders", {
        id: orderNum,
        name: form.nom,
        phone: form.tel,
        ville: form.ville,
        quartier: form.adresse,
        note: form.note,
        items: lines.map(l => `${l.name} x${l.qty}`),
        total,
        payment: pay,
        status: 1,
        date: new Date().toISOString().split("T")[0],
      });
      if (onOrderSaved) onOrderSaved();
    } catch (err) {
      console.warn("Supabase order save failed (offline?):", err.message);
    } finally {
      setSaving(false);
    }
    setSent(true);
  };

  const copy = () => {
    navigator.clipboard?.writeText(orderNum).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:440, width:"100%" }} onClick={e => e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"90vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          {sent ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:999, background:"#E8F8EF", display:"grid", placeItems:"center", margin:"0 auto 12px" }}><Check size={24} color={C.success}/></div>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:20, color:text, margin:"0 0 6px" }}>{t.sent}</h3>
              <p style={{ color: dark ? C.dMute : C.mute, fontSize:13, lineHeight:1.5, margin:"0 0 14px" }}>{t.sentMsg}{pay !== "livraison" && ` ${t.capture}`}</p>
              <div style={{ background: dark ? "#1A1510" : C.creamD, border:`1px solid ${C.gold}33`, borderRadius:10, padding:"11px 14px", marginBottom:13 }}>
                <div style={{ fontSize:10, color: dark ? C.dMute : C.mute, marginBottom:3 }}>Numéro de commande</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ fontFamily:"Georgia,serif", fontSize:18, color:C.gold }}>{orderNum}</span>
                  <button onClick={copy} style={{ border:"none", background:"none", cursor:"pointer", color:C.gold }}>
                    {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                  </button>
                </div>
              </div>
              <button onClick={onClose} style={{ ...primaryBtn, width:"100%", justifyContent:"center" }}>{t.close}</button>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:19, color:text, margin:"0 0 4px" }}>{t.finalize}</h3>
              <p style={{ color:C.gold, fontWeight:700, fontSize:13, margin:"0 0 12px" }}>{t.total} : {fcfa(total)}</p>
              <div style={{ background: dark ? "#1A1510" : C.creamD, border:`1px solid ${bord}`, borderRadius:9, padding:"8px 11px", fontSize:11.5, color: dark ? C.dMute : C.mute, marginBottom:12 }}>
                {t.shippingNote} {fcfa(CFG.freeFrom)}.
              </div>
              <Field label={t.name} dark={dark}>
                <input style={inpStyle(dark)} value={form.nom} onChange={set("nom")} placeholder="Ex : Awa Traoré"/>
              </Field>
              <Field label={t.phone} dark={dark}>
                <input
                  style={{ ...inpStyle(dark), borderColor: form.tel && !/^[0-9]{8}$/.test(form.tel.replace(/\s/g, "")) ? "#E05030" : undefined }}
                  value={form.tel}
                  onChange={e => { const v = e.target.value.replace(/[^0-9\s]/g, ""); if (v.replace(/\s/g, "").length <= 8) set("tel")({ target:{ value:v } }); }}
                  placeholder="Ex : 70 00 00 00" inputMode="numeric" maxLength={10}
                />
                {form.tel && !/^[0-9]{8}$/.test(form.tel.replace(/\s/g, "")) && (
                  <span style={{ fontSize:11.5, color:"#E05030", marginTop:4, display:"block" }}>⚠️ Numéro valide à 8 chiffres requis</span>
                )}
              </Field>
              <div style={{ display:"flex", gap:8 }}>
                <Field label={t.city} dark={dark} flex><input style={inpStyle(dark)} value={form.ville} onChange={set("ville")}/></Field>
                <Field label={t.district} dark={dark} flex><input style={inpStyle(dark)} value={form.adresse} onChange={set("adresse")} placeholder="Ex : Karpala"/></Field>
              </div>
              <div style={{ fontSize:11.5, color:C.gold, fontWeight:600, marginBottom:10 }}>{t.locMsg}</div>
              <div style={{ fontSize:12.5, fontWeight:700, color:text, margin:"6px 0 7px" }}>{t.payment}</div>
              {[
                { key:"orange", icon:<Smartphone size={15} color="#FF6A00"/>, title:t.orange, sub:CFG.orangeMoney },
                { key:"moov",   icon:<Smartphone size={15} color="#0066B3"/>, title:t.moov,   sub:CFG.moovMoney },
                { key:"wave",   icon:<Smartphone size={15} color="#1DC0D4"/>, title:t.wave,   sub:CFG.wave },
                { key:"livraison", icon:<Truck size={15} color={C.gold}/>, title:t.delivery, sub:t.deliverySub },
              ].map(({ key, icon, title, sub }) => (
                <button key={key} onClick={() => setPay(key)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 11px", marginBottom:6, borderRadius:10, cursor:"pointer", textAlign:"left", border:`1.5px solid ${pay===key ? C.gold : bord}`, background: pay===key ? (dark ? "#1A1510" : C.creamD) : (dark ? C.dCard : "#fff") }}>
                  <span style={{ width:30, height:30, borderRadius:7, background: dark ? C.dBorder : C.creamD, display:"grid", placeItems:"center" }}>{icon}</span>
                  <span style={{ flex:1 }}>
                    <span style={{ display:"block", fontWeight:700, fontSize:13, color:text }}>{title}</span>
                    <span style={{ display:"block", fontSize:11, color: dark ? C.dMute : C.mute }}>{sub}</span>
                  </span>
                  <span style={{ width:16, height:16, borderRadius:999, border:`2px solid ${pay===key ? C.gold : bord}`, display:"grid", placeItems:"center" }}>
                    {pay === key && <span style={{ width:8, height:8, borderRadius:999, background:C.gold }}/>}
                  </span>
                </button>
              ))}
              <button onClick={send} disabled={!valid || saving}
                style={{ width:"100%", marginTop:12, justifyContent:"center", background:"#25D366", color:"#fff", border:"none", borderRadius:10, padding:"12px", fontWeight:700, fontSize:14, cursor: valid && !saving ? "pointer" : "not-allowed", display:"flex", alignItems:"center", gap:7, opacity: valid && !saving ? 1 : .5 }}>
                <MessageCircle size={16}/> {saving ? "Enregistrement…" : t.send}
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════
   📦 SUIVI COMMANDE
   ═══════════════════════════════════════ */
function TrackModal({ open, onClose, t, dark }) {
  const [num, setNum] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(false);
  if (!open) return null;
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  const steps = [t.statusPrep, t.statusShip, t.statusDeliv];
  const icons = [<Package size={13}/>, <Truck size={13}/>, <MapPin size={13}/>];

  const track = async () => {
    setLoading(true);
    setResult(null);
    setNotFound(false);
    const upper = num.toUpperCase().trim();
    // 1. Chercher dans Supabase
    try {
      const rows = await sb.get("orders", `?id=eq.${upper}&select=*`);
      if (rows && rows.length > 0) {
        setResult(rows[0]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Supabase track error:", err.message);
    }
    // 2. Fallback démo
    const demo = DEMO_ORDERS_TRACK[upper];
    if (demo) { setResult(demo); } else { setNotFound(true); }
    setLoading(false);
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:420, width:"100%" }} onClick={e => e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"88vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:19, color:text, margin:"0 0 14px" }}>{t.trackTitle}</h3>
          <div style={{ display:"flex", gap:7 }}>
            <input value={num} onChange={e => setNum(e.target.value)} placeholder="Ex : DD-001"
              style={{ ...inpStyle(dark), flex:1 }} onKeyDown={e => e.key === "Enter" && track()}/>
            <button onClick={track} style={{ ...primaryBtn, padding:"9px 14px" }}>
              {loading ? "…" : t.trackBtn}
            </button>
          </div>
          {notFound && <p style={{ color:C.danger, fontSize:12.5, marginTop:8 }}>{t.trackNotFound}</p>}
          {result && (
            <div style={{ marginTop:16 }}>
              <div style={{ background: dark ? "#1A1510" : C.creamD, border:`1px solid ${C.gold}33`, borderRadius:11, padding:"11px 13px", marginBottom:14 }}>
                <div style={{ fontFamily:"Georgia,serif", fontWeight:700, color:text, marginBottom:3 }}>#{num.toUpperCase()}</div>
                {(result.items || []).map((item, i) => (
                  <div key={i} style={{ fontSize:12.5, color: dark ? C.dMute : C.mute }}>• {item}</div>
                ))}
                <div style={{ fontSize:13, color:C.gold, fontWeight:700, marginTop:5 }}>{fcfa(result.total)}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", position:"relative", marginBottom:14 }}>
                <div style={{ position:"absolute", top:14, left:"10%", right:"10%", height:2, background: dark ? C.dBorder : C.border, zIndex:0 }}>
                  <div style={{ height:"100%", width:`${((result.status - 1) / 2) * 100}%`, background:GRAD, borderRadius:99, transition:"width .6s" }}/>
                </div>
                {steps.map((s, i) => {
                  const done = i < result.status, active = i === result.status - 1;
                  return (
                    <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, zIndex:1, flex:1 }}>
                      <div style={{ width:28, height:28, borderRadius:999, background: done ? C.ink : (dark ? C.dBorder : C.border), display:"grid", placeItems:"center", border: done ? `2px solid ${C.gold}` : "none", boxShadow: active ? `0 0 0 4px ${C.gold}33` : "none" }}>
                        <span style={{ color: done ? C.gold : "#bbb" }}>{icons[i]}</span>
                      </div>
                      <span style={{ fontSize:10, fontWeight: active ? 700 : 400, color: done ? text : "#bbb", textAlign:"center" }}>{s}</span>
                    </div>
                  );
                })}
              </div>
              {result.status === 3 && (
                commentSent ? (
                  <div style={{ display:"flex", alignItems:"center", gap:7, color:C.success, fontSize:13, fontWeight:600 }}><CheckCircle size={16}/> Merci pour votre avis ✦</div>
                ) : (
                  <>
                    <div style={{ fontSize:12.5, fontWeight:700, color:text, marginBottom:5 }}>{t.comment}</div>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ ...inpStyle(dark), resize:"vertical" }}/>
                    <button onClick={() => setCommentSent(true)} disabled={!comment.trim()}
                      style={{ ...primaryBtn, marginTop:7, width:"100%", justifyContent:"center", opacity: comment.trim() ? 1 : .5 }}>
                      <Star size={14}/> {t.commentSend}
                    </button>
                  </>
                )
              )}
              <p style={{ fontSize:11, color: dark ? C.dMute : "#bbb", marginTop:12, textAlign:"center" }}>Essayez DD-001, DD-002 ou DD-003 pour la démo</p>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════
   🔍 FILTRE (Bottom Sheet Mobile)
   ═══════════════════════════════════════ */
function FilterPanel({ CATS, cat, setCat, sort, setSort, inStock, setInStock, minPrice, setMinPrice, maxPrice, setMaxPrice, lang, dark, text, bord }) {
  const [open, setOpen] = useState(false);
  const activeFilters = (cat > 0 ? 1 : 0) + (inStock ? 1 : 0) + (minPrice || maxPrice ? 1 : 0) + (sort !== "new" ? 1 : 0);

  // Scroll lock quand filtre ouvert
  useEffect(() => {
    if (open) {
      document.body.classList.add("filter-open");
    } else {
      document.body.classList.remove("filter-open");
    }
    return () => document.body.classList.remove("filter-open");
  }, [open]);

  const closeFilter = () => setOpen(false);

  return (
    <>
      <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"center" }}>
        <button onClick={() => setOpen(true)} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:10, border:`1.5px solid ${activeFilters > 0 ? C.gold : bord}`, background: activeFilters > 0 ? C.ink : (dark ? C.dCard : "#fff"), color: activeFilters > 0 ? C.gold : text, cursor:"pointer", fontSize:13.5, fontWeight:600 }}>
          <Filter size={15}/> {lang === "fr" ? "Filtrer" : "Filter"}
          {activeFilters > 0 && <span style={{ background:C.gold, color:C.ink, fontSize:10, fontWeight:800, width:18, height:18, borderRadius:999, display:"grid", placeItems:"center" }}>{activeFilters}</span>}
        </button>
        {cat > 0 && (
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:999, background:`${C.gold}18`, border:`1px solid ${C.gold}44`, fontSize:12.5, color:C.gold, fontWeight:600 }}>
            {CATS[cat]}
            <button onClick={() => setCat(0)} style={{ border:"none", background:"none", cursor:"pointer", color:C.gold, padding:0, lineHeight:1 }}><X size={12}/></button>
          </div>
        )}
        {(minPrice || maxPrice) && (
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:999, background:`${C.gold}18`, border:`1px solid ${C.gold}44`, fontSize:12.5, color:C.gold, fontWeight:600 }}>
            Budget
            <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} style={{ border:"none", background:"none", cursor:"pointer", color:C.gold, padding:0 }}><X size={12}/></button>
          </div>
        )}
      </div>
      {open && <div onClick={closeFilter} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:60, animation:"ddFade .2s ease" }}/>}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background: dark ? C.dCard : "#fff", zIndex:61, borderRadius:"20px 20px 0 0", padding:"0 0 40px", transform: open ? "translateY(0)" : "translateY(105%)", transition:"transform .35s cubic-bezier(.2,.8,.2,1)", maxHeight:"80vh", overflowY:"auto", boxShadow:"0 -8px 32px rgba(0,0,0,.2)" }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
          <div style={{ width:40, height:4, borderRadius:99, background: dark ? C.dBorder : C.border }}/>
        </div>
        <div style={{ padding:"14px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"Georgia,serif", fontSize:17, color:text }}>{lang === "fr" ? "Filtres" : "Filters"}</span>
          <div style={{ display:"flex", gap:8 }}>
            {activeFilters > 0 && <button onClick={() => { setCat(0); setSort("new"); setInStock(false); setMinPrice(""); setMaxPrice(""); }} style={{ fontSize:12.5, color:C.gold, background:"none", border:"none", cursor:"pointer" }}>{lang === "fr" ? "Tout effacer" : "Clear all"}</button>}
            <button onClick={closeFilter} style={{ border:"none", background:"none", cursor:"pointer", color:text }}><X size={20}/></button>
          </div>
        </div>
        <div style={{ padding:"16px 20px" }}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color: dark ? C.dMute : C.mute, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>{lang === "fr" ? "Catégorie" : "Category"}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {CATS.map((c, i) => {
                const soon = i >= 4, active = cat === i;
                return (
                  <button key={c} onClick={() => setCat(i)} style={{ padding:"8px 14px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", border:`1.5px solid ${active ? C.gold : bord}`, background: active ? C.ink : (dark ? C.dCard : "#fff"), color: active ? C.gold : text, opacity: soon ? .6 : 1 }}>
                    {c}{soon && <span style={{ fontSize:9, marginLeft:4, opacity:.6 }}>· {lang === "fr" ? "bientôt" : "soon"}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color: dark ? C.dMute : C.mute, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>{lang === "fr" ? "Trier par" : "Sort by"}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {[["new", lang === "fr" ? "Nouveautés" : "New arrivals"], ["asc", lang === "fr" ? "Prix croissant" : "Price: low to high"], ["desc", lang === "fr" ? "Prix décroissant" : "Price: high to low"]].map(([val, label]) => (
                <button key={val} onClick={() => setSort(val)} style={{ padding:"8px 14px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", border:`1.5px solid ${sort === val ? C.gold : bord}`, background: sort === val ? C.ink : (dark ? C.dCard : "#fff"), color: sort === val ? C.gold : text }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <button onClick={() => setInStock(v => !v)} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:10, cursor:"pointer", fontSize:13.5, fontWeight:600, border:`1.5px solid ${inStock ? C.gold : bord}`, background: inStock ? (dark ? "#1A1510" : C.creamD) : (dark ? C.dCard : "#fff"), color:text, width:"100%" }}>
              <span style={{ width:20, height:20, borderRadius:5, border:`2px solid ${inStock ? C.gold : (dark ? C.dBorder : "#ddd")}`, background: inStock ? C.gold : "transparent", display:"grid", placeItems:"center", flexShrink:0 }}>
                {inStock && <Check size={12} color={C.ink}/>}
              </span>
              {lang === "fr" ? "En stock uniquement" : "In stock only"}
            </button>
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color: dark ? C.dMute : C.mute, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Budget (FCFA)</div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" style={{ flex:1, padding:"10px 12px", borderRadius:9, border:`1.5px solid ${minPrice ? C.gold : bord}`, background: dark ? C.dCard : "#fff", fontSize:"16px", color:text, fontFamily:"inherit" }}/>
              <span style={{ color: dark ? C.dMute : C.mute }}>—</span>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" style={{ flex:1, padding:"10px 12px", borderRadius:9, border:`1.5px solid ${maxPrice ? C.gold : bord}`, background: dark ? C.dCard : "#fff", fontSize:"16px", color:text, fontFamily:"inherit" }}/>
            </div>
          </div>
          <button onClick={closeFilter} style={{ width:"100%", padding:"14px", background:C.ink, color:C.gold, border:`1px solid ${C.gold}44`, borderRadius:12, fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <Check size={16}/> {lang === "fr" ? "Appliquer les filtres" : "Apply filters"}
            {activeFilters > 0 && <span style={{ background:C.gold, color:C.ink, fontSize:11, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>{activeFilters}</span>}
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   📜 MENU LATÉRAL
   ═══════════════════════════════════════ */
function SideMenu({ open, onClose, t, lang, setLang, dark, setPage, setCat }) {
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  const CATS_MENU = lang === "fr" ? CATS_FR : CATS_EN;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:60, opacity:open?1:0, pointerEvents:open?"auto":"none", transition:"opacity .3s" }}/>
      <div style={{ position:"fixed", top:0, left:0, height:"100%", width:"min(320px,82vw)", background: dark ? C.dCard : "#fff", zIndex:61, transform: open ? "translateX(0)" : "translateX(-105%)", transition:"transform .35s cubic-bezier(.2,.8,.2,1)", display:"flex", flexDirection:"column", overflowY:"auto" }}>
        <div style={{ padding:"18px 20px", borderBottom:`1px solid ${bord}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <span style={{ fontFamily:"Georgia,serif", fontSize:13, fontWeight:700, color: dark ? C.dMute : C.mute, letterSpacing:1 }}>MENU</span>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:text }}><X size={20}/></button>
        </div>
        <div style={{ flex:1, padding:"20px 24px" }}>
          {[{ label:t.home, page:"home" }, { label:t.catalogue, page:"catalogue" }].map((item, i) => (
            <button key={i} onClick={() => { setPage(item.page); onClose(); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"9px 0", border:"none", background:"none", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:17, color:text, letterSpacing:.3 }}>
              {item.label}
            </button>
          ))}
          <div style={{ marginTop:16, marginBottom:8 }}>
            <span style={{ fontSize:10, fontWeight:700, color: dark ? C.dMute : C.mute, letterSpacing:2, textTransform:"uppercase" }}>Collections</span>
          </div>
          {CATS_MENU.slice(1).map((c, i) => (
            <button key={c} onClick={() => { setPage("catalogue"); setCat(i + 1); onClose(); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 0", border:"none", background:"none", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:16, color:text, letterSpacing:.3 }}>
              {c}{i >= 3 && <span style={{ fontSize:10, color: dark ? C.dMute : C.mute, marginLeft:6 }}>· bientôt</span>}
            </button>
          ))}
          <div style={{ marginTop:16 }}>
            <button onClick={() => { setPage("about"); onClose(); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"9px 0", border:"none", background:"none", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:17, color:text }}>
              {t.about}
            </button>
          </div>
        </div>
        <div style={{ padding:"16px 24px", borderTop:`1px solid ${bord}`, flexShrink:0 }}>
          <button onClick={() => setLang(l => l === "fr" ? "en" : "fr")} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:`1px solid ${bord}`, borderRadius:8, padding:"8px 12px", cursor:"pointer", color:text, fontSize:13, fontWeight:600 }}>
            <Globe size={14}/> {lang === "fr" ? "Passer en anglais" : "Switch to French"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   📄 PAGE À PROPOS
   ═══════════════════════════════════════ */
function AboutPage({ dark }) {
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 20px" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <LogoDD size={64}/>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:28, color:text, margin:"16px 0 8px" }}>Dada's Drop</h1>
        <p style={{ fontSize:14, color: dark ? C.dMute : C.mute, lineHeight:1.7 }}>Collection Premium · Ouagadougou, Burkina Faso</p>
      </div>
      <div style={{ background: dark ? C.dCard : "#fff", border:`1px solid ${bord}`, borderRadius:16, padding:"24px 28px", marginBottom:16 }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:"0 0 12px" }}>Notre histoire</h2>
        <p style={{ fontSize:14, color: dark ? C.dMute : C.mute, lineHeight:1.8 }}>Dada's Drop est née d'une passion pour l'élégance accessible. Nous sélectionnons avec soin des sacs et accessoires de qualité premium, importés pour vous et livrés directement à Ouagadougou.</p>
      </div>
      <div style={{ background: dark ? C.dCard : "#fff", border:`1px solid ${bord}`, borderRadius:16, padding:"24px 28px" }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:"0 0 12px" }}>Nous contacter</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <a href={`https://wa.me/${CFG.whatsapp}`} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:10, color:"#25D366", textDecoration:"none", fontWeight:600, fontSize:14 }}>
            <MessageCircle size={18}/> WhatsApp — +{CFG.whatsapp}
          </a>
          {[
            { label:"Orange Money", val:CFG.orangeMoney },
            { label:"Moov Money",   val:CFG.moovMoney },
            { label:"Wave",         val:CFG.wave },
          ].map(({ label, val }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:10, color: dark ? C.dMute : C.mute, fontSize:14 }}>
              <Smartphone size={18}/> {label} — {val}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   📜 PAGES LÉGALES
   ═══════════════════════════════════════ */
const LEGAL_CONTENT = {
  legal: { title:"Mentions légales", content:[
    { h:"Éditeur du site", p:"Dada's Drop est une boutique en ligne de vente de sacs et accessoires de mode, basée à Ouagadougou, Burkina Faso. Responsable de publication : David Amah." },
    { h:"Hébergement", p:"Le site est hébergé par Vercel Inc., 340 Pine Street, Suite 700, San Francisco, CA 94104, États-Unis." },
    { h:"Propriété intellectuelle", p:"Tout le contenu de ce site (textes, images, logo) est la propriété exclusive de Dada's Drop. Toute reproduction est interdite sans autorisation préalable." },
    { h:"Contact", p:"Pour toute question : contactez-nous via WhatsApp au numéro indiqué sur le site." },
  ]},
  cgv: { title:"Conditions Générales de Vente", content:[
    { h:"1. Objet", p:"Les présentes CGV régissent les ventes effectuées via le site Dada's Drop." },
    { h:"2. Produits", p:"Les produits proposés sont des sacs et accessoires de mode. Dada's Drop s'engage à livrer des articles conformes à la description." },
    { h:"3. Prix", p:"Les prix sont indiqués en Francs CFA (FCFA). Dada's Drop se réserve le droit de modifier ses prix à tout moment." },
    { h:"4. Commande", p:"La commande est finalisée via WhatsApp. Elle devient effective après confirmation de notre part et réception du paiement." },
    { h:"5. Paiement", p:"Nous acceptons : Orange Money, Moov Money, Wave, et le paiement à la livraison." },
    { h:"6. Livraison", p:"Livraison assurée à Ouagadougou. Les frais de livraison sont à la charge du client selon la zone. Livraison offerte dès 20 000 FCFA d'achat." },
    { h:"7. Retours", p:"En cas de problème avec votre commande, contactez-nous dans les 24h suivant la livraison via WhatsApp." },
  ]},
  rgpd: { title:"Politique de confidentialité", content:[
    { h:"Données collectées", p:"Lors de votre commande, nous collectons : votre nom, numéro de téléphone, adresse de livraison. Ces données sont utilisées uniquement pour traiter votre commande." },
    { h:"Conservation des données", p:"Vos données sont conservées pendant la durée nécessaire au traitement de votre commande et au maximum 1 an." },
    { h:"Partage des données", p:"Vos données ne sont jamais vendues ou partagées avec des tiers, sauf aux livreurs pour assurer la livraison." },
    { h:"Vos droits", p:"Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous via WhatsApp pour exercer ces droits." },
    { h:"Cookies", p:"Ce site utilise uniquement des cookies techniques nécessaires au bon fonctionnement (panier d'achat). Aucun cookie publicitaire n'est utilisé." },
  ]},
  sav: { title:"Service Après-Vente (SAV)", content:[
    { h:"Comment nous contacter ?", p:"Notre SAV est disponible via WhatsApp 7j/7 de 8h à 20h (heure de Ouagadougou). Réponse garantie sous 2h en journée." },
    { h:"Article non conforme", p:"Si votre article ne correspond pas à la description, contactez-nous dans les 24h suivant la livraison avec des photos. Nous vous proposerons un échange ou un remboursement." },
    { h:"Retard de livraison", p:"En cas de retard, contactez-nous via WhatsApp avec votre numéro de commande. Nous vous informerons en temps réel." },
    { h:"Remboursement", p:"Les remboursements sont effectués par le même moyen de paiement utilisé lors de la commande, dans un délai de 48h." },
    { h:"Suivi de commande", p:"Utilisez le bouton 'Suivre ma commande' sur le site en entrant votre numéro de commande (format DD-XXXX)." },
  ]},
};

function LegalPage({ type, dark, setPage }) {
  const content = LEGAL_CONTENT[type];
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 20px 60px" }}>
      <button onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color: dark ? C.dMute : C.mute, fontSize:13, marginBottom:24, padding:0 }}>
        <ArrowLeft size={14}/> Retour
      </button>
      <h1 style={{ fontFamily:"Georgia,serif", fontSize:26, color:text, margin:"0 0 24px", fontWeight:400 }}>{content.title}</h1>
      {content.content.map((section, i) => (
        <div key={i} style={{ background: dark ? C.dCard : "#fff", border:`1px solid ${bord}`, borderRadius:14, padding:"20px 24px", marginBottom:14 }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, color:text, margin:"0 0 10px" }}>{section.h}</h2>
          <p style={{ fontSize:14, color: dark ? C.dMute : C.mute, lineHeight:1.8, margin:0 }}>{section.p}</p>
        </div>
      ))}
      <div style={{ background: dark ? C.dCard : "#fff", border:`1px solid ${bord}`, borderRadius:14, padding:"20px 24px", marginTop:14 }}>
        <p style={{ fontSize:13, color: dark ? C.dMute : C.mute, margin:0 }}>
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")} · Dada's Drop — Ouagadougou, Burkina Faso
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   🏢 ADMIN — ONGLET COMMANDES
   ═══════════════════════════════════════ */
function OrdersTab({ orders, setOrders, users, auth, dark, text, bord, cardBg }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(0);

  const filtered = orders.filter(o => {
    if (filterStatus > 0 && o.status !== filterStatus) return false;
    if (search && !o.name?.toLowerCase().includes(search.toLowerCase()) && !o.id?.includes(search)) return false;
    return true;
  });

  const updateStatus = async (id, status) => {
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));
    try { await sb.patch("orders", id, { status }); } catch (e) { console.warn("Supabase patch:", e.message); }
  };

  const assignDelivery = async (id, userId) => {
    const val = userId ? parseInt(userId) : null;
    setOrders(os => os.map(o => o.id === id ? { ...o, assignedTo:val } : o));
    try { await sb.patch("orders", id, { assigned_to:val }); } catch (e) { console.warn("Supabase patch:", e.message); }
  };

  const deliverers = users.filter(u => u.role === "delivery" && u.active);

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:"1 1 200px", minWidth:0 }}>
          <Search size={14} color={dark ? CA.dMute : CA.mute} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une commande…"
            style={{ width:"100%", padding:"8px 12px 8px 32px", borderRadius:9, border:`1.5px solid ${bord}`, background: dark ? CA.dCard : "#fff", fontSize:"16px", color:text, fontFamily:"inherit" }}/>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {[0,1,2,3].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ padding:"7px 13px", borderRadius:9, border:`1.5px solid ${filterStatus===s ? CA.gold : bord}`, background: filterStatus===s ? CA.ink : cardBg, color: filterStatus===s ? CA.gold : text, cursor:"pointer", fontSize:12.5, fontWeight:600 }}>
            {s === 0 ? "Toutes" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div style={{ display:"grid", gap:10 }}>
        {filtered.map(o => (
          <div key={o.id} style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:13, padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <span style={{ fontFamily:"Georgia,serif", fontWeight:700, color:text, fontSize:15 }}>#{o.id}</span>
                <span style={{ marginLeft:10, fontSize:13, color: dark ? CA.dMute : CA.mute }}>{o.date}</span>
              </div>
              <Badge color={STATUS_COLORS[o.status]}>{STATUS_LABELS[o.status]}</Badge>
            </div>
            <div style={{ fontSize:14, color:text, fontWeight:600 }}>{o.name}</div>
            <div style={{ fontSize:12.5, color: dark ? CA.dMute : CA.mute, marginBottom:4 }}>📞 {o.phone} · 📍 {o.quartier ? `${o.quartier}, ` : ""}{o.ville}</div>
            <div style={{ fontSize:12.5, color: dark ? CA.dMute : CA.mute, marginBottom:8 }}>💳 {PAYMENT_LABELS[o.payment] || o.payment}</div>
            {(o.items || []).map((item, i) => <div key={i} style={{ fontSize:13, color:text }}>• {item}</div>)}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10, flexWrap:"wrap", gap:8 }}>
              <span style={{ fontFamily:"Georgia,serif", fontWeight:700, color:CA.gold, fontSize:15 }}>{fcfa_a(o.total)}</span>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {auth.role !== "delivery" && o.status < 3 && (
                  <button onClick={() => updateStatus(o.id, o.status + 1)} style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12.5, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                    <ChevronUp size={13}/> {o.status === 1 ? "Marquer expédiée" : "Marquer livrée"}
                  </button>
                )}
                {auth.role !== "delivery" && deliverers.length > 0 && (
                  <select value={o.assignedTo || ""} onChange={e => assignDelivery(o.id, e.target.value)}
                    style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${bord}`, background: dark ? CA.dCard : "#fff", fontSize:"16px", color:text, fontFamily:"inherit", cursor:"pointer" }}>
                    <option value="">Assigner un livreur</option>
                    {deliverers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
                {o.assignedTo && (
                  <Badge color={CA.success}>🚴 {users.find(u => u.id === o.assignedTo)?.name || "Livreur"}</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 20px", color: dark ? CA.dMute : "#bbb" }}>
            <ShoppingCart size={36} strokeWidth={1.2}/>
            <p style={{ marginTop:10, fontSize:14 }}>Aucune commande trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   🏢 ADMIN — ONGLET PRODUITS
   ═══════════════════════════════════════ */
function ProductsTab({ products, setProducts, dark, text, bord, cardBg }) {
  const [editP, setEditP] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", brand:"Coach", price:"", cat:"Sacs à main", stock:"", isNew:false, isBest:false, desc:"", accent:["#C9A84C","#1A1A1A"] });
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9, border:`1.5px solid ${bord}`, background: dark ? CA.dCard : "#fff", fontSize:"16px", color:text, fontFamily:"inherit" };

  const save = async () => {
    setSaving(true);
    const catIdx = CATS_ADMIN.indexOf(form.cat);
    const catEn = catIdx >= 0 ? CATS_EN[catIdx + 1] : form.cat;
    const p = { ...form, id: editP ? editP.id : Date.now(), price: parseInt(form.price) || 0, stock: parseInt(form.stock) || 0, imgs: editP?.imgs || [], catEn, nameEn: form.name };
    if (editP) {
      setProducts(ps => ps.map(x => x.id === editP.id ? p : x));
      try { await sb.patch("products", editP.id, p); } catch (e) { console.warn("Supabase patch:", e.message); }
    } else {
      setProducts(ps => [...ps, p]);
      try { await sb.post("products", p); } catch (e) { console.warn("Supabase post:", e.message); }
    }
    setSaving(false);
    setEditP(null);
    setShowForm(false);
  };

  const del = async id => {
    if (!window.confirm("Supprimer cet article ?")) return;
    setProducts(ps => ps.filter(p => p.id !== id));
    try { await sb.delete("products", id); } catch (e) { console.warn("Supabase delete:", e.message); }
  };

  const startEdit = p => { setForm({ ...p, price:String(p.price), stock:String(p.stock) }); setEditP(p); setShowForm(true); };
  const startNew = () => { setForm({ name:"", brand:"Coach", price:"", cat:"Sacs à main", stock:"", isNew:false, isBest:false, desc:"", accent:["#C9A84C","#1A1A1A"] }); setEditP(null); setShowForm(true); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:16, color:text }}>{products.length} articles</span>
        <button onClick={startNew} style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`, borderRadius:10, padding:"9px 16px", cursor:"pointer", fontSize:13.5, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
          <PlusCircle size={15}/> Ajouter un article
        </button>
      </div>
      {showForm && (
        <div style={{ background:cardBg, border:`1px solid ${CA.gold}55`, borderRadius:14, padding:"20px", marginBottom:16 }}>
          <h4 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 16px" }}>{editP ? "Modifier l'article" : "Nouvel article"}</h4>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Nom *</span>
              <input style={inp} value={form.name || ""} onChange={setF("name")} placeholder="Ex : Mini Boston Rose"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Marque *</span>
              <input style={inp} value={form.brand || ""} onChange={setF("brand")} placeholder="Ex : Coach"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Prix (FCFA) *</span>
              <input style={inp} type="number" value={form.price || ""} onChange={setF("price")} placeholder="Ex : 25000"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Stock *</span>
              <input style={inp} type="number" value={form.stock || ""} onChange={setF("stock")} placeholder="Ex : 5"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Catégorie *</span>
              <select style={inp} value={form.cat || "Sacs à main"} onChange={setF("cat")}>
                {CATS_ADMIN.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Lien photo (URL)</span>
              <input style={inp} value={form.imgs?.[0] || ""} onChange={e => setForm(f => ({ ...f, imgs:[e.target.value] }))} placeholder="https://i.ibb.co/…"/>
            </label>
          </div>
          <label style={{ display:"block", marginBottom:10 }}>
            <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Description</span>
            <textarea style={{ ...inp, resize:"vertical" }} rows={2} value={form.desc || ""} onChange={setF("desc")}/>
          </label>
          <div style={{ display:"flex", gap:16, margin:"10px 0 14px" }}>
            <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13.5, color:text }}>
              <input type="checkbox" checked={!!form.isNew} onChange={setF("isNew")}/> Nouveauté
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13.5, color:text }}>
              <input type="checkbox" checked={!!form.isBest} onChange={setF("isBest")}/> Best-seller
            </label>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={save} disabled={saving} style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`, borderRadius:10, padding:"10px 18px", cursor:"pointer", fontSize:13.5, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
              <Save size={14}/> {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button onClick={() => { setShowForm(false); setEditP(null); }} style={{ background:"none", color:text, border:`1px solid ${bord}`, borderRadius:10, padding:"10px 16px", cursor:"pointer", fontSize:13.5, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
              <X size={14}/> Annuler
            </button>
          </div>
        </div>
      )}
      <div style={{ display:"grid", gap:10 }}>
        {products.map(p => (
          <div key={p.id} style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:12, padding:"12px 14px", display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:56, height:56, borderRadius:10, overflow:"hidden", flexShrink:0, background: p.accent ? `linear-gradient(135deg,${p.accent[0]},${p.accent[1]})` : "#eee", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {p.imgs?.[0] ? <img src={p.imgs[0]} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ fontSize:22 }}>👜</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:14, color:text, fontWeight:600 }}>{p.name}</div>
              <div style={{ fontSize:12, color: dark ? CA.dMute : CA.mute }}>{p.brand} · {fcfa_a(p.price)}</div>
              <div style={{ display:"flex", gap:6, marginTop:4 }}>
                <Badge color={p.stock === 0 ? CA.danger : p.stock <= 2 ? CA.warning : CA.success}>
                  {p.stock === 0 ? "Épuisé" : `Stock : ${p.stock}`}
                </Badge>
                {p.isNew && <Badge color={CA.gold}>Nouveau</Badge>}
                {p.isBest && <Badge color="#1DC0D4">Top</Badge>}
              </div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => startEdit(p)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${bord}`, background:"none", cursor:"pointer", display:"grid", placeItems:"center", color:text }}>
                <Edit size={14}/>
              </button>
              <button onClick={() => del(p.id)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${bord}`, background:"none", cursor:"pointer", display:"grid", placeItems:"center", color:CA.danger }}>
                <Trash2 size={14}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   🏢 ADMIN — ONGLET ÉQUIPE
   ═══════════════════════════════════════ */
function UsersTab({ users, setUsers, dark, text, bord, cardBg }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", role:"delivery" });
  const setF = k => e => setForm(f => ({ ...f, [k]:e.target.value }));
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9, border:`1.5px solid ${bord}`, background: dark ? CA.dCard : "#fff", fontSize:"16px", color:text, fontFamily:"inherit" };

  const add = async () => {
    if (!form.name || !form.email) return;
    const newUser = { id:Date.now(), ...form, active:true };
    setUsers(us => [...us, newUser]);
    try { await sb.post("team_users", newUser); } catch (e) { console.warn("Supabase post team_users:", e.message); }
    setForm({ name:"", email:"", role:"delivery" });
    setShowForm(false);
  };

  const toggle = async id => {
    const user = users.find(u => u.id === id);
    setUsers(us => us.map(u => u.id === id ? { ...u, active:!u.active } : u));
    try { await sb.patch("team_users", id, { active:!user.active }); } catch (e) { console.warn("Supabase patch:", e.message); }
  };

  const del = async id => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    setUsers(us => us.filter(u => u.id !== id));
    try { await sb.delete("team_users", id); } catch (e) { console.warn("Supabase delete:", e.message); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:16, color:text }}>{users.length} membres</span>
        <button onClick={() => setShowForm(v => !v)} style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`, borderRadius:10, padding:"9px 16px", cursor:"pointer", fontSize:13.5, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
          <PlusCircle size={15}/> Ajouter un membre
        </button>
      </div>
      {showForm && (
        <div style={{ background:cardBg, border:`1px solid ${CA.gold}55`, borderRadius:14, padding:"18px", marginBottom:16 }}>
          <h4 style={{ fontFamily:"Georgia,serif", fontSize:15, color:text, margin:"0 0 14px" }}>Nouveau membre</h4>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Nom *</span>
              <input style={inp} value={form.name} onChange={setF("name")} placeholder="Ex : Jean Kaboré"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Email *</span>
              <input style={inp} value={form.email} onChange={setF("email")} type="email" placeholder="jean@dadasdrop.com"/>
            </label>
          </div>
          <label style={{ display:"block", marginBottom:14 }}>
            <span style={{ fontSize:11.5, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Rôle *</span>
            <select style={inp} value={form.role} onChange={setF("role")}>
              <option value="manager">👩‍💼 Gestionnaire</option>
              <option value="delivery">🚴 Livreur</option>
            </select>
          </label>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={add} style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`, borderRadius:10, padding:"10px 18px", cursor:"pointer", fontSize:13.5, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
              <Check size={14}/> Ajouter
            </button>
            <button onClick={() => setShowForm(false)} style={{ background:"none", color:text, border:`1px solid ${bord}`, borderRadius:10, padding:"10px 16px", cursor:"pointer", fontSize:13.5, display:"flex", alignItems:"center", gap:6 }}>
              <X size={14}/> Annuler
            </button>
          </div>
        </div>
      )}
      <div style={{ display:"grid", gap:10 }}>
        {users.map(u => (
          <div key={u.id} style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:12, padding:"13px 15px", display:"flex", alignItems:"center", gap:12, opacity:u.active?1:.55 }}>
            <div style={{ width:42, height:42, borderRadius:999, background:`${CA.gold}22`, display:"grid", placeItems:"center", fontSize:18, flexShrink:0 }}>
              {ROLES[u.role]?.badge || "👤"}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:14, color:text }}>{u.name}</div>
              <div style={{ fontSize:12, color: dark ? CA.dMute : CA.mute }}>{u.email}</div>
              <Badge color={u.role === "admin" ? CA.gold : u.role === "manager" ? "#1DC0D4" : CA.success}>{ROLES[u.role]?.label || u.role}</Badge>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => toggle(u.id)} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${bord}`, background:"none", cursor:"pointer", display:"grid", placeItems:"center", color:u.active ? CA.success : CA.danger }}>
                {u.active ? <CheckCircle size={14}/> : <X size={14}/>}
              </button>
              {u.role !== "admin" && (
                <button onClick={() => del(u.id)} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${bord}`, background:"none", cursor:"pointer", display:"grid", placeItems:"center", color:CA.danger }}>
                  <Trash2 size={14}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   🏢 ADMIN — ONGLET PARAMÈTRES
   ═══════════════════════════════════════ */
function SettingsTab({ dark, text, bord, cardBg }) {
  const [cfg, setCfg] = useState({
    whatsapp: CFG.whatsapp,
    orangeMoney: CFG.orangeMoney,
    moovMoney: CFG.moovMoney,
    wave: CFG.wave,
    freeFrom: String(CFG.freeFrom),
    city: CFG.city,
  });
  const [saved, setSaved] = useState(false);
  const setC = k => e => setCfg(c => ({ ...c, [k]:e.target.value }));
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9, border:`1.5px solid ${bord}`, background: dark ? CA.dCard : "#fff", fontSize:"16px", color:text, fontFamily:"inherit" };

  const save = async () => {
    try {
      // Upsert dans la table announcements (ou une table settings dédiée si tu l'as)
      await sb.post("announcements", { id:"config", data:cfg });
    } catch (e) { console.warn("Supabase settings save:", e.message); }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth:600 }}>
      <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"20px 22px", marginBottom:14 }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 16px" }}>📞 Contacts & Paiement</h3>
        <div style={{ display:"grid", gap:12 }}>
          {[
            { key:"whatsapp",    label:"Numéro WhatsApp",   placeholder:"226XXXXXXXX" },
            { key:"orangeMoney", label:"Orange Money",       placeholder:"+226 XX XX XX XX" },
            { key:"moovMoney",   label:"Moov Money",         placeholder:"+226 XX XX XX XX" },
            { key:"wave",        label:"Wave",               placeholder:"+226 XX XX XX XX" },
          ].map(f => (
            <label key={f.key} style={{ display:"block" }}>
              <span style={{ fontSize:12, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>{f.label}</span>
              <input style={inp} value={cfg[f.key]} onChange={setC(f.key)} placeholder={f.placeholder}/>
            </label>
          ))}
        </div>
      </div>
      <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"20px 22px", marginBottom:14 }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 16px" }}>🚚 Livraison</h3>
        <label style={{ display:"block", marginBottom:12 }}>
          <span style={{ fontSize:12, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Ville principale</span>
          <input style={inp} value={cfg.city} onChange={setC("city")}/>
        </label>
        <label style={{ display:"block" }}>
          <span style={{ fontSize:12, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:4 }}>Livraison gratuite à partir de (FCFA)</span>
          <input style={inp} type="number" value={cfg.freeFrom} onChange={setC("freeFrom")}/>
        </label>
      </div>
      <button onClick={save} style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`, borderRadius:11, padding:"12px 22px", cursor:"pointer", fontSize:14, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
        {saved ? <><CheckCircle size={16}/> Enregistré !</> : <><Save size={16}/> Enregistrer les paramètres</>}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   🔐 PAGE ADMIN PRINCIPALE
   ═══════════════════════════════════════ */
function AdminPage({ products, setProducts, dark, setPage }) {
  const [auth, setAuth] = useState(null);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState(INIT_USERS);
  const [notifs, setNotifs] = useState([
    { id:1, msg:"Nouvelle commande reçue", time:"Il y a 5 min", read:false },
    { id:2, msg:"Stock Mini Boston Bleu Denim : plus que 2 !", time:"Il y a 2h", read:true },
  ]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const bg = dark ? CA.dBg : CA.cream;
  const text = dark ? CA.dText : CA.ink;
  const bord = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const unread = notifs.filter(n => !n.read).length;

  // Charger les commandes depuis Supabase
  useEffect(() => {
    if (!auth) return;
    setLoadingOrders(true);
    sb.get("orders", "?order=date.desc&limit=50")
      .then(rows => {
        if (rows && rows.length > 0) setOrders(rows);
        else {
          // Fallback démo
          setOrders([
            { id:"DD-1001", name:"Awa Traoré",    phone:"70 11 22 33", ville:"Ouagadougou", quartier:"Karpala",     items:["Mini Boston Rose x1"],           total:25000, status:1, payment:"orange",   date:"2025-06-10", assignedTo:null },
            { id:"DD-1002", name:"Fatou Diallo",  phone:"76 44 55 66", ville:"Ouagadougou", quartier:"Pissy",       items:["Mini Boston Bleu Denim x2"],      total:50000, status:2, payment:"wave",     date:"2025-06-12", assignedTo:3 },
            { id:"DD-1003", name:"Mariam Koné",   phone:"65 77 88 99", ville:"Ouagadougou", quartier:"Gounghin",    items:["Coach Torry Camel x1","Tabby x1"],total:57000, status:3, payment:"moov",     date:"2025-06-08", assignedTo:null },
            { id:"DD-1004", name:"Aïcha Sawadogo",phone:"71 00 11 22", ville:"Ouagadougou", quartier:"Wemtenga",    items:["Mini Boston Beige & Blanc x1"],   total:24000, status:1, payment:"livraison",date:"2025-06-15", assignedTo:null },
            { id:"DD-1005", name:"Roukiatou B.",  phone:"78 33 44 55", ville:"Ouagadougou", quartier:"Zone du Bois",items:["Tabby Coach 8 coloris x1"],       total:35000, status:1, payment:"orange",   date:"2025-06-16", assignedTo:null },
          ]);
        }
      })
      .catch(e => {
        console.warn("Supabase orders load:", e.message);
        setOrders([]);
      })
      .finally(() => setLoadingOrders(false));
  }, [auth]);

  const login = () => {
    const user = users.find(u => u.email === email && u.active);
    if (user && pass === "dada2025") { setAuth(user); setWrong(false); }
    else setWrong(true);
  };
  const logout = () => { setAuth(null); setEmail(""); setPass(""); setTab("overview"); };
  const can = action => {
    if (!auth) return false;
    if (auth.role === "admin") return true;
    if (auth.role === "manager") return ["view_orders","edit_orders","add_product","edit_product","view_stats"].includes(action);
    if (auth.role === "delivery") return ["view_my_orders","update_delivery"].includes(action);
    return false;
  };

  /* ── ÉCRAN CONNEXION ── */
  if (!auth) return (
    <div style={{ minHeight:"100vh", background:bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ maxWidth:380, width:"100%", background:cardBg, borderRadius:20, padding:32, boxShadow:"0 24px 56px rgba(0,0,0,.15)", border:`1px solid ${bord}` }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <LogoDD size={64}/>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:20, color:text, margin:"14px 0 4px" }}>Dada's Drop</h1>
          <p style={{ fontSize:12.5, color: dark ? CA.dMute : CA.mute, margin:0, letterSpacing:.5 }}>ESPACE ADMINISTRATION</p>
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:5, letterSpacing:.3 }}>ADRESSE EMAIL</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@dadasdrop.com" type="email"
            style={{ width:"100%", padding:"11px 13px", borderRadius:10, border:`1.5px solid ${wrong ? "#E05030" : bord}`, background: dark ? CA.dCard : "#fff", fontSize:"16px", color:text, fontFamily:"inherit" }}
            onKeyDown={e => e.key === "Enter" && login()}/>
        </div>
        <div style={{ marginBottom:8, position:"relative" }}>
          <label style={{ fontSize:12, fontWeight:600, color: dark ? CA.dMute : CA.mute, display:"block", marginBottom:5, letterSpacing:.3 }}>MOT DE PASSE</label>
          <input value={pass} onChange={e => setPass(e.target.value)} type={showPass ? "text" : "password"} placeholder="••••••••"
            style={{ width:"100%", padding:"11px 40px 11px 13px", borderRadius:10, border:`1.5px solid ${wrong ? "#E05030" : bord}`, background: dark ? CA.dCard : "#fff", fontSize:"16px", color:text, fontFamily:"inherit" }}
            onKeyDown={e => e.key === "Enter" && login()}/>
          <button onClick={() => setShowPass(v => !v)} style={{ position:"absolute", right:11, bottom:11, border:"none", background:"none", cursor:"pointer", color: dark ? CA.dMute : CA.mute }}>
            {showPass ? <EyeOff size={17}/> : <Eye size={17}/>}
          </button>
        </div>
        {wrong && (
          <div style={{ display:"flex", alignItems:"center", gap:6, color:CA.danger, fontSize:12.5, marginBottom:8 }}>
            <AlertCircle size={14}/> Email ou mot de passe incorrect.
          </div>
        )}
        <button onClick={login} style={{ width:"100%", padding:"13px", background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`, borderRadius:11, fontWeight:700, fontSize:15, cursor:"pointer", marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Lock size={16}/> Accéder au tableau de bord
        </button>
        <button onClick={() => setPage && setPage("home")} style={{ width:"100%", padding:"10px", background:"none", color: dark ? CA.dMute : CA.mute, border:"none", borderRadius:11, fontWeight:500, fontSize:13, cursor:"pointer", marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <ArrowLeft size={14}/> Retour au site
        </button>
        <p style={{ textAlign:"center", fontSize:11, color: dark ? CA.dMute : "#bbb", marginTop:16 }}>Accès réservé à l'équipe Dada's Drop</p>
      </div>
    </div>
  );

  /* ── TABLEAU DE BORD ── */
  const myOrders = auth.role === "delivery" ? orders.filter(o => o.assignedTo === auth.id) : orders;
  const totalRev = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 1).length;

  const tabs = [
    ...(can("view_stats") ? [{ key:"overview", icon:<BarChart2 size={15}/>, label:"Vue d'ensemble" }] : []),
    { key:"orders", icon:<ShoppingCart size={15}/>, label: auth.role === "delivery" ? "Mes livraisons" : "Commandes" },
    ...(can("add_product") ? [{ key:"products", icon:<Grid size={15}/>, label:"Produits" }] : []),
    ...(auth.role === "admin" ? [{ key:"users", icon:<Users size={15}/>, label:"Équipe" }] : []),
    ...(auth.role === "admin" ? [{ key:"settings", icon:<Settings size={15}/>, label:"Paramètres" }] : []),
  ];

  return (
    <div style={{ minHeight:"100vh", background:bg, fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      {/* TOPBAR */}
      <header style={{ background:CA.ink, borderBottom:`1px solid ${CA.gold}33`, padding:"0 12px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
          <LogoDD size={32}/>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:13, fontWeight:700, color:"#fff", letterSpacing:.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>DADA'S DROP</div>
            <div style={{ fontSize:9, color:CA.gold, letterSpacing:1.5 }}>ADMINISTRATION</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ position:"relative" }}>
            <button onClick={() => setNotifOpen(v => !v)} style={{ border:"none", background:"none", cursor:"pointer", color:"#fff", position:"relative", padding:4 }}>
              <Bell size={19}/>
              {unread > 0 && <span style={{ position:"absolute", top:-2, right:-2, background:CA.danger, color:"#fff", fontSize:9, fontWeight:800, width:16, height:16, borderRadius:999, display:"grid", placeItems:"center" }}>{unread}</span>}
            </button>
            {notifOpen && (
              <div style={{ position:"absolute", right:0, top:36, width:"min(300px, 90vw)", background:cardBg, border:`1px solid ${bord}`, borderRadius:14, boxShadow:"0 12px 32px rgba(0,0,0,.2)", zIndex:100 }}>
                <div style={{ padding:"12px 14px", borderBottom:`1px solid ${bord}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:700, fontSize:13.5, color:text }}>Notifications</span>
                  <button onClick={() => { setNotifs(n => n.map(x => ({ ...x, read:true }))); setNotifOpen(false); }} style={{ border:"none", background:"none", cursor:"pointer", color:CA.mute, fontSize:11.5 }}>Tout lire</button>
                </div>
                {notifs.map(n => (
                  <div key={n.id} style={{ padding:"10px 14px", borderBottom:`1px solid ${bord}`, background: n.read ? "transparent" : `${CA.gold}0A` }}>
                    <div style={{ fontSize:13, color:text, fontWeight: n.read ? 400 : 600 }}>{n.msg}</div>
                    <div style={{ fontSize:11, color:CA.mute, marginTop:2 }}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Nom visible uniquement sur desktop */}
          <div style={{ display:"none" }} className="dd-admin-userinfo">
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:12.5, color:"#fff", fontWeight:600 }}>{auth.name}</div>
              <div style={{ fontSize:10.5, color:CA.gold }}>{ROLES[auth.role].badge} {ROLES[auth.role].label}</div>
            </div>
          </div>
          <button onClick={logout} style={{ border:`1px solid ${CA.gold}44`, background:"none", borderRadius:8, padding:"6px 10px", cursor:"pointer", color:CA.gold, fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
            <LogOut size={13}/> <span className="dd-admin-logout-txt">Déconnexion</span>
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px 16px 48px" }}>
        {/* TABS */}
        <div style={{ display:"flex", gap:6, marginBottom:22, flexWrap:"wrap" }}>
          {tabs.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 15px", borderRadius:9, border:`1.5px solid ${tab===tb.key ? CA.gold : bord}`, background: tab===tb.key ? CA.ink : cardBg, color: tab===tb.key ? CA.gold : text, cursor:"pointer", fontSize:13, fontWeight:600 }}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {/* VUE D'ENSEMBLE */}
        {tab === "overview" && (
          <div>
            {pendingOrders > 0 && (
              <div style={{ background:`${CA.warning}15`, border:`1px solid ${CA.warning}44`, borderRadius:12, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
                <AlertCircle size={18} color={CA.warning}/>
                <span style={{ fontSize:13.5, color:text, fontWeight:600 }}>{pendingOrders} commande{pendingOrders > 1 ? "s" : ""} en attente de traitement</span>
                <button onClick={() => setTab("orders")} style={{ marginLeft:"auto", background:CA.warning, color:"#fff", border:"none", borderRadius:7, padding:"5px 12px", cursor:"pointer", fontSize:12.5, fontWeight:700 }}>Voir</button>
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, marginBottom:24 }}>
              <StatCard icon={<ShoppingCart size={20} color={CA.gold}/>} value={orders.length} label="Commandes totales" color={CA.gold} dark={dark}/>
              <StatCard icon={<TrendingUp size={20} color={CA.success}/>} value={fcfa_a(totalRev)} label="Revenus totaux" color={CA.success} dark={dark}/>
              <StatCard icon={<Grid size={20} color="#1DC0D4"/>} value={products.length} label="Articles en catalogue" color="#1DC0D4" dark={dark}/>
              <StatCard icon={<Package size={20} color={CA.warning}/>} value={pendingOrders} label="En attente" color={CA.warning} dark={dark}/>
            </div>
            {loadingOrders ? (
              <div style={{ textAlign:"center", padding:32, color:text }}>Chargement des commandes…</div>
            ) : (
              <>
                <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"16px 18px", marginBottom:18 }}>
                  <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>Commandes récentes</h3>
                  {orders.slice(0, 5).map((o, i) => (
                    <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom: i < 4 ? `1px solid ${bord}` : "none" }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13.5, color:text }}>#{o.id} — {o.name}</div>
                        <div style={{ fontSize:12, color: dark ? CA.dMute : CA.mute }}>{(o.items || []).join(", ")} · {o.date}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <Badge color={STATUS_COLORS[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                        <span style={{ fontFamily:"Georgia,serif", fontWeight:700, color:CA.gold, fontSize:13.5 }}>{fcfa_a(o.total)}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p style={{ color: dark ? CA.dMute : CA.mute, fontSize:13.5 }}>Aucune commande pour l'instant.</p>}
                </div>
                <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"16px 18px" }}>
                  <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>⚠️ Stock faible</h3>
                  {products.filter(p => p.stock <= 2).length === 0 ? (
                    <p style={{ color: dark ? CA.dMute : CA.mute, fontSize:13.5 }}>Tous les stocks sont corrects ✅</p>
                  ) : products.filter(p => p.stock <= 2).map((p, i) => (
                    <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${bord}` }}>
                      <span style={{ fontSize:13.5, color:text }}>{p.name}</span>
                      <Badge color={p.stock === 0 ? CA.danger : CA.warning}>{p.stock === 0 ? "Épuisé" : `${p.stock} restant${p.stock > 1 ? "s" : ""}`}</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {tab === "orders" && <OrdersTab orders={myOrders} setOrders={setOrders} users={users} auth={auth} dark={dark} text={text} bord={bord} cardBg={cardBg}/>}
        {tab === "products" && can("add_product") && <ProductsTab products={products} setProducts={setProducts} dark={dark} text={text} bord={bord} cardBg={cardBg}/>}
        {tab === "users" && auth.role === "admin" && <UsersTab users={users} setUsers={setUsers} dark={dark} text={text} bord={bord} cardBg={cardBg}/>}
        {tab === "settings" && auth.role === "admin" && <SettingsTab dark={dark} text={text} bord={bord} cardBg={cardBg}/>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   🚀 APP PRINCIPALE
   ═══════════════════════════════════════ */
function ShopApp({ products, setProducts, dark, setDark, initialPage = "home" }) {
  const [lang, setLang]         = useState("fr");
  const [page, setPage]         = useState(initialPage);
  const [query, setQuery]       = useState("");
  const [cat, setCat]           = useState(0);
  const [sort, setSort]         = useState("new");
  const [inStock, setInStock]   = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loadingProducts]       = useState(false); // déjà chargé au niveau App
  const [cart, setCart] = useState(() => {
    try { const s = localStorage.getItem("dd_cart"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [selected, setSelected]   = useState(null);
  const [cartOpen, setCartOpen]   = useState(false);
  const [checkout, setCheckout]   = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted]     = useState(false);

  // Sauvegarder panier
  useEffect(() => {
    try { localStorage.setItem("dd_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => { const id = setTimeout(() => setMounted(true), 80); return () => clearTimeout(id); }, []);

  useEffect(() => {
    const isOpen = menuOpen || cartOpen || checkout || trackOpen || !!selected;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, cartOpen, checkout, trackOpen, selected]);

  const t    = T[lang];
  const CATS = lang === "fr" ? CATS_FR : CATS_EN;

  const list = useMemo(() => {
    let r = products.filter(p => {
      if (query.trim()) {
        if (inStock && p.stock === 0) return false;
        const q = query.toLowerCase().trim();
        return (
          (p.name || "").toLowerCase().includes(q) ||
          (p.nameEn || "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          (p.cat || "").toLowerCase().includes(q) ||
          (p.catEn || "").toLowerCase().includes(q) ||
          (p.desc || "").toLowerCase().includes(q) ||
          String(p.price).includes(q)
        );
      }
      if (cat > 0) { const cn = lang === "fr" ? p.cat : p.catEn; if (cn !== CATS[cat]) return false; }
      if (inStock && p.stock === 0) return false;
      if (minPrice !== "" && p.price < parseInt(minPrice)) return false;
      if (maxPrice !== "" && p.price > parseInt(maxPrice)) return false;
      return true;
    });
    if (sort === "asc")  r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "desc") r = [...r].sort((a, b) => b.price - a.price);
    return r;
  }, [query, cat, sort, inStock, lang, products, minPrice, maxPrice, CATS]);

  const bestSellers = products.filter(p => p.isBest && p.stock > 0).slice(0, 4);

  const addToCart = useCallback((p, qty = 1) => {
    setCart(c => { const ex = c.find(i => i.id === p.id); if (ex) return c.map(i => i.id === p.id ? { ...i, qty:Math.min(p.stock, i.qty + qty) } : i); return [...c, { id:p.id, qty }]; });
    setCartOpen(true);
  }, []);
  const setQty = (id, qty) => setCart(c => qty <= 0 ? c.filter(i => i.id !== id) : c.map(i => i.id === id ? { ...i, qty } : i));
  const removeItem = id => setCart(c => c.filter(i => i.id !== id));
  const lines = cart.map(it => ({ ...products.find(p => p.id === it.id), qty:it.qty })).filter(l => l.id);
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const bg = dark ? C.dBg : C.cream;
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  const hdrBg = dark ? "rgba(15,12,8,.92)" : "rgba(250,246,238,.92)";

  if (page === "admin") return <AdminPage products={products} setProducts={setProducts} dark={dark} setPage={setPage}/>;

  return (
    <div style={{ background:bg, minHeight:"100vh", color:text, fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box}
        input,textarea,select{font-family:inherit}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${C.gold}!important}
        .dd-card:hover{box-shadow:0 12px 28px rgba(0,0,0,.12);transform:translateY(-2px)!important}
        @keyframes ddFade{from{opacity:0}to{opacity:1}}
        @keyframes ddHero{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .dd-lang-btn{display:inline-flex}
        @media(max-width:600px){
          .dd-grid{grid-template-columns:repeat(2,1fr)!important}
          .dd-hero-title{font-size:28px!important}
          .dd-lang-btn{display:none!important}
        }
        body.filter-open{overflow:hidden!important;touch-action:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${C.gold}44;border-radius:99px}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:hdrBg, backdropFilter:"blur(14px)", borderBottom:`1px solid ${bord}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, flex:1 }}>
            <button onClick={() => setMenuOpen(true)} style={{ border:"none", background:"none", cursor:"pointer", color:text }}>
              <Menu size={18}/>
            </button>
            <button onClick={() => setSearchOpen(v => !v)} style={{ border:"none", background:"none", cursor:"pointer", color:text }}>
              <Search size={17}/>
            </button>
          </div>
          <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer" }} onClick={() => setPage("home")}>
            <span style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:text, letterSpacing:3, lineHeight:1, whiteSpace:"nowrap" }}>DADA'S DROP</span>
            <span style={{ fontSize:8, color:C.gold, letterSpacing:4, marginTop:1, whiteSpace:"nowrap" }}>✦ COLLECTION PREMIUM ✦</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"flex-end" }}>
            <button onClick={() => setLang(l => l === "fr" ? "en" : "fr")} className="dd-lang-btn" style={{ border:`1px solid ${bord}`, background: dark ? C.dCard : "#fff", borderRadius:7, padding:"5px 9px", cursor:"pointer", color:text, fontSize:11.5, fontWeight:700, letterSpacing:.5 }}>
              {t.lang}
            </button>
            <button onClick={() => setDark(v => !v)} style={{ border:"none", background:"none", cursor:"pointer", color:text }}>
              {dark ? <Sun size={17}/> : <Moon size={17}/>}
            </button>
            <button onClick={() => setCartOpen(true)} style={{ position:"relative", border:"none", background:"none", cursor:"pointer", color:text }}>
              <ShoppingBag size={19}/>
              {count > 0 && <span style={{ position:"absolute", top:-7, right:-7, background:C.ink, color:C.gold, fontSize:9.5, fontWeight:800, minWidth:17, height:17, borderRadius:999, display:"grid", placeItems:"center", padding:"0 3px", border:`1.5px solid ${C.gold}` }}>{count}</span>}
            </button>
          </div>
        </div>
        {searchOpen && (
          <div style={{ borderTop:`1px solid ${bord}`, padding:"10px 16px", background:hdrBg }}>
            <div style={{ maxWidth:600, margin:"0 auto", position:"relative" }}>
              <Search size={15} color={dark ? C.dMute : C.mute} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}/>
              <input autoFocus value={query} onChange={e => { setQuery(e.target.value); setPage("catalogue"); setCat(0); }}
                placeholder={t.search}
                style={{ width:"100%", padding:"9px 36px 9px 34px", borderRadius:8, border:`1px solid ${bord}`, background: dark ? C.dCard : "#fff", fontSize:"16px", color:text }}/>
              {query && <button onClick={() => { setQuery(""); setSearchOpen(false); }} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", border:"none", background:"none", cursor:"pointer", color: dark ? C.dMute : C.mute }}><X size={15}/></button>}
            </div>
          </div>
        )}
      </header>

      {/* ── PAGES ── */}
      {page === "home" && (
        <>
          {/* HERO */}
          <section style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px 0", animation:"ddHero .7s ease both" }}>
            <div style={{ borderRadius:20, overflow:"hidden", position:"relative", background:C.ink, minHeight:380, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, #1A1510 0%, #2A2015 50%, #1A1008 100%)" }}/>
              <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"48px 24px", color:"#fff" }}>
                <span style={{ fontSize:10, color:C.gold, letterSpacing:5, fontWeight:600, display:"block", marginBottom:16 }}>✦ DADA'S DROP ✦</span>
                <h1 className="dd-hero-title" style={{ fontFamily:"Georgia,serif", fontSize:42, fontWeight:400, lineHeight:1.15, margin:"0 0 14px", letterSpacing:.5, maxWidth:560 }}>{t.heroTitle}</h1>
                <p style={{ fontSize:15, color:"rgba(255,255,255,.7)", maxWidth:400, margin:"0 auto 28px", lineHeight:1.6 }}>{t.heroSub} {CFG.city}.</p>
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={() => setPage("catalogue")} style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.gold, color:C.ink, border:"none", borderRadius:8, padding:"12px 22px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    {t.discover} <ArrowRight size={16}/>
                  </button>
                  <button onClick={() => setTrackOpen(true)} style={{ display:"inline-flex", alignItems:"center", gap:7, background:"transparent", color:"rgba(255,255,255,.8)", border:"1px solid rgba(201,168,76,.4)", borderRadius:8, padding:"12px 20px", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                    <Package size={16}/> {t.trackOrder}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SÉLECTION */}
          <section style={{ maxWidth:1200, margin:"0 auto", padding:"36px 16px 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
              <div style={{ width:2.5, height:18, background:GRAD, borderRadius:99 }}/>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:0, fontWeight:400 }}>{t.bestSeller}</h2>
            </div>
            {loadingProducts ? (
              <div style={{ textAlign:"center", padding:32, color:text }}>Chargement…</div>
            ) : (
              <div className="dd-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
                {bestSellers.map((p, i) => <ProductCard key={p.id} p={p} t={t} idx={i} mounted={mounted} dark={dark} onOpen={setSelected} onAdd={addToCart}/>)}
              </div>
            )}
            <div style={{ textAlign:"center", marginTop:24 }}>
              <button onClick={() => setPage("catalogue")} style={{ ...primaryBtn, gap:7 }}>{t.catalogue} <ArrowRight size={14}/></button>
            </div>
          </section>

          {/* AVANTAGES */}
          <section style={{ maxWidth:1200, margin:"36px auto 0", padding:"0 16px 36px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10 }}>
              {[
                { icon:<Truck size={18} color={C.gold}/>,         label:"Livraison Ouagadougou", sub:"Rapide et soigné" },
                { icon:<Smartphone size={18} color={C.gold}/>,    label:"Mobile Money",           sub:"Orange · Moov · Wave" },
                { icon:<ShieldCheck size={18} color={C.gold}/>,   label:"Sélection Dada",         sub:"Chaque pièce choisie" },
                { icon:<MessageCircle size={18} color="#25D366"/>, label:"Commande WhatsApp",      sub:"Réponse rapide" },
              ].map((f, i) => (
                <div key={i} style={{ background: dark ? C.dCard : "#fff", border:`1px solid ${bord}`, borderRadius:12, padding:"14px 15px" }}>
                  <div style={{ width:36, height:36, borderRadius:9, background: dark ? C.dBorder : C.creamD, display:"grid", placeItems:"center", marginBottom:9 }}>{f.icon}</div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:13.5, color:text, marginBottom:2 }}>{f.label}</div>
                  <div style={{ fontSize:12, color: dark ? C.dMute : C.mute }}>{f.sub}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {page === "catalogue" && (
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px 40px" }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, color:text, margin:"0 0 20px", fontWeight:400 }}>{t.catalogue}</h1>
          <FilterPanel CATS={CATS} cat={cat} setCat={setCat} sort={sort} setSort={setSort} inStock={inStock} setInStock={setInStock} minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} lang={lang} dark={dark} text={text} bord={bord}/>
          <div style={{ marginBottom:16 }}>
            <span style={{ fontSize:13, color: dark ? C.dMute : C.mute }}><strong style={{ color:text }}>{list.length}</strong> {t.itemCount}{list.length > 1 ? "s" : ""}</span>
          </div>
          {loadingProducts ? (
            <div style={{ textAlign:"center", padding:48, color:text }}>Chargement des articles…</div>
          ) : cat >= 4 ? (
            <div style={{ textAlign:"center", padding:"60px 16px" }}>
              <div style={{ fontSize:48 }}>{["👟","💍","🌸","💋","👗"][cat-4]}</div>
              <h3 style={{ fontFamily:"Georgia,serif", color:text, margin:"12px 0 8px", fontSize:20 }}>{CATS[cat]} — {lang === "fr" ? "Bientôt disponible !" : "Coming soon!"}</h3>
              <p style={{ color: dark ? C.dMute : C.mute, fontSize:14, maxWidth:320, margin:"0 auto 20px", lineHeight:1.6 }}>{lang === "fr" ? "Cette catégorie arrive très prochainement." : "This category is coming very soon."}</p>
              <button onClick={() => setCat(0)} style={{ ...primaryBtn, gap:7 }}>{lang === "fr" ? "Voir les articles disponibles" : "See available items"} <ArrowRight size={14}/></button>
            </div>
          ) : list.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 16px" }}>
              <Search size={36} color={dark ? C.dBorder : "#ddd"}/>
              <p style={{ marginTop:10, color: dark ? C.dMute : "#bbb", fontSize:14 }}>{t.noResult}<br/>{t.noResultHint}</p>
              <button onClick={() => { setQuery(""); setCat(0); }} style={{ ...primaryBtn, marginTop:16, gap:7 }}>{lang === "fr" ? "Voir tous les articles" : "See all items"} <ArrowRight size={14}/></button>
            </div>
          ) : (
            <div className="dd-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
              {list.map((p, i) => <ProductCard key={p.id} p={p} t={t} idx={i} mounted={mounted} dark={dark} onOpen={setSelected} onAdd={addToCart}/>)}
            </div>
          )}
        </section>
      )}

      {page === "about" && <AboutPage dark={dark}/>}
      {page === "legal" && <LegalPage type="legal" dark={dark} setPage={setPage}/>}
      {page === "cgv"   && <LegalPage type="cgv"   dark={dark} setPage={setPage}/>}
      {page === "rgpd"  && <LegalPage type="rgpd"  dark={dark} setPage={setPage}/>}
      {page === "sav"   && <LegalPage type="sav"   dark={dark} setPage={setPage}/>}

      {/* FOOTER */}
      <footer style={{ background:C.ink, color:"#fff", padding:"32px 16px", borderTop:`1px solid ${C.gold}22` }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexWrap:"wrap", gap:20, justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, letterSpacing:2, color:"#fff" }}>DADA'S DROP</div>
            <div style={{ fontSize:10, color:C.gold, letterSpacing:4, marginTop:2 }}>✦ COLLECTION PREMIUM ✦</div>
            <p style={{ color:"#5A5040", fontSize:12, margin:"8px 0 0", maxWidth:260 }}>Sacs & accessoires livrés au Burkina Faso.</p>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <a href={`https://wa.me/${CFG.whatsapp}`} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#25D366", color:"#fff", textDecoration:"none", padding:"9px 14px", borderRadius:9, fontWeight:700, fontSize:13 }}>
              <MessageCircle size={15}/> WhatsApp
            </a>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, border:`1px solid ${C.gold}33`, padding:"9px 13px", borderRadius:9, fontSize:12, color:C.gold }}>
              <Phone size={14}/> {CFG.orangeMoney}
            </span>
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:"16px auto 0", borderTop:`1px solid ${C.gold}1A`, paddingTop:14, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#3A3020" }}>© {new Date().getFullYear()} Dada's Drop</span>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[["legal","Mentions légales"],["cgv","CGV"],["rgpd","RGPD"],["sav","SAV"]].map(([p, label]) => (
              <button key={p} onClick={() => setPage(p)} style={{ fontSize:11, color:C.gold, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>{label}</button>
            ))}
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOTTANT */}
      <a href={`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent("Bonjour Dada's Drop 👋 Je suis intéressée par vos articles. Pouvez-vous m'aider ?")}`} target="_blank" rel="noreferrer" style={{ position:"fixed", bottom:20, right:18, width:48, height:48, borderRadius:999, background:"#25D366", display:"grid", placeItems:"center", zIndex:49, boxShadow:"0 4px 16px rgba(37,211,102,.4)", textDecoration:"none" }}>
        <MessageCircle size={22} color="#fff"/>
      </a>

      {/* MODALS */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} t={t} lang={lang} setLang={setLang} dark={dark} setPage={setPage} setCat={setCat}/>
      <ProductModal p={selected} t={t} dark={dark} onClose={() => setSelected(null)} onAdd={addToCart}/>
      <CartDrawer open={cartOpen} cart={cart} products={products} t={t} dark={dark} onClose={() => setCartOpen(false)} onQty={setQty} onRemove={removeItem} onCheckout={() => { setCartOpen(false); setCheckout(true); }}/>
      <Checkout open={checkout} lines={lines} total={total} t={t} dark={dark} onClose={() => setCheckout(false)}/>
      <TrackModal open={trackOpen} t={t} dark={dark} onClose={() => setTrackOpen(false)}/>
    </div>
  );
}

/* ═══════════════════════════════════════
   🔒 GUARD ADMIN — redirige si pas connecté
   ═══════════════════════════════════════ */
function AdminGuard({ products, setProducts, dark }) {
  const navigate = useNavigate();
  return (
    <AdminPage
      products={products}
      setProducts={setProducts}
      dark={dark}
      setPage={(p) => { if (p === "home") navigate("/"); }}
    />
  );
}

/* ═══════════════════════════════════════
   🚀 EXPORT DEFAULT — Router racine
   ═══════════════════════════════════════ */
export default function App() {
  // Les produits sont partagés entre shop et admin
  const [products, setProducts] = useState(initProducts);
  const [dark, setDark] = useState(false);

  // Charger produits Supabase une seule fois au niveau racine
  useEffect(() => {
    sb.get("products", "?order=id.asc")
      .then(rows => { if (rows && rows.length > 0) setProducts(rows); })
      .catch(e => console.warn("Supabase products (root):", e.message));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Shop public */}
        <Route path="/" element={<ShopApp products={products} setProducts={setProducts} dark={dark} setDark={setDark}/>}/>
        <Route path="/catalogue" element={<ShopApp products={products} setProducts={setProducts} dark={dark} setDark={setDark} initialPage="catalogue"/>}/>

        {/* Admin — URL protégée par login dans AdminPage */}
        <Route path="/admin" element={<AdminGuard products={products} setProducts={setProducts} dark={dark}/>}/>
        <Route path="/admin/*" element={<AdminGuard products={products} setProducts={setProducts} dark={dark}/>}/>

        {/* 404 — redirige vers l'accueil */}
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  );
}