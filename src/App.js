import { useState, useEffect } from "react";

const SUPABASE_URL = "https://pbrmudrbfqvoxaqkzemy.supabase.co";
const SUPABASE_KEY = "sb_publishable_iEEcimqKL1DtZY1XI8gktQ_r_R9gmFe";

const SERVICIOS = ["Tiquete Nacional","Tiquete Internacional","Hospedaje","Silla","Equipaje","Mascota","TKT-Cambios","Asistencia","Traslados","Paquetes","Crucero","Viáticos","Otro"];
const FORMAS_PAGO_CLIENTE = ["Transferencia Bancolombia","Consignación Bancolombia","Datafono Bancolombia","Transferencia Banco Bogotá","Efectivo","Crédito"];
const FORMAS_PAGO_PROVEEDOR = ["Transferencia Bancolombia","Consignación Bancolombia","Datafono Bancolombia","Precompra CLIC","Efectivo","Crédito"];
const ESTADOS_FACTURA = ["Pendiente","Parcial","Pagado","Vencido"];
const ASESORES = ["Mayelis Lopez","Francisco Guerra","Erick Moreno","Dany Muñoz","Aura Florez","Melissa Lopez"];
const TIPOS_CLIENTE = ["Particular","Corporativo","Contrato"];
const TIPOS_EMISION = ["PRIORITY","SITIOS","PRECOMPRA CLIC","SATENA","HOTEL","OTRO"];

const fmt = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n||0);
const today = () => new Date().toISOString().split("T")[0];

const ECOL = {Pendiente:"#fef9c3|#854d0e",Parcial:"#dbeafe|#1e40af",Pagado:"#dcfce7|#166534",Vencido:"#fee2e2|#991b1b"};
const ebg = s => (ECOL[s]||"#f3f4f6|#374151").split("|")[0];
const efg = s => (ECOL[s]||"#f3f4f6|#374151").split("|")[1];

async function api(path, method="GET", body) {
  const r = await fetch(SUPABASE_URL+"/rest/v1/"+path, {
    method,
    headers:{ apikey:SUPABASE_KEY, Authorization:"Bearer "+SUPABASE_KEY, "Content-Type":"application/json", Prefer:"return=representation" },
    body: body ? JSON.stringify(body) : undefined
  });
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

function Modal({title, onClose, children, wide}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:16,overflowY:"auto"}}>
      <div style={{background:"white",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",width:"100%",maxWidth:wide?800:520,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid #e5e7eb",position:"sticky",top:0,background:"white",zIndex:1}}>
          <h3 style={{fontWeight:700,fontSize:16,margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#9ca3af"}}>✕</button>
        </div>
        <div style={{padding:20}}>{children}</div>
      </div>
    </div>
  );
}

function Input({label, value, onChange, type="text", placeholder, required}) {
  return (
    <div>
      <label style={{fontSize:12,color:"#6b7280",display:"block",marginBottom:4}}>{label}{required&&<span style={{color:"#ef4444"}}> *</span>}</label>
      <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,boxSizing:"border-box"}}/>
    </div>
  );
}

function Select({label, value, onChange, options}) {
  return (
    <div>
      <label style={{fontSize:12,color:"#6b7280",display:"block",marginBottom:4}}>{label}</label>
      <select value={value||""} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,boxSizing:"border-box",background:"white"}}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Badge({label, bg, fg}) {
  return <span style={{fontSize:11,padding:"2px 10px",borderRadius:99,background:bg||"#f3f4f6",color:fg||"#374151",fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
}

function Card({icon,label,value,sub,color}) {
  const colors = {red:"#b91c1c",green:"#16a34a",yellow:"#d97706",purple:"#7c3aed",blue:"#2563eb"};
  return (
    <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:16,display:"flex",gap:12,alignItems:"flex-start"}}>
      <div style={{background:colors[color]||"#b91c1c",color:"white",borderRadius:8,padding:"8px 10px",fontSize:20,flexShrink:0}}>{icon}</div>
      <div>
        <div style={{fontSize:11,color:"#9ca3af"}}>{label}</div>
        <div style={{fontWeight:700,color:"#1f2937",fontSize:15}}>{value}</div>
        <div style={{fontSize:11,color:"#9ca3af"}}>{sub}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODALES DE FORMULARIO
// ─────────────────────────────────────────────

function FormCliente({initial, onSave, onClose}) {
  const [f,setF] = useState(initial||{nombre:"",tipo:"Particular",nit_cedula:"",email:"",telefono:"",ciudad:"Montería",direccion:"",observaciones:""});
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Cliente":"Nuevo Cliente"} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Nombre completo" value={f.nombre} onChange={v=>s("nombre",v)} required/>
          <Select label="Tipo" value={f.tipo} onChange={v=>s("tipo",v)} options={TIPOS_CLIENTE}/>
          <Input label="NIT / Cédula" value={f.nit_cedula} onChange={v=>s("nit_cedula",v)}/>
          <Input label="Teléfono" value={f.telefono} onChange={v=>s("telefono",v)} type="tel"/>
          <Input label="Email" value={f.email} onChange={v=>s("email",v)} type="email"/>
          <Input label="Ciudad" value={f.ciudad} onChange={v=>s("ciudad",v)}/>
        </div>
        <Input label="Dirección" value={f.direccion} onChange={v=>s("direccion",v)}/>
        <div>
          <label style={{fontSize:12,color:"#6b7280",display:"block",marginBottom:4}}>Observaciones</label>
          <textarea value={f.observaciones||""} onChange={e=>s("observaciones",e.target.value)} rows={2}
            style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,boxSizing:"border-box",resize:"vertical"}}/>
        </div>
        <button onClick={()=>onSave(f)} style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:"pointer"}}>
          {initial?"Guardar Cambios":"Crear Cliente"}
        </button>
      </div>
    </Modal>
  );
}

function FormProveedor({initial, onSave, onClose}) {
  const [f,setF] = useState(initial||{nombre:"",categoria:"Aerolínea",email:"",telefono:"",contacto_principal:""});
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Proveedor":"Nuevo Proveedor"} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Nombre" value={f.nombre} onChange={v=>s("nombre",v)} required/>
          <Select label="Categoría" value={f.categoria} onChange={v=>s("categoria",v)} options={["Aerolínea","Hotel","Transportista","Tour Operador","Aseguradora","Otro"]}/>
          <Input label="Contacto principal" value={f.contacto_principal} onChange={v=>s("contacto_principal",v)}/>
          <Input label="Teléfono" value={f.telefono} onChange={v=>s("telefono",v)} type="tel"/>
          <Input label="Email" value={f.email} onChange={v=>s("email",v)} type="email"/>
        </div>
        <button onClick={()=>onSave(f)} style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:"pointer"}}>
          {initial?"Guardar Cambios":"Crear Proveedor"}
        </button>
      </div>
    </Modal>
  );
}

function FormFactura({initial, clientes, onSave, onClose}) {
  const [f,setF] = useState(initial||{numero:"",cliente_id:"",fecha_emision:today(),total:0,estado:"Pendiente",asesor:ASESORES[0],observaciones:""});
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Factura":"Nueva Factura"} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Número de factura" value={f.numero} onChange={v=>s("numero",v)} placeholder="FE1500" required/>
          <div>
            <label style={{fontSize:12,color:"#6b7280",display:"block",marginBottom:4}}>Cliente <span style={{color:"#ef4444"}}>*</span></label>
            <select value={f.cliente_id||""} onChange={e=>s("cliente_id",e.target.value)}
              style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,boxSizing:"border-box",background:"white"}}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <Input label="Fecha emisión" value={f.fecha_emision} onChange={v=>s("fecha_emision",v)} type="date"/>
          <Select label="Asesor" value={f.asesor} onChange={v=>s("asesor",v)} options={ASESORES}/>
          <Input label="Total factura" value={f.total} onChange={v=>s("total",parseFloat(v)||0)} type="number"/>
          <Select label="Estado" value={f.estado} onChange={v=>s("estado",v)} options={ESTADOS_FACTURA}/>
        </div>
        <div>
          <label style={{fontSize:12,color:"#6b7280",display:"block",marginBottom:4}}>Observaciones</label>
          <textarea value={f.observaciones||""} onChange={e=>s("observaciones",e.target.value)} rows={2}
            style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,boxSizing:"border-box",resize:"vertical"}}/>
        </div>
        <button onClick={()=>onSave(f)} style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:"pointer"}}>
          {initial?"Guardar Cambios":"Crear Factura"}
        </button>
      </div>
    </Modal>
  );
}

function FormAbono({facturaId, facturaNum, onSave, onClose}) {
  const [f,setF] = useState({factura_id:facturaId,fecha:today(),monto:"",forma_pago:FORMAS_PAGO_CLIENTE[0],referencia:"",registrado_por:ASESORES[0],observaciones:""});
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title={"Registrar Abono — "+facturaNum} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Fecha" value={f.fecha} onChange={v=>s("fecha",v)} type="date"/>
          <Input label="Monto" value={f.monto} onChange={v=>s("monto",v)} type="number" placeholder="0" required/>
          <Select label="Forma de pago" value={f.forma_pago} onChange={v=>s("forma_pago",v)} options={FORMAS_PAGO_CLIENTE}/>
          <Input label="Referencia / Comprobante" value={f.referencia} onChange={v=>s("referencia",v)}/>
          <Select label="Registrado por" value={f.registrado_por} onChange={v=>s("registrado_por",v)} options={ASESORES}/>
        </div>
        <Input label="Observaciones" value={f.observaciones} onChange={v=>s("observaciones",v)}/>
        <button onClick={()=>onSave({...f,monto:parseFloat(f.monto)||0})}
          style={{background:"#16a34a",color:"white",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:"pointer"}}>
          Registrar Abono
        </button>
      </div>
    </Modal>
  );
}

function FormEmision({initial, clientes, proveedores, facturas, onSave, onClose}) {
  const [f,setF] = useState(initial||{
    codigo:"", factura_id:"", fecha_emision:today(), fecha_vuelo:"",
    cliente_id:"", pasajero:"", cedula_pasajero:"", email_pasajero:"",
    tipo_servicio:SERVICIOS[0], descripcion:"", ruta:"",
    proveedor_id:"", cuenta_proveedor:"", tipo_emision:TIPOS_EMISION[0], codigo_reserva:"",
    costo:0, fee_datafono:0, fee_servicio:0, precio_venta:0, ganancia:0, utilidad_asesor:0,
    asesor:ASESORES[0], forma_pago_cliente:FORMAS_PAGO_CLIENTE[0], forma_pago_proveedor:FORMAS_PAGO_PROVEEDOR[0],
    observaciones:""
  });
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  const ganancia = (parseFloat(f.precio_venta)||0) - (parseFloat(f.costo)||0) - (parseFloat(f.fee_datafono)||0);
  return (
    <Modal title={initial?"Editar Emisión":"Nueva Emisión"} onClose={onClose} wide>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"#f9fafb",borderRadius:10,padding:14}}>
          <div style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:10}}>📋 Información General</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Input label="Código emisión" value={f.codigo} onChange={v=>s("codigo",v)} placeholder="E4687"/>
            <div>
              <label style={{fontSize:12,color:"#6b7280",display:"block",marginBottom:4}}>Factura</label>
              <select value={f.factura_id||""} onChange={e=>s("factura_id",e.target.value)}
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,boxSizing:"border-box",background:"white"}}>
                <option value="">Sin factura</option>
                {facturas.map(fc=><option key={fc.id} value={fc.id}>{fc.numero}</option>)}
              </select>
            </div>
            <Select label="Asesor" value={f.asesor} onChange={v=>s("asesor",v)} options={ASESORES}/>
            <Input label="Fecha emisión" value={f.fecha_emision} onChange={v=>s("fecha_emision",v)} type="date"/>
            <Input label="Fecha vuelo" value={f.fecha_vuelo} onChange={v=>s("fecha_vuelo",v)} type="date"/>
          </div>
        </div>

        <div style={{background:"#f9fafb",borderRadius:10,padding:14}}>
          <div style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:10}}>👤 Pasajero / Cliente</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:12,color:"#6b7280",display:"block",marginBottom:4}}>Cliente</label>
              <select value={f.cliente_id||""} onChange={e=>s("cliente_id",e.target.value)}
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,boxSizing:"border-box",background:"white"}}>
                <option value="">Seleccionar...</option>
                {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <Input label="Pasajero (si difiere del cliente)" value={f.pasajero} onChange={v=>s("pasajero",v)}/>
            <Input label="Cédula pasajero" value={f.cedula_pasajero} onChange={v=>s("cedula_pasajero",v)}/>
            <Input label="Email pasajero" value={f.email_pasajero} onChange={v=>s("email_pasajero",v)} type="email"/>
          </div>
        </div>

        <div style={{background:"#f9fafb",borderRadius:10,padding:14}}>
          <div style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:10}}>✈️ Servicio</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Select label="Tipo de servicio" value={f.tipo_servicio} onChange={v=>s("tipo_servicio",v)} options={SERVICIOS}/>
            <Input label="Ruta" value={f.ruta} onChange={v=>s("ruta",v)} placeholder="MTR-BOG-MDE"/>
            <Input label="Descripción" value={f.descripcion} onChange={v=>s("descripcion",v)} placeholder="Detalle del servicio"/>
            <Input label="Código de reserva" value={f.codigo_reserva} onChange={v=>s("codigo_reserva",v)} placeholder="134-5527378255"/>
          </div>
        </div>

        <div style={{background:"#f9fafb",borderRadius:10,padding:14}}>
          <div style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:10}}>🏢 Proveedor</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:12,color:"#6b7280",display:"block",marginBottom:4}}>Proveedor</label>
              <select value={f.proveedor_id||""} onChange={e=>s("proveedor_id",e.target.value)}
                style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:14,boxSizing:"border-box",background:"white"}}>
                <option value="">Seleccionar...</option>
                {proveedores.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <Input label="Tarjeta / Cuenta" value={f.cuenta_proveedor} onChange={v=>s("cuenta_proveedor",v)} placeholder="2275, 7459, 4013..."/>
            <Select label="Tipo emisión" value={f.tipo_emision} onChange={v=>s("tipo_emision",v)} options={TIPOS_EMISION}/>
            <Select label="Forma pago proveedor" value={f.forma_pago_proveedor} onChange={v=>s("forma_pago_proveedor",v)} options={FORMAS_PAGO_PROVEEDOR}/>
            <Select label="Forma pago cliente" value={f.forma_pago_cliente} onChange={v=>s("forma_pago_cliente",v)} options={FORMAS_PAGO_CLIENTE}/>
          </div>
        </div>

        <div style={{background:"#f9fafb",borderRadius:10,padding:14}}>
          <div style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:10}}>💰 Valores</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Input label="Costo proveedor" value={f.costo} onChange={v=>s("costo",v)} type="number"/>
            <Input label="Fee datafono" value={f.fee_datafono} onChange={v=>s("fee_datafono",v)} type="number"/>
            <Input label="Fee servicio" value={f.fee_servicio} onChange={v=>s("fee_servicio",v)} type="number"/>
            <Input label="Precio venta" value={f.precio_venta} onChange={v=>s("precio_venta",v)} type="number"/>
            <Input label="Utilidad asesor" value={f.utilidad_asesor} onChange={v=>s("utilidad_asesor",v)} type="number"/>
            <div style={{background:"#dcfce7",borderRadius:8,padding:12,display:"flex",flexDirection:"column",justifyContent:"center"}}>
              <div style={{fontSize:11,color:"#166534"}}>Ganancia calculada</div>
              <div style={{fontWeight:700,fontSize:18,color:"#16a34a"}}>{fmt(ganancia)}</div>
            </div>
          </div>
        </div>

        <Input label="Observaciones" value={f.observaciones} onChange={v=>s("observaciones",v)}/>
        <button onClick={()=>onSave({...f,ganancia})}
          style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:"pointer"}}>
          {initial?"Guardar Cambios":"Registrar Emisión"}
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// VISTA DETALLE CLIENTE
// ─────────────────────────────────────────────
function DetalleCliente({cliente, facturas, emisiones, onClose}) {
  const facs = facturas.filter(f=>f.cliente_id===cliente.id);
  const ems = emisiones.filter(e=>e.cliente_id===cliente.id);
  const totalFacturado = facs.reduce((a,f)=>a+f.total,0);
  const totalPagado = facs.reduce((a,f)=>a+f.total_pagado,0);
  const totalEmitido = ems.reduce((a,e)=>a+(e.precio_venta||0),0);
  return (
    <Modal title={"📁 "+cliente.nombre} onClose={onClose} wide>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div style={{background:"#fff1f2",borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#9ca3af"}}>Total Facturado</div>
            <div style={{fontWeight:700,fontSize:16,color:"#b91c1c"}}>{fmt(totalFacturado)}</div>
          </div>
          <div style={{background:"#dcfce7",borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#9ca3af"}}>Total Pagado</div>
            <div style={{fontWeight:700,fontSize:16,color:"#16a34a"}}>{fmt(totalPagado)}</div>
          </div>
          <div style={{background:"#fef9c3",borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#9ca3af"}}>Saldo Pendiente</div>
            <div style={{fontWeight:700,fontSize:16,color:"#854d0e"}}>{fmt(totalFacturado-totalPagado)}</div>
          </div>
        </div>

        <div style={{background:"#f9fafb",borderRadius:10,padding:12}}>
          <div style={{fontSize:11,color:"#6b7280"}}>📧 {cliente.email||"—"} &nbsp;·&nbsp; 📱 {cliente.telefono||"—"} &nbsp;·&nbsp; 📍 {cliente.ciudad||"—"}</div>
          {cliente.nit_cedula&&<div style={{fontSize:11,color:"#6b7280",marginTop:4}}>🪪 NIT/CC: {cliente.nit_cedula}</div>}
          {cliente.direccion&&<div style={{fontSize:11,color:"#6b7280",marginTop:4}}>🏠 {cliente.direccion}</div>}
        </div>

        <div>
          <div style={{fontWeight:700,marginBottom:8,fontSize:14}}>📄 Facturas ({facs.length})</div>
          {facs.length===0?<div style={{color:"#9ca3af",fontSize:13}}>Sin facturas</div>:
          facs.map(f=>(
            <div key={f.id} style={{border:"1px solid #e5e7eb",borderRadius:10,padding:12,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,color:"#b91c1c"}}>{f.numero}</div>
                <div style={{fontSize:12,color:"#9ca3af"}}>{f.fecha_emision} · {f.asesor}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700}}>{fmt(f.total)}</div>
                <Badge label={f.estado} bg={ebg(f.estado)} fg={efg(f.estado)}/>
                {f.total>f.total_pagado&&<div style={{fontSize:11,color:"#b91c1c",marginTop:2}}>Debe: {fmt(f.total-f.total_pagado)}</div>}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{fontWeight:700,marginBottom:8,fontSize:14}}>✈️ Emisiones ({ems.length}) — Total: {fmt(totalEmitido)}</div>
          <div style={{maxHeight:200,overflowY:"auto"}}>
            {ems.length===0?<div style={{color:"#9ca3af",fontSize:13}}>Sin emisiones</div>:
            ems.map(e=>(
              <div key={e.id} style={{border:"1px solid #e5e7eb",borderRadius:10,padding:10,marginBottom:6,display:"flex",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{e.codigo||"—"} · {e.pasajero||"—"}</div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>{e.tipo_servicio} · {e.ruta||e.descripcion||"—"} · {e.fecha_emision}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700,fontSize:13}}>{fmt(e.precio_venta)}</div>
                  <div style={{fontSize:11,color:"#16a34a"}}>Gan: {fmt(e.ganancia)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// VISTA DETALLE FACTURA
// ─────────────────────────────────────────────
function DetalleFactura({factura, cliente, abonos, emisiones, onAbono, onClose}) {
  const abs = abonos.filter(a=>a.factura_id===factura.id);
  const ems = emisiones.filter(e=>e.factura_id===factura.id);
  return (
    <Modal title={"Factura "+factura.numero} onClose={onClose} wide>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div style={{background:"#fff1f2",borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#9ca3af"}}>Total</div>
            <div style={{fontWeight:700,fontSize:18,color:"#b91c1c"}}>{fmt(factura.total)}</div>
          </div>
          <div style={{background:"#dcfce7",borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#9ca3af"}}>Pagado</div>
            <div style={{fontWeight:700,fontSize:18,color:"#16a34a"}}>{fmt(factura.total_pagado)}</div>
          </div>
          <div style={{background:"#fef9c3",borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#9ca3af"}}>Saldo</div>
            <div style={{fontWeight:700,fontSize:18,color:"#854d0e"}}>{fmt(factura.saldo||factura.total-factura.total_pagado)}</div>
          </div>
        </div>

        <div style={{background:"#f9fafb",borderRadius:10,padding:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:600}}>{cliente?.nombre||"—"}</div>
            <div style={{fontSize:12,color:"#9ca3af"}}>Fecha: {factura.fecha_emision} · Asesor: {factura.asesor}</div>
            {factura.observaciones&&<div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>📝 {factura.observaciones}</div>}
          </div>
          <Badge label={factura.estado} bg={ebg(factura.estado)} fg={efg(factura.estado)}/>
        </div>

        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:14}}>💳 Abonos ({abs.length})</div>
            {factura.total>factura.total_pagado&&
              <button onClick={onAbono} style={{background:"#16a34a",color:"white",border:"none",borderRadius:8,padding:"6px 14px",fontWeight:600,fontSize:13,cursor:"pointer"}}>＋ Registrar Abono</button>}
          </div>
          {abs.length===0?<div style={{color:"#9ca3af",fontSize:13}}>Sin abonos registrados</div>:
          abs.map(a=>(
            <div key={a.id} style={{border:"1px solid #e5e7eb",borderRadius:10,padding:10,marginBottom:6,display:"flex",justifyContent:"space-between"}}>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{fmt(a.monto)}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>{a.fecha} · {a.forma_pago} · {a.registrado_por}</div>
                {a.referencia&&<div style={{fontSize:11,color:"#9ca3af"}}>Ref: {a.referencia}</div>}
              </div>
              <div style={{color:"#16a34a",fontWeight:700}}>{fmt(a.monto)}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{fontWeight:700,marginBottom:8,fontSize:14}}>✈️ Emisiones ({ems.length})</div>
          <div style={{maxHeight:200,overflowY:"auto"}}>
            {ems.length===0?<div style={{color:"#9ca3af",fontSize:13}}>Sin emisiones vinculadas</div>:
            ems.map(e=>(
              <div key={e.id} style={{border:"1px solid #e5e7eb",borderRadius:10,padding:10,marginBottom:6,display:"flex",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{e.codigo||"—"} · {e.pasajero||"—"}</div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>{e.tipo_servicio} · {e.ruta||"—"} · Vuelo: {e.fecha_vuelo||"—"}</div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>Reserva: {e.codigo_reserva||"—"} · Tarjeta: {e.cuenta_proveedor||"—"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700}}>{fmt(e.precio_venta)}</div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>Costo: {fmt(e.costo)}</div>
                  <div style={{fontSize:11,color:"#16a34a"}}>Gan: {fmt(e.ganancia)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────
export default function App() {
  const [clientes,setClientes] = useState([]);
  const [proveedores,setProveedores] = useState([]);
  const [facturas,setFacturas] = useState([]);
  const [abonos,setAbonos] = useState([]);
  const [emisiones,setEmisiones] = useState([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [tab,setTab] = useState("dashboard");

  // Modales
  const [modalCliente,setModalCliente] = useState(null);
  const [modalProveedor,setModalProveedor] = useState(null);
  const [modalFactura,setModalFactura] = useState(null);
  const [modalAbono,setModalAbono] = useState(null);
  const [modalEmision,setModalEmision] = useState(null);
  const [detalleCliente,setDetalleCliente] = useState(null);
  const [detalleFactura,setDetalleFactura] = useState(null);

  // Filtros
  const [busqCliente,setBusqCliente] = useState("");
  const [busqFactura,setBusqFactura] = useState("");
  const [filtroEstadoFac,setFiltroEstadoFac] = useState("");
  const [busqEmision,setBusqEmision] = useState("");
  const [filtroAsesor,setFiltroAsesor] = useState("");
  const [filtroMes,setFiltroMes] = useState("");

  async function load() {
    try {
      const [c,p,f,a,e] = await Promise.all([
        api("clientes?select=*&order=nombre.asc"),
        api("proveedores?select=*&order=nombre.asc"),
        api("facturas?select=*&order=fecha_emision.desc"),
        api("abonos?select=*&order=fecha.desc"),
        api("emisiones?select=*&order=fecha_emision.desc")
      ]);
      setClientes(c||[]);
      setProveedores(p||[]);
      setFacturas(f||[]);
      setAbonos(a||[]);
      setEmisiones(e||[]);
    } catch(err){ console.error(err); }
    setLoading(false);
  }

  useEffect(()=>{ load(); const iv=setInterval(load,8000); return()=>clearInterval(iv); },[]);

  async function saveCliente(data) {
    setSaving(true);
    if(modalCliente?.id) await api("clientes?id=eq."+modalCliente.id,"PATCH",data);
    else await api("clientes","POST",data);
    await load(); setSaving(false); setModalCliente(null);
  }

  async function deleteCliente(id) {
    if(!window.confirm("¿Eliminar este cliente?")) return;
    setSaving(true); await api("clientes?id=eq."+id,"DELETE"); await load(); setSaving(false);
  }

  async function saveProveedor(data) {
    setSaving(true);
    if(modalProveedor?.id) await api("proveedores?id=eq."+modalProveedor.id,"PATCH",data);
    else await api("proveedores","POST",data);
    await load(); setSaving(false); setModalProveedor(null);
  }

  async function deleteProveedor(id) {
    if(!window.confirm("¿Eliminar este proveedor?")) return;
    setSaving(true); await api("proveedores?id=eq."+id,"DELETE"); await load(); setSaving(false);
  }

  async function saveFactura(data) {
    setSaving(true);
    if(modalFactura?.id) await api("facturas?id=eq."+modalFactura.id,"PATCH",data);
    else await api("facturas","POST",data);
    await load(); setSaving(false); setModalFactura(null);
  }

  async function saveAbono(data) {
    setSaving(true);
    await api("abonos","POST",data);
    // Actualizar total_pagado en factura
    const fac = facturas.find(f=>f.id===data.factura_id);
    if(fac) {
      const newPagado = fac.total_pagado + data.monto;
      const newEstado = newPagado >= fac.total ? "Pagado" : newPagado > 0 ? "Parcial" : "Pendiente";
      await api("facturas?id=eq."+fac.id,"PATCH",{total_pagado:newPagado, estado:newEstado});
    }
    await load(); setSaving(false); setModalAbono(null);
  }

  async function saveEmision(data) {
    setSaving(true);
    if(modalEmision?.id) await api("emisiones?id=eq."+modalEmision.id,"PATCH",data);
    else await api("emisiones","POST",data);
    await load(); setSaving(false); setModalEmision(null);
  }

  async function deleteEmision(id) {
    if(!window.confirm("¿Eliminar esta emisión?")) return;
    setSaving(true); await api("emisiones?id=eq."+id,"DELETE"); await load(); setSaving(false);
  }

  function exportCSV(rows, name) {
    const csv="\uFEFF"+rows.map(r=>r.map(c=>'"'+String(c||"").replace(/"/g,'""')+'"').join(",")).join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"})); a.download=name; a.click();
  }

  // Stats dashboard
  const totalFacturado = facturas.reduce((a,f)=>a+f.total,0);
  const totalPagado = facturas.reduce((a,f)=>a+f.total_pagado,0);
  const totalGanancia = emisiones.reduce((a,e)=>a+(e.ganancia||0),0);
  const facsPendientes = facturas.filter(f=>f.estado==="Pendiente"||f.estado==="Parcial");
  const totalPendiente = facsPendientes.reduce((a,f)=>a+(f.total-f.total_pagado),0);

  // Estadísticas por asesor
  const statAsesor = {};
  emisiones.forEach(e=>{
    if(!statAsesor[e.asesor]) statAsesor[e.asesor]={ventas:0,ganancia:0,count:0};
    statAsesor[e.asesor].ventas+=e.precio_venta||0;
    statAsesor[e.asesor].ganancia+=e.ganancia||0;
    statAsesor[e.asesor].count++;
  });

  // Estadísticas por proveedor
  const statProv = {};
  emisiones.forEach(e=>{
    const p = proveedores.find(p=>p.id===e.proveedor_id);
    const n = p?.nombre||"Sin proveedor";
    if(!statProv[n]) statProv[n]={costo:0,count:0};
    statProv[n].costo+=e.costo||0;
    statProv[n].count++;
  });

  const TABS = [
    {id:"dashboard",label:"Dashboard",icon:"📊"},
    {id:"emisiones",label:"Emisiones",icon:"✈️"},
    {id:"facturas",label:"Facturas",icon:"📄"},
    {id:"clientes",label:"Clientes",icon:"👥"},
    {id:"proveedores",label:"Proveedores",icon:"🏢"},
    {id:"informes",label:"Informes",icon:"📈"},
  ];

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#f9fafb",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
      <div style={{fontSize:48}}>✈️</div>
      <div style={{color:"#b91c1c",fontWeight:700,fontSize:18}}>Cargando 9Sitios...</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui,sans-serif"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#7f1d1d,#b91c1c)",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:32}}>📍</div>
          <div>
            <div style={{fontWeight:800,fontSize:20,letterSpacing:2}}>SITIOS</div>
            <div style={{fontSize:10,color:"#fca5a5",letterSpacing:3,textTransform:"uppercase"}}>Eventos y Turismo</div>
          </div>
        </div>
        <div style={{textAlign:"right",fontSize:12}}>
          <div style={{fontWeight:600}}>{new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}</div>
          <div style={{color:saving?"#fde047":"#86efac",fontSize:11,marginTop:2}}>
            {saving?"⏳ Guardando...":"🟢 En línea · "+emisiones.length+" emisiones · "+facturas.length+" facturas"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{background:"white",borderBottom:"1px solid #e5e7eb",display:"flex",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"12px 18px",fontSize:13,fontWeight:600,border:"none",borderBottom:tab===t.id?"3px solid #b91c1c":"3px solid transparent",color:tab===t.id?"#b91c1c":"#6b7280",background:"none",cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6,transition:"all 0.2s"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:16,maxWidth:1100,margin:"0 auto"}}>

        {/* ───── DASHBOARD ───── */}
        {tab==="dashboard" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              <Card icon="📊" label="Total Facturado" value={fmt(totalFacturado)} sub={facturas.length+" facturas"} color="red"/>
              <Card icon="✅" label="Total Cobrado" value={fmt(totalPagado)} sub="pagos recibidos" color="green"/>
              <Card icon="⏳" label="Por Cobrar" value={fmt(totalPendiente)} sub={facsPendientes.length+" facturas pendientes"} color="yellow"/>
              <Card icon="💡" label="Ganancia Total" value={fmt(totalGanancia)} sub={emisiones.length+" emisiones"} color="purple"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:16}}>
                <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>👤 Rendimiento por Asesor</div>
                {Object.entries(statAsesor).sort((a,b)=>b[1].ventas-a[1].ventas).map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f3f4f6",paddingBottom:8,marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{k}</div>
                      <div style={{fontSize:11,color:"#9ca3af"}}>{v.count} emisiones</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,color:"#b91c1c",fontSize:14}}>{fmt(v.ventas)}</div>
                      <div style={{fontSize:11,color:"#16a34a"}}>Gan: {fmt(v.ganancia)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:16}}>
                <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>✈️ Emisiones por Proveedor</div>
                {Object.entries(statProv).sort((a,b)=>b[1].count-a[1].count).map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #f3f4f6",paddingBottom:8,marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:13}}>{k}</div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,fontSize:13}}>{v.count} emisiones</div>
                      <div style={{fontSize:11,color:"#9ca3af"}}>Costo: {fmt(v.costo)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:16}}>
              <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>⚠️ Facturas Pendientes de Cobro</div>
              {facsPendientes.slice(0,5).map(f=>{
                const cli = clientes.find(c=>c.id===f.cliente_id);
                return (
                  <div key={f.id} onClick={()=>setDetalleFactura(f)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f3f4f6",paddingBottom:8,marginBottom:8,cursor:"pointer"}}>
                    <div>
                      <div style={{fontWeight:700,color:"#b91c1c"}}>{f.numero}</div>
                      <div style={{fontSize:12,color:"#9ca3af"}}>{cli?.nombre||"—"} · {f.fecha_emision}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700}}>{fmt(f.total-f.total_pagado)}</div>
                      <Badge label={f.estado} bg={ebg(f.estado)} fg={efg(f.estado)}/>
                    </div>
                  </div>
                );
              })}
              {facsPendientes.length===0&&<div style={{color:"#9ca3af",fontSize:13}}>✅ No hay facturas pendientes</div>}
            </div>
          </div>
        )}

        {/* ───── EMISIONES ───── */}
        {tab==="emisiones" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <h2 style={{fontWeight:700,fontSize:18,margin:0}}>✈️ Emisiones <span style={{fontSize:13,fontWeight:400,color:"#9ca3af"}}>({emisiones.length})</span></h2>
              <button onClick={()=>setModalEmision({})} style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:14}}>＋ Nueva Emisión</button>
            </div>
            <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:12,display:"flex",gap:8,flexWrap:"wrap"}}>
              <input value={busqEmision} onChange={e=>setBusqEmision(e.target.value)} placeholder="🔍 Buscar emisión, pasajero, ruta..."
                style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 12px",fontSize:13,flex:1,minWidth:180}}/>
              <select value={filtroAsesor} onChange={e=>setFiltroAsesor(e.target.value)}
                style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",fontSize:13}}>
                <option value="">Todos los asesores</option>
                {ASESORES.map(a=><option key={a}>{a}</option>)}
              </select>
              <input value={filtroMes} onChange={e=>setFiltroMes(e.target.value)} type="month" placeholder="Mes"
                style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",fontSize:13}}/>
              {(busqEmision||filtroAsesor||filtroMes)&&<button onClick={()=>{setBusqEmision("");setFiltroAsesor("");setFiltroMes("");}} style={{color:"#b91c1c",background:"none",border:"none",cursor:"pointer",fontSize:13}}>✕ Limpiar</button>}
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflow:"hidden"}}>
                <thead>
                  <tr style={{background:"#fff1f2"}}>
                    {["Código","Fecha","Pasajero","Tipo","Ruta","Proveedor","Tarjeta","Costo","Venta","Ganancia","Asesor","Acción"].map(h=>(
                      <th key={h} style={{padding:"10px 12px",fontSize:12,color:"#6b7280",fontWeight:600,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emisiones
                    .filter(e=>{
                      const q=busqEmision.toLowerCase();
                      const matchQ=!q||(e.codigo||"").toLowerCase().includes(q)||(e.pasajero||"").toLowerCase().includes(q)||(e.ruta||"").toLowerCase().includes(q)||(e.descripcion||"").toLowerCase().includes(q);
                      const matchA=!filtroAsesor||e.asesor===filtroAsesor;
                      const matchM=!filtroMes||e.fecha_emision?.startsWith(filtroMes);
                      return matchQ&&matchA&&matchM;
                    })
                    .map(e=>{
                      const prov = proveedores.find(p=>p.id===e.proveedor_id);
                      return (
                        <tr key={e.id} style={{borderBottom:"1px solid #f3f4f6"}}>
                          <td style={{padding:"8px 12px",fontWeight:700,color:"#b91c1c",fontSize:13}}>{e.codigo||"—"}</td>
                          <td style={{padding:"8px 12px",fontSize:12,color:"#6b7280",whiteSpace:"nowrap"}}>{e.fecha_emision}</td>
                          <td style={{padding:"8px 12px",fontSize:13}}>{e.pasajero||"—"}</td>
                          <td style={{padding:"8px 12px",fontSize:12}}><Badge label={e.tipo_servicio} bg="#f3f4f6" fg="#374151"/></td>
                          <td style={{padding:"8px 12px",fontSize:12,color:"#6b7280"}}>{e.ruta||e.descripcion||"—"}</td>
                          <td style={{padding:"8px 12px",fontSize:12}}>{prov?.nombre||"—"}</td>
                          <td style={{padding:"8px 12px",fontSize:12,color:"#6b7280"}}>{e.cuenta_proveedor||"—"}</td>
                          <td style={{padding:"8px 12px",fontSize:13}}>{fmt(e.costo)}</td>
                          <td style={{padding:"8px 12px",fontWeight:700,fontSize:13}}>{fmt(e.precio_venta)}</td>
                          <td style={{padding:"8px 12px",fontSize:13,color:"#16a34a",fontWeight:600}}>{fmt(e.ganancia)}</td>
                          <td style={{padding:"8px 12px",fontSize:12,color:"#6b7280"}}>{e.asesor}</td>
                          <td style={{padding:"8px 12px"}}>
                            <div style={{display:"flex",gap:4}}>
                              <button onClick={()=>setModalEmision(e)} style={{fontSize:12,background:"#f3f4f6",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer"}}>✏️</button>
                              <button onClick={()=>deleteEmision(e.id)} style={{fontSize:12,background:"#fff1f2",color:"#b91c1c",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer"}}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ───── FACTURAS ───── */}
        {tab==="facturas" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <h2 style={{fontWeight:700,fontSize:18,margin:0}}>📄 Facturas <span style={{fontSize:13,fontWeight:400,color:"#9ca3af"}}>({facturas.length})</span></h2>
              <button onClick={()=>setModalFactura({})} style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:14}}>＋ Nueva Factura</button>
            </div>
            <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:12,display:"flex",gap:8,flexWrap:"wrap"}}>
              <input value={busqFactura} onChange={e=>setBusqFactura(e.target.value)} placeholder="🔍 Buscar factura o cliente..."
                style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 12px",fontSize:13,flex:1,minWidth:180}}/>
              <select value={filtroEstadoFac} onChange={e=>setFiltroEstadoFac(e.target.value)}
                style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",fontSize:13}}>
                <option value="">Todos los estados</option>
                {ESTADOS_FACTURA.map(s=><option key={s}>{s}</option>)}
              </select>
              {(busqFactura||filtroEstadoFac)&&<button onClick={()=>{setBusqFactura("");setFiltroEstadoFac("");}} style={{color:"#b91c1c",background:"none",border:"none",cursor:"pointer",fontSize:13}}>✕ Limpiar</button>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {facturas
                .filter(f=>{
                  const cli=clientes.find(c=>c.id===f.cliente_id);
                  const q=busqFactura.toLowerCase();
                  const matchQ=!q||f.numero.toLowerCase().includes(q)||(cli?.nombre||"").toLowerCase().includes(q);
                  const matchE=!filtroEstadoFac||f.estado===filtroEstadoFac;
                  return matchQ&&matchE;
                })
                .map(f=>{
                  const cli=clientes.find(c=>c.id===f.cliente_id);
                  const emsCount=emisiones.filter(e=>e.factura_id===f.id).length;
                  return (
                    <div key={f.id} style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:16,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}
                      onClick={()=>setDetalleFactura(f)}>
                      <div>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                          <span style={{fontWeight:800,fontSize:16,color:"#b91c1c"}}>{f.numero}</span>
                          <Badge label={f.estado} bg={ebg(f.estado)} fg={efg(f.estado)}/>
                          <span style={{fontSize:11,color:"#9ca3af"}}>{emsCount} emisiones</span>
                        </div>
                        <div style={{fontSize:13,color:"#374151",fontWeight:600}}>{cli?.nombre||"—"}</div>
                        <div style={{fontSize:12,color:"#9ca3af"}}>{f.fecha_emision} · {f.asesor}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:800,fontSize:16}}>{fmt(f.total)}</div>
                        <div style={{fontSize:12,color:"#16a34a"}}>Pagado: {fmt(f.total_pagado)}</div>
                        {f.total>f.total_pagado&&<div style={{fontSize:12,color:"#b91c1c",fontWeight:600}}>Debe: {fmt(f.total-f.total_pagado)}</div>}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ───── CLIENTES ───── */}
        {tab==="clientes" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <h2 style={{fontWeight:700,fontSize:18,margin:0}}>👥 Clientes <span style={{fontSize:13,fontWeight:400,color:"#9ca3af"}}>({clientes.length})</span></h2>
              <button onClick={()=>setModalCliente({})} style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:14}}>＋ Nuevo Cliente</button>
            </div>
            <input value={busqCliente} onChange={e=>setBusqCliente(e.target.value)} placeholder="🔍 Buscar cliente..."
              style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:13,background:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {clientes.filter(c=>!busqCliente||c.nombre.toLowerCase().includes(busqCliente.toLowerCase())).map(c=>{
                const facs=facturas.filter(f=>f.cliente_id===c.id);
                const total=facs.reduce((a,f)=>a+f.total,0);
                const pagado=facs.reduce((a,f)=>a+f.total_pagado,0);
                return (
                  <div key={c.id} style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                          <span style={{fontWeight:700,fontSize:14}}>{c.nombre}</span>
                          <Badge label={c.tipo} bg={c.tipo==="Contrato"?"#dbeafe":c.tipo==="Corporativo"?"#f3e8ff":"#f3f4f6"} fg={c.tipo==="Contrato"?"#1e40af":c.tipo==="Corporativo"?"#6b21a8":"#374151"}/>
                        </div>
                        {c.email&&<div style={{fontSize:11,color:"#9ca3af"}}>📧 {c.email}</div>}
                        {c.telefono&&<div style={{fontSize:11,color:"#9ca3af"}}>📱 {c.telefono}</div>}
                        {c.ciudad&&<div style={{fontSize:11,color:"#9ca3af"}}>📍 {c.ciudad}</div>}
                        {c.nit_cedula&&<div style={{fontSize:11,color:"#9ca3af"}}>🪪 {c.nit_cedula}</div>}
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,color:"#9ca3af"}}>{facs.length} facturas</div>
                        <div style={{fontWeight:700,color:"#b91c1c",fontSize:14}}>{fmt(total)}</div>
                        {total>pagado&&<div style={{fontSize:11,color:"#b91c1c"}}>Debe: {fmt(total-pagado)}</div>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,marginTop:10,borderTop:"1px solid #f3f4f6",paddingTop:8}}>
                      <button onClick={()=>setDetalleCliente(c)} style={{flex:1,background:"#fff1f2",color:"#b91c1c",border:"none",borderRadius:6,padding:"6px",fontSize:12,fontWeight:600,cursor:"pointer"}}>👁️ Ver historial</button>
                      <button onClick={()=>setModalCliente(c)} style={{background:"#f3f4f6",border:"none",borderRadius:6,padding:"6px 10px",fontSize:12,cursor:"pointer"}}>✏️</button>
                      <button onClick={()=>deleteCliente(c.id)} style={{background:"#fff1f2",color:"#b91c1c",border:"none",borderRadius:6,padding:"6px 10px",fontSize:12,cursor:"pointer"}}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ───── PROVEEDORES ───── */}
        {tab==="proveedores" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <h2 style={{fontWeight:700,fontSize:18,margin:0}}>🏢 Proveedores</h2>
              <button onClick={()=>setModalProveedor({})} style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:14}}>＋ Nuevo Proveedor</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {proveedores.map(p=>{
                const ems=emisiones.filter(e=>e.proveedor_id===p.id);
                const totalCosto=ems.reduce((a,e)=>a+(e.costo||0),0);
                const ic=p.categoria==="Aerolínea"?"✈️":p.categoria==="Hotel"?"🏨":p.categoria==="Transportista"?"🚌":"🏢";
                return (
                  <div key={p.id} style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:14}}>
                    <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                      <div style={{fontSize:32}}>{ic}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14}}>{p.nombre}</div>
                        <Badge label={p.categoria} bg="#fff1f2" fg="#b91c1c"/>
                        {p.contacto_principal&&<div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>👤 {p.contacto_principal}</div>}
                        {p.email&&<div style={{fontSize:11,color:"#9ca3af"}}>📧 {p.email}</div>}
                        {p.telefono&&<div style={{fontSize:11,color:"#9ca3af"}}>📱 {p.telefono}</div>}
                        <div style={{fontSize:11,color:"#6b7280",marginTop:4,fontWeight:600}}>{ems.length} emisiones · Costo total: {fmt(totalCosto)}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        <button onClick={()=>setModalProveedor(p)} style={{background:"#f3f4f6",border:"none",borderRadius:6,padding:"6px 10px",fontSize:12,cursor:"pointer"}}>✏️</button>
                        <button onClick={()=>deleteProveedor(p.id)} style={{background:"#fff1f2",color:"#b91c1c",border:"none",borderRadius:6,padding:"6px 10px",fontSize:12,cursor:"pointer"}}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ───── INFORMES ───── */}
        {tab==="informes" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <h2 style={{fontWeight:700,fontSize:18,margin:0}}>📈 Informes</h2>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:16}}>
                <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>👤 Ventas por Asesor</div>
                {Object.entries(statAsesor).sort((a,b)=>b[1].ventas-a[1].ventas).map(([k,v])=>(
                  <div key={k} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontWeight:600,fontSize:13}}>{k}</span>
                      <span style={{fontWeight:700,color:"#b91c1c"}}>{fmt(v.ventas)}</span>
                    </div>
                    <div style={{background:"#f3f4f6",borderRadius:99,height:6}}>
                      <div style={{background:"#b91c1c",borderRadius:99,height:6,width:Math.min((v.ventas/Math.max(...Object.values(statAsesor).map(x=>x.ventas),1))*100,100)+"%"}}/>
                    </div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{v.count} emisiones · Ganancia: {fmt(v.ganancia)}</div>
                  </div>
                ))}
              </div>

              <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:16}}>
                <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>✈️ Volumen por Proveedor</div>
                {Object.entries(statProv).sort((a,b)=>b[1].count-a[1].count).map(([k,v])=>(
                  <div key={k} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontWeight:600,fontSize:13}}>{k}</span>
                      <span style={{fontWeight:700}}>{v.count} emisiones</span>
                    </div>
                    <div style={{background:"#f3f4f6",borderRadius:99,height:6}}>
                      <div style={{background:"#2563eb",borderRadius:99,height:6,width:Math.min((v.count/Math.max(...Object.values(statProv).map(x=>x.count),1))*100,100)+"%"}}/>
                    </div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>Costo: {fmt(v.costo)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:16}}>
              <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>🏆 Top Clientes por Facturación</div>
              {clientes.map(c=>({
                c,
                total:facturas.filter(f=>f.cliente_id===c.id).reduce((a,f)=>a+f.total,0),
                pagado:facturas.filter(f=>f.cliente_id===c.id).reduce((a,f)=>a+f.total_pagado,0)
              })).sort((a,b)=>b.total-a.total).slice(0,8).map(({c,total,pagado})=>(
                <div key={c.id} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #f3f4f6",paddingBottom:8,marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{c.nombre}</div>
                    <Badge label={c.tipo} bg="#f3f4f6" fg="#374151"/>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,color:"#b91c1c"}}>{fmt(total)}</div>
                    {total>pagado&&<div style={{fontSize:11,color:"#b91c1c"}}>Debe: {fmt(total-pagado)}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",padding:16}}>
              <div style={{fontWeight:700,marginBottom:8,fontSize:14}}>📋 Exportar para OneDrive</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>{
                  const rows=[["Código","Fecha Emisión","Fecha Vuelo","Pasajero","Tipo","Ruta","Proveedor","Tarjeta","Costo","Fee Datafono","Fee Servicio","Precio Venta","Ganancia","Utilidad Asesor","Asesor","FP Cliente","FP Proveedor","Factura"]];
                  emisiones.forEach(e=>{
                    const p=proveedores.find(p=>p.id===e.proveedor_id);
                    const f=facturas.find(f=>f.id===e.factura_id);
                    rows.push([e.codigo,e.fecha_emision,e.fecha_vuelo,e.pasajero,e.tipo_servicio,e.ruta||e.descripcion,p?.nombre,e.cuenta_proveedor,e.costo,e.fee_datafono,e.fee_servicio,e.precio_venta,e.ganancia,e.utilidad_asesor,e.asesor,e.forma_pago_cliente,e.forma_pago_proveedor,f?.numero]);
                  });
                  exportCSV(rows,"emisiones_sitios_"+today()+".csv");
                }} style={{background:"#b91c1c",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>✈️ Exportar Emisiones</button>
                <button onClick={()=>{
                  const rows=[["Número","Cliente","Fecha","Total","Pagado","Saldo","Estado","Asesor"]];
                  facturas.forEach(f=>{
                    const c=clientes.find(c=>c.id===f.cliente_id);
                    rows.push([f.numero,c?.nombre,f.fecha_emision,f.total,f.total_pagado,f.total-f.total_pagado,f.estado,f.asesor]);
                  });
                  exportCSV(rows,"facturas_sitios_"+today()+".csv");
                }} style={{background:"#16a34a",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>📄 Exportar Facturas</button>
                <button onClick={()=>{
                  const rows=[["Nombre","Tipo","NIT/CC","Email","Teléfono","Ciudad","Total Facturado","Total Pagado","Saldo"]];
                  clientes.forEach(c=>{
                    const facs=facturas.filter(f=>f.cliente_id===c.id);
                    const t=facs.reduce((a,f)=>a+f.total,0);
                    const p=facs.reduce((a,f)=>a+f.total_pagado,0);
                    rows.push([c.nombre,c.tipo,c.nit_cedula,c.email,c.telefono,c.ciudad,t,p,t-p]);
                  });
                  exportCSV(rows,"clientes_sitios_"+today()+".csv");
                }} style={{background:"#2563eb",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>👥 Exportar Clientes</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── MODALES ───── */}
      {modalCliente!==null&&<FormCliente initial={modalCliente?.id?modalCliente:null} onSave={saveCliente} onClose={()=>setModalCliente(null)}/>}
      {modalProveedor!==null&&<FormProveedor initial={modalProveedor?.id?modalProveedor:null} onSave={saveProveedor} onClose={()=>setModalProveedor(null)}/>}
      {modalFactura!==null&&<FormFactura initial={modalFactura?.id?modalFactura:null} clientes={clientes} onSave={saveFactura} onClose={()=>setModalFactura(null)}/>}
      {modalAbono&&<FormAbono facturaId={modalAbono.id} facturaNum={modalAbono.numero} onSave={saveAbono} onClose={()=>setModalAbono(null)}/>}
      {modalEmision!==null&&<FormEmision initial={modalEmision?.id?modalEmision:null} clientes={clientes} proveedores={proveedores} facturas={facturas} onSave={saveEmision} onClose={()=>setModalEmision(null)}/>}
      {detalleCliente&&<DetalleCliente cliente={detalleCliente} facturas={facturas} emisiones={emisiones} onClose={()=>setDetalleCliente(null)}/>}
      {detalleFactura&&<DetalleFactura factura={detalleFactura} cliente={clientes.find(c=>c.id===detalleFactura.cliente_id)} abonos={abonos} emisiones={emisiones} onAbono={()=>{setModalAbono(detalleFactura);setDetalleFactura(null);}} onClose={()=>setDetalleFactura(null)}/>}
    </div>
  );
}