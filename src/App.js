import { useState, useMemo, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
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

const timeAgo = (timestamp) => {
  if (!timestamp) return "À l'instant";
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return "À l'instant";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (isNaN(diff) || diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`;
  return `Il y a ${Math.floor(diff/86400)}j`;
};

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
  freeDelivery: false,
  heroTitle:   "L'élégance, livrée chez vous.",
  heroSub:     "Sacs & accessoires sélectionnés avec soin, livrés à Ouagadougou.",
  waMessage:   "Bonjour Dada's Drop 👋 Je suis intéressée par vos articles. Pouvez-vous m'aider ?",
  bannerActive: false,
  bannerText:  "",
  bannerColor: "#C9A84C",
  // Couleurs du site (personnalisables)
  colorGold:   "#C9A84C",
  colorCream:  "#FAF6EE",
  colorInk:    "#1A1A1A",
  colorAccent: "#1DC0D4",
  // Thème saisonnier actif ("classic" par défaut)
  theme:       "classic",
  // Paramètres Fondateur (réservés id:1)
  maintenance: false,
  maintenanceMsg: "Boutique en pause, nous revenons très vite ✦",
  founderPin:  "",   // PIN défini par David
};

/* ════════════════════════════════════════════
   🎨 THÈMES SAISONNIERS (activables manuellement par les admins)
════════════════════════════════════════════ */
const THEMES = {
  classic:    { label:"✨ Classique",        emoji:"",   anim:"none",
                colorGold:"#C9A84C", colorCream:"#FAF6EE", colorAccent:"#1DC0D4",
                desc:"Couleurs d'origine du site" },
  noel:       { label:"🎄 Noël",             emoji:"🎅", anim:"snow",
                colorGold:"#C0392B", colorCream:"#F4EFE7", colorAccent:"#1E7E34",
                desc:"Rouge & vert, flocons de neige" },
  halloween:  { label:"🎃 Halloween",        emoji:"🎃", anim:"bats",
                colorGold:"#E67E22", colorCream:"#1C1424", colorAccent:"#8E44AD",
                desc:"Orange & violet, ambiance sombre" },
  valentin:   { label:"❤️ Saint-Valentin",   emoji:"💕", anim:"hearts",
                colorGold:"#E84393", colorCream:"#FFF0F5", colorAccent:"#C0392B",
                desc:"Rosé, petits cœurs" },
  femmes:     { label:"🌸 Journée des femmes", emoji:"🌸", anim:"petals",
                colorGold:"#9B59B6", colorCream:"#FBF4FF", colorAccent:"#E84393",
                desc:"Violet & mimosa (8 mars)" },
  meres:      { label:"🌹 Fête des Mères",    emoji:"🌹", anim:"petals",
                colorGold:"#E84393", colorCream:"#FFF5F8", colorAccent:"#C0392B",
                desc:"Rose tendre, fleurs" },
  peres:      { label:"👔 Fête des Pères",    emoji:"👔", anim:"none",
                colorGold:"#2980B9", colorCream:"#F0F4F8", colorAccent:"#1A5276",
                desc:"Bleu élégant" },
  nouvelan:   { label:"🎉 Nouvel An",         emoji:"🎉", anim:"confetti",
                colorGold:"#D4AF37", colorCream:"#14110E", colorAccent:"#C0392B",
                desc:"Doré & noir, confettis" },
  paques:     { label:"🐰 Pâques",            emoji:"🐰", anim:"petals",
                colorGold:"#27AE60", colorCream:"#FBFAF0", colorAccent:"#F39C12",
                desc:"Pastel printanier" },
  burkina:    { label:"🇧🇫 Fête du Burkina",  emoji:"🇧🇫", anim:"confetti",
                colorGold:"#009E49", colorCream:"#FCF8E8", colorAccent:"#EF2B2D",
                desc:"Rouge, vert & jaune (5 août)" },
};


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
   🔗 SLUG — URL unique par article
════════════════════════════════════════════ */
const toSlug = (name) => (name||"")
  .toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "") // retirer accents
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-");

const slugToProduct = (slug, products) =>
  products.find(p => toSlug(p.name) === slug);


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
    ordersDelivered:"Commandes livrées", easyDelivery:"Livraison facile",
    satisfaction:"Satisfaction clientes", customerReviews:"Ce que disent nos clientes",
    verifiedReview:"Article vérifié", returnPolicy:"Article vérifié avant envoi · Échange possible à la livraison si défaut",
    usualPrice:"Prix habituel", youSave:"Vous économisez",
    preorderBtn:"Réserver (précommande)", preorderNote:"Article en précommande — disponible prochainement",
    newArrivals:"Nouveautés", newArrivalsSub:"Nos derniers arrivages, fraîchement ajoutés",
    noNew:"Aucune nouveauté pour le moment.", seeCatalogue:"Voir le catalogue",
    noReviewYet:"Pas encore d'avis", outOfStock:"Rupture de stock",
    loyaltyPts:"points fidélité", loyaltyValue:"de réduction",
    myFavorites:"Mes favoris", collections:"Collections", soonLabel:"bientôt",
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
    ordersDelivered:"Orders delivered", easyDelivery:"Easy delivery",
    satisfaction:"Customer satisfaction", customerReviews:"What our customers say",
    verifiedReview:"Verified item", returnPolicy:"Item checked before shipping · Exchange possible on delivery if defective",
    usualPrice:"Usual price", youSave:"You save",
    preorderBtn:"Pre-order", preorderNote:"Pre-order item — available soon",
    newArrivals:"New arrivals", newArrivalsSub:"Our latest arrivals, freshly added",
    noNew:"No new arrivals yet.", seeCatalogue:"See catalogue",
    noReviewYet:"No reviews yet", outOfStock:"Out of stock",
    loyaltyPts:"loyalty points", loyaltyValue:"discount",
    myFavorites:"My favorites", collections:"Collections", soonLabel:"soon",
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
    const slug = toSlug(p.name);
    const url  = `https://dadas-drop.vercel.app/article/${slug}`;
    const msg  = t.shareMsg
      .replace("{name}", p.name)
      .replace("{price}", fcfa(displayPrice))
      .replace("dadas-drop.vercel.app", url);
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
          {p.isPreorder && <span style={{ background:"#1DC0D4", color:"#fff",
            fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:999 }}>
            🕒 PRÉCO
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
            <span style={{ fontSize:10, color:"#bbb" }}>{t.noReviewYet}</span>
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
function ProductModal({ p, t, onClose, onAdd, dark, products=[], onOpen, onOpenCart }) {
  const [qty, setQty]           = useState(1);
  const [variant, setVariant]   = useState(null);
  const [variantErr, setVariantErr] = useState(false);
  const [reviews, setReviews]   = useState([]);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    setVariant(null); setQty(1); setVariantErr(false); setReviews([]);
    if (!p) return;
    // Incrémenter le compteur de vues (silencieux)
    sb.patch("products", p.id, { views: (p.views||0) + 1 }).catch(()=>{});
    // Charger les avis : matching souple sur le nom (exact OU contenu)
    const pn = (p.name||"").toLowerCase().trim();
    sb.get("reviews", `?order=date.desc&limit=200`)
      .then(rows => {
        const matched = (rows||[]).filter(r => {
          if (r.hidden === true) return false;
          const rn = (r.product||"").toLowerCase().trim();
          return rn && (rn === pn || rn.includes(pn) || pn.includes(rn));
        }).slice(0, 10);
        setReviews(matched);
      })
      .catch(() => {});
  }, [p]);

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
    const slug = toSlug(p.name);
    const url  = `https://dadas-drop.vercel.app/article/${slug}`;
    const priceStr = p.discount > 0
      ? `~${fcfa(p.price)}~ *${fcfa(displayPrice)}* (-${p.discount}%)`
      : `*${fcfa(displayPrice)}*`;
    const msg = `✦ *${p.name}* ✦\n${p.brand||""}\n\n💰 ${priceStr}\n${p.imgs?.[0]?`\n📸 ${p.imgs[0]}\n`:""}\n👉 Commander : ${url}\n\nvia Dada's Drop`;
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
                <span style={{ fontSize:11, color:"#bbb" }}>{t.noReviewYet}</span>
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
            {/* Économie réalisée (historique prix) */}
            {p.discount > 0 && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:6,
                background:`${C.success}12`, border:`1px solid ${C.success}33`,
                borderRadius:8, padding:"5px 10px", marginBottom:10 }}>
                <TrendingUp size={13} color={C.success}/>
                <span style={{ fontSize:12, color:C.success, fontWeight:600 }}>
                  {t.usualPrice} {fcfa(p.price)} · {t.youSave} {fcfa(p.price - displayPrice)}
                </span>
              </div>
            )}
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
                  border:`1px solid ${bord}`, borderRadius:9, overflow:"hidden",
                  opacity: (p.stock===0 && !p.isPreorder) ? 0.4 : 1 }}>
                  <button onClick={() => setQty(q=>Math.max(1,q-1))} style={stepBtn(dark)}
                    disabled={p.stock===0 && !p.isPreorder}>
                    <Minus size={13}/>
                  </button>
                  <span style={{ width:32, textAlign:"center",
                    fontWeight:700, color:text, fontSize:14 }}>{qty}</span>
                  <button onClick={() => setQty(q=>Math.min(p.stock,q+1))} style={stepBtn(dark)}
                    disabled={p.stock===0 && !p.isPreorder}>
                    <Plus size={13}/>
                  </button>
                </div>
                {(p.stock===0 && !p.isPreorder) ? (
                  <button disabled
                    style={{ flex:1, justifyContent:"center", display:"flex",
                      alignItems:"center", gap:7, padding:"12px",
                      borderRadius:11, border:"none",
                      background:"#ddd", color:"#888",
                      fontSize:14, fontWeight:700, cursor:"not-allowed",
                      fontFamily:"inherit" }}>
                    {t.outOfStock}
                  </button>
                ) : (
                  <button onClick={handleAdd}
                    style={{ flex:1, ...primaryBtn, justifyContent:"center",
                      ...(p.isPreorder ? { background:"#1DC0D4", borderColor:"#1DC0D4" } : {}) }}>
                    {p.isPreorder
                      ? <><Package size={15}/> {t.preorderBtn}</>
                      : <><ShoppingBag size={15}/> {t.addCart}</>}
                  </button>
                )}
              </div>
              {p.isPreorder && (
                <div style={{ fontSize:12, color:"#1DC0D4", marginTop:8,
                  display:"flex", alignItems:"center", gap:6, fontWeight:600 }}>
                  🕒 {t.preorderNote}
                </div>
              )}
              {/* Partager */}
              <button onClick={shareArticle}
                style={{ width:"100%", padding:"10px",
                  border:`1px solid ${bord}`, borderRadius:10,
                  background:"none", color:"#25D366", cursor:"pointer",
                  fontSize:13.5, fontWeight:600,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                <MessageCircle size={16}/> Partager sur WhatsApp
              </button>

              {/* Politique de retour rassurante */}
              <div style={{ display:"flex", alignItems:"center", gap:8,
                marginTop:10, padding:"10px 12px",
                background:dark?C.dBorder:C.creamD, borderRadius:10 }}>
                <ShieldCheck size={16} color={C.gold} style={{ flexShrink:0 }}/>
                <span style={{ fontSize:12, color:dark?C.dMute:C.mute, lineHeight:1.5 }}>
                  {t.returnPolicy}
                </span>
              </div>
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

          {/* AVIS CLIENTS */}
          {reviews.length > 0 && (
            <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${bord}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.gold,
                letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>
                ⭐ Avis clients ({reviews.length})
              </div>
              {reviews.map((r,i) => (
                <div key={r.id||i} style={{ marginBottom:12, paddingBottom:12,
                  borderBottom: i<reviews.length-1?`1px solid ${bord}`:"none" }}>
                  <div style={{ display:"flex", gap:2, marginBottom:4 }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ fontSize:13,
                        color:s<=(r.stars||0)?"#F5A623":"#DDD" }}>★</span>
                    ))}
                    <span style={{ fontSize:10.5, color:dark?C.dMute:C.mute, marginLeft:6 }}>
                      {r.date}
                    </span>
                  </div>
                  {r.text && (
                    <p style={{ fontSize:13, color:dark?C.dMute:C.mute,
                      margin:"0 0 6px", lineHeight:1.6, fontStyle:"italic" }}>
                      "{r.text}"
                    </p>
                  )}
                  {r.reply && (
                    <div style={{ background:dark?`${C.gold}0A`:`${C.gold}08`,
                      border:`1px solid ${C.gold}22`, borderRadius:8,
                      padding:"8px 10px", marginTop:6 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:C.gold, marginBottom:3 }}>
                        💬 Réponse de la boutique
                      </div>
                      <p style={{ fontSize:12, color:dark?C.dText:C.ink, margin:0, lineHeight:1.5 }}>
                        {r.reply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* VOUS AIMEREZ AUSSI */}
          {(() => {
            const similar = products.filter(x =>
              x.id !== p.id && !x.isHidden && x.stock > 0 &&
              (x.cat === p.cat || x.brand === p.brand)
            ).slice(0, 4);
            if (!similar.length) return null;
            return (
              <div style={{ marginTop:20, paddingTop:16,
                borderTop:`1px solid ${bord}` }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.gold,
                  letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>
                  ✦ Vous aimerez aussi
                </div>
                <div style={{ display:"flex", gap:9, overflowX:"auto",
                  paddingBottom:4, WebkitOverflowScrolling:"touch" }}>
                  {similar.map(s => {
                    const sPrice = s.discount>0
                      ? Math.round(s.price*(1-s.discount/100)) : s.price;
                    return (
                      <div key={s.id}
                        onClick={() => { onClose(); setTimeout(() => onOpen && onOpen(s), 120); }}
                        style={{ flexShrink:0, width:110, cursor:"pointer" }}>
                        <div style={{ width:110, height:110, borderRadius:10,
                          overflow:"hidden", background:C.creamD, marginBottom:6 }}>
                          <Thumb p={s}/>
                        </div>
                        <div style={{ fontFamily:"Georgia,serif", fontSize:11.5,
                          color:text, lineHeight:1.3, marginBottom:2 }}>
                          {s.name.length>22 ? s.name.slice(0,22)+"…" : s.name}
                        </div>
                        <div style={{ fontWeight:700, fontSize:12,
                          color: s.discount>0 ? "#E05030" : C.gold }}>
                          {fcfa(sPrice)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   🛒 PANIER
════════════════════════════════════════════ */
function CartDrawer({ open, cart, products, onClose, onQty, onRemove, onClearCart, onCheckout, t, dark, cfg }) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Réinitialiser le mode sélection à la fermeture
  useEffect(() => {
    if (!open) { setSelectMode(false); setSelectedKeys([]); }
  }, [open]);

  const lines = cart.map(it => {
    const p = products.find(x => x.id === it.id);
    return p ? { ...p, qty:it.qty, variant:it.variant } : null;
  }).filter(Boolean);
  const total = lines.reduce((s,l) => {
    const price = l.discount>0 ? Math.round(l.price*(1-l.discount/100)) : l.price;
    return s + price * l.qty;
  }, 0);
  const freeFrom = cfg?.freeFrom ? parseInt(cfg.freeFrom) : DEFAULT_CFG.freeFrom;
  const bg   = dark ? C.dCard : "#fff";
  const bord = dark ? C.dBorder : C.border;
  const text = dark ? C.dText : C.ink;

  const lineKey = (l) => `${l.id}-${l.variant?.label||""}`;
  const toggleSelectKey = (key) =>
    setSelectedKeys(ks => ks.includes(key) ? ks.filter(k=>k!==key) : [...ks, key]);

  const deleteSelected = () => {
    selectedKeys.forEach(key => {
      const l = lines.find(x => lineKey(x) === key);
      if (l) onRemove(l.id, l.variant);
    });
    setSelectedKeys([]);
    setSelectMode(false);
  };

  const clearAll = () => {
    if (!window.confirm("Vider entièrement le panier ?")) return;
    onClearCart && onClearCart();
    setSelectMode(false);
    setSelectedKeys([]);
  };

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
      {/* Barre d'actions : vider / sélectionner */}
      {lines.length > 0 && (
        <div style={{ display:"flex", gap:8, padding:"10px 16px",
          borderBottom:`1px solid ${bord}`, alignItems:"center" }}>
          {!selectMode ? (<>
            <button onClick={() => setSelectMode(true)}
              style={{ flex:1, padding:"7px", borderRadius:8, fontSize:12, fontWeight:600,
                border:`1px solid ${bord}`, background:"none", color:text, cursor:"pointer" }}>
              ✓ Sélectionner
            </button>
            <button onClick={clearAll}
              style={{ flex:1, padding:"7px", borderRadius:8, fontSize:12, fontWeight:600,
                border:`1px solid ${C.danger}44`, background:"none",
                color:C.danger, cursor:"pointer", display:"flex",
                alignItems:"center", justifyContent:"center", gap:5 }}>
              <Trash size={12}/> Vider le panier
            </button>
          </>) : (<>
            <span style={{ fontSize:12, color:text, fontWeight:600 }}>
              {selectedKeys.length} sélectionné{selectedKeys.length>1?"s":""}
            </span>
            <div style={{ flex:1 }}/>
            {selectedKeys.length > 0 && (
              <button onClick={deleteSelected}
                style={{ padding:"7px 12px", borderRadius:8, fontSize:12, fontWeight:700,
                  border:"none", background:C.danger, color:"#fff", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:5 }}>
                <Trash size={12}/> Supprimer
              </button>
            )}
            <button onClick={() => { setSelectMode(false); setSelectedKeys([]); }}
              style={{ padding:"7px 10px", borderRadius:8, fontSize:12, fontWeight:600,
                border:`1px solid ${bord}`, background:"none", color:text, cursor:"pointer" }}>
              Annuler
            </button>
          </>)}
        </div>
      )}
      {!!(cfg?.freeDelivery) && cfg?.showFreeFrom !== false && total >= freeFrom && (
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
          const key = lineKey(l);
          const isSel = selectedKeys.includes(key);
          return (
            <div key={key}
              style={{ display:"flex", gap:10, padding:"10px 0",
                borderBottom:`1px solid ${bord}`, alignItems:"center" }}>
              {selectMode && (
                <button onClick={() => toggleSelectKey(key)}
                  style={{ width:22, height:22, borderRadius:6, flexShrink:0,
                    border:`2px solid ${isSel?C.gold:bord}`,
                    background:isSel?C.gold:"transparent", cursor:"pointer",
                    display:"grid", placeItems:"center", color:C.ink, fontSize:12 }}>
                  {isSel ? "✓" : ""}
                </button>
              )}
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
          {!!(cfg?.freeDelivery) && cfg?.showFreeFrom !== false && total < freeFrom && (
            <p style={{ fontSize:11, color:C.mute, margin:"0 0 8px" }}>
              Livraison offerte dès {fcfa(freeFrom)}
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
  const [orderNum, setOrderNum] = useState(() => "DD-" + String(Math.floor(Math.random()*9000)+1000));
  const [copied, setCopied]     = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  // Réinitialiser à chaque ouverture du checkout (nouvelle commande)
  useEffect(() => {
    if (open) {
      setSent(false);
      setSaving(false);
      setOrderNum("DD-" + String(Math.floor(Math.random()*9000)+1000));
      setPromoApplied(null);
      setPromoCode("");
      setPromoErr(false);
    }
  }, [open]);

  // Sous-total après promo
  const subTotal = promoApplied
    ? Math.round(total * (1 - promoApplied.discount/100)) : total;
  const freeFrom = cfg?.freeFrom ? parseInt(cfg.freeFrom) : DEFAULT_CFG.freeFrom;
  const freeDeliveryActive = cfg?.freeDelivery !== false;
  const isFreeDelivery = freeDeliveryActive && subTotal >= freeFrom;
  const finalTotal = subTotal; // le livreur s'arrange pour le prix livraison
  const valid = form.nom.trim() && /^[0-9]{8}$/.test(form.tel.replace(/\s/g,"")) && form.ville.trim();

  if (!open) return null;
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  const payLabels = { orange:t.orange, moov:t.moov, wave:t.wave, livraison:t.delivery };
  const whatsapp  = cfg?.whatsapp || DEFAULT_CFG.whatsapp;

  const applyPromo = () => {
    const found = (promos||[]).find(p =>
      p.code === promoCode.toUpperCase().trim() &&
      p.active && p.uses < p.maxUses &&
      (!p.expiresAt || new Date(p.expiresAt) > new Date())
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
    // Numéro de paiement selon le mode choisi
    const payNumbers = {
      orange:   cfg?.orangeMoney || DEFAULT_CFG.orangeMoney,
      moov:     cfg?.moovMoney   || DEFAULT_CFG.moovMoney,
      wave:     cfg?.wave        || DEFAULT_CFG.wave,
      livraison: null,
    };
    const payNumStr = payNumbers[pay]
      ? `\n📱 Numéro de transfert : *${payNumbers[pay]}*`
      : "";
    const captureStr = pay!=="livraison"
      ? `\n✅ Je joins la capture du paiement après transfert.`
      : "";
    const shippingStr = isFreeDelivery ? `\n🚚 Livraison : *Offerte ✦*` : "";
    const msg = `Bonjour Dada's Drop 👋\nCommande #${orderNum}\n\n${items}${promoStr}${shippingStr}\n\n💰 Total articles : *${fcfa(finalTotal)}*\n💳 Règlement : ${payLabels[pay]}${payNumStr}\n\nNom : ${form.nom}\nTél : ${form.tel}\nVille : ${form.ville}\nAdresse : ${form.adresse||"—"}\nNote : ${form.note||"—"}\n\n📍 J'envoie ma localisation WhatsApp pour la livraison.${captureStr}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    setSaving(true);
    // Décrémenter le stock de chaque article commandé
    for (const l of lines) {
      const newStock = Math.max(0, (l.stock||0) - l.qty);
      try { await sb.patch("products", l.id, { stock: newStock }); } catch(e){ console.warn(e.message); }
    }
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

              {/* Récap des articles commandés */}
              <div style={{ background: dark?"#1A1510":"#fff",
                border:`1px solid ${bord}`, borderRadius:10,
                padding:"12px 14px", marginBottom:13, textAlign:"left" }}>
                <div style={{ fontSize:11, fontWeight:700, color:dark?C.dMute:C.mute,
                  marginBottom:8, textTransform:"uppercase", letterSpacing:.5 }}>
                  Récapitulatif
                </div>
                {lines.map((l,i) => {
                  const lp = l.discount>0 ? Math.round(l.price*(1-l.discount/100)) : l.price;
                  return (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between",
                      gap:8, fontSize:12.5, color:text, marginBottom:5 }}>
                      <span style={{ flex:1 }}>
                        {l.name}{l.variant?` (${l.variant.label})`:""} × {l.qty}
                      </span>
                      <span style={{ fontWeight:600, whiteSpace:"nowrap" }}>{fcfa(lp*l.qty)}</span>
                    </div>
                  );
                })}
                <div style={{ borderTop:`1px solid ${bord}`, marginTop:8, paddingTop:8,
                  display:"flex", justifyContent:"space-between",
                  fontSize:14, fontWeight:700, color:C.gold }}>
                  <span>Total</span>
                  <span>{fcfa(finalTotal)}</span>
                </div>
                <div style={{ fontSize:11, color:dark?C.dMute:C.mute, marginTop:6 }}>
                  🚚 {isFreeDelivery ? "Livraison offerte ✦" : "Livraison à définir avec le livreur"}
                </div>
              </div>

              <button onClick={onClose} style={{ ...primaryBtn, width:"100%", justifyContent:"center" }}>
                {t.close}
              </button>
            </div>
          ) : (<>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:19,
              color:text, margin:"0 0 4px" }}>{t.finalize}</h3>
            {promoApplied && (
              <div style={{ marginBottom:8 }}>
                <span style={{ fontSize:12, background:`${C.success}15`,
                  color:C.success, padding:"3px 8px", borderRadius:999,
                  fontWeight:600 }}>
                  -{promoApplied.discount}% appliqué ✓
                </span>
              </div>
            )}

            {/* Récap montants */}
            <div style={{ background: dark?"#1A1510":C.creamD,
              border:`1px solid ${bord}`, borderRadius:10,
              padding:"11px 13px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                fontSize:13, color:dark?C.dMute:C.mute, marginBottom:5 }}>
                <span>Sous-total</span>
                <span>{fcfa(subTotal)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between",
                fontSize:13, color:dark?C.dMute:C.mute, marginBottom:5 }}>
                <span>Livraison</span>
                <span style={{ color:isFreeDelivery?C.success:dark?C.dMute:C.mute,
                  fontWeight:isFreeDelivery?700:400 }}>
                  {isFreeDelivery ? "Offerte ✦" : "À définir avec le livreur"}
                </span>
              </div>
              {freeDeliveryActive && !isFreeDelivery && (
                <div style={{ fontSize:11, color:C.gold, marginBottom:5 }}>
                  Livraison offerte dès {fcfa(freeFrom)}
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between",
                fontSize:15, color:text, fontWeight:700,
                borderTop:`1px solid ${bord}`, paddingTop:7, marginTop:2 }}>
                <span>Total</span>
                <span style={{ color:C.gold }}>{fcfa(finalTotal)}</span>
              </div>
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
function TrackModal({ open, onClose, t, dark, products, cfg }) {
  const [num, setNum]         = useState("");
  const [tel, setTel]         = useState("");
  const [searchMode, setMode] = useState("id"); // "id" ou "phone"
  const [result, setResult]   = useState(null);
  const [results, setResults] = useState([]); // recherche par téléphone
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [itemReviews, setItemReviews] = useState({}); // { "Nom article": {stars, text, sent} }
  const [reviewsSubmitting, setReviewsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  if (!open) return null;
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  const steps = [t.statusPrep, t.statusShip, t.statusDeliv];
  const icons = [<Package size={13}/>, <Truck size={13}/>, <MapPin size={13}/>];

  // Extraire le nom propre d'un article depuis une ligne de commande
  // "Mini Boston Rose (Rose poudré) x2" → "Mini Boston Rose"
  const cleanItemName = (raw) => {
    if (!raw) return "";
    return String(raw)
      .replace(/\s*x\s*\d+\s*$/i, "")   // retirer " x2" à la fin
      .replace(/\s*\([^)]*\)\s*/g, " ") // retirer "(Rose poudré)"
      .replace(/\s+/g, " ")
      .trim();
  };

  // Trouver le produit correspondant à un nom d'article (matching souple)
  const findProduct = (itemName) => {
    const clean = cleanItemName(itemName).toLowerCase();
    if (!clean || !products) return null;
    // 1. correspondance exacte
    let prod = products.find(p => (p.name||"").toLowerCase() === clean);
    if (prod) return prod;
    // 2. le nom produit est contenu dans l'article ou inversement
    prod = products.find(p => {
      const pn = (p.name||"").toLowerCase();
      return pn && (clean.includes(pn) || pn.includes(clean));
    });
    return prod || null;
  };

  // Liste dédupliquée des articles de la commande livrée
  const orderItems = result?.status === 3
    ? [...new Set((result.items||[]).map(cleanItemName).filter(Boolean))]
    : [];

  const setItemReview = (name, patch) =>
    setItemReviews(r => ({ ...r, [name]: { ...(r[name]||{}), ...patch } }));

  const submitItemReview = async (itemName) => {
    const rv = itemReviews[itemName];
    if (!rv?.stars) return;
    setReviewsSubmitting(true);
    try {
      const orderId = result?.id || num.toUpperCase().trim().replace(/^#/, "");
      const prod = findProduct(itemName);
      const productName = prod?.name || itemName;
      // Anti-doublon : un avis par article par commande
      const existing = await sb.get("reviews",
        `?order_id=eq.${orderId}&product=eq.${encodeURIComponent(productName)}&select=id`);
      if (existing?.length > 0) {
        setItemReview(itemName, { sent:true });
        setReviewsSubmitting(false);
        return;
      }
      const reviewData = {
        order_id: orderId,
        product: productName,
        stars: rv.stars,
        text: rv.text || "",
        date: new Date().toISOString().split("T")[0],
        hidden: false,
      };
      const posted = await sb.post("reviews", reviewData);
      console.log("Avis posté:", posted);
      if (prod) {
        const newCount = (prod.ratingCount||0) + 1;
        const newRating = ((prod.rating||0)*(prod.ratingCount||0) + rv.stars) / newCount;
        await sb.patch("products", prod.id, {
          rating: Math.round(newRating*10)/10,
          rating_count: newCount,
        });
      }
      setItemReview(itemName, { sent:true });
    } catch(e) {
      console.error("Erreur soumission avis:", e.message);
      // Ne pas marquer comme envoyé si erreur réelle
      window.alert("Erreur lors de l'envoi de l'avis. Réessayez.");
    }
    setReviewsSubmitting(false);
  };

  const trackById = async () => {
    setLoading(true); setResult(null); setResults([]); setNotFound(false);
    // Accepter avec ou sans # devant
    const upper = num.toUpperCase().trim().replace(/^#/, "");
    try {
      // Chercher avec et sans # au cas où
      const upperClean = upper.replace(/^#/,"");
      const rows = await sb.get("orders", `?id=eq.${upperClean}&select=*`);
      if (rows?.length > 0) {
        const o = rows[0];
        setResult({
          ...o,
          name:  o.customer_name  || o.name  || "",
          phone: o.customer_phone || o.phone || "",
          date:  o.created_at ? o.created_at.split("T")[0] : o.date || "",
        });
        setLoading(false); return;
      }
    } catch(e) { console.warn(e.message); }
    const demo = DEMO_ORDERS_TRACK[upper];
    if (demo) setResult(demo); else setNotFound(true);
    setLoading(false);
  };

  const trackByPhone = async () => {
    setLoading(true); setResult(null); setResults([]); setNotFound(false);
    const cleaned = tel.replace(/\s/g,"");
    try {
      // Chercher par customer_phone d'abord
      let rows = await sb.get("orders",
        `?customer_phone=eq.${cleaned}&select=*&order=created_at.desc`
      );
      // Si rien trouvé, essayer avec phone
      if (!rows?.length) {
        rows = await sb.get("orders",
          `?phone=eq.${cleaned}&select=*&order=created_at.desc`
        );
      }
      if (rows?.length > 0) {
        const normalized = rows.map(o => ({
          ...o,
          name:  o.customer_name  || o.name  || "",
          phone: o.customer_phone || o.phone || "",
          date:  o.created_at ? o.created_at.split("T")[0] : o.date || "",
        }));
        setResults(normalized); setLoading(false); return;
      }
    } catch(e) { console.warn(e.message); }
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
                placeholder="Ex : DD-1234 ou #DD-1234" style={{ ...inpStyle(dark), flex:1 }}
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

              {/* Bouton annuler — seulement si encore en préparation */}
              {result.status === 1 && (
                <div style={{ background:`${C.danger}0F`,
                  border:`1px solid ${C.danger}33`,
                  borderRadius:11, padding:"13px 15px", marginBottom:14 }}>
                  <p style={{ fontSize:13, color:dark?C.dText:C.ink,
                    margin:"0 0 10px", lineHeight:1.6 }}>
                    Vous souhaitez annuler votre commande ?<br/>
                    <span style={{ fontSize:12, color:dark?C.dMute:C.mute }}>
                      L'annulation n'est possible qu'avant l'expédition.
                    </span>
                  </p>
                  <a href={`https://wa.me/${cfg?.whatsapp||DEFAULT_CFG.whatsapp}?text=${encodeURIComponent(
                    `Bonjour Dada's Drop 👋
Je souhaite annuler ma commande *#${result.id || num.toUpperCase().trim().replace(/^#/,"")}*.
Merci de confirmer l'annulation.`
                  )}`}
                    target="_blank" rel="noreferrer"
                    style={{ display:"inline-flex", alignItems:"center", gap:7,
                      background:"#25D366", color:"#fff", textDecoration:"none",
                      padding:"9px 14px", borderRadius:9,
                      fontWeight:700, fontSize:13 }}>
                    <MessageCircle size={14}/> Annuler via WhatsApp
                  </a>
                </div>
              )}

              {result.status === 3 && orderItems.length > 0 && (
                <div>
                  <div style={{ fontSize:12.5, fontWeight:700, color:text, marginBottom:4 }}>
                    {t.comment}
                  </div>
                  <p style={{ fontSize:11.5, color:dark?C.dMute:C.mute, margin:"0 0 12px" }}>
                    Notez chaque article de votre commande :
                  </p>
                  {orderItems.map((itemName, idx) => {
                    const rv = itemReviews[itemName] || {};
                    const prod = findProduct(itemName);
                    return (
                      <div key={idx} style={{ background:dark?"#1A1510":C.creamD,
                        border:`1px solid ${bord}`, borderRadius:11,
                        padding:"12px 13px", marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                          {prod?.imgs?.[0] && (
                            <div style={{ width:34, height:34, borderRadius:7,
                              overflow:"hidden", flexShrink:0 }}>
                              <img src={prod.imgs[0]} alt={itemName}
                                style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                            </div>
                          )}
                          <span style={{ fontFamily:"Georgia,serif", fontSize:13.5,
                            color:text, fontWeight:600 }}>{itemName}</span>
                        </div>
                        {rv.sent ? (
                          <div style={{ display:"flex", alignItems:"center", gap:6,
                            color:C.success, fontSize:12.5, fontWeight:600 }}>
                            <CheckCircle size={14}/> Merci pour votre avis ✦
                          </div>
                        ) : (<>
                          <StarRating rating={rv.stars||0} size={24} interactive
                            onRate={v=>setItemReview(itemName, {stars:v})}/>
                          <textarea
                            value={rv.text||""}
                            onChange={e=>setItemReview(itemName, {text:e.target.value})}
                            rows={2} placeholder="Votre avis (facultatif)…"
                            style={{ ...inpStyle(dark), resize:"vertical", marginTop:8, marginBottom:8 }}/>
                          <button onClick={() => submitItemReview(itemName)}
                            disabled={!rv.stars || reviewsSubmitting}
                            style={{ ...primaryBtn, width:"100%", justifyContent:"center",
                              opacity:(rv.stars && !reviewsSubmitting)?1:.5,
                              padding:"9px" }}>
                            <Star size={13}/> {reviewsSubmitting?"Envoi…":t.commentSend}
                          </button>
                        </>)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Résultats par téléphone */}
          {results.length > 0 && (
            <div style={{ marginTop:16 }}>
              {/* Points fidélité cumulés */}
              {cfg?.loyalty?.active && (() => {
                const pps = cfg.loyalty.pointsPer1000 || 1;
                const delivered = results.filter(o => o.status===3);
                const pts = delivered.reduce((sum,o) => sum + Math.floor((o.total||0)/1000)*pps, 0);
                const ptVal = cfg.loyalty.pointValue || 100;
                if (pts <= 0) return null;
                return (
                  <div style={{ background:`linear-gradient(135deg,${C.gold}22,${C.gold}08)`,
                    border:`1px solid ${C.gold}55`, borderRadius:13,
                    padding:"14px 16px", marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:20 }}>⭐</span>
                      <span style={{ fontFamily:"Georgia,serif", fontSize:16,
                        fontWeight:700, color:C.gold }}>
                        {pts} point{pts>1?"s":""} fidélité
                      </span>
                    </div>
                    <p style={{ fontSize:12, color:dark?C.dMute:C.mute, margin:0 }}>
                      Soit {fcfa(pts*ptVal)} de réduction · Mentionnez votre numéro à la commande pour en profiter
                    </p>
                  </div>
                );
              })()}
              <p style={{ fontSize:12.5, color: dark?C.dMute:C.mute, marginBottom:10 }}>
                {results.length} commande{results.length>1?"s":""} trouvée{results.length>1?"s":""}
              </p>
              {results.map((o,i) => (
                <div key={i} style={{ background: dark?"#1A1510":C.creamD,
                  border:`1px solid ${bord}`, borderRadius:11,
                  padding:"12px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:8, gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontFamily:"Georgia,serif", fontWeight:700,
                        color:text }}>#{o.id}</span>
                      <button type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(o.id).then(()=>{
                            setCopiedId(o.id);
                            setTimeout(()=>setCopiedId(null), 1500);
                          }).catch(()=>{});
                        }}
                        title="Copier le numéro"
                        style={{ border:"none", background:"none", cursor:"pointer",
                          color: copiedId===o.id ? C.success : (dark?C.dMute:C.mute),
                          display:"flex", alignItems:"center", gap:3, fontSize:11,
                          padding:"2px 4px" }}>
                        {copiedId===o.id ? <><Check size={12}/> Copié</> : <><Copy size={12}/> Copier</>}
                      </button>
                    </div>
                    <span style={{ fontSize:11, color:STATUS_COLORS[o.status],
                      fontWeight:600 }}>{STATUS_LABELS[o.status]}</span>
                  </div>
                  {renderTimeline(o)}
                  <div style={{ fontSize:13, color:C.gold, fontWeight:700, marginBottom:8 }}>
                    {fcfa(o.total)} · {o.date}
                  </div>
                  <button type="button"
                    onClick={() => { setNum(o.id); setMode("id"); }}
                    style={{ width:"100%", padding:"7px",
                      border:`1px solid ${C.gold}55`, borderRadius:8,
                      background:`${C.gold}11`, color:C.gold, cursor:"pointer",
                      fontSize:12, fontWeight:600, display:"flex",
                      alignItems:"center", justifyContent:"center", gap:5 }}>
                    <Search size={12}/> Suivre cette commande / donner mon avis
                  </button>
                </div>
              ))}
            </div>
          )}


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
        {/* Nouveautés */}
        <button onClick={() => { setPage("new"); onClose(); }}
          style={{ display:"flex", alignItems:"center", gap:8, width:"100%",
            textAlign:"left", padding:"9px 0", border:"none",
            background:"none", cursor:"pointer",
            fontFamily:"Georgia,serif", fontSize:17, color:text }}>
          <span style={{ fontSize:16 }}>🆕</span> {t.newArrivals}
        </button>
        {/* Favoris */}
        <button onClick={() => { setPage("favs"); onClose(); }}
          style={{ display:"flex", alignItems:"center", gap:8, width:"100%",
            textAlign:"left", padding:"9px 0", border:"none",
            background:"none", cursor:"pointer",
            fontFamily:"Georgia,serif", fontSize:17, color:text }}>
          <Heart size={16} color={C.gold} fill={C.gold}/> {t.myFavorites}
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
            letterSpacing:2, textTransform:"uppercase" }}>{t.collections}</span>
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
                marginLeft:6 }}>· {t.soonLabel}</span>}
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
  const aboutTitle = cfg?.aboutTitle || "Dada's Drop";
  const aboutSub   = cfg?.aboutSub   || "Collection Premium · Ouagadougou, Burkina Faso";
  const aboutStory = cfg?.aboutStory || "Dada's Drop est née d'une passion pour l'élégance accessible. Nous sélectionnons avec soin des sacs et accessoires de qualité premium, importés pour vous et livrés directement à Ouagadougou.";
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 20px" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <LogoDD size={64}/>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:28, color:text, margin:"16px 0 8px" }}>
          {aboutTitle}
        </h1>
        <p style={{ fontSize:14, color: dark?C.dMute:C.mute, lineHeight:1.7 }}>
          {aboutSub}
        </p>
      </div>
      <div style={{ background: dark?C.dCard:"#fff", border:`1px solid ${bord}`,
        borderRadius:16, padding:"24px 28px", marginBottom:16 }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:"0 0 12px" }}>
          Notre histoire
        </h2>
        <p style={{ fontSize:14, color: dark?C.dMute:C.mute, lineHeight:1.8 }}>
          {aboutStory}
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

function LegalPage({ type, dark, setPage, cfg }) {
  const content = LEGAL[type];
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  // Mapping type → clé cfg
  const cfgKey = { legal:"legalMentions", cgv:"legalCgv", rgpd:"legalRgpd", sav:"legalSav" }[type];
  const custom = cfg?.[cfgKey];
  // Les sections à afficher : custom (array de {h,p}) si défini et non vide, sinon fallback
  const sections = Array.isArray(custom) && custom.length > 0 ? custom : content.content;
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
      {sections.map((s,i) => (
        <div key={i} style={{ background: dark?C.dCard:"#fff",
          border:`1px solid ${bord}`, borderRadius:14,
          padding:"20px 24px", marginBottom:14 }}>
          {s.h && (
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, color:text, margin:"0 0 10px" }}>
              {s.h}
            </h2>
          )}
          <p style={{ fontSize:14, color: dark?C.dMute:C.mute, lineHeight:1.8, margin:0,
            whiteSpace:"pre-wrap" }}>
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
/* ════════════════════════════════════════════
   📱 BOUTON WHATSAPP DÉPLAÇABLE
════════════════════════════════════════════ */
function DraggableWA({ whatsapp, waMsg }) {
  const [pos, setPos] = useState({ bottom:80, right:18 });
  const [dragging, setDragging] = useState(false);
  const movedRef = { current: false };
  const [moved, setMoved] = useState(false);
  // useRef pour persister entre renders sans déclencher de re-render
  const startRef = useState({ current: null })[0];

  const onTouchStart = (e) => {
    const t = e.touches[0];
    startRef.current = { x:t.clientX, y:t.clientY, pos:{ ...pos } };
    setDragging(true);
    setMoved(false);
    movedRef.current = false;
  };

  const onTouchMove = (e) => {
    if (!startRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      movedRef.current = true;
      setMoved(true);
    }
    const newRight = Math.max(8, Math.min(window.innerWidth - 58,
      startRef.current.pos.right - dx));
    const newBottom = Math.max(8, Math.min(window.innerHeight - 58,
      startRef.current.pos.bottom - dy));
    setPos({ right: newRight, bottom: newBottom });
    e.preventDefault();
  };

  const onTouchEnd = () => {
    setDragging(false);
    startRef.current = null;
  };

  const handleClick = (e) => { if (movedRef.current) e.preventDefault(); };

  return (
    <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waMsg)}`}
      target="_blank" rel="noreferrer"
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ position:"fixed", bottom:pos.bottom, right:pos.right,
        width:50, height:50, borderRadius:999, background:"#25D366",
        display:"grid", placeItems:"center", zIndex:49,
        boxShadow:`0 4px 16px rgba(37,211,102,${dragging?.6:.4})`,
        textDecoration:"none", cursor:dragging?"grabbing":"pointer",
        transform:dragging?"scale(1.08)":"scale(1)",
        transition:dragging?"none":"transform .15s",
        userSelect:"none", touchAction:"none" }}>
      <MessageCircle size={22} color="#fff"/>
    </a>
  );
}

/* ════════════════════════════════════════════
   ❄️ ANIMATION DE THÈME SAISONNIER
════════════════════════════════════════════ */
function ThemeAnimation({ theme }) {
  const cfg = THEMES[theme];
  if (!cfg || cfg.anim === "none") return null;

  const EMOJI = {
    snow:     ["❄️","❅","❆"],
    hearts:   ["❤️","💕","💗"],
    petals:   ["🌸","🌺","🌷"],
    confetti: ["🎉","✨","🎊"],
    bats:     ["🦇","🕸️","🕷️"],
  }[cfg.anim] || ["✦"];

  // 14 particules avec positions/délais pseudo-aléatoires mais stables
  const particles = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 7.3 + 4) % 96,
    delay: (i * 0.55) % 8,
    dur: 7 + (i % 5),
    size: 14 + (i % 4) * 5,
    emoji: EMOJI[i % EMOJI.length],
  }));

  return (
    <div aria-hidden="true" style={{ position:"fixed", inset:0,
      pointerEvents:"none", overflow:"hidden", zIndex:5 }}>
      <style>{`
        @keyframes ddfall {
          0%   { transform:translateY(-10vh) rotate(0deg);   opacity:0; }
          10%  { opacity:.9; }
          90%  { opacity:.9; }
          100% { transform:translateY(110vh) rotate(360deg); opacity:0; }
        }
      `}</style>
      {particles.map((p,i) => (
        <span key={i} style={{ position:"absolute", left:`${p.left}%`, top:0,
          fontSize:p.size, animation:`ddfall ${p.dur}s linear ${p.delay}s infinite` }}>
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

function ShopApp({ products, setProducts, cats, setCats, cfg, setCfg, promos, dark, setDark, initialPage="home" }) {
  const [lang, setLang]         = useState("fr");
  const [page, setPageRaw]      = useState(initialPage);
  const [toast, setToast]       = useState(null);

  // Navigation qui force le scroll en haut même si on est déjà sur la page
  const setPage = useCallback((p) => {
    setPageRaw(prev => {
      if (prev === p) {
        window.scrollTo({ top:0, behavior:"smooth" });
      }
      return p;
    });
  }, []);
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
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [homeReviews, setHomeReviews] = useState([]);
  const [favs, setFavs]           = useState(() => {
    try { const s = localStorage.getItem("dd_favs"); return s?JSON.parse(s):[]; } catch { return []; }
  });

  // Charger le nombre de commandes livrées + derniers avis (page accueil)
  useEffect(() => {
    sb.get("orders", "?status=eq.3&select=id")
      .then(rows => setDeliveredCount(rows?.length || 0))
      .catch(()=>{});
    sb.get("reviews", "?order=id.desc&limit=12")
      .then(rows => setHomeReviews((rows||[]).filter(r => r.hidden !== true && r.stars >= 4)))
      .catch(()=>{});
  }, []);

  useEffect(() => {
    try { localStorage.setItem("dd_favs", JSON.stringify(favs)); } catch {}
  }, [favs]);

  const toggleFav = useCallback((id) => {
    setFavs(fs => fs.includes(id) ? fs.filter(x=>x!==id) : [...fs,id]);
  }, []);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  // Scroll en haut à chaque changement de page
  useEffect(() => {
    window.scrollTo({ top:0, behavior:"instant" });
  }, [page]);

  // Sync catégories + config toutes les 10s
  useEffect(() => {
    const fetchCatsCfg = () => {
      // Cache-bust pour forcer Supabase à retourner la version fraîche
      const bust = `&limit=1&_cb=${Date.now()}`;
      sb.get("announcements", `?id=eq.categories&select=data${bust}`)
        .then(rows => { if(rows?.[0]?.data) setCats(rows[0].data); })
        .catch(e => console.warn("cats sync:", e.message));
      sb.get("announcements", `?id=eq.config&select=data${bust}`)
        .then(rows => { if(rows?.[0]?.data) setCfg(c=>({...c,...rows[0].data})); })
        .catch(e => console.warn("cfg sync:", e.message));
    };
    fetchCatsCfg(); // immédiat au montage
    const fastSync = setInterval(fetchCatsCfg, 2500);
    return () => clearInterval(fastSync);
  }, []);

  // Sync produits toutes les 60s (plus lourd)
  useEffect(() => {
    const slowSync = setInterval(() => {
      sb.get("products", "?trashed_at=is.null&order=id.asc")
        .then(rows => {
          if(rows?.length>0) {
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
              isPreorder: p.is_preorder ?? false,
            }));
            setProducts(normalized);
          }
        })
        .catch(e => console.warn("products sync:", e.message));
    }, 10000);
    return () => clearInterval(slowSync);
  }, []);
  // Refresh immédiat quand l'utilisateur revient sur l'onglet/app
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const bust = `&_cb=${Date.now()}`;
      sb.get("announcements", `?id=eq.categories&select=data${bust}`)
        .then(rows => { if(rows?.[0]?.data) setCats(rows[0].data); }).catch(()=>{});
      sb.get("announcements", `?id=eq.config&select=data${bust}`)
        .then(rows => { if(rows?.[0]?.data) setCfg(c=>({...c,...rows[0].data})); }).catch(()=>{});
      sb.get("products", "?trashed_at=is.null&order=id.asc")
        .then(rows => {
          if(rows?.length>0) {
            setProducts(rows.map(p => ({
              ...p,
              isNew:p.is_new??p.isNew??false, isBest:p.is_best??p.isBest??false,
              isPinned:p.is_pinned??p.isPinned??false, isHidden:p.is_hidden??p.isHidden??false,
              desc:p.description??p.desc??"", imgs:p.imgs||[], accent:p.accent||[],
              variants:p.variants||[], rating:p.rating||0, ratingCount:p.rating_count||0, isPreorder:p.is_preorder??false,
            })));
          }
        }).catch(()=>{});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);
  useEffect(() => {
    const isOpen = menuOpen||cartOpen||checkout||trackOpen||!!selected;
    if (isOpen) {
      // Technique iOS-compatible : fixer le body à la position de scroll actuelle
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY); // restaurer la position
      };
    }
  }, [menuOpen,cartOpen,checkout,trackOpen,selected]);

  const t    = T[lang];
  const bord = dark ? C.dBorder : C.border;
  // Couleurs effectives : un thème saisonnier actif surcharge les couleurs custom
  const activeTheme = (cfg?.theme && cfg.theme !== "classic") ? THEMES[cfg.theme] : null;
  const effGold  = activeTheme?.colorGold  || cfg?.colorGold  || C.gold;
  const effCream = activeTheme?.colorCream || cfg?.colorCream || C.cream;
  const effInk   = cfg?.colorInk || C.ink;
  const text = dark ? C.dText : effInk;

  const bg   = dark ? C.dBg : effCream;
  const hdrBg = dark ? "rgba(15,12,8,.92)"
    : `rgba(${parseInt(effCream.slice(1,3),16)},${parseInt(effCream.slice(3,5),16)},${parseInt(effCream.slice(5,7),16)},.92)`;
  // Couleur dorée effective (thème ou custom)
  const gold = effGold;

  // Produits visibles : épinglés en premier, masqués filtrés
  // Les articles épuisés restent VISIBLES (façon Shein) — le bouton devient "Rupture de stock"
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
        const catObj = cats.find(c=>c.id===cat);
        if (catObj?.soon) return false;
        // Comparer avec l'ID court ET le label français (pour compatibilité Supabase)
        const matchId    = p.cat === cat;
        const matchLabel = catObj && (
          p.cat === catObj.label ||
          p.cat === catObj.labelEn ||
          (p.cat||"").toLowerCase() === (catObj.label||"").toLowerCase()
        );
        if (!matchId && !matchLabel) return false;
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
    // Toast discret "ajouté au panier"
    setToast(`✦ ${p.name} ajouté au panier`);
  }, []);

  // Faire disparaître le toast après 2,2s
  useEffect(() => {
    if (!toast) return;
    const tm = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(tm);
  }, [toast]);

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

  // ── MODE MAINTENANCE (activé par le Fondateur) ──
  if (cfg?.maintenance) {
    return (
      <div style={{ minHeight:"100vh", background: dark?C.dBg:effCream,
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"24px", textAlign:"center",
        fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
        <div style={{ fontSize:54, marginBottom:18 }}>🛍️</div>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700,
          color:effGold, letterSpacing:2, margin:"0 0 6px" }}>
          {cfg?.brand || "DADA'S DROP"}
        </h1>
        <div style={{ width:50, height:2, background:effGold, borderRadius:99, margin:"10px 0 20px" }}/>
        <p style={{ fontSize:16, color: dark?C.dText:C.ink, maxWidth:340, lineHeight:1.6, margin:0 }}>
          {cfg?.maintenanceMsg || "Boutique en pause, nous revenons très vite ✦"}
        </p>
        {cfg?.whatsapp && (
          <a href={`https://wa.me/${cfg.whatsapp}`} target="_blank" rel="noreferrer"
            style={{ marginTop:24, display:"inline-flex", alignItems:"center", gap:7,
              background:"#25D366", color:"#fff", textDecoration:"none",
              padding:"11px 20px", borderRadius:11, fontWeight:700, fontSize:14 }}>
            <MessageCircle size={16}/> Nous contacter
          </a>
        )}
      </div>
    );
  }

  return (
    <div style={{ background:bg, minHeight:"100vh", color:text,
      fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box}
        input,textarea,select{font-family:inherit}
        @supports(-webkit-touch-callout:none){input,textarea,select{font-size:16px!important}}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${cfg?.colorGold||C.gold}!important}
        .dd-card:hover{box-shadow:0 12px 28px rgba(0,0,0,.12);transform:translateY(-2px)!important}
        @keyframes ddFade{from{opacity:0}to{opacity:1}}
        @keyframes ddHero{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ddToast{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
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

      {/* ── ANIMATION DE THÈME SAISONNIER ── */}
      {!dark && <ThemeAnimation theme={cfg?.theme || "classic"} />}

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
              {activeTheme?.emoji && <span style={{ marginRight:5 }}>{activeTheme.emoji}</span>}
              {cfg?.brand || "DADA'S DROP"}
              {activeTheme?.emoji && <span style={{ marginLeft:5 }}>{activeTheme.emoji}</span>}
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

        {/* COMPTEUR CONFIANCE */}
        {deliveredCount > 0 && (
          <section style={{ maxWidth:1200, margin:"0 auto", padding:"20px 16px 0" }}>
            <div style={{ display:"flex", justifyContent:"center", gap:24,
              flexWrap:"wrap", background:dark?C.dCard:"#fff",
              border:`1px solid ${dark?C.dBorder:C.border}`,
              borderRadius:14, padding:"16px 20px" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:700,
                  color:gold }}>{deliveredCount}+</div>
                <div style={{ fontSize:11.5, color:dark?C.dMute:C.mute }}>
                  {t.ordersDelivered}
                </div>
              </div>
              <div style={{ width:1, background:dark?C.dBorder:C.border }}/>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:700,
                  color:gold }}>✓</div>
                <div style={{ fontSize:11.5, color:dark?C.dMute:C.mute }}>
                  {t.easyDelivery}
                </div>
              </div>
              <div style={{ width:1, background:dark?C.dBorder:C.border }}/>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:700,
                  color:gold }}>★ 4.8</div>
                <div style={{ fontSize:11.5, color:dark?C.dMute:C.mute }}>
                  {t.satisfaction}
                </div>
              </div>
            </div>
          </section>
        )}
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

        {/* CAROUSEL AVIS CLIENTS */}
        {homeReviews.length > 0 && (
          <section style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px 40px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
              <div style={{ width:3, height:18, background:GRAD, borderRadius:99 }}/>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text,
                margin:0, fontWeight:400 }}>
                {t.customerReviews}
              </h2>
            </div>
            <div style={{ display:"flex", gap:12, overflowX:"auto",
              paddingBottom:8, WebkitOverflowScrolling:"touch",
              scrollSnapType:"x mandatory" }}>
              {homeReviews.map((r,i) => (
                <div key={r.id||i} style={{ flexShrink:0, width:260,
                  scrollSnapAlign:"start",
                  background:dark?C.dCard:"#fff",
                  border:`1px solid ${bord}`, borderRadius:14, padding:"16px" }}>
                  <div style={{ display:"flex", gap:2, marginBottom:8 }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14}
                        fill={s<=r.stars?gold:"none"}
                        color={s<=r.stars?gold:bord}/>
                    ))}
                  </div>
                  {r.text && (
                    <p style={{ fontSize:13.5, color:text, lineHeight:1.6,
                      margin:"0 0 10px", display:"-webkit-box",
                      WebkitLineClamp:4, WebkitBoxOrient:"vertical",
                      overflow:"hidden" }}>
                      "{r.text}"
                    </p>
                  )}
                  <div style={{ fontSize:11.5, color:gold, fontWeight:600 }}>
                    {r.product || "Article vérifié"}
                  </div>
                  {r.reply && (
                    <div style={{ marginTop:10, padding:"8px 10px",
                      background:dark?C.dBorder:C.creamD, borderRadius:9,
                      fontSize:12, color:dark?C.dMute:C.mute }}>
                      <strong style={{ color:gold }}>Dada's Drop :</strong> {r.reply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
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
                {t.seeCatalogue} <ArrowRight size={14}/>
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
      {page==="new" && (
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"20px 16px 40px" }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, color:text,
            margin:"0 0 6px", fontWeight:400 }}>🆕 {t.newArrivals}</h1>
          <p style={{ fontSize:13, color:dark?C.dMute:C.mute, marginBottom:18 }}>
            {t.newArrivalsSub}
          </p>
          {visibleProducts.filter(p=>p.isNew).length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 16px" }}>
              <span style={{ fontSize:44 }}>🆕</span>
              <p style={{ marginTop:12, color:dark?C.dMute:"#bbb", fontSize:14 }}>
                {t.noNew}
              </p>
              <button onClick={()=>setPage("catalogue")}
                style={{ ...primaryBtn, marginTop:16, gap:7 }}>
                {t.seeCatalogue} <ArrowRight size={14}/>
              </button>
            </div>
          ) : (<>
            <div style={{ height:2, background:GRAD, borderRadius:99,
              marginBottom:20, maxWidth:60 }}/>
            <div className="dd-grid"
              style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
              {visibleProducts.filter(p=>p.isNew).map((p,i) => (
                <ProductCard key={p.id} p={p} t={t} cats={cats}
                  idx={i} mounted={mounted} dark={dark}
                  isFav={favs.includes(p.id)} onToggleFav={toggleFav}
                  onOpen={setSelected} onAdd={addToCart}/>
              ))}
            </div>
          </>)}
        </section>
      )}
      {page==="about"  && <AboutPage dark={dark} cfg={cfg}/>}
      {page==="legal"  && <LegalPage type="legal" dark={dark} setPage={setPage} cfg={cfg}/>}
      {page==="cgv"    && <LegalPage type="cgv"   dark={dark} setPage={setPage} cfg={cfg}/>}
      {page==="rgpd"   && <LegalPage type="rgpd"  dark={dark} setPage={setPage} cfg={cfg}/>}
      {page==="sav"    && <LegalPage type="sav"   dark={dark} setPage={setPage} cfg={cfg}/>}
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

      {/* WHATSAPP FLOTTANT DÉPLAÇABLE */}
      <DraggableWA whatsapp={whatsapp} waMsg={waMsg}/>

      {/* TOAST "ajouté au panier" */}
      {toast && (
        <div style={{ position:"fixed", bottom:"calc(90px + env(safe-area-inset-bottom,0px))",
          left:"50%", transform:"translateX(-50%)", zIndex:80,
          background:C.ink, color:C.gold, padding:"11px 20px",
          borderRadius:999, fontSize:13, fontWeight:600,
          boxShadow:"0 6px 24px rgba(0,0,0,.3)", border:`1px solid ${C.gold}44`,
          maxWidth:"88vw", textAlign:"center", whiteSpace:"nowrap",
          overflow:"hidden", textOverflow:"ellipsis",
          animation:"ddToast .3s ease" }}>
          {toast}
        </div>
      )}

      {/* MODALS */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)}
        t={t} lang={lang} setLang={setLang} dark={dark}
        setPage={setPage} setCat={setCat} cats={cats} favs={favs}/>
      <ProductModal p={selected} t={t} dark={dark}
        products={products} onOpen={setSelected}
        onOpenCart={() => setCartOpen(true)}
        onClose={() => setSelected(null)} onAdd={addToCart}/>
      <CartDrawer open={cartOpen} cart={cart} products={products}
        t={t} dark={dark} cfg={cfg} onClose={() => setCartOpen(false)}
        onQty={setQty} onRemove={removeItem} onClearCart={() => setCart([])}
        onCheckout={() => { setCartOpen(false); setCheckout(true); }}/>
      <Checkout open={checkout} lines={lines} total={total}
        t={t} dark={dark} promos={promos} cfg={cfg}
        onClose={() => setCheckout(false)}
        onClearCart={() => setCart([])}/>
      <TrackModal open={trackOpen} t={t} dark={dark}
        products={products} cfg={cfg}
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
  { id:1, name:"David Amah",       email:"amahdavid33@gmail.com",        role:"admin",    active:true, pwd:"David@dadasdrop"   },
  { id:2, name:"Celeste Pakodtogo",email:"pakodtogoceleste@gmail.com",    role:"manager",  active:true, pwd:"Celeste@dadasdrop" },
  { id:3, name:"Erwin Ouili",      email:"erwinouili10@gmail.com",        role:"delivery", active:true, pwd:"Erwin@dadasdrop"   },
];


/* ════════════════════════════════════════════
   🔗 PAGE ARTICLE — URL directe /article/:slug
════════════════════════════════════════════ */
function ArticlePage({ products, cats, cfg, promos, dark, setDark }) {
  const { slug } = useParams();

  const product = slugToProduct(slug, products);

  // Si article trouvé → ouvrir ShopApp avec la fiche ouverte
  const [selected, setSelected] = useState(product||null);
  const [cart, setCart]         = useState([]);

  if (!product) {
    return (
      <div style={{ minHeight:"100vh", background:dark?C.dBg:C.cream,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:32, textAlign:"center",
        fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
        <div style={{ fontFamily:"Georgia,serif", fontSize:60,
          color:C.gold, marginBottom:16 }}>404</div>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:22,
          color:dark?C.dText:C.ink, margin:"0 0 10px", fontWeight:400 }}>
          Article introuvable
        </h1>
        <p style={{ fontSize:14, color:dark?C.dMute:C.mute, margin:"0 0 24px" }}>
          Cet article n'existe pas ou a été retiré.
        </p>
        <a href="/" style={{ ...primaryBtn, textDecoration:"none", gap:7 }}>
          <ArrowLeft size={14}/> Voir la boutique
        </a>
      </div>
    );
  }

  const t = T["fr"];
  const addToCart = (p, qty=1, variant=null) => {
    setCart(c => {
      const key = `${p.id}-${variant?.label||""}`;
      const ex  = c.find(i=>`${i.id}-${i.variant?.label||""}`===key);
      if (ex) return c.map(i=>`${i.id}-${i.variant?.label||""}`===key?{...i,qty:i.qty+qty}:i);
      return [...c,{id:p.id,qty,variant}];
    });
  };

  return (
    <div style={{ minHeight:"100vh", background:dark?C.dBg:C.cream,
      fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{`*{box-sizing:border-box}`}</style>
      {/* Header simple */}
      <header style={{ background:dark?"rgba(15,12,8,.95)":"rgba(250,246,238,.95)",
        backdropFilter:"blur(14px)",
        borderBottom:`1px solid ${dark?C.dBorder:C.border}`,
        padding:"0 16px", height:58,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:50 }}>
        <a href="/" style={{ display:"flex", alignItems:"center", gap:8,
          textDecoration:"none", color:dark?C.dText:C.ink }}>
          <ArrowLeft size={18}/> <span style={{ fontSize:13 }}>Retour à la boutique</span>
        </a>
        <LogoDD size={36}/>
        <div style={{ width:80 }}/>
      </header>
      {/* Fiche article */}
      <div style={{ maxWidth:520, margin:"24px auto", padding:"0 16px 60px" }}>
        <Carousel p={product}/>
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.gold,
            letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>
            {product.brand}
          </div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:24,
            color:dark?C.dText:C.ink, margin:"0 0 8px", fontWeight:400 }}>
            {product.name}
          </h1>
          <StarRating rating={product.rating||0} count={product.ratingCount||0} size={14}/>
          <div style={{ fontFamily:"Georgia,serif", fontWeight:700,
            fontSize:22, color:C.gold, margin:"10px 0" }}>
            {fcfa(product.discount>0
              ? Math.round(product.price*(1-product.discount/100))
              : product.price)}
            {product.discount>0 && (
              <span style={{ fontFamily:"sans-serif", fontSize:14,
                color:C.mute, textDecoration:"line-through", marginLeft:10 }}>
                {fcfa(product.price)}
              </span>
            )}
          </div>
          <p style={{ fontSize:14, color:dark?C.dMute:C.mute,
            lineHeight:1.7, margin:"0 0 20px" }}>
            {product.desc}
          </p>
          {product.stock===0 ? (
            <a href={`https://wa.me/${cfg?.whatsapp||DEFAULT_CFG.whatsapp}?text=${encodeURIComponent(
              `Bonjour ! Je suis intéressée par "${product.name}" mais il est épuisé. Pouvez-vous me prévenir quand il est disponible ?`
            )}`} target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", justifyContent:"center",
                gap:8, background:"#25D366", color:"#fff", textDecoration:"none",
                padding:"13px", borderRadius:11, fontWeight:700, fontSize:15 }}>
              <MessageCircle size={18}/> Me prévenir quand disponible
            </a>
          ) : (
            <a href={`/?article=${toSlug(product.name)}`}
              style={{ display:"flex", alignItems:"center", justifyContent:"center",
                gap:8, background:C.ink, color:C.gold, textDecoration:"none",
                border:`1px solid ${C.gold}44`,
                padding:"13px", borderRadius:11, fontWeight:700, fontSize:15 }}>
              <ShoppingBag size={18}/> Commander sur la boutique
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   🔒 ADMIN GUARD — AdminApp défini plus bas dans ce fichier
════════════════════════════════════════════ */
function AdminGuard({ products, setProducts, cats, setCats, cfg, setCfg, promos, setPromos, dark, setDark }) {
  const navigate = useNavigate();
  return (
    <AdminApp
      products={products} setProducts={setProducts}
      cats={cats} setCats={setCats}
      cfg={cfg} setCfg={setCfg}
      promos={promos} setPromos={setPromos}
      dark={dark} setDark={setDark}
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

  // SEO / Open Graph — balises meta pour l'aperçu WhatsApp/Google
  useEffect(() => {
    const brand = cfg?.brand || "Dada's Drop";
    const title = `${brand} — Sacs & accessoires premium livrés à Ouagadougou`;
    const desc = cfg?.heroSub || "Sacs à main, pochettes et accessoires sélectionnés avec soin, livrés à Ouagadougou. Paiement à la livraison, commande facile via WhatsApp.";
    const img = products?.[0]?.imgs?.[0] || "";
    document.title = title;
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", "website");
    if (img) setMeta("property", "og:image", img);
    setMeta("property", "og:site_name", brand);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    if (img) setMeta("name", "twitter:image", img);
  }, [cfg, products]);

  // Chargement initial depuis Supabase
  useEffect(() => {
    Promise.allSettled([
      // Produits
      sb.get("products", "?trashed_at=is.null&order=id.asc")
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
              isPreorder: p.is_preorder ?? false,
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
        .then(rows => {
          if (rows?.length > 0) {
            setPromos(rows.map(p => ({
              code:     p.code     || p.id     || "",
              discount: p.discount || 0,
              maxUses:  p.max_uses || p.maxUses || 999,
              uses:     p.uses     || 0,
              active:   p.active   ?? true,
              expiresAt: p.expires_at || p.expiresAt || null,
            })));
          }
        }),
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
          <ShopApp products={products} setProducts={setProducts}
            cats={cats} setCats={setCats}
            cfg={cfg} setCfg={setCfg}
            promos={promos}
            dark={dark} setDark={setDark}/>
        }/>
        <Route path="/catalogue" element={
          <ShopApp products={products} setProducts={setProducts}
            cats={cats} setCats={setCats}
            cfg={cfg} setCfg={setCfg}
            promos={promos}
            dark={dark} setDark={setDark} initialPage="catalogue"/>
        }/>
        {/* Route article direct — /article/mini-boston-rose */}
        <Route path="/article/:slug" element={
          <ArticlePage products={products} cats={cats} cfg={cfg}
            promos={promos} dark={dark} setDark={setDark}/>
        }/>
        <Route path="/admin" element={
          <AdminGuard products={products} setProducts={setProducts}
            cats={cats} setCats={setCats}
            cfg={cfg} setCfg={setCfg}
            promos={promos} setPromos={setPromos}
            dark={dark} setDark={setDark}/>
        }/>
        <Route path="/admin/*" element={
          <AdminGuard products={products} setProducts={setProducts}
            cats={cats} setCats={setCats}
            cfg={cfg} setCfg={setCfg}
            promos={promos} setPromos={setPromos}
            dark={dark} setDark={setDark}/>
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
function AdminOrdersTab({ orders, setOrders, trash, setTrash, users, auth, dark }) {
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState(0);
  const [showTrash, setShowTrash] = useState(false);
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
    // Notification WhatsApp automatique à la cliente
    const o = orders.find(x=>x.id===id);
    if (!o) return;
    const phone = o.phone || o.customer_phone || "";
    const name  = o.name  || o.customer_name  || "";
    if (!phone) return;
    const msgs = {
      2: `Bonjour ${name} 👋\n\nVotre commande *#${id}* vient d'être *expédiée* ! 🚚\nElle est en route vers vous.\n\nSuivez votre commande ici : dadas-drop.vercel.app\n\n✦ Dada's Drop`,
      3: `Bonjour ${name} 👋\n\nVotre commande *#${id}* a été *livrée* ! ✅🎉\nNous espérons que vous êtes satisfaite.\n\nLaissez-nous un avis ici : dadas-drop.vercel.app\n\n✦ Dada's Drop`,
    };
    if (msgs[status]) {
      const waPhone = phone.startsWith("226") ? phone : `226${phone}`;
      const label = status===2 ? "Expédiée" : "Livrée";
      const sendWa = window.confirm(
        `📱 Envoyer une notification WhatsApp à ${name} (${phone}) ?

` +
        `Message : commande ${label}.

` +
        `Cliquez OK pour envoyer, Annuler pour ignorer.`
      );
      if (sendWa) {
        window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msgs[status])}`, "_blank");
      }
    }
  };

  const assignDelivery = async (id, userId) => {
    const val = userId ? parseInt(userId) : null;
    setOrders(os => os.map(o => o.id===id?{...o,assignedTo:val}:o));
    try { await sb.patch("orders", id, {assigned_to:val}); } catch(e){console.warn(e.message);}
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Mettre cette commande à la corbeille ?")) return;
    const order = orders.find(o => o.id === id);
    if (!order) return;
    // Déplacer vers la corbeille dans Supabase
    setOrders(os => os.filter(o => o.id !== id));
    setTrash(ts => [...ts, { ...order, deleted_at: new Date().toISOString() }]);
    try {
      await sb.patch("orders", id, { deleted: true, deleted_at: new Date().toISOString() });
    } catch(e) { console.warn(e.message); }
  };

  const restoreOrder = async (id) => {
    const order = trash.find(o => o.id === id);
    if (!order) return;
    setTrash(ts => ts.filter(o => o.id !== id));
    const { deleted_at, deleted, ...restored } = order;
    setOrders(os => [restored, ...os]);
    try {
      await sb.patch("orders", id, { deleted: false, deleted_at: null });
    } catch(e) { console.warn(e.message); }
  };

  const deleteForever = async (id) => {
    if (!window.confirm("⚠️ Supprimer définitivement ? Cette action est irréversible.")) return;
    setTrash(ts => ts.filter(o => o.id !== id));
    try { await sb.del("orders", id); } catch(e){ console.warn(e.message); }
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
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Georgia,serif;padding:40px;color:#1A1A1A;max-width:620px;margin:auto;font-size:16px}
      .header{text-align:center;margin-bottom:28px}
      h1{font-size:28px;letter-spacing:4px;margin:0 0 4px;font-weight:700}
      .sub{font-size:11px;color:#8A7A6A;letter-spacing:5px;margin:0 0 6px}
      .tagline{font-size:13px;color:#8A7A6A}
      hr{border:none;border-top:1.5px solid #E0D8CC;margin:20px 0}
      .section-title{font-size:11px;font-weight:700;color:#8A7A6A;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}
      .row{display:flex;justify-content:space-between;align-items:center;margin:8px 0;font-size:15px;gap:12px}
      .lbl{color:#8A7A6A;flex-shrink:0}
      .val{font-weight:600;text-align:right}
      .items{margin:12px 0}
      .item{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F0EBE0;font-size:15px}
      .total-block{background:#FAF6EE;border-radius:10px;padding:16px 20px;margin-top:16px;display:flex;justify-content:space-between;align-items:center}
      .total-lbl{font-size:14px;color:#8A7A6A}
      .total-val{font-size:26px;font-weight:700;color:#C9A84C}
      .footer{font-size:12px;color:#8A7A6A;text-align:center;margin-top:24px;line-height:1.6}
      .btns{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}
      @media print{
        .btns{display:none}
        body{padding:24px}
      }
    </style></head><body>
    <div class="header">
      <h1>DADA'S DROP</h1>
      <p class="sub">✦ BON DE COMMANDE ✦</p>
      <p class="tagline">Collection Premium · Ouagadougou, Burkina Faso</p>
    </div>
    <hr/>
    <p class="section-title">Référence</p>
    <div class="row"><span class="lbl">N° commande</span><span class="val" style="color:#C9A84C;font-size:18px">#${o.id}</span></div>
    <div class="row"><span class="lbl">Date</span><span class="val">${o.date||new Date().toLocaleDateString("fr-FR")}</span></div>
    <hr/>
    <p class="section-title">Client</p>
    <div class="row"><span class="lbl">Nom</span><span class="val">${o.name||o.customer_name}</span></div>
    <div class="row"><span class="lbl">Téléphone</span><span class="val">${o.phone||o.customer_phone}</span></div>
    <div class="row"><span class="lbl">Adresse</span><span class="val">${o.quartier?o.quartier+", ":""}${o.ville||""}</span></div>
    <div class="row"><span class="lbl">Paiement</span><span class="val">${PAYMENT_LABELS[o.payment]||o.payment||""}</span></div>
    <hr/>
    <p class="section-title">Articles commandés</p>
    <div class="items">
      ${(o.items||[]).map(i=>`<div class="item"><span>${i}</span></div>`).join("")}
    </div>
    <div class="total-block">
      <span class="total-lbl">Total à régler</span>
      <span class="total-val">${(o.total||0).toLocaleString("fr-FR")} FCFA</span>
    </div>
    <div class="footer">
      <p>Merci pour votre commande ✦</p>
      <p>Dada's Drop · Ouagadougou, Burkina Faso</p>
    </div>
    <div class="btns">
      <button onclick="window.print()" style="padding:12px 24px;background:#1A1A1A;color:#C9A84C;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:700">
        🖨️ Imprimer
      </button>
      <button onclick="window.close()" style="padding:12px 20px;background:#fff;color:#1A1A1A;border:1.5px solid #ddd;border-radius:8px;cursor:pointer;font-size:15px">
        ✕ Fermer
      </button>
    </div>
    </body></html>`);
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
      {/* Corbeille + Excel — même ligne, style compact */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <button onClick={() => setShowTrash(v=>!v)}
          style={{ flex:1, padding:"8px 12px", borderRadius:9,
            fontSize:12.5, fontWeight:700,
            border:`1.5px solid ${showTrash?CA.danger:bord}`,
            background:showTrash?`${CA.danger}15`:cardBg,
            color:showTrash?CA.danger:dark?CA.dMute:CA.mute,
            cursor:"pointer", display:"flex", alignItems:"center",
            justifyContent:"center", gap:6 }}>
          🗑 {showTrash?"← Retour":trash.length>0?`Corbeille (${trash.length})`:"Corbeille"}
        </button>
        {!showTrash && (
          <button onClick={exportCSV}
            style={{ flex:1, background:CA.success, color:"#fff",
              border:"none", borderRadius:9, padding:"8px 12px",
              cursor:"pointer", fontSize:12.5, fontWeight:700,
              display:"flex", alignItems:"center",
              justifyContent:"center", gap:6 }}>
            📊 Excel
          </button>
        )}
      </div>
      {/* VUE CORBEILLE */}
      {showTrash && (
        <div>
          {trash.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 16px",
              color:dark?CA.dMute:"#bbb" }}>
              <span style={{ fontSize:40 }}>🗑</span>
              <p style={{ marginTop:10, fontSize:14 }}>La corbeille est vide.</p>
            </div>
          ) : trash.map(o => (
            <div key={o.id} style={{ background:cardBg,
              border:`1px solid ${CA.danger}44`,
              borderRadius:13, padding:"14px 16px", marginBottom:10,
              opacity:.8 }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:6 }}>
                <span style={{ fontFamily:"Georgia,serif", fontWeight:700,
                  color:text }}>#{o.id}</span>
                <span style={{ fontSize:11, color:CA.danger }}>
                  Supprimée le {new Date(o.deletedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div style={{ fontSize:14, fontWeight:600, color:text, marginBottom:4 }}>
                {o.name||o.customer_name||"Client"}
              </div>
              <div style={{ fontSize:12, color:dark?CA.dMute:CA.mute, marginBottom:8 }}>
                {(o.items||[]).join(", ")} · {(o.total||0).toLocaleString("fr-FR")} FCFA
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => restoreOrder(o.id)}
                  style={{ flex:1, background:CA.success, color:"#fff",
                    border:"none", borderRadius:8, padding:"8px",
                    cursor:"pointer", fontSize:13, fontWeight:700,
                    display:"flex", alignItems:"center",
                    justifyContent:"center", gap:5 }}>
                  ↩️ Restaurer
                </button>
                <button onClick={() => deleteForever(o.id)}
                  style={{ flex:1, background:"none", color:CA.danger,
                    border:`1px solid ${CA.danger}`, borderRadius:8,
                    padding:"8px", cursor:"pointer", fontSize:13, fontWeight:700,
                    display:"flex", alignItems:"center",
                    justifyContent:"center", gap:5 }}>
                  🗑 Supprimer définitivement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LISTE NORMALE */}
      {!showTrash && <div style={{ display:"grid", gap:10 }}>
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
              {o.name || o.customer_name || "Client"}
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
                {/* Livreur peut changer statut de SES commandes, admin/manager peuvent tout faire */}
              {(auth.role!=="delivery" || o.assignedTo===auth.id) && (<>
                  {/* Bouton Annuler — seulement admin/manager */}
                  {auth.role!=="delivery" && o.status > 1 && (
                    <button onClick={() => updateStatus(o.id, o.status-1)}
                      title="Revenir au statut précédent"
                      style={{ background:"none", color:CA.mute,
                        border:`1px solid ${bord}`, borderRadius:8,
                        padding:"6px 10px", cursor:"pointer",
                        fontSize:12, fontWeight:600,
                        display:"flex", alignItems:"center", gap:4 }}>
                      <ChevronDown size={12}/> Annuler
                    </button>
                  )}
                  {/* Bouton avancer statut — tout le monde */}
                  {o.status < 3 && (
                    <button onClick={() => updateStatus(o.id, o.status+1)}
                      style={{ background:CA.ink, color:CA.gold,
                        border:`1px solid ${CA.gold}44`, borderRadius:8,
                        padding:"6px 11px", cursor:"pointer",
                        fontSize:12, fontWeight:600,
                        display:"flex", alignItems:"center", gap:4 }}>
                      <ChevronUp size={12}/>
                      {o.status===1?"Expédiée":"Livrée ✓"}
                    </button>
                  )}
                  {/* Supprimer — seulement admin/manager */}
                  {auth.role!=="delivery" && (
                    <button onClick={() => deleteOrder(o.id)}
                      title="Supprimer cette commande"
                      style={{ background:"none", color:CA.danger,
                        border:`1px solid ${bord}`, borderRadius:8,
                        padding:"6px 10px", cursor:"pointer",
                        display:"flex", alignItems:"center", gap:4,
                        fontSize:12 }}>
                      <Trash size={12}/> Supprimer
                    </button>
                  )}
                </>)}
              </div>
            </div>
            {/* Livreur — seulement si pas encore livré */}
            {auth.role!=="delivery" && deliverers.length>0 && o.status < 3 && (
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
            {/* Si livré et livreur assigné, juste afficher le nom */}
            {auth.role!=="delivery" && o.status===3 && o.assignedTo && (
              <div style={{ marginTop:8 }}>
                <ABadge color={CA.success}>
                  ✅ Livré par {users.find(u=>u.id===o.assignedTo)?.name||"livreur"}
                </ABadge>
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
      </div>}
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [productTrash, setProductTrash] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [trashSelectedIds, setTrashSelectedIds] = useState([]);
  const [draggingPid, setDraggingPid] = useState(null);
  const dragPid = useState({ current:null })[0];
  const longPressP = useState({ current:null })[0];

  // Charger la corbeille depuis Supabase (produits avec trashed_at) + purge >60j
  useEffect(() => {
    sb.get("products", `?trashed_at=not.is.null&select=*&_cb=${Date.now()}`)
      .then(async rows => {
        if (!rows?.length) return;
        const now = Date.now();
        const SIXTY = 60*24*60*60*1000;
        const stillValid = [];
        for (const p of rows) {
          const age = now - new Date(p.trashed_at).getTime();
          if (age > SIXTY) {
            // Plus de 60 jours → suppression définitive
            try { await sb.del("products", p.id); } catch {}
          } else {
            stillValid.push({
              ...p,
              isNew:p.is_new??false, isBest:p.is_best??false,
              isPinned:p.is_pinned??false, isHidden:p.is_hidden??false,
              desc:p.description??p.desc??"", imgs:p.imgs||[],
              accent:p.accent||[], variants:p.variants||[],
              rating:p.rating||0, ratingCount:p.rating_count||0, isPreorder:p.is_preorder??false,
            });
          }
        }
        setProductTrash(stillValid);
      })
      .catch(e => console.warn("trash load:", e.message));
  }, []);

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
      name:         localP.name,
      name_en:      localP.name,
      brand:        localP.brand,
      price:        localP.price,
      cat:          localP.cat,
      cat_en:       localP.cat,
      stock:        localP.stock,
      is_new:       !!localP.isNew,
      is_best:      !!localP.isBest,
      is_pinned:    !!localP.isPinned,
      is_hidden:    !!localP.isHidden,
      description:  localP.desc||"",
      description_en: localP.desc||"",
      imgs:         localP.imgs||[],
      accent:       localP.accent||[],
      discount:     localP.discount||0,
      variants:     localP.variants||[],
      rating:       localP.rating||0,
      rating_count: localP.ratingCount||0,
      is_preorder:  !!localP.isPreorder,
    };
    if (editP) {
      setProducts(ps=>ps.map(x=>x.id===editP.id?localP:x));
      try {
        await sb.patch("products",editP.id,sbP);
      } catch(e){
        console.warn("save patch échec:", e.message);
        // Réessayer sans les colonnes optionnelles récentes (si SQL pas à jour)
        const { is_preorder, ...safe } = sbP;
        try { await sb.patch("products",editP.id,safe); }
        catch(e2){ window.alert("⚠️ Erreur d'enregistrement. Vérifiez votre connexion."); }
      }
    } else {
      setProducts(ps=>[...ps,localP]);
      try {
        await sb.post("products",sbP);
      } catch(e){
        console.warn("save post échec:", e.message);
        const { is_preorder, ...safe } = sbP;
        try { await sb.post("products",safe); }
        catch(e2){ window.alert("⚠️ Erreur d'enregistrement. Vérifiez votre connexion."); }
      }
    }
    setSaving(false); setEditP(null); setShowForm(false);
  };

  const moveToTrash = async (id) => {
    if (!window.confirm("Mettre cet article à la corbeille ?")) return;
    const p = products.find(x=>x.id===id);
    if (!p) return;
    const now = new Date().toISOString();
    setProducts(ps=>ps.filter(x=>x.id!==id));
    setProductTrash(ts=>[...ts, {...p, trashed_at:now}]);
    setSelectedIds(ids=>ids.filter(x=>x!==id));
    try { await sb.patch("products", id, { trashed_at: now }); } catch(e){console.warn(e.message);}
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Mettre ${selectedIds.length} article${selectedIds.length>1?"s":""} à la corbeille ?`)) return;
    const now = new Date().toISOString();
    const toTrash = products.filter(p=>selectedIds.includes(p.id));
    const ids = [...selectedIds];
    setProducts(ps=>ps.filter(p=>!selectedIds.includes(p.id)));
    setProductTrash(ts=>[...ts,...toTrash.map(p=>({...p,trashed_at:now}))]);
    setSelectedIds([]);
    for (const id of ids) {
      try { await sb.patch("products", id, { trashed_at: now }); } catch(e){console.warn(e.message);}
    }
  };

  const restoreProduct = async (id) => {
    const p = productTrash.find(x=>x.id===id);
    if (!p) return;
    setProductTrash(ts=>ts.filter(x=>x.id!==id));
    setProducts(ps=>[{...p, trashed_at:null},...ps]);
    try { await sb.patch("products", id, { trashed_at: null }); } catch(e){console.warn(e.message);}
  };

  const deleteForeverProduct = async (id) => {
    if (!window.confirm("⚠️ Supprimer définitivement ? Irréversible.")) return;
    setProductTrash(ts=>ts.filter(x=>x.id!==id));
    try { await sb.del("products",id); } catch(e){console.warn(e.message);}
  };

  const toggleSelect = (id) => {
    setSelectedIds(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);
  };

  const toggleTrashSelect = (id) => {
    setTrashSelectedIds(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);
  };

  const restoreSelected = async () => {
    if (!trashSelectedIds.length) return;
    const toRestore = productTrash.filter(p=>trashSelectedIds.includes(p.id));
    const ids = [...trashSelectedIds];
    setProductTrash(ts=>ts.filter(p=>!trashSelectedIds.includes(p.id)));
    setProducts(ps=>[...toRestore.map(p=>({...p,trashed_at:null})), ...ps]);
    setTrashSelectedIds([]);
    for (const id of ids) {
      try { await sb.patch("products", id, { trashed_at: null }); } catch(e){console.warn(e.message);}
    }
  };

  const deleteSelectedForever = async () => {
    if (!trashSelectedIds.length) return;
    if (!window.confirm(`Supprimer définitivement ${trashSelectedIds.length} article${trashSelectedIds.length>1?"s":""} ? Irréversible.`)) return;
    const ids = [...trashSelectedIds];
    setProductTrash(ts=>ts.filter(p=>!ids.includes(p.id)));
    setTrashSelectedIds([]);
    for (const id of ids) {
      try { await sb.del("products", id); } catch(e){console.warn(e.message);}
    }
  };

  const toggleProp = async (id, prop) => {
    setProducts(ps=>ps.map(p=>p.id===id?{...p,[prop]:!p[prop]}:p));
    const p = products.find(x=>x.id===id);
    // Convertir camelCase → snake_case pour Supabase
    const sbProp = { isPinned:"is_pinned", isHidden:"is_hidden",
      isNew:"is_new", isBest:"is_best" }[prop] || prop;
    try { await sb.patch("products",id,{[sbProp]:!p[prop]}); } catch(e){console.warn(e.message);}
  };

  // Réordonner les produits (drag & drop appui long)
  // Réordonnancement visuel uniquement (pas de Supabase pendant le drag)
  const reorderProducts = (fromId, toId) => {
    if (fromId === toId) return;
    setProducts(ps => {
      const arr = [...ps];
      const fromIdx = arr.findIndex(p=>p.id===fromId);
      const toIdx = arr.findIndex(p=>p.id===toId);
      if (fromIdx<0||toIdx<0) return arr;
      const [moved] = arr.splice(fromIdx,1);
      arr.splice(toIdx,0,moved);
      return arr;
    });
  };
  const pTouchStart = (e, id) => {
    longPressP.current = setTimeout(() => {
      dragPid.current = id;
      setDraggingPid(id);
      // léger retour haptique si dispo
      if (navigator.vibrate) navigator.vibrate(30);
    }, 350);
  };
  const pTouchMove = (e) => {
    // Si on n'a pas encore activé le drag, annuler le timer (c'est un scroll)
    if (!dragPid.current) {
      if (longPressP.current) { clearTimeout(longPressP.current); longPressP.current=null; }
      return;
    }
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const card = el?.closest("[data-pid]");
    if (card) {
      const overId = parseInt(card.getAttribute("data-pid"));
      if (overId && overId !== dragPid.current) {
        reorderProducts(dragPid.current, overId);
      }
    }
    e.preventDefault();
  };
  const pTouchEnd = () => {
    if (longPressP.current) { clearTimeout(longPressP.current); longPressP.current=null; }
    if (dragPid.current) {
      // Persister le nouvel ordre une seule fois, à la fin
      setProducts(ps => {
        ps.forEach((p,i) => { sb.patch("products", p.id, { sort_order:i }).catch(()=>{}); });
        return ps;
      });
    }
    dragPid.current = null;
    setDraggingPid(null);
  };

  const variantType = form.variants[0]?.type || newVariant.type;

  return (
    <div style={{ width:"100%", maxWidth:"100%", boxSizing:"border-box", overflowX:"hidden" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:10, flexWrap:"wrap", gap:8 }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:16, color:text }}>
          {showTrash
            ? `🗑 Corbeille — ${productTrash.length} article${productTrash.length>1?"s":""}`
            : <>{products.length} articles
              {products.filter(p=>p.isPinned).length>0 &&
                <span style={{ fontSize:12, color:CA.gold, marginLeft:8 }}>
                  📌 {products.filter(p=>p.isPinned).length}
                </span>}</>}
        </span>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {/* Bouton bascule corbeille */}
          <button onClick={() => { setShowTrash(v=>!v); setSelectedIds([]); setTrashSelectedIds([]); }}
            style={{ background:showTrash?`${CA.danger}15`:"none",
              color:showTrash?CA.danger:dark?CA.dMute:CA.mute,
              border:`1px solid ${showTrash?CA.danger:dark?CA.dBorder:CA.border}`,
              borderRadius:9, padding:"8px 10px", cursor:"pointer",
              fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
            {showTrash ? "← Retour" : `🗑 Corbeille${productTrash.length>0?` (${productTrash.length})`:""}`}
          </button>
          {!showTrash && selectedIds.length > 0 && (
            <button onClick={deleteSelected}
              style={{ background:CA.danger, color:"#fff", border:"none",
                borderRadius:9, padding:"8px 12px", cursor:"pointer",
                fontSize:12.5, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
              <Trash size={13}/> Corbeille ({selectedIds.length})
            </button>
          )}
          {!showTrash && selectedIds.length === 0 && products.length > 0 && (
            <button onClick={() => setSelectedIds(products.map(p=>p.id))}
              style={{ background:"none", color:dark?CA.dMute:CA.mute,
                border:`1px solid ${dark?CA.dBorder:CA.border}`,
                borderRadius:9, padding:"8px 10px", cursor:"pointer",
                fontSize:12, fontWeight:600 }}>
              ☐ Tout
            </button>
          )}
          {!showTrash && selectedIds.length > 0 && (
            <button onClick={() => setSelectedIds([])}
              style={{ background:"none", color:dark?CA.dMute:CA.mute,
                border:`1px solid ${dark?CA.dBorder:CA.border}`,
                borderRadius:9, padding:"8px 10px", cursor:"pointer",
                fontSize:12, fontWeight:600 }}>
              ✕
            </button>
          )}
          {!showTrash && (
            <button onClick={startNew}
              style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`,
                borderRadius:10, padding:"9px 14px", cursor:"pointer",
                fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
              <PlusCircle size={14}/> Ajouter
            </button>
          )}
        </div>
      </div>

      {/* VUE CORBEILLE DÉDIÉE */}
      {showTrash && (
        <div>
          {productTrash.length === 0 ? (
            <div style={{ textAlign:"center", padding:"50px 16px", color:dark?CA.dMute:"#bbb" }}>
              <span style={{ fontSize:42 }}>🗑</span>
              <p style={{ marginTop:10, fontSize:14 }}>La corbeille est vide.</p>
            </div>
          ) : (<>
            {/* Actions corbeille */}
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
              {trashSelectedIds.length > 0 ? (<>
                <button onClick={restoreSelected}
                  style={{ background:CA.success, color:"#fff", border:"none",
                    borderRadius:9, padding:"8px 12px", cursor:"pointer",
                    fontSize:12.5, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
                  ↩ Restaurer ({trashSelectedIds.length})
                </button>
                <button onClick={deleteSelectedForever}
                  style={{ background:"none", color:CA.danger, border:`1px solid ${CA.danger}`,
                    borderRadius:9, padding:"8px 12px", cursor:"pointer",
                    fontSize:12.5, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
                  <Trash size={12}/> Supprimer ({trashSelectedIds.length})
                </button>
                <button onClick={() => setTrashSelectedIds([])}
                  style={{ background:"none", color:dark?CA.dMute:CA.mute,
                    border:`1px solid ${dark?CA.dBorder:CA.border}`,
                    borderRadius:9, padding:"8px 10px", cursor:"pointer",
                    fontSize:12, fontWeight:600 }}>✕</button>
              </>) : (
                <button onClick={() => setTrashSelectedIds(productTrash.map(p=>p.id))}
                  style={{ background:"none", color:dark?CA.dMute:CA.mute,
                    border:`1px solid ${dark?CA.dBorder:CA.border}`,
                    borderRadius:9, padding:"8px 10px", cursor:"pointer",
                    fontSize:12, fontWeight:600 }}>
                  ☐ Tout sélectionner
                </button>
              )}
            </div>
            {/* Liste corbeille */}
            <div style={{ display:"grid", gap:8 }}>
              {productTrash.map(p => {
                const isSel = trashSelectedIds.includes(p.id);
                return (
                  <div key={p.id} style={{ background:isSel?`${CA.gold}10`:cardBg,
                    border:`1px solid ${isSel?CA.gold:bord}`, borderRadius:11,
                    padding:"10px 12px", display:"flex", alignItems:"center", gap:10,
                    boxSizing:"border-box", width:"100%" }}>
                    <button onClick={() => toggleTrashSelect(p.id)}
                      style={{ width:22, height:22, borderRadius:6, flexShrink:0,
                        border:`2px solid ${isSel?CA.gold:bord}`,
                        background:isSel?CA.gold:"transparent", cursor:"pointer",
                        display:"grid", placeItems:"center", color:"#fff", fontSize:12 }}>
                      {isSel ? "✓" : ""}
                    </button>
                    <div style={{ width:42, height:42, borderRadius:7, overflow:"hidden",
                      flexShrink:0, background:C.creamD }}>
                      {p.imgs?.[0] ? <img src={p.imgs[0]} alt={p.name}
                        style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                        : <div style={{ width:"100%",height:"100%",display:"grid",placeItems:"center" }}>👜</div>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, color:text, fontWeight:600,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize:11.5, color:dark?CA.dMute:CA.mute }}>
                        {(p.price||0).toLocaleString("fr-FR")} FCFA
                      </div>
                    </div>
                    <button onClick={() => { setProductTrash(ts=>ts.filter(x=>x.id!==p.id)); setProducts(ps=>[p,...ps]); }}
                      style={{ fontSize:11.5, color:CA.success, background:"none",
                        border:`1px solid ${CA.success}44`, borderRadius:7,
                        padding:"5px 9px", cursor:"pointer", fontWeight:700,
                        whiteSpace:"nowrap", flexShrink:0 }}>
                      ↩
                    </button>
                    <button onClick={() => deleteForeverProduct(p.id)}
                      style={{ width:28, height:28, borderRadius:7, border:`1px solid ${bord}`,
                        background:"none", cursor:"pointer", display:"grid",
                        placeItems:"center", color:CA.danger, flexShrink:0 }}>
                      <Trash size={12}/>
                    </button>
                  </div>
                );
              })}
            </div>
          </>)}
        </div>
      )}

      {/* Formulaire */}
      {!showTrash && showForm && (
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
                value={form.discount===0||form.discount==="0"||!form.discount?"":form.discount}
                onChange={setF("discount")} placeholder="0 = pas de promo"/>
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
              { k:"isBest",   label:"✦ Badge TOP" },
              { k:"isPinned", label:"📌 Épingler" },
              { k:"isHidden", label:"🙈 Masquer" },
              { k:"isPreorder", label:"🕒 Précommande" },
            ].map(({ k, label }) => (
              <label key={k} style={{ display:"flex", alignItems:"center",
                gap:6, cursor:"pointer", fontSize:13, color:text }}>
                <input type="checkbox" checked={!!form[k]} onChange={setF(k)}/> {label}
              </label>
            ))}
          </div>
          <p style={{ fontSize:11, color:dark?CA.dMute:CA.mute, marginTop:-6, marginBottom:14, lineHeight:1.5 }}>
            ✦ <b>Badge TOP</b> = badge "coup de cœur" affiché au client (ton choix marketing). À ne pas confondre avec le best-seller automatique du Bilan qui se calcule sur les vraies ventes.
          </p>

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
      {!showTrash && (
      <div style={{ display:"grid", gap:8, width:"100%", boxSizing:"border-box" }}>
        {products.map((p,idx) => {
          const isSelected = selectedIds.includes(p.id);
          return (
          <div key={p.id}
            data-pid={p.id}
            draggable
            onDragStart={e => { dragPid.current=p.id; e.dataTransfer.effectAllowed="move"; }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if(dragPid.current) reorderProducts(dragPid.current,p.id); dragPid.current=null; }}
            onTouchStart={e => pTouchStart(e,p.id)}
            onTouchMove={pTouchMove}
            onTouchEnd={pTouchEnd}
            style={{ background: isSelected?`${CA.gold}10`:cardBg,
            border:`1px solid ${isSelected?CA.gold:p.isPinned?CA.gold+"88":bord}`,
            borderRadius:12, padding:"12px 13px",
            display:"flex", gap:10, alignItems:"center",
            boxSizing:"border-box", width:"100%", overflow:"hidden",
            opacity:p.isHidden?.5:1,
            transform:draggingPid===p.id?"scale(1.02)":"scale(1)",
            boxShadow:draggingPid===p.id?"0 6px 18px rgba(0,0,0,.18)":undefined,
            transition:"transform .15s", userSelect:"none", WebkitUserSelect:"none", WebkitTouchCallout:"none" }}>
            {/* Checkbox sélection */}
            <button onClick={() => toggleSelect(p.id)}
              style={{ width:22, height:22, borderRadius:6, flexShrink:0,
                border:`2px solid ${isSelected?CA.gold:bord}`,
                background:isSelected?CA.gold:"transparent",
                cursor:"pointer", display:"grid", placeItems:"center",
                color:"#fff", fontSize:12 }}>
              {isSelected ? "✓" : ""}
            </button>
            {/* Poignée de déplacement */}
            <div style={{ flexShrink:0, color:dark?CA.dMute:CA.mute,
              cursor:"grab", display:"grid", placeItems:"center",
              fontSize:16, lineHeight:1, userSelect:"none" }}
              title="Maintiens puis glisse pour réordonner">
              ⠿
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
                <ABadge color={dark?"#888":"#999"}>
                  👁 {p.views||0} vue{(p.views||0)>1?"s":""}
                </ABadge>
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
              <button onClick={() => moveToTrash(p.id)}
                title="Mettre à la corbeille"
                style={{ width:32,height:32,borderRadius:8,border:`1px solid ${bord}`,
                  background:"none",cursor:"pointer",
                  display:"grid",placeItems:"center",color:CA.danger }}>
                <Trash size={13}/>
              </button>
            </div>
          </div>
          );
        })}
      </div>
      )}
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
  const [translating, setTranslating] = useState(false);
  const [catTrash, setCatTrash] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [draggingCat, setDraggingCat] = useState(null);
  const dragCat = useState({ current:null })[0];
  const longPressC = useState({ current:null })[0];

  // Charger la corbeille catégories depuis Supabase + purge >60j
  useEffect(() => {
    sb.get("announcements", `?id=eq.categories_trash&select=data&_cb=${Date.now()}`)
      .then(rows => {
        const data = rows?.[0]?.data;
        if (!Array.isArray(data)) return;
        const now = Date.now();
        const SIXTY = 60*24*60*60*1000;
        const valid = data.filter(c => {
          if (!c.trashedAt) return true;
          return (now - new Date(c.trashedAt).getTime()) < SIXTY;
        });
        setCatTrash(valid);
        // Si purge effectuée, resauvegarder
        if (valid.length !== data.length) {
          fetch(`${SB_URL}/rest/v1/announcements?id=eq.categories_trash`, {
            method:"PATCH", headers:sbHeaders, body:JSON.stringify({ data:valid })
          }).catch(()=>{});
        }
      })
      .catch(e => console.warn("catTrash load:", e.message));
  }, []);

  // Dictionnaire de secours pour les mots de mode courants (si le service en ligne échoue)
  const FASHION_DICT = {
    "sacs":"Bags", "sac":"Bag", "sacs à main":"Handbags", "sac à main":"Handbag",
    "pochettes":"Clutches", "pochette":"Clutch", "bandoulières":"Shoulder bags",
    "bandoulière":"Shoulder bag", "ceintures":"Belts", "ceinture":"Belt",
    "chaussures":"Shoes", "chaussure":"Shoe", "talons":"Heels", "baskets":"Sneakers",
    "bijoux":"Jewellery", "bijou":"Jewellery", "colliers":"Necklaces", "collier":"Necklace",
    "bracelets":"Bracelets", "bracelet":"Bracelet", "bagues":"Rings", "bague":"Ring",
    "boucles d'oreilles":"Earrings", "montres":"Watches", "montre":"Watch",
    "lunettes":"Glasses", "lunettes de soleil":"Sunglasses",
    "parfums":"Perfumes", "parfum":"Perfume", "gloss":"Gloss", "rouge à lèvres":"Lipstick",
    "maquillage":"Makeup", "cosmétiques":"Cosmetics", "vêtements":"Clothing",
    "vêtement":"Clothing", "robes":"Dresses", "robe":"Dress", "hauts":"Tops",
    "pantalons":"Trousers", "jupes":"Skirts", "vestes":"Jackets", "manteaux":"Coats",
    "écharpes":"Scarves", "écharpe":"Scarf", "foulards":"Scarves", "chapeaux":"Hats",
    "chapeau":"Hat", "casquettes":"Caps", "gants":"Gloves", "portefeuilles":"Wallets",
    "portefeuille":"Wallet", "porte-monnaie":"Coin purses", "valises":"Suitcases",
    "accessoires":"Accessories", "accessoire":"Accessory", "nouveautés":"New arrivals",
    "promotions":"Sale", "soldes":"Sale", "homme":"Men", "femme":"Women",
    "enfant":"Kids", "enfants":"Kids", "unisexe":"Unisex",
  };

  // Traduction en direct avec debounce 800ms + dictionnaire de secours
  useEffect(() => {
    if (!form.label.trim()) { setForm(f=>({...f,labelEn:""})); return; }
    setTranslating(true);
    const timer = setTimeout(async () => {
      const key = form.label.trim().toLowerCase();
      // 1. Vérifier le dictionnaire de secours d'abord (instantané et fiable)
      if (FASHION_DICT[key]) {
        setForm(f => ({...f, labelEn: FASHION_DICT[key]}));
        setTranslating(false);
        return;
      }
      // 2. Sinon, traduction en ligne
      try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(form.label.trim())}&langpair=fr|en`);
        const data = await res.json();
        const translated = data?.responseData?.translatedText;
        if (translated && translated.toLowerCase() !== form.label.toLowerCase()) {
          // Nettoyer : capitaliser la première lettre
          const clean = translated.charAt(0).toUpperCase() + translated.slice(1);
          setForm(f => ({...f, labelEn: clean}));
        } else {
          // 3. Dernier recours : garder le mot français capitalisé
          setForm(f => ({...f, labelEn: form.label.trim().charAt(0).toUpperCase() + form.label.trim().slice(1)}));
        }
      } catch(e) {
        console.warn("Traduction:", e.message);
        // Si échec total, utiliser le mot français capitalisé
        setForm(f => ({...f, labelEn: form.label.trim().charAt(0).toUpperCase() + form.label.trim().slice(1)}));
      }
      setTranslating(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [form.label]);

  const add = async () => {
    if (!form.label.trim()) return;
    const newId = form.label.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    const exists = cats.some(c =>
      c.id === newId ||
      (c.label||"").toLowerCase().trim() === form.label.toLowerCase().trim()
    );
    if (exists) {
      window.alert(`⚠️ La catégorie "${form.label.trim()}" existe déjà.`);
      return;
    }
    const newCat = { id: newId,
      label:form.label.trim(), labelEn:form.labelEn||form.label.trim(), soon:form.soon };
    const updated = [...cats, newCat];
    setCats(updated);
    setForm({ label:"", labelEn:"", soon:false });
    await saveCats(updated);
  };

  // Helper : sauvegarder les catégories de façon fiable (PATCH forcé)
  const saveCats = async (data) => {
    try {
      // Essayer PATCH d'abord (plus fiable que upsert pour ligne existante)
      const r = await fetch(`${SB_URL}/rest/v1/announcements?id=eq.categories`, {
        method:"PATCH",
        headers:{ ...sbHeaders, Prefer:"return=representation" },
        body: JSON.stringify({ data })
      });
      if (!r.ok) throw new Error(r.status);
      const rows = await r.json();
      // Si PATCH n'a rien modifié (ligne n'existe pas), faire POST
      if (!rows?.length) {
        await sb.post("announcements", { id:"categories", data });
      }
    } catch(e) {
      // Fallback sur upsert
      try { await sb.upsert("announcements", { id:"categories", data }); }
      catch(e2) { console.warn("saveCats:", e2.message); }
    }
  };

  const toggleSoon = async (id) => {
    const updated = cats.map(c=>c.id===id?{...c,soon:!c.soon}:c);
    setCats(updated);
    await saveCats(updated);
  };

  // Sauvegarder la corbeille catégories dans Supabase
  const saveCatTrash = async (data) => {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/announcements?id=eq.categories_trash`, {
        method:"PATCH", headers:{ ...sbHeaders, Prefer:"return=representation" },
        body: JSON.stringify({ data })
      });
      if (!r.ok) throw new Error(r.status);
      const rows = await r.json();
      if (!rows?.length) await sb.post("announcements", { id:"categories_trash", data });
    } catch(e) {
      try { await sb.upsert("announcements", { id:"categories_trash", data }); }
      catch(e2){ console.warn("saveCatTrash:", e2.message); }
    }
  };

  const del = async (id) => {
    if (!window.confirm("Mettre cette catégorie à la corbeille ?")) return;
    const cat = cats.find(c=>c.id===id);
    if (!cat) return;
    const updated = cats.filter(c=>c.id!==id);
    const newTrash = [...catTrash, { ...cat, trashedAt: new Date().toISOString() }];
    setCats(updated);
    setCatTrash(newTrash);
    await saveCats(updated);
    await saveCatTrash(newTrash);
  };

  const restoreCat = async (id) => {
    const cat = catTrash.find(c=>c.id===id);
    if (!cat) return;
    const newTrash = catTrash.filter(c=>c.id!==id);
    const { trashedAt, ...clean } = cat;
    const updated = [...cats, clean];
    setCatTrash(newTrash);
    setCats(updated);
    await saveCats(updated);
    await saveCatTrash(newTrash);
  };

  const deleteForeverCat = async (id) => {
    if (!window.confirm("Supprimer définitivement cette catégorie ?")) return;
    const newTrash = catTrash.filter(c=>c.id!==id);
    setCatTrash(newTrash);
    await saveCatTrash(newTrash);
  };

  // Réordonnancement visuel des catégories (sans Supabase pendant le drag)
  const reorderCats = (fromId, toId) => {
    if (fromId === toId) return;
    setCats(cs => {
      const arr = [...cs];
      const fromIdx = arr.findIndex(c=>c.id===fromId);
      const toIdx = arr.findIndex(c=>c.id===toId);
      if (fromIdx<0||toIdx<0) return arr;
      const [moved] = arr.splice(fromIdx,1);
      arr.splice(toIdx,0,moved);
      return arr;
    });
  };
  const cTouchStart = (e, id) => {
    longPressC.current = setTimeout(() => {
      dragCat.current = id;
      setDraggingCat(id);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 350);
  };
  const cTouchMove = (e) => {
    if (!dragCat.current) {
      if (longPressC.current) { clearTimeout(longPressC.current); longPressC.current=null; }
      return;
    }
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const card = el?.closest("[data-cid]");
    if (card) {
      const overId = card.getAttribute("data-cid");
      if (overId && overId !== dragCat.current) reorderCats(dragCat.current, overId);
    }
    e.preventDefault();
  };
  const cTouchEnd = () => {
    if (longPressC.current) { clearTimeout(longPressC.current); longPressC.current=null; }
    if (dragCat.current) {
      setCats(cs => { saveCats(cs); return cs; });
    }
    dragCat.current = null;
    setDraggingCat(null);
  };

  const inp = { width:"100%", padding:"9px 11px", borderRadius:9,
    border:`1.5px solid ${bord}`, background:dark?CA.dCard:"#fff",
    fontSize:"16px", color:text, fontFamily:"inherit" };

  return (
    <div>
      {/* Header fixe avec bouton corbeille — toujours visible */}
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:14, gap:8 }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:16, color:text }}>
          {showTrash
            ? `🗑 Corbeille — ${catTrash.length} catégorie${catTrash.length>1?"s":""}`
            : `${cats.length} catégorie${cats.length>1?"s":""}`}
        </span>
        <button onClick={() => setShowTrash(v=>!v)}
          style={{ background:showTrash?`${CA.danger}15`:"none",
            color:showTrash?CA.danger:dark?CA.dMute:CA.mute,
            border:`1px solid ${showTrash?CA.danger:dark?CA.dBorder:CA.border}`,
            borderRadius:9, padding:"8px 12px", cursor:"pointer",
            fontSize:12.5, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
          {showTrash
            ? "← Retour aux catégories"
            : `🗑 Corbeille${catTrash.length>0?` (${catTrash.length})`:""}`}
        </button>
      </div>

      {/* VUE CORBEILLE */}
      {showTrash && (
        <div>
          {catTrash.length === 0 ? (
            <div style={{ textAlign:"center", padding:"50px 16px",
              color:dark?CA.dMute:"#bbb" }}>
              <span style={{ fontSize:42 }}>🗑</span>
              <p style={{ marginTop:10, fontSize:14 }}>La corbeille est vide.</p>
            </div>
          ) : (
            <div style={{ display:"grid", gap:8 }}>
              {catTrash.map(c => (
                <div key={c.id} style={{ background:cardBg,
                  border:`1px solid ${CA.danger}33`,
                  borderRadius:11, padding:"12px 14px",
                  display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:text }}>{c.label}</div>
                    {c.labelEn && (
                      <div style={{ fontSize:12, color:dark?CA.dMute:CA.mute }}>{c.labelEn}</div>
                    )}
                  </div>
                  <button onClick={() => restoreCat(c.id)}
                    style={{ fontSize:12, color:CA.success, background:"none",
                      border:`1px solid ${CA.success}44`, borderRadius:7,
                      padding:"6px 11px", cursor:"pointer", fontWeight:700,
                      whiteSpace:"nowrap" }}>
                    ↩ Restaurer
                  </button>
                  <button onClick={() => deleteForeverCat(c.id)}
                    style={{ width:30, height:30, borderRadius:7,
                      border:`1px solid ${dark?CA.dBorder:CA.border}`,
                      background:"none", cursor:"pointer", display:"grid",
                      placeItems:"center", color:CA.danger, flexShrink:0 }}>
                    <Trash size={12}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VUE NORMALE */}
      {!showTrash && (<>
        {/* Formulaire ajout */}
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
              <div style={{ position:"relative" }}>
                <input style={{ ...inp, opacity:translating?.7:1,
                  paddingRight:translating?"36px":undefined }}
                  value={form.labelEn}
                  onChange={e=>setForm(f=>({...f,labelEn:e.target.value}))}
                  placeholder={translating?"Traduction en cours…":"Traduit automatiquement"}/>
                {translating && (
                  <span style={{ position:"absolute", right:10, top:"50%",
                    transform:"translateY(-50%)", fontSize:14 }}>⏳</span>
                )}
              </div>
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
            <div key={c.id}
              data-cid={c.id}
              draggable
              onDragStart={e => { dragCat.current=c.id; e.dataTransfer.effectAllowed="move"; }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if(dragCat.current){reorderCats(dragCat.current,c.id); setCats(cs=>{saveCats(cs);return cs;});} dragCat.current=null; }}
              onTouchStart={e => cTouchStart(e,c.id)}
              onTouchMove={cTouchMove}
              onTouchEnd={cTouchEnd}
              style={{ background:cardBg, border:`1px solid ${bord}`,
              borderRadius:11, padding:"12px 14px",
              display:"flex", alignItems:"center", gap:10,
              transform:draggingCat===c.id?"scale(1.02)":"scale(1)",
              boxShadow:draggingCat===c.id?"0 6px 18px rgba(0,0,0,.18)":undefined,
              transition:"transform .15s", userSelect:"none", WebkitUserSelect:"none", WebkitTouchCallout:"none" }}>
              <div style={{ flexShrink:0, color:dark?CA.dMute:CA.mute,
                cursor:"grab", fontSize:16, lineHeight:1, userSelect:"none" }}
                title="Maintiens puis glisse pour réordonner">
                ⠿
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
        <p style={{ fontSize:11, color:dark?CA.dMute:CA.mute, marginTop:10, textAlign:"center" }}>
          ✦ Maintiens une catégorie appuyée puis glisse pour réordonner
        </p>
      </>)}
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET ÉQUIPE
────────────────────────────────────────── */
function AdminTeamTab({ users, setUsers, auth, dark }) {
  const text   = dark ? CA.dText : CA.ink;
  const bord   = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", role:"delivery", pwd:"" });
  const [profileUser, setProfileUser] = useState(null); // membre dont on voit la fiche
  const [profileEdit, setProfileEdit] = useState({ email:"", pwd:"", msg:"" });
  const [draggingId, setDraggingId] = useState(null);
  const dragId = useState({ current:null })[0];
  const longPress = useState({ current:null })[0];
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9,
    border:`1.5px solid ${bord}`, background:dark?CA.dCard:"#fff",
    fontSize:"16px", color:text, fontFamily:"inherit" };

  // Drag tactile sur appui long (300ms)
  const handleTouchStart = (e, id) => {
    if (!(auth.id===1 || auth.role==="admin")) return;
    if (id === 1) return; // David (Fondateur) non déplaçable
    longPress.current = setTimeout(() => {
      dragId.current = id;
      setDraggingId(id);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 350);
  };
  const handleTouchMove = (e) => {
    if (!dragId.current) {
      if (longPress.current) { clearTimeout(longPress.current); longPress.current = null; }
      return;
    }
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const card = el?.closest("[data-uid]");
    if (card) {
      const overId = parseInt(card.getAttribute("data-uid"));
      // Ne jamais déplacer au-dessus/à la place de David (id:1)
      if (overId && overId !== 1 && overId !== dragId.current) {
        moveUserVisual(dragId.current, overId);
      }
    }
    e.preventDefault();
  };
  const handleTouchEnd = () => {
    if (longPress.current) { clearTimeout(longPress.current); longPress.current = null; }
    if (dragId.current) {
      setUsers(us => {
        us.forEach((u,i) => { sb.patch("team_users", u.id, { sort_order:i }).catch(()=>{}); });
        return us;
      });
    }
    dragId.current = null;
    setDraggingId(null);
  };

  // Réordonnancement visuel équipe (sans Supabase pendant le drag)
  const moveUserVisual = (fromId, toId) => {
    if (fromId === toId || fromId === 1) return;
    setUsers(us => {
      const arr = [...us];
      const fromIdx = arr.findIndex(u=>u.id===fromId);
      const toIdx = arr.findIndex(u=>u.id===toId);
      if (fromIdx<0||toIdx<0||toIdx===0) return arr; // position 0 = David, protégée
      const [moved] = arr.splice(fromIdx,1);
      arr.splice(toIdx,0,moved);
      return arr;
    });
  };

  const add = async () => {
    if (!form.name||!form.email||!form.pwd) return;
    const u = { id:Date.now(), ...form, active:true };
    setUsers(us=>[...us,u]);
    setForm({ name:"", email:"", role:"delivery", pwd:"" }); setShowForm(false);
    try { await sb.post("team_users",u); } catch(e){console.warn(e.message);}
  };

  // Ouvrir la fiche profil d'un membre
  const openProfile = (u) => {
    setProfileUser(u);
    setProfileEdit({ email:u.email, pwd:"", msg:"" });
  };
  // Sauvegarder email + mot de passe (réservé à ceux qui peuvent gérer ce membre)
  const saveProfile = async () => {
    if (!profileUser) return;
    const newEmail = profileEdit.email.trim().toLowerCase();
    if (!newEmail.includes("@")) { setProfileEdit(p=>({...p,msg:"⚠️ Email invalide."})); return; }
    // Email déjà utilisé par un autre membre ?
    if (users.some(u => u.id!==profileUser.id && u.email.toLowerCase()===newEmail)) {
      setProfileEdit(p=>({...p,msg:"⚠️ Cet email est déjà utilisé."})); return;
    }
    const patch = { email:newEmail };
    if (profileEdit.pwd.trim()) {
      if (profileEdit.pwd.trim().length < 6) { setProfileEdit(p=>({...p,msg:"⚠️ Mot de passe trop court (min 6)."})); return; }
      patch.pwd = profileEdit.pwd.trim();
    }
    setUsers(us => us.map(u => u.id===profileUser.id ? {...u, ...patch} : u));
    try { await sb.patch("team_users", profileUser.id, patch); }
    catch(e){ console.warn("saveProfile:", e.message); }
    setProfileEdit(p=>({...p, pwd:"", msg:"✅ Enregistré !"}));
    setTimeout(()=>setProfileEdit(p=>({...p,msg:""})), 2500);
  };
  // ─── Règles de permission ───
  // David (id:1) = Fondateur, intouchable par TOUS, et a pouvoir sur tous.
  // Sinon : on ne peut agir que sur quelqu'un qu'on a soi-même promu (promoted_by===auth.id),
  // ou si la cible n'est pas admin. On ne peut jamais toucher celui qui nous a promu.
  const canManage = (target) => {
    if (target.id === 1) return false;          // David intouchable
    if (auth.id === 1) return true;             // David peut tout
    if (target.id === auth.id) return false;    // pas soi-même
    if (target.promoted_by === auth.id) return true;  // j'ai promu cette personne
    if (target.role === "admin") return false;  // sinon pas les autres admins
    return true;
  };

  const toggle = async id => {
    if (id === 1) {
      window.alert("⛔ Le Fondateur ne peut pas être désactivé.");
      return;
    }
    if (id === auth.id) {
      window.alert("⛔ Vous ne pouvez pas désactiver votre propre compte.");
      return;
    }
    const u = users.find(x=>x.id===id);
    if (!u) return;
    if (!canManage(u)) {
      window.alert("⛔ Vous n'avez pas les droits sur ce membre.");
      return;
    }
    if (u.active) {
      if (!window.confirm(`Désactiver ${u.name} ? Il ne pourra plus se connecter.`)) return;
    } else {
      if (!window.confirm(`Réactiver ${u.name} ?`)) return;
    }
    setUsers(us=>us.map(x=>x.id===id?{...x,active:!x.active}:x));
    try { await sb.patch("team_users",id,{active:!u.active}); } catch(e){console.warn(e.message);}
  };

  const changeRole = async (id, role) => {
    if (id === 1) {
      window.alert("⛔ Le rôle du Fondateur ne peut pas être modifié.");
      return;
    }
    const u = users.find(x=>x.id===id);
    if (!u) return;
    if (!canManage(u)) {
      window.alert("⛔ Vous ne pouvez modifier que les membres que vous avez vous-même promus.");
      return;
    }
    if (role==="admin" && !window.confirm(`⚠️ Donner les droits Admin à ce membre ?
Il aura accès à tout le tableau de bord. Vous pourrez le rétrograder car c'est vous qui le promouvez.`)) return;
    // On enregistre qui a promu ce membre (pour la hiérarchie)
    const patch = { role };
    if (role === "admin") patch.promoted_by = auth.id;
    setUsers(us=>us.map(u=>u.id===id?{...u,...patch}:u));
    try { await sb.patch("team_users",id,patch); } catch(e){console.warn(e.message);}
  };

  const del = async id => {
    if (id === 1) {
      window.alert("⛔ Le Fondateur ne peut pas être supprimé.");
      return;
    }
    const u = users.find(x=>x.id===id);
    if (!u) return;
    if (!canManage(u)) {
      window.alert("⛔ Vous n'avez pas les droits sur ce membre.");
      return;
    }
    if (!window.confirm("Supprimer ce membre ?")) return;
    setUsers(us=>us.filter(u=>u.id!==id));
    try { await sb.del("team_users",id); } catch(e){console.warn(e.message);}
  };

  // Réordonner l'équipe par drag & drop (appui long)
  const moveUser = async (fromId, toId) => {
    if (fromId === toId || fromId === 1 || toId === 1) return;
    const arr = [...users];
    const fromIdx = arr.findIndex(u=>u.id===fromId);
    const toIdx = arr.findIndex(u=>u.id===toId);
    if (fromIdx<0 || toIdx<0 || toIdx===0) return;
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    setUsers(arr);
    try {
      await Promise.all(arr.map((u,i) => sb.patch("team_users", u.id, { sort_order: i })));
    } catch(e){ console.warn("ordre équipe:", e.message); }
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
          <label style={{ display:"block", marginBottom:12 }}>
            <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
              display:"block", marginBottom:3 }}>Mot de passe *</span>
            <input style={inp} type="password" value={form.pwd}
              onChange={e=>setForm(f=>({...f,pwd:e.target.value}))}
              placeholder="Ex: Prenom@dadasdrop"/>
            <span style={{ fontSize:10, color:dark?CA.dMute:CA.mute, marginTop:3, display:"block" }}>
              Format recommandé : Prenom@dadasdrop
            </span>
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
      <div style={{ display:"grid", gap:8, width:"100%", boxSizing:"border-box" }}>
        {users.map(u => {
          const isFounder = u.id === 1;
          const manageable = canManage(u);
          return (
          <div key={u.id}
            data-uid={u.id}
            draggable={(auth.id===1 || auth.role==="admin") && u.id!==1}
            onDragStart={e => { dragId.current = u.id; e.dataTransfer.effectAllowed="move"; }}
            onDragOver={e => { e.preventDefault(); }}
            onDrop={e => { e.preventDefault(); if(dragId.current) moveUser(dragId.current, u.id); dragId.current=null; }}
            onTouchStart={e => handleTouchStart(e, u.id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ background:cardBg,
              border:`1px solid ${isFounder?CA.gold:bord}`,
              borderRadius:12, padding:"13px 14px",
              display:"flex", alignItems:"center", gap:8, opacity:u.active?1:.55,
              boxSizing:"border-box", width:"100%", overflow:"hidden",
              boxShadow:isFounder?`0 0 0 1px ${CA.gold}33`:undefined,
              cursor:(auth.id===1||auth.role==="admin")?"grab":"default",
              transform:draggingId===u.id?"scale(1.02)":"scale(1)",
              transition:"transform .15s", userSelect:"none", WebkitUserSelect:"none", WebkitTouchCallout:"none" }}>
            <div style={{ width:40,height:40,borderRadius:999,
              background:isFounder?`${CA.gold}33`:`${CA.gold}22`, display:"grid", placeItems:"center",
              fontSize:18, flexShrink:0 }}>
              {isFounder ? "👑" : ROLES[u.role]?.badge||"👤"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:14, color:text }}>
                {u.name}
              </div>
              <div style={{ fontSize:11.5, color:dark?CA.dMute:CA.mute,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {u.email}
              </div>
              <ABadge color={isFounder?CA.gold:u.role==="admin"?CA.gold:u.role==="manager"?"#1DC0D4":CA.success}>
                {isFounder ? "✦ Fondateur" : ROLES[u.role]?.label||u.role}
              </ABadge>
            </div>
            <div style={{ display:"flex", gap:5, flexShrink:0 }}>
              {/* Fiche profil — soi-même (changer son mdp) ou membre qu'on gère */}
              {(u.id===auth.id || manageable) && (
                <button onClick={() => openProfile(u)}
                  title="Voir / modifier la fiche"
                  style={{ width:32,height:32,borderRadius:8,
                    border:`1px solid ${bord}`, background:"none",
                    cursor:"pointer",display:"grid",placeItems:"center",
                    color:dark?CA.dMute:CA.mute }}>
                  <Lock size={13}/>
                </button>
              )}
              {/* Changer le rôle — seulement si on a les droits sur ce membre */}
              {!isFounder && manageable && (
                <select value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                  style={{ padding:"4px 4px", borderRadius:8, fontSize:11,
                    border:`1px solid ${bord}`,
                    background:dark?CA.dCard:"#fff",
                    color:text, cursor:"pointer", fontFamily:"inherit",
                    maxWidth:130, flexShrink:1 }}>
                  <option value="delivery">🚚 Livreur</option>
                  <option value="manager">🤵🏽‍♂️ Gestionnaire</option>
                  <option value="admin">👑 Admin</option>
                </select>
              )}
              {/* Activer / désactiver — jamais sur David ni soi-même */}
              {!isFounder && u.id !== auth.id && manageable && (
                <button onClick={() => toggle(u.id)}
                  title={u.active?"Désactiver ce membre":"Réactiver ce membre"}
                  style={{ width:32,height:32,borderRadius:8,
                    border:`1px solid ${u.active?CA.success:CA.danger}`,
                    background:u.active?`${CA.success}11`:`${CA.danger}11`,
                    cursor:"pointer",display:"grid",placeItems:"center",
                    color:u.active?CA.success:CA.danger }}>
                  {u.active?<CheckCircle size={13}/>:<X size={13}/>}
                </button>
              )}
              {/* Supprimer — jamais sur David, seulement non-admin manageable */}
              {!isFounder && u.role!=="admin" && manageable && (
                <button onClick={() => del(u.id)}
                  style={{ width:32,height:32,borderRadius:8,border:`1px solid ${bord}`,
                    background:"none",cursor:"pointer",display:"grid",
                    placeItems:"center",color:CA.danger }}>
                  <Trash size={13}/>
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>
      {(auth.id===1 || auth.role==="admin") && users.length > 1 && (
        <p style={{ fontSize:11, color:dark?CA.dMute:CA.mute, marginTop:10, textAlign:"center" }}>
          ✦ Maintiens un membre appuyé puis glisse pour réordonner la liste
        </p>
      )}

      {/* ── FICHE PROFIL MEMBRE ── */}
      {profileUser && (() => {
        const isSelf = profileUser.id === auth.id;
        const canEditFull = !isSelf && (auth.id===1 || canManage(profileUser)); // admin gère le membre
        const isFounderProfile = profileUser.id === 1;
        return (
          <div onClick={()=>setProfileUser(null)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)",
              display:"flex", alignItems:"center", justifyContent:"center",
              padding:16, zIndex:3000 }}>
            <div onClick={e=>e.stopPropagation()}
              style={{ background:dark?CA.dCard:"#fff", borderRadius:16,
                padding:22, width:"100%", maxWidth:380, maxHeight:"85vh", overflowY:"auto",
                boxShadow:"0 20px 50px rgba(0,0,0,.3)" }}>
              {/* En-tête */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <div style={{ width:48, height:48, borderRadius:12,
                  background:isFounderProfile?`${CA.gold}33`:`${CA.gold}18`,
                  display:"grid", placeItems:"center", fontSize:20 }}>
                  {isFounderProfile ? "👑" : ROLES[profileUser.role]?.badge || "👤"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:17,
                    fontWeight:700, color:text }}>{profileUser.name}</div>
                  <ABadge color={isFounderProfile?CA.gold:profileUser.role==="admin"?CA.gold:profileUser.role==="manager"?"#1DC0D4":CA.success}>
                    {isFounderProfile ? "✦ Fondateur" : ROLES[profileUser.role]?.label||profileUser.role}
                  </ABadge>
                </div>
                <button onClick={()=>setProfileUser(null)}
                  style={{ border:"none", background:"none", cursor:"pointer", color:CA.mute }}>
                  <X size={18}/>
                </button>
              </div>

              {/* Infos lecture seule */}
              <div style={{ fontSize:12.5, color:dark?CA.dMute:CA.mute, marginBottom:16,
                lineHeight:1.7, background:dark?CA.dBorder:CA.creamD,
                borderRadius:10, padding:"10px 12px" }}>
                <div>👤 Rôle : <b style={{color:text}}>{isFounderProfile?"Fondateur":ROLES[profileUser.role]?.label}</b></div>
                {profileUser.promoted_by && (
                  <div>⬆️ Promu par : <b style={{color:text}}>{users.find(x=>x.id===profileUser.promoted_by)?.name || "—"}</b></div>
                )}
                <div>🔌 Statut : <b style={{color:profileUser.active!==false?CA.success:CA.danger}}>
                  {profileUser.active!==false?"Actif":"Désactivé"}</b></div>
              </div>

              {/* Édition email — Fondateur/admin sur membre en dessous, OU lecture seule sinon */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                  display:"block", marginBottom:4 }}>Adresse email</label>
                {canEditFull && !isFounderProfile ? (
                  <input value={profileEdit.email}
                    onChange={e=>setProfileEdit(p=>({...p,email:e.target.value}))}
                    style={inp} type="email"/>
                ) : (
                  <div style={{ ...inp, color:dark?CA.dMute:CA.mute, background:dark?CA.dBorder:CA.creamD }}>
                    {profileUser.email}
                  </div>
                )}
                {isSelf && (
                  <p style={{ fontSize:10.5, color:dark?CA.dMute:CA.mute, marginTop:4 }}>
                    Pour changer ton email, demande à un administrateur.
                  </p>
                )}
              </div>

              {/* Édition mot de passe */}
              {(isSelf || canEditFull) && (
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                    display:"block", marginBottom:4 }}>
                    {isSelf ? "Nouveau mot de passe" : "Mot de passe provisoire"}
                  </label>
                  <input value={profileEdit.pwd}
                    onChange={e=>setProfileEdit(p=>({...p,pwd:e.target.value}))}
                    style={inp} type="text" placeholder="Laisser vide pour ne pas changer"/>
                  {!isSelf && canEditFull && (
                    <p style={{ fontSize:10.5, color:dark?CA.dMute:CA.mute, marginTop:4 }}>
                      Le membre pourra le changer lui-même ensuite depuis sa fiche.
                    </p>
                  )}
                </div>
              )}

              {profileEdit.msg && (
                <p style={{ fontSize:12.5, fontWeight:600, textAlign:"center",
                  color: profileEdit.msg.startsWith("✅")?CA.success:CA.danger,
                  margin:"0 0 12px" }}>{profileEdit.msg}</p>
              )}

              {/* Bouton enregistrer (si on peut éditer qqch) */}
              {(isSelf || (canEditFull && !isFounderProfile)) && (
                <button onClick={saveProfile}
                  style={{ width:"100%", padding:"11px", borderRadius:11,
                    border:"none", background:CA.ink, color:CA.gold,
                    fontSize:14, fontWeight:700, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                  <Save size={15}/> Enregistrer
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ──────────────────────────────────────────
   ÉDITEUR PAGES LÉGALES (composant séparé pour éviter useState dans JSX)
────────────────────────────────────────── */
function LegalEditor({ cfg, setCfg, dark, cardBg, bord, text, inp }) {
  // Mapping clé cfg → type LEGAL fallback
  const LEGAL_PAGES = [
    { k:"legalMentions", type:"legal", title:"Mentions légales" },
    { k:"legalCgv",      type:"cgv",   title:"CGV" },
    { k:"legalRgpd",     type:"rgpd",  title:"Confidentialité" },
    { k:"legalSav",      type:"sav",   title:"SAV" },
  ];
  const [legalTab, setLegalTab] = useState(LEGAL_PAGES[0].k);
  const current = LEGAL_PAGES.find(pg => pg.k === legalTab);

  // Sections actuelles : custom si défini, sinon copie du fallback
  const getSections = () => {
    const custom = cfg[legalTab];
    if (Array.isArray(custom) && custom.length > 0) return custom;
    return (LEGAL[current.type]?.content || []).map(s => ({ ...s }));
  };
  const sections = getSections();

  const updateSections = (newSections) => {
    setCfg(c => ({ ...c, [legalTab]: newSections }));
  };
  const setSectionField = (idx, field, value) => {
    const copy = sections.map((s,i) => i===idx ? { ...s, [field]:value } : s);
    updateSections(copy);
  };
  const addSection = () => updateSections([...sections, { h:"", p:"" }]);
  const removeSection = (idx) => updateSections(sections.filter((_,i)=>i!==idx));
  const resetToDefault = () => {
    if (!window.confirm("Réinitialiser cette page au texte par défaut ?")) return;
    setCfg(c => { const n = { ...c }; delete n[legalTab]; return n; });
  };

  return (
    <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
      <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>⚖️ Pages légales</h3>
      {/* Onglets pages */}
      <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto",
        paddingBottom:4, WebkitOverflowScrolling:"touch" }}>
        {LEGAL_PAGES.map(pg => (
          <button key={pg.k} onClick={() => setLegalTab(pg.k)}
            style={{ padding:"6px 11px", borderRadius:8, fontSize:12, fontWeight:600,
              border:`1.5px solid ${legalTab===pg.k?CA.gold:bord}`,
              background:legalTab===pg.k?CA.ink:cardBg,
              color:legalTab===pg.k?CA.gold:text,
              cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
            {pg.title}
          </button>
        ))}
      </div>

      {/* Sections éditables */}
      {sections.map((s,idx) => (
        <div key={idx} style={{ border:`1px solid ${bord}`, borderRadius:11,
          padding:"12px", marginBottom:10, background:dark?"#1A1510":"#FAFAF7" }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:7 }}>
            <span style={{ fontSize:10.5, fontWeight:700, color:CA.gold }}>
              SECTION {idx+1}
            </span>
            <button onClick={() => removeSection(idx)}
              style={{ width:24, height:24, borderRadius:6, border:`1px solid ${bord}`,
                background:"none", cursor:"pointer", display:"grid",
                placeItems:"center", color:CA.danger }}>
              <Trash size={11}/>
            </button>
          </div>
          <input style={{ ...inp, marginBottom:7, fontWeight:600 }}
            value={s.h||""} placeholder="Titre de la section (ex : Éditeur)"
            onChange={e => setSectionField(idx, "h", e.target.value)}/>
          <textarea style={{ ...inp, resize:"vertical", lineHeight:1.6 }} rows={4}
            value={s.p||""} placeholder="Texte de la section…"
            onChange={e => setSectionField(idx, "p", e.target.value)}/>
        </div>
      ))}

      {/* Boutons ajouter / réinitialiser */}
      <div style={{ display:"flex", gap:8, marginTop:4, flexWrap:"wrap" }}>
        <button onClick={addSection}
          style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`,
            borderRadius:9, padding:"8px 12px", cursor:"pointer",
            fontSize:12.5, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
          <PlusCircle size={13}/> Ajouter une section
        </button>
        <button onClick={resetToDefault}
          style={{ background:"none", color:dark?CA.dMute:CA.mute,
            border:`1px solid ${bord}`, borderRadius:9, padding:"8px 12px",
            cursor:"pointer", fontSize:12.5, fontWeight:600 }}>
          ↺ Réinitialiser
        </button>
      </div>
      <p style={{ fontSize:11, color:dark?CA.dMute:CA.mute, marginTop:10 }}>
        💡 Chaque section = un titre en gras + un texte, comme affiché sur le site.
        N'oubliez pas d'<strong>Enregistrer</strong> en bas de page.
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET PARAMÈTRES
────────────────────────────────────────── */
function AdminSettingsTab({ cfg, setCfg, promos, setPromos, dark, auth, setAuth, setUsers }) {
  const text   = dark ? CA.dText : CA.ink;
  const bord   = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const [tab, setTab]   = useState("contacts");
  const [saved, setSaved] = useState(false);
  const [pwd, setPwd] = useState({ old:"", new1:"", new2:"", err:"", ok:false });
  const [newPromo, setNewPromo] = useState({ code:"", discount:"", maxUses:"", expiresAt:"" });
  const setC = k => e => setCfg(c=>({...c,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value}));
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9,
    border:`1.5px solid ${bord}`, background:dark?CA.dCard:"#fff",
    fontSize:"16px", color:text, fontFamily:"inherit" };

  const save = async () => {
    try { await sb.upsert("announcements", {id:"config", data:cfg}); } catch(e){console.warn(e.message);}
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  // Auto-save quand le thème saisonnier change (effet instantané côté client)
  const themeFirst = useState({ v:true })[0];
  useEffect(() => {
    if (themeFirst.v) { themeFirst.v = false; return; }
    const id = setTimeout(() => {
      sb.upsert("announcements", { id:"config", data:cfg }).catch(()=>{});
    }, 400);
    return () => clearTimeout(id);
  }, [cfg.theme]);

  const addPromo = async () => {
    if (!newPromo.code||!newPromo.discount) return;
    const code = newPromo.code.toUpperCase().trim();
    if (promos.some(p => p.code === code)) {
      window.alert(`⚠️ Le code "${code}" existe déjà.`);
      return;
    }
    const p = { code, discount:parseInt(newPromo.discount)||0,
      maxUses:parseInt(newPromo.maxUses)||999, uses:0, active:true,
      expiresAt: newPromo.expiresAt || null };
    setPromos(ps=>[...ps,p]);
    setNewPromo({ code:"", discount:"", maxUses:"", expiresAt:"" });
    // Persister dans Supabase avec fallback progressif si colonnes manquantes
    const full = {
      code: p.code, discount: p.discount, max_uses: p.maxUses,
      uses: 0, active: true, expires_at: p.expiresAt,
    };
    try {
      await sb.post("promos", full);
    } catch(e) {
      console.warn("addPromo full échec:", e.message);
      // Réessayer sans expires_at puis sans max_uses
      try {
        const { expires_at, ...noExp } = full;
        await sb.post("promos", noExp);
      } catch(e2) {
        try {
          await sb.post("promos", { code:p.code, discount:p.discount, uses:0, active:true });
        } catch(e3) {
          window.alert("⚠️ Le code a été créé localement mais n'a pas pu être enregistré. Vérifiez la table promos dans Supabase.");
        }
      }
    }
  };

  const togglePromo = async (code) => {
    const p = promos.find(x=>x.code===code);
    if (!p) return;
    setPromos(ps=>ps.map(x=>x.code===code?{...x,active:!x.active}:x));
    try {
      await fetch(`${SB_URL}/rest/v1/promos?code=eq.${encodeURIComponent(code)}`, {
        method:"PATCH", headers:sbHeaders,
        body: JSON.stringify({ active: !p.active })
      });
    } catch(e){ console.warn("togglePromo:", e.message); }
  };

  const deletePromo = async (code) => {
    if (!window.confirm(`Supprimer le code promo "${code}" ?`)) return;
    setPromos(ps=>ps.filter(x=>x.code!==code));
    try {
      await fetch(`${SB_URL}/rest/v1/promos?code=eq.${encodeURIComponent(code)}`, {
        method:"DELETE", headers:sbHeaders
      });
    } catch(e){ console.warn("deletePromo:", e.message); }
  };

  const changePwd = () => {
    if (pwd.old !== auth.pwd) { setPwd(p=>({...p,err:"Ancien mot de passe incorrect."})); return; }
    if (pwd.new1.length < 6)  { setPwd(p=>({...p,err:"Nouveau mot de passe trop court (min 6 caractères)."})); return; }
    if (pwd.new1 !== pwd.new2){ setPwd(p=>({...p,err:"Les mots de passe ne correspondent pas."})); return; }
    // Mettre à jour dans la liste locale + Supabase
    setUsers(us => us.map(u => u.id===auth.id ? {...u, pwd:pwd.new1} : u));
    setAuth(a => ({...a, pwd:pwd.new1}));
    sb.patch("team_users", auth.id, { pwd:pwd.new1 }).catch(e=>console.warn(e.message));
    setPwd({ old:"", new1:"", new2:"", err:"", ok:true });
    setTimeout(() => setPwd(p=>({...p,ok:false})), 3000);
  };

  const settingsTabs = [
    { k:"contacts",  label:"📞 Contacts" },
    { k:"livraison", label:"🚚 Livraison" },
    { k:"banniere",  label:"📢 Bannière" },
    { k:"promos",    label:"🎁 Promos" },
    { k:"apparence", label:"🎨 Apparence" },
    { k:"apropos",   label:"📄 À propos" },
    { k:"legal",     label:"⚖️ Pages légales" },
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
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>🚚 Livraison gratuite</h3>

          {/* Toggle livraison gratuite */}
          <label style={{ display:"flex", alignItems:"center", gap:8,
            cursor:"pointer", marginBottom:14, fontSize:13.5, color:text }}>
            <input type="checkbox" checked={cfg.freeDelivery !== false}
              onChange={e => setCfg(c=>({...c, freeDelivery: e.target.checked}))}/>
            Activer la livraison gratuite à partir d'un montant
          </label>

          {/* Seuil + affichage */}
          {cfg.freeDelivery !== false ? (<>
            <label style={{ display:"block", marginBottom:12 }}>
              <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>
                Livraison gratuite à partir de (FCFA)
              </span>
              <input style={inp} type="number" value={cfg.freeFrom||""} onChange={setC("freeFrom")}
                placeholder="Ex : 20000"/>
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:8,
              cursor:"pointer", fontSize:13, color:text }}>
              <input type="checkbox" checked={cfg.showFreeFrom !== false}
                onChange={e => setCfg(c=>({...c, showFreeFrom: e.target.checked}))}/>
              Afficher "Livraison offerte dès X FCFA" dans le panier
            </label>
          </>) : (
            <p style={{ fontSize:12, color:dark?CA.dMute:CA.mute }}>
              La bannière de livraison gratuite ne s'affichera pas.
            </p>
          )}

          {/* Info articles épuisés (méthode Shein) */}
          <div style={{ borderTop:`1px solid ${bord}`, marginTop:16, paddingTop:16 }}>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:15, color:text, margin:"0 0 8px" }}>📦 Articles épuisés</h3>
            <p style={{ fontSize:12, color:dark?CA.dMute:CA.mute, lineHeight:1.5 }}>
              Les articles en rupture restent visibles sur le site, mais le bouton "Ajouter au panier" devient "Rupture de stock" (non cliquable). Le client voit l'article mais ne peut pas le commander tant que tu n'as pas réapprovisionné le stock.
            </p>
          </div>
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
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
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
              <div style={{ display:"block", minWidth:0 }}>
                <span style={{ fontSize:10, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Expire le (optionnel)</span>
                <div style={{ display:"flex", gap:5, alignItems:"center", minWidth:0 }}>
                  <input style={{ ...inp, boxSizing:"border-box", maxWidth:"100%",
                    minWidth:0, flex:1, WebkitAppearance:"none", appearance:"none" }}
                    type="date"
                    value={newPromo.expiresAt||""}
                    onChange={e=>setNewPromo(p=>({...p,expiresAt:e.target.value}))}/>
                  {newPromo.expiresAt && (
                    <button type="button"
                      onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setNewPromo(p=>({...p,expiresAt:""})); }}
                      title="Retirer la date"
                      style={{ flexShrink:0, width:30, height:34, borderRadius:8,
                        border:`1px solid ${bord}`, background:"none",
                        cursor:"pointer", color:CA.danger, display:"grid",
                        placeItems:"center" }}>
                      <X size={13}/>
                    </button>
                  )}
                </div>
              </div>
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
            {promos.map((p,i) => {
              // Compte à rebours
              let countdown = null;
              if (p.expiresAt) {
                const diff = new Date(p.expiresAt) - new Date();
                if (diff <= 0) {
                  countdown = <span style={{ fontSize:10, color:CA.danger, fontWeight:700 }}>Expiré</span>;
                } else {
                  const days = Math.floor(diff/86400000);
                  const hrs  = Math.floor((diff%86400000)/3600000);
                  countdown = (
                    <span style={{ fontSize:10, color:CA.warning, fontWeight:700 }}>
                      ⏱ {days>0?`${days}j `:""}{hrs}h
                    </span>
                  );
                }
              }
              return (
                <div key={i} style={{ padding:"10px 12px", borderRadius:10,
                  border:`1px solid ${p.active?CA.gold+"44":bord}`,
                  background:p.active?`${CA.gold}08`:"none",
                  opacity:p.active?1:.6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <div style={{ fontFamily:"Georgia,serif", fontWeight:700,
                      color:p.active?CA.gold:text, fontSize:14, flex:1 }}>
                      {p.code}
                    </div>
                    <ABadge color={p.active?CA.success:CA.mute}>
                      {p.active?"Actif":"Inactif"}
                    </ABadge>
                    <span style={{ fontSize:12, color:dark?CA.dMute:CA.mute }}>-{p.discount}%</span>
                    <span style={{ fontSize:11, color:dark?CA.dMute:CA.mute }}>
                      {p.uses}/{p.maxUses} utilisations
                    </span>
                    {countdown}
                    <button onClick={() => togglePromo(p.code)}
                      style={{ width:28,height:28,borderRadius:7,border:`1px solid ${bord}`,
                        background:"none",cursor:"pointer",display:"grid",placeItems:"center",
                        color:p.active?CA.success:CA.mute }}>
                      {p.active?<CheckCircle size={12}/>:<X size={12}/>}
                    </button>
                    <button onClick={() => deletePromo(p.code)}
                      style={{ width:28,height:28,borderRadius:7,border:`1px solid ${bord}`,
                        background:"none",cursor:"pointer",display:"grid",
                        placeItems:"center",color:CA.danger }}>
                      <Trash size={12}/>
                    </button>
                  </div>
                  {p.expiresAt && (
                    <div style={{ fontSize:10.5, color:dark?CA.dMute:CA.mute, marginTop:4 }}>
                      📅 Expire le {new Date(p.expiresAt).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPARENCE */}
      {tab==="apparence" && (
        <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>🎨 Apparence du site</h3>

          {/* THÈMES SAISONNIERS */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:text, marginBottom:4 }}>
              🎭 Thème saisonnier
            </div>
            <p style={{ fontSize:11.5, color:dark?CA.dMute:CA.mute, marginBottom:10, lineHeight:1.5 }}>
              Change l'ambiance du site pour une fête. Le thème "Classique" remet les couleurs d'origine.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {Object.entries(THEMES).map(([key, th]) => {
                const active = (cfg.theme||"classic") === key;
                return (
                  <button key={key}
                    onClick={()=>setCfg(c=>({...c, theme:key}))}
                    style={{ textAlign:"left", padding:"10px 12px", borderRadius:11,
                      border:`2px solid ${active?th.colorGold:bord}`,
                      background:active?`${th.colorGold}14`:(dark?CA.dCard:"#fff"),
                      cursor:"pointer", transition:"all .15s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                      <span style={{ fontSize:15 }}>{th.label.split(" ")[0]}</span>
                      <span style={{ fontSize:12.5, fontWeight:700, color:text }}>
                        {th.label.split(" ").slice(1).join(" ")}
                      </span>
                      {active && <Check size={13} color={th.colorGold} style={{marginLeft:"auto"}}/>}
                    </div>
                    <div style={{ fontSize:10, color:dark?CA.dMute:CA.mute }}>{th.desc}</div>
                    {/* Aperçu couleurs */}
                    <div style={{ display:"flex", gap:4, marginTop:6 }}>
                      <span style={{ width:14, height:14, borderRadius:4, background:th.colorGold }}/>
                      <span style={{ width:14, height:14, borderRadius:4, background:th.colorCream, border:`1px solid ${bord}` }}/>
                      <span style={{ width:14, height:14, borderRadius:4, background:th.colorAccent }}/>
                    </div>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize:11, color:dark?CA.dMute:CA.mute, marginTop:8 }}>
              ✦ Le thème s'applique côté client en quelques secondes après enregistrement.
            </p>
          </div>

          <div style={{ borderTop:`1px solid ${bord}`, paddingTop:14 }}/>

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
            textAlign:"center", marginTop:14 }}>
            <div style={{ fontSize:9, color:cfg.colorGold||CA.gold, letterSpacing:4, marginBottom:8 }}>✦ DADA'S DROP ✦</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:18, color:"#fff", marginBottom:6 }}>
              {cfg.heroTitle||"L'élégance, livrée chez vous."}
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>
              {cfg.heroSub||"Sacs & accessoires sélectionnés avec soin, livrés à Ouagadougou."}
            </div>
          </div>

          <p style={{ fontSize:11, color:dark?CA.dMute:CA.mute, marginTop:14 }}>
            🎨 Pour personnaliser les couleurs de base du site en profondeur, rends-toi dans l'onglet <b>Fondateur</b> (réservé à David).
          </p>
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

      {/* À PROPOS */}
      {tab==="apropos" && (
        <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:"0 0 14px" }}>📄 Page À propos</h3>
          <div style={{ display:"grid", gap:12 }}>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Titre de la boutique</span>
              <input style={inp} value={cfg.aboutTitle||"Dada's Drop"} onChange={setC("aboutTitle")}/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Sous-titre</span>
              <input style={inp} value={cfg.aboutSub||"Collection Premium · Ouagadougou, Burkina Faso"} onChange={setC("aboutSub")}/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:3 }}>Notre histoire</span>
              <textarea style={{ ...inp, resize:"vertical" }} rows={4}
                value={cfg.aboutStory||"Dada's Drop est née d'une passion pour l'élégance accessible. Nous sélectionnons avec soin des sacs et accessoires de qualité premium, importés pour vous et livrés directement à Ouagadougou."}
                onChange={setC("aboutStory")}/>
            </label>
          </div>
        </div>
      )}

      {/* PAGES LÉGALES */}
      {tab==="legal" && (
        <LegalEditor cfg={cfg} setCfg={setCfg} dark={dark} cardBg={cardBg} bord={bord} text={text} inp={inp}/>
      )}

      {/* Bouton Save global */}
      <button onClick={save}
        style={{ marginTop:16, background:saved?CA.success:CA.ink,
          color:saved?"#fff":CA.gold,
          border:`1px solid ${saved?CA.success:CA.gold}44`, borderRadius:11,
          padding:"12px 20px", cursor:"pointer", fontSize:14, fontWeight:700,
          display:"flex", alignItems:"center", gap:8, transition:"background .3s" }}>
        {saved?<><CheckCircle size={16}/> Enregistré !</>:<><Save size={16}/> Enregistrer</>}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET AVIS
────────────────────────────────────────── */
function AdminReviewsTab({ auth, dark }) {
  const text   = dark ? CA.dText : CA.ink;
  const bord   = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [replyId, setReplyId]   = useState(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter]     = useState("all"); // all | pending | hidden

  useEffect(() => {
    const load = () => {
      sb.get("reviews", `?order=id.desc&limit=200&_cb=${Date.now()}`)
        .then(rows => { setReviews(rows||[]); })
        .catch(e => console.warn("reviews:", e.message))
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleHidden = async (r) => {
    const updated = { ...r, hidden: !r.hidden };
    setReviews(rs => rs.map(x => x.id===r.id ? updated : x));
    try { await sb.patch("reviews", r.id, { hidden: !r.hidden }); }
    catch(e) { console.warn(e.message); }
  };

  const sendReply = async (r) => {
    if (!replyText.trim()) return;
    const updated = { ...r, reply: replyText.trim(), reply_by: auth.name,
      reply_date: new Date().toISOString().split("T")[0] };
    setReviews(rs => rs.map(x => x.id===r.id ? updated : x));
    try {
      await sb.patch("reviews", r.id, {
        reply: replyText.trim(),
        reply_by: auth.name,
        reply_date: new Date().toISOString().split("T")[0],
      });
    } catch(e) { console.warn(e.message); }
    setReplyId(null); setReplyText("");
  };

  const filtered = reviews.filter(r => {
    if (filter==="hidden")  return r.hidden === true;
    if (filter==="pending") return !r.hidden && !r.reply;
    return r.hidden !== true; // null ou false → visible
  });

  const avgRating = reviews.filter(r=>!r.hidden&&r.stars>0).length
    ? (reviews.filter(r=>!r.hidden&&r.stars>0).reduce((s,r)=>s+(r.stars||0),0)
       / reviews.filter(r=>!r.hidden&&r.stars>0).length).toFixed(1)
    : "—";

  return (
    <div>
      {/* Stats rapides */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
        gap:10, marginBottom:16 }}>
        {[
          { label:"Total avis",   value:reviews.filter(r=>!r.hidden).length, color:CA.gold },
          { label:"Note moyenne", value:avgRating+" ★",                       color:"#F5A623" },
          { label:"Sans réponse", value:reviews.filter(r=>!r.hidden&&!r.reply).length, color:CA.warning },
          { label:"Masqués",      value:reviews.filter(r=>r.hidden).length,   color:CA.mute },
        ].map(s => (
          <div key={s.label} style={{ background:cardBg, border:`1px solid ${bord}`,
            borderRadius:12, padding:"12px 14px" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:700,
              color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:dark?CA.dMute:CA.mute, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display:"flex", gap:7, marginBottom:14, flexWrap:"wrap" }}>
        {[["all","Tous"],["pending","Sans réponse"],["hidden","Masqués"]].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ padding:"7px 13px", borderRadius:9, fontSize:12.5, fontWeight:600,
              border:`1.5px solid ${filter===k?CA.gold:bord}`,
              background:filter===k?CA.ink:cardBg,
              color:filter===k?CA.gold:text, cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:32, color:dark?CA.dMute:CA.mute }}>
          Chargement des avis…
        </div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px",
          color:dark?CA.dMute:"#bbb" }}>
          <Star size={32} strokeWidth={1.2}/>
          <p style={{ marginTop:10, fontSize:13 }}>Aucun avis dans cette catégorie.</p>
        </div>
      ) : filtered.map(r => (
        <div key={r.id} style={{ background:cardBg, border:`1px solid ${r.hidden?bord:CA.gold+"33"}`,
          borderRadius:12, padding:"14px 16px", marginBottom:10,
          opacity:r.hidden?.6:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"flex-start", gap:8, marginBottom:6 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:13.5, color:text, marginBottom:2 }}>
                {r.product||"Article inconnu"}
              </div>
              <div style={{ display:"flex", gap:2, marginBottom:4 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ fontSize:14,
                    color:i<=(r.stars||0)?"#F5A623":"#DDD" }}>★</span>
                ))}
                <span style={{ fontSize:11, color:dark?CA.dMute:CA.mute, marginLeft:5 }}>
                  — commande #{r.order_id}
                </span>
              </div>
              {r.text && (
                <p style={{ fontSize:13, color:dark?CA.dMute:CA.mute,
                  margin:"0 0 6px", lineHeight:1.6, fontStyle:"italic" }}>
                  "{r.text}"
                </p>
              )}
              <div style={{ fontSize:10.5, color:dark?CA.dMute:CA.mute }}>
                📅 {r.date}
              </div>
            </div>
            <button onClick={() => toggleHidden(r)}
              title={r.hidden?"Rendre visible":"Masquer cet avis"}
              style={{ flexShrink:0, padding:"5px 10px", borderRadius:8, fontSize:11.5,
                fontWeight:600, cursor:"pointer",
                border:`1px solid ${r.hidden?CA.success:bord}`,
                background:r.hidden?`${CA.success}15`:"none",
                color:r.hidden?CA.success:(dark?CA.dMute:CA.mute) }}>
              {r.hidden ? <><Eye size={12}/> Afficher</> : <><EyeOff size={12}/> Masquer</>}
            </button>
          </div>

          {/* Réponse existante */}
          {r.reply && (
            <div style={{ background:dark?`${CA.gold}08`:`${CA.gold}06`,
              border:`1px solid ${CA.gold}33`, borderRadius:9,
              padding:"10px 13px", marginTop:8 }}>
              <div style={{ fontSize:10.5, fontWeight:700, color:CA.gold, marginBottom:4 }}>
                💬 Réponse de {r.reply_by||"l'équipe"} · {r.reply_date||""}
              </div>
              <p style={{ fontSize:13, color:text, margin:0, lineHeight:1.6 }}>{r.reply}</p>
              <button onClick={() => { setReplyId(r.id); setReplyText(r.reply); }}
                style={{ marginTop:6, fontSize:11, color:CA.mute, background:"none",
                  border:"none", cursor:"pointer", textDecoration:"underline" }}>
                Modifier
              </button>
            </div>
          )}

          {/* Formulaire réponse */}
          {replyId===r.id ? (
            <div style={{ marginTop:10 }}>
              <textarea value={replyText}
                onChange={e=>setReplyText(e.target.value)}
                rows={3} placeholder="Votre réponse à cet avis…"
                style={{ width:"100%", padding:"9px 11px", borderRadius:9,
                  border:`1.5px solid ${CA.gold}`,
                  background:dark?CA.dCard:"#fff",
                  fontSize:"16px", color:text, fontFamily:"inherit",
                  resize:"vertical", boxSizing:"border-box" }}/>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <button onClick={() => sendReply(r)}
                  style={{ background:CA.ink, color:CA.gold, border:`1px solid ${CA.gold}44`,
                    borderRadius:9, padding:"8px 14px", cursor:"pointer",
                    fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
                  <Check size={13}/> Publier la réponse
                </button>
                <button onClick={() => { setReplyId(null); setReplyText(""); }}
                  style={{ background:"none", color:dark?CA.dMute:CA.mute,
                    border:`1px solid ${bord}`, borderRadius:9,
                    padding:"8px 12px", cursor:"pointer", fontSize:13 }}>
                  Annuler
                </button>
              </div>
            </div>
          ) : !r.reply && (
            <button onClick={() => { setReplyId(r.id); setReplyText(""); }}
              style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:5,
                background:dark?`${CA.gold}0A`:`${CA.gold}08`,
                border:`1px solid ${CA.gold}33`, borderRadius:8,
                padding:"6px 12px", cursor:"pointer",
                fontSize:12, fontWeight:600, color:CA.gold }}>
              💬 Répondre à cet avis
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET CLIENTES
────────────────────────────────────────── */
function AdminClientsTab({ orders, dark }) {
  const text   = dark ? CA.dText : CA.ink;
  const bord   = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const [search, setSearch] = useState("");

  // Agréger les commandes par téléphone
  const clientMap = {};
  orders.forEach(o => {
    const phone = o.customer_phone || o.phone || "—";
    const name  = o.customer_name  || o.name  || "Cliente";
    if (!clientMap[phone]) clientMap[phone] = { phone, name, orders:[], total:0 };
    clientMap[phone].orders.push(o);
    clientMap[phone].total += o.total || 0;
    // Garder le nom le plus récent
    if (o.customer_name || o.name) clientMap[phone].name = o.customer_name || o.name;
  });

  const clients = Object.values(clientMap)
    .sort((a,b) => b.total - a.total);

  const filtered = clients.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div>
      <div style={{ position:"relative", marginBottom:14 }}>
        <Search size={14} color={dark?CA.dMute:CA.mute}
          style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}/>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Rechercher par nom ou téléphone…"
          style={{ width:"100%", padding:"10px 12px 10px 32px",
            borderRadius:10, border:`1.5px solid ${bord}`,
            background:dark?CA.dCard:"#fff",
            fontSize:"16px", color:text, fontFamily:"inherit" }}/>
      </div>
      <p style={{ fontSize:12, color:dark?CA.dMute:CA.mute, marginBottom:12 }}>
        {filtered.length} client{filtered.length>1?"s":""} · triée par montant total
      </p>
      <div style={{ display:"grid", gap:8 }}>
        {filtered.map((c,i) => (
          <div key={c.phone} style={{ background:cardBg, border:`1px solid ${bord}`,
            borderRadius:13, padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:text }}>{c.name}</div>
                <div style={{ fontSize:12, color:dark?CA.dMute:CA.mute }}>📞 {c.phone}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"Georgia,serif", fontWeight:700,
                  color:CA.gold, fontSize:14 }}>{c.total.toLocaleString("fr-FR")} FCFA</div>
                <div style={{ fontSize:11, color:dark?CA.dMute:CA.mute }}>
                  {c.orders.length} commande{c.orders.length>1?"s":""}
                </div>
              </div>
            </div>
            {/* Dernières commandes */}
            {c.orders.slice(0,3).map((o,j) => (
              <div key={j} style={{ display:"flex", justifyContent:"space-between",
                fontSize:12, color:dark?CA.dMute:CA.mute,
                padding:"5px 0", borderTop:`1px solid ${bord}` }}>
                <span>#{o.id} · {o.date}</span>
                <ABadge color={STATUS_ADMIN_COLORS[o.status]}>
                  {STATUS_ADMIN_LABELS[o.status]}
                </ABadge>
              </div>
            ))}
            {c.orders.length > 3 && (
              <div style={{ fontSize:11, color:CA.gold, marginTop:4 }}>
                +{c.orders.length-3} autre{c.orders.length-3>1?"s":""}…
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px", color:dark?CA.dMute:"#bbb" }}>
            <Users size={36} strokeWidth={1.2}/>
            <p style={{ marginTop:10, fontSize:14 }}>Aucune cliente trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET FIDÉLITÉ
────────────────────────────────────────── */
function AdminLoyaltyTab({ cfg, setCfg, orders, dark }) {
  const text   = dark ? CA.dText : CA.ink;
  const bord   = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const [saved, setSaved] = useState(false);
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9,
    border:`1.5px solid ${bord}`, background:dark?CA.dCard:"#fff",
    fontSize:"16px", color:text, fontFamily:"inherit" };

  // Config fidélité depuis cfg
  const loyalty = cfg.loyalty || { active:false, pointsPer1000:1, pointValue:100, minRedeem:50 };
  const setL = (k,v) => setCfg(c=>({...c, loyalty:{ ...(c.loyalty||loyalty), [k]:v }}));

  // Calculer points par cliente depuis les commandes livrées
  const clientMap2 = {};
  orders.filter(o=>o.status===3).forEach(o=>{
    const phone = o.customer_phone || o.phone || "—";
    const name  = o.customer_name  || o.name  || "";
    const pts = Math.floor((o.total||0) / 1000) * (loyalty.pointsPer1000||1);
    if (!clientMap2[phone]) clientMap2[phone] = { phone, name, pts:0 };
    clientMap2[phone].pts += pts;
    if (name) clientMap2[phone].name = name;
  });
  const topClients = Object.values(clientMap2)
    .sort((a,b)=>b.pts-a.pts).slice(0,10);

  return (
    <div>
      {/* Config */}
      <div style={{ background:cardBg, border:`1px solid ${CA.gold}44`,
        borderRadius:14, padding:"18px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:14 }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, color:text, margin:0 }}>
            ⭐ Programme de fidélité
          </h3>
          <label style={{ display:"flex", alignItems:"center", gap:6,
            cursor:"pointer", fontSize:13, color:text }}>
            <input type="checkbox" checked={!!loyalty.active}
              onChange={e=>setL("active",e.target.checked)}/>
            {loyalty.active ? "Actif" : "Inactif"}
          </label>
        </div>
        {loyalty.active && (
          <div style={{ display:"grid", gap:10 }}>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>
                Points gagnés par 1 000 FCFA dépensés
              </span>
              <input style={inp} type="number" min="1"
                value={loyalty.pointsPer1000 ?? ""}
                onChange={e=>setL("pointsPer1000", e.target.value===""?"":parseInt(e.target.value)||1)}/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>
                Valeur d'1 point (en FCFA de réduction)
              </span>
              <input style={inp} type="number" min="1"
                value={loyalty.pointValue ?? ""}
                onChange={e=>setL("pointValue", e.target.value===""?"":parseInt(e.target.value)||100)}/>
            </label>
            <label style={{ display:"block" }}>
              <span style={{ fontSize:11.5, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:3 }}>
                Points minimum pour utiliser ses points
              </span>
              <input style={inp} type="number" min="1"
                value={loyalty.minRedeem ?? ""}
                onChange={e=>setL("minRedeem", e.target.value===""?"":parseInt(e.target.value)||50)}/>
            </label>
            <div style={{ background:dark?`${CA.gold}0A`:`${CA.gold}08`,
              border:`1px solid ${CA.gold}33`, borderRadius:10,
              padding:"10px 13px", fontSize:12.5, color:text }}>
              💡 Exemple : une cliente dépense 25 000 FCFA → gagne{" "}
              <strong style={{color:CA.gold}}>{Math.floor(25000/1000)*(loyalty.pointsPer1000||1)} points</strong>{" "}
              → valeur : <strong style={{color:CA.gold}}>
                {(Math.floor(25000/1000)*(loyalty.pointsPer1000||1)*(loyalty.pointValue||100)).toLocaleString("fr-FR")} FCFA
              </strong>
            </div>
          </div>
        )}
        <button onClick={async () => {
            try {
              await sb.upsert("announcements", { id:"config",
                data:{ ...cfg, loyalty } });
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            } catch(e){console.warn(e.message);}
          }}
          style={{ marginTop:14, background:saved?CA.success:CA.ink,
            color:saved?"#fff":CA.gold,
            border:`1px solid ${saved?CA.success:CA.gold}44`, borderRadius:10,
            padding:"9px 16px", cursor:"pointer", fontSize:13,
            fontWeight:700, display:"flex", alignItems:"center", gap:6,
            transition:"background .3s" }}>
          {saved ? <><CheckCircle size={13}/> Enregistré !</> : <><Save size={13}/> Enregistrer</>}
        </button>
      </div>

      {/* Top client(e)s par points */}
      {loyalty.active && topClients.length > 0 && (
        <div style={{ background:cardBg, border:`1px solid ${bord}`,
          borderRadius:14, padding:"16px" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:15, color:text, margin:"0 0 12px" }}>
            🏆 Top client(e)s — Points cumulés
          </h3>
          {topClients.map((c,i) => (
            <div key={c.phone} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"9px 0",
              borderBottom:i<topClients.length-1?`1px solid ${bord}`:"none" }}>
              <div>
                <div style={{ fontSize:13, color:text, fontWeight:600 }}>
                  #{i+1} · {c.name || "Client"}
                </div>
                <div style={{ fontSize:11.5, color:dark?CA.dMute:CA.mute }}>
                  📞 {c.phone}
                </div>
              </div>
              <ABadge color={CA.gold}>{c.pts} pts</ABadge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   ONGLET FONDATEUR (réservé id:1, protégé par PIN)
────────────────────────────────────────── */
function AdminFounderTab({ cfg, setCfg, dark }) {
  const text   = dark ? CA.dText : CA.ink;
  const bord   = dark ? CA.dBorder : CA.border;
  const cardBg = dark ? CA.dCard : CA.card;
  const inp = { width:"100%", padding:"9px 11px", borderRadius:9,
    border:`1.5px solid ${bord}`, background:dark?CA.dCard:"#fff",
    fontSize:"16px", color:text, fontFamily:"inherit" };

  // Sauvegarde auto dans Supabase quand cfg change (debounce léger) — effet instantané
  const firstRun = useState({ v:true })[0];
  useEffect(() => {
    if (firstRun.v) { firstRun.v = false; return; }
    const id = setTimeout(() => {
      sb.upsert("announcements", { id:"config", data:cfg }).catch(()=>{});
    }, 500);
    return () => clearTimeout(id);
  }, [cfg.maintenance, cfg.maintenanceMsg, cfg.theme, cfg.colorGold,
      cfg.colorCream, cfg.colorInk, cfg.colorAccent, cfg.founderPin]);

  const hasPin = !!(cfg.founderPin && cfg.founderPin.length >= 4);
  const [unlocked, setUnlocked] = useState(!hasPin); // si pas de PIN, déverrouillé d'office
  const [pinInput, setPinInput] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [saved, setSaved] = useState(false);

  const flashSaved = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };
  const tryUnlock = () => {
    if (pinInput === cfg.founderPin) { setUnlocked(true); setPinErr(false); }
    else { setPinErr(true); }
  };

  // ── Écran verrouillé : demande le PIN ──
  if (hasPin && !unlocked) {
    return (
      <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14,
        padding:"28px 20px", maxWidth:360, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔐</div>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:"0 0 6px" }}>
          Espace Fondateur
        </h3>
        <p style={{ fontSize:12.5, color:dark?CA.dMute:CA.mute, margin:"0 0 18px" }}>
          Entre ton code PIN secret pour accéder aux réglages sensibles.
        </p>
        <input type="password" inputMode="numeric" value={pinInput}
          onChange={e=>{ setPinInput(e.target.value); setPinErr(false); }}
          onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
          placeholder="••••"
          style={{ ...inp, textAlign:"center", letterSpacing:8, fontSize:22,
            marginBottom:10, borderColor:pinErr?CA.danger:bord }}/>
        {pinErr && <p style={{ fontSize:12, color:CA.danger, margin:"0 0 10px" }}>Code incorrect.</p>}
        <button onClick={tryUnlock}
          style={{ width:"100%", padding:"11px", borderRadius:11, border:"none",
            background:CA.ink, color:CA.gold, fontSize:14, fontWeight:700, cursor:"pointer" }}>
          Déverrouiller
        </button>
      </div>
    );
  }

  // ── Contenu déverrouillé ──
  return (
    <div style={{ display:"grid", gap:16 }}>
      <div style={{ background:`linear-gradient(135deg,${CA.gold}18,${CA.gold}05)`,
        border:`1px solid ${CA.gold}44`, borderRadius:14, padding:"16px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:22 }}>👑</span>
          <div>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:17, color:CA.gold, margin:0 }}>
              Espace Fondateur
            </h3>
            <p style={{ fontSize:11.5, color:dark?CA.dMute:CA.mute, margin:"2px 0 0" }}>
              Réglages réservés à David — toi seul y as accès.
            </p>
          </div>
        </div>
      </div>

      {/* MODE MAINTENANCE */}
      <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:15, color:text, margin:"0 0 6px" }}>
          🚧 Mode maintenance
        </h3>
        <p style={{ fontSize:12, color:dark?CA.dMute:CA.mute, margin:"0 0 12px", lineHeight:1.5 }}>
          Ferme temporairement la boutique. Les clients verront un message d'attente au lieu du catalogue.
        </p>
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
          padding:"10px 12px", borderRadius:10, marginBottom:12,
          background: cfg.maintenance?`${CA.danger}11`:(dark?CA.dBorder:CA.creamD),
          border:`1px solid ${cfg.maintenance?CA.danger+"44":bord}` }}>
          <input type="checkbox" checked={!!cfg.maintenance}
            onChange={e=>{ setCfg(c=>({...c, maintenance:e.target.checked})); flashSaved(); }}/>
          <span style={{ fontSize:13.5, fontWeight:600, color: cfg.maintenance?CA.danger:text }}>
            {cfg.maintenance ? "🔴 Boutique FERMÉE" : "🟢 Boutique ouverte"}
          </span>
        </label>
        <label style={{ display:"block" }}>
          <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute, display:"block", marginBottom:4 }}>
            Message affiché aux clients
          </span>
          <textarea style={{ ...inp, resize:"vertical" }} rows={2}
            value={cfg.maintenanceMsg||""}
            onChange={e=>setCfg(c=>({...c, maintenanceMsg:e.target.value}))}/>
        </label>
      </div>

      {/* COULEURS PROFONDES */}
      <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:15, color:text, margin:"0 0 6px" }}>
          🎨 Couleurs profondes du site
        </h3>
        <p style={{ fontSize:12, color:dark?CA.dMute:CA.mute, margin:"0 0 14px", lineHeight:1.5 }}>
          Personnalise les couleurs de base. Attention : ces réglages touchent tout le site. Utilise "Réinitialiser" pour revenir aux couleurs d'origine.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { k:"colorGold",   label:"Doré (accents)",   def:"#C9A84C" },
            { k:"colorCream",  label:"Fond crème",        def:"#FAF6EE" },
            { k:"colorInk",    label:"Texte / foncé",     def:"#1A1A1A" },
            { k:"colorAccent", label:"Accent secondaire", def:"#1DC0D4" },
          ].map(col => (
            <label key={col.k} style={{ display:"block" }}>
              <span style={{ fontSize:11, fontWeight:600, color:dark?CA.dMute:CA.mute,
                display:"block", marginBottom:5 }}>{col.label}</span>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <input type="color" value={cfg[col.k]||col.def}
                  onChange={e=>setCfg(c=>({...c,[col.k]:e.target.value, theme:"classic"}))}
                  style={{ width:40, height:34, borderRadius:8, border:`1px solid ${bord}`,
                    cursor:"pointer", padding:2, flexShrink:0 }}/>
                <span style={{ fontSize:11, color:dark?CA.dMute:CA.mute,
                  fontFamily:"monospace" }}>{cfg[col.k]||col.def}</span>
              </div>
            </label>
          ))}
        </div>
        <button onClick={()=>{
            setCfg(c=>({...c, colorGold:"#C9A84C", colorCream:"#FAF6EE",
              colorInk:"#1A1A1A", colorAccent:"#1DC0D4", theme:"classic" }));
            flashSaved();
          }}
          style={{ marginTop:14, width:"100%", padding:"10px", borderRadius:10,
            border:`1px solid ${bord}`, background:"none", color:text,
            fontSize:13, fontWeight:600, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          ↺ Réinitialiser les couleurs d'origine
        </button>
        <p style={{ fontSize:10.5, color:dark?CA.dMute:CA.mute, marginTop:8, textAlign:"center" }}>
          ⚠️ Modifier une couleur désactive le thème saisonnier en cours.
        </p>
      </div>

      {/* CODE PIN FONDATEUR */}
      <div style={{ background:cardBg, border:`1px solid ${bord}`, borderRadius:14, padding:"18px" }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:15, color:text, margin:"0 0 6px" }}>
          🔐 Code PIN Fondateur
        </h3>
        <p style={{ fontSize:12, color:dark?CA.dMute:CA.mute, margin:"0 0 12px", lineHeight:1.5 }}>
          {hasPin
            ? "Un PIN protège déjà cet espace. Tu peux le changer ci-dessous."
            : "Définis un code PIN (min. 4 chiffres) pour protéger cet espace Fondateur."}
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <input type="text" inputMode="numeric" value={newPin}
            onChange={e=>setNewPin(e.target.value.replace(/\D/g,""))}
            placeholder={hasPin?"Nouveau PIN":"Choisir un PIN"}
            style={{ ...inp, flex:1, letterSpacing:4 }}/>
          <button onClick={()=>{
              if (newPin.length < 4) { window.alert("Le PIN doit faire au moins 4 chiffres."); return; }
              setCfg(c=>({...c, founderPin:newPin}));
              setNewPin(""); flashSaved();
            }}
            style={{ padding:"0 16px", borderRadius:10, border:"none",
              background:CA.ink, color:CA.gold, fontSize:13, fontWeight:700, cursor:"pointer" }}>
            {hasPin?"Changer":"Définir"}
          </button>
        </div>
        {hasPin && (
          <button onClick={()=>{
              if (window.confirm("Retirer le code PIN ? L'espace Fondateur ne sera plus protégé.")) {
                setCfg(c=>({...c, founderPin:""})); flashSaved();
              }
            }}
            style={{ marginTop:10, fontSize:11.5, color:CA.danger, background:"none",
              border:"none", cursor:"pointer", textDecoration:"underline", padding:0 }}>
            Retirer le PIN
          </button>
        )}
      </div>

      {saved && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background:CA.success, color:"#fff", padding:"10px 20px", borderRadius:99,
          fontSize:13, fontWeight:700, zIndex:5000, boxShadow:"0 8px 24px rgba(0,0,0,.2)" }}>
          ✅ Enregistré !
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   ADMIN APP PRINCIPALE
────────────────────────────────────────── */
function AdminApp({ products, setProducts, cats, setCats, cfg, setCfg,
  promos, setPromos, dark, setDark, onGoHome }) {

  const [auth, setAuth]   = useState(null);
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [showPw, setShowPw] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [tab, setTab]     = useState("overview");
  const [orders, setOrders] = useState([]);
  const [trash, setTrash]   = useState([]);
  const [users, setUsers]   = useState(INIT_USERS);
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissedStock, setDismissedStock] = useState([]); // produits dont la notif stock a été rejetée
  const [loadingOrders, setLoadingOrders] = useState(false);

  const bg     = dark ? CA.dBg    : CA.cream;
  const text   = dark ? CA.dText  : CA.ink;
  const bord   = dark ? CA.dBorder: CA.border;
  const cardBg = dark ? CA.dCard  : CA.card;
  const unread = notifs.filter(n=>!n.read).length;

  // Stock faible → notifs auto + suppression si stock corrigé
  useEffect(() => {
    const lowStock = products.filter(p=>p.stock>0&&p.stock<=5);
    const okStock  = products.filter(p=>p.stock>5);
    // Si un produit repasse au-dessus de 5, on le retire des "rejetés" (il pourra re-notifier plus tard)
    setDismissedStock(ds => ds.filter(id => !okStock.some(p => p.id === id)));
    setNotifs(ns => {
      let updated = ns.filter(n => {
        if (!n.msg.includes("Stock faible")) return true;
        return !okStock.some(p => n.msg.includes(p.name));
      });
      const existing = updated.map(n=>n.msg);
      const newNotifs = lowStock
        .filter(p=>!existing.some(m=>m.includes(p.name)))
        .filter(p=>!dismissedStock.includes(p.id)) // ne pas recréer si déjà rejeté
        .map(p=>({ id:Date.now()+p.id, stockProductId:p.id,
          msg:`⚠️ Stock faible : ${p.name} (${p.stock} restant${p.stock>1?"s":""})`,
          time:new Date().toISOString(), read:false }));
      return [...updated, ...newNotifs];
    });
  }, [products, dismissedStock]);

  // Charger membres équipe depuis Supabase
  useEffect(() => {
    if (!auth) return;
    sb.get("team_users", "?order=id.asc")
      .then(rows => {
        if (rows?.length > 0) {
          setUsers(rows.map(u => ({
            ...u,
            pwd:    u.pwd    || "dada2025",
            active: u.active ?? true,
          })));
        }
      }).catch(e => console.warn("team_users:", e.message));
  }, [auth]);

  // REALTIME — surveiller les changements de rôle en temps réel
  useEffect(() => {
    if (!auth) return;

    // Polling toutes les 3 secondes pour vérifier si le rôle a changé
    const checkRole = setInterval(async () => {
      try {
        const rows = await sb.get("team_users", `?id=eq.${auth.id}&select=role,active&_cb=${Date.now()}`);
        if (!rows?.length) return;
        const current = rows[0];

        // David (id:1) est intouchable — jamais déconnecté par le polling
        if (auth.id === 1) return;

        // Compte désactivé → déconnexion forcée
        if (current.active === false) {
          clearInterval(checkRole);
          window.alert("⛔ Votre compte a été désactivé. Vous allez être déconnecté.");
          logout();
          return;
        }

        // Rôle modifié → mettre à jour auth en direct (hausse OU baisse)
        const roleLevel = { delivery:1, manager:2, admin:3 };
        if (roleLevel[current.role] !== roleLevel[auth.role]) {
          const isUp = roleLevel[current.role] > roleLevel[auth.role];
          setAuth(a => ({...a, role: current.role}));
          if (!isUp) setTab("orders");
          const roleLabel = ROLES[current.role]?.label || current.role;
          setNotifs(ns => [{
            id:Date.now(),
            msg: isUp
              ? `🎉 Félicitations ! Vous êtes maintenant ${roleLabel}. De nouveaux droits vous ont été accordés.`
              : `⚠️ Votre rôle a changé → ${roleLabel}. Vos droits ont été mis à jour.`,
            time:new Date().toISOString(), read:false
          }, ...ns]);
          return;
        }
      } catch(e) { console.warn("Realtime check:", e.message); }
    }, 3000); // toutes les 3 secondes

    return () => clearInterval(checkRole);
  }, [auth]);

  // Rafraîchissement auto commandes toutes les 30s
  useEffect(() => {
    if (!auth) return;
    const interval = setInterval(() => {
      sb.get("orders", "?order=created_at.desc&limit=100")
        .then(rows => {
          if (rows?.length > 0) {
            const all = rows.map(o => ({
              ...o,
              name:  o.customer_name  || o.name  || "Client",
              phone: o.customer_phone || o.phone || "",
              date:  o.created_at ? o.created_at.split("T")[0] : o.date || "",
              assignedTo: o.assigned_to ?? o.assignedTo ?? null,
            }));
            // Séparer commandes actives et corbeille
            setOrders(all.filter(o => !o.deleted));
            setTrash(all.filter(o => o.deleted));
          }
        }).catch(e => console.warn(e.message));
    // 5s pour le livreur (quasi instantané), 30s pour les autres
    }, auth?.role === "delivery" ? 5000 : 15000);
    return () => clearInterval(interval);
  }, [auth]);

  // Charger commandes depuis Supabase
  useEffect(() => {
    if (!auth) return;
    setLoadingOrders(true);
    sb.get("orders", "?order=created_at.desc&limit=100")
      .then(rows => {
        if (rows?.length>0) {
          const all = rows.map(o => ({
            ...o,
            name:  o.customer_name  || o.name  || "Client",
            phone: o.customer_phone || o.phone || "",
            date:  o.created_at ? o.created_at.split("T")[0] : o.date || "",
            assignedTo: o.assigned_to ?? o.assignedTo ?? null,
          }));
          setOrders(all.filter(o => !o.deleted));
          setTrash(all.filter(o => o.deleted));
          // Notifs nouvelles commandes
          const newOrders = all.filter(o=>o.status===1&&!o.deleted);
          if (newOrders.length>0) {
            setNotifs(ns=>[{
              id:Date.now(),
              msg:`📦 ${newOrders.length} commande${newOrders.length>1?"s":""} en attente de traitement`,
              time:new Date().toISOString(), read:false
            }, ...ns]);
          }
        } else {
          setOrders([]);
          setTrash([]);
        }
      })
      .catch(e=>console.warn("Supabase orders:",e.message))
      .finally(()=>setLoadingOrders(false));
  }, [auth]);

  // Sync produits admin toutes les 20s (vues, stock, etc.) + au retour sur l'onglet
  useEffect(() => {
    if (!auth) return;
    const normalize = rows => rows.map(p => ({
      ...p,
      isNew:    p.is_new    ?? p.isNew    ?? false,
      isBest:   p.is_best   ?? p.isBest   ?? false,
      isPinned: p.is_pinned ?? p.isPinned ?? false,
      isHidden: p.is_hidden ?? p.isHidden ?? false,
      desc:     p.description ?? p.desc   ?? "",
      imgs:     p.imgs || [], accent: p.accent || [],
      variants: p.variants || [], rating: p.rating || 0,
      ratingCount: p.rating_count || 0,
      isPreorder: p.is_preorder ?? false,
    }));
    const refreshProducts = () => {
      sb.get("products", `?trashed_at=is.null&order=id.asc&_cb=${Date.now()}`)
        .then(rows => { if (rows?.length) setProducts(normalize(rows)); })
        .catch(()=>{});
    };
    const iv = setInterval(refreshProducts, 20000);
    const onVis = () => { if (document.visibilityState === "visible") refreshProducts(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, [auth]);

  const login = async () => {
    // D'abord chercher dans Supabase pour avoir le vrai rôle actuel
    try {
      const rows = await sb.get("team_users", `?email=eq.${email}&select=*`);
      if (rows?.length > 0) {
        const sbUser = rows[0];
        const localUser = users.find(x => x.email===email);
        // Vérifier le mot de passe (local ou Supabase)
        const pwd = sbUser.pwd || localUser?.pwd || "dada2025";
        if (pass === pwd && sbUser.active !== false) {
          const u = { ...localUser, ...sbUser,
            pwd, active: sbUser.active ?? true };
          setAuth(u);
          setWrong(false);
          if (u.role==="delivery") setTab("orders");
          return;
        }
      }
    } catch(e) { console.warn("Login Supabase:", e.message); }
    // Fallback sur les données locales
    const u = users.find(x=>x.email===email&&x.active);
    if (u && pass===u.pwd) {
      setAuth(u);
      setWrong(false);
      if (u.role==="delivery") setTab("orders");
    } else setWrong(true);
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
    ...(auth.role!=="delivery" && can("view_stats") ? [{ key:"overview", icon:<BarChart2 size={14}/>, label:"Bilan" }] : []),
    { key:"orders", icon:<ShoppingCart size={14}/>, label:auth.role==="delivery"?"Livraisons":"Commandes" },
    ...(can("add_product") ? [{ key:"products", icon:<ShoppingBag size={14}/>, label:"Produits" }] : []),
    ...(auth.role!=="delivery" ? [{ key:"reviews", icon:<Star size={14}/>, label:"Avis" }] : []),
    ...(auth.role!=="delivery" ? [{ key:"clients", icon:<Heart size={14}/>, label:"Clientèle" }] : []),
    ...(auth.role==="admin"?[
      { key:"loyalty",  icon:<Tag size={14}/>,      label:"Fidélité" },
      { key:"cats",     icon:<Tag size={14}/>,      label:"Catégories" },
      { key:"team",     icon:<Users size={14}/>,    label:"Équipe" },
      { key:"settings", icon:<Settings size={14}/>, label:"Paramètres" },
    ]:[]),
    // Onglet Fondateur — réservé exclusivement à David (id:1)
    ...(auth.id===1 ? [{ key:"founder", icon:<Lock size={14}/>, label:"Fondateur" }] : []),
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
                  <span style={{ fontWeight:700, fontSize:13, color:text }}>
                    Notifications {unread>0 && `(${unread})`}
                  </span>
                  <div style={{ display:"flex", gap:8 }}>
                    {unread > 0 && (
                      <button onClick={() => setNotifs(n=>n.map(x=>({...x,read:true})))}
                        style={{ border:"none", background:"none", cursor:"pointer",
                          color:CA.gold, fontSize:11, fontWeight:600 }}>Tout lire</button>
                    )}
                    {notifs.some(n=>n.read) && (
                      <button onClick={() => {
                          setNotifs(n => {
                            const readStock = n.filter(x=>x.read && x.stockProductId).map(x=>x.stockProductId);
                            if (readStock.length) setDismissedStock(ds => [...ds, ...readStock]);
                            return n.filter(x=>!x.read);
                          });
                        }}
                        style={{ border:"none", background:"none", cursor:"pointer",
                          color:CA.danger, fontSize:11, fontWeight:600 }}>Effacer lues</button>
                    )}
                  </div>
                </div>
                <div style={{ maxHeight:"60vh", overflowY:"auto" }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding:"24px 16px", textAlign:"center",
                      color:CA.mute, fontSize:12.5 }}>
                      <Bell size={28} strokeWidth={1.3} style={{ opacity:.4 }}/>
                      <p style={{ marginTop:8 }}>Aucune notification</p>
                    </div>
                  ) : notifs.map(n => (
                    <div key={n.id}
                      style={{ padding:"10px 14px",
                        borderBottom:`1px solid ${bord}`,
                        background:n.read?"transparent":`${CA.gold}0A`,
                        display:"flex", alignItems:"flex-start", gap:8 }}>
                      <div style={{ flex:1, cursor:"pointer" }}
                        onClick={() => setNotifs(ns => ns.map(x => x.id===n.id ? {...x,read:true} : x))}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
                          {!n.read && <div style={{ width:7, height:7, borderRadius:999,
                            background:CA.gold, flexShrink:0, marginTop:5 }}/>}
                          <div style={{ fontSize:12.5, color:text, fontWeight:n.read?400:600, flex:1 }}>
                            {n.msg}
                          </div>
                        </div>
                        <div style={{ fontSize:10.5, color:CA.mute, marginTop:2,
                          marginLeft:n.read?0:13 }}>{timeAgo(n.time)}</div>
                      </div>
                      <button onClick={() => {
                          if (n.stockProductId) setDismissedStock(ds => [...ds, n.stockProductId]);
                          setNotifs(ns => ns.filter(x => x.id!==n.id));
                        }}
                        title="Supprimer"
                        style={{ flexShrink:0, border:"none", background:"none",
                          cursor:"pointer", color:CA.mute, padding:2 }}>
                        <X size={13}/>
                      </button>
                    </div>
                  ))}
                </div>
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
              {auth.id===1 ? "👑 ✦ Fondateur" : `${ROLES[auth.role]?.badge} ${ROLES[auth.role]?.label}`}
            </div>
          </div>
          {/* Dark mode */}
          {setDark && (
            <button onClick={() => setDark(v=>!v)} title={dark?"Mode clair":"Mode sombre"}
              style={{ border:`1px solid ${CA.gold}33`, background:"none",
                borderRadius:8, padding:"7px", cursor:"pointer",
                color:CA.gold, display:"grid", placeItems:"center" }}>
              {dark ? <Sun size={14}/> : <Moon size={14}/>}
            </button>
          )}
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
                        #{o.id} — {o.name||o.customer_name||"Client"}
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
                borderRadius:14, padding:"16px", marginBottom:14 }}>
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

              {/* Best-sellers automatiques calculés depuis les commandes */}
              {(() => {
                const salesCount = {};
                orders.filter(o=>o.status===3).forEach(o => {
                  (o.items||[]).forEach(item => {
                    const name = (item||"").split(" x")[0].replace(/ \(.*\)/,"").trim();
                    if (name) salesCount[name] = (salesCount[name]||0) + 1;
                  });
                });
                const ranked = Object.entries(salesCount)
                  .sort(([,a],[,b])=>b-a).slice(0,5);
                if (!ranked.length) return null;
                return (
                  <div style={{ background:cardBg, border:`1px solid ${bord}`,
                    borderRadius:14, padding:"16px" }}>
                    <h3 style={{ fontFamily:"Georgia,serif", fontSize:15,
                      color:text, margin:"0 0 12px" }}>🏆 Meilleures ventes</h3>
                    {ranked.map(([name, count], i) => (
                      <div key={name} style={{ display:"flex", alignItems:"center",
                        gap:10, padding:"8px 0",
                        borderBottom:i<ranked.length-1?`1px solid ${bord}`:"none" }}>
                        <span style={{ fontFamily:"Georgia,serif", fontSize:16,
                          color:CA.gold, fontWeight:700, width:22, flexShrink:0 }}>
                          {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`}
                        </span>
                        <span style={{ flex:1, fontSize:13, color:text }}>{name}</span>
                        <ABadge color={CA.success}>{count} vendu{count>1?"s":""}</ABadge>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>)}
          </div>
        )}

        {tab==="reviews" && auth.role!=="delivery" && (
          <AdminReviewsTab auth={auth} dark={dark}/>
        )}
        {tab==="clients" && auth.role!=="delivery" && (
          <AdminClientsTab orders={orders} dark={dark}/>
        )}
        {tab==="loyalty" && auth.role==="admin" && (
          <AdminLoyaltyTab cfg={cfg} setCfg={setCfg} orders={orders} dark={dark}/>
        )}
        {tab==="orders" && (
          <AdminOrdersTab orders={myOrders} setOrders={setOrders}
            trash={trash} setTrash={setTrash}
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
          <AdminTeamTab users={users} setUsers={setUsers} auth={auth} dark={dark}/>
        )}
        {tab==="settings" && auth.role==="admin" && (
          <AdminSettingsTab cfg={cfg} setCfg={setCfg}
            promos={promos} setPromos={setPromos} dark={dark}
            auth={auth} setAuth={setAuth} setUsers={setUsers}/>
        )}
        {tab==="founder" && auth.id===1 && (
          <AdminFounderTab cfg={cfg} setCfg={setCfg} dark={dark}/>
        )}
      </div>
    </div>
  );
}