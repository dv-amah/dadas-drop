import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag, Search, X, Plus, Minus, Trash2, Heart,
  ChevronDown, Check, MessageCircle, Truck, Smartphone,
  ArrowRight, Phone, Moon, Sun, ChevronLeft, ChevronRight,
  Package, MapPin, Star, Copy, CheckCircle, Globe, Menu,
  Home, Grid, User, Lock, BarChart2, Settings, LogOut,
  Edit, Trash, Eye, PlusCircle, Bell, TrendingUp, ShoppingCart,
  AlertCircle, Filter, ShieldCheck
} from "lucide-react";

/* ═══════════════════════════════════════
   🎨 PALETTE FIGÉE — Inspiration LV
   ═══════════════════════════════════════ */
const C = {
  cream:   "#FAF6EE",   // fond principal crème
  creamD:  "#F0EBE0",   // fond secondaire
  gold:    "#C9A84C",   // or principal
  goldL:   "#E8C96A",   // or clair
  ink:     "#1A1A1A",   // noir principal
  inkSoft: "#3A3530",   // noir doux
  mute:    "#8A7A6A",   // texte discret
  border:  "#E0D8CC",   // bordures
  card:    "#FFFFFF",   // fond carte
  success: "#1A9E5E",
  danger:  "#E05030",
  // dark mode
  dBg:     "#0F0C08",
  dCard:   "#1A1510",
  dBorder: "#2E2820",
  dMute:   "#7A6A5A",
  dText:   "#F5F0E8",
};

const GRAD = `linear-gradient(135deg, ${C.gold} 0%, ${C.goldL} 100%)`;

/* ═══════════════════════════════════════
   📦 CONFIG
   ═══════════════════════════════════════ */
const CFG = {
  brand:       "DADA'S DROP",
  whatsapp:    "22670000000",
  orangeMoney: "+226 70 00 00 00",
  moovMoney:   "+226 60 00 00 00",
  wave:        "+226 77 00 00 00",
  city:        "Ouagadougou",
  freeFrom:    20000,
  adminPass:   "dada2025",
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
    adminTitle:"Tableau de bord", adminLogin:"Accès administration",
    adminPass:"Mot de passe", adminEnter:"Accéder", adminWrong:"Mot de passe incorrect.",
    totalOrders:"Commandes", totalRevenue:"Revenus", totalProducts:"Produits",
    totalClients:"Clients", recentOrders:"Commandes récentes", manageProducts:"Gérer les produits",
    addProduct:"Ajouter un article", editProduct:"Modifier", deleteProduct:"Supprimer",
    stockLabel:"Stock", priceLabel:"Prix", nameLabel:"Nom", brandLabel:"Marque",
    saveProduct:"Enregistrer", cancelEdit:"Annuler",
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
    adminTitle:"Dashboard", adminLogin:"Admin access",
    adminPass:"Password", adminEnter:"Enter", adminWrong:"Incorrect password.",
    totalOrders:"Orders", totalRevenue:"Revenue", totalProducts:"Products",
    totalClients:"Clients", recentOrders:"Recent orders", manageProducts:"Manage products",
    addProduct:"Add item", editProduct:"Edit", deleteProduct:"Delete",
    stockLabel:"Stock", priceLabel:"Price", nameLabel:"Name", brandLabel:"Brand",
    saveProduct:"Save", cancelEdit:"Cancel",
  },
};

/* ═══════════════════════════════════════
   🛍 CATALOGUE
   ═══════════════════════════════════════ */
const CATS_FR = ["Tout","Sacs à main","Bandoulières","Pochettes","Chaussures","Bijoux","Parfums","Gloss","Vêtements"];
const CATS_EN = ["All","Handbags","Shoulder bags","Clutches","Shoes","Jewellery","Perfumes","Gloss","Clothing"];

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

const DEMO_ORDERS = {
  "DD-001":{ status:1, name:"Awa Traoré",   items:["Mini Boston Rose x1"],             total:25000, date:"10/06/2025" },
  "DD-002":{ status:2, name:"Fatou Diallo", items:["Mini Boston Bleu Denim x2"],        total:50000, date:"12/06/2025" },
  "DD-003":{ status:3, name:"Mariam Koné",  items:["Coach Torry Camel x1","Tabby x1"], total:57000, date:"08/06/2025" },
};

const fcfa = n => n.toLocaleString("fr-FR") + " FCFA";

/* ═══════════════════════════════════════
   LOGO DD
   ═══════════════════════════════════════ */
function LogoDD({ size = 44 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.22, background:C.cream, border:`1.5px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", boxShadow:`0 2px 8px rgba(201,168,76,.2)`, flexShrink:0 }}>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", display:"flex", alignItems:"center" }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:size*0.38, fontWeight:700, color:C.ink, lineHeight:1 }}>D</span>
        <span style={{ fontFamily:"Georgia,serif", fontSize:size*0.38, fontWeight:700, color:C.gold, lineHeight:1 }}>D</span>
      </div>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"60%", height:0.5, background:C.gold, opacity:.3 }} />
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%) rotate(90deg)", width:"60%", height:0.5, background:C.gold, opacity:.3 }} />
    </div>
  );
}

/* ═══════════════════════════════════════
   THUMB
   ═══════════════════════════════════════ */
function Thumb({ p, idx=0 }) {
  if (p.imgs?.[idx]) return <img src={p.imgs[idx]} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => e.target.style.display="none"} />;
  return (
    <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg,${p.accent[0]},${p.accent[1]})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <ShoppingBag size={44} color="rgba(255,255,255,.7)" strokeWidth={1.2} />
    </div>
  );
}

/* ═══════════════════════════════════════
   CARROUSEL
   ═══════════════════════════════════════ */
function Carousel({ p }) {
  const [idx, setIdx] = useState(0);
  const total = Math.max(p.imgs?.length||1, 1);
  return (
    <div style={{ position:"relative", aspectRatio:"4/3", borderRadius:12, overflow:"hidden", background:C.creamD }}>
      <Thumb p={p} idx={idx} />
      {total > 1 && (<>
        <button onClick={()=>setIdx(i=>(i-1+total)%total)} style={arrowBtnStyle("left")}><ChevronLeft size={16}/></button>
        <button onClick={()=>setIdx(i=>(i+1)%total)} style={arrowBtnStyle("right")}><ChevronRight size={16}/></button>
        <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", display:"flex", gap:4 }}>
          {Array.from({length:total}).map((_,i)=>(
            <div key={i} onClick={()=>setIdx(i)} style={{ width:i===idx?14:5, height:5, borderRadius:99, background:i===idx?C.gold:"rgba(255,255,255,.5)", cursor:"pointer", transition:"all .2s" }}/>
          ))}
        </div>
      </>)}
    </div>
  );
}
const arrowBtnStyle = side => ({ position:"absolute", top:"50%", [side]:8, transform:"translateY(-50%)", width:28, height:28, borderRadius:999, border:"none", background:"rgba(255,255,255,.9)", cursor:"pointer", display:"grid", placeItems:"center" });

/* ═══════════════════════════════════════
   CARTE PRODUIT
   ═══════════════════════════════════════ */
function ProductCard({ p, t, onOpen, onAdd, dark, idx, mounted }) {
  const [fav, setFav] = useState(false);
  const out = p.stock===0, low = p.stock>0&&p.stock<=2;
  const bg = dark?C.dCard:C.card, bord = dark?C.dBorder:C.border, text = dark?C.dText:C.ink;
  return (
    <div onClick={()=>onOpen(p)} className="dd-card" style={{ background:bg, borderRadius:16, overflow:"hidden", border:`1px solid ${bord}`, cursor:"pointer", opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(12px)", transition:`opacity .5s ${idx*40}ms, transform .5s ${idx*40}ms, box-shadow .2s` }}>
      <div style={{ position:"relative", aspectRatio:"1/1", background:dark?"#1A1510":C.creamD }}>
        <Thumb p={p}/>
        <div style={{ position:"absolute", top:8, left:8, display:"flex", flexDirection:"column", gap:3 }}>
          {p.isNew && <span style={{ background:C.ink, color:C.gold, fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:999, letterSpacing:.8, border:`1px solid ${C.gold}44` }}>{t.newBadge.toUpperCase()}</span>}
          {p.isBest && <span style={{ background:C.gold, color:C.ink, fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:999 }}>✦ TOP</span>}
        </div>
        {out && <span style={{ position:"absolute", top:8, right:8, background:"rgba(26,26,26,.85)", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>{t.outStock.toUpperCase()}</span>}
        {low && <span style={{ position:"absolute", top:8, right:8, background:C.gold, color:C.ink, fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>{t.lowStock} {p.stock}!</span>}
        <button onClick={e=>{e.stopPropagation();setFav(v=>!v);}} style={{ position:"absolute", bottom:8, right:8, width:28, height:28, borderRadius:999, border:"none", background:"rgba(255,255,255,.92)", display:"grid", placeItems:"center", cursor:"pointer" }}>
          <Heart size={13} color={fav?C.gold:"#bbb"} fill={fav?C.gold:"none"}/>
        </button>
      </div>
      <div style={{ padding:"11px 13px 14px" }}>
        <div style={{ fontSize:9.5, fontWeight:700, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:3 }}>{p.brand}</div>
        <div style={{ fontFamily:"Georgia,serif", fontWeight:400, color:text, fontSize:13.5, lineHeight:1.3, marginBottom:8 }}>{p.name}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:14, color:text }}>{fcfa(p.price)}</span>
          <button disabled={out} onClick={e=>{e.stopPropagation();onAdd(p);}} style={{ width:32, height:32, borderRadius:9, border:"none", background:out?"#ddd":C.ink, color:out?"#999":C.gold, cursor:out?"not-allowed":"pointer", display:"grid", placeItems:"center" }}>
            <Plus size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   FICHE PRODUIT
   ═══════════════════════════════════════ */
function ProductModal({ p, t, onClose, onAdd, dark }) {
  const [qty, setQty] = useState(1);
  if (!p) return null;
  const out = p.stock===0, text = dark?C.dText:C.ink;
  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:480, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={sheetStyle(dark)}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          <Carousel p={p}/>
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{p.brand}</div>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:22, color:text, margin:"0 0 4px" }}>{p.name}</h3>
            <div style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:20, color:C.gold, margin:"0 0 10px" }}>{fcfa(p.price)}</div>
            <p style={{ color:dark?C.dMute:C.mute, fontSize:13.5, lineHeight:1.6, margin:"0 0 12px" }}>{p.desc}</p>
            <div style={{ fontSize:12, color:out?"#999":C.success, fontWeight:600, marginBottom:14 }}>{out?t.outStock:`${t.inStock} · ${p.stock} disponible${p.stock>1?"s":""}`}</div>
            {!out&&(
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", border:`1px solid ${dark?C.dBorder:C.border}`, borderRadius:9, overflow:"hidden" }}>
                  <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={stepBtnStyle(dark)}><Minus size={13}/></button>
                  <span style={{ width:32, textAlign:"center", fontWeight:700, color:text, fontSize:14 }}>{qty}</span>
                  <button onClick={()=>setQty(q=>Math.min(p.stock,q+1))} style={stepBtnStyle(dark)}><Plus size={13}/></button>
                </div>
                <button onClick={()=>{onAdd(p,qty);onClose();}} style={{ flex:1, ...primaryBtn, justifyContent:"center" }}>
                  <ShoppingBag size={15}/> {t.addCart}
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
   PANIER
   ═══════════════════════════════════════ */
function CartDrawer({ open, cart, products, onClose, onQty, onRemove, onCheckout, t, dark }) {
  const lines = cart.map(it=>({...products.find(p=>p.id===it.id),qty:it.qty}));
  const total = lines.reduce((s,l)=>s+l.price*l.qty,0);
  const bg = dark?C.dCard:"#fff", bord = dark?C.dBorder:C.border, text = dark?C.dText:C.ink;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:60, opacity:open?1:0, pointerEvents:open?"auto":"none", transition:"opacity .3s" }}/>
      <aside style={{ position:"fixed", top:0, right:0, height:"100%", width:"min(380px,90vw)", background:bg, zIndex:61, transform:open?"translateX(0)":"translateX(105%)", transition:"transform .35s cubic-bezier(.2,.8,.2,1)", display:"flex", flexDirection:"column", boxShadow:"-8px 0 32px rgba(0,0,0,.15)" }}>
        <div style={{ padding:"16px 18px", borderBottom:`1px solid ${bord}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"Georgia,serif", fontSize:17, color:text }}>{t.cart}</span>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:text }}><X size={20}/></button>
        </div>
        {total>=CFG.freeFrom && <div style={{ background:C.ink, color:C.gold, padding:"7px 16px", fontSize:12, fontWeight:600, textAlign:"center", letterSpacing:.5 }}>✦ Livraison offerte pour cette commande</div>}
        <div style={{ flex:1, overflowY:"auto", padding:14 }}>
          {lines.length===0?(
            <div style={{ textAlign:"center", color:dark?C.dMute:"#bbb", marginTop:50 }}>
              <ShoppingBag size={38} strokeWidth={1.2}/>
              <p style={{ marginTop:10, fontSize:13.5 }}>{t.empty}<br/>{t.emptyHint}</p>
            </div>
          ):lines.map(l=>(
            <div key={l.id} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:`1px solid ${bord}` }}>
              <div style={{ width:58, height:58, borderRadius:9, overflow:"hidden", flexShrink:0 }}><Thumb p={l}/></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"Georgia,serif", fontSize:13, color:text, marginBottom:2 }}>{l.name}</div>
                <div style={{ fontSize:12.5, color:C.gold, fontWeight:700 }}>{fcfa(l.price)}</div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:5 }}>
                  <div style={{ display:"flex", alignItems:"center", border:`1px solid ${bord}`, borderRadius:7 }}>
                    <button onClick={()=>onQty(l.id,l.qty-1)} style={stepBtnSmStyle(dark)}><Minus size={11}/></button>
                    <span style={{ width:22, textAlign:"center", fontSize:12, fontWeight:700, color:text }}>{l.qty}</span>
                    <button onClick={()=>onQty(l.id,Math.min(l.stock,l.qty+1))} style={stepBtnSmStyle(dark)}><Plus size={11}/></button>
                  </div>
                  <button onClick={()=>onRemove(l.id)} style={{ border:"none", background:"none", cursor:"pointer", color:"#bbb" }}><Trash2 size={13}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {lines.length>0&&(
          <div style={{ padding:16, borderTop:`1px solid ${bord}` }}>
            {total<CFG.freeFrom&&<p style={{ fontSize:11, color:C.mute, margin:"0 0 8px" }}>Livraison offerte dès {fcfa(CFG.freeFrom)}</p>}
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ color:dark?C.dMute:C.mute, fontSize:14 }}>{t.total}</span>
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
   CHECKOUT
   ═══════════════════════════════════════ */
function Checkout({ open, lines, total, onClose, t, dark }) {
  const [form, setForm] = useState({ nom:"", tel:"", ville:CFG.city, adresse:"", note:"" });
  const [pay, setPay] = useState("orange");
  const [sent, setSent] = useState(false);
  const [orderNum] = useState(()=>"DD-"+String(Math.floor(Math.random()*9000)+1000));
  const [copied, setCopied] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const valid = form.nom.trim()&&form.tel.trim()&&form.ville.trim();
  if (!open) return null;
  const payLabels = { orange:t.orange, moov:t.moov, wave:t.wave, livraison:t.delivery };
  const send = () => {
    const items = lines.map(l=>`• ${l.qty}x ${l.name} — ${fcfa(l.price*l.qty)}`).join("\n");
    const msg = `Bonjour ${CFG.brand} 👋\nCommande #${orderNum}\n\n${items}\n\n💰 Total : ${fcfa(total)}\n💳 Règlement : ${payLabels[pay]}\n\nNom : ${form.nom}\nTél : ${form.tel}\nVille : ${form.ville}\nAdresse : ${form.adresse||"—"}\nNote : ${form.note||"—"}\n\n📍 Je vous envoie ma localisation WhatsApp.${pay!=="livraison"?"\n✅ Je joins la capture du paiement.":""}`;
    window.open(`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");
    setSent(true);
  };
  const copy = () => { navigator.clipboard?.writeText(orderNum).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const text = dark?C.dText:C.ink, bord = dark?C.dBorder:C.border;
  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:440, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"90vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          {sent?(
            <div style={{ textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:999, background:"#E8F8EF", display:"grid", placeItems:"center", margin:"0 auto 12px" }}><Check size={24} color={C.success}/></div>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:20, color:text, margin:"0 0 6px" }}>{t.sent}</h3>
              <p style={{ color:dark?C.dMute:C.mute, fontSize:13, lineHeight:1.5, margin:"0 0 14px" }}>{t.sentMsg}{pay!=="livraison"&&` ${t.capture}`}</p>
              <div style={{ background:dark?"#1A1510":C.creamD, border:`1px solid ${C.gold}33`, borderRadius:10, padding:"11px 14px", marginBottom:13 }}>
                <div style={{ fontSize:10, color:dark?C.dMute:C.mute, marginBottom:3 }}>Numéro de commande</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ fontFamily:"Georgia,serif", fontSize:18, color:C.gold }}>{orderNum}</span>
                  <button onClick={copy} style={{ border:"none", background:"none", cursor:"pointer", color:C.gold }}>{copied?<CheckCircle size={16}/>:<Copy size={16}/>}</button>
                </div>
              </div>
              <button onClick={onClose} style={{ ...primaryBtn, width:"100%", justifyContent:"center" }}>{t.close}</button>
            </div>
          ):(
            <>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:19, color:text, margin:"0 0 4px" }}>{t.finalize}</h3>
              <p style={{ color:C.gold, fontWeight:700, fontSize:13, margin:"0 0 12px" }}>{t.total} : {fcfa(total)}</p>
              <div style={{ background:dark?"#1A1510":C.creamD, border:`1px solid ${bord}`, borderRadius:9, padding:"8px 11px", fontSize:11.5, color:dark?C.dMute:C.mute, marginBottom:12 }}>
                {t.shippingNote} {fcfa(CFG.freeFrom)}.
              </div>
              <Field label={t.name} dark={dark}><input style={inpStyle(dark)} value={form.nom} onChange={set("nom")} placeholder="Ex : Awa Traoré"/></Field>
              <Field label={t.phone} dark={dark}><input style={inpStyle(dark)} value={form.tel} onChange={set("tel")} placeholder="Ex : 70 00 00 00"/></Field>
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
                { key:"livraison",icon:<Truck size={15} color={C.gold}/>,    title:t.delivery, sub:t.deliverySub },
              ].map(({key,icon,title,sub})=>(
                <button key={key} onClick={()=>setPay(key)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 11px", marginBottom:6, borderRadius:10, cursor:"pointer", textAlign:"left", border:`1.5px solid ${pay===key?C.gold:bord}`, background:pay===key?(dark?"#1A1510":C.creamD):(dark?C.dCard:"#fff") }}>
                  <span style={{ width:30, height:30, borderRadius:7, background:dark?C.dBorder:C.creamD, display:"grid", placeItems:"center" }}>{icon}</span>
                  <span style={{ flex:1 }}>
                    <span style={{ display:"block", fontWeight:700, fontSize:13, color:text }}>{title}</span>
                    <span style={{ display:"block", fontSize:11, color:dark?C.dMute:C.mute }}>{sub}</span>
                  </span>
                  <span style={{ width:16, height:16, borderRadius:999, border:`2px solid ${pay===key?C.gold:bord}`, display:"grid", placeItems:"center" }}>
                    {pay===key&&<span style={{ width:8, height:8, borderRadius:999, background:C.gold }}/>}
                  </span>
                </button>
              ))}
              <button onClick={send} disabled={!valid} style={{ width:"100%", marginTop:12, justifyContent:"center", background:"#25D366", color:"#fff", border:"none", borderRadius:10, padding:"12px", fontWeight:700, fontSize:14, cursor:valid?"pointer":"not-allowed", display:"flex", alignItems:"center", gap:7, opacity:valid?1:.5 }}>
                <MessageCircle size={16}/> {t.send}
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════
   SUIVI COMMANDE
   ═══════════════════════════════════════ */
function TrackModal({ open, onClose, t, dark }) {
  const [num, setNum] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(false);
  if (!open) return null;
  const text = dark?C.dText:C.ink, bord = dark?C.dBorder:C.border;
  const steps = [t.statusPrep, t.statusShip, t.statusDeliv];
  const icons = [<Package size={13}/>, <Truck size={13}/>, <MapPin size={13}/>];
  const track = () => { const o = DEMO_ORDERS[num.toUpperCase()]; o?(setResult(o),setNotFound(false)):(setResult(null),setNotFound(true)); };
  return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:420, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), maxHeight:"88vh", overflowY:"auto" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:19, color:text, margin:"0 0 14px" }}>{t.trackTitle}</h3>
          <div style={{ display:"flex", gap:7 }}>
            <input value={num} onChange={e=>setNum(e.target.value)} placeholder="Ex : DD-001" style={{ ...inpStyle(dark), flex:1 }} onKeyDown={e=>e.key==="Enter"&&track()}/>
            <button onClick={track} style={{ ...primaryBtn, padding:"9px 14px" }}>{t.trackBtn}</button>
          </div>
          {notFound&&<p style={{ color:C.danger, fontSize:12.5, marginTop:8 }}>{t.trackNotFound}</p>}
          {result&&(
            <div style={{ marginTop:16 }}>
              <div style={{ background:dark?"#1A1510":C.creamD, border:`1px solid ${C.gold}33`, borderRadius:11, padding:"11px 13px", marginBottom:14 }}>
                <div style={{ fontFamily:"Georgia,serif", fontWeight:700, color:text, marginBottom:3 }}>#{num.toUpperCase()}</div>
                {result.items.map((item,i)=><div key={i} style={{ fontSize:12.5, color:dark?C.dMute:C.mute }}>• {item}</div>)}
                <div style={{ fontSize:13, color:C.gold, fontWeight:700, marginTop:5 }}>{fcfa(result.total)}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", position:"relative", marginBottom:14 }}>
                <div style={{ position:"absolute", top:14, left:"10%", right:"10%", height:2, background:dark?C.dBorder:C.border, zIndex:0 }}>
                  <div style={{ height:"100%", width:`${((result.status-1)/2)*100}%`, background:GRAD, borderRadius:99, transition:"width .6s" }}/>
                </div>
                {steps.map((s,i)=>{
                  const done=i<result.status, active=i===result.status-1;
                  return (
                    <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, zIndex:1, flex:1 }}>
                      <div style={{ width:28, height:28, borderRadius:999, background:done?C.ink:(dark?C.dBorder:C.border), display:"grid", placeItems:"center", border:done?`2px solid ${C.gold}`:"none", boxShadow:active?`0 0 0 4px ${C.gold}33`:"none" }}>
                        <span style={{ color:done?C.gold:"#bbb" }}>{icons[i]}</span>
                      </div>
                      <span style={{ fontSize:10, fontWeight:active?700:400, color:done?text:"#bbb", textAlign:"center" }}>{s}</span>
                    </div>
                  );
                })}
              </div>
              {result.status===3&&(
                commentSent?(
                  <div style={{ display:"flex", alignItems:"center", gap:7, color:C.success, fontSize:13, fontWeight:600 }}><CheckCircle size={16}/> Merci pour votre avis ✦</div>
                ):(<>
                  <div style={{ fontSize:12.5, fontWeight:700, color:text, marginBottom:5 }}>{t.comment}</div>
                  <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} style={{ ...inpStyle(dark), resize:"vertical" }}/>
                  <button onClick={()=>setCommentSent(true)} disabled={!comment.trim()} style={{ ...primaryBtn, marginTop:7, width:"100%", justifyContent:"center", opacity:comment.trim()?1:.5 }}>
                    <Star size={14}/> {t.commentSend}
                  </button>
                </>)
              )}
              <p style={{ fontSize:11, color:dark?C.dMute:"#bbb", marginTop:12, textAlign:"center" }}>Essayez DD-001, DD-002 ou DD-003 pour la démo</p>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════
   TABLEAU DE BORD ADMIN
   ═══════════════════════════════════════ */
function AdminDashboard({ products, setProducts, orders, t, dark, onClose }) {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [wrong, setWrong] = useState(false);
  const [tab, setTab] = useState("overview");
  const [editP, setEditP] = useState(null);
  const [newP, setNewP] = useState(false);
  const [form, setForm] = useState({ name:"", nameEn:"", brand:"", price:"", cat:"Sacs à main", catEn:"Handbags", stock:"", isNew:false, isBest:false, desc:"", descEn:"", accent:["#C9A84C","#1A1A1A"] });
  const set = k => e => setForm(f=>({...f,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value}));
  const text = dark?C.dText:C.ink, bord = dark?C.dBorder:C.border, bg = dark?C.dBg:C.cream;
  const totalRev = orders.reduce((s,o)=>s+o.total,0);

  const login = () => { if(pass===CFG.adminPass){setAuth(true);setWrong(false);}else setWrong(true); };
  const saveProduct = () => {
    const catIdx = CATS_FR.indexOf(form.cat);
    const catEn = catIdx>0 ? CATS_EN[catIdx] : "Handbags";
    const p = { 
      ...form, 
      id:editP?editP.id:Date.now(), 
      price:parseInt(form.price)||0, 
      stock:parseInt(form.stock)||0, 
      imgs:editP?.imgs||[], 
      accent:form.accent,
      catEn: catEn,
      nameEn: form.nameEn||form.name,
      descEn: form.descEn||form.desc,
    };
    if(editP) setProducts(ps=>ps.map(x=>x.id===editP.id?p:x));
    else setProducts(ps=>[...ps,p]);
    setEditP(null); setNewP(false);
  };
  const deleteProduct = id => { if(window.confirm("Supprimer cet article ?")) setProducts(ps=>ps.filter(p=>p.id!==id)); };
  const startEdit = p => { setForm({...p, price:String(p.price), stock:String(p.stock)}); setEditP(p); setNewP(true); };
  const startNew = () => { setForm({ name:"", nameEn:"", brand:"Coach", price:"", cat:"Sacs à main", catEn:"Handbags", stock:"", isNew:false, isBest:false, desc:"", descEn:"", accent:["#C9A84C","#1A1A1A"] }); setEditP(null); setNewP(true); };

  if (!auth) return (
    <Overlay onClose={onClose}>
      <div style={{ maxWidth:340, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ ...sheetStyle(dark), textAlign:"center" }}>
          <button onClick={onClose} style={closeBtnStyle(dark)}><X size={16}/></button>
          <LogoDD size={52}/>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:"14px 0 4px" }}>{t.adminLogin}</h3>
          <p style={{ fontSize:12.5, color:dark?C.dMute:C.mute, margin:"0 0 16px" }}>Réservé à l'équipe Dada's Drop</p>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder={t.adminPass} style={{ ...inpStyle(dark), marginBottom:8, textAlign:"center" }} onKeyDown={e=>e.key==="Enter"&&login()}/>
          {wrong&&<p style={{ color:C.danger, fontSize:12, margin:"0 0 8px" }}>{t.adminWrong}</p>}
          <button onClick={login} style={{ ...primaryBtn, width:"100%", justifyContent:"center" }}><Lock size={14}/> {t.adminEnter}</button>
        </div>
      </div>
    </Overlay>
  );

  const tabs = [
    { key:"overview", icon:<BarChart2 size={16}/>, label:"Vue d'ensemble" },
    { key:"products", icon:<Grid size={16}/>, label:"Produits" },
    { key:"orders",   icon:<ShoppingCart size={16}/>, label:"Commandes" },
  ];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:80, background:bg, overflowY:"auto" }}>
      <div style={{ maxWidth:960, margin:"0 auto", padding:"0 16px 40px" }}>
        {/* Header admin */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0", borderBottom:`1px solid ${bord}`, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <LogoDD size={38}/>
            <div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:text }}>{t.adminTitle}</div>
              <div style={{ fontSize:11, color:dark?C.dMute:C.mute }}>Dada's Drop — Administration</div>
            </div>
          </div>
          <button onClick={onClose} style={{ display:"flex", alignItems:"center", gap:6, border:`1px solid ${bord}`, background:"none", borderRadius:8, padding:"7px 12px", cursor:"pointer", color:text, fontSize:12.5, fontWeight:600 }}>
            <LogOut size={14}/> Quitter
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
          {tabs.map(tb=>(
            <button key={tb.key} onClick={()=>setTab(tb.key)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9, border:`1.5px solid ${tab===tb.key?C.gold:bord}`, background:tab===tb.key?C.ink:(dark?C.dCard:"#fff"), color:tab===tb.key?C.gold:text, cursor:"pointer", fontSize:13, fontWeight:600 }}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {/* Vue d'ensemble */}
        {tab==="overview"&&(
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
              {[
                { icon:<ShoppingCart size={20} color={C.gold}/>, val:orders.length,             label:t.totalOrders },
                { icon:<TrendingUp size={20} color={C.gold}/>,   val:fcfa(totalRev),            label:t.totalRevenue },
                { icon:<Grid size={20} color={C.gold}/>,         val:products.length,           label:t.totalProducts },
                { icon:<User size={20} color={C.gold}/>,         val:orders.length,             label:t.totalClients },
              ].map((s,i)=>(
                <div key={i} style={{ background:dark?C.dCard:"#fff", border:`1px solid ${bord}`, borderRadius:14, padding:"16px 16px" }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:dark?C.dBorder:C.creamD, display:"grid", placeItems:"center", marginBottom:10 }}>{s.icon}</div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:text }}>{s.val}</div>
                  <div style={{ fontSize:12, color:dark?C.dMute:C.mute, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:dark?C.dCard:"#fff", border:`1px solid ${bord}`, borderRadius:14, padding:"16px 18px" }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:15, color:text, marginBottom:14 }}>{t.recentOrders}</div>
              {orders.map((o,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<orders.length-1?`1px solid ${bord}`:"none" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13.5, color:text }}>#{o.id} — {o.name}</div>
                    <div style={{ fontSize:12, color:dark?C.dMute:C.mute }}>{o.items.join(", ")}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"Georgia,serif", fontWeight:700, color:C.gold, fontSize:13.5 }}>{fcfa(o.total)}</div>
                    <div style={{ fontSize:11, color:["",C.gold,"#1DC0D4",C.success][o.status], fontWeight:600 }}>{["","En préparation","Expédiée","Livrée"][o.status]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Produits */}
        {tab==="products"&&(
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontFamily:"Georgia,serif", fontSize:16, color:text }}>{products.length} articles</span>
              <button onClick={startNew} style={{ ...primaryBtn, gap:6 }}><PlusCircle size={15}/> {t.addProduct}</button>
            </div>
            {newP&&(
              <div style={{ background:dark?C.dCard:"#fff", border:`1px solid ${C.gold}55`, borderRadius:14, padding:"18px 18px", marginBottom:16 }}>
                <h4 style={{ fontFamily:"Georgia,serif", fontSize:15, color:text, margin:"0 0 14px" }}>{editP?"Modifier l'article":"Nouvel article"}</h4>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Field label="Nom (FR)" dark={dark}><input style={inpStyle(dark)} value={form.name} onChange={set("name")} placeholder="Ex : Mini Boston Rose"/></Field>
                  <Field label="Nom (EN)" dark={dark}><input style={inpStyle(dark)} value={form.nameEn} onChange={set("nameEn")}/></Field>
                  <Field label="Marque" dark={dark}><input style={inpStyle(dark)} value={form.brand} onChange={set("brand")}/></Field>
                  <Field label="Prix (FCFA)" dark={dark}><input style={inpStyle(dark)} type="number" value={form.price} onChange={set("price")} placeholder="Ex : 25000"/></Field>
                  <Field label="Stock" dark={dark}><input style={inpStyle(dark)} type="number" value={form.stock} onChange={set("stock")}/></Field>
                  <Field label="Catégorie" dark={dark}>
                    <select style={inpStyle(dark)} value={form.cat} onChange={set("cat")}>
                      {CATS_FR.slice(1).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Description (FR)" dark={dark}><textarea style={{ ...inpStyle(dark), resize:"vertical" }} rows={2} value={form.desc} onChange={set("desc")}/></Field>
                <div style={{ display:"flex", gap:14, margin:"10px 0 14px" }}>
                  <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, color:text }}>
                    <input type="checkbox" checked={form.isNew} onChange={set("isNew")}/> Nouveauté
                  </label>
                  <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, color:text }}>
                    <input type="checkbox" checked={form.isBest} onChange={set("isBest")}/> Best-seller
                  </label>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={saveProduct} style={{ ...primaryBtn, gap:6 }}><Check size={14}/> {t.saveProduct}</button>
                  <button onClick={()=>{setNewP(false);setEditP(null);}} style={{ ...secondaryBtn(dark), gap:6 }}><X size={14}/> {t.cancelEdit}</button>
                </div>
              </div>
            )}
            <div style={{ display:"grid", gap:10 }}>
              {products.map(p=>(
                <div key={p.id} style={{ background:dark?C.dCard:"#fff", border:`1px solid ${bord}`, borderRadius:12, padding:"12px 14px", display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:52, height:52, borderRadius:9, overflow:"hidden", flexShrink:0 }}><Thumb p={p}/></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:13.5, color:text, fontWeight:600 }}>{p.name}</div>
                    <div style={{ fontSize:11.5, color:dark?C.dMute:C.mute }}>{p.brand} · {fcfa(p.price)} · Stock : {p.stock}</div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>startEdit(p)} style={{ ...iconBtn(dark) }}><Edit size={14}/></button>
                    <button onClick={()=>deleteProduct(p.id)} style={{ ...iconBtn(dark), color:C.danger }}><Trash size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commandes */}
        {tab==="orders"&&(
          <div style={{ display:"grid", gap:12 }}>
            {orders.map((o,i)=>(
              <div key={i} style={{ background:dark?C.dCard:"#fff", border:`1px solid ${bord}`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontFamily:"Georgia,serif", fontWeight:700, color:text }}>#{o.id}</span>
                  <span style={{ fontSize:11, color:["",C.gold,"#1DC0D4",C.success][o.status], fontWeight:700, background:dark?C.dBorder:C.creamD, padding:"3px 9px", borderRadius:999 }}>
                    {["","En préparation","Expédiée","Livrée"][o.status]}
                  </span>
                </div>
                <div style={{ fontSize:13, color:text, fontWeight:600 }}>{o.name}</div>
                {o.items.map((item,j)=><div key={j} style={{ fontSize:12.5, color:dark?C.dMute:C.mute }}>• {item}</div>)}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, alignItems:"center" }}>
                  <span style={{ fontSize:11.5, color:dark?C.dMute:C.mute }}>{o.date}</span>
                  <span style={{ fontFamily:"Georgia,serif", fontWeight:700, color:C.gold }}>{fcfa(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MENU LATÉRAL (style LV)
   ═══════════════════════════════════════ */
function SideMenu({ open, onClose, t, lang, setLang, dark, setPage, setCat, onAdminOpen }) {
  const text = dark?C.dText:C.ink;
  const navItems = [
    { label:t.home,      page:"home",      cat:null },
    { label:t.catalogue, page:"catalogue", cat:null },
  ];
  const catItems = CATS_FR.slice(1).map((c,i)=>({ label:c, page:"catalogue", cat:i+1 }));
  const bottomItems = [
    { label:"À propos", page:"about", cat:null },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:60, opacity:open?1:0, pointerEvents:open?"auto":"none", transition:"opacity .3s" }}/>
      <div style={{ position:"fixed", top:0, left:0, height:"100%", width:"min(320px,82vw)", background:dark?C.dCard:"#fff", zIndex:61, transform:open?"translateX(0)":"translateX(-105%)", transition:"transform .35s cubic-bezier(.2,.8,.2,1)", display:"flex", flexDirection:"column", overflowY:"auto" }}>
        <div style={{ padding:"18px 20px", borderBottom:`1px solid ${dark?C.dBorder:C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <span style={{ fontFamily:"Georgia,serif", fontSize:13, fontWeight:700, color:dark?C.dMute:C.mute, letterSpacing:1 }}>MENU</span>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:text }}><X size={20}/></button>
        </div>
        <div style={{ flex:1, padding:"20px 24px" }}>
          {navItems.map((item,i)=>(
            <button key={i} onClick={()=>{ setPage(item.page); if(item.cat!==null) setCat(item.cat); onClose(); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"9px 0", border:"none", background:"none", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:17, color:text, letterSpacing:.3 }}>
              {item.label}
            </button>
          ))}
          <div style={{ marginTop:16, marginBottom:8 }}>
            <span style={{ fontSize:10, fontWeight:700, color:dark?C.dMute:C.mute, letterSpacing:2, textTransform:"uppercase" }}>Collections</span>
          </div>
          {catItems.map((item,i)=>(
            <button key={i} onClick={()=>{ setPage(item.page); setCat(item.cat); onClose(); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 0", border:"none", background:"none", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:16, color:text, letterSpacing:.3 }}>
              {item.label}
              {i>=3&&<span style={{ fontSize:10, color:dark?C.dMute:C.mute, marginLeft:6 }}>· bientôt</span>}
            </button>
          ))}
          <div style={{ marginTop:16 }}>
            {bottomItems.map((item,i)=>(
              <button key={i} onClick={()=>{ setPage(item.page); onClose(); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"9px 0", border:"none", background:"none", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:17, color:text, letterSpacing:.3 }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding:"16px 24px", borderTop:`1px solid ${dark?C.dBorder:C.border}`, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>
          <button onClick={()=>{setLang(l=>l==="fr"?"en":"fr");}} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:`1px solid ${dark?C.dBorder:C.border}`, borderRadius:8, padding:"8px 12px", cursor:"pointer", color:dark?C.dText:C.ink, fontSize:13, fontWeight:600, width:"fit-content" }}>
            <Globe size={14}/> {lang==="fr"?"Passer en anglais":"Switch to French"}
          </button>
          <button onClick={()=>{onAdminOpen();onClose();}} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", color:dark?C.dMute:C.mute, fontSize:13 }}>
            <Lock size={14}/> Administration
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   OVERLAY
   ═══════════════════════════════════════ */
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:14, animation:"ddFade .22s ease" }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   FORM HELPERS
   ═══════════════════════════════════════ */
const Field = ({ label, children, dark, flex }) => (
  <label style={{ display:"block", marginBottom:10, flex:flex?1:"none" }}>
    <span style={{ fontSize:11.5, fontWeight:600, color:dark?C.dText:C.ink, display:"block", marginBottom:4 }}>{label}</span>
    {children}
  </label>
);

/* ═══════════════════════════════════════
   STYLES PARTAGÉS
   ═══════════════════════════════════════ */
const sheetStyle = dark => ({ background:dark?C.dCard:"#fff", borderRadius:18, padding:20, position:"relative", boxShadow:"0 24px 56px rgba(0,0,0,.22)" });
const closeBtnStyle = dark => ({ position:"absolute", top:12, right:12, width:30, height:30, borderRadius:999, border:"none", background:dark?C.dBorder:C.creamD, cursor:"pointer", display:"grid", placeItems:"center", color:dark?C.dText:C.ink, zIndex:2 });
const stepBtnStyle = dark => ({ width:32, height:36, border:"none", background:dark?C.dBorder:C.creamD, cursor:"pointer", display:"grid", placeItems:"center", color:dark?C.dText:C.ink });
const stepBtnSmStyle = dark => ({ width:24, height:24, border:"none", background:dark?C.dBorder:C.creamD, cursor:"pointer", display:"grid", placeItems:"center", color:dark?C.dText:C.ink });
const primaryBtn = { display:"inline-flex", alignItems:"center", gap:7, background:C.ink, color:C.gold, border:`1px solid ${C.gold}44`, borderRadius:10, padding:"11px 18px", fontWeight:700, fontSize:13.5, cursor:"pointer" };
const secondaryBtn = dark => ({ display:"inline-flex", alignItems:"center", gap:7, background:"none", color:dark?C.dText:C.ink, border:`1px solid ${dark?C.dBorder:C.border}`, borderRadius:10, padding:"11px 16px", fontWeight:600, fontSize:13.5, cursor:"pointer" });
const iconBtn = dark => ({ width:32, height:32, borderRadius:8, border:`1px solid ${dark?C.dBorder:C.border}`, background:"none", cursor:"pointer", display:"grid", placeItems:"center", color:dark?C.dText:C.ink });
const inpStyle = dark => ({ width:"100%", padding:"9px 11px", borderRadius:9, border:`1.5px solid ${dark?C.dBorder:C.border}`, background:dark?C.dCard:"#fff", fontSize:13, color:dark?C.dText:C.ink, fontFamily:"inherit" });

/* ═══════════════════════════════════════
   PAGE À PROPOS
   ═══════════════════════════════════════ */
function AboutPage({ dark }) {
  const text = dark?C.dText:C.ink, bord = dark?C.dBorder:C.border;
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 20px" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <LogoDD size={64}/>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:28, color:text, margin:"16px 0 8px" }}>Dada's Drop</h1>
        <p style={{ fontSize:14, color:dark?C.dMute:C.mute, lineHeight:1.7 }}>Collection Premium · Ouagadougou, Burkina Faso</p>
      </div>
      <div style={{ background:dark?C.dCard:"#fff", border:`1px solid ${bord}`, borderRadius:16, padding:"24px 28px", marginBottom:16 }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:"0 0 12px" }}>Notre histoire</h2>
        <p style={{ fontSize:14, color:dark?C.dMute:C.mute, lineHeight:1.8 }}>
          Dada's Drop est née d'une passion pour l'élégance accessible. Nous sélectionnons avec soin des sacs et accessoires de qualité premium, importés pour vous et livrés directement à Ouagadougou.
        </p>
      </div>
      <div style={{ background:dark?C.dCard:"#fff", border:`1px solid ${bord}`, borderRadius:16, padding:"24px 28px", marginBottom:16 }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:"0 0 12px" }}>Nous contacter</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <a href={`https://wa.me/${CFG.whatsapp}`} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:10, color:"#25D366", textDecoration:"none", fontWeight:600, fontSize:14 }}>
            <MessageCircle size={18}/> WhatsApp — +{CFG.whatsapp}
          </a>
          <div style={{ display:"flex", alignItems:"center", gap:10, color:dark?C.dMute:C.mute, fontSize:14 }}>
            <Smartphone size={18}/> Orange Money — {CFG.orangeMoney}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, color:dark?C.dMute:C.mute, fontSize:14 }}>
            <Smartphone size={18}/> Moov Money — {CFG.moovMoney}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, color:dark?C.dMute:C.mute, fontSize:14 }}>
            <Smartphone size={18}/> Wave — {CFG.wave}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   APP PRINCIPALE
   ═══════════════════════════════════════ */
export default function DadasDrop() {
  const [lang, setLang]       = useState("fr");
  const [dark, setDark]       = useState(false);
  const [page, setPage]       = useState("home");
  const [query, setQuery]     = useState("");
  const [cat, setCat]         = useState(0);
  const [sort, setSort]       = useState("new");
  const [inStock, setInStock] = useState(false);
  const [products, setProducts] = useState(initProducts);
  const [cart, setCart]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(()=>{ const id=setTimeout(()=>setMounted(true),80); return ()=>clearTimeout(id); },[]);

  // Bloquer le scroll quand menu ou panier ou modal est ouvert
  useEffect(()=>{
    const isOpen = menuOpen || cartOpen || checkout || trackOpen || adminOpen || !!selected;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  },[menuOpen, cartOpen, checkout, trackOpen, adminOpen, selected]);

  const t    = T[lang];
  const CATS = lang==="fr"?CATS_FR:CATS_EN;

  const demoOrders = Object.entries(DEMO_ORDERS).map(([id,o])=>({...o,id}));

  const list = useMemo(()=>{
    let r = products.filter(p=>{
      // Si recherche active, ignore le filtre catégorie et cherche partout
      if(query.trim()) {
        if(inStock&&p.stock===0) return false;
        const q = query.toLowerCase().trim();
        return (
          (p.name||"").toLowerCase().includes(q) ||
          (p.nameEn||"").toLowerCase().includes(q) ||
          (p.brand||"").toLowerCase().includes(q) ||
          (p.cat||"").toLowerCase().includes(q) ||
          (p.catEn||"").toLowerCase().includes(q) ||
          (p.desc||"").toLowerCase().includes(q) ||
          (p.descEn||"").toLowerCase().includes(q) ||
          String(p.price).includes(q)
        );
      }
      if(cat>0){ const cn=lang==="fr"?p.cat:p.catEn; if(cn!==CATS[cat]) return false; }
      if(inStock&&p.stock===0) return false;
      return true;
    });
    if(sort==="asc")  r=[...r].sort((a,b)=>a.price-b.price);
    if(sort==="desc") r=[...r].sort((a,b)=>b.price-a.price);
    return r;
  },[query,cat,sort,inStock,lang,products]);

  const bestSellers = products.filter(p=>p.isBest&&p.stock>0).slice(0,4);
  const addToCart = useCallback((p,qty=1)=>{
    setCart(c=>{ const ex=c.find(i=>i.id===p.id); if(ex) return c.map(i=>i.id===p.id?{...i,qty:Math.min(p.stock,i.qty+qty)}:i); return [...c,{id:p.id,qty}]; });
    setCartOpen(true);
  },[]);
  const setQty = (id,qty) => setCart(c=>qty<=0?c.filter(i=>i.id!==id):c.map(i=>i.id===id?{...i,qty}:i));
  const removeItem = id => setCart(c=>c.filter(i=>i.id!==id));
  const lines = cart.map(it=>({...products.find(p=>p.id===it.id),qty:it.qty}));
  const total = lines.reduce((s,l)=>s+l.price*l.qty,0);
  const count = cart.reduce((s,i)=>s+i.qty,0);

  const bg = dark?C.dBg:C.cream, text = dark?C.dText:C.ink, bord = dark?C.dBorder:C.border;
  const hdrBg = dark?"rgba(15,12,8,.92)":"rgba(250,246,238,.92)";

  return (
    <div style={{ background:bg, minHeight:"100vh", color:text, fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box}
        input,textarea,select{font-family:inherit}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${C.gold}!important}
        .dd-card:hover{box-shadow:0 12px 28px rgba(0,0,0,.12);transform:translateY(-2px)!important}
        .dd-chip:hover{border-color:${C.gold}}
        @keyframes ddFade{from{opacity:0}to{opacity:1}}
        @keyframes ddHero{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:600px){
          .dd-grid{grid-template-columns:repeat(2,1fr)!important}
          .dd-hero-title{font-size:28px!important}
          .dd-cats{flex-wrap:wrap}
          .dd-lang-btn{display:none!important}
        }
        textarea{resize:vertical}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${C.gold}44;border-radius:99px}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:hdrBg, backdropFilter:"blur(14px)", borderBottom:`1px solid ${bord}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Gauche */}
          <div style={{ display:"flex", alignItems:"center", gap:16, flex:1 }}>
            <button onClick={()=>setMenuOpen(true)} style={{ border:"none", background:"none", cursor:"pointer", color:text, display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontWeight:600, letterSpacing:.5 }}>
              <Menu size={18}/> <span style={{ display:"none" }}>MENU</span>
            </button>
            <button onClick={()=>setSearchOpen(v=>!v)} style={{ border:"none", background:"none", cursor:"pointer", color:text, display:"flex", alignItems:"center", gap:6, fontSize:12.5, letterSpacing:.3 }}>
              <Search size={17}/> <span style={{ fontSize:12.5, color:dark?C.dMute:C.mute, display:"none" }}>{t.search}</span>
            </button>
          </div>

          {/* Centre — Logo */}
          <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer" }} onClick={()=>setPage("home")}>
            <span style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:text, letterSpacing:3, lineHeight:1, whiteSpace:"nowrap" }}>DADA'S DROP</span>
            <span style={{ fontSize:8, color:C.gold, letterSpacing:4, marginTop:1, whiteSpace:"nowrap" }}>✦ COLLECTION PREMIUM ✦</span>
          </div>

          {/* Droite */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"flex-end" }}>
            <button className="dd-lang-btn" onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{ border:`1px solid ${bord}`, background:dark?C.dCard:"#fff", borderRadius:7, padding:"5px 9px", cursor:"pointer", color:text, fontSize:11.5, fontWeight:700, letterSpacing:.5, flexShrink:0 }}>
              {t.lang}
            </button>
            <button onClick={()=>setDark(v=>!v)} style={{ border:"none", background:"none", cursor:"pointer", color:text }}>
              {dark?<Sun size={17}/>:<Moon size={17}/>}
            </button>
            <button onClick={()=>setCartOpen(true)} style={{ position:"relative", border:"none", background:"none", cursor:"pointer", color:text }}>
              <ShoppingBag size={19}/>
              {count>0&&<span style={{ position:"absolute", top:-7, right:-7, background:C.ink, color:C.gold, fontSize:9.5, fontWeight:800, minWidth:17, height:17, borderRadius:999, display:"grid", placeItems:"center", padding:"0 3px", border:`1.5px solid ${C.gold}` }}>{count}</span>}
            </button>
          </div>
        </div>

        {/* Barre de recherche déroulante */}
        {searchOpen&&(
          <div style={{ borderTop:`1px solid ${bord}`, padding:"10px 16px", background:hdrBg }}>
            <div style={{ maxWidth:600, margin:"0 auto", position:"relative" }}>
              <Search size={15} color={dark?C.dMute:C.mute} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}/>
              <input autoFocus value={query} onChange={e=>{setQuery(e.target.value);setPage("catalogue");setCat(0);}} placeholder={t.search} style={{ width:"100%", padding:"9px 36px 9px 34px", borderRadius:8, border:`1px solid ${bord}`, background:dark?C.dCard:"#fff", fontSize:13.5, color:text }}/>
              {query&&<button onClick={()=>{setQuery("");setSearchOpen(false);}} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", border:"none", background:"none", cursor:"pointer", color:dark?C.dMute:C.mute }}><X size={15}/></button>}
            </div>
          </div>
        )}
      </header>

      {/* ── PAGES ── */}
      {page==="home"&&(
        <>
          {/* HERO */}
          <section style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px 0", animation:"ddHero .7s ease both" }}>
            <div style={{ borderRadius:20, overflow:"hidden", position:"relative", background:C.ink, minHeight:380, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg, #1A1510 0%, #2A2015 50%, #1A1008 100%)` }}/>
              <div style={{ position:"absolute", top:20, right:20, width:200, height:200, borderRadius:999, background:`${C.gold}08` }}/>
              <div style={{ position:"absolute", bottom:-40, left:40, width:160, height:160, borderRadius:999, background:`${C.gold}05` }}/>
              <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"48px 24px", color:"#fff" }}>
                <span style={{ fontSize:10, color:C.gold, letterSpacing:5, fontWeight:600, display:"block", marginBottom:16 }}>✦ DADA'S DROP ✦</span>
                <h1 className="dd-hero-title" style={{ fontFamily:"Georgia,serif", fontSize:42, fontWeight:400, lineHeight:1.15, margin:"0 0 14px", letterSpacing:.5, maxWidth:560 }}>{t.heroTitle}</h1>
                <p style={{ fontSize:15, color:"rgba(255,255,255,.7)", maxWidth:400, margin:"0 auto 28px", lineHeight:1.6 }}>{t.heroSub} {CFG.city}.</p>
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={()=>setPage("catalogue")} style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.gold, color:C.ink, border:"none", borderRadius:8, padding:"12px 22px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    {t.discover} <ArrowRight size={16}/>
                  </button>
                  <button onClick={()=>setTrackOpen(true)} style={{ display:"inline-flex", alignItems:"center", gap:7, background:"transparent", color:"rgba(255,255,255,.8)", border:"1px solid rgba(201,168,76,.4)", borderRadius:8, padding:"12px 20px", fontWeight:600, fontSize:14, cursor:"pointer" }}>
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
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, color:text, margin:0, fontWeight:400, letterSpacing:.3 }}>{t.bestSeller}</h2>
            </div>
            <div className="dd-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
              {bestSellers.map((p,i)=><ProductCard key={p.id} p={p} t={t} idx={i} mounted={mounted} dark={dark} onOpen={setSelected} onAdd={addToCart}/>)}
            </div>
            <div style={{ textAlign:"center", marginTop:24 }}>
              <button onClick={()=>setPage("catalogue")} style={{ ...primaryBtn, gap:7 }}>{t.catalogue} <ArrowRight size={14}/></button>
            </div>
          </section>

          {/* AVANTAGES */}
          <section style={{ maxWidth:1200, margin:"36px auto 0", padding:"0 16px 36px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10 }}>
              {[
                { icon:<Truck size={18} color={C.gold}/>,         t:"Livraison Ouagadougou", s:"Rapide et soigné" },
                { icon:<Smartphone size={18} color={C.gold}/>,    t:"Mobile Money",           s:"Orange · Moov · Wave" },
                { icon:<ShieldCheck size={18} color={C.gold}/>,   t:"Sélection Dada",         s:"Chaque pièce choisie" },
                { icon:<MessageCircle size={18} color="#25D366"/>, t:"Commande WhatsApp",      s:"Réponse rapide" },
              ].map((f,i)=>(
                <div key={i} style={{ background:dark?C.dCard:"#fff", border:`1px solid ${bord}`, borderRadius:12, padding:"14px 15px" }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:dark?C.dBorder:C.creamD, display:"grid", placeItems:"center", marginBottom:9 }}>{f.icon}</div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:13.5, color:text, marginBottom:2 }}>{f.t}</div>
                  <div style={{ fontSize:12, color:dark?C.dMute:C.mute }}>{f.s}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {page==="catalogue"&&(
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px 40px" }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, color:text, margin:"0 0 20px", fontWeight:400 }}>{t.catalogue}</h1>
          {/* Filtres catégories */}
          <div className="dd-cats" style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
            {CATS.map((c,i)=>{
              const soon=i>=4, active=cat===i;
              return (
                <button key={c} onClick={()=>setCat(i)} className="dd-chip" style={{ padding:"7px 14px", borderRadius:999, fontSize:12.5, fontWeight:600, cursor:"pointer", border:`1.5px solid ${active?C.gold:bord}`, background:active?C.ink:(dark?C.dCard:"#fff"), color:active?C.gold:text, transition:"all .2s", whiteSpace:"nowrap" }}>
                  {c}{soon&&<span style={{ marginLeft:4, fontSize:9, opacity:.5 }}>· {lang==="fr"?"bientôt":"soon"}</span>}
                </button>
              );
            })}
          </div>
          {/* Tri & stock */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginBottom:18 }}>
            <span style={{ fontSize:13, color:dark?C.dMute:C.mute }}><strong style={{ color:text }}>{list.length}</strong> {t.itemCount}{list.length>1?"s":""}</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button onClick={()=>setInStock(v=>!v)} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 11px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, border:`1.5px solid ${inStock?C.gold:bord}`, background:inStock?(dark?"#1A1510":C.creamD):(dark?C.dCard:"#fff"), color:text }}>
                <span style={{ width:14, height:14, borderRadius:3, border:`2px solid ${inStock?C.gold:(dark?C.dBorder:"#ddd")}`, background:inStock?C.gold:"transparent", display:"grid", placeItems:"center" }}>
                  {inStock&&<Check size={9} color={C.ink}/>}
                </span>
                {t.inStock}
              </button>
              <select value={sort} onChange={e=>setSort(e.target.value)} style={{ ...inpStyle(dark), width:"auto", padding:"7px 12px", fontSize:12 }}>
                <option value="new">{t.sortNew}</option>
                <option value="asc">{t.sortAsc}</option>
                <option value="desc">{t.sortDesc}</option>
              </select>
            </div>
          </div>
          {/* Grille */}
          {cat>=4?(
            <div style={{ textAlign:"center", padding:"60px 16px", color:dark?C.dMute:"#bbb" }}>
              <div style={{ fontSize:40 }}>{["👟","💍","🌸","💋","👗"][cat-4]}</div>
              <h3 style={{ fontFamily:"Georgia,serif", color:text, margin:"10px 0 5px", fontSize:17 }}>{CATS[cat]} — {lang==="fr"?"bientôt disponible":"coming soon"}</h3>
            </div>
          ):list.length===0?(
            <div style={{ textAlign:"center", padding:"60px 16px" }}>
              <Search size={36} color={dark?C.dBorder:"#ddd"}/>
              <p style={{ marginTop:10, color:dark?C.dMute:"#bbb", fontSize:14 }}>{t.noResult}<br/>{t.noResultHint}</p>
            </div>
          ):(
            <div className="dd-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
              {list.map((p,i)=><ProductCard key={p.id} p={p} t={t} idx={i} mounted={mounted} dark={dark} onOpen={setSelected} onAdd={addToCart}/>)}
            </div>
          )}
        </section>
      )}

      {page==="about"&&<AboutPage dark={dark}/>}

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
          <span style={{ fontSize:11, color:C.gold, letterSpacing:1 }}>✦ OUAGADOUGOU · BURKINA FASO ✦</span>
        </div>
      </footer>

      {/* WHATSAPP FLOTTANT */}
      <a href={`https://wa.me/${CFG.whatsapp}`} target="_blank" rel="noreferrer" style={{ position:"fixed", bottom:20, right:18, width:48, height:48, borderRadius:999, background:"#25D366", display:"grid", placeItems:"center", zIndex:49, boxShadow:"0 4px 16px rgba(37,211,102,.4)", textDecoration:"none" }}>
        <MessageCircle size={22} color="#fff"/>
      </a>

      {/* MODALS */}
      <SideMenu open={menuOpen} onClose={()=>setMenuOpen(false)} t={t} lang={lang} setLang={setLang} dark={dark} setPage={setPage} setCat={setCat} onAdminOpen={()=>setAdminOpen(true)}/>
      <ProductModal p={selected} t={t} dark={dark} onClose={()=>setSelected(null)} onAdd={addToCart}/>
      <CartDrawer open={cartOpen} cart={cart} products={products} t={t} dark={dark} onClose={()=>setCartOpen(false)} onQty={setQty} onRemove={removeItem} onCheckout={()=>{setCartOpen(false);setCheckout(true);}}/>
      <Checkout open={checkout} lines={lines} total={total} t={t} dark={dark} onClose={()=>setCheckout(false)}/>
      <TrackModal open={trackOpen} t={t} dark={dark} onClose={()=>setTrackOpen(false)}/>
      {adminOpen&&<AdminDashboard products={products} setProducts={setProducts} orders={demoOrders} t={t} dark={dark} onClose={()=>setAdminOpen(false)}/>}
    </div>
  );
}