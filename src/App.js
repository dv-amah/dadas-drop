import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShoppingBag, Search, X, Plus, Minus, Trash2, Heart, SlidersHorizontal,
  ChevronDown, Check, MessageCircle, Truck, Smartphone, Sparkles,
  ArrowRight, ShieldCheck, Phone, Sun, Moon, ChevronLeft, ChevronRight,
  Package, MapPin, Star, Bell, Copy, CheckCircle, Globe
} from "lucide-react";

/* ─── CONFIG ────────────────────────────────────────────────────── */
const CFG = {
  brand: "DADA'S DROP",
  sub: "Collection Premium",
  whatsapp: "22670000000",
  orangeMoney: "+226 70 00 00 00",
  moovMoney: "+226 60 00 00 00",
  wave:      "+226 77 00 00 00",
  city: "Ouagadougou",
  freeShippingFrom: 20000,
};

/* ─── PALETTE OR & NOIR ─────────────────────────────────────────── */
/* ═══════════════════════════════
   🎨 PALETTE FIGÉE — NE PAS MODIFIER
   Palette 2 : Rose & Crème
   ═══════════════════════════════ */
const C = {
  pink:    "#E8175D",   // rose vif principal
  pinkL:   "#FF8FAB",  // rose clair / secondaire
  pinkBg:  "#FDE8EF",  // fond rosé léger
  ink:     "#1A1A1A",  // texte principal
  inkSoft: "#4A3A3E",  // texte secondaire
  bg:      "#FFF5F0",  // fond général crème
  card:    "#FFFFFF",  // fond carte
  border:  "#FDE8EF",  // bordures
  mute:    "#9A7A82",  // texte discret
  // ── dark mode ──
  dBg:     "#1A0A14",  // fond sombre
  dCard:   "#280D1C",  // carte sombre
  dBorder: "#3D1828",  // bordure sombre
  dMute:   "#8A6070",  // texte discret sombre
  dText:   "#FAF0F3",  // texte clair sombre
};

const GRAD  = "linear-gradient(135deg, #E8175D 0%, #FF8FAB 100%)";
const GRADR = "linear-gradient(135deg, #FF8FAB 0%, #E8175D 100%)";


/* ─── TRADUCTIONS ───────────────────────────────────────────────── */
const T = {
  fr: {
    search:"Rechercher un article, une marque…", cart:"Mon panier", empty:"Ton panier est vide.",
    emptyHint:"Ajoute un article pour commencer 👜", order:"Commander", total:"Total",
    finalize:"Finalise ta commande", name:"Nom complet *", phone:"Téléphone (WhatsApp) *",
    city:"Ville *", district:"Quartier / adresse", payment:"Mode de paiement",
    orange:"Orange Money", moov:"Moov Money", wave:"Wave", delivery:"Paiement à la livraison",
    deliverySub:"Tu paies en recevant ton colis", send:"Envoyer sur WhatsApp",
    sent:"Commande envoyée !", sentMsg:"Ta commande s'ouvre dans WhatsApp.",
    capture:"N'oublie pas d'envoyer ta capture de paiement.",
    locMsg:"📍 Envoie ta localisation WhatsApp pour estimer les frais de livraison.",
    shippingNote:"Frais de livraison à ta charge selon ta zone. Livraison gratuite dès",
    close:"Fermer", inStock:"En stock", outStock:"Épuisé", lowStock:"Plus que",
    newBadge:"New", bestSeller:"Best-sellers",
    heroTitle:"Des pièces qui font tourner les têtes.",
    heroSub:"Sacs, accessoires & mode importés, livrés à",
    heroCTA:"Voir la collection", appBanner:"📱 Application bientôt disponible sur",
    trackOrder:"Suivre ma commande", trackTitle:"Suivi de commande",
    trackInput:"Numéro de commande", trackBtn:"Suivre",
    trackNotFound:"Commande introuvable. Vérifie le numéro.",
    statusPrep:"En préparation", statusShip:"Expédiée", statusDeliv:"Livrée",
    comment:"Laisser un commentaire", commentPlaceholder:"Ton avis sur ta commande…",
    commentSend:"Envoyer l'avis", freeShip:"Livraison gratuite dès",
    filterAll:"Tout", sortNew:"Nouveautés", sortAsc:"Prix croissant", sortDesc:"Prix décroissant",
    itemCount:"article", addCart:"Ajouter au panier", qty:"Quantité", desc:"Description",
    noResult:"Aucun article trouvé.", noResultHint:"Essaie un autre mot ou une autre catégorie.",
    whatsappFloat:"Nous contacter", lang:"EN",
  },
  en: {
    search:"Search an item, brand…", cart:"My cart", empty:"Your cart is empty.",
    emptyHint:"Add an item to get started 👜", order:"Checkout", total:"Total",
    finalize:"Finalize your order", name:"Full name *", phone:"Phone (WhatsApp) *",
    city:"City *", district:"Neighbourhood / address", payment:"Payment method",
    orange:"Orange Money", moov:"Moov Money", wave:"Wave", delivery:"Pay on delivery",
    deliverySub:"You pay when you receive your order", send:"Send via WhatsApp",
    sent:"Order sent!", sentMsg:"Your order opens in WhatsApp.",
    capture:"Don't forget to send your payment screenshot.",
    locMsg:"📍 Send your WhatsApp location so we can estimate delivery fees.",
    shippingNote:"Delivery fees apply based on your area. Free shipping from",
    close:"Close", inStock:"In stock", outStock:"Out of stock", lowStock:"Only",
    newBadge:"New", bestSeller:"Best sellers",
    heroTitle:"Pieces that turn heads.",
    heroSub:"Imported bags, accessories & fashion, delivered in",
    heroCTA:"Shop the collection", appBanner:"📱 App coming soon on",
    trackOrder:"Track my order", trackTitle:"Order tracking",
    trackInput:"Order number", trackBtn:"Track",
    trackNotFound:"Order not found. Check the number.",
    statusPrep:"Preparing", statusShip:"Shipped", statusDeliv:"Delivered",
    comment:"Leave a review", commentPlaceholder:"Your thoughts on your order…",
    commentSend:"Send review", freeShip:"Free shipping from",
    filterAll:"All", sortNew:"New arrivals", sortAsc:"Price: low to high", sortDesc:"Price: high to low",
    itemCount:"item", addCart:"Add to cart", qty:"Quantity", desc:"Description",
    noResult:"No items found.", noResultHint:"Try another keyword or category.",
    whatsappFloat:"Contact us", lang:"FR",
  },
};

/* ─── CATALOGUE ─────────────────────────────────────────────────── */
const CATS_FR = ["Tout","Sacs à main","Bandoulières","Pochettes","Chaussures","Bijoux","Parfums","Gloss","Vêtements"];
const CATS_EN = ["All","Handbags","Shoulder bags","Clutches","Shoes","Jewellery","Perfumes","Gloss","Clothing"];

/* ═══════════════════════════════════════════════════════════════
   📦 GUIDE — COMMENT AJOUTER UN PRODUIT OU UNE MARQUE
   ═══════════════════════════════════════════════════════════════

   1️⃣  Copie une ligne existante ci-dessous (ex : la ligne id:1)
   2️⃣  Change l'id (mets le prochain numéro, ex: 11, 12...)
   3️⃣  Remplis les champs :
       name      → Nom du produit en français
       nameEn    → Nom en anglais
       brand     → Marque (ex: "Coach", "Zara", "Nike", "Dior"...)
       price     → Prix en FCFA (nombre entier, sans espace)
       cat       → Catégorie FR exacte parmi :
                   "Sacs à main" | "Bandoulières" | "Pochettes"
                   "Chaussures"  | "Bijoux"        | "Parfums"
                   "Gloss"       | "Vêtements"
       catEn     → Catégorie EN exacte parmi :
                   "Handbags" | "Shoulder bags" | "Clutches"
                   "Shoes"    | "Jewellery"     | "Perfumes"
                   "Gloss"    | "Clothing"
       stock     → Nombre de pièces disponibles (0 = épuisé)
       isNew     → true si c'est une nouveauté, false sinon
       isBest    → true si c'est un best-seller, false sinon
       accent    → 2 couleurs pour le dégradé placeholder
                   (remplacé par tes vraies photos plus tard)
       desc      → Description courte en français
       descEn    → Description courte en anglais
       imgs      → (optionnel) Liens vers tes photos :
                   imgs: ["https://lien-photo1.jpg", "https://lien-photo2.jpg"]

   ✅  EXEMPLE — Ajouter un sac Nike :
       { id:11, name:"Sac Sport Nike", nameEn:"Nike Sport Bag",
         brand:"Nike", price:15000,
         cat:"Sacs à main", catEn:"Handbags",
         stock:3, isNew:true, isBest:false,
         accent:["#111","#E5E5E5"],
         desc:"Sac sport léger et résistant.",
         descEn:"Light and durable sports bag." },

   ⚠️  N'oublie pas la virgule à la fin de chaque ligne !
═══════════════════════════════════════════════════════════════ */
const PRODUCTS = [
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
    desc:"Sac Torry Coach disponible en 4 coloris : camel, beige, noir & camel/blanc. Précise ta couleur dans la commande.",
    descEn:"Coach Torry bag in 4 colors: camel, beige, black & camel/white. Specify your color when ordering." },

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
    desc:"L'iconique Tabby Coach matelassé, chaîne dorée. Disponible en 8 coloris : denim, daisy, marron, bordeaux, blanc, noir, bleu ciel. Précise ta couleur.",
    descEn:"The iconic quilted Coach Tabby, gold chain. 8 colors available: denim, daisy, brown, burgundy, white, black, sky blue. Specify your color." },
];

const DEMO_ORDERS = {
  "DD-001":{ status:1, name:"Awa Traoré",   items:["Sac Tote Élégance x1"],                        total:28000, date:"10/06/2025" },
  "DD-002":{ status:2, name:"Fatou Diallo", items:["Mini Sac Bandoulière x2"],                     total:38000, date:"12/06/2025" },
  "DD-003":{ status:3, name:"Mariam Koné",  items:["Pochette Soirée x1","Mini Pochette Soirée x1"],total:23000, date:"08/06/2025" },
};

const fcfa = (n) => n.toLocaleString("fr-FR") + " FCFA";

/* ─── LOGO ──────────────────────────────────────────────────────── */
function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
      <div style={{ background:"#1A0A14", borderRadius:10, padding:"5px 13px", display:"flex", flexDirection:"column", alignItems:"center", boxShadow:`0 4px 16px rgba(232,23,93,.2)`, border:`1px solid ${C.pink}22` }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:6.5, color:'#FF8FAB', letterSpacing:4, textTransform:"uppercase" }}>Collection Premium</span>
        <span style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:"#fff", letterSpacing:2, lineHeight:1.25 }}>DADA'S DROP</span>
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:1 }}>
          <div style={{ width:20, height:0.6, background:'#FF8FAB' }} />
          <span style={{ fontFamily:"Georgia,serif", fontSize:5, color:'#FF8FAB', letterSpacing:3 }}>✦ OUAGA ✦</span>
          <div style={{ width:20, height:0.6, background:'#FF8FAB' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── THUMB ─────────────────────────────────────────────────────── */
function Thumb({ p, idx=0 }) {
  if (p.imgs && p.imgs[idx]) return <img src={p.imgs[idx]} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>;
  return (
    <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg,${p.accent[0]},${p.accent[1]})`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
      <ShoppingBag size={50} color="rgba(255,255,255,.85)" strokeWidth={1.3} />
      <span style={{ position:"absolute", bottom:8, right:10, color:"rgba(255,255,255,.8)", fontSize:9.5, fontWeight:700, letterSpacing:.5, textTransform:"uppercase" }}>{p.brand}</span>
    </div>
  );
}

/* ─── CARROUSEL ─────────────────────────────────────────────────── */
function Carousel({ p }) {
  const [idx, setIdx] = useState(0);
  const total = p.imgs ? p.imgs.length : 3;
  return (
    <div style={{ position:"relative", aspectRatio:"4/3", borderRadius:14, overflow:"hidden", background:C.pinkBg }}>
      <Thumb p={p} idx={idx} />
      {total > 1 && (<>
        <button onClick={() => setIdx((i)=>(i-1+total)%total)} style={arrowBtn("left")}><ChevronLeft size={17}/></button>
        <button onClick={() => setIdx((i)=>(i+1)%total)} style={arrowBtn("right")}><ChevronRight size={17}/></button>
        <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", display:"flex", gap:5 }}>
          {Array.from({length:total}).map((_,i)=>(
            <button key={i} onClick={()=>setIdx(i)} style={{ width:i===idx?16:5, height:5, borderRadius:999, border:"none", background:i===idx?C.pink:"rgba(255,255,255,.55)", cursor:"pointer", transition:"all .2s", padding:0 }}/>
          ))}
        </div>
      </>)}
    </div>
  );
}
const arrowBtn=(side)=>({ position:"absolute", top:"50%", [side]:8, transform:"translateY(-50%)", width:30, height:30, borderRadius:999, border:"none", background:"rgba(255,255,255,.92)", cursor:"pointer", display:"grid", placeItems:"center", boxShadow:"0 2px 8px rgba(0,0,0,.12)" });

/* ─── CARTE PRODUIT ─────────────────────────────────────────────── */
function ProductCard({ p, t, onOpen, onAdd, dark, idx, mounted }) {
  const [fav, setFav] = useState(false);
  const out = p.stock === 0;
  const low = p.stock > 0 && p.stock <= 2;
  const bg    = dark ? C.dCard   : C.card;
  const bord  = dark ? C.dBorder : C.border;
  const text  = dark ? C.dText   : C.ink;
  return (
    <div onClick={()=>onOpen(p)} className="dd-card" style={{ background:bg, borderRadius:18, overflow:"hidden", border:`1px solid ${bord}`, cursor:"pointer", position:"relative", opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(14px)", transition:`opacity .5s ${idx*50}ms, transform .5s ${idx*50}ms, box-shadow .2s` }}>
      <div style={{ position:"relative", aspectRatio:"1/1", background:dark?"#1A1510":C.pinkBg }}>
        <Thumb p={p}/>
        <div style={{ position:"absolute", top:8, left:8, display:"flex", flexDirection:"column", gap:3 }}>
          {p.isNew && <span style={{ background:"#1A1A1A", color:C.pink, fontSize:9.5, fontWeight:700, padding:"3px 7px", borderRadius:999, letterSpacing:.5, border:`1px solid ${C.pink}44` }}>{t.newBadge}</span>}
          {p.isBest && <span style={{ background:C.pink, color:C.ink, fontSize:9.5, fontWeight:700, padding:"3px 7px", borderRadius:999 }}>⭐ Top</span>}
        </div>
        {out && <span style={{ position:"absolute", top:8, right:8, background:"rgba(26,26,26,.85)", color:"#fff", fontSize:9.5, fontWeight:700, padding:"3px 8px", borderRadius:999 }}>{t.outStock}</span>}
        {low && <span style={{ position:"absolute", top:8, right:8, background:C.pink, color:C.ink, fontSize:9.5, fontWeight:700, padding:"3px 8px", borderRadius:999 }}>{t.lowStock} {p.stock}!</span>}
        <button onClick={(e)=>{e.stopPropagation();setFav(v=>!v);}} aria-label="Favori" style={{ position:"absolute", bottom:8, right:8, width:28, height:28, borderRadius:999, border:"none", background:"rgba(255,255,255,.9)", display:"grid", placeItems:"center", cursor:"pointer" }}>
          <Heart size={14} color={fav?C.pink:"#999"} fill={fav?C.pink:"none"}/>
        </button>
      </div>
      <div style={{ padding:"10px 12px 13px" }}>
        <div style={{ fontSize:9.5, fontWeight:700, color:C.pink, letterSpacing:.5, textTransform:"uppercase" }}>{p.brand}</div>
        <div style={{ fontWeight:600, color:text, margin:"2px 0 7px", fontSize:13.5, lineHeight:1.25 }}>{p.name}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontWeight:800, fontSize:14, color:text }}>{fcfa(p.price)}</span>
          <button disabled={out} onClick={(e)=>{e.stopPropagation();onAdd(p);}} aria-label={t.addCart} style={{ width:34, height:34, borderRadius:10, border:"none", background:out?"#ddd":C.ink, color:out?"#999":C.pink, cursor:out?"not-allowed":"pointer", display:"grid", placeItems:"center", boxShadow:out?"none":`0 4px 12px rgba(0,0,0,.25)` }}>
            <Plus size={17}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── FICHE PRODUIT ─────────────────────────────────────────────── */
function ProductModal({ p, t, onClose, onAdd, dark }) {
  const [qty, setQty] = useState(1);
  if (!p) return null;
  const out  = p.stock === 0;
  const text = dark ? C.dText : C.ink;
  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:500, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={sheetStyle(dark)}>
          <button onClick={onClose} style={closeBtnStyle(dark)} aria-label={t.close}><X size={17}/></button>
          <Carousel p={p}/>
          <div style={{ marginTop:13 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.pink, letterSpacing:.5, textTransform:"uppercase" }}>{p.brand}</div>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:21, fontWeight:700, color:text, margin:"3px 0 2px" }}>{p.name}</h3>
            <div style={{ fontWeight:800, fontSize:19, color:C.pink, margin:"0 0 9px" }}>{fcfa(p.price)}</div>
            <p style={{ color:dark?C.dMute:C.mute, fontSize:13.5, lineHeight:1.55, margin:"0 0 11px" }}>{p.desc}</p>
            <div style={{ fontSize:12, color:out?"#999":"#1A9E5E", fontWeight:600, marginBottom:13 }}>{out?t.outStock:`${t.inStock} · ${p.stock} disponible${p.stock>1?"s":""}`}</div>
            {!out && (
              <div style={{ display:"flex", gap:9, alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", border:`1px solid ${dark?C.dBorder:C.border}`, borderRadius:10, overflow:"hidden" }}>
                  <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={stepBtnStyle(dark)}><Minus size={14}/></button>
                  <span style={{ width:32, textAlign:"center", fontWeight:700, color:text }}>{qty}</span>
                  <button onClick={()=>setQty(q=>Math.min(p.stock,q+1))} style={stepBtnStyle(dark)}><Plus size={14}/></button>
                </div>
                <button onClick={()=>{onAdd(p,qty);onClose();}} style={{ flex:1, ...primaryBtnStyle, justifyContent:"center", gap:7 }}>
                  <ShoppingBag size={16}/> {t.addCart}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ─── PANIER ────────────────────────────────────────────────────── */
function CartDrawer({ open, cart, onClose, onQty, onRemove, onCheckout, t, dark }) {
  const lines = cart.map(it=>({ ...PRODUCTS.find(p=>p.id===it.id), qty:it.qty }));
  const total = lines.reduce((s,l)=>s+l.price*l.qty,0);
  const freeShip = total >= CFG.freeShippingFrom;
  const bg   = dark ? C.dBg    : "#fff";
  const bord = dark ? C.dBorder: C.border;
  const text = dark ? C.dText  : C.ink;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:60, opacity:open?1:0, pointerEvents:open?"auto":"none", transition:"opacity .3s" }}/>
      <aside style={{ position:"fixed", top:0, right:0, height:"100%", width:"min(390px,92vw)", background:bg, zIndex:61, transform:open?"translateX(0)":"translateX(105%)", transition:"transform .35s cubic-bezier(.2,.8,.2,1)", display:"flex", flexDirection:"column", boxShadow:"-8px 0 36px rgba(0,0,0,.18)" }}>
        <div style={{ padding:"15px 17px", borderBottom:`1px solid ${bord}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <strong style={{ fontFamily:"Georgia,serif", fontSize:17, color:text }}>{t.cart}</strong>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:text }}><X size={21}/></button>
        </div>
        {freeShip && (
          <div style={{ background:"#FDE8EF", color:"#E8175D", padding:"7px 15px", fontSize:12, fontWeight:700, textAlign:"center", letterSpacing:.3 }}>
            ✦ {t.freeShip} {fcfa(CFG.freeShippingFrom)} — offerte !
          </div>
        )}
        <div style={{ flex:1, overflowY:"auto", padding:13 }}>
          {lines.length===0?(
            <div style={{ textAlign:"center", color:dark?C.dMute:"#bbb", marginTop:55 }}>
              <ShoppingBag size={40} strokeWidth={1.2}/>
              <p style={{ marginTop:11, fontSize:13.5 }}>{t.empty}<br/>{t.emptyHint}</p>
            </div>
          ):lines.map(l=>(
            <div key={l.id} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom:`1px solid ${bord}` }}>
              <div style={{ width:58, height:58, borderRadius:10, overflow:"hidden", flexShrink:0 }}><Thumb p={l}/></div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13, color:text }}>{l.name}</div>
                <div style={{ fontSize:12.5, color:C.pink, fontWeight:700 }}>{fcfa(l.price)}</div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:4 }}>
                  <div style={{ display:"flex", alignItems:"center", border:`1px solid ${bord}`, borderRadius:7 }}>
                    <button onClick={()=>onQty(l.id,l.qty-1)} style={stepBtnSmStyle(dark)}><Minus size={11}/></button>
                    <span style={{ width:22, textAlign:"center", fontSize:12, fontWeight:700, color:text }}>{l.qty}</span>
                    <button onClick={()=>onQty(l.id,Math.min(l.stock,l.qty+1))} style={stepBtnSmStyle(dark)}><Plus size={11}/></button>
                  </div>
                  <button onClick={()=>onRemove(l.id)} style={{ border:"none", background:"none", cursor:"pointer", color:"#bbb" }}><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {lines.length>0&&(
          <div style={{ padding:15, borderTop:`1px solid ${bord}` }}>
            {!freeShip&&<p style={{ fontSize:11.5, color:C.pink, margin:"0 0 7px", fontWeight:500 }}>⚡ {t.shippingNote} {fcfa(CFG.freeShippingFrom)}.</p>}
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:11 }}>
              <span style={{ color:dark?C.dMute:C.mute, fontSize:14 }}>{t.total}</span>
              <strong style={{ fontFamily:"Georgia,serif", fontSize:18, color:text }}>{fcfa(total)}</strong>
            </div>
            <button onClick={onCheckout} style={{ width:"100%", ...primaryBtnStyle, justifyContent:"center" }}>
              {t.order} <ArrowRight size={16}/>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ─── CHECKOUT ──────────────────────────────────────────────────── */
function Checkout({ open, lines, total, onClose, t, dark }) {
  const [form, setForm] = useState({ nom:"", tel:"", ville:CFG.city, adresse:"", note:"" });
  const [pay, setPay] = useState("orange");
  const [sent, setSent] = useState(false);
  const [orderNum] = useState(()=>"DD-"+String(Math.floor(Math.random()*9000)+1000));
  const [copied, setCopied] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const valid = form.nom.trim() && form.tel.trim() && form.ville.trim();
  if (!open) return null;
  const payLabels = { orange:t.orange, moov:t.moov, wave:t.wave, livraison:t.delivery };
  const send = () => {
    const items = lines.map(l=>`• ${l.qty}x ${l.name} (${l.brand}) — ${fcfa(l.price*l.qty)}`).join("\n");
    const msg =
`Bonjour ${CFG.brand} 👋 Commande #${orderNum}

${items}

💰 Total : ${fcfa(total)}
💳 Paiement : ${payLabels[pay]}

— Informations —
Nom : ${form.nom}
Tél : ${form.tel}
Ville : ${form.ville}
Adresse : ${form.adresse||"—"}
Note : ${form.note||"—"}

📍 J'envoie ma localisation WhatsApp pour la livraison.${pay!=="livraison"?"\n✅ Je joins la capture du paiement.":""}`;
    window.open(`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");
    setSent(true);
  };
  const copy = () => { navigator.clipboard?.writeText(orderNum).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const text = dark ? C.dText : C.ink;
  const bord = dark ? C.dBorder : C.border;
  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:450, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"90vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)} aria-label={t.close}><X size={17}/></button>
          {sent?(
            <div style={{ textAlign:"center", padding:"6px 0" }}>
              <div style={{ width:56, height:56, borderRadius:999, background:"#E8F8EF", display:"grid", placeItems:"center", margin:"0 auto 11px" }}>
                <Check size={26} color="#1A9E5E"/>
              </div>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:20, color:text, margin:"0 0 5px" }}>{t.sent}</h3>
              <p style={{ color:dark?C.dMute:C.mute, fontSize:13.5, lineHeight:1.5, margin:"0 0 13px" }}>{t.sentMsg} {pay!=="livraison"&&t.capture}</p>
              <div style={{ background:dark?"#1A1510":C.pinkBg, border:`1px solid ${C.pink}44`, borderRadius:11, padding:"11px 14px", marginBottom:13 }}>
                <div style={{ fontSize:10.5, color:dark?C.dMute:C.mute, marginBottom:3 }}>Numéro de commande</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
                  <strong style={{ fontFamily:"Georgia,serif", fontSize:19, color:C.pink }}>{orderNum}</strong>
                  <button onClick={copy} style={{ border:"none", background:"none", cursor:"pointer", color:C.pink }}>
                    {copied?<CheckCircle size={17}/>:<Copy size={17}/>}
                  </button>
                </div>
                <div style={{ fontSize:11, color:dark?C.dMute:C.mute, marginTop:3 }}>Garde ce numéro pour suivre ta commande</div>
              </div>
              <button onClick={onClose} style={{ ...primaryBtnStyle, width:"100%", justifyContent:"center" }}>{t.close}</button>
            </div>
          ):(
            <>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:19, color:text, margin:"0 0 3px" }}>{t.finalize}</h3>
              <p style={{ color:C.pink, fontWeight:700, fontSize:13.5, margin:"0 0 13px" }}>{t.total} : {fcfa(total)}</p>
              <div style={{ background:dark?"#1A1510":C.pinkBg, border:`1px solid ${C.pink}33`, borderRadius:10, padding:"8px 11px", fontSize:12, color:dark?C.dMute:C.mute, marginBottom:13 }}>
                ⚠️ {t.shippingNote} {fcfa(CFG.freeShippingFrom)}.
              </div>
              <Field label={t.name} dark={dark}><input style={inpStyle(dark)} value={form.nom} onChange={set("nom")} placeholder="Ex : Awa Traoré"/></Field>
              <Field label={t.phone} dark={dark}><input style={inpStyle(dark)} value={form.tel} onChange={set("tel")} placeholder="Ex : 70 00 00 00"/></Field>
              <div style={{ display:"flex", gap:9 }}>
                <Field label={t.city} dark={dark} flex><input style={inpStyle(dark)} value={form.ville} onChange={set("ville")}/></Field>
                <Field label={t.district} dark={dark} flex><input style={inpStyle(dark)} value={form.adresse} onChange={set("adresse")} placeholder="Ex : Karpala"/></Field>
              </div>
              <div style={{ fontSize:12, color:C.pink, fontWeight:600, marginBottom:11 }}>{t.locMsg}</div>
              <div style={{ fontSize:12.5, fontWeight:700, color:text, margin:"7px 0 7px" }}>{t.payment}</div>
              {[
                { key:"orange",   icon:<Smartphone size={16} color="#FF6A00"/>, title:t.orange, sub:`Envoyer au ${CFG.orangeMoney}` },
                { key:"moov",     icon:<Smartphone size={16} color="#0066B3"/>, title:t.moov,   sub:`Envoyer au ${CFG.moovMoney}` },
                { key:"wave",     icon:<Smartphone size={16} color="#1DC0D4"/>, title:"Wave",      sub:`Envoyer au ${CFG.wave}` },
                { key:"livraison",icon:<Truck size={16} color={C.pink}/>,       title:t.delivery, sub:t.deliverySub },
              ].map(({key,icon,title,sub})=>(
                <PayOpt key={key} active={pay===key} onClick={()=>setPay(key)} icon={icon} title={title} sub={sub} dark={dark}/>
              ))}
              {pay!=="livraison"&&(
                <div style={{ background:dark?"#1A1510":C.pinkBg, border:`1px solid ${C.pink}33`, borderRadius:10, padding:"8px 11px", fontSize:12, color:dark?C.dMute:C.mute, margin:"9px 0 3px" }}>
                  Fais le transfert et envoie la <strong>capture d'écran</strong> dans WhatsApp. On valide et on prépare ton colis 📦
                </div>
              )}
              <button onClick={send} disabled={!valid} style={{ width:"100%", marginTop:13, justifyContent:"center", background:"#25D366", color:"#fff", border:"none", borderRadius:11, padding:"12px 16px", fontWeight:700, fontSize:14, cursor:valid?"pointer":"not-allowed", display:"flex", alignItems:"center", gap:7, boxShadow:"0 6px 16px rgba(37,211,102,.3)", opacity:valid?1:.5 }}>
                <MessageCircle size={17}/> {t.send}
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ─── SUIVI COMMANDE ────────────────────────────────────────────── */
function TrackModal({ open, onClose, t, dark }) {
  const [num, setNum] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(false);
  if (!open) return null;
  const text  = dark ? C.dText   : C.ink;
  const bord  = dark ? C.dBorder : C.border;
  const steps = [t.statusPrep, t.statusShip, t.statusDeliv];
  const icons = [<Package size={14}/>, <Truck size={14}/>, <MapPin size={14}/>];
  const track = () => {
    const o = DEMO_ORDERS[num.toUpperCase()];
    if (o){ setResult(o); setNotFound(false); } else { setResult(null); setNotFound(true); }
  };
  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:430, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"88vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)} aria-label={t.close}><X size={17}/></button>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:19, color:text, margin:"0 0 13px" }}>{t.trackTitle}</h3>
          <div style={{ display:"flex", gap:8 }}>
            <input value={num} onChange={e=>setNum(e.target.value)} placeholder="Ex : DD-001" style={{ ...inpStyle(dark), flex:1 }} onKeyDown={e=>e.key==="Enter"&&track()}/>
            <button onClick={track} style={{ ...primaryBtnStyle, padding:"10px 16px" }}>{t.trackBtn}</button>
          </div>
          {notFound&&<p style={{ color:"#E05030", fontSize:13, marginTop:9 }}>{t.trackNotFound}</p>}
          {result&&(
            <div style={{ marginTop:16 }}>
              <div style={{ background:dark?"#1A1510":C.pinkBg, border:`1px solid ${C.pink}33`, borderRadius:12, padding:"12px 14px", marginBottom:15 }}>
                <div style={{ fontWeight:700, color:text, marginBottom:3 }}>Commande {num.toUpperCase()}</div>
                {result.items.map((item,i)=><div key={i} style={{ fontSize:12.5, color:dark?C.dMute:C.mute }}>• {item}</div>)}
                <div style={{ fontSize:13, fontWeight:700, color:C.pink, marginTop:5 }}>{fcfa(result.total)}</div>
              </div>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:15, position:"relative" }}>
                <div style={{ position:"absolute", top:15, left:"10%", right:"10%", height:2.5, background:dark?C.dBorder:C.border, zIndex:0 }}>
                  <div style={{ height:"100%", width:`${((result.status-1)/2)*100}%`, background:GRAD, transition:"width .6s ease", borderRadius:99 }}/>
                </div>
                {steps.map((s,i)=>{
                  const done=i<result.status; const active=i===result.status-1;
                  return (
                    <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, zIndex:1, flex:1 }}>
                      <div style={{ width:30, height:30, borderRadius:999, background:done?C.ink:(dark?C.dBorder:C.border), display:"grid", placeItems:"center", boxShadow:active?`0 0 0 4px #E8175D33`:"none", border:done?`2px solid ${C.pink}`:"none", transition:"all .4s" }}>
                        <span style={{ color:done?C.pink:(dark?C.dMute:"#bbb") }}>{icons[i]}</span>
                      </div>
                      <span style={{ fontSize:10.5, fontWeight:active?700:400, color:done?text:"#bbb", textAlign:"center" }}>{s}</span>
                    </div>
                  );
                })}
              </div>
              {result.status===3&&(
                <div style={{ marginTop:3 }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:text, marginBottom:5 }}>{t.comment}</div>
                  {commentSent?(
                    <div style={{ display:"flex", alignItems:"center", gap:7, color:"#1A9E5E", fontSize:13, fontWeight:600 }}>
                      <CheckCircle size={17}/> Merci pour ton avis ! ✦
                    </div>
                  ):(<>
                    <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder={t.commentPlaceholder} rows={3} style={{ ...inpStyle(dark), resize:"vertical" }}/>
                    <button onClick={()=>setCommentSent(true)} disabled={!comment.trim()} style={{ ...primaryBtnStyle, marginTop:7, justifyContent:"center", width:"100%", opacity:comment.trim()?1:.5 }}>
                      <Star size={15}/> {t.commentSend}
                    </button>
                  </>)}
                </div>
              )}
              <p style={{ fontSize:11, color:dark?C.dMute:"#bbb", marginTop:13, textAlign:"center" }}>
                💡 Essaie DD-001, DD-002 ou DD-003 pour la démo
              </p>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ─── OVERLAY ───────────────────────────────────────────────────── */
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70, background:"rgba(0,0,0,.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:14, animation:"ddFade .22s ease" }}>
      {children}
    </div>
  );
}

/* ─── COMPOSANTS FORMULAIRE ─────────────────────────────────────── */
const Field = ({ label, children, dark, flex }) => (
  <label style={{ display:"block", marginBottom:10, flex:flex?1:"none" }}>
    <span style={{ fontSize:11.5, fontWeight:600, color:dark?C.dText:C.ink, display:"block", marginBottom:4 }}>{label}</span>
    {children}
  </label>
);
const PayOpt = ({ active, onClick, icon, title, sub, dark }) => (
  <button onClick={onClick} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 11px", marginBottom:6, borderRadius:11, cursor:"pointer", textAlign:"left", border:`1.5px solid ${active?C.pink:(dark?C.dBorder:C.border)}`, background:active?(dark?"#1A1510":C.pinkBg):(dark?C.dCard:"#fff") }}>
    <span style={{ width:30, height:30, borderRadius:8, background:dark?C.dBorder:C.pinkBg, display:"grid", placeItems:"center" }}>{icon}</span>
    <span style={{ flex:1 }}>
      <span style={{ display:"block", fontWeight:700, fontSize:13, color:dark?C.dText:C.ink }}>{title}</span>
      <span style={{ display:"block", fontSize:11.5, color:dark?C.dMute:C.mute }}>{sub}</span>
    </span>
    <span style={{ width:17, height:17, borderRadius:999, border:`2px solid ${active?C.pink:(dark?C.dBorder:"#ddd")}`, display:"grid", placeItems:"center" }}>
      {active&&<span style={{ width:8, height:8, borderRadius:999, background:C.pink }}/>}
    </span>
  </button>
);

/* ─── STYLES PARTAGÉS ───────────────────────────────────────────── */
const sheetStyle  = dark => ({ background:dark?C.dCard:"#fff", borderRadius:18, padding:20, position:"relative", boxShadow:"0 24px 56px rgba(0,0,0,.28)" });
const closeBtnStyle = dark => ({ position:"absolute", top:12, right:12, width:32, height:32, borderRadius:999, border:"none", background:dark?C.dBorder:C.pinkBg, cursor:"pointer", display:"grid", placeItems:"center", color:dark?C.dText:C.ink, zIndex:2 });
const stepBtnStyle  = dark => ({ width:34, height:37, border:"none", background:dark?C.dBorder:C.pinkBg, cursor:"pointer", display:"grid", placeItems:"center", color:dark?C.dText:C.ink });
const stepBtnSmStyle= dark => ({ width:24, height:24, border:"none", background:dark?C.dBorder:C.pinkBg, cursor:"pointer", display:"grid", placeItems:"center", color:dark?C.dText:C.ink });
const primaryBtnStyle = { display:"inline-flex", alignItems:"center", gap:7, background:"linear-gradient(135deg,#E8175D,#FF8FAB)", color:"#fff", border:"none", borderRadius:11, padding:"11px 17px", fontWeight:700, fontSize:13.5, cursor:"pointer", boxShadow:"0 4px 14px rgba(0,0,0,.25)" };
const inpStyle = dark => ({ width:"100%", padding:"9px 11px", borderRadius:9, border:`1.5px solid ${dark?C.dBorder:C.border}`, background:dark?C.dCard:"#fff", fontSize:13, color:dark?C.dText:C.ink, fontFamily:"inherit" });

/* ─── APP ───────────────────────────────────────────────────────── */
export default function DadasDrop() {
  const [lang, setLang]       = useState("fr");
  const [dark, setDark]       = useState(false);
  const [query, setQuery]     = useState("");
  const [cat, setCat]         = useState(0);
  const [sort, setSort]       = useState("new");
  const [inStock, setInStock] = useState(false);
  const [cart, setCart]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(()=>{ const id=setTimeout(()=>setMounted(true),80); return ()=>clearTimeout(id); },[]);

  const t    = T[lang];
  const CATS = lang==="fr" ? CATS_FR : CATS_EN;

  const list = useMemo(()=>{
    let r = PRODUCTS.filter(p=>{
      if(cat>0){ const cn=lang==="fr"?p.cat:p.catEn; if(cn!==CATS[cat]) return false; }
      if(inStock && p.stock===0) return false;
      const q=query.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    });
    if(sort==="asc")  r=[...r].sort((a,b)=>a.price-b.price);
    if(sort==="desc") r=[...r].sort((a,b)=>b.price-a.price);
    return r;
  },[query,cat,sort,inStock,lang]);

  const bestSellers = PRODUCTS.filter(p=>p.isBest&&p.stock>0).slice(0,4);

  const addToCart = useCallback((p,qty=1)=>{
    setCart(c=>{ const ex=c.find(i=>i.id===p.id); if(ex) return c.map(i=>i.id===p.id?{...i,qty:Math.min(p.stock,i.qty+qty)}:i); return [...c,{id:p.id,qty}]; });
    setCartOpen(true);
  },[]);
  const setQty    = (id,qty) => setCart(c=>qty<=0?c.filter(i=>i.id!==id):c.map(i=>i.id===id?{...i,qty}:i));
  const removeItem= id => setCart(c=>c.filter(i=>i.id!==id));

  const lines = cart.map(it=>({...PRODUCTS.find(p=>p.id===it.id),qty:it.qty}));
  const total = lines.reduce((s,l)=>s+l.price*l.qty,0);
  const count = cart.reduce((s,i)=>s+i.qty,0);

  const bg    = dark ? C.dBg     : C.bg;
  const text  = dark ? C.dText   : C.ink;
  const bord  = dark ? C.dBorder : C.border;
  const hdrBg = dark ? "rgba(13,13,13,.9)" : "rgba(250,248,243,.9)";

  const ticker = "NOUVELLE DROP   ✦   LIVRAISON OUAGA & BOBO   ✦   ORANGE MONEY   ✦   MOOV MONEY   ✦   PAIEMENT À LA LIVRAISON   ✦   SACS · CHAUSSURES · BIJOUX BIENTÔT   ✦   ";

  return (
    <div style={{ background:bg, minHeight:"100vh", color:text, fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box}
        input,textarea,select{font-family:inherit}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${C.pink}!important}
        .dd-card:hover{box-shadow:0 12px 30px rgba(232,23,93,.12);transform:translateY(-3px)!important}
        .dd-chip:hover{border-color:${C.pink}}
        @keyframes ddScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes ddFade{from{opacity:0}to{opacity:1}}
        @keyframes ddHero{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @media(prefers-reduced-motion:reduce){*,.dd-card{transition:none!important;animation:none!important}}
        textarea{resize:vertical}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:${C.pink}55;border-radius:99px}
      `}</style>

      {/* APP BANNER */}
      <div style={{ background:GRAD, color:"#fff", padding:"6px 14px", textAlign:"center", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:.3 }}>
        {t.appBanner} iOS & Android
        <span style={{ background:`${C.pink}22`, border:`1px solid ${C.pink}44`, padding:"2px 9px", borderRadius:999, fontSize:11 }}>Bientôt disponible</span>
      </div>

      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:hdrBg, backdropFilter:"blur(14px)", borderBottom:`1px solid ${bord}` }}>
        <div style={{ maxWidth:1120, margin:"0 auto", padding:"9px 15px", display:"flex", alignItems:"center", gap:11 }}>
          <Logo/>
          <div style={{ flex:1, position:"relative", maxWidth:400, marginLeft:"auto" }}>
            <Search size={15} color={C.mute} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} style={{ width:"100%", padding:"8px 12px 8px 32px", borderRadius:10, border:`1px solid ${bord}`, background:dark?C.dCard:"#fff", fontSize:13, color:text }}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
            <button onClick={()=>setTrackOpen(true)} title={t.trackOrder} style={{ display:"flex", alignItems:"center", gap:5, border:`1px solid ${bord}`, background:dark?C.dCard:"#fff", color:text, borderRadius:9, padding:"7px 11px", cursor:"pointer", fontSize:12, fontWeight:600 }}>
              <Package size={14}/>
            </button>
            <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{ display:"flex", alignItems:"center", gap:4, border:`1px solid ${bord}`, background:dark?C.dCard:"#fff", color:text, borderRadius:9, padding:"7px 10px", cursor:"pointer", fontSize:12, fontWeight:700 }}>
              <Globe size={13}/> {t.lang}
            </button>
            <button onClick={()=>setDark(v=>!v)} style={{ width:36, height:34, border:`1px solid ${bord}`, background:dark?C.dCard:"#fff", color:text, borderRadius:9, display:"grid", placeItems:"center", cursor:"pointer" }}>
              {dark?<Sun size={16}/>:<Moon size={16}/>}
            </button>
            <button onClick={()=>setCartOpen(true)} style={{ position:"relative", border:`1px solid ${bord}`, background:dark?C.dCard:"#fff", borderRadius:9, width:38, height:34, display:"grid", placeItems:"center", cursor:"pointer" }}>
              <ShoppingBag size={17} color={text}/>
              {count>0&&<span style={{ position:"absolute", top:-6, right:-6, background:C.pink, color:C.ink, fontSize:9.5, fontWeight:800, minWidth:17, height:17, borderRadius:999, display:"grid", placeItems:"center", padding:"0 3px" }}>{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ maxWidth:1120, margin:"0 auto", padding:"16px 15px 0" }}>
        <div style={{ borderRadius:22, padding:"30px 24px", color:"#fff", position:"relative", overflow:"hidden", background:"linear-gradient(135deg,#E8175D 0%,#FF8FAB 100%)", animation:"ddHero .7s ease both", border:`1px solid ${C.pink}33` }}>
          <div style={{ position:"absolute", right:-20, top:-20, width:180, height:180, borderRadius:999, background:`${C.pink}0A` }}/>
          <div style={{ position:"absolute", right:70, bottom:-40, width:120, height:120, borderRadius:999, background:`${C.pink}07` }}/>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:GRAD, opacity:.4 }}/>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:`${C.pink}22`, border:`1px solid ${C.pink}44`, padding:"5px 11px", borderRadius:999, fontSize:11, fontWeight:700, marginBottom:11, color:C.pink, letterSpacing:.5 }}>
            <Sparkles size={12}/> {CFG.sub}
          </span>
          <h1 style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:"clamp(22px,5vw,40px)", lineHeight:1.1, margin:"0 0 9px", maxWidth:500 }}>{t.heroTitle}</h1>
          <p style={{ fontSize:14, opacity:.85, maxWidth:400, margin:"0 0 16px", lineHeight:1.5 }}>{t.heroSub} {CFG.city}.</p>
          <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
            <a href="#produits" style={{ display:"inline-flex", alignItems:"center", gap:6, background:C.pink, color:C.ink, fontWeight:700, padding:"10px 18px", borderRadius:11, textDecoration:"none", fontSize:13.5 }}>
              {t.heroCTA} <ArrowRight size={16}/>
            </a>
            <button onClick={()=>setTrackOpen(true)} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", color:"#fff", fontWeight:700, padding:"10px 18px", borderRadius:11, border:`1.5px solid ${C.pink}55`, fontSize:13.5, cursor:"pointer" }}>
              <Package size={16}/> {t.trackOrder}
            </button>
          </div>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:GRAD, opacity:.3 }}/>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ overflow:"hidden", whiteSpace:"nowrap", background:"linear-gradient(135deg,#E8175D,#FF8FAB)", padding:"8px 0", margin:"16px 0 0" }}>
        <div style={{ display:"inline-block", animation:"ddScroll 40s linear infinite", fontWeight:700, fontSize:12, letterSpacing:.8, color:"#fff" }}>
          <span>{ticker.repeat(3)}</span><span>{ticker.repeat(3)}</span>
        </div>
      </div>

      {/* BEST-SELLERS */}
      <section style={{ maxWidth:1120, margin:"0 auto", padding:"22px 15px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:13 }}>
          <div style={{ width:3, height:20, background:GRAD, borderRadius:99 }}/>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:19, fontWeight:700, color:text, margin:0 }}>{t.bestSeller}</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:11 }}>
          {bestSellers.map((p,i)=><ProductCard key={p.id} p={p} t={t} idx={i} mounted={mounted} dark={dark} onOpen={setSelected} onAdd={addToCart}/>)}
        </div>
      </section>

      {/* CATALOGUE */}
      <section id="produits" style={{ maxWidth:1120, margin:"0 auto", padding:"25px 15px 0" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:13 }}>
          {CATS.map((c,i)=>{
            const soon=i>=4; const active=cat===i;
            return (
              <button key={c} onClick={()=>setCat(i)} className="dd-chip" style={{ padding:"7px 14px", borderRadius:999, fontSize:12.5, fontWeight:600, cursor:"pointer", border:`1.5px solid ${active?C.pink:bord}`, background:active?C.ink:(dark?C.dCard:"#fff"), color:active?C.pink:text, transition:"all .2s" }}>
                {c}{soon&&<span style={{ marginLeft:4, fontSize:9, opacity:.55 }}>· {lang==="fr"?"bientôt":"soon"}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:9, marginBottom:15 }}>
          <span style={{ fontSize:13, color:dark?C.dMute:C.mute }}>
            <strong style={{ color:text }}>{list.length}</strong> {t.itemCount}{list.length>1?"s":""}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <button onClick={()=>setInStock(v=>!v)} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 11px", borderRadius:9, cursor:"pointer", fontSize:12, fontWeight:600, border:`1.5px solid ${inStock?C.pink:bord}`, background:inStock?(dark?"#1A1510":C.pinkBg):(dark?C.dCard:"#fff"), color:text }}>
              <span style={{ width:14, height:14, borderRadius:3, border:`2px solid ${inStock?C.pink:(dark?C.dBorder:"#ddd")}`, background:inStock?C.pink:"transparent", display:"grid", placeItems:"center" }}>
                {inStock&&<Check size={9} color={C.ink}/>}
              </span>
              {t.inStock}
            </button>
            <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
              <SlidersHorizontal size={13} color={C.mute} style={{ position:"absolute", left:9 }}/>
              <select value={sort} onChange={e=>setSort(e.target.value)} style={{ appearance:"none", padding:"6px 28px 6px 28px", borderRadius:9, border:`1.5px solid ${bord}`, background:dark?C.dCard:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", color:text }}>
                <option value="new">{t.sortNew}</option>
                <option value="asc">{t.sortAsc}</option>
                <option value="desc">{t.sortDesc}</option>
              </select>
              <ChevronDown size={12} color={C.mute} style={{ position:"absolute", right:8, pointerEvents:"none" }}/>
            </div>
          </div>
        </div>

        {cat>=4?(
          <div style={{ textAlign:"center", padding:"55px 16px", color:dark?C.dMute:"#bbb" }}>
            <div style={{ fontSize:40 }}>{["👟","💍","🌸","💋","👗"][cat-4]}</div>
            <h3 style={{ fontFamily:"Georgia,serif", color:text, margin:"9px 0 4px", fontSize:17 }}>{CATS[cat]} — {lang==="fr"?"bientôt disponible !":"coming soon!"}</h3>
            <p style={{ fontSize:13 }}>{lang==="fr"?"On commence par les sacs. Reste connectée ✦":"Starting with bags. Stay tuned ✦"}</p>
          </div>
        ):list.length===0?(
          <div style={{ textAlign:"center", padding:"55px 16px" }}>
            <Search size={36} color={dark?C.dBorder:"#ddd"}/>
            <p style={{ marginTop:11, color:dark?C.dMute:"#bbb", fontSize:13.5 }}>{t.noResult}<br/>{t.noResultHint}</p>
          </div>
        ):(
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(158px,1fr))", gap:13, paddingBottom:34 }}>
            {list.map((p,i)=><ProductCard key={p.id} p={p} t={t} idx={i} mounted={mounted} dark={dark} onOpen={setSelected} onAdd={addToCart}/>)}
          </div>
        )}
      </section>

      {/* AVANTAGES */}
      <section style={{ maxWidth:1120, margin:"0 auto", padding:"0 15px 26px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:10 }}>
          {[
            { icon:<Truck size={18} color={C.pink}/>,         t:"Livraison rapide",        s:`${CFG.city} & Bobo-Dioulasso` },
            { icon:<Smartphone size={18} color={C.pink}/>,    t:"Mobile Money",            s:"Orange & Moov Money" },
            { icon:<ShieldCheck size={18} color={C.pink}/>,   t:"Sélectionné par Dada",   s:"Chaque pièce choisie avec soin" },
            { icon:<MessageCircle size={18} color="#25D366"/>, t:"Commande WhatsApp",       s:"Simple, direct, rapide" },
          ].map((f,i)=>(
            <div key={i} style={{ background:dark?C.dCard:"#fff", border:`1px solid ${bord}`, borderRadius:14, padding:"13px 14px" }}>
              <div style={{ width:36, height:36, borderRadius:9, background:dark?C.dBorder:C.pinkBg, display:"grid", placeItems:"center", marginBottom:8 }}>{f.icon}</div>
              <div style={{ fontWeight:700, fontSize:13, color:text }}>{f.t}</div>
              <div style={{ fontSize:11.5, color:dark?C.dMute:C.mute, marginTop:2 }}>{f.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:"#1A1A1A", color:"#fff", padding:"28px 15px", borderTop:`1px solid ${C.pink}33` }}>
        <div style={{ maxWidth:1120, margin:"0 auto", display:"flex", flexWrap:"wrap", gap:16, justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <Logo/>
            <p style={{ color:"#5A5040", fontSize:12, margin:"9px 0 0", maxWidth:270 }}>Sacs, accessoires & mode importés, livrés au Burkina Faso.</p>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <a href={`https://wa.me/${CFG.whatsapp}`} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#25D366", color:"#fff", textDecoration:"none", padding:"9px 14px", borderRadius:10, fontWeight:700, fontSize:13 }}>
              <MessageCircle size={16}/> WhatsApp
            </a>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, border:`1px solid ${C.pink}33`, padding:"9px 13px", borderRadius:10, fontSize:12, color:C.pink }}>
              <Phone size={14}/> {CFG.orangeMoney}
            </span>
          </div>
        </div>
        <div style={{ maxWidth:1120, margin:"16px auto 0", borderTop:`1px solid ${C.pink}1A`, paddingTop:13, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:11, color:"#3A3020" }}>© {new Date().getFullYear()} Dada's Drop — Tous droits réservés.</span>
          <span style={{ fontSize:11, color:C.pink, letterSpacing:1 }}>✦ OUAGADOUGOU · BURKINA FASO ✦</span>
        </div>
      </footer>

      {/* WHATSAPP FLOTTANT */}
      <a href={`https://wa.me/${CFG.whatsapp}`} target="_blank" rel="noreferrer" aria-label={t.whatsappFloat} style={{ position:"fixed", bottom:20, right:18, width:50, height:50, borderRadius:999, background:"#25D366", display:"grid", placeItems:"center", zIndex:49, boxShadow:"0 5px 18px rgba(37,211,102,.4)", textDecoration:"none" }}>
        <MessageCircle size={24} color="#fff"/>
      </a>

      {/* MODALS */}
      <ProductModal p={selected} t={t} dark={dark} onClose={()=>setSelected(null)} onAdd={addToCart}/>
      <CartDrawer open={cartOpen} cart={cart} t={t} dark={dark} onClose={()=>setCartOpen(false)} onQty={setQty} onRemove={removeItem} onCheckout={()=>{setCartOpen(false);setCheckout(true);}}/>
      <Checkout open={checkout} lines={lines} total={total} t={t} dark={dark} onClose={()=>setCheckout(false)}/>
      <TrackModal open={trackOpen} t={t} dark={dark} onClose={()=>setTrackOpen(false)}/>
    </div>
  );
}
