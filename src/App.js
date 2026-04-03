import { useState, useEffect } from "react";
const SUPABASE_URL = "https://pbrmudrbfqvoxaqkzemy.supabase.co";
const SUPABASE_KEY = "sb_publishable_iEEcimqKL1DtZY1XI8gktQ_r_R9gmFe";
const SERVICES = ["Tiquete Nacional","Tiquete Internacional","Hospedaje","Silla","Equipaje","Mascota","TKT-Cambios","Asistencia","Traslados","Paquetes","Crucero","Viáticos","Otro"];
const CLIENT_PAY = ["Transferencia Bancolombia","Consignación Bancolombia","Datafono Bancolombia","Transferencia Banco Bogotá","Efectivo","Crédito"];
const PROVIDER_PAY = ["Transferencia Bancolombia","Consignación Bancolombia","Datafono Bancolombia","Precompra CLIC","Efectivo","Crédito"];
const STATUSES = ["Pendiente","Confirmado","Pagado","Cancelado"];
// eslint-disable-next-line
const SCOL = {Pendiente:"bg-yellow-100 text-yellow-800",Confirmado:"bg-blue-100 text-blue-800",Pagado:"bg-green-100 text-green-800",Cancelado:"bg-red-100 text-red-800"};
const VENDORS = ["Mayelis Lopez","Francisco Guerra","Erick Moreno","Dany Muñoz","Aura Florez","Melissa Lopez"];
// eslint-disable-next-line
const PCATS = ["Aerolínea","Hotel","Transportista","Tour Operador","Aseguradora","Otro"];
const PICONS = {"Transferencia Bancolombia":"🏦","Consignación Bancolombia":"🏦","Datafono Bancolombia":"💳","Transferencia Banco Bogotá":"🏦","Precompra CLIC":"💻","Efectivo":"💵","Crédito":"📋"};

const fmt = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n||0);
const today = () => new Date().toISOString().split("T")[0];

async function api(path, method="GET", body) {
  const opts = {
    method,
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer "+SUPABASE_KEY, "Content-Type":"application/json", Prefer:"return=representation" }
  };
  if(body) opts.body = JSON.stringify(body);
  const r = await fetch(SUPABASE_URL+"/rest/v1/"+path, opts);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

function Badge({m, side}) {
  return <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,fontWeight:600,background:side==="c"?"#fff1f1":"#eff6ff",color:side==="c"?"#b91c1c":"#1d4ed8"}}>{PICONS[m]||"💰"} {m}</span>;
}

function Card({icon,label,value,sub,color}) {
  const bg = {red:"#b91c1c",green:"#16a34a",yellow:"#d97706",purple:"#7c3aed"}[color]||"#b91c1c";
  return (
    <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.1)",padding:16,display:"flex",gap:12,alignItems:"flex-start"}}>
      <div style={{background:bg,color:"white",borderRadius:8,padding:8,fontSize:20}}>{icon}</div>
      <div>
        <div style={{fontSize:11,color:"#9ca3af"}}>{label}</div>
        <div style={{fontWeight:700,color:"#1f2937",fontSize:14}}>{value}</div>
        <div style={{fontSize:11,color:"#9ca3af"}}>{sub}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [sales,setSales] = useState([]);
  const [clients,setClients] = useState([]);
  const [providers,setProviders] = useState([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [tab,setTab] = useState("dashboard");
  const [saleForm,setSaleForm] = useState(false);
  const [editSale,setEditSale] = useState(null);
  const [fd,setFd] = useState("");
  const [fv,setFv] = useState("");
  const [fs,setFs] = useState("");

  async function load() {
    try {
      const [s,c,p] = await Promise.all([
        api("sales?select=*&order=date.desc"),
        api("clients?select=*&order=name.asc"),
        api("providers?select=*&order=name.asc")
      ]);
      setSales((s||[]).map(x=>({...x,services:Array.isArray(x.services)?x.services:[],clientPayMethod:x.client_pay_method||"Transferencia Bancolombia",providerPayMethod:x.provider_pay_method||"Transferencia Bancolombia"})));
      setClients(c||[]);
      setProviders(p||[]);
    } catch(e){ console.error(e); }
    setLoading(false);
  }

  useEffect(()=>{load(); const iv=setInterval(load,8000); return()=>clearInterval(iv);},[]);

  async function saveSale(f) {
    setSaving(true);
    const d={date:f.date,client:f.client,vendor:f.vendor,services:f.services,client_pay_method:f.clientPayMethod,provider_pay_method:f.providerPayMethod,paid:f.paid,total:f.total,status:f.status,notes:f.notes||""};
    try {
      if(editSale) await api("sales?id=eq."+editSale.id,"PATCH",d);
      else await api("sales","POST",d);
      await load();
    } catch(e){console.error(e);}
    setSaving(false); setSaleForm(false); setEditSale(null);
  }

  async function delSale(id) {
    if(!window.confirm("¿Eliminar esta venta?")) return;
    setSaving(true); await api("sales?id=eq."+id,"DELETE"); await load(); setSaving(false);
  }

  function exportCSV(rows,name) {
    const csv="\uFEFF"+rows.map(r=>r.map(c=>'"'+String(c||"").replace(/"/g,'""')+'"').join(",")).join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"})); a.download=name; a.click();
  }

  const allTotal=sales.reduce((a,s)=>a+s.total,0);
  const allPaid=sales.reduce((a,s)=>a+s.paid,0);
  const allCost=sales.reduce((a,s)=>a+s.services.reduce((b,sv)=>b+(parseFloat(sv.cost)||0),0),0);
  const todayS=sales.filter(s=>s.date===today());
  const filtered=sales.filter(s=>(!fd||s.date===fd)&&(!fv||s.vendor===fv)&&(!fs||s.status===fs));
  const vendorStats={};
  sales.forEach(s=>{if(!vendorStats[s.vendor])vendorStats[s.vendor]={total:0,count:0}; vendorStats[s.vendor].total+=s.total; vendorStats[s.vendor].count++;});
  const svcCount={};
  sales.forEach(s=>s.services.forEach(sv=>{svcCount[sv.type]=(svcCount[sv.type]||0)+1;}));

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#f9fafb",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
      <div style={{fontSize:48}}>✈️</div>
      <div style={{color:"#b91c1c",fontWeight:700,fontSize:18}}>Cargando 9Sitios...</div>
      <div style={{color:"#9ca3af",fontSize:14}}>Conectando con Supabase</div>
    </div>
  );

  const TABS=[{id:"dashboard",label:"Dashboard",icon:"📊"},{id:"sales",label:"Ventas",icon:"💼"},{id:"clients",label:"Clientes",icon:"👥"},{id:"providers",label:"Proveedores",icon:"🏢"},{id:"reports",label:"Informes",icon:"📈"}];

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui,sans-serif"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(to right,#7f1d1d,#b91c1c)",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:32}}>📍</div>
          <div>
            <div style={{fontWeight:700,fontSize:18,letterSpacing:2}}>SITIOS</div>
            <div style={{fontSize:10,color:"#fca5a5",letterSpacing:3,textTransform:"uppercase"}}>Eventos y Turismo</div>
          </div>
        </div>
        <div style={{textAlign:"right",fontSize:12}}>
          <div style={{fontWeight:600}}>{new Date().toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"})}</div>
          <div style={{color:saving?"#fde047":"#86efac",fontSize:11}}>{saving?"⏳ Guardando...":"🟢 En línea · "+sales.length+" ventas"}</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{background:"white",borderBottom:"1px solid #e5e7eb",display:"flex",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"12px 16px",fontSize:13,fontWeight:500,border:"none",borderBottom:tab===t.id?"2px solid #b91c1c":"2px solid transparent",color:tab===t.id?"#b91c1c":"#6b7280",background:"none",cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:16,maxWidth:1000,margin:"0 auto"}}>

        {tab==="dashboard" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              <Card icon="💰" label="Ventas Hoy" value={fmt(todayS.reduce((a,s)=>a+s.total,0))} sub={todayS.length+" transacciones"} color="red"/>
              <Card icon="✅" label="Total Cobrado" value={fmt(allPaid)} sub="pagos recibidos" color="green"/>
              <Card icon="⏳" label="Por Cobrar" value={fmt(allTotal-allPaid)} sub="saldo pendiente" color="yellow"/>
              <Card icon="📦" label="Ganancia" value={fmt(allTotal-allCost)} sub="margen acumulado" color="purple"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.1)",padding:16}}>
                <div style={{fontWeight:700,color:"#374151",marginBottom:12}}>🏆 Últimas Ventas</div>
                {sales.slice(0,5).map(s=>(
                  <div key={s.id} style={{borderBottom:"1px solid #f3f4f6",paddingBottom:8,marginBottom:8,display:"flex",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14}}>{s.client}</div>
                      <div style={{fontSize:11,color:"#9ca3af"}}>{s.services.map(sv=>sv.type).join(", ")} · {s.date}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,fontSize:14}}>{fmt(s.total)}</div>
                      <span style={{fontSize:11,padding:"1px 8px",borderRadius:99,background:s.status==="Pagado"?"#dcfce7":s.status==="Pendiente"?"#fef9c3":"#dbeafe",color:s.status==="Pagado"?"#166534":s.status==="Pendiente"?"#854d0e":"#1e40af"}}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.1)",padding:16}}>
                <div style={{fontWeight:700,color:"#374151",marginBottom:12}}>👤 Por Asesor</div>
                {Object.entries(vendorStats).sort((a,b)=>b[1].total-a[1].total).map(([k,v])=>(
                  <div key={k} style={{background:"#fff1f2",borderRadius:8,padding:"8px 12px",marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:13}}>{k}</div>
                    <div style={{color:"#b91c1c",fontWeight:700,fontSize:14}}>{fmt(v.total)}</div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>{v.count} ventas</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="sales" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{fontWeight:700,fontSize:18,color:"#1f2937"}}>💼 Ventas ({filtered.length})</h2>
              <button onClick={()=>{setEditSale(null);setSaleForm(true);}}
                style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:600,cursor:"pointer",fontSize:14}}>
                ＋ Nueva Venta
              </button>
            </div>
            <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.1)",padding:12,display:"flex",gap:8,flexWrap:"wrap"}}>
              <input type="date" value={fd} onChange={e=>setFd(e.target.value)} style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",fontSize:12}}/>
              <select value={fv} onChange={e=>setFv(e.target.value)} style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",fontSize:12}}>
                <option value="">Todos los asesores</option>
                {VENDORS.map(v=><option key={v}>{v}</option>)}
              </select>
              <select value={fs} onChange={e=>setFs(e.target.value)} style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",fontSize:12}}>
                <option value="">Todos los estados</option>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
              {(fd||fv||fs)&&<button onClick={()=>{setFd("");setFv("");setFs("");}} style={{color:"#b91c1c",background:"none",border:"none",cursor:"pointer",fontSize:12}}>✕ Limpiar</button>}
            </div>
            {filtered.map(s=>(
              <div key={s.id} style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.1)",padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:15,color:"#1f2937"}}>{s.client}</span>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,...(s.status==="Pagado"?{background:"#dcfce7",color:"#166534"}:s.status==="Pendiente"?{background:"#fef9c3",color:"#854d0e"}:{background:"#dbeafe",color:"#1e40af"})}}>{s.status}</span>
                    </div>
                    <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>📅 {s.date} · 👤 {s.vendor}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
                      {s.services.map((sv,i)=><span key={i} style={{fontSize:11,background:"#fff1f2",color:"#b91c1c",padding:"2px 8px",borderRadius:99}}>{sv.type}{sv.desc?" — "+sv.desc:""}</span>)}
                    </div>
                    <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                      <Badge m={s.clientPayMethod} side="c"/>
                      <Badge m={s.providerPayMethod} side="p"/>
                    </div>
                    {s.notes&&<div style={{fontSize:11,color:"#9ca3af",marginTop:4,fontStyle:"italic"}}>📝 {s.notes}</div>}
                  </div>
                  <div style={{textAlign:"right",marginLeft:12}}>
                    <div style={{fontWeight:700,fontSize:15}}>{fmt(s.total)}</div>
                    <div style={{fontSize:11,color:"#16a34a"}}>Cobrado: {fmt(s.paid)}</div>
                    {s.total>s.paid&&<div style={{fontSize:11,color:"#b91c1c"}}>Debe: {fmt(s.total-s.paid)}</div>}
                    <div style={{display:"flex",gap:4,marginTop:6,justifyContent:"flex-end"}}>
                      <button onClick={()=>{setEditSale(s);setSaleForm(true);}} style={{fontSize:12,background:"#f3f4f6",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer"}}>✏️</button>
                      <button onClick={()=>delSale(s.id)} style={{fontSize:12,background:"#fff1f2",color:"#b91c1c",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer"}}>🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length===0&&<div style={{textAlign:"center",color:"#9ca3af",padding:40,background:"white",borderRadius:12}}>No hay ventas</div>}
          </div>
        )}

        {tab==="clients" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h2 style={{fontWeight:700,fontSize:18,color:"#1f2937"}}>👥 Clientes ({clients.length})</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {clients.map(c=>{
                const cs=sales.filter(s=>s.client===c.name);
                const ct=cs.reduce((a,s)=>a+s.total,0),cp=cs.reduce((a,s)=>a+s.paid,0);
                return (
                  <div key={c.id} style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.1)",padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <div>
                        <div style={{fontWeight:700,color:"#1f2937"}}>{c.name}</div>
                        {c.email&&<div style={{fontSize:11,color:"#9ca3af"}}>📧 {c.email}</div>}
                        {c.city&&<div style={{fontSize:11,color:"#9ca3af"}}>📍 {c.city}</div>}
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,color:"#9ca3af"}}>{cs.length} compras</div>
                        <div style={{fontWeight:700,color:"#b91c1c"}}>{fmt(ct)}</div>
                        {ct>cp&&<div style={{fontSize:11,color:"#b91c1c"}}>Debe: {fmt(ct-cp)}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="providers" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h2 style={{fontWeight:700,fontSize:18,color:"#1f2937"}}>🏢 Proveedores</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {providers.map(p=>(
                <div key={p.id} style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.1)",padding:16,display:"flex",gap:12}}>
                  <div style={{fontSize:32}}>{p.category==="Aerolínea"?"✈️":p.category==="Hotel"?"🏨":"🏢"}</div>
                  <div>
                    <div style={{fontWeight:700}}>{p.name}</div>
                    <span style={{fontSize:11,background:"#fff1f2",color:"#b91c1c",padding:"2px 8px",borderRadius:99}}>{p.category}</span>
                    {p.contact&&<div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>📧 {p.contact}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="reports" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h2 style={{fontWeight:700,fontSize:18,color:"#1f2937"}}>📈 Informes</h2>
            <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.1)",padding:16}}>
              <div style={{fontWeight:700,marginBottom:12}}>👤 Rendimiento por Asesor</div>
              {Object.entries(vendorStats).sort((a,b)=>b[1].total-a[1].total).map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #f3f4f6",paddingBottom:8,marginBottom:8}}>
                  <div style={{fontWeight:600}}>{k}</div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,color:"#b91c1c"}}>{fmt(v.total)}</div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>{v.count} ventas</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.1)",padding:16}}>
              <div style={{fontWeight:700,marginBottom:8}}>📋 Exportar para OneDrive</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>{
                  const rows=[["Fecha","Cliente","Asesor","Servicios","Pago Cliente","Pago Proveedor","Total","Cobrado","Pendiente","Estado","Notas"]];
                  sales.forEach(s=>rows.push([s.date,s.client,s.vendor,s.services.map(sv=>sv.type+(sv.desc?" - "+sv.desc:"")).join("|"),s.clientPayMethod,s.providerPayMethod,s.total,s.paid,s.total-s.paid,s.status,s.notes||""]));
                  exportCSV(rows,"ventas_sitios_"+today()+".csv");
                }} style={{background:"#16a34a",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>📊 Exportar Ventas CSV</button>
                <button onClick={()=>{
                  const rows=[["Nombre","Email","Ciudad","Compras","Total","Saldo"]];
                  clients.forEach(c=>{
                    const cs=sales.filter(s=>s.client===c.name);
                    const ct=cs.reduce((a,s)=>a+s.total,0),cp=cs.reduce((a,s)=>a+s.paid,0);
                    rows.push([c.name,c.email,c.city,cs.length,ct,ct-cp]);
                  });
                  exportCSV(rows,"clientes_sitios_"+today()+".csv");
                }} style={{background:"#2563eb",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>👥 Exportar Clientes CSV</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {saleForm && <SaleFormModal initial={editSale} clients={clients} onSave={saveSale} onClose={()=>{setSaleForm(false);setEditSale(null);}}/>}
    </div>
  );
}

function SaleFormModal({initial,clients,onSave,onClose}) {
  const blank={client:"",vendor:VENDORS[0],date:today(),clientPayMethod:CLIENT_PAY[0],providerPayMethod:PROVIDER_PAY[0],paid:"",status:"Pendiente",notes:"",services:[{type:SERVICES[0],desc:"",price:"",cost:""}]};
  const [f,setF]=useState(initial?{...initial,services:initial.services||[{type:SERVICES[0],desc:"",price:"",cost:""}]}:blank);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const total=f.services.reduce((a,s)=>a+(parseFloat(s.price)||0),0);
  const cost=f.services.reduce((a,s)=>a+(parseFloat(s.cost)||0),0);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:16}}>
      <div style={{background:"white",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid #e5e7eb"}}>
          <h3 style={{fontWeight:700,fontSize:16}}>{initial?"Editar Venta":"Nueva Venta"}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#9ca3af"}}>✕</button>
        </div>
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:12,color:"#6b7280"}}>Cliente</label>
              <input list="cls2" value={f.client} onChange={e=>set("client",e.target.value)} placeholder="Cliente"
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,marginTop:2,boxSizing:"border-box"}}/>
              <datalist id="cls2">{clients.map(c=><option key={c.id} value={c.name}/>)}</datalist>
            </div>
            <div>
              <label style={{fontSize:12,color:"#6b7280"}}>Asesor</label>
              <select value={f.vendor} onChange={e=>set("vendor",e.target.value)}
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,marginTop:2,boxSizing:"border-box"}}>
                {VENDORS.map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:12,color:"#6b7280"}}>Fecha</label>
              <input type="date" value={f.date} onChange={e=>set("date",e.target.value)}
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,marginTop:2,boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={{fontSize:12,color:"#6b7280"}}>Estado</label>
              <select value={f.status} onChange={e=>set("status",e.target.value)}
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,marginTop:2,boxSizing:"border-box"}}>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{background:"#f9fafb",borderRadius:10,padding:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:"#b91c1c"}}>💳 Pago Cliente</label>
              <select value={f.clientPayMethod} onChange={e=>set("clientPayMethod",e.target.value)}
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:13,marginTop:4,boxSizing:"border-box",background:"white"}}>
                {CLIENT_PAY.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:"#1d4ed8"}}>🏢 Pago Proveedor</label>
              <select value={f.providerPayMethod} onChange={e=>set("providerPayMethod",e.target.value)}
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:13,marginTop:4,boxSizing:"border-box",background:"white"}}>
                {PROVIDER_PAY.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Servicios</label>
              <button onClick={()=>setF(p=>({...p,services:[...p.services,{type:SERVICES[0],desc:"",price:"",cost:""}]}))}
                style={{fontSize:12,background:"#fff1f2",color:"#b91c1c",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>＋ Agregar</button>
            </div>
            {f.services.map((s,i)=>(
              <div key={i} style={{border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginBottom:8,background:"#f9fafb"}}>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <select value={s.type} onChange={e=>{const v=e.target.value;setF(p=>({...p,services:p.services.map((x,j)=>j===i?{...x,type:v}:x)}));}}
                    style={{flex:1,border:"1px solid #e5e7eb",borderRadius:6,padding:"6px 8px",fontSize:12}}>
                    {SERVICES.map(sv=><option key={sv}>{sv}</option>)}
                  </select>
                  {f.services.length>1&&<button onClick={()=>setF(p=>({...p,services:p.services.filter((_,j)=>j!==i)}))} style={{color:"#b91c1c",background:"none",border:"none",cursor:"pointer"}}>✕</button>}
                </div>
                <input value={s.desc} onChange={e=>{const v=e.target.value;setF(p=>({...p,services:p.services.map((x,j)=>j===i?{...x,desc:v}:x)}));}}
                  placeholder="Ruta / descripción (ej: BOG-MDE)" style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,padding:"6px 8px",fontSize:12,marginBottom:8,boxSizing:"border-box"}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div>
                    <label style={{fontSize:11,color:"#9ca3af"}}>Precio venta</label>
                    <input type="number" value={s.price} onChange={e=>{const v=e.target.value;setF(p=>({...p,services:p.services.map((x,j)=>j===i?{...x,price:v}:x)}));}}
                      placeholder="0" style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,padding:"6px 8px",fontSize:12,boxSizing:"border-box"}}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:"#9ca3af"}}>Costo proveedor</label>
                    <input type="number" value={s.cost} onChange={e=>{const v=e.target.value;setF(p=>({...p,services:p.services.map((x,j)=>j===i?{...x,cost:v}:x)}));}}
                      placeholder="0" style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,padding:"6px 8px",fontSize:12,boxSizing:"border-box"}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:12,color:"#6b7280"}}>Valor Pagado</label>
              <input type="number" value={f.paid} onChange={e=>set("paid",e.target.value)} placeholder={total}
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,marginTop:2,boxSizing:"border-box"}}/>
            </div>
            <div style={{background:"#fff1f2",borderRadius:8,padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:"#6b7280"}}>Total:</span><span style={{fontWeight:700}}>{fmt(total)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:4}}><span style={{color:"#6b7280"}}>Costo:</span><span style={{fontWeight:700,color:"#6b7280"}}>{fmt(cost)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:4}}><span style={{color:"#16a34a",fontWeight:600}}>Ganancia:</span><span style={{fontWeight:700,color:"#16a34a"}}>{fmt(total-cost)}</span></div>
            </div>
          </div>
          <div>
            <label style={{fontSize:12,color:"#6b7280"}}>Notas / Código de reserva</label>
            <textarea value={f.notes} onChange={e=>set("notes",e.target.value)} rows={2} placeholder="Ej: E4687 - AVIANCA PRIORITY"
              style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,marginTop:2,boxSizing:"border-box",resize:"vertical"}}/>
          </div>
          <button onClick={()=>onSave({...f,total,paid:parseFloat(f.paid)||total})}
            style={{width:"100%",background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:"pointer"}}>
            {initial?"Guardar Cambios":"Registrar Venta"}
          </button>
        </div>
      </div>
    </div>
  );
}