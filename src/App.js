import { useState, useMemo, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  ShoppingBag, Search, X, Plus, Minus, Trash2, Heart,
  Check, MessageCircle, Truck, Smartphone, ArrowRight,
  Phone, Moon, Sun, ChevronLeft, ChevronRight, Package,
  MapPin, Copy, CheckCircle, Globe, Menu, Lock, BarChart2,
  Settings, LogOut, Edit, PlusCircle, Bell, TrendingUp,
  ShoppingCart, AlertCircle, Filter, ShieldCheck, Users,
  ChevronUp, ChevronDown, Save, ArrowLeft, Eye, EyeOff,
  Tag, Star, Trash2 as Trash
} from "lucide-react";

/* ════════════════════════════════════════════
   🌐 SUPABASE
════════════════════════════════════════════ */
const SB_URL = "https://oypjgjhlqmsibunvzmwu.supabase.co";
const SB_KEY = "sb_publishable_p-h-HJ7_MK4fHiRh5OxC0w_h-SxK3lN";
const sbHeaders = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
};
const sb = {
  get:    async (t, q="")  => { const r = await fetch(`${SB_URL}/rest/v1/${t}${q}`, { headers:sbHeaders }); if(!r.ok) throw new Error(r.status); return r.json(); },
  post:   async (t, b)     => { const r = await fetch(`${SB_URL}/rest/v1/${t}`, { method:"POST",   headers:{...sbHeaders,Prefer:"return=representation"}, body:JSON.stringify(b) }); if(!r.ok) throw new Error(r.status); return r.json(); },
  patch:  async (t, id, b) => { const r = await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`, { method:"PATCH",  headers:{...sbHeaders,Prefer:"return=representation"}, body:JSON.stringify(b) }); if(!r.ok) throw new Error(r.status); return r.json(); },
  upsert: async (t, b)     => { const r = await fetch(`${SB_URL}/rest/v1/${t}`, { method:"POST",   headers:{...sbHeaders,Prefer:"resolution=merge-duplicates,return=representation"}, body:JSON.stringify(b) }); if(!r.ok) throw new Error(r.status); return r.json(); },
  del:    async (t, id)    => { const r = await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`, { method:"DELETE", headers:sbHeaders }); if(!r.ok) throw new Error(r.status); return true; },
};

/* ════════════════════════════════════════════
   🎨 PALETTE
════════════════════════════════════════════ */
const C = {
  cream:"#FAF6EE", creamD:"#F0EBE0", gold:"#C9A84C", goldL:"#E8C96A",
  ink:"#1A1A1A", inkSoft:"#3A3530", mute:"#8A7A6A", border:"#E0D8CC", card:"#FFFFFF",
  success:"#1A9E5E", danger:"#E05030", warning:"#E08030",
  dBg:"#0F0C08", dCard:"#1A1510", dBorder:"#2E2820", dMute:"#7A6A5A", dText:"#F5F0E8",
};
const GRAD = `linear-gradient(135deg,${C.gold},${C.goldL})`;
const fcfa = n => (n||0).toLocaleString("fr-FR") + " FCFA";

/* ════════════════════════════════════════════
   ⚙️ CONFIG PAR DÉFAUT
════════════════════════════════════════════ */
const DEFAULT_CFG = {
  brand:       "DADA'S DROP",
  whatsapp:    "33768745841",
  orangeMoney: "+226 70 00 00 00",
  moovMoney:   "+226 60 00 00 00",
  wave:        "+226 77 00 00 00",
  city:        "Ouagadougou",
  freeFrom:    20000,
  heroTitle:   "L'élégance, livrée chez vous.",
  heroSub:     "Sacs & accessoires sélectionnés avec soin, livrés à Ouagadougou.",
  waMessage:   "Bonjour Dada's Drop 👋 Je suis intéressée par vos articles. Pouvez-vous m'aider ?",
  bannerActive: false,
  bannerText:  "",
  bannerColor: "#C9A84C",
};

/* ════════════════════════════════════════════
   📦 CATÉGORIES PAR DÉFAUT (dynamiques depuis admin)
════════════════════════════════════════════ */
const DEFAULT_CATS = [
  { id:"sacs",       label:"Sacs à main",   labelEn:"Handbags",      soon:false },
  { id:"bandoul",    label:"Bandoulières",   labelEn:"Shoulder bags", soon:false },
  { id:"pochettes",  label:"Pochettes",      labelEn:"Clutches",      soon:false },
  { id:"chaussures", label:"Chaussures",     labelEn:"Shoes",         soon:true  },
  { id:"bijoux",     label:"Bijoux",         labelEn:"Jewellery",     soon:true  },
  { id:"parfums",    label:"Parfums",        labelEn:"Perfumes",      soon:true  },
  { id:"gloss",      label:"Gloss",          labelEn:"Gloss",         soon:true  },
  { id:"vetements",  label:"Vêtements",      labelEn:"Clothing",      soon:true  },
];

/* ════════════════════════════════════════════
   🛍 PRODUITS DÉMO
════════════════════════════════════════════ */
const DEMO_PRODUCTS = [
  { id:1, name:"Mini Boston Rose", brand:"Coach", price:25000, cat:"sacs",
    stock:3, isNew:true, isBest:true, isPinned:false, isHidden:false, discount:0,
    accent:["#F4A0B0","#E8175D"],
    imgs:["https://i.ibb.co/XrgMg8kL/dc4bf9bd-aa95-47aa-9e7f-f7fa7061b61d.jpg","","",""],
    desc:"Petit sac Boston Coach monogrammé rose poudré, double anse + bandoulière réglable, finitions dorées.",
    variants:[
      { type:"color", label:"Rose poudré",  hex:"#F4A0B0", stock:2 },
      { type:"color", label:"Rose fuchsia", hex:"#E8175D", stock:1 },
    ]
  },
  { id:2, name:"Mini Boston Bleu Denim", brand:"Coach", price:25000, cat:"sacs",
    stock:2, isNew:true, isBest:true, isPinned:false, isHidden:false, discount:0,
    accent:["#A8C4D8","#5A8FAA"],
    imgs:["https://i.ibb.co/v4XQcD1Z/d3766d6c-cc2d-4fe4-ae36-128d07fbb530.jpg","","",""],
    desc:"Mini Boston Coach en denim bleu ciel, look estival et frais. Bandoulière incluse.",
    variants:[]
  },
  { id:3, name:"Coach Torry Camel", brand:"Coach", price:22000, cat:"bandoul",
    stock:4, isNew:false, isBest:true, isPinned:false, isHidden:false, discount:0,
    accent:["#C49060","#8B5E30"],
    imgs:["https://i.ibb.co/rKMpTt3v/4ab98af4-0144-4abe-afd8-ae9e7001e0c8.jpg","","",""],
    desc:"Sac Torry Coach monogrammé camel et cognac, chaîne dorée, look baguette très tendance.",
    variants:[
      { type:"color", label:"Camel",  hex:"#C49060", stock:2 },
      { type:"color", label:"Cognac", hex:"#8B5E30", stock:2 },
    ]
  },
  { id:4, name:"Mini Boston Beige & Blanc", brand:"Coach", price:24000, cat:"sacs",
    stock:5, isNew:true, isBest:false, isPinned:false, isHidden:false, discount:0,
    accent:["#E8DFC8","#C8B89A"],
    imgs:["https://i.ibb.co/0yZqtSWT/0eeb033d-192f-45d6-8e60-480ff04c63ea.jpg","","",""],
    desc:"Mini Boston Coach beige signature avec anses blanches, ultra élégant et polyvalent.",
    variants:[]
  },
  { id:5, name:"Tabby Coach — 8 coloris", brand:"Coach", price:35000, cat:"bandoul",
    stock:8, isNew:true, isBest:true, isPinned:false, isHidden:false, discount:0,
    accent:["#2A2A2A","#8B1A1A"],
    imgs:["https://i.ibb.co/nNPrjH0V/3edfe0d8-9988-4d70-adb8-bfea6d9a4c0c.jpg","","",""],
    desc:"L'iconique Tabby Coach matelassé, chaîne dorée. 8 coloris disponibles. Précisez votre choix.",
    variants:[
      { type:"color", label:"Noir",    hex:"#1A1A1A", stock:2 },
      { type:"color", label:"Bordeaux",hex:"#8B1A1A", stock:2 },
      { type:"color", label:"Camel",   hex:"#C49060", stock:2 },
      { type:"color", label:"Blanc",   hex:"#F5F0E8", stock:2 },
    ]
  },
];

const DEMO_PROMOS = [
  { code:"DADA10",     discount:10, maxUses:50,  uses:3,  active:true },
  { code:"BIENVENUE",  discount:15, maxUses:100, uses:12, active:true },
];

const DEMO_ORDERS_TRACK = {
  "DD-001":{ status:1, name:"Awa Traoré",    items:["Mini Boston Rose x1"],              total:25000, date:"10/06/2025", phone:"70112233" },
  "DD-002":{ status:2, name:"Fatou Diallo",  items:["Mini Boston Bleu Denim x2"],        total:50000, date:"12/06/2025", phone:"76445566" },
  "DD-003":{ status:3, name:"Mariam Koné",   items:["Coach Torry Camel x1","Tabby x1"], total:57000, date:"08/06/2025", phone:"65778899" },
};

const STATUS_LABELS = ["","En préparation","Expédiée","Livrée"];
const STATUS_COLORS = ["", C.warning, "#1DC0D4", C.success];
const PAYMENT_LABELS = { orange:"Orange Money", moov:"Moov Money", wave:"Wave", livraison:"À la livraison" };

/* ════════════════════════════════════════════
   🌍 TRADUCTIONS
════════════════════════════════════════════ */
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
    locMsg:"📍 Envoyez votre localisation WhatsApp pour faciliter la livraison.",
    shippingNote:"Frais de livraison selon votre zone. Livraison offerte dès",
    close:"Fermer", inStock:"En stock", outStock:"Épuisé", lowStock:"Plus que",
    newBadge:"Nouveau", bestSeller:"Sélection", noResult:"Aucun article trouvé.",
    noResultHint:"Essayez un autre mot ou une autre catégorie.",
    outOfStockSearch:"est momentanément en rupture de stock",
    outOfStockMsg:"Contactez-nous sur WhatsApp pour être prévenue dès son retour !",
    trackOrder:"Suivre ma commande", trackTitle:"Suivi de commande",
    trackBtn:"Rechercher", trackNotFound:"Commande introuvable.",
    trackByPhone:"Rechercher par téléphone",
    statusPrep:"Préparation", statusShip:"Expédiée", statusDeliv:"Livrée",
    comment:"Laisser un avis", commentSend:"Envoyer",
    addCart:"Ajouter au panier", lang:"EN",
    discover:"Découvrir la collection", heroTitle:"L'élégance, livrée chez vous.",
    heroSub:"Sacs & accessoires sélectionnés avec soin, livrés à",
    home:"Accueil", catalogue:"Catalogue", about:"À propos",
    chooseColor:"Choisir une couleur", chooseSize:"Choisir une taille",
    chooseVariant:"Choisir une option",
    promoCode:"Code promo", promoApply:"Appliquer", promoInvalid:"Code invalide ou expiré.",
    promoApplied:"Code appliqué !",
    shareMsg:"👜 {name} — {price} chez Dada's Drop !\n🛍 Voir l'article : dadas-drop.vercel.app\n📲 Commander sur WhatsApp !",
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
    locMsg:"📍 Send your WhatsApp location to make delivery easier.",
    shippingNote:"Delivery fees apply. Free delivery from",
    close:"Close", inStock:"In stock", outStock:"Sold out", lowStock:"Only",
    newBadge:"New", bestSeller:"Selection", noResult:"No items found.",
    noResultHint:"Try another word or category.",
    outOfStockSearch:"is temporarily out of stock",
    outOfStockMsg:"Contact us on WhatsApp to be notified when it's back!",
    trackOrder:"Track order", trackTitle:"Order tracking",
    trackBtn:"Search", trackNotFound:"Order not found.",
    trackByPhone:"Search by phone number",
    statusPrep:"Preparing", statusShip:"Shipped", statusDeliv:"Delivered",
    comment:"Leave a review", commentSend:"Send",
    addCart:"Add to bag", lang:"FR",
    discover:"Discover the collection", heroTitle:"Elegance, delivered to you.",
    heroSub:"Carefully selected bags & accessories, delivered in",
    home:"Home", catalogue:"Catalogue", about:"About",
    chooseColor:"Choose a color", chooseSize:"Choose a size",
    chooseVariant:"Choose an option",
    promoCode:"Promo code", promoApply:"Apply", promoInvalid:"Invalid or expired code.",
    promoApplied:"Code applied!",
    shareMsg:"👜 {name} — {price} at Dada's Drop!\n🛍 See item: dadas-drop.vercel.app\n📲 Order on WhatsApp!",
  },
};

/* ════════════════════════════════════════════
   🎨 STYLES PARTAGÉS
════════════════════════════════════════════ */
const sheetStyle = dark => ({
  background: dark ? C.dCard : "#fff", borderRadius:18, padding:20,
  position:"relative", boxShadow:"0 24px 56px rgba(0,0,0,.22)",
});
const closeBtnStyle = dark => ({
  position:"absolute", top:12, right:12, width:32, height:32,
  borderRadius:999, border:"none", background: dark ? C.dBorder : C.creamD,
  cursor:"pointer", display:"grid", placeItems:"center",
  color: dark ? C.dText : C.ink, zIndex:2,
});
const stepBtn = dark => ({
  width:32, height:36, border:"none",
  background: dark ? C.dBorder : C.creamD,
  cursor:"pointer", display:"grid", placeItems:"center",
  color: dark ? C.dText : C.ink,
});
const stepBtnSm = dark => ({
  width:26, height:26, border:"none",
  background: dark ? C.dBorder : C.creamD,
  cursor:"pointer", display:"grid", placeItems:"center",
  color: dark ? C.dText : C.ink,
});
const primaryBtn = {
  display:"inline-flex", alignItems:"center", gap:7,
  background:C.ink, color:C.gold, border:`1px solid ${C.gold}44`,
  borderRadius:10, padding:"11px 18px", fontWeight:700, fontSize:13.5, cursor:"pointer",
};
const inpStyle = dark => ({
  width:"100%", padding:"10px 12px", borderRadius:10,
  border:`1.5px solid ${dark ? C.dBorder : C.border}`,
  background: dark ? C.dCard : "#fff",
  fontSize:"16px", color: dark ? C.dText : C.ink, fontFamily:"inherit",
});

/* ════════════════════════════════════════════
   🔧 COMPOSANTS UTILITAIRES
════════════════════════════════════════════ */
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70,
      background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center",
      justifyContent:"center", padding:14, animation:"ddFade .22s ease" }}>
      {children}
    </div>
  );
}

function Field({ label, children, dark, flex }) {
  return (
    <label style={{ display:"block", marginBottom:10, flex:flex?1:"none" }}>
      <span style={{ fontSize:12, fontWeight:600, color: dark ? C.dMute : C.mute,
        display:"block", marginBottom:4 }}>{label}</span>
      {children}
    </label>
  );
}

function LogoDD({ size=44 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.22,
      background:C.cream, border:`1.5px solid ${C.gold}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      flexShrink:0, boxShadow:`0 2px 8px rgba(201,168,76,.2)` }}>
      <span style={{ fontFamily:"Georgia,serif", fontSize:size*0.38,
        fontWeight:700, color:C.ink, lineHeight:1 }}>D</span>
      <span style={{ fontFamily:"Georgia,serif", fontSize:size*0.38,
        fontWeight:700, color:C.gold, lineHeight:1 }}>D</span>
    </div>
  );
}

function Thumb({ p, idx=0 }) {
  const src = p?.imgs?.[idx];
  if (src) return (
    <img src={src} alt={p.name}
      style={{ width:"100%", height:"100%", objectFit:"cover" }}
      onError={e => e.target.style.display="none"} />
  );
  return (
    <div style={{ width:"100%", height:"100%",
      background:`linear-gradient(135deg,${p?.accent?.[0]||"#ccc"},${p?.accent?.[1]||"#999"})`,
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <ShoppingBag size={40} color="rgba(255,255,255,.7)" strokeWidth={1.2}/>
    </div>
  );
}

function Carousel({ p }) {
  const [idx, setIdx] = useState(0);
  const imgs = (p.imgs||[]).filter(u => u && u.trim() !== "");
  const total = Math.max(imgs.length, 1);
  return (
    <div style={{ position:"relative", aspectRatio:"4/3", borderRadius:12,
      overflow:"hidden", background:C.creamD }}>
      <Thumb p={p} idx={idx}/>
      {total > 1 && (<>
        <button onClick={() => setIdx(i => (i-1+total)%total)}
          style={{ position:"absolute", top:"50%", left:8,
            transform:"translateY(-50%)", width:28, height:28,
            borderRadius:999, border:"none", background:"rgba(255,255,255,.9)",
            cursor:"pointer", display:"grid", placeItems:"center" }}>
          <ChevronLeft size={16}/>
        </button>
        <button onClick={() => setIdx(i => (i+1)%total)}
          style={{ position:"absolute", top:"50%", right:8,
            transform:"translateY(-50%)", width:28, height:28,
            borderRadius:999, border:"none", background:"rgba(255,255,255,.9)",
            cursor:"pointer", display:"grid", placeItems:"center" }}>
          <ChevronRight size={16}/>
        </button>
        <div style={{ position:"absolute", bottom:8, left:"50%",
          transform:"translateX(-50%)", display:"flex", gap:4 }}>
          {Array.from({length:total}).map((_,i) => (
            <div key={i} onClick={() => setIdx(i)}
              style={{ width:i===idx?14:5, height:5, borderRadius:99,
                background:i===idx?C.gold:"rgba(255,255,255,.5)",
                cursor:"pointer", transition:"all .2s" }}/>
          ))}
        </div>
      </>)}
    </div>
  );
}


/* ════════════════════════════════════════════
   ⭐ COMPOSANT ÉTOILES
════════════════════════════════════════════ */
function StarRating({ rating=0, count=0, size=12, interactive=false, onRate }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || rating;
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:3 }}>
      <div style={{ display:"flex", gap:1 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i}
            onClick={() => interactive && onRate && onRate(i)}
            onMouseEnter={() => interactive && setHovered(i)}
            onMouseLeave={() => interactive && setHovered(0)}
            style={{ cursor:interactive?"pointer":"default",
              fontSize:size, lineHeight:1,
              color: i<=display ? "#F5A623" : "#DDD",
              transition:"color .15s" }}>
            ★
          </span>
        ))}
      </div>
      {count>0 && (
        <span style={{ fontSize:size-1, color:"#8A7A6A", marginLeft:2 }}>
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}
/* ════════════════════════════════════════════
   🎨 SÉLECTEUR DE VARIANTES
════════════════════════════════════════════ */
function VariantPicker({ p, selected, onSelect, t, dark }) {
  if (!p.variants || p.variants.length === 0) return null;
  const isColor = p.variants[0]?.type === "color";
  const isSize  = p.variants[0]?.type === "size";
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:12.5, fontWeight:600, color: dark ? C.dMute : C.mute,
        marginBottom:8 }}>
        {isColor ? t.chooseColor : isSize ? t.chooseSize : t.chooseVariant}
        {selected && <span style={{ color:C.gold, marginLeft:6 }}>→ {selected.label}</span>}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {p.variants.map((v, i) => {
          const active = selected?.label === v.label;
          const oos    = v.stock === 0;
          if (isColor) return (
            <button key={i} onClick={() => !oos && onSelect(v)}
              title={v.label}
              style={{ width:32, height:32, borderRadius:999,
                background:v.hex, border:`3px solid ${active ? C.gold : "transparent"}`,
                outline: active ? `2px solid ${C.gold}` : "none",
                cursor: oos ? "not-allowed" : "pointer",
                opacity: oos ? .4 : 1,
                position:"relative", flexShrink:0 }}>
              {oos && <div style={{ position:"absolute", inset:0, borderRadius:999,
                background:"rgba(0,0,0,.4)", display:"grid", placeItems:"center" }}>
                <X size={12} color="#fff"/>
              </div>}
            </button>
          );
          return (
            <button key={i} onClick={() => !oos && onSelect(v)}
              style={{ padding:"6px 12px", borderRadius:8, fontSize:13, fontWeight:600,
                border:`1.5px solid ${active ? C.gold : bord}`,
                background: active ? C.ink : "none",
                color: active ? C.gold : text,
                cursor: oos ? "not-allowed" : "pointer",
                opacity: oos ? .4 : 1,
                textDecoration: oos ? "line-through" : "none" }}>
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   🛍 CARTE PRODUIT
════════════════════════════════════════════ */
function ProductCard({ p, t, cats, onOpen, onAdd, dark, idx, mounted, isFav, onToggleFav }) {
  const out  = p.stock === 0;
  const low  = p.stock > 0 && p.stock <= 5;
  const bg   = dark ? C.dCard : C.card;
  const bord = dark ? C.dBorder : C.border;
  const text = dark ? C.dText : C.ink;
  const displayPrice = p.discount > 0
    ? Math.round(p.price * (1 - p.discount/100)) : p.price;

  const shareArticle = e => {
    e.stopPropagation();
    const msg = t.shareMsg
      .replace("{name}", p.name)
      .replace("{price}", fcfa(displayPrice));
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div onClick={() => onOpen(p)} className="dd-card"
      style={{ background:bg, borderRadius:16, overflow:"hidden",
        border:`1px solid ${bord}`, cursor:"pointer",
        opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(12px)",
        transition:`opacity .5s ${idx*40}ms, transform .5s ${idx*40}ms, box-shadow .2s` }}>
      {/* Image */}
      <div style={{ position:"relative", aspectRatio:"1/1",
        background: dark ? "#1A1510" : C.creamD }}>
        <Thumb p={p}/>
        {/* Badges */}
        <div style={{ position:"absolute", top:8, left:8,
          display:"flex", flexDirection:"column", gap:3 }}>
          {p.isNew && <span style={{ background:C.ink, color:C.gold, fontSize:9,
            fontWeight:700, padding:"2px 7px", borderRadius:999,
            letterSpacing:.8, border:`1px solid ${C.gold}44` }}>
            {t.newBadge.toUpperCase()}
          </span>}
          {p.isBest && <span style={{ background:C.gold, color:C.ink,
            fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:999 }}>
            ✦ TOP
          </span>}
          {p.discount > 0 && <span style={{ background:"#E05030", color:"#fff",
            fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:999 }}>
            -{p.discount}%
          </span>}
        </div>
        {out && <span style={{ position:"absolute", top:8, right:8,
          background:"rgba(26,26,26,.85)", color:"#fff",
          fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>
          {t.outStock.toUpperCase()}
        </span>}
        {low && !out && <span style={{ position:"absolute", top:8, right:8,
          background:C.gold, color:C.ink,
          fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>
          {t.lowStock} {p.stock}!
        </span>}
        {/* Favoris */}
        <button onClick={e => { e.stopPropagation(); onToggleFav(p.id); }}
          style={{ position:"absolute", bottom:8, right:8, width:28, height:28,
            borderRadius:999, border:"none", background:"rgba(255,255,255,.92)",
            display:"grid", placeItems:"center", cursor:"pointer" }}>
          <Heart size={13} color={isFav?C.gold:"#bbb"} fill={isFav?C.gold:"none"}/>
        </button>
        {/* Variantes couleurs sur la carte */}
        {p.variants?.length > 0 && p.variants[0]?.type === "color" && (
          <div style={{ position:"absolute", bottom:8, left:8,
            display:"flex", gap:3 }}>
            {p.variants.slice(0,4).map((v,i) => (
              <div key={i} style={{ width:12, height:12, borderRadius:999,
                background:v.hex, border:"1.5px solid rgba(255,255,255,.8)" }}/>
            ))}
            {p.variants.length > 4 && <span style={{ fontSize:9, color:"#fff",
              background:"rgba(0,0,0,.5)", padding:"1px 4px", borderRadius:999 }}>
              +{p.variants.length-4}
            </span>}
          </div>
        )}
      </div>
      {/* Infos */}
      <div style={{ padding:"11px 13px 14px" }}>
        <div style={{ fontSize:9.5, fontWeight:700, color:C.gold,
          letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>
          {p.brand}
        </div>
        <div style={{ fontFamily:"Georgia,serif", color:text,
          fontSize:13.5, lineHeight:1.3, marginBottom:4 }}>
          {p.name}
        </div>
        {/* Étoiles */}
        <div style={{ marginBottom:6 }}>
          <StarRating rating={p.rating||0} count={p.ratingCount||0} size={11}/>
          {(!p.rating||p.rating===0) && (
            <span style={{ fontSize:10, color:"#bbb" }}>Pas encore d'avis</span>
          )}
        </div>
        {/* Prix */}
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between" }}>
          <div>
            {p.discount > 0 && (
              <span style={{ fontSize:11, color: dark?C.dMute:C.mute,
                textDecoration:"line-through", display:"block" }}>
                {fcfa(p.price)}
              </span>
            )}
            <span style={{ fontFamily:"Georgia,serif", fontWeight:700,
              fontSize:14, color: p.discount>0 ? "#E05030" : text }}>
              {fcfa(displayPrice)}
            </span>
          </div>
          <button disabled={out} onClick={e => { e.stopPropagation(); onAdd(p); }}
            style={{ width:32, height:32, borderRadius:9, border:"none",
              background: out?"#ddd":C.ink, color: out?"#999":C.gold,
              cursor: out?"not-allowed":"pointer", display:"grid", placeItems:"center" }}>
            <Plus size={16}/>
          </button>
        </div>
        {/* Partager */}
        <button onClick={shareArticle}
          style={{ width:"100%", marginTop:7, padding:"6px",
            border:`1px solid ${bord}`, borderRadius:8,
            background:"none", color: dark?C.dMute:C.mute,
            cursor:"pointer", fontSize:11.5,
            display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <MessageCircle size={12}/> Partager
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   🔍 FICHE PRODUIT
════════════════════════════════════════════ */
function ProductModal({ p, t, onClose, onAdd, dark }) {
  const [qty, setQty]           = useState(1);
  const [variant, setVariant]   = useState(null);
  const [variantErr, setVariantErr] = useState(false);

  useEffect(() => { setVariant(null); setQty(1); setVariantErr(false); }, [p]);

  if (!p) return null;
  const out  = p.stock === 0;
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  const displayPrice = p.discount > 0
    ? Math.round(p.price * (1-p.discount/100)) : p.price;
  const hasVariants = p.variants && p.variants.length > 0;

  const handleAdd = () => {
    if (hasVariants && !variant) { setVariantErr(true); return; }
    onAdd(p, qty, variant);
    onClose();
  };

  const shareArticle = () => {
    const msg = t.shareMsg
      .replace("{name}", p.name)
      .replace("{price}", fcfa(displayPrice));
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:480, width:"100%" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"90vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          <Carousel p={p}/>
          <div style={{ marginTop:14 }}>
            {/* Marque */}
            <div style={{ fontSize:10, fontWeight:700, color:C.gold,
              letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>
              {p.brand}
            </div>
            {/* Nom */}
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:22,
              color:text, margin:"0 0 6px" }}>{p.name}</h3>
            {/* Étoiles */}
            <div style={{ marginBottom:8 }}>
              <StarRating rating={p.rating||0} count={p.ratingCount||0} size={14}/>
              {(!p.rating||p.rating===0) && (
                <span style={{ fontSize:11, color:"#bbb" }}>Pas encore d'avis</span>
              )}
            </div>
            {/* Prix */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontFamily:"Georgia,serif", fontWeight:700,
                fontSize:20, color: p.discount>0?"#E05030":C.gold }}>
                {fcfa(displayPrice)}
              </span>
              {p.discount > 0 && <>
                <span style={{ fontFamily:"Georgia,serif", fontSize:15,
                  color: dark?C.dMute:C.mute, textDecoration:"line-through" }}>
                  {fcfa(p.price)}
                </span>
                <span style={{ background:"#E05030", color:"#fff",
                  fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:999 }}>
                  -{p.discount}%
                </span>
              </>}
            </div>
            {/* Description */}
            <p style={{ color: dark?C.dMute:C.mute, fontSize:13.5,
              lineHeight:1.6, margin:"0 0 12px" }}>{p.desc}</p>
            {/* Stock */}
            <div style={{ fontSize:12, fontWeight:600, marginBottom:14,
              color: out?"#999":C.success }}>
              {out ? t.outStock : `${t.inStock} · ${p.stock} disponible${p.stock>1?"s":""}`}
            </div>

            {!out && (<>
              {/* Variantes */}
              <VariantPicker p={p} selected={variant} onSelect={v => { setVariant(v); setVariantErr(false); }} t={t} dark={dark}/>
              {variantErr && (
                <div style={{ color:"#E05030", fontSize:12.5, marginBottom:10,
                  display:"flex", alignItems:"center", gap:5 }}>
                  <AlertCircle size={13}/> Veuillez choisir une option avant d'ajouter
                </div>
              )}
              {/* Quantité + ajouter */}
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center",
                  border:`1px solid ${bord}`, borderRadius:9, overflow:"hidden" }}>
                  <button onClick={() => setQty(q=>Math.max(1,q-1))} style={stepBtn(dark)}>
                    <Minus size={13}/>
                  </button>
                  <span style={{ width:32, textAlign:"center",
                    fontWeight:700, color:text, fontSize:14 }}>{qty}</span>
                  <button onClick={() => setQty(q=>Math.min(p.stock,q+1))} style={stepBtn(dark)}>
                    <Plus size={13}/>
                  </button>
                </div>
                <button onClick={handleAdd}
                  style={{ flex:1, ...primaryBtn, justifyContent:"center" }}>
                  <ShoppingBag size={15}/> {t.addCart}
                </button>
              </div>
              {/* Partager */}
              <button onClick={shareArticle}
                style={{ width:"100%", padding:"10px",
                  border:`1px solid ${bord}`, borderRadius:10,
                  background:"none", color:"#25D366", cursor:"pointer",
                  fontSize:13.5, fontWeight:600,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                <MessageCircle size={16}/> Partager sur WhatsApp
              </button>
            </>)}

            {/* Rupture de stock */}
            {out && (
              <div style={{ background:`${C.danger}11`, border:`1px solid ${C.danger}33`,
                borderRadius:12, padding:"14px 16px", marginTop:8 }}>
                <p style={{ fontSize:13.5, color: dark?C.dText:C.ink,
                  margin:"0 0 10px", lineHeight:1.6 }}>
                  😔 <strong>{p.name}</strong> {t.outOfStockSearch}.<br/>
                  {t.outOfStockMsg}
                </p>
                <a href={`https://wa.me/${DEFAULT_CFG.whatsapp}?text=${encodeURIComponent(`Bonjour ! Je suis intéressée par "${p.name}" mais il est épuisé. Pouvez-vous me prévenir quand il est disponible ?`)}`}
                  target="_blank" rel="noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:7,
                    background:"#25D366", color:"#fff", textDecoration:"none",
                    padding:"10px 16px", borderRadius:10, fontWeight:700, fontSize:13.5 }}>
                  <MessageCircle size={16}/> Me prévenir sur WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   🛒 PANIER
════════════════════════════════════════════ */
function CartDrawer({ open, cart, products, onClose, onQty, onRemove, onCheckout, t, dark }) {
  const lines = cart.map(it => {
    const p = products.find(x => x.id === it.id);
    return p ? { ...p, qty:it.qty, variant:it.variant } : null;
  }).filter(Boolean);
  const total = lines.reduce((s,l) => {
    const price = l.discount>0 ? Math.round(l.price*(1-l.discount/100)) : l.price;
    return s + price * l.qty;
  }, 0);
  const bg   = dark ? C.dCard : "#fff";
  const bord = dark ? C.dBorder : C.border;
  const text = dark ? C.dText : C.ink;

  return (<>
    <div onClick={onClose}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:60,
        opacity:open?1:0, pointerEvents:open?"auto":"none", transition:"opacity .3s" }}/>
    <aside style={{ position:"fixed", top:0, right:0, height:"100%",
      width:"min(380px,90vw)", background:bg, zIndex:61,
      transform:open?"translateX(0)":"translateX(105%)",
      transition:"transform .35s cubic-bezier(.2,.8,.2,1)",
      display:"flex", flexDirection:"column",
      boxShadow:"-8px 0 32px rgba(0,0,0,.15)" }}>
      <div style={{ padding:"16px 18px", borderBottom:`1px solid ${bord}`,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:17, color:text }}>{t.cart}</span>
        <button onClick={onClose}
          style={{ border:"none", background:"none", cursor:"pointer", color:text }}>
          <X size={20}/>
        </button>
      </div>
      {total >= DEFAULT_CFG.freeFrom && (
        <div style={{ background:C.ink, color:C.gold, padding:"7px 16px",
          fontSize:12, fontWeight:600, textAlign:"center" }}>
          ✦ Livraison offerte pour cette commande
        </div>
      )}
      <div style={{ flex:1, overflowY:"auto", padding:14 }}>
        {lines.length === 0 ? (
          <div style={{ textAlign:"center", color: dark?C.dMute:"#bbb", marginTop:50 }}>
            <ShoppingBag size={38} strokeWidth={1.2}/>
            <p style={{ marginTop:10, fontSize:13.5 }}>{t.empty}<br/>{t.emptyHint}</p>
          </div>
        ) : lines.map(l => {
          const lPrice = l.discount>0 ? Math.round(l.price*(1-l.discount/100)) : l.price;
          return (
            <div key={`${l.id}-${l.variant?.label||""}`}
              style={{ display:"flex", gap:10, padding:"10px 0",
                borderBottom:`1px solid ${bord}` }}>
              <div style={{ width:58, height:58, borderRadius:9,
                overflow:"hidden", flexShrink:0 }}><Thumb p={l}/></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"Georgia,serif", fontSize:13,
                  color:text, marginBottom:2 }}>{l.name}</div>
                {l.variant && (
                  <div style={{ fontSize:11, color:C.gold, marginBottom:2,
                    display:"flex", alignItems:"center", gap:4 }}>
                    {l.variant.type==="color" && (
                      <div style={{ width:10, height:10, borderRadius:999,
                        background:l.variant.hex, border:`1px solid ${bord}` }}/>
                    )}
                    {l.variant.label}
                  </div>
                )}
                <div style={{ fontSize:12.5, color:C.gold, fontWeight:700 }}>
                  {fcfa(lPrice)}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:5 }}>
                  <div style={{ display:"flex", alignItems:"center",
                    border:`1px solid ${bord}`, borderRadius:7 }}>
                    <button onClick={() => onQty(l.id, l.qty-1, l.variant)}
                      style={stepBtnSm(dark)}><Minus size={11}/></button>
                    <span style={{ width:22, textAlign:"center",
                      fontSize:12, fontWeight:700, color:text }}>{l.qty}</span>
                    <button onClick={() => onQty(l.id, Math.min(l.stock,l.qty+1), l.variant)}
                      style={stepBtnSm(dark)}><Plus size={11}/></button>
                  </div>
                  <button onClick={() => onRemove(l.id, l.variant)}
                    style={{ border:"none", background:"none", cursor:"pointer", color:"#bbb" }}>
                    <Trash size={13}/>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {lines.length > 0 && (
        <div style={{ padding:16, borderTop:`1px solid ${bord}` }}>
          {total < DEFAULT_CFG.freeFrom && (
            <p style={{ fontSize:11, color:C.mute, margin:"0 0 8px" }}>
              Livraison offerte dès {fcfa(DEFAULT_CFG.freeFrom)}
            </p>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ color: dark?C.dMute:C.mute, fontSize:14 }}>{t.total}</span>
            <span style={{ fontFamily:"Georgia,serif", fontSize:18,
              fontWeight:700, color:text }}>{fcfa(total)}</span>
          </div>
          <button onClick={onCheckout}
            style={{ width:"100%", ...primaryBtn, justifyContent:"center" }}>
            {t.order} <ArrowRight size={15}/>
          </button>
        </div>
      )}
    </aside>
  </>);
}

/* ════════════════════════════════════════════
   💳 CHECKOUT
════════════════════════════════════════════ */
function Checkout({ open, lines, total, onClose, onClearCart, t, dark, promos, cfg }) {
  const [form, setForm]         = useState({ nom:"", tel:"", ville: cfg?.city||DEFAULT_CFG.city, adresse:"", note:"" });
  const [pay, setPay]           = useState("orange");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoErr, setPromoErr] = useState(false);
  const [sent, setSent]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [orderNum]              = useState(() => "DD-" + String(Math.floor(Math.random()*9000)+1000));
  const [copied, setCopied]     = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  const finalTotal = promoApplied
    ? Math.round(total * (1 - promoApplied.discount/100)) : total;
  const valid = form.nom.trim() && /^[0-9]{8}$/.test(form.tel.replace(/\s/g,"")) && form.ville.trim();

  if (!open) return null;
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  const payLabels = { orange:t.orange, moov:t.moov, wave:t.wave, livraison:t.delivery };
  const whatsapp  = cfg?.whatsapp || DEFAULT_CFG.whatsapp;

  const applyPromo = () => {
    const found = (promos||[]).find(p =>
      p.code === promoCode.toUpperCase().trim() &&
      p.active && p.uses < p.maxUses
    );
    if (found) { setPromoApplied(found); setPromoErr(false); }
    else { setPromoErr(true); setPromoApplied(null); }
  };

  const send = async () => {
    const items = lines.map(l => {
      const lPrice = l.discount>0 ? Math.round(l.price*(1-l.discount/100)) : l.price;
      const varStr = l.variant ? ` (${l.variant.label})` : "";
      return `• ${l.qty}x ${l.name}${varStr} — ${fcfa(lPrice*l.qty)}`;
    }).join("\n");
    const promoStr = promoApplied ? `\n🎁 Code promo : ${promoApplied.code} (-${promoApplied.discount}%)` : "";
    const msg = `Bonjour Dada's Drop 👋\nCommande #${orderNum}\n\n${items}${promoStr}\n\n💰 Total : ${fcfa(finalTotal)}\n💳 Règlement : ${payLabels[pay]}\n\nNom : ${form.nom}\nTél : ${form.tel}\nVille : ${form.ville}\nAdresse : ${form.adresse||"—"}\nNote : ${form.note||"—"}\n\n📍 J'envoie ma localisation WhatsApp pour la livraison.${pay!=="livraison"?"\n✅ Je joins la capture du paiement.":""}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    setSaving(true);
    try {
      await sb.post("orders", {
        id:orderNum,
        customer_name:form.nom,
        customer_phone:form.tel,
        ville:form.ville,
        quartier:form.adresse,
        note:form.note,
        items:lines.map(l=>l.name+(l.variant?` (${l.variant.label})`:"")+" x"+l.qty),
        total:finalTotal,
        payment:pay,
        status:1,
        assigned_to:null,
      });
    } catch(e) { console.warn("Supabase order:", e.message); }
    setSaving(false);
    setSent(true);
    if (typeof onClearCart === "function") onClearCart();
    if (onClearCart) onClearCart();
  };

  const copy = () => {
    navigator.clipboard?.writeText(orderNum).catch(()=>{});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:440, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"90vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          {sent ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:999,
                background:"#E8F8EF", display:"grid", placeItems:"center",
                margin:"0 auto 12px" }}>
                <Check size={24} color={C.success}/>
              </div>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:20,
                color:text, margin:"0 0 6px" }}>{t.sent}</h3>
              <p style={{ color: dark?C.dMute:C.mute, fontSize:13,
                lineHeight:1.5, margin:"0 0 14px" }}>
                {t.sentMsg}{pay!=="livraison"&&` ${t.capture}`}
              </p>
              <div style={{ background: dark?"#1A1510":C.creamD,
                border:`1px solid ${C.gold}33`, borderRadius:10,
                padding:"11px 14px", marginBottom:13 }}>
                <div style={{ fontSize:10, color: dark?C.dMute:C.mute, marginBottom:3 }}>
                  Numéro de commande
                </div>
                <div style={{ display:"flex", alignItems:"center",
                  justifyContent:"center", gap:8 }}>
                  <span style={{ fontFamily:"Georgia,serif", fontSize:18, color:C.gold }}>
                    {orderNum}
                  </span>
                  <button onClick={copy}
                    style={{ border:"none", background:"none", cursor:"pointer", color:C.gold }}>
                    {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                  </button>
                </div>
              </div>
              <button onClick={onClose} style={{ ...primaryBtn, width:"100%", justifyContent:"center" }}>
                {t.close}
              </button>
            </div>
          ) : (<>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:19,
              color:text, margin:"0 0 4px" }}>{t.finalize}</h3>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:12 }}>
              <span style={{ color:C.gold, fontWeight:700, fontSize:13 }}>
                {t.total} : {fcfa(finalTotal)}
              </span>
              {promoApplied && (
                <span style={{ fontSize:12, background:`${C.success}15`,
                  color:C.success, padding:"3px 8px", borderRadius:999,
                  fontWeight:600 }}>
                  -{promoApplied.discount}% appliqué ✓
                </span>
              )}
            </div>

            {/* Infos livraison */}
            <div style={{ background: dark?"#1A1510":C.creamD,
              border:`1px solid ${bord}`, borderRadius:9,
              padding:"8px 11px", fontSize:11.5, color: dark?C.dMute:C.mute, marginBottom:12 }}>
              {t.shippingNote} {fcfa(DEFAULT_CFG.freeFrom)}.
            </div>

            <Field label={t.name} dark={dark}>
              <input style={inpStyle(dark)} value={form.nom}
                onChange={set("nom")} placeholder="Ex : Awa Traoré"/>
            </Field>
            <Field label={t.phone} dark={dark}>
              <input
                style={{ ...inpStyle(dark), borderColor: form.tel &&
                  !/^[0-9]{8}$/.test(form.tel.replace(/\s/g,"")) ? "#E05030" : undefined }}
                value={form.tel}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9\s]/g,"");
                  if (v.replace(/\s/g,"").length <= 8) set("tel")({target:{value:v}});
                }}
                placeholder="Ex : 70 00 00 00" inputMode="numeric" maxLength={10}
              />
              {form.tel && !/^[0-9]{8}$/.test(form.tel.replace(/\s/g,"")) && (
                <span style={{ fontSize:11.5, color:"#E05030", marginTop:4, display:"block" }}>
                  ⚠️ Numéro valide à 8 chiffres requis
                </span>
              )}
            </Field>
            <div style={{ display:"flex", gap:8 }}>
              <Field label={t.city} dark={dark} flex>
                <input style={inpStyle(dark)} value={form.ville} onChange={set("ville")}/>
              </Field>
              <Field label={t.district} dark={dark} flex>
                <input style={inpStyle(dark)} value={form.adresse}
                  onChange={set("adresse")} placeholder="Ex : Karpala"/>
              </Field>
            </div>
            <div style={{ fontSize:11.5, color:C.gold, fontWeight:600, marginBottom:12 }}>
              {t.locMsg}
            </div>

            {/* Code promo */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color: dark?C.dMute:C.mute,
                marginBottom:6 }}>{t.promoCode}</div>
              <div style={{ display:"flex", gap:7 }}>
                <input value={promoCode}
                  onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoErr(false); }}
                  placeholder="Ex : DADA10"
                  style={{ ...inpStyle(dark), flex:1, marginBottom:0,
                    borderColor: promoErr?"#E05030": promoApplied?C.success:undefined }}/>
                <button onClick={applyPromo}
                  style={{ background: promoApplied?C.success:C.ink,
                    color: promoApplied?"#fff":C.gold,
                    border:`1px solid ${promoApplied?C.success:C.gold}44`,
                    borderRadius:10, padding:"0 14px", cursor:"pointer",
                    fontSize:13, fontWeight:700, display:"flex",
                    alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
                  {promoApplied ? <><CheckCircle size={13}/> OK</> : t.promoApply}
                </button>
              </div>
              {promoErr && <p style={{ color:"#E05030", fontSize:12, margin:"4px 0 0" }}>{t.promoInvalid}</p>}
              {promoApplied && <p style={{ color:C.success, fontSize:12, margin:"4px 0 0" }}>{t.promoApplied} -{promoApplied.discount}%</p>}
            </div>

            {/* Mode paiement */}
            <div style={{ fontSize:12.5, fontWeight:700, color:text, margin:"6px 0 7px" }}>
              {t.payment}
            </div>
            {[
              { key:"orange", icon:<Smartphone size={15} color="#FF6A00"/>, title:t.orange, sub:cfg?.orangeMoney||DEFAULT_CFG.orangeMoney },
              { key:"moov",   icon:<Smartphone size={15} color="#0066B3"/>, title:t.moov,   sub:cfg?.moovMoney||DEFAULT_CFG.moovMoney },
              { key:"wave",   icon:<Smartphone size={15} color="#1DC0D4"/>, title:t.wave,   sub:cfg?.wave||DEFAULT_CFG.wave },
              { key:"livraison", icon:<Truck size={15} color={C.gold}/>, title:t.delivery, sub:t.deliverySub },
            ].map(({ key, icon, title, sub }) => (
              <button key={key} onClick={() => setPay(key)}
                style={{ width:"100%", display:"flex", alignItems:"center",
                  gap:10, padding:"9px 11px", marginBottom:6, borderRadius:10,
                  cursor:"pointer", textAlign:"left",
                  border:`1.5px solid ${pay===key?C.gold:bord}`,
                  background: pay===key ? (dark?"#1A1510":C.creamD) : (dark?C.dCard:"#fff") }}>
                <span style={{ width:30, height:30, borderRadius:7,
                  background: dark?C.dBorder:C.creamD,
                  display:"grid", placeItems:"center" }}>{icon}</span>
                <span style={{ flex:1 }}>
                  <span style={{ display:"block", fontWeight:700, fontSize:13, color:text }}>{title}</span>
                  <span style={{ display:"block", fontSize:11, color: dark?C.dMute:C.mute }}>{sub}</span>
                </span>
                <span style={{ width:16, height:16, borderRadius:999,
                  border:`2px solid ${pay===key?C.gold:bord}`,
                  display:"grid", placeItems:"center" }}>
                  {pay===key && <span style={{ width:8, height:8,
                    borderRadius:999, background:C.gold }}/>}
                </span>
              </button>
            ))}

            <button onClick={send} disabled={!valid||saving}
              style={{ width:"100%", marginTop:12, justifyContent:"center",
                background:"#25D366", color:"#fff", border:"none", borderRadius:10,
                padding:"12px", fontWeight:700, fontSize:14,
                cursor: valid&&!saving?"pointer":"not-allowed",
                display:"flex", alignItems:"center", gap:7,
                opacity: valid&&!saving?1:.5 }}>
              <MessageCircle size={16}/> {saving?"Enregistrement…":t.send}
            </button>
          </>)}
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   📦 SUIVI COMMANDE
════════════════════════════════════════════ */
function TrackModal({ open, onClose, t, dark }) {
  const [num, setNum]         = useState("");
  const [tel, setTel]         = useState("");
  const [searchMode, setMode] = useState("id"); // "id" ou "phone"
  const [result, setResult]   = useState(null);
  const [results, setResults] = useState([]); // recherche par téléphone
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(false);

  if (!open) return null;
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  const steps = [t.statusPrep, t.statusShip, t.statusDeliv];
  const icons = [<Package size={13}/>, <Truck size={13}/>, <MapPin size={13}/>];

  const trackById = async () => {
    setLoading(true); setResult(null); setResults([]); setNotFound(false);
    const upper = num.toUpperCase().trim();
    try {
      const rows = await sb.get("orders", `?id=eq.${upper}&select=*`);
      if (rows?.length > 0) { setResult(rows[0]); setLoading(false); return; }
    } catch(e) { console.warn(e.message); }
    const demo = DEMO_ORDERS_TRACK[upper];
    if (demo) setResult(demo); else setNotFound(true);
    setLoading(false);
  };

  const trackByPhone = async () => {
    setLoading(true); setResult(null); setResults([]); setNotFound(false);
    const cleaned = tel.replace(/\s/g,"");
    try {
      const rows = await sb.get("orders", `?phone=eq.${cleaned}&select=*&order=date.desc`);
      if (rows?.length > 0) { setResults(rows); setLoading(false); return; }
    } catch(e) { console.warn(e.message); }
    // Fallback démo
    const demos = Object.entries(DEMO_ORDERS_TRACK)
      .filter(([,o]) => o.phone === cleaned)
      .map(([id,o]) => ({...o, id}));
    if (demos.length > 0) setResults(demos); else setNotFound(true);
    setLoading(false);
  };

  const renderTimeline = (o) => (
    <div style={{ display:"flex", justifyContent:"space-between",
      position:"relative", marginBottom:14 }}>
      <div style={{ position:"absolute", top:14, left:"10%", right:"10%",
        height:2, background: dark?C.dBorder:C.border, zIndex:0 }}>
        <div style={{ height:"100%", width:`${((o.status-1)/2)*100}%`,
          background:GRAD, borderRadius:99, transition:"width .6s" }}/>
      </div>
      {steps.map((s,i) => {
        const done = i < o.status, active = i === o.status-1;
        return (
          <div key={i} style={{ display:"flex", flexDirection:"column",
            alignItems:"center", gap:5, zIndex:1, flex:1 }}>
            <div style={{ width:28, height:28, borderRadius:999,
              background: done?C.ink:(dark?C.dBorder:C.border),
              display:"grid", placeItems:"center",
              border: done?`2px solid ${C.gold}`:"none",
              boxShadow: active?`0 0 0 4px ${C.gold}33`:"none" }}>
              <span style={{ color: done?C.gold:"#bbb" }}>{icons[i]}</span>
            </div>
            <span style={{ fontSize:10, fontWeight:active?700:400,
              color: done?text:"#bbb", textAlign:"center" }}>{s}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:420, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"88vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:19,
            color:text, margin:"0 0 14px" }}>{t.trackTitle}</h3>

          {/* Toggle mode */}
          <div style={{ display:"flex", gap:6, marginBottom:12 }}>
            {[["id","N° commande"],["phone","Téléphone"]].map(([m,l]) => (
              <button key={m} onClick={() => { setMode(m); setResult(null); setResults([]); setNotFound(false); }}
                style={{ flex:1, padding:"8px", borderRadius:9,
                  border:`1.5px solid ${searchMode===m?C.gold:bord}`,
                  background: searchMode===m?C.ink:"none",
                  color: searchMode===m?C.gold:text,
                  cursor:"pointer", fontSize:13, fontWeight:600 }}>
                {l}
              </button>
            ))}
          </div>

          {searchMode === "id" ? (
            <div style={{ display:"flex", gap:7 }}>
              <input value={num} onChange={e=>setNum(e.target.value)}
                placeholder="Ex : DD-001" style={{ ...inpStyle(dark), flex:1 }}
                onKeyDown={e=>e.key==="Enter"&&trackById()}/>
              <button onClick={trackById}
                style={{ ...primaryBtn, padding:"9px 14px" }}>
                {loading?"…":t.trackBtn}
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", gap:7 }}>
              <input value={tel}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9]/g,"");
                  if (v.length <= 8) setTel(v);
                }}
                placeholder="Ex : 70000000" inputMode="numeric"
                maxLength={8}
                style={{ ...inpStyle(dark), flex:1 }}
                onKeyDown={e=>e.key==="Enter"&&trackByPhone()}/>
              <button onClick={trackByPhone}
                style={{ ...primaryBtn, padding:"9px 14px" }}>
                {loading?"…":t.trackBtn}
              </button>
            </div>
          )}

          {notFound && (
            <p style={{ color:C.danger, fontSize:12.5, marginTop:8 }}>
              {t.trackNotFound}
            </p>
          )}

          {/* Résultat par ID */}
          {result && (
            <div style={{ marginTop:16 }}>
              <div style={{ background: dark?"#1A1510":C.creamD,
                border:`1px solid ${C.gold}33`, borderRadius:11,
                padding:"11px 13px", marginBottom:14 }}>
                <div style={{ fontFamily:"Georgia,serif", fontWeight:700,
                  color:text, marginBottom:3 }}>
                  #{result.id || num.toUpperCase()}
                </div>
                {(result.items||[]).map((item,i) => (
                  <div key={i} style={{ fontSize:12.5, color: dark?C.dMute:C.mute }}>
                    • {item}
                  </div>
                ))}
                <div style={{ fontSize:13, color:C.gold, fontWeight:700, marginTop:5 }}>
                  {fcfa(result.total)}
                </div>
              </div>
              {renderTimeline(result)}
              {result.status === 3 && (
                commentSent ? (
                  <div style={{ display:"flex", alignItems:"center", gap:7,
                    color:C.success, fontSize:13, fontWeight:600 }}>
                    <CheckCircle size={16}/> Merci pour votre avis ✦
                  </div>
                ) : (<>
                  <div style={{ fontSize:12.5, fontWeight:700, color:text, marginBottom:8 }}>
                    {t.comment}
                  </div>
                  {/* Note étoiles */}
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11.5, color:dark?C.dMute:C.mute, marginBottom:5 }}>
                      Votre note :
                    </div>
                    <StarRating
                      rating={comment.stars||0} size={28} interactive
                      onRate={v=>setComment(c=>({...c,stars:v}))}/>
                  </div>
                  <textarea value={comment.text||""} onChange={e=>setComment(c=>({...c,text:e.target.value}))}
                    rows={3} placeholder="Partagez votre expérience…"
                    style={{ ...inpStyle(dark), resize:"vertical" }}/>
                  <button onClick={()=>setCommentSent(true)}
                    disabled={!comment.stars}
                    style={{ ...primaryBtn, marginTop:7, width:"100%",
                      justifyContent:"center", opacity:comment.stars?1:.5 }}>
                    <Star size={14}/> {t.commentSend}
                  </button>
                  {!comment.stars && (
                    <p style={{ fontSize:11, color:C.mute, margin:"4px 0 0", textAlign:"center" }}>
                      Donnez au moins une note pour envoyer votre avis
                    </p>
                  )}
                </>)
              )}
            </div>
          )}

          {/* Résultats par téléphone */}
          {results.length > 0 && (
            <div style={{ marginTop:16 }}>
              <p style={{ fontSize:12.5, color: dark?C.dMute:C.mute, marginBottom:10 }}>
                {results.length} commande{results.length>1?"s":""} trouvée{results.length>1?"s":""}
              </p>
              {results.map((o,i) => (
                <div key={i} style={{ background: dark?"#1A1510":C.creamD,
                  border:`1px solid ${bord}`, borderRadius:11,
                  padding:"12px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    marginBottom:8 }}>
                    <span style={{ fontFamily:"Georgia,serif", fontWeight:700,
                      color:text }}>#{o.id}</span>
                    <span style={{ fontSize:11, color:STATUS_COLORS[o.status],
                      fontWeight:600 }}>{STATUS_LABELS[o.status]}</span>
                  </div>
                  {renderTimeline(o)}
                  <div style={{ fontSize:13, color:C.gold, fontWeight:700 }}>
                    {fcfa(o.total)} · {o.date}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize:11, color: dark?C.dMute:"#bbb",
            marginTop:12, textAlign:"center" }}>
            Démo : DD-001, DD-002, DD-003
          </p>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   📋 FILTRE (Bottom Sheet)
════════════════════════════════════════════ */
function FilterPanel({ cats, cat, setCat, sort, setSort, inStock, setInStock,
  minPrice, setMinPrice, maxPrice, setMaxPrice, lang, dark, text, bord }) {
  const [open, setOpen] = useState(false);
  const active = (cat>0?1:0)+(inStock?1:0)+(minPrice||maxPrice?1:0)+(sort!=="new"?1:0);

  useEffect(() => {
    document.body.classList.toggle("filter-open", open);
    return () => document.body.classList.remove("filter-open");
  }, [open]);

  const close = () => setOpen(false);
  const allCats = [{ id:"all", label:"Tout", labelEn:"All", soon:false }, ...cats];

  return (<>
    <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
      <button onClick={() => setOpen(true)}
        style={{ display:"inline-flex", alignItems:"center", gap:7,
          padding:"9px 16px", borderRadius:10,
          border:`1.5px solid ${active>0?C.gold:bord}`,
          background: active>0?C.ink:(dark?C.dCard:"#fff"),
          color: active>0?C.gold:text, cursor:"pointer",
          fontSize:13.5, fontWeight:600 }}>
        <Filter size={15}/> {lang==="fr"?"Filtrer":"Filter"}
        {active>0 && <span style={{ background:C.gold, color:C.ink,
          fontSize:10, fontWeight:800, width:18, height:18,
          borderRadius:999, display:"grid", placeItems:"center" }}>{active}</span>}
      </button>
      {cat>0 && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:5,
          padding:"7px 12px", borderRadius:999,
          background:`${C.gold}18`, border:`1px solid ${C.gold}44`,
          fontSize:12.5, color:C.gold, fontWeight:600 }}>
          {allCats.find(c=>c.id===cat)?.[lang==="fr"?"label":"labelEn"]||cat}
          <button onClick={() => setCat(0)}
            style={{ border:"none", background:"none", cursor:"pointer",
              color:C.gold, padding:0 }}><X size={12}/></button>
        </div>
      )}
    </div>

    {open && <div onClick={close}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)",
        zIndex:60, animation:"ddFade .2s ease" }}/>}

    <div style={{ position:"fixed", bottom:0, left:0, right:0,
      background: dark?C.dCard:"#fff", zIndex:61,
      borderRadius:"20px 20px 0 0", padding:"0 0 env(safe-area-inset-bottom,20px)",
      transform: open?"translateY(0)":"translateY(105%)",
      transition:"transform .35s cubic-bezier(.2,.8,.2,1)",
      maxHeight:"82vh", overflowY:"auto",
      boxShadow:"0 -8px 32px rgba(0,0,0,.2)" }}>
      <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
        <div style={{ width:40, height:4, borderRadius:99,
          background: dark?C.dBorder:C.border }}/>
      </div>
      <div style={{ padding:"14px 20px 0", display:"flex",
        justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:17, color:text }}>
          {lang==="fr"?"Filtres":"Filters"}
        </span>
        <div style={{ display:"flex", gap:8 }}>
          {active>0 && <button onClick={() => { setCat(0);setSort("new");setInStock(false);setMinPrice("");setMaxPrice(""); }}
            style={{ fontSize:12.5, color:C.gold, background:"none", border:"none", cursor:"pointer" }}>
            {lang==="fr"?"Tout effacer":"Clear all"}
          </button>}
          <button onClick={close}
            style={{ border:"none", background:"none", cursor:"pointer", color:text }}>
            <X size={20}/>
          </button>
        </div>
      </div>
      <div style={{ padding:"16px 20px" }}>
        {/* Catégories */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color: dark?C.dMute:C.mute,
            letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>
            {lang==="fr"?"Catégorie":"Category"}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {allCats.map((c,i) => {
              const label = lang==="fr" ? c.label : c.labelEn;
              const active = cat===(i===0?"all":c.id) || (i===0&&cat===0);
              return (
                <button key={c.id} onClick={() => setCat(i===0?0:c.id)}
                  style={{ padding:"8px 14px", borderRadius:999, fontSize:13,
                    fontWeight:600, cursor:"pointer",
                    border:`1.5px solid ${active?C.gold:bord}`,
                    background: active?C.ink:(dark?C.dCard:"#fff"),
                    color: active?C.gold:text,
                    opacity: c.soon?.5:1 }}>
                  {label}{c.soon && <span style={{ fontSize:9, marginLeft:4, opacity:.6 }}>
                    · {lang==="fr"?"bientôt":"soon"}
                  </span>}
                </button>
              );
            })}
          </div>
        </div>
        {/* Tri */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color: dark?C.dMute:C.mute,
            letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>
            {lang==="fr"?"Trier par":"Sort by"}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {[
              ["new",  lang==="fr"?"Nouveautés":"New arrivals"],
              ["asc",  lang==="fr"?"Prix croissant":"Price ↑"],
              ["desc", lang==="fr"?"Prix décroissant":"Price ↓"],
            ].map(([val,label]) => (
              <button key={val} onClick={() => setSort(val)}
                style={{ padding:"8px 14px", borderRadius:999, fontSize:13,
                  fontWeight:600, cursor:"pointer",
                  border:`1.5px solid ${sort===val?C.gold:bord}`,
                  background: sort===val?C.ink:(dark?C.dCard:"#fff"),
                  color: sort===val?C.gold:text }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* En stock */}
        <div style={{ marginBottom:20 }}>
          <button onClick={() => setInStock(v=>!v)}
            style={{ display:"inline-flex", alignItems:"center", gap:8,
              padding:"10px 16px", borderRadius:10, cursor:"pointer",
              fontSize:13.5, fontWeight:600,
              border:`1.5px solid ${inStock?C.gold:bord}`,
              background: inStock?(dark?"#1A1510":C.creamD):(dark?C.dCard:"#fff"),
              color:text, width:"100%" }}>
            <span style={{ width:20, height:20, borderRadius:5,
              border:`2px solid ${inStock?C.gold:(dark?C.dBorder:"#ddd")}`,
              background: inStock?C.gold:"transparent",
              display:"grid", placeItems:"center", flexShrink:0 }}>
              {inStock && <Check size={12} color={C.ink}/>}
            </span>
            {lang==="fr"?"En stock uniquement":"In stock only"}
          </button>
        </div>
        {/* Budget */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color: dark?C.dMute:C.mute,
            letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>
            Budget (FCFA)
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <input type="number" value={minPrice} onChange={e=>setMinPrice(e.target.value)}
              placeholder="Min" style={{ flex:1, padding:"10px 12px", borderRadius:9,
                border:`1.5px solid ${minPrice?C.gold:bord}`,
                background: dark?C.dCard:"#fff", fontSize:"16px",
                color:text, fontFamily:"inherit" }}/>
            <span style={{ color: dark?C.dMute:C.mute }}>—</span>
            <input type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}
              placeholder="Max" style={{ flex:1, padding:"10px 12px", borderRadius:9,
                border:`1.5px solid ${maxPrice?C.gold:bord}`,
                background: dark?C.dCard:"#fff", fontSize:"16px",
                color:text, fontFamily:"inherit" }}/>
          </div>
        </div>
        <button onClick={close}
          style={{ width:"100%", padding:"14px", background:C.ink, color:C.gold,
            border:`1px solid ${C.gold}44`, borderRadius:12, fontWeight:700,
            fontSize:15, cursor:"pointer", display:"flex", alignItems:"center",
            justifyContent:"center", gap:7 }}>
          <Check size={16}/> {lang==="fr"?"Appliquer":"Apply"}
          {active>0 && <span style={{ background:C.gold, color:C.ink,
            fontSize:11, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>
            {active}
          </span>}
        </button>
      </div>
    </div>
  </>);
}

/* ════════════════════════════════════════════
   📜 MENU LATÉRAL
════════════════════════════════════════════ */
function SideMenu({ open, onClose, t, lang, setLang, dark, setPage, setCat, cats, favs=[] }) {
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  return (<>
    <div onClick={onClose}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:60,
        opacity:open?1:0, pointerEvents:open?"auto":"none", transition:"opacity .3s" }}/>
    <div style={{ position:"fixed", top:0, left:0, height:"100%",
      width:"min(320px,82vw)", background: dark?C.dCard:"#fff", zIndex:61,
      transform: open?"translateX(0)":"translateX(-105%)",
      transition:"transform .35s cubic-bezier(.2,.8,.2,1)",
      display:"flex", flexDirection:"column", overflowY:"auto" }}>
      <div style={{ padding:"18px 20px", borderBottom:`1px solid ${bord}`,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:13, fontWeight:700,
          color: dark?C.dMute:C.mute, letterSpacing:1 }}>MENU</span>
        <button onClick={onClose}
          style={{ border:"none", background:"none", cursor:"pointer", color:text }}>
          <X size={20}/>
        </button>
      </div>
      <div style={{ flex:1, padding:"20px 24px" }}>
        {[{ label:t.home, page:"home" },{ label:t.catalogue, page:"catalogue" }].map((item,i) => (
          <button key={i} onClick={() => { setPage(item.page); onClose(); }}
            style={{ display:"block", width:"100%", textAlign:"left",
              padding:"9px 0", border:"none", background:"none", cursor:"pointer",
              fontFamily:"Georgia,serif", fontSize:17, color:text }}>
            {item.label}
          </button>
        ))}
        {/* Favoris */}
        <button onClick={() => { setPage("favs"); onClose(); }}
          style={{ display:"flex", alignItems:"center", gap:8, width:"100%",
            textAlign:"left", padding:"9px 0", border:"none",
            background:"none", cursor:"pointer",
            fontFamily:"Georgia,serif", fontSize:17, color:text }}>
          <Heart size={16} color={C.gold} fill={C.gold}/> Mes favoris
          {favs && favs.length>0 && (
            <span style={{ background:C.gold, color:C.ink, fontSize:10,
              fontWeight:800, padding:"2px 7px", borderRadius:999 }}>
              {favs.length}
            </span>
          )}
        </button>
        {/* Séparateur */}
        <div style={{ height:1, background:dark?C.dBorder:C.border, margin:"8px 0 12px" }}/>
        <div style={{ marginTop:16, marginBottom:8 }}>
          <span style={{ fontSize:10, fontWeight:700, color: dark?C.dMute:C.mute,
            letterSpacing:2, textTransform:"uppercase" }}>Collections</span>
        </div>
        {cats.map(c => {
          const label = lang==="fr" ? c.label : c.labelEn;
          return (
            <button key={c.id} onClick={() => { setPage("catalogue"); setCat(c.id); onClose(); }}
              style={{ display:"block", width:"100%", textAlign:"left",
                padding:"8px 0", border:"none", background:"none", cursor:"pointer",
                fontFamily:"Georgia,serif", fontSize:16, color:text }}>
              {label}
              {c.soon && <span style={{ fontSize:10, color: dark?C.dMute:C.mute,
                marginLeft:6 }}>· bientôt</span>}
            </button>
          );
        })}
        <div style={{ marginTop:16 }}>
          <button onClick={() => { setPage("about"); onClose(); }}
            style={{ display:"block", width:"100%", textAlign:"left",
              padding:"9px 0", border:"none", background:"none", cursor:"pointer",
              fontFamily:"Georgia,serif", fontSize:17, color:text }}>
            {t.about}
          </button>
        </div>
      </div>
      <div style={{ padding:"16px 24px", borderTop:`1px solid ${bord}` }}>
        <button onClick={() => setLang(l=>l==="fr"?"en":"fr")}
          style={{ display:"flex", alignItems:"center", gap:8, background:"none",
            border:`1px solid ${bord}`, borderRadius:8, padding:"8px 12px",
            cursor:"pointer", color:text, fontSize:13, fontWeight:600 }}>
          <Globe size={14}/> {lang==="fr"?"Passer en anglais":"Switch to French"}
        </button>
      </div>
    </div>
  </>);
}

/* ════════════════════════════════════════════
   📄 PAGE À PROPOS
════════════════════════════════════════════ */
function AboutPage({ dark, cfg }) {
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  const whatsapp = cfg?.whatsapp || DEFAULT_CFG.whatsapp;
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 20px" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <LogoDD size={64}/>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:28, color:text, margin:"16px 0 8px" }}>
          Dada's Drop
        </h1>
        <p style={{ fontSize:14, color: dark?C.dMute:C.mute, lineHeight:1.7 }}>
          Collection Premium · Ouagadougou, Burkina Faso
        </p>
      </div>
      <div style={{ background: dark?C.dCard:"#fff", border:`1px solid ${bord}`,
        borderRadius:16, padding:"24px 28px", marginBottom:16 }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:"0 0 12px" }}>
          Notre histoire
        </h2>
        <p style={{ fontSize:14, color: dark?C.dMute:C.mute, lineHeight:1.8 }}>
          Dada's Drop est née d'une passion pour l'élégance accessible. Nous sélectionnons avec soin des sacs et accessoires de qualité premium, importés pour vous et livrés directement à Ouagadougou.
        </p>
      </div>
      <div style={{ background: dark?C.dCard:"#fff", border:`1px solid ${bord}`,
        borderRadius:16, padding:"24px 28px" }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:"0 0 12px" }}>
          Nous contacter
        </h2>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
            style={{ display:"flex", alignItems:"center", gap:10,
              color:"#25D366", textDecoration:"none", fontWeight:600, fontSize:14 }}>
            <MessageCircle size={18}/> WhatsApp — +{whatsapp}
          </a>
          {[
            ["Orange Money", cfg?.orangeMoney||DEFAULT_CFG.orangeMoney],
            ["Moov Money",   cfg?.moovMoney||DEFAULT_CFG.moovMoney],
            ["Wave",         cfg?.wave||DEFAULT_CFG.wave],
          ].map(([label,val]) => (
            <div key={label}
              style={{ display:"flex", alignItems:"center", gap:10,
                color: dark?C.dMute:C.mute, fontSize:14 }}>
              <Smartphone size={18}/> {label} — {val}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   📜 PAGES LÉGALES
════════════════════════════════════════════ */
const LEGAL = {
  legal:{ title:"Mentions légales", content:[
    { h:"Éditeur", p:"Dada's Drop — boutique en ligne de sacs et accessoires de mode, Ouagadougou, Burkina Faso. Responsable : David Amah." },
    { h:"Hébergement", p:"Vercel Inc., 340 Pine Street, Suite 700, San Francisco, CA 94104, États-Unis." },
    { h:"Propriété intellectuelle", p:"Tout le contenu (textes, images, logo) est la propriété exclusive de Dada's Drop. Toute reproduction est interdite sans autorisation." },
  ]},
  cgv:{ title:"Conditions Générales de Vente", content:[
    { h:"1. Objet", p:"Les présentes CGV régissent les ventes effectuées via le site Dada's Drop." },
    { h:"2. Produits", p:"Sacs et accessoires de mode de qualité premium. Dada's Drop s'engage à livrer des articles conformes à la description." },
    { h:"3. Prix", p:"Prix en FCFA. Susceptibles d'être modifiés à tout moment." },
    { h:"4. Commande", p:"Finalisée via WhatsApp. Effective après confirmation et paiement." },
    { h:"5. Paiement", p:"Orange Money, Moov Money, Wave, ou paiement à la livraison." },
    { h:"6. Livraison", p:"À Ouagadougou. Frais selon zone. Livraison offerte dès 20 000 FCFA." },
    { h:"7. Retours", p:"Contactez-nous dans les 24h suivant la livraison via WhatsApp." },
  ]},
  rgpd:{ title:"Politique de confidentialité", content:[
    { h:"Données collectées", p:"Nom, téléphone, adresse de livraison — uniquement pour traiter votre commande." },
    { h:"Conservation", p:"Durée nécessaire au traitement + 1 an maximum." },
    { h:"Partage", p:"Données jamais vendues. Partagées uniquement avec les livreurs." },
    { h:"Vos droits", p:"Accès, rectification, suppression via WhatsApp." },
    { h:"Cookies", p:"Uniquement cookies techniques (panier). Aucun cookie publicitaire." },
  ]},
  sav:{ title:"Service Après-Vente", content:[
    { h:"Contact", p:"WhatsApp 7j/7, 8h–20h (Ouagadougou). Réponse sous 2h en journée." },
    { h:"Article non conforme", p:"Contactez-nous dans les 24h avec photos. Échange ou remboursement." },
    { h:"Retard", p:"Contactez-nous avec votre numéro de commande." },
    { h:"Remboursement", p:"Par le même moyen de paiement, sous 48h." },
  ]},
};

function LegalPage({ type, dark, setPage }) {
  const content = LEGAL[type];
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 20px 60px" }}>
      <button onClick={() => setPage("home")}
        style={{ display:"flex", alignItems:"center", gap:6, background:"none",
          border:"none", cursor:"pointer", color: dark?C.dMute:C.mute,
          fontSize:13, marginBottom:24, padding:0 }}>
        <ArrowLeft size={14}/> Retour
      </button>
      <h1 style={{ fontFamily:"Georgia,serif", fontSize:26, color:text,
        margin:"0 0 24px", fontWeight:400 }}>{content.title}</h1>
      {content.content.map((s,i) => (
        <div key={i} style={{ background: dark?C.dCard:"#fff",
          border:`1px solid ${bord}`, borderRadius:14,
          padding:"20px 24px", marginBottom:14 }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, color:text, margin:"0 0 10px" }}>
            {s.h}
          </h2>
          <p style={{ fontSize:14, color: dark?C.dMute:C.mute, lineHeight:1.8, margin:0 }}>
            {s.p}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   🔒 PAGE 404
════════════════════════════════════════════ */
function Page404({ dark, setPage }) {
  const text = dark ? C.dText : C.ink;
  return (
    <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
      <div style={{ fontFamily:"Georgia,serif", fontSize:80, color:C.gold,
        lineHeight:1, marginBottom:16 }}>404</div>
      <h1 style={{ fontFamily:"Georgia,serif", fontSize:24, color:text,
        margin:"0 0 10px", fontWeight:400 }}>Page introuvable</h1>
      <p style={{ fontSize:15, color: dark?C.dMute:C.mute,
        margin:"0 0 28px", maxWidth:340 }}>
        Cette page n'existe pas ou a été déplacée.
      </p>
      <button onClick={() => setPage("home")} style={{ ...primaryBtn, gap:7 }}>
        <ArrowLeft size={15}/> Retour à l'accueil
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════
   🛍 SHOP APP
════════════════════════════════════════════ */
function ShopApp({ products, cats, cfg, promos, dark, setDark, initialPage="home" }) {
  const [lang, setLang]         = useState("fr");
  const [page, setPage]         = useState(initialPage);
  const [query, setQuery]       = useState("");
  const [cat, setCat]           = useState(0);
  const [sort, setSort]         = useState("new");
  const [inStock, setInStock]   = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [cart, setCart]         = useState(() => {
    try { const s = localStorage.getItem("dd_cart"); return s?JSON.parse(s):[]; } catch { return []; }
  });
  const [selected, setSelected]   = useState(null);
  const [cartOpen, setCartOpen]   = useState(false);
  const [checkout, setCheckout]   = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [favs, setFavs]           = useState(() => {
    try { const s = localStorage.getItem("dd_favs"); return s?JSON.parse(s):[]; } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem("dd_favs", JSON.stringify(favs)); } catch {}
  }, [favs]);

  const toggleFav = useCallback((id) => {
    setFavs(fs => fs.includes(id) ? fs.filter(x=>x!==id) : [...fs,id]);
  }, []);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);
  useEffect(() => {
    try { localStorage.setItem("dd_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);
  useEffect(() => {
    const isOpen = menuOpen||cartOpen||checkout||trackOpen||!!selected;
    document.body.style.overflow = isOpen?"hidden":"";
    return () => { document.body.style.overflow=""; };
  }, [menuOpen,cartOpen,checkout,trackOpen,selected]);

  const t    = T[lang];
  const bord = dark ? C.dBorder : C.border;
  const text = dark ? C.dText : C.ink;
  const bg   = dark ? C.dBg : C.cream;
  const hdrBg = dark ? "rgba(15,12,8,.92)" : "rgba(250,246,238,.92)";

  // Produits visibles : épinglés en premier, masqués filtrés
  const visibleProducts = useMemo(() => {
    const v = products.filter(p => !p.isHidden);
    return [...v.filter(p=>p.isPinned), ...v.filter(p=>!p.isPinned)];
  }, [products]);

  const list = useMemo(() => {
    let r = visibleProducts.filter(p => {
      if (query.trim()) {
        if (inStock && p.stock===0) return false;
        const q = query.toLowerCase().trim();
        return (
          (p.name||"").toLowerCase().includes(q) ||
          (p.brand||"").toLowerCase().includes(q) ||
          (p.cat||"").toLowerCase().includes(q) ||
          (p.desc||"").toLowerCase().includes(q) ||
          String(p.price).includes(q) ||
          (p.variants||[]).some(v=>v.label.toLowerCase().includes(q))
        );
      }
      if (cat && cat!=="all") {
        if (p.cat !== cat) return false;
        const catObj = cats.find(c=>c.id===cat);
        if (catObj?.soon) return false;
      }
      if (inStock && p.stock===0) return false;
      if (minPrice!=="" && p.price<parseInt(minPrice)) return false;
      if (maxPrice!=="" && p.price>parseInt(maxPrice)) return false;
      return true;
    });
    if (sort==="asc")  r = [...r].sort((a,b)=>a.price-b.price);
    if (sort==="desc") r = [...r].sort((a,b)=>b.price-a.price);
    return r;
  }, [query,cat,sort,inStock,visibleProducts,minPrice,maxPrice,cats]);

  const bestSellers = visibleProducts.filter(p=>p.isBest&&p.stock>0).slice(0,4);

  const addToCart = useCallback((p, qty=1, variant=null) => {
    setCart(c => {
      const key = `${p.id}-${variant?.label||""}`;
      const ex  = c.find(i => `${i.id}-${i.variant?.label||""}` === key);
      if (ex) return c.map(i =>
        `${i.id}-${i.variant?.label||""}` === key
          ? { ...i, qty:Math.min(p.stock, i.qty+qty) } : i
      );
      return [...c, { id:p.id, qty, variant }];
    });
    setCartOpen(true);
  }, []);

  const setQty = (id, qty, variant) => setCart(c => {
    const key = `${id}-${variant?.label||""}`;
    return qty<=0
      ? c.filter(i=>`${i.id}-${i.variant?.label||""}`!==key)
      : c.map(i=>`${i.id}-${i.variant?.label||""}`===key?{...i,qty}:i);
  });
  const removeItem = (id, variant) => setCart(c =>
    c.filter(i=>`${i.id}-${i.variant?.label||""}`!==`${id}-${variant?.label||""}`)
  );

  const lines = cart.map(it => {
    const p = products.find(x=>x.id===it.id);
    return p ? { ...p, qty:it.qty, variant:it.variant } : null;
  }).filter(Boolean);
  const total = lines.reduce((s,l) => {
    const price = l.discount>0?Math.round(l.price*(1-l.discount/100)):l.price;
    return s + price*l.qty;
  }, 0);
  const count = cart.reduce((s,i)=>s+i.qty,0);

  // Catégorie sélectionnée
  const selectedCat = cats.find(c=>c.id===cat);
  const heroTitle = cfg?.heroTitle || DEFAULT_CFG.heroTitle;
  const heroSub   = cfg?.heroSub   || DEFAULT_CFG.heroSub;
  const waMsg     = cfg?.waMessage || DEFAULT_CFG.waMessage;
  const whatsapp  = cfg?.whatsapp  || DEFAULT_CFG.whatsapp;

  return (
    <div style={{ background:bg, minHeight:"100vh", color:text,
      fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box}
        input,textarea,select{font-family:inherit}
        @supports(-webkit-touch-callout:none){input,textarea,select{font-size:16px!important}}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${C.gold}!important}
        .dd-card:hover{box-shadow:0 12px 28px rgba(0,0,0,.12);transform:translateY(-2px)!important}
        @keyframes ddFade{from{opacity:0}to{opacity:1}}
        @keyframes ddHero{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .dd-lang-btn{display:inline-flex}
        @media(max-width:600px){
          .dd-grid{grid-template-columns:repeat(2,1fr)!important}
          .dd-hero-title{font-size:26px!important}
          .dd-lang-btn{display:none!important}
        }
        body.filter-open{overflow:hidden!important;touch-action:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${C.gold}44;border-radius:99px}
      `}</style>

      {/* ── BANNIÈRE ── */}
      {cfg?.bannerActive && cfg?.bannerText && (
        <div style={{ background:cfg.bannerColor||C.gold,
          color: cfg.bannerColor===C.ink?"#fff":C.ink,
          padding:"9px 16px", fontSize:13, fontWeight:700,
          textAlign:"center", letterSpacing:.3 }}>
          {cfg.bannerText}
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ position:"sticky", top:0, zIndex:50,
        background:hdrBg, backdropFilter:"blur(14px)",
        borderBottom:`1px solid ${bord}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px",
          height:58, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Gauche */}
          <div style={{ display:"flex", alignItems:"center", gap:12, flex:1 }}>
            <button onClick={() => setMenuOpen(true)}
              style={{ border:"none", background:"none", cursor:"pointer", color:text, padding:4 }}>
              <Menu size={20}/>
            </button>
            <button onClick={() => setSearchOpen(v=>!v)}
              style={{ border:"none", background:"none", cursor:"pointer", color:text, padding:4 }}>
              <Search size={18}/>
            </button>
          </div>
          {/* Centre logo */}
          <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)",
            display:"flex", flexDirection:"column", alignItems:"center",
            cursor:"pointer", userSelect:"none" }}
            onClick={() => setPage("home")}>
            <span style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700,
              color:text, letterSpacing:3, lineHeight:1, whiteSpace:"nowrap" }}>
              DADA'S DROP
            </span>
            <span style={{ fontSize:7.5, color:C.gold, letterSpacing:3.5,
              marginTop:1, whiteSpace:"nowrap" }}>
              ✦ COLLECTION PREMIUM ✦
            </span>
          </div>
          {/* Droite */}
          <div style={{ display:"flex", alignItems:"center", gap:8,
            flex:1, justifyContent:"flex-end" }}>
            <button className="dd-lang-btn"
              onClick={() => setLang(l=>l==="fr"?"en":"fr")}
              style={{ border:`1px solid ${bord}`, background: dark?C.dCard:"#fff",
                borderRadius:7, padding:"5px 9px", cursor:"pointer",
                color:text, fontSize:11.5, fontWeight:700, letterSpacing:.5 }}>
              {t.lang}
            </button>
            <button onClick={() => setDark(v=>!v)}
              style={{ border:"none", background:"none", cursor:"pointer", color:text, padding:4 }}>
              {dark?<Sun size={18}/>:<Moon size={18}/>}
            </button>
            <button onClick={() => setCartOpen(true)}
              style={{ position:"relative", border:"none", background:"none",
                cursor:"pointer", color:text, padding:4 }}>
              <ShoppingBag size={20}/>
              {count>0 && <span style={{ position:"absolute", top:-6, right:-6,
                background:C.ink, color:C.gold, fontSize:9.5, fontWeight:800,
                minWidth:17, height:17, borderRadius:999,
                display:"grid", placeItems:"center", padding:"0 3px",
                border:`1.5px solid ${C.gold}` }}>{count}</span>}
            </button>
          </div>
        </div>

        {/* Barre recherche avec autocomplétion */}
        {searchOpen && (
          <div style={{ borderTop:`1px solid ${bord}`, padding:"10px 16px", background:hdrBg }}>
            <div style={{ maxWidth:600, margin:"0 auto", position:"relative" }}>
              <Search size={15} color={dark?C.dMute:C.mute}
                style={{ position:"absolute", left:11, top:14, zIndex:1 }}/>
              <input autoFocus value={query}
                onChange={e => { setQuery(e.target.value); setPage("catalogue"); setCat(0); }}
                onKeyDown={e => e.key==="Escape"&&(setQuery("")||setSearchOpen(false))}
                placeholder={t.search}
                style={{ width:"100%", padding:"9px 36px 9px 34px",
                  borderRadius: query&&visibleProducts.some(p=>p.name.toLowerCase().includes(query.toLowerCase())&&query.trim())
                    ? "8px 8px 0 0" : 8,
                  border:`1px solid ${bord}`,
                  background: dark?C.dCard:"#fff",
                  fontSize:"16px", color:text }}/>
              {query && <button onClick={() => { setQuery(""); setSearchOpen(false); }}
                style={{ position:"absolute", right:8, top:"50%",
                  transform:"translateY(-50%)", border:"none",
                  background:"none", cursor:"pointer", color: dark?C.dMute:C.mute }}>
                <X size={15}/>
              </button>}
              {/* Suggestions */}
              {query.trim().length>=1 && (() => {
                const q = query.toLowerCase().trim();
                const sugg = visibleProducts.filter(p =>
                  p.name.toLowerCase().includes(q)||
                  (p.brand||"").toLowerCase().includes(q)||
                  (p.variants||[]).some(v=>v.label.toLowerCase().includes(q))
                ).slice(0,6);
                if (!sugg.length) return null;
                return (
                  <div style={{ position:"absolute", top:"100%", left:0, right:0,
                    background: dark?C.dCard:"#fff",
                    border:`1px solid ${bord}`, borderTop:"none",
                    borderRadius:"0 0 10px 10px", zIndex:200,
                    boxShadow:"0 8px 24px rgba(0,0,0,.12)", overflow:"hidden" }}>
                    {sugg.map((p,i) => (
                      <button key={p.id}
                        onClick={() => { setQuery(p.name); setPage("catalogue"); setCat(0); setSearchOpen(false); }}
                        style={{ width:"100%", display:"flex", alignItems:"center",
                          gap:10, padding:"9px 14px", border:"none",
                          borderBottom:i<sugg.length-1?`1px solid ${dark?C.dBorder:C.border}`:"none",
                          background:"none", cursor:"pointer", textAlign:"left" }}
                        onMouseEnter={e=>e.currentTarget.style.background=dark?C.dBorder:C.creamD}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>
                        <div style={{ width:32, height:32, borderRadius:6,
                          overflow:"hidden", flexShrink:0 }}>
                          <Thumb p={p}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:text,
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {p.name.split(new RegExp(`(${query.trim()})`, "gi")).map((part,j) =>
                              part.toLowerCase()===q
                                ? <span key={j} style={{ color:C.gold }}>{part}</span>
                                : part
                            )}
                          </div>
                          <div style={{ fontSize:11, color: dark?C.dMute:C.mute }}>
                            {p.brand} · {fcfa(p.discount>0?Math.round(p.price*(1-p.discount/100)):p.price)}
                          </div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:600,
                          color: p.stock===0?C.danger:C.success }}>
                          {p.stock===0?"Épuisé":"En stock"}
                        </span>
                      </button>
                    ))}
                    <button onClick={() => { setPage("catalogue"); setCat(0); setSearchOpen(false); }}
                      style={{ width:"100%", padding:"9px 14px", border:"none",
                        background: dark?`${C.gold}11`:`${C.gold}0A`,
                        cursor:"pointer", color:C.gold, fontSize:12.5, fontWeight:700,
                        textAlign:"center", display:"flex", alignItems:"center",
                        justifyContent:"center", gap:5 }}>
                      <Search size={13}/> Voir tous les résultats pour "{query}"
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </header>

      {/* ── PAGES ── */}
      {page==="home" && (<>
        {/* HERO */}
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"20px 16px 0",
          animation:"ddHero .7s ease both" }}>
          <div style={{ borderRadius:20, overflow:"hidden", position:"relative",
            background:C.ink, minHeight:360,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(135deg,#1A1510,#2A2015,#1A1008)" }}/>
            <div style={{ position:"relative", zIndex:1, textAlign:"center",
              padding:"48px 20px", color:"#fff" }}>
              <span style={{ fontSize:10, color:C.gold, letterSpacing:5,
                fontWeight:600, display:"block", marginBottom:16 }}>
                ✦ DADA'S DROP ✦
              </span>
              <h1 className="dd-hero-title"
                style={{ fontFamily:"Georgia,serif", fontSize:40, fontWeight:400,
                  lineHeight:1.2, margin:"0 0 14px", maxWidth:540 }}>
                {heroTitle}
              </h1>
              <p style={{ fontSize:15, color:"rgba(255,255,255,.7)",
                maxWidth:380, margin:"0 auto 28px", lineHeight:1.6 }}>
                {heroSub}
              </p>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={() => setPage("catalogue")}
                  style={{ display:"inline-flex", alignItems:"center", gap:7,
                    background:C.gold, color:C.ink, border:"none",
                    borderRadius:10, padding:"12px 22px", fontWeight:700,
                    fontSize:14, cursor:"pointer" }}>
                  {t.discover} <ArrowRight size={16}/>
                </button>
                <button onClick={() => setTrackOpen(true)}
                  style={{ display:"inline-flex", alignItems:"center", gap:7,
                    background:"transparent", color:"rgba(255,255,255,.8)",
                    border:"1px solid rgba(201,168,76,.4)", borderRadius:10,
                    padding:"12px 20px", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                  <Package size={16}/> {t.trackOrder}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SÉLECTION */}
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"32px 16px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <div style={{ width:3, height:18, background:GRAD, borderRadius:99 }}/>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text,
              margin:0, fontWeight:400 }}>{t.bestSeller}</h2>
          </div>
          <div className="dd-grid"
            style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
            {bestSellers.map((p,i) => (
              <ProductCard key={p.id} p={p} t={t} cats={cats}
                idx={i} mounted={mounted} dark={dark}
                isFav={favs.includes(p.id)} onToggleFav={toggleFav}
                onOpen={setSelected} onAdd={addToCart}/>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:24 }}>
            <button onClick={() => setPage("catalogue")}
              style={{ ...primaryBtn, gap:7 }}>
              {t.catalogue} <ArrowRight size={14}/>
            </button>
          </div>
        </section>

        {/* AVANTAGES */}
        <section style={{ maxWidth:1200, margin:"28px auto 0", padding:"0 16px 32px" }}>
          <div style={{ display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10 }}>
            {[
              { icon:<Truck size={18} color={C.gold}/>,         label:"Livraison Ouagadougou", sub:"Rapide et soigné" },
              { icon:<Smartphone size={18} color={C.gold}/>,    label:"Mobile Money",           sub:"Orange · Moov · Wave" },
              { icon:<ShieldCheck size={18} color={C.gold}/>,   label:"Sélection Dada",         sub:"Chaque pièce choisie" },
              { icon:<MessageCircle size={18} color="#25D366"/>, label:"Commande WhatsApp",      sub:"Réponse rapide" },
            ].map((f,i) => (
              <div key={i} style={{ background: dark?C.dCard:"#fff",
                border:`1px solid ${bord}`, borderRadius:12, padding:"14px" }}>
                <div style={{ width:36, height:36, borderRadius:9,
                  background: dark?C.dBorder:C.creamD,
                  display:"grid", placeItems:"center", marginBottom:9 }}>
                  {f.icon}
                </div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:13,
                  color:text, marginBottom:2 }}>{f.label}</div>
                <div style={{ fontSize:12, color: dark?C.dMute:C.mute }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </section>
      </>)}

      {page==="catalogue" && (
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"20px 16px 40px" }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, color:text,
            margin:"0 0 18px", fontWeight:400 }}>{t.catalogue}</h1>
          <FilterPanel cats={cats} cat={cat} setCat={setCat}
            sort={sort} setSort={setSort}
            inStock={inStock} setInStock={setInStock}
            minPrice={minPrice} setMinPrice={setMinPrice}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            lang={lang} dark={dark} text={text} bord={bord}/>
          <div style={{ marginBottom:14 }}>
            <span style={{ fontSize:13, color: dark?C.dMute:C.mute }}>
              <strong style={{ color:text }}>{list.length}</strong> article{list.length>1?"s":""}
            </span>
          </div>

          {/* Catégorie "bientôt" */}
          {selectedCat?.soon ? (
            <div style={{ textAlign:"center", padding:"60px 16px" }}>
              <div style={{ fontSize:56, marginBottom:12 }}>🔜</div>
              <h3 style={{ fontFamily:"Georgia,serif", color:text,
                margin:"0 0 8px", fontSize:22 }}>
                {lang==="fr"?selectedCat.label:selectedCat.labelEn} — Bientôt disponible !
              </h3>
              <p style={{ color: dark?C.dMute:C.mute, fontSize:14,
                maxWidth:320, margin:"0 auto 24px", lineHeight:1.6 }}>
                Cette catégorie arrive très prochainement.
              </p>
              <button onClick={() => setCat(0)} style={{ ...primaryBtn, gap:7 }}>
                Voir les articles disponibles <ArrowRight size={14}/>
              </button>
            </div>
          ) : list.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 16px" }}>
              <Search size={40} color={dark?C.dBorder:"#ddd"} strokeWidth={1.2}/>
              <p style={{ marginTop:12, color: dark?C.dMute:"#bbb",
                fontSize:14, lineHeight:1.7 }}>
                {t.noResult}<br/>{t.noResultHint}
              </p>
              <button onClick={() => { setQuery(""); setCat(0); }}
                style={{ ...primaryBtn, marginTop:16, gap:7 }}>
                Voir tous les articles <ArrowRight size={14}/>
              </button>
            </div>
          ) : (
            <div className="dd-grid"
              style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
              {list.map((p,i) => (
                <ProductCard key={p.id} p={p} t={t} cats={cats}
                  idx={i} mounted={mounted} dark={dark}
                  isFav={favs.includes(p.id)} onToggleFav={toggleFav}
                  onOpen={setSelected} onAdd={addToCart}/>
              ))}
            </div>
          )}
        </section>
      )}

      {page==="favs" && (
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"20px 16px 40px" }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, color:text,
            margin:"0 0 6px", fontWeight:400 }}>❤️ Mes favoris</h1>
          <p style={{ fontSize:13, color:dark?C.dMute:C.mute, marginBottom:18 }}>
            {favs.length} article{favs.length>1?"s":""} sauvegardé{favs.length>1?"s":""}
          </p>
          {favs.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 16px" }}>
              <Heart size={44} color={dark?C.dBorder:"#ddd"} strokeWidth={1.2}/>
              <p style={{ marginTop:12, color:dark?C.dMute:"#bbb", fontSize:14 }}>
                Vous n'avez pas encore de favoris.<br/>
                Appuyez sur ❤️ sur un article pour l'ajouter ici.
              </p>
              <button onClick={()=>setPage("catalogue")}
                style={{ ...primaryBtn, marginTop:16, gap:7 }}>
                Voir le catalogue <ArrowRight size={14}/>
              </button>
            </div>
          ) : (<>
            {/* Séparateur visuel */}
            <div style={{ height:2, background:GRAD, borderRadius:99,
              marginBottom:20, maxWidth:60 }}/>
            <div className="dd-grid"
              style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
              {visibleProducts.filter(p=>favs.includes(p.id)).map((p,i) => (
                <ProductCard key={p.id} p={p} t={t} cats={cats}
                  idx={i} mounted={mounted} dark={dark}
                  isFav={true} onToggleFav={toggleFav}
                  onOpen={setSelected} onAdd={addToCart}/>
              ))}
            </div>
          </>)}
        </section>
      )}
      {page==="about"  && <AboutPage dark={dark} cfg={cfg}/>}
      {page==="legal"  && <LegalPage type="legal" dark={dark} setPage={setPage}/>}
      {page==="cgv"    && <LegalPage type="cgv"   dark={dark} setPage={setPage}/>}
      {page==="rgpd"   && <LegalPage type="rgpd"  dark={dark} setPage={setPage}/>}
      {page==="sav"    && <LegalPage type="sav"   dark={dark} setPage={setPage}/>}
      {page==="404"    && <Page404   dark={dark}  setPage={setPage}/>}

      {/* FOOTER */}
      <footer style={{ background:C.ink, color:"#fff",
        padding:"32px 16px", borderTop:`1px solid ${C.gold}22` }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex",
          flexWrap:"wrap", gap:20, justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:18,
              fontWeight:700, letterSpacing:2, color:"#fff" }}>DADA'S DROP</div>
            <div style={{ fontSize:10, color:C.gold, letterSpacing:4, marginTop:2 }}>
              ✦ COLLECTION PREMIUM ✦
            </div>
            <p style={{ color:"#5A5040", fontSize:12, margin:"8px 0 0", maxWidth:260 }}>
              Sacs & accessoires livrés au Burkina Faso.
            </p>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:6,
                background:"#25D366", color:"#fff", textDecoration:"none",
                padding:"9px 14px", borderRadius:9, fontWeight:700, fontSize:13 }}>
              <MessageCircle size={15}/> WhatsApp
            </a>
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:"16px auto 0",
          borderTop:`1px solid ${C.gold}1A`, paddingTop:14,
          display:"flex", justifyContent:"space-between",
          flexWrap:"wrap", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#3A3020" }}>
            © {new Date().getFullYear()} Dada's Drop
          </span>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[["legal","Mentions légales"],["cgv","CGV"],["rgpd","RGPD"],["sav","SAV"]].map(([p,l]) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ fontSize:11, color:C.gold, background:"none",
                  border:"none", cursor:"pointer", textDecoration:"underline" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOTTANT */}
      <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waMsg)}`}
        target="_blank" rel="noreferrer"
        style={{ position:"fixed", bottom:80, right:18, width:50, height:50,
          borderRadius:999, background:"#25D366",
          display:"grid", placeItems:"center", zIndex:49,
          boxShadow:"0 4px 16px rgba(37,211,102,.4)", textDecoration:"none" }}>
        <MessageCircle size={22} color="#fff"/>
      </a>

      {/* MODALS */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)}
        t={t} lang={lang} setLang={setLang} dark={dark}
        setPage={setPage} setCat={setCat} cats={cats} favs={favs}/>
      <ProductModal p={selected} t={t} dark={dark}
        onClose={() => setSelected(null)} onAdd={addToCart}/>
      <CartDrawer open={cartOpen} cart={cart} products={products}
        t={t} dark={dark} onClose={() => setCartOpen(false)}
        onQty={setQty} onRemove={removeItem}
        onCheckout={() => { setCartOpen(false); setCheckout(true); }}/>
      <Checkout open={checkout} lines={lines} total={total}
        t={t} dark={dark} promos={promos} cfg={cfg}
        onClose={() => setCheckout(false)}
        onClearCart={() => setCart([])}/>
      <TrackModal open={trackOpen} t={t} dark={dark}
        onClose={() => setTrackOpen(false)}/>
    </div>
  );
}

/* ════════════════════════════════════════════
   🎨 CONSTANTES ADMIN
════════════════════════════════════════════ */
const CA = {
  ...C,
  warning: "#E08030",
  card: "#FFFFFF",
};

const ROLES = {
  admin:    { label:"Administrateur", badge:"👑" },
  manager:  { label:"Gestionnaire",   badge:"🤵🏽‍♂️" },
  delivery: { label:"Livreur",        badge:"🚚" },
};

const STATUS_ADMIN_LABELS = ["","En préparation","Expédiée","Livrée"];
const STATUS_ADMIN_COLORS = ["", CA.warning, "#1DC0D4", CA.success];

const INIT_USERS = [
  { id:1, name:"David Amah",    email:"david@dadasdrop.com",   role:"admin",    active:true  },
  { id:2, name:"Ma Copine",     email:"copine@dadasdrop.com",  role:"manager",  active:true  },
  { id:3, name:"Livreur Ouaga", email:"livreur@dadasdrop.com", role:"delivery", active:true  },
];

/* ════════════════════════════════════════════
   🔒 ADMIN GUARD — AdminApp défini plus bas dans ce fichier
════════════════════════════════════════════ */
function AdminGuard({ products, setProducts, cats, setCats, cfg, setCfg, promos, setPromos, dark }) {
  const navigate = useNavigate();
  return (
    <AdminApp
      products={products} setProducts={setProducts}
      cats={cats} setCats={setCats}
      cfg={cfg} setCfg={setCfg}
      promos={promos} setPromos={setPromos}
      dark={dark}
      onGoHome={() => navigate("/")}
    />
  );
}

/* ════════════════════════════════════════════
   🚀 APP RACINE
════════════════════════════════════════════ */
export default function App() {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [cats, setCats]         = useState(DEFAULT_CATS);
  const [cfg, setCfg]           = useState(DEFAULT_CFG);
  const [promos, setPromos]     = useState(DEMO_PROMOS);
  const [dark, setDark]         = useState(false);
  const [loading, setLoading]   = useState(true);

  // Chargement initial depuis Supabase
  useEffect(() => {
    Promise.allSettled([
      // Produits
      sb.get("products", "?order=id.asc")
        .then(rows => {
          if(rows?.length>0) {
            // Normaliser snake_case Supabase → camelCase interne
            const normalized = rows.map(p => ({
              ...p,
              isNew:    p.is_new    ?? p.isNew    ?? false,
              isBest:   p.is_best   ?? p.isBest   ?? false,
              isPinned: p.is_pinned ?? p.isPinned ?? false,
              isHidden: p.is_hidden ?? p.isHidden ?? false,
              desc:     p.description ?? p.desc   ?? "",
              imgs:     p.imgs || [],
              accent:   p.accent || [],
              variants: p.variants || [],
              rating:   p.rating   || 0,
              ratingCount: p.rating_count || 0,
            }));
            setProducts(normalized);
          }
        }),
      // Config
      sb.get("announcements", "?id=eq.config&select=data")
        .then(rows => { if(rows?.[0]?.data) setCfg(c=>({...c,...rows[0].data})); }),
      // Catégories (si table existe)
      sb.get("announcements", "?id=eq.categories&select=data")
        .then(rows => { if(rows?.[0]?.data) setCats(rows[0].data); }),
      // Promos
      sb.get("promos", "?select=*")
        .then(rows => { if(rows?.length>0) setPromos(rows); }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.cream,
      display:"grid", placeItems:"center", fontFamily:"Georgia,serif" }}>
      <div style={{ textAlign:"center" }}>
        <LogoDD size={56}/>
        <p style={{ color:C.mute, marginTop:16, letterSpacing:2, fontSize:12 }}>
          CHARGEMENT…
        </p>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ShopApp products={products} cats={cats} cfg={cfg} promos={promos}
            dark={dark} setDark={setDark}/>
        }/>
        <Route path="/catalogue" element={
          <ShopApp products={products} cats={cats} cfg={cfg} promos={promos}
            dark={dark} setDark={setDark} initialPage="catalogue"/>
        }/>
        <Route path="/admin" element={
          <AdminGuard products={products} setProducts={setProducts}
            cats={cats} setCats={setCats}
            cfg={cfg} setCfg={setCfg}
            promos={promos} setPromos={setPromos}
            dark={dark}/>
        }/>
        <Route path="/admin/*" element={
          <AdminGuard products={products} setProducts={setProducts}
            cats={cats} setCats={setCats}
            cfg={cfg} setCfg={setCfg}
            promos={promos} setPromos={setPromos}
            dark={dark}/>
        }/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  );
}

/* ════════════════════════════════════════════
   🏢 ADMIN APP — layout mobile-first complet
════════════════════════════════════════════ */

// Palette admin (même que C mais avec quelques extras)

// Badge réutilisable
function ABadge({ children, color }) {
  return (
    <span style={{ background:`${color}22`, color, fontSize:11, fontWeight:700,
      padding:"3px 9px", borderRadius:999, border:`1px solid ${color}44`,
      whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

// StatCard
function AStatCard({ icon, value, label, color, dark }) {
  return (
    <div style={{ background:dark?CA.dCard:CA.card,
      border:`1px solid ${dark?CA.dBorder:CA.border}`,
      borderRadius:14, padding:"16px" }}>
      <div style={{ width:38, height:38, borderRadius:10,
        background:`${color}18`, display:"grid", placeItems:"center", marginBottom:10 }}>
        {icon}
      </div>
      <div style={{ fontFamily:"Georgia,serif", fontSize:22,
        fontWeight:700, color:dark?CA.dText:CA.ink }}>{value}</div>
      <div style={{ fontSize:12, color:dark?CA.dMute:CA.mute, marginTop:2 }}>{label}</div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET COMMANDES
────────────────────────────────────────── */
function AdminOrdersTab({ orders, setOrders, users, auth, dark }) {
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState(0);
  const text = dark ? CA.dText : CA.ink;
  const bord = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;

  const filtered = orders.filter(o => {
    if (filterStatus>0 && o.status!==filterStatus) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchId    = o.id?.toLowerCase().includes(q);
      const matchName  = o.name?.toLowerCase().includes(q);
      const matchPhone = o.phone?.replace(/\s/g,"").includes(q.replace(/\s/g,""));
      if (!matchId && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const updateStatus = async (id, status) => {
    setOrders(os => os.map(o => o.id===id?{...o,status}:o));
    try { await sb.patch("orders", id, {status}); } catch(e){console.warn(e.message);}
  };

  const assignDelivery = async (id, userId) => {
    const val = userId ? parseInt(userId) : null;
    setOrders(os => os.map(o => o.id===id?{...o,assignedTo:val}:o));
    try { await sb.patch("orders", id, {assigned_to:val}); } catch(e){console.warn(e.message);}
  };

  const exportCSV = () => {
    const rows = [
      ["ID","Client","Téléphone","Ville","Quartier","Articles","Total FCFA","Paiement","Statut","Date"],
      ...orders.map(o => [
        o.id, o.name, o.phone, o.ville, o.quartier||"",
        (o.items||[]).join(" | "), o.total,
        PAYMENT_LABELS[o.payment]||o.payment,
        STATUS_ADMIN_LABELS[o.status]||"", o.date
      ])
    ];
    const csv = rows.map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `commandes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const printBon = (o) => {
    const w = window.open("","_blank","width=620,height=900");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Bon #${o.id}</title>
    <style>
      body{font-family:Georgia,serif;padding:32px;color:#1A1A1A;max-width:520px;margin:auto}
      h1{font-size:22px;letter-spacing:3px;margin:0 0 4px}
      .sub{font-size:10px;color:#8A7A6A;letter-spacing:4px;margin:0 0 24px}
      hr{border:none;border-top:1px solid #E0D8CC;margin:16px 0}
      .row{display:flex;justify-content:space-between;margin:6px 0;font-size:14px}
      .lbl{color:#8A7A6A}
      .item{padding:6px 0;border-bottom:1px solid #eee;font-size:14px}
      .total{font-size:22px;font-weight:700;color:#C9A84C;margin:16px 0 0}
      @media print{button{display:none}}
    </style></head><body>
    <h1>DADA'S DROP</h1><p class="sub">✦ BON DE COMMANDE ✦</p><hr/>
    <div class="row"><span class="lbl">N° commande</span><strong>#${o.id}</strong></div>
    <div class="row"><span class="lbl">Date</span><span>${o.date||new Date().toLocaleDateString("fr-FR")}</span></div>
    <hr/>
    <div class="row"><span class="lbl">Client</span><strong>${o.name}</strong></div>
    <div class="row"><span class="lbl">Téléphone</span><span>${o.phone}</span></div>
    <div class="row"><span class="lbl">Adresse</span><span>${o.quartier?o.quartier+", ":""}${o.ville}</span></div>
    <div class="row"><span class="lbl">Paiement</span><span>${PAYMENT_LABELS[o.payment]||o.payment}</span></div>
    <hr/>
    ${(o.items||[]).map(i=>`<div class="item">${i}</div>`).join("")}
    <div class="total">Total : ${(o.total||0).toLocaleString("fr-FR")} FCFA</div>
    <hr/>
    <p style="font-size:11px;color:#8A7A6A;text-align:center;margin-top:20px">
      Dada's Drop · Ouagadougou, Burkina Faso
    </p>
    <button onclick="window.print()" style="margin-top:16px;padding:10px 20px;
      background:#1A1A1A;color:#C9A84C;border:none;border-radius:8px;cursor:pointer;font-size:14px">
      🖨️ Imprimer
    </button></body></html>`);
    w.document.close();
  };

  const deliverers = users.filter(u=>u.role==="delivery"&&u.active);

  return (
    <div>
      {/* Recherche + Export sur lignes séparées */}
      <div style={{ marginBottom:8 }}>
        <div style={{ position:"relative" }}>
          <Search size={14} color={dark?CA.dMute:CA.mute}
            style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Nom, numéro de commande ou téléphone…"
            style={{ width:"100%", padding:"10px 12px 10px 32px",
              borderRadius:10, border:`1.5px solid ${bord}`,
              background:dark?CA.dCard:"#fff",
              fontSize:"16px", color:text, fontFamily:"inherit" }}/>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap", alignItems:"center" }}>
        {[0,1,2,3].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding:"7px 12px", borderRadius:9, fontSize:12.5, fontWeight:600,
              border:`1.5px solid ${filterStatus===s?CA.gold:bord}`,
              background:filterStatus===s?CA.ink:cardBg,
              color:filterStatus===s?CA.gold:text, cursor:"pointer" }}>
            {s===0?"Toutes":STATUS_ADMIN_LABELS[s]}
          </button>
        ))}
      </div>
      <button onClick={exportCSV}
        style={{ width:"100%", marginBottom:14,
          background:CA.success, color:"#fff",
          border:"none", borderRadius:9, padding:"9px 12px",
          cursor:"pointer", fontSize:13, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
        📊 Exporter en Excel (CSV)
      </button>

      <div style={{ display:"grid", gap:10 }}>
        {filtered.map(o => (
          <div key={o.id} style={{ background:cardBg, border:`1px solid ${bord}`,
            borderRadius:13, padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <span style={{ fontFamily:"Georgia,serif", fontWeight:700,
                  color:text, fontSize:14 }}>#{o.id}</span>
                <span style={{ marginLeft:8, fontSize:12,
                  color:dark?CA.dMute:CA.mute }}>{o.date}</span>
              </div>
              <ABadge color={STATUS_ADMIN_COLORS[o.status]}>
                {STATUS_ADMIN_LABELS[o.status]}
              </ABadge>
            </div>
            <div style={{ fontSize:14, color:text, fontWeight:600, marginBottom:2 }}>
              {o.name}
            </div>
            <div style={{ fontSize:12, color:dark?CA.dMute:CA.mute, marginBottom:2 }}>
              📞 {o.phone||o.customer_phone} · 📍 {o.quartier?`${o.quartier}, `:""}{o.ville}
            </div>
            <div style={{ fontSize:12, color:dark?CA.dMute:CA.mute, marginBottom:6 }}>
              💳 {PAYMENT_LABELS[o.payment]||o.payment}
            </div>
            {(o.items||[]).map((item,i) => (
              <div key={i} style={{ fontSize:12.5, color:text }}>• {item}</div>
            ))}
            <div style={{ marginTop:10, display:"flex",
              justifyContent:"space-between", alignItems:"center",
              flexWrap:"wrap", gap:8 }}>
              <span style={{ fontFamily:"Georgia,serif", fontWeight:700,
                color:CA.gold, fontSize:14 }}>
                {(o.total||0).toLocaleString("fr-FR")} FCFA
              </span>
              {/* Actions */}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <button onClick={() => printBon(o)}
                  style={{ background:"none", color:dark?CA.dMute:CA.mute,
                    border:`1px solid ${bord}`, borderRadius:8,
                    padding:"6px 10px", cursor:"pointer",
                    fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
                  🖨️ Imprimer
                </button>
                {auth.role!=="delivery" && o.status<3 && (
                  <button onClick={() => updateStatus(o.id, o.status+1)}
                    style={{ background:CA.ink, color:CA.gold,
                      border:`1px solid ${CA.gold}44`, borderRadius:8,
                      padding:"6px 11px", cursor:"pointer",
                      fontSize:12, fontWeight:600,
                      display:"flex", alignItems:"center", gap:4 }}>
                    <ChevronUp size={12}/> {o.status===1?"Expédiée":"Livrée"}
                  </button>
                )}
              </div>
            </div>
            {/* Livreur */}
            {auth.role!=="delivery" && deliverers.length>0 && (
              <div style={{ marginTop:8 }}>
                <select value={o.assignedTo||""} onChange={e=>assignDelivery(o.id,e.target.value)}
                  style={{ width:"100%", padding:"8px 10px", borderRadius:8,
                    border:`1px solid ${bord}`, background:dark?CA.dCard:"#fff",
                    fontSize:"16px", color:text, fontFamily:"inherit" }}>
                  <option value="">Assigner un livreur…</option>
                  {deliverers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {o.assignedTo && (
                  <div style={{ marginTop:5 }}>
                    <ABadge color={CA.success}>
                      🚴 {users.find(u=>u.id===o.assignedTo)?.name||"Livreur assigné"}
                    </ABadge>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length===0 && (
          <div style={{ textAlign:"center", padding:"48px 20px",
            color:dark?CA.dMute:"#bbb" }}>
            <ShoppingCart size={36} strokeWidth={1.2}/>
            <p style={{ marginTop:10, fontSize:14 }}>Aucune commande trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET PRODUITS
────────────────────────────────────────── */
function AdminProductsTab({ products, setProducts, cats, dark }) {
  const text = dark ? CA.dText : CA.ink;
  const bord = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;

  const emptyForm = {
    name:"", brand:"", price:"", cat: cats[0]?.id||"sacs",
    stock:"", isNew:false, isBest:false, isPinned:false, isHidden:false,
    discount:0, desc:"", imgs:["","","",""],
    variants:[], // [{ type:"color"|"size", label:"", hex:"", stock:0 }]
  };
  const [showForm, setShowForm] = useState(false);
  const [editP, setEditP]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [newVariant, setNewVariant] = useState({ type:"color", label:"", hex:"#C9A84C", stock:"" });

  const setF = k => e => setForm(f => ({...f, [k]: e.target.type==="checkbox"?e.target.checked:e.target.value}));
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9,
    border:`1.5px solid ${bord}`, background:dark?CA.dCard:"#fff",
    fontSize:"16px", color:text, fontFamily:"inherit" };

  const startNew  = () => { setForm(emptyForm); setEditP(null); setShowForm(true); };
  const startEdit = p => {
    const imgs = p.imgs||[];
    setForm({ ...p, price:String(p.price), stock:String(p.stock),
      discount:String(p.discount||0),
      imgs:[imgs[0]||"",imgs[1]||"",imgs[2]||"",imgs[3]||""],
      variants:p.variants||[] });
    setEditP(p); setShowForm(true);
  };

  const addVariant = () => {
    if (!newVariant.label.trim()) return;
    setForm(f => ({...f, variants:[...f.variants, {
      ...newVariant, stock:parseInt(newVariant.stock)||0
    }]}));
    setNewVariant({ type:newVariant.type, label:"", hex:"#C9A84C", stock:"" });
  };
  const removeVariant = idx => setForm(f => ({...f, variants:f.variants.filter((_,i)=>i!==idx)}));

  const save = async () => {
    if (!form.name||!form.price) return;
    setSaving(true);
    const localP = { ...form, id:editP?editP.id:Date.now(),
      price:parseInt(form.price)||0, stock:parseInt(form.stock)||0,
      discount:parseInt(form.discount)||0,
      imgs:(form.imgs||[]).filter(u=>u.trim()!=="") };
    // Colonnes qui existent dans Supabase
    const sbP = {
      name:        localP.name,
      name_en:     localP.name,
      brand:       localP.brand,
      price:       localP.price,
      cat:         localP.cat,
      cat_en:      localP.cat,
      stock:       localP.stock,
      is_new:      !!localP.isNew,
      is_best:     !!localP.isBest,
      description: localP.desc||"",
      description_en: localP.desc||"",
      imgs:        localP.imgs||[],
      accent:      localP.accent||[],
      discount:    localP.discount||0,
    };
    if (editP) {
      setProducts(ps=>ps.map(x=>x.id===editP.id?localP:x));
      try { await sb.patch("products",editP.id,sbP); } catch(e){console.warn(e.message);}
    } else {
      setProducts(ps=>[...ps,localP]);
      try { await sb.post("products",sbP); } catch(e){console.warn(e.message);}
    }
    setSaving(false); setEditP(null); setShowForm(false);
  };

  const del = async id => {
    if (!window.confirm("Supprimer cet article ?")) return;
    setProducts(ps=>ps.filter(p=>p.id!==id));
    try { await sb.del("products",id); } catch(e){console.warn(e.message);}
  };

  const toggleProp = async (id, prop) => {
    setProducts(ps=>ps.map(p=>p.id===id?{...p,[prop]:!p[prop]}:p));
    const p = products.find(x=>x.id===id);
    try { await sb.patch("products",id,{[prop]:!p[prop]}); } catch(e){console.warn(e.message);}
  };

  const move = (idx, dir) => {
    setProducts(ps => {
      const arr=[...ps];
      const swap=idx+dir;
      if (swap<0||swap>=arr.length) return arr;
      [arr[idx],arr[swap]]=[arr[swap],arr[idx]];
      return arr;
    });
  };

  const variantType = form.variants[0]?.type || newVariant.type;

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:14 }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:16, color:text }}>
          {products.length} articles
          {products.filter(p=>p.isPinned).length>0 &&
            <span style={{ fontSize:12, color:CA.gold, marginLeft:8 }}>
              📌 {products.filter(p=>p.isPinned).length} épinglé{products.filter(p=>p.isPinned).length>1?"s":""}
            </span>}
        </span>
        <button onClick={startNew}
          style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`,
            borderRadius:10, padding:"9px 14px", cursor:"pointer",
            fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
          <PlusCircle size={14}/> Ajouter
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background:cardBg, border:`1px solid ${CA.gold}55`,
          borderRadius:14, padding:"18px", marginBottom:16 }}>
          <h4 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text,
            margin:"0 0 16px" }}>
            {editP?"Modifier l'article":"Nouvel article"}
          </h4>

          {/* Grille 2 colonnes */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>Nom *</span>
              <input style={inp} value={form.name||""} onChange={setF("name")}
                placeholder="Mini Boston Rose"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>Marque *</span>
              <input style={inp} value={form.brand||""} onChange={setF("brand")}
                placeholder="Coach, Gucci…"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>Prix FCFA *</span>
              <input style={inp} type="number" value={form.price||""} onChange={setF("price")}
                placeholder="25000"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>
                Réduction %
                {form.discount>0 && form.price && (
                  <span style={{ color:CA.gold, marginLeft:4 }}>
                    → {Math.round((parseInt(form.price)||0)*(1-(parseInt(form.discount)||0)/100)).toLocaleString("fr-FR")} FCFA
                  </span>
                )}
              </span>
              <input style={inp} type="number" min="0" max="90"
                value={form.discount||0} onChange={setF("discount")} placeholder="0"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>Stock *</span>
              <input style={inp} type="number" value={form.stock||""} onChange={setF("stock")}
                placeholder="5"/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>Catégorie *</span>
              <select style={inp} value={form.cat||""} onChange={setF("cat")}>
                {cats.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
          </div>

          {/* 4 photos */}
          <div style={{ marginBottom:12 }}>
            <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
              display:"block", marginBottom:6 }}>Photos (4 URLs max)</span>
            <div style={{ display:"grid", gap:7 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:dark?CA.dMute:CA.mute,
                    width:52, flexShrink:0 }}>
                    Photo {i+1}{i===0?" *":""}
                  </span>
                  <input style={{ ...inp, marginBottom:0 }}
                    value={form.imgs?.[i]||""}
                    onChange={e=>setForm(f=>{const imgs=[...(f.imgs||["","","",""])];imgs[i]=e.target.value;return{...f,imgs};})}
                    placeholder="https://i.ibb.co/…"/>
                  {form.imgs?.[i] && (
                    <div style={{ width:34,height:34,borderRadius:6,overflow:"hidden",flexShrink:0 }}>
                      <img src={form.imgs[i]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}
                        onError={e=>e.target.style.opacity=".2"}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <label style={{ display:"block", marginBottom:12 }}>
            <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
              display:"block", marginBottom:3 }}>Description</span>
            <textarea style={{ ...inp, resize:"vertical" }} rows={2}
              value={form.desc||""} onChange={setF("desc")}/>
          </label>

          {/* Variantes */}
          <div style={{ marginBottom:12 }}>
            <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
              display:"block", marginBottom:6 }}>Variantes (couleurs / tailles / pointures)</span>

            {/* Type de variante */}
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              {[["color","🎨 Couleurs"],["size","📏 Tailles/Pointures"]].map(([type,label]) => (
                <button key={type}
                  onClick={() => setNewVariant(v=>({...v,type}))}
                  style={{ flex:1, padding:"7px", borderRadius:8, fontSize:12,
                    fontWeight:600, cursor:"pointer",
                    border:`1.5px solid ${newVariant.type===type?CA.gold:bord}`,
                    background:newVariant.type===type?CA.ink:"none",
                    color:newVariant.type===type?CA.gold:text }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Liste variantes existantes */}
            {form.variants.length>0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:8 }}>
                {form.variants.map((v,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:5,
                    padding:"5px 10px", borderRadius:20,
                    background:dark?CA.dBorder:CA.creamD,
                    border:`1px solid ${bord}` }}>
                    {v.type==="color" && (
                      <div style={{ width:14,height:14,borderRadius:999,
                        background:v.hex,border:"1px solid rgba(0,0,0,.15)" }}/>
                    )}
                    <span style={{ fontSize:12, color:text }}>{v.label}</span>
                    <span style={{ fontSize:10, color:CA.mute }}>(stock:{v.stock})</span>
                    <button onClick={() => removeVariant(i)}
                      style={{ border:"none",background:"none",
                        cursor:"pointer",color:CA.danger,padding:0,lineHeight:1 }}>
                      <X size={11}/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Ajouter une variante */}
            <div style={{ display:"flex", gap:7, alignItems:"flex-end", flexWrap:"wrap" }}>
              {newVariant.type==="color" && (
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <input type="color" value={newVariant.hex}
                    onChange={e=>setNewVariant(v=>({...v,hex:e.target.value}))}
                    style={{ width:38,height:34,borderRadius:7,
                      border:`1px solid ${bord}`,cursor:"pointer",padding:2 }}/>
                </div>
              )}
              <input value={newVariant.label}
                onChange={e=>setNewVariant(v=>({...v,label:e.target.value}))}
                placeholder={newVariant.type==="color"?"Ex: Rose poudré":"Ex: 38 ou M"}
                style={{ ...inp, flex:1, minWidth:100, marginBottom:0 }}/>
              <input type="number" value={newVariant.stock}
                onChange={e=>setNewVariant(v=>({...v,stock:e.target.value}))}
                placeholder="Stock"
                style={{ ...inp, width:72, marginBottom:0 }}/>
              <button onClick={addVariant}
                style={{ background:CA.ink, color:CA.gold,
                  border:`1px solid ${CA.gold}44`, borderRadius:9,
                  padding:"9px 12px", cursor:"pointer",
                  fontSize:13, fontWeight:700,
                  display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                <Plus size={13}/> Ajouter
              </button>
            </div>
          </div>

          {/* Note manuelle */}
          <div style={{ marginBottom:14 }}>
            <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
              display:"block", marginBottom:5 }}>
              Note manuelle (si pas encore d'avis clients)
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <StarRating
                rating={form.rating||0} size={24} interactive
                onRate={v=>setForm(f=>({...f,rating:v}))}/>
              {form.rating>0 && (
                <button onClick={()=>setForm(f=>({...f,rating:0}))}
                  style={{ fontSize:11, color:CA.mute, background:"none",
                    border:"none", cursor:"pointer" }}>
                  Retirer
                </button>
              )}
            </div>
          </div>
          {/* Options */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:14 }}>
            {[
              { k:"isNew",    label:"🆕 Nouveauté" },
              { k:"isBest",   label:"⭐ Best-seller" },
              { k:"isPinned", label:"📌 Épingler" },
              { k:"isHidden", label:"🙈 Masquer" },
            ].map(({ k, label }) => (
              <label key={k} style={{ display:"flex", alignItems:"center",
                gap:6, cursor:"pointer", fontSize:13, color:text }}>
                <input type="checkbox" checked={!!form[k]} onChange={setF(k)}/> {label}
              </label>
            ))}
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={save} disabled={saving}
              style={{ background:CA.ink, color:CA.gold,
                border:`1px solid ${CA.gold}44`, borderRadius:10,
                padding:"10px 16px", cursor:"pointer",
                fontSize:13.5, fontWeight:700,
                display:"flex", alignItems:"center", gap:6 }}>
              <Save size={14}/> {saving?"Enregistrement…":"Enregistrer"}
            </button>
            <button onClick={() => { setShowForm(false); setEditP(null); }}
              style={{ background:"none", color:text, border:`1px solid ${bord}`,
                borderRadius:10, padding:"10px 14px",
                cursor:"pointer", fontSize:13.5, fontWeight:600,
                display:"flex", alignItems:"center", gap:6 }}>
              <X size={14}/> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste produits */}
      <div style={{ display:"grid", gap:8 }}>
        {products.map((p,idx) => (
          <div key={p.id} style={{ background:cardBg,
            border:`1px solid ${p.isPinned?CA.gold+"88":bord}`,
            borderRadius:12, padding:"12px 13px",
            display:"flex", gap:10, alignItems:"center",
            opacity:p.isHidden?.5:1 }}>
            {/* Ordre */}
            <div style={{ display:"flex", flexDirection:"column", gap:0, flexShrink:0 }}>
              <button onClick={() => move(idx,-1)} disabled={idx===0}
                style={{ border:"none", background:"none", cursor:"pointer", padding:"2px",
                  color:idx===0?bord:dark?CA.dMute:CA.mute }}>
                <ChevronUp size={13}/>
              </button>
              <button onClick={() => move(idx,1)} disabled={idx===products.length-1}
                style={{ border:"none", background:"none", cursor:"pointer", padding:"2px",
                  color:idx===products.length-1?bord:dark?CA.dMute:CA.mute }}>
                <ChevronDown size={13}/>
              </button>
            </div>
            {/* Vignette */}
            <div style={{ width:50, height:50, borderRadius:8, overflow:"hidden",
              flexShrink:0, background:p.accent?`linear-gradient(135deg,${p.accent[0]},${p.accent[1]})`:"#eee" }}>
              {p.imgs?.[0]
                ? <img src={p.imgs[0]} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                : <div style={{ width:"100%",height:"100%",display:"grid",placeItems:"center" }}>👜</div>}
            </div>
            {/* Infos */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:13, color:text,
                fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {p.isPinned&&"📌 "}{p.name}
              </div>
              <div style={{ fontSize:11.5, color:dark?CA.dMute:CA.mute }}>
                {p.brand}
                {p.discount>0 ? <>
                  <span style={{ textDecoration:"line-through", marginLeft:6 }}>
                    {(p.price||0).toLocaleString("fr-FR")}
                  </span>
                  <span style={{ color:CA.danger, fontWeight:700, marginLeft:4 }}>
                    {Math.round(p.price*(1-p.discount/100)).toLocaleString("fr-FR")} FCFA
                  </span>
                  <span style={{ background:CA.danger, color:"#fff", fontSize:9,
                    fontWeight:700, padding:"1px 4px", borderRadius:999, marginLeft:4 }}>
                    -{p.discount}%
                  </span>
                </> : <> · {(p.price||0).toLocaleString("fr-FR")} FCFA</>}
              </div>
              <div style={{ display:"flex", gap:5, marginTop:4, flexWrap:"wrap" }}>
                <ABadge color={p.stock===0?CA.danger:p.stock<=5?CA.warning:CA.success}>
                  {p.stock===0?"Épuisé":`Stock:${p.stock}`}
                </ABadge>
                {(p.variants||[]).length>0 && (
                  <ABadge color="#1DC0D4">
                    {(p.variants||[]).length} variante{(p.variants||[]).length>1?"s":""}
                  </ABadge>
                )}
                {p.isNew && <ABadge color={CA.gold}>Nouveau</ABadge>}
                {p.isHidden && <ABadge color={CA.mute}>Masqué</ABadge>}
              </div>
            </div>
            {/* Actions — 2x2 sur mobile */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, flexShrink:0 }}>
              <button onClick={() => toggleProp(p.id,"isPinned")}
                title={p.isPinned?"Désépingler":"Épingler"}
                style={{ width:32,height:32,borderRadius:8,
                  border:`1px solid ${p.isPinned?CA.gold:bord}`,
                  background:p.isPinned?`${CA.gold}22`:"none",
                  cursor:"pointer",display:"grid",placeItems:"center",fontSize:14 }}>
                📌
              </button>
              <button onClick={() => toggleProp(p.id,"isHidden")}
                title={p.isHidden?"Afficher":"Masquer"}
                style={{ width:32,height:32,borderRadius:8,border:`1px solid ${bord}`,
                  background:"none",cursor:"pointer",
                  display:"grid",placeItems:"center",fontSize:14 }}>
                {p.isHidden?"👁️":"🙈"}
              </button>
              <button onClick={() => startEdit(p)}
                style={{ width:32,height:32,borderRadius:8,border:`1px solid ${bord}`,
                  background:"none",cursor:"pointer",
                  display:"grid",placeItems:"center",color:text }}>
                <Edit size={13}/>
              </button>
              <button onClick={() => del(p.id)}
                style={{ width:32,height:32,borderRadius:8,border:`1px solid ${bord}`,
                  background:"none",cursor:"pointer",
                  display:"grid",placeItems:"center",color:CA.danger }}>
                <Trash size={13}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET CATÉGORIES
────────────────────────────────────────── */
function AdminCatsTab({ cats, setCats, dark }) {
  const text   = dark ? CA.dText : CA.ink;
  const bord   = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const [form, setForm] = useState({ label:"", labelEn:"", soon:false });
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!form.label.trim()) return;
    const newCat = { id: form.label.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""),
      label:form.label, labelEn:form.labelEn||form.label, soon:form.soon };
    const updated = [...cats, newCat];
    setCats(updated);
    setForm({ label:"", labelEn:"", soon:false });
    try { await sb.upsert("announcements", { id:"categories", data:updated }); } catch(e){console.warn(e.message);}
  };

  const toggleSoon = async (id) => {
    const updated = cats.map(c=>c.id===id?{...c,soon:!c.soon}:c);
    setCats(updated);
    try { await sb.upsert("announcements", { id:"categories", data:updated }); } catch(e){console.warn(e.message);}
  };

  const del = async (id) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    const updated = cats.filter(c=>c.id!==id);
    setCats(updated);
    try { await sb.upsert("announcements", { id:"categories", data:updated }); } catch(e){console.warn(e.message);}
  };

  const move = async (idx, dir) => {
    const arr=[...cats]; const swap=idx+dir;
    if (swap<0||swap>=arr.length) return;
    [arr[idx],arr[swap]]=[arr[swap],arr[idx]];
    setCats(arr);
    try { await sb.upsert("announcements", { id:"categories", data:arr }); } catch(e){console.warn(e.message);}
  };

  const inp = { width:"100%", padding:"9px 11px", borderRadius:9,
    border:`1.5px solid ${bord}`, background:dark?CA.dCard:"#fff",
    fontSize:"16px", color:text, fontFamily:"inherit" };

  return (
    <div>
      {/* Ajouter une catégorie */}
      <div style={{ background:cardBg, border:`1px solid ${CA.gold}44`,
        borderRadius:14, padding:"16px", marginBottom:16 }}>
        <h4 style={{ fontFamily:"Georgia,serif", fontSize:15, color:text, margin:"0 0 12px" }}>
          ➕ Nouvelle catégorie
        </h4>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
          <label style={{ display:"block" }}>
            <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
              display:"block", marginBottom:3 }}>Nom français *</span>
            <input style={inp} value={form.label}
              onChange={e=>setForm(f=>({...f,label:e.target.value}))}
              placeholder="Ex : Ceintures"/>
          </label>
          <label style={{ display:"block" }}>
            <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
              display:"block", marginBottom:3 }}>Nom anglais</span>
            <input style={inp} value={form.labelEn}
              onChange={e=>setForm(f=>({...f,labelEn:e.target.value}))}
              placeholder="Ex : Belts"/>
          </label>
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:6,
          cursor:"pointer", fontSize:13, color:text, marginBottom:12 }}>
          <input type="checkbox" checked={form.soon}
            onChange={e=>setForm(f=>({...f,soon:e.target.checked}))}/>
          Marquer comme "bientôt disponible"
        </label>
        <button onClick={add}
          style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`,
            borderRadius:10, padding:"9px 16px", cursor:"pointer",
            fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
          <PlusCircle size={14}/> Ajouter la catégorie
        </button>
      </div>

      {/* Liste catégories */}
      <div style={{ display:"grid", gap:8 }}>
        {cats.map((c,idx) => (
          <div key={c.id} style={{ background:cardBg, border:`1px solid ${bord}`,
            borderRadius:11, padding:"12px 14px",
            display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              <button onClick={() => move(idx,-1)} disabled={idx===0}
                style={{ border:"none",background:"none",cursor:"pointer",padding:1,
                  color:idx===0?bord:dark?CA.dMute:CA.mute }}>
                <ChevronUp size={12}/>
              </button>
              <button onClick={() => move(idx,1)} disabled={idx===cats.length-1}
                style={{ border:"none",background:"none",cursor:"pointer",padding:1,
                  color:idx===cats.length-1?bord:dark?CA.dMute:CA.mute }}>
                <ChevronDown size={12}/>
              </button>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:14, color:text }}>{c.label}</div>
              {c.labelEn && <div style={{ fontSize:12, color:dark?CA.dMute:CA.mute }}>{c.labelEn}</div>}
            </div>
            <button onClick={() => toggleSoon(c.id)}
              style={{ padding:"5px 10px", borderRadius:8, fontSize:12, fontWeight:600,
                border:`1px solid ${c.soon?CA.warning:bord}`,
                background:c.soon?`${CA.warning}18`:"none",
                color:c.soon?CA.warning:dark?CA.dMute:CA.mute, cursor:"pointer" }}>
              {c.soon?"⏳ Bientôt":"✅ Actif"}
            </button>
            <button onClick={() => del(c.id)}
              style={{ width:30,height:30,borderRadius:8,border:`1px solid ${bord}`,
                background:"none",cursor:"pointer",display:"grid",
                placeItems:"center",color:CA.danger }}>
              <Trash size={12}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET ÉQUIPE
────────────────────────────────────────── */
function AdminTeamTab({ users, setUsers, dark }) {
  const text   = dark ? CA.dText : CA.ink;
  const bord   = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", role:"delivery" });
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9,
    border:`1.5px solid ${bord}`, background:dark?CA.dCard:"#fff",
    fontSize:"16px", color:text, fontFamily:"inherit" };

  const add = async () => {
    if (!form.name||!form.email) return;
    const u = { id:Date.now(), ...form, active:true };
    setUsers(us=>[...us,u]);
    setForm({ name:"", email:"", role:"delivery" }); setShowForm(false);
    try { await sb.post("team_users",u); } catch(e){console.warn(e.message);}
  };
  const toggle = async id => {
    const u = users.find(x=>x.id===id);
    setUsers(us=>us.map(x=>x.id===id?{...x,active:!x.active}:x));
    try { await sb.patch("team_users",id,{active:!u.active}); } catch(e){console.warn(e.message);}
  };
  const changeRole = async (id, role) => {
    if (role==="admin" && !window.confirm("⚠️ Élever ce membre au rang Admin lui donnera accès à tout. Confirmer ?")) return;
    setUsers(us=>us.map(u=>u.id===id?{...u,role}:u));
    try { await sb.patch("team_users",id,{role}); } catch(e){console.warn(e.message);}
  };

  const del = async id => {
    if (!window.confirm("Supprimer ce membre ?")) return;
    setUsers(us=>us.filter(u=>u.id!==id));
    try { await sb.del("team_users",id); } catch(e){console.warn(e.message);}
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:14 }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:16, color:text }}>
          {users.length} membres
        </span>
        <button onClick={() => setShowForm(v=>!v)}
          style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`,
            borderRadius:10, padding:"9px 14px", cursor:"pointer",
            fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
          <PlusCircle size={14}/> Ajouter
        </button>
      </div>
      {showForm && (
        <div style={{ background:cardBg, border:`1px solid ${CA.gold}44`,
          borderRadius:14, padding:"16px", marginBottom:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>Nom *</span>
              <input style={inp} value={form.name}
                onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>Email *</span>
              <input style={inp} type="email" value={form.email}
                onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            </label>
          </div>
          <label style={{ display:"block", marginBottom:12 }}>
            <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
              display:"block", marginBottom:3 }}>Rôle *</span>
            <select style={inp} value={form.role}
              onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
              <option value="manager">🤵🏽‍♂️ Gestionnaire</option>
              <option value="delivery">🚚 Livreur</option>
            </select>
          </label>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={add}
              style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`,
                borderRadius:10, padding:"9px 14px", cursor:"pointer",
                fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
              <Check size={13}/> Ajouter
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ background:"none", color:text, border:`1px solid ${bord}`,
                borderRadius:10, padding:"9px 12px", cursor:"pointer",
                fontSize:13, display:"flex", alignItems:"center", gap:5 }}>
              <X size={13}/> Annuler
            </button>
          </div>
        </div>
      )}
      <div style={{ display:"grid", gap:8 }}>
        {users.map(u => (
          <div key={u.id} style={{ background:cardBg, border:`1px solid ${bord}`,
            borderRadius:12, padding:"13px 14px",
            display:"flex", alignItems:"center", gap:10, opacity:u.active?1:.55 }}>
            <div style={{ width:40,height:40,borderRadius:999,
              background:`${CA.gold}22`, display:"grid", placeItems:"center",
              fontSize:18, flexShrink:0 }}>
              {ROLES[u.role]?.badge||"👤"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:14, color:text }}>{u.name}</div>
              <div style={{ fontSize:11.5, color:dark?CA.dMute:CA.mute,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {u.email}
              </div>
              <ABadge color={u.role==="admin"?CA.gold:u.role==="manager"?"#1DC0D4":CA.success}>
                {ROLES[u.role]?.label||u.role}
              </ABadge>
            </div>
            <div style={{ display:"flex", gap:5, flexShrink:0 }}>
              {/* Changer le rôle */}
              {u.role !== "admin" && (
                <select value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                  style={{ padding:"4px 6px", borderRadius:8, fontSize:12,
                    border:`1px solid ${bord}`,
                    background:dark?CA.dCard:"#fff",
                    color:text, cursor:"pointer", fontFamily:"inherit" }}>
                  <option value="delivery">🚚 Livreur</option>
                  <option value="manager">🤵🏽‍♂️ Gestionnaire</option>
                  <option value="admin">👑 Admin</option>
                </select>
              )}
              {/* Activer / désactiver */}
              <button onClick={() => toggle(u.id)}
                title={u.active?"Désactiver":"Activer"}
                style={{ width:32,height:32,borderRadius:8,border:`1px solid ${bord}`,
                  background:"none",cursor:"pointer",display:"grid",placeItems:"center",
                  color:u.active?CA.success:CA.danger }}>
                {u.active?<CheckCircle size={13}/>:<X size={13}/>}
              </button>
              {/* Supprimer */}
              {u.role!=="admin" && (
                <button onClick={() => del(u.id)}
                  style={{ width:32,height:32,borderRadius:8,border:`1px solid ${bord}`,
                    background:"none",cursor:"pointer",display:"grid",
                    placeItems:"center",color:CA.danger }}>
                  <Trash size={13}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET PARAMÈTRES
────────────────────────────────────────── */
function AdminSettingsTab({ cfg, setCfg, promos, setPromos, dark }) {
  const text   = dark ? CA.dText : CA.ink;
  const bord   = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const [tab, setTab]   = useState("contacts");
  const [saved, setSaved] = useState(false);
  const [pwd, setPwd] = useState({ old:"", new1:"", new2:"", err:"", ok:false });
  const [newPromo, setNewPromo] = useState({ code:"", discount:"", maxUses:"" });
  const setC = k => e => setCfg(c=>({...c,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value}));
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9,
    border:`1.5px solid ${bord}`, background:dark?CA.dCard:"#fff",
    fontSize:"16px", color:text, fontFamily:"inherit" };

  const save = async () => {
    try { await sb.upsert("announcements", {id:"config", data:cfg}); } catch(e){console.warn(e.message);}
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  const addPromo = () => {
    if (!newPromo.code||!newPromo.discount) return;
    const p = { code:newPromo.code.toUpperCase(), discount:parseInt(newPromo.discount)||0,
      maxUses:parseInt(newPromo.maxUses)||999, uses:0, active:true };
    setPromos(ps=>[...ps,p]);
    setNewPromo({ code:"", discount:"", maxUses:"" });
  };

  const changePwd = () => {
    if (pwd.old !== "dada2025") { setPwd(p=>({...p,err:"Ancien mot de passe incorrect."})); return; }
    if (pwd.new1.length < 6)    { setPwd(p=>({...p,err:"Nouveau mot de passe trop court (min 6 caractères)."})); return; }
    if (pwd.new1 !== pwd.new2)  { setPwd(p=>({...p,err:"Les mots de passe ne correspondent pas."})); return; }
    // En vrai il faudrait stocker en Supabase
    setPwd({ old:"", new1:"", new2:"", err:"", ok:true });
    setTimeout(() => setPwd(p=>({...p,ok:false})), 3000);
  };

  const settingsTabs = [
    { k:"contacts",  label:"📞 Contacts" },
    { k:"livraison", label:"🚚 Livraison" },
    { k:"banniere",  label:"📢 Bannière" },
    { k:"promos",    label:"🎁 Promos" },
    { k:"apparence", label:"🎨 Apparence" },
    { k:"securite",  label:"🔐 Sécurité" },
  ];

  return (
    <div>
      {/* Sous-onglets paramètres — scroll horizontal */}
      <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto",
        paddingBottom:4, WebkitOverflowScrolling:"touch" }}>
        {settingsTabs.map(st => (
          <button key={st.k} onClick={() => setTab(st.k)}
            style={{ padding:"7px 12px", borderRadius:9, fontSize:12.5, fontWeight:600,
              border:`1.5px solid ${tab===st.k?CA.gold:bord}`,
              background:tab===st.k?CA.ink:cardBg,
              color:tab===st.k?CA.gold:text,
              cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
            {st.label}
          </button>
        ))}
      </div>

      {/* CONTACTS */}
      {tab==="contacts" && (
        <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>📞 Contacts & Paiement</h3>
          <div style={{ display:"grid", gap:10 }}>
            {[
              { key:"whatsapp",    label:"Numéro WhatsApp",  ph:"33768745841" },
              { key:"orangeMoney", label:"Orange Money",      ph:"+226 XX XX XX XX" },
              { key:"moovMoney",   label:"Moov Money",        ph:"+226 XX XX XX XX" },
              { key:"wave",        label:"Wave",              ph:"+226 XX XX XX XX" },
            ].map(f => (
              <label key={f.key} style={{ display:"block" }}>
                <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute,
                  display:"block", marginBottom:3 }}>{f.label}</span>
                <input style={inp} value={cfg[f.key]||""} onChange={setC(f.key)} placeholder={f.ph}/>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* LIVRAISON */}
      {tab==="livraison" && (
        <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>🚚 Livraison</h3>
          <label style={{ display:"block", marginBottom:12 }}>
            <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Ville principale</span>
            <input style={inp} value={cfg.city||""} onChange={setC("city")}/>
          </label>
          <label style={{ display:"block" }}>
            <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Livraison gratuite à partir de (FCFA)</span>
            <input style={inp} type="number" value={cfg.freeFrom||""} onChange={setC("freeFrom")}/>
          </label>
        </div>
      )}

      {/* BANNIÈRE */}
      {tab==="banniere" && (
        <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>📢 Bannière d'annonce</h3>
          {cfg.bannerActive && cfg.bannerText && (
            <div style={{ background:cfg.bannerColor||CA.gold,
              color:cfg.bannerColor===CA.ink?"#fff":CA.ink,
              padding:"10px 16px", borderRadius:9, fontSize:13,
              fontWeight:600, textAlign:"center", marginBottom:14 }}>
              {cfg.bannerText}
            </div>
          )}
          <label style={{ display:"flex", alignItems:"center", gap:8,
            cursor:"pointer", marginBottom:14, fontSize:14, color:text }}>
            <input type="checkbox" checked={!!cfg.bannerActive} onChange={setC("bannerActive")}/>
            Activer la bannière sur le site
          </label>
          <label style={{ display:"block", marginBottom:12 }}>
            <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Texte</span>
            <input style={inp} value={cfg.bannerText||""} onChange={setC("bannerText")}
              placeholder="🔥 Promo spéciale…"/>
          </label>
          <label style={{ display:"block" }}>
            <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:6 }}>Couleur</span>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <input type="color" value={cfg.bannerColor||"#C9A84C"} onChange={setC("bannerColor")}
                style={{ width:42, height:36, borderRadius:8,
                  border:`1px solid ${bord}`, cursor:"pointer", padding:2 }}/>
              {[CA.gold,"#E05030","#1A9E5E","#1DC0D4",CA.ink].map(c => (
                <button key={c} onClick={() => setCfg(cfg=>({...cfg,bannerColor:c}))}
                  style={{ width:26,height:26,borderRadius:999,background:c,
                    border:`3px solid ${cfg.bannerColor===c?"#fff":"transparent"}`,
                    outline:cfg.bannerColor===c?`2px solid ${CA.gold}`:"none",
                    cursor:"pointer" }}/>
              ))}
            </div>
          </label>
        </div>
      )}

      {/* CODES PROMO */}
      {tab==="promos" && (
        <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>🎁 Codes promo</h3>
          {/* Créer */}
          <div style={{ background:dark?`${CA.gold}0A`:`${CA.gold}08`,
            border:`1px solid ${CA.gold}33`, borderRadius:10,
            padding:"14px", marginBottom:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
              <label style={{ display:"block" }}>
                <span style={{ fontSize:10, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Code *</span>
                <input style={inp} value={newPromo.code}
                  onChange={e=>setNewPromo(p=>({...p,code:e.target.value.toUpperCase()}))}
                  placeholder="DADA20"/>
              </label>
              <label style={{ display:"block" }}>
                <span style={{ fontSize:10, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>% réduction</span>
                <input style={inp} type="number" min="1" max="90"
                  value={newPromo.discount}
                  onChange={e=>setNewPromo(p=>({...p,discount:e.target.value}))}
                  placeholder="20"/>
              </label>
              <label style={{ display:"block" }}>
                <span style={{ fontSize:10, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Utilisations max</span>
                <input style={inp} type="number"
                  value={newPromo.maxUses}
                  onChange={e=>setNewPromo(p=>({...p,maxUses:e.target.value}))}
                  placeholder="100"/>
              </label>
            </div>
            <button onClick={addPromo}
              style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`,
                borderRadius:9, padding:"8px 14px", cursor:"pointer",
                fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
              <PlusCircle size={13}/> Créer le code
            </button>
          </div>
          {/* Liste */}
          <div style={{ display:"grid", gap:8 }}>
            {promos.map((p,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                padding:"10px 12px", borderRadius:10,
                border:`1px solid ${p.active?CA.gold+"44":bord}`,
                background:p.active?`${CA.gold}08`:"none",
                opacity:p.active?1:.6 }}>
                <div style={{ fontFamily:"Georgia,serif", fontWeight:700,
                  color:p.active?CA.gold:text, fontSize:14, flex:1 }}>
                  {p.code}
                </div>
                <ABadge color={p.active?CA.success:CA.mute}>
                  {p.active?"Actif":"Inactif"}
                </ABadge>
                <span style={{ fontSize:12, color:dark?CA.dMute:CA.mute }}>-{p.discount}%</span>
                <span style={{ fontSize:11, color:dark?CA.dMute:CA.mute }}>
                  {p.uses}/{p.maxUses}
                </span>
                <button onClick={() => setPromos(ps=>ps.map(x=>x.code===p.code?{...x,active:!x.active}:x))}
                  style={{ width:28,height:28,borderRadius:7,border:`1px solid ${bord}`,
                    background:"none",cursor:"pointer",display:"grid",placeItems:"center",
                    color:p.active?CA.success:CA.mute }}>
                  {p.active?<CheckCircle size={12}/>:<X size={12}/>}
                </button>
                <button onClick={() => setPromos(ps=>ps.filter(x=>x.code!==p.code))}
                  style={{ width:28,height:28,borderRadius:7,border:`1px solid ${bord}`,
                    background:"none",cursor:"pointer",display:"grid",
                    placeItems:"center",color:CA.danger }}>
                  <Trash size={12}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPARENCE */}
      {tab==="apparence" && (
        <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>🎨 Apparence du site</h3>
          <label style={{ display:"block", marginBottom:12 }}>
            <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Titre hero</span>
            <input style={inp} value={cfg.heroTitle||""} onChange={setC("heroTitle")}/>
          </label>
          <label style={{ display:"block", marginBottom:12 }}>
            <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Sous-titre hero</span>
            <input style={inp} value={cfg.heroSub||""} onChange={setC("heroSub")}/>
          </label>
          <label style={{ display:"block", marginBottom:12 }}>
            <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Message WhatsApp flottant</span>
            <textarea style={{ ...inp, resize:"vertical" }} rows={2}
              value={cfg.waMessage||""} onChange={setC("waMessage")}/>
          </label>
          {/* Prévisualisation */}
          <div style={{ background:CA.ink, borderRadius:12, padding:"20px",
            textAlign:"center", marginTop:8 }}>
            <div style={{ fontSize:9, color:CA.gold, letterSpacing:4, marginBottom:8 }}>✦ DADA'S DROP ✦</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:18, color:"#fff", marginBottom:6 }}>
              {cfg.heroTitle||"L'élégance, livrée chez vous."}
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>
              {cfg.heroSub||"Sacs & accessoires sélectionnés avec soin, livrés à Ouagadougou."}
            </div>
          </div>
        </div>
      )}

      {/* SÉCURITÉ */}
      {tab==="securite" && (
        <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>🔐 Changer le mot de passe</h3>
          <div style={{ display:"grid", gap:10, marginBottom:14 }}>
            {[
              { key:"old",  label:"Ancien mot de passe",  ph:"••••••••" },
              { key:"new1", label:"Nouveau mot de passe",  ph:"••••••••" },
              { key:"new2", label:"Confirmer le nouveau",  ph:"••••••••" },
            ].map(f => (
              <label key={f.key} style={{ display:"block" }}>
                <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute,
                  display:"block", marginBottom:3 }}>{f.label}</span>
                <input type="password" style={inp} value={pwd[f.key]}
                  onChange={e=>setPwd(p=>({...p,[f.key]:e.target.value,err:"",ok:false}))}
                  placeholder={f.ph}/>
              </label>
            ))}
          </div>
          {pwd.err && <p style={{ color:CA.danger, fontSize:12.5, margin:"0 0 10px" }}>{pwd.err}</p>}
          {pwd.ok  && <p style={{ color:CA.success, fontSize:12.5, margin:"0 0 10px" }}>✅ Mot de passe mis à jour !</p>}
          <button onClick={changePwd}
            style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`,
              borderRadius:10, padding:"10px 16px", cursor:"pointer",
              fontSize:13.5, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
            <Save size={14}/> Mettre à jour
          </button>
        </div>
      )}

      {/* Bouton Save global */}
      <button onClick={save}
        style={{ marginTop:16, background:CA.ink, color:CA.gold,
          border:`1px solid ${CA.gold}44`, borderRadius:11,
          padding:"12px 20px", cursor:"pointer", fontSize:14, fontWeight:700,
          display:"flex", alignItems:"center", gap:8 }}>
        {saved?<><CheckCircle size={16}/> Enregistré !</>:<><Save size={16}/> Enregistrer</>}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────
   ADMIN APP PRINCIPALE
────────────────────────────────────────── */
function AdminApp({ products, setProducts, cats, setCats, cfg, setCfg,
  promos, setPromos, dark, onGoHome }) {

  const [auth, setAuth]   = useState(null);
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [showPw, setShowPw] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [tab, setTab]     = useState("overview");
  const [orders, setOrders] = useState([]);
  const [users, setUsers]   = useState(INIT_USERS);
  const [notifs, setNotifs] = useState([
    { id:1, msg:"Bienvenue sur votre tableau de bord Dada's Drop !", time:"Maintenant", read:false },
  ]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const bg     = dark ? CA.dBg    : CA.cream;
  const text   = dark ? CA.dText  : CA.ink;
  const bord   = dark ? CA.dBorder: CA.border;
  const cardBg = dark ? CA.dCard  : CA.card;
  const unread = notifs.filter(n=>!n.read).length;

  // Stock faible → notifs auto
  useEffect(() => {
    const lowStock = products.filter(p=>p.stock>0&&p.stock<=5);
    if (lowStock.length>0) {
      setNotifs(ns => {
        const existing = ns.map(n=>n.msg);
        const newNotifs = lowStock
          .filter(p=>!existing.some(m=>m.includes(p.name)))
          .map(p=>({ id:Date.now()+p.id,
            msg:`⚠️ Stock faible : ${p.name} (${p.stock} restant${p.stock>1?"s":""})`,
            time:"Maintenant", read:false }));
        return [...ns, ...newNotifs];
      });
    }
  }, [products]);

  // Charger commandes depuis Supabase
  useEffect(() => {
    if (!auth) return;
    setLoadingOrders(true);
    sb.get("orders", "?order=date.desc&limit=100")
      .then(rows => {
        if (rows?.length>0) {
          setOrders(rows);
          // Notifs nouvelles commandes
          const newOrders = rows.filter(o=>o.status===1);
          if (newOrders.length>0) {
            setNotifs(ns=>[{
              id:Date.now(),
              msg:`📦 ${newOrders.length} commande${newOrders.length>1?"s":""} en attente de traitement`,
              time:"Maintenant", read:false
            }, ...ns]);
          }
        } else {
          // Données démo
          setOrders([
            { id:"DD-1001", name:"Awa Traoré",     phone:"70112233", ville:"Ouagadougou", quartier:"Karpala",     items:["Mini Boston Rose x1"],            total:25000, status:1, payment:"orange",   date:"2025-06-10", assignedTo:null },
            { id:"DD-1002", name:"Fatou Diallo",   phone:"76445566", ville:"Ouagadougou", quartier:"Pissy",       items:["Mini Boston Bleu Denim x2"],       total:50000, status:2, payment:"wave",     date:"2025-06-12", assignedTo:3    },
            { id:"DD-1003", name:"Mariam Koné",    phone:"65778899", ville:"Ouagadougou", quartier:"Gounghin",    items:["Coach Torry Camel x1","Tabby x1"], total:57000, status:3, payment:"moov",     date:"2025-06-08", assignedTo:null },
            { id:"DD-1004", name:"Aïcha Sawadogo", phone:"71001122", ville:"Ouagadougou", quartier:"Wemtenga",    items:["Mini Boston Beige x1"],             total:24000, status:1, payment:"livraison",date:"2025-06-15", assignedTo:null },
            { id:"DD-1005", name:"Roukiatou B.",   phone:"78334455", ville:"Ouagadougou", quartier:"Zone du Bois",items:["Tabby Coach x1"],                  total:35000, status:1, payment:"orange",   date:"2025-06-16", assignedTo:null },
          ]);
        }
      })
      .catch(e=>console.warn("Supabase orders:",e.message))
      .finally(()=>setLoadingOrders(false));
  }, [auth]);

  const login = () => {
    const u = users.find(x=>x.email===email&&x.active);
    if (u && pass==="dada2025") { setAuth(u); setWrong(false); }
    else setWrong(true);
  };
  const logout = () => { setAuth(null); setEmail(""); setPass(""); setTab("overview"); };

  const can = action => {
    if (!auth) return false;
    if (auth.role==="admin") return true;
    if (auth.role==="manager") return ["view_orders","edit_orders","add_product","view_stats"].includes(action);
    if (auth.role==="delivery") return ["view_my_orders"].includes(action);
    return false;
  };

  /* ── LOGIN ── */
  if (!auth) return (
    <div style={{ minHeight:"100vh", background:bg, display:"flex",
      alignItems:"center", justifyContent:"center", padding:"20px 16px" }}>
      <div style={{ maxWidth:380, width:"100%", background:cardBg,
        borderRadius:20, padding:"28px 24px",
        boxShadow:"0 24px 56px rgba(0,0,0,.15)",
        border:`1px solid ${bord}`,
        boxSizing:"border-box", overflow:"hidden" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <LogoDD size={60}/>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:20, color:text, margin:"14px 0 4px" }}>
            Dada's Drop
          </h1>
          <p style={{ fontSize:12, color:dark?CA.dMute:CA.mute, margin:0, letterSpacing:.5 }}>
            ESPACE ADMINISTRATION
          </p>
        </div>
        <label style={{ display:"block", marginBottom:14 }}>
          <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
            display:"block", marginBottom:6, letterSpacing:.3 }}>
            ADRESSE EMAIL
          </span>
          <input value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="email@dadasdrop.com" type="email"
            style={{ width:"100%", padding:"12px 14px", borderRadius:10,
              border:`1.5px solid ${wrong?"#E05030":bord}`,
              background:dark?CA.dCard:"#fff",
              fontSize:"16px", color:text, fontFamily:"inherit",
              boxSizing:"border-box" }}
            onKeyDown={e=>e.key==="Enter"&&login()}/>
        </label>
        <label style={{ display:"block", marginBottom:14, position:"relative" }}>
          <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
            display:"block", marginBottom:6, letterSpacing:.3 }}>
            MOT DE PASSE
          </span>
          <div style={{ position:"relative" }}>
            <input value={pass} onChange={e=>setPass(e.target.value)}
              type={showPw?"text":"password"} placeholder="••••••••"
              style={{ width:"100%", padding:"12px 44px 12px 14px", borderRadius:10,
                border:`1.5px solid ${wrong?"#E05030":bord}`,
                background:dark?CA.dCard:"#fff",
                fontSize:"16px", color:text, fontFamily:"inherit",
                boxSizing:"border-box" }}
              onKeyDown={e=>e.key==="Enter"&&login()}/>
            <button onClick={()=>setShowPw(v=>!v)}
              style={{ position:"absolute", right:12, top:"50%",
                transform:"translateY(-50%)", border:"none",
                background:"none", cursor:"pointer", color:dark?CA.dMute:CA.mute,
                display:"flex", alignItems:"center" }}>
              {showPw?<EyeOff size={17}/>:<Eye size={17}/>}
            </button>
          </div>
        </label>
        {wrong && (
          <div style={{ display:"flex", alignItems:"center", gap:6,
            color:CA.danger, fontSize:12.5, marginBottom:8 }}>
            <AlertCircle size={13}/> Email ou mot de passe incorrect.
          </div>
        )}
        <button onClick={login}
          style={{ width:"100%", padding:"13px", background:CA.ink, color:CA.gold,
            border:`1px solid ${CA.gold}44`, borderRadius:11, fontWeight:700,
            fontSize:15, cursor:"pointer", marginTop:8,
            display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Lock size={16}/> Accéder au tableau de bord
        </button>
        <button onClick={onGoHome}
          style={{ width:"100%", padding:"10px", background:"none",
            color:dark?CA.dMute:CA.mute, border:"none", borderRadius:11,
            fontWeight:500, fontSize:13, cursor:"pointer", marginTop:8,
            display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <ArrowLeft size={13}/> Retour au site
        </button>
        <p style={{ textAlign:"center", fontSize:11,
          color:dark?CA.dMute:"#bbb", marginTop:14 }}>
          Accès réservé à l'équipe Dada's Drop
        </p>
      </div>
    </div>
  );

  /* ── TABLEAU DE BORD ── */
  const myOrders = auth.role==="delivery"
    ? orders.filter(o=>o.assignedTo===auth.id) : orders;
  const totalRev = orders.filter(o=>o.status===3).reduce((s,o)=>s+(o.total||0),0);
  const pending  = orders.filter(o=>o.status===1).length;
  const lowStock = products.filter(p=>p.stock<=5);

  const tabs = [
    ...(can("view_stats") ? [{ key:"overview",  icon:<BarChart2 size={14}/>, label:"Bilan" }] : []),
    { key:"orders",   icon:<ShoppingCart size={14}/>, label:auth.role==="delivery"?"Livraisons":"Commandes" },
    ...(can("add_product") ? [{ key:"products", icon:<ShoppingBag size={14}/>, label:"Produits" }] : []),
    ...(auth.role==="admin"?[
      { key:"cats",     icon:<Tag size={14}/>,         label:"Catégories" },
      { key:"team",     icon:<Users size={14}/>,       label:"Équipe" },
      { key:"settings", icon:<Settings size={14}/>,    label:"Paramètres" },
    ]:[]),
  ];

  return (
    <div style={{ minHeight:"100vh", background:bg,
      fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box}
        input,textarea,select{font-family:inherit}
        @supports(-webkit-touch-callout:none){input,textarea,select{font-size:16px!important}}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${CA.gold}!important}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${CA.gold}44;border-radius:99px}
      `}</style>

      {/* TOPBAR — compact mobile */}
      <header style={{ background:CA.ink, borderBottom:`1px solid ${CA.gold}33`,
        padding:"0 14px", height:54,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:50 }}>
        {/* Gauche — logo */}
        <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0 }}>
          <LogoDD size={30}/>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:12, fontWeight:700,
              color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              DADA'S DROP
            </div>
            <div style={{ fontSize:9, color:CA.gold, letterSpacing:1 }}>ADMINISTRATION</div>
          </div>
        </div>
        {/* Droite — notifs + user + déco */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          {/* Notifs */}
          <div style={{ position:"relative" }}>
            <button onClick={() => setNotifOpen(v=>!v)}
              style={{ border:"none", background:"none", cursor:"pointer",
                color:"#fff", padding:4, position:"relative" }}>
              <Bell size={18}/>
              {unread>0 && <span style={{ position:"absolute", top:-1, right:-1,
                background:CA.danger, color:"#fff", fontSize:9, fontWeight:800,
                width:15, height:15, borderRadius:999,
                display:"grid", placeItems:"center" }}>{unread}</span>}
            </button>
            {notifOpen && (<>
              <div onClick={() => setNotifOpen(false)}
                style={{ position:"fixed", inset:0, zIndex:99 }}/>
              <div style={{
                position:"fixed",
                top:58, right:10,
                width:"min(300px,calc(100vw - 20px))",
                background:cardBg, border:`1px solid ${bord}`,
                borderRadius:14, boxShadow:"0 12px 32px rgba(0,0,0,.3)",
                zIndex:100, overflow:"hidden" }}>
                <div style={{ padding:"10px 14px",
                  borderBottom:`1px solid ${bord}`,
                  display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:700, fontSize:13, color:text }}>Notifications</span>
                  <button onClick={() => { setNotifs(n=>n.map(x=>({...x,read:true}))); setNotifOpen(false); }}
                    style={{ border:"none", background:"none", cursor:"pointer",
                      color:CA.mute, fontSize:11 }}>Tout lire</button>
                </div>
                {notifs.slice(0,5).map(n => (
                  <div key={n.id}
                    onClick={() => setNotifs(ns => ns.map(x => x.id===n.id ? {...x,read:true} : x))}
                    style={{ padding:"10px 14px",
                      borderBottom:`1px solid ${bord}`,
                      background:n.read?"transparent":`${CA.gold}0A`,
                      cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background=dark?CA.dBorder:CA.creamD}
                    onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":`${CA.gold}0A`}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                      <div style={{ fontSize:12.5, color:text, fontWeight:n.read?400:600, flex:1 }}>
                        {n.msg}
                      </div>
                      {!n.read && <div style={{ width:7, height:7, borderRadius:999,
                        background:CA.gold, flexShrink:0, marginTop:4 }}/>}
                    </div>
                    <div style={{ fontSize:10.5, color:CA.mute, marginTop:2 }}>{n.time}</div>
                  </div>
                ))}
                {notifs.every(n=>n.read) && (
                  <div style={{ padding:"16px", textAlign:"center",
                    color:CA.mute, fontSize:12.5 }}>
                    ✅ Tout est lu
                  </div>
                )}
              </div>
            </>)}
          </div>
          {/* User */}
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:12, color:"#fff", fontWeight:600,
              whiteSpace:"nowrap" }}>
              {auth.name.split(" ")[0]}
            </div>
            <div style={{ fontSize:9.5, color:CA.gold, whiteSpace:"nowrap" }}>
              {ROLES[auth.role]?.badge} {ROLES[auth.role]?.label}
            </div>
          </div>
          {/* Déconnexion */}
          <button onClick={logout} title="Déconnexion"
            style={{ border:`1px solid ${CA.gold}44`, background:"none",
              borderRadius:8, padding:"7px", cursor:"pointer",
              color:CA.gold, display:"grid", placeItems:"center" }}>
            <LogOut size={14}/>
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 14px 48px" }}>
        {/* ONGLETS — scroll horizontal sur mobile */}
        <div style={{ display:"flex", gap:6, marginBottom:18,
          overflowX:"auto", paddingBottom:4,
          WebkitOverflowScrolling:"touch" }}>
          {tabs.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              style={{ display:"flex", alignItems:"center", gap:5,
                padding:"8px 13px", borderRadius:9, flexShrink:0,
                border:`1.5px solid ${tab===tb.key?CA.gold:bord}`,
                background:tab===tb.key?CA.ink:cardBg,
                color:tab===tb.key?CA.gold:text,
                cursor:"pointer", fontSize:12.5, fontWeight:600,
                whiteSpace:"nowrap" }}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {/* VUE D'ENSEMBLE */}
        {tab==="overview" && (
          <div>
            {pending>0 && (
              <div style={{ background:`${CA.warning}15`,
                border:`1px solid ${CA.warning}44`, borderRadius:12,
                padding:"12px 14px", marginBottom:16,
                display:"flex", alignItems:"center", gap:10 }}>
                <AlertCircle size={18} color={CA.warning}/>
                <span style={{ fontSize:13.5, color:text, fontWeight:600, flex:1 }}>
                  {pending} commande{pending>1?"s":""} en attente
                </span>
                <button onClick={() => setTab("orders")}
                  style={{ background:CA.warning, color:"#fff", border:"none",
                    borderRadius:7, padding:"5px 12px", cursor:"pointer",
                    fontSize:12, fontWeight:700 }}>Voir</button>
              </div>
            )}
            <div style={{ display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",
              gap:10, marginBottom:20 }}>
              <AStatCard icon={<ShoppingCart size={18} color={CA.gold}/>}
                value={orders.length} label="Commandes" color={CA.gold} dark={dark}/>
              <AStatCard icon={<TrendingUp size={18} color={CA.success}/>}
                value={`${totalRev.toLocaleString("fr-FR")} F`}
                label="Revenus" color={CA.success} dark={dark}/>
              <AStatCard icon={<ShoppingBag size={18} color="#1DC0D4"/>}
                value={products.length} label="Articles" color="#1DC0D4" dark={dark}/>
              <AStatCard icon={<Package size={18} color={CA.warning}/>}
                value={pending} label="En attente" color={CA.warning} dark={dark}/>
            </div>

            {loadingOrders ? (
              <div style={{ textAlign:"center", padding:32, color:text }}>
                Chargement des commandes…
              </div>
            ) : (<>
              {/* Commandes récentes */}
              <div style={{ background:cardBg, border:`1px solid ${bord}`,
                borderRadius:14, padding:"16px", marginBottom:14 }}>
                <h3 style={{ fontFamily:"Georgia,serif", fontSize:15,
                  color:text, margin:"0 0 12px" }}>Commandes récentes</h3>
                {orders.slice(0,5).map((o,i) => (
                  <div key={o.id} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", padding:"9px 0",
                    borderBottom:i<4?`1px solid ${bord}`:"none" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:text }}>
                        #{o.id} — {o.name}
                      </div>
                      <div style={{ fontSize:11.5, color:dark?CA.dMute:CA.mute }}>
                        {(o.items||[]).join(", ")}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column",
                      alignItems:"flex-end", gap:3, flexShrink:0, marginLeft:8 }}>
                      <ABadge color={STATUS_ADMIN_COLORS[o.status]}>
                        {STATUS_ADMIN_LABELS[o.status]}
                      </ABadge>
                      <span style={{ fontFamily:"Georgia,serif", fontWeight:700,
                        color:CA.gold, fontSize:12 }}>
                        {(o.total||0).toLocaleString("fr-FR")} F
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length===0 && (
                  <p style={{ color:dark?CA.dMute:CA.mute, fontSize:13 }}>
                    Aucune commande pour l'instant.
                  </p>
                )}
              </div>

              {/* Stock faible */}
              <div style={{ background:cardBg, border:`1px solid ${bord}`,
                borderRadius:14, padding:"16px" }}>
                <h3 style={{ fontFamily:"Georgia,serif", fontSize:15,
                  color:text, margin:"0 0 12px" }}>⚠️ Stock faible</h3>
                {lowStock.length===0 ? (
                  <p style={{ color:dark?CA.dMute:CA.mute, fontSize:13 }}>
                    Tous les stocks sont corrects ✅
                  </p>
                ) : lowStock.map(p => (
                  <div key={p.id} style={{ display:"flex",
                    justifyContent:"space-between", alignItems:"center",
                    padding:"8px 0", borderBottom:`1px solid ${bord}` }}>
                    <span style={{ fontSize:13, color:text }}>{p.name}</span>
                    <ABadge color={p.stock===0?CA.danger:CA.warning}>
                      {p.stock===0?"Épuisé":`${p.stock} restant${p.stock>1?"s":""}`}
                    </ABadge>
                  </div>
                ))}
              </div>
            </>)}
          </div>
        )}

        {tab==="orders" && (
          <AdminOrdersTab orders={myOrders} setOrders={setOrders}
            users={users} auth={auth} dark={dark}/>
        )}
        {tab==="products" && can("add_product") && (
          <AdminProductsTab products={products} setProducts={setProducts}
            cats={cats} dark={dark}/>
        )}
        {tab==="cats" && auth.role==="admin" && (
          <AdminCatsTab cats={cats} setCats={setCats} dark={dark}/>
        )}
        {tab==="team" && auth.role==="admin" && (
          <AdminTeamTab users={users} setUsers={setUsers} dark={dark}/>
        )}
        {tab==="settings" && auth.role==="admin" && (
          <AdminSettingsTab cfg={cfg} setCfg={setCfg}
            promos={promos} setPromos={setPromos} dark={dark}/>
        )}
      </div>
    </div>
  );
}