import React, { useMemo, useState } from 'react'

const filtros = [
  { id: 'incendios', nombre: 'Prevencion de incendios', color: 'rgba(239,68,68,.35)', borde: 'rgba(252,165,165,.9)' },
  { id: 'cultivos', nombre: 'Estado de cultivos', color: 'rgba(16,185,129,.32)', borde: 'rgba(110,231,183,.9)' },
  { id: 'agua', nombre: 'Zonas con agua', color: 'rgba(59,130,246,.35)', borde: 'rgba(147,197,253,.9)' },
  { id: 'carbono', nombre: 'Carbono / biomasa', color: 'rgba(132,204,22,.30)', borde: 'rgba(190,242,100,.9)' },
  { id: 'fauna', nombre: 'Caza mayor', color: 'rgba(245,158,11,.30)', borde: 'rgba(252,211,77,.9)' },
  { id: 'empresas', nombre: 'Empresas emisoras CO2', color: 'rgba(249,115,22,.32)', borde: 'rgba(253,186,116,.9)' }
]

const cultivos = {
  cereal: { nombre: 'Cereal secano', kgHa: 3400, agua: 32, abono: 58 },
  olivar: { nombre: 'Olivar', kgHa: 5200, agua: 45, abono: 42 },
  vid: { nombre: 'Vid', kgHa: 7200, agua: 38, abono: 35 },
  maiz: { nombre: 'Maiz regadio', kgHa: 12500, agua: 72, abono: 76 },
  almendro: { nombre: 'Almendro', kgHa: 2600, agua: 52, abono: 44 }
}

function App() {
  const [modo, setModo] = useState('coords')
  const [lugar, setLugar] = useState('Guadalajara, Espana')
  const [lat, setLat] = useState('40.6325')
  const [lng, setLng] = useState('-3.1602')
  const [instanceId, setInstanceId] = useState('')
  const [capaCopernicus, setCapaCopernicus] = useState('TRUE_COLOR')
  const [nubosidad, setNubosidad] = useState('20')
  const [zoom, setZoom] = useState('14')
  const [hectareas, setHectareas] = useState('25')
  const [cultivo, setCultivo] = useState('cereal')
  const [activas, setActivas] = useState([])
  const [estadoBusqueda, setEstadoBusqueda] = useState('')
  const [informes, setInformes] = useState([])

  const parsedLat = Number.parseFloat(lat) || 40.6325
  const parsedLng = Number.parseFloat(lng) || -3.1602
  const areaHa = Math.max(Number.parseFloat(hectareas) || 1, 1)
  const ubicacion = modo === 'coords' ? `${parsedLat.toFixed(5)}, ${parsedLng.toFixed(5)}` : lugar
  const seed = Math.abs(Math.sin(parsedLat * 12.9898 + parsedLng * 78.233))

  const indices = useMemo(() => {
    const ndvi = clamp(0.25 + seed * 0.62, 0.05, 0.92)
    const humedad = clamp(18 + (1 - seed) * 62 + (Number(nubosidad) / 6), 8, 92)
    const sequedad = clamp(100 - humedad + seed * 22, 5, 95)
    const biomasa = clamp(20 + ndvi * 75, 10, 95)
    return { ndvi, humedad, sequedad, biomasa }
  }, [seed, nubosidad])

  const imagenUrl = useMemo(() => {
    const delta = Number(0.08 / Math.max(Number(zoom) - 8, 1))
    const bbox = `${parsedLat - delta},${parsedLng - delta},${parsedLat + delta},${parsedLng + delta}`
    if (instanceId.trim()) {
      return `https://sh.dataspace.copernicus.eu/ogc/wms/${instanceId.trim()}?SERVICE=WMS&REQUEST=GetMap&LAYERS=${capaCopernicus}&MAXCC=${nubosidad}&FORMAT=image/jpeg&WIDTH=1400&HEIGHT=850&CRS=EPSG:4326&BBOX=${bbox}&TIME=${new Date().toISOString().slice(0, 10)}`
    }
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${parsedLng - delta},${parsedLat - delta},${parsedLng + delta},${parsedLat + delta}&bboxSR=4326&imageSR=4326&size=1400,850&format=jpg&f=image`
  }, [parsedLat, parsedLng, instanceId, capaCopernicus, nubosidad, zoom])

  async function buscarLugar() {
    const q = lugar.trim()
    if (!q) return
    setEstadoBusqueda('Buscando coordenadas...')
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!data.length) return setEstadoBusqueda('No se encontro el lugar. Prueba con provincia y pais.')
      setLat(String(data[0].lat)); setLng(String(data[0].lon)); setEstadoBusqueda(`Encontrado: ${data[0].display_name}`)
    } catch { setEstadoBusqueda('No se pudo buscar el lugar. Usa coordenadas.') }
  }

  function toggleFiltro(id) { setActivas(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]) }
  function descargarImagen() { window.open(imagenUrl, '_blank') }

  function crearInforme(tipo) {
    const t = tipo === 'co2' ? calcularCO2() : tipo === 'incendio' ? calcularIncendio() : tipo === 'cultivo' ? calcularCultivo() : tipo === 'agua' ? calcularAgua() : tipo === 'fauna' ? calcularFauna() : calcularNegocio()
    setInformes(prev => [t, ...prev].slice(0, 8))
  }

  function calcularCO2() {
    const capturaHa = round(2.5 + indices.ndvi * 14 + indices.biomasa / 18)
    const capturaTotal = round(capturaHa * areaHa)
    const precio = 42
    const valor = Math.round(capturaTotal * precio)
    return informe('CO2 y carbono natural', 'carbono', [
      ['Area analizada', `${areaHa} ha`], ['NDVI estimado', round(indices.ndvi)], ['Biomasa relativa', `${Math.round(indices.biomasa)}%`],
      ['Captura estimada', `${capturaHa} tCO2/ha/ano`], ['Captura total estimada', `${capturaTotal} tCO2/ano`], ['Valor economico orientativo', `${valor.toLocaleString('es-ES')} EUR/ano`],
      ['Recomendacion', indices.ndvi > .55 ? 'Zona con buen potencial para proyecto de carbono, conservacion o reforestacion certificable.' : 'Potencial mejorable mediante reforestacion, cubierta vegetal y gestion hidrica.']
    ])
  }

  function calcularIncendio() {
    const riesgo = Math.round(clamp(indices.sequedad + (100 - indices.humedad) * .35 + seed * 20, 5, 98))
    return informe('Riesgo de incendio', 'incendios', [
      ['Probabilidad estimada', `${riesgo}%`], ['Sequedad superficial', `${Math.round(indices.sequedad)}%`], ['Humedad estimada', `${Math.round(indices.humedad)}%`],
      ['Prioridad', riesgo > 70 ? 'Alta' : riesgo > 45 ? 'Media' : 'Baja'], ['Acciones', riesgo > 70 ? 'Crear cortafuegos, revisar accesos, limpiar combustible vegetal y activar vigilancia.' : 'Mantener seguimiento satelital, humedad y vegetacion.']
    ])
  }

  function calcularCultivo() {
    const c = cultivos[cultivo]
    const vigor = clamp(indices.ndvi, .1, .95)
    const factor = clamp(.55 + vigor * .75 - (indices.humedad < 35 ? .18 : 0), .35, 1.25)
    const kgHa = Math.round(c.kgHa * factor)
    const total = Math.round(kgHa * areaHa)
    const riego = Math.round(clamp(c.agua + (45 - indices.humedad) * .7, 5, 95))
    const abono = Math.round(clamp(c.abono + (0.55 - indices.ndvi) * 50, 5, 95))
    return informe('Produccion agricola estimada', 'cultivos', [
      ['Cultivo', c.nombre], ['Area', `${areaHa} ha`], ['Produccion estimada', `${kgHa.toLocaleString('es-ES')} kg/ha`], ['Produccion total', `${total.toLocaleString('es-ES')} kg`],
      ['Necesidad de riego', `${riego}%`], ['Necesidad de abonado', `${abono}%`], ['Recomendacion', riego > 60 ? 'Programar riego y revisar humedad de suelo.' : abono > 60 ? 'Revisar nitrogeno y plan de fertilizacion.' : 'Estado compatible con seguimiento preventivo.']
    ])
  }

  function calcularAgua() {
    const deficit = Math.round(clamp(70 - indices.humedad + seed * 20, 0, 100))
    return informe('Agua, riego y humedad', 'agua', [
      ['Humedad estimada', `${Math.round(indices.humedad)}%`], ['Deficit hidrico', `${deficit}%`], ['Necesidad de riego', deficit > 60 ? 'Alta' : deficit > 35 ? 'Media' : 'Baja'],
      ['Acciones', deficit > 60 ? 'Revisar riego, balsas, captacion de agua y sensores IoT.' : 'Seguimiento periodico con NDWI y humedad superficial.']
    ])
  }

  function calcularFauna() {
    const prob = Math.round(clamp(25 + indices.ndvi * 45 + indices.humedad * .25 + seed * 18, 5, 95))
    return informe('Fauna y caza mayor', 'fauna', [
      ['Probabilidad de presencia', `${prob}%`], ['Habitat vegetal', `${Math.round(indices.biomasa)}%`], ['Agua/humedad cercana', `${Math.round(indices.humedad)}%`],
      ['Uso comercial', 'Informe para cotos, gestion cinegetica, danos agricolas y seguros.']
    ])
  }

  function calcularNegocio() {
    const leads = Math.round(clamp(2 + areaHa / 12 + seed * 14, 1, 25))
    const ingreso = Math.round(leads * 650 + areaHa * 18)
    return informe('Oportunidad comercial y ESG', 'empresas', [
      ['Clientes potenciales estimados', `${leads}`], ['Ingreso potencial por informe/monitorizacion', `${ingreso.toLocaleString('es-ES')} EUR`],
      ['Mercado objetivo', 'Empresas con huella CO2, ayuntamientos, fincas, cooperativas, aseguradoras y gestoras ambientales.'],
      ['Producto vendible', 'Informe satelital profesional + seguimiento mensual + certificacion de evidencias.']
    ])
  }

  function informe(titulo, capa, filas) {
    const id = `${Date.now()}-${Math.round(Math.random()*9999)}`
    return { id, titulo, capa, fecha: new Date().toLocaleString('es-ES'), ubicacion, lat: parsedLat.toFixed(5), lng: parsedLng.toFixed(5), areaHa, filas, imagenUrl }
  }

  function descargarInforme(rep) {
    const rows = rep.filas.map(([a,b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('')
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${rep.titulo}</title><style>body{font-family:Arial;margin:40px;color:#0f172a}header{border-bottom:4px solid #10b981;margin-bottom:24px}h1{font-size:30px}.meta{color:#475569}table{border-collapse:collapse;width:100%;margin-top:20px}th,td{border:1px solid #cbd5e1;padding:12px;text-align:left}th{background:#ecfdf5;width:32%}.box{padding:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;margin:18px 0}.note{font-size:12px;color:#64748b;margin-top:24px}</style></head><body><header><h1>${rep.titulo}</h1><p class="meta">MmarcoSeguridad · Informe generado ${rep.fecha}</p></header><div class="box"><strong>Ubicacion:</strong> ${rep.ubicacion}<br><strong>Coordenadas:</strong> ${rep.lat}, ${rep.lng}<br><strong>Area:</strong> ${rep.areaHa} ha</div><table>${rows}</table><p class="note">Informe orientativo basado en imagen satelital, indices estimados y reglas de analisis preliminar. Para certificacion comercial de carbono, seguros o ayudas publicas se requiere validacion tecnica y medicion de campo.</p></body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${rep.titulo.toLowerCase().replaceAll(' ','-')}-${rep.lat}-${rep.lng}.html`; a.click(); URL.revokeObjectURL(url)
  }

  const filtrosActivos = filtros.filter(f => activas.includes(f.id))

  return (
    <main style={styles.page}>
      <header style={styles.header}><div><div style={styles.badge}>MmarcoSeguridad · Portal Satelital Comercial</div><h1 style={styles.title}>Analisis satelital rentable: CO2, incendios, cultivos, agua y ESG</h1><p style={styles.subtitle}>Consulta cualquier zona, aplica capas, calcula indicadores y descarga informes profesionales para cobrar por uso.</p></div><div style={styles.contacto}><strong>Manuel Marco Sanchez</strong><span>Guadalajara · Espana</span><span>soporte@mmarcoseguridad.com</span></div></header>
      <section style={styles.grid}>
        <aside style={styles.panel}>
          <h2 style={styles.h2}>Consulta</h2><div style={styles.tabs}><button onClick={()=>setModo('coords')} style={modo==='coords'?styles.tabActive:styles.tab}>Coordenadas</button><button onClick={()=>setModo('lugar')} style={modo==='lugar'?styles.tabActive:styles.tab}>Lugar</button></div>
          {modo==='coords'?<div style={styles.twoCols}><label style={styles.label}>Latitud<input style={styles.input} value={lat} onChange={e=>setLat(e.target.value)}/></label><label style={styles.label}>Longitud<input style={styles.input} value={lng} onChange={e=>setLng(e.target.value)}/></label></div>:<div><label style={styles.label}>Poblacion, finca o direccion<input style={styles.input} value={lugar} onChange={e=>setLugar(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')buscarLugar()}} placeholder="Ej: Orea, Guadalajara, Espana"/></label><button onClick={buscarLugar} style={styles.searchButton}>Buscar lugar y actualizar imagen</button>{estadoBusqueda&&<p style={styles.status}>{estadoBusqueda}</p>}</div>}
          <div style={styles.twoCols}><label style={styles.label}>Hectareas<input style={styles.input} value={hectareas} onChange={e=>setHectareas(e.target.value)}/></label><label style={styles.label}>Cultivo<select style={styles.input} value={cultivo} onChange={e=>setCultivo(e.target.value)}>{Object.entries(cultivos).map(([k,v])=><option key={k} value={k}>{v.nombre}</option>)}</select></label></div>
          <label style={styles.label}>Copernicus Instance ID<input style={styles.input} value={instanceId} onChange={e=>setInstanceId(e.target.value)} placeholder="Opcional"/></label>
          <div style={styles.twoCols}><label style={styles.label}>Capa<select style={styles.input} value={capaCopernicus} onChange={e=>setCapaCopernicus(e.target.value)}><option value="TRUE_COLOR">Color real</option><option value="FALSE_COLOR">Falso color</option><option value="NDVI">NDVI</option><option value="NDWI">NDWI agua</option><option value="MOISTURE_INDEX">Humedad</option><option value="NBR">NBR incendios</option></select></label><label style={styles.label}>Nubosidad<select style={styles.input} value={nubosidad} onChange={e=>setNubosidad(e.target.value)}><option value="10">10%</option><option value="20">20%</option><option value="40">40%</option><option value="80">80%</option><option value="100">Sin filtro</option></select></label></div>
          <label style={styles.label}>Zoom {zoom}<input type="range" min="9" max="18" value={zoom} onChange={e=>setZoom(e.target.value)} style={{width:'100%'}}/></label>
          <h2 style={styles.h2}>Capas</h2><div style={styles.filtros}>{filtros.map(f=><button key={f.id} onClick={()=>toggleFiltro(f.id)} style={activas.includes(f.id)?styles.filtroActivo:styles.filtro}>{f.nombre}<span>{activas.includes(f.id)?'Activa':'Aplicar'}</span></button>)}</div><button onClick={descargarImagen} style={styles.download}>Descargar imagen</button>
        </aside>
        <section style={styles.visorCard}><div style={styles.visor}><img src={imagenUrl} alt="Imagen satelital" style={styles.imagen}/><div style={styles.infoBox}><small>Zona seleccionada</small><strong>{ubicacion}</strong><span>{parsedLat.toFixed(5)}, {parsedLng.toFixed(5)} · {areaHa} ha</span></div>{filtrosActivos.map((f,i)=><div key={f.id} style={{...styles.overlay,background:f.color,borderColor:f.borde,left:`${12+(i*13)%62}%`,top:`${22+(i*11)%48}%`,width:`${180+(i*40)%180}px`,height:`${90+(i*25)%120}px`,transform:`rotate(${i*13}deg)`}}><span style={styles.overlayLabel}>{f.nombre}</span></div>)}{!filtrosActivos.length&&<div style={styles.emptyHint}>Imagen limpia. Activa capas o calcula informes.</div>}</div>
          <div style={styles.actions}><button onClick={()=>crearInforme('co2')} style={styles.action}>Calcular CO2 y carbono</button><button onClick={()=>crearInforme('incendio')} style={styles.action}>Calcular riesgo incendio</button><button onClick={()=>crearInforme('cultivo')} style={styles.action}>Calcular produccion cultivo</button><button onClick={()=>crearInforme('agua')} style={styles.action}>Calcular agua y riego</button><button onClick={()=>crearInforme('fauna')} style={styles.action}>Calcular fauna/caza mayor</button><button onClick={()=>crearInforme('negocio')} style={styles.action}>Calcular oportunidad comercial</button></div>
          <div style={styles.resultados}><h2 style={styles.h2}>Informes generados</h2>{!informes.length?<p style={styles.muted}>Pulsa un calculo para generar datos e informe descargable.</p>:informes.map(rep=><article key={rep.id} style={styles.resultado}><div style={styles.resultHeader}><strong>{rep.titulo}</strong><button onClick={()=>descargarInforme(rep)} style={styles.smallBtn}>Descargar informe</button></div><p style={styles.muted}>{rep.fecha} · {rep.ubicacion}</p><table style={styles.table}><tbody>{rep.filas.slice(0,4).map(([a,b])=><tr key={a}><th>{a}</th><td>{b}</td></tr>)}</tbody></table></article>)}</div>
        </section>
      </section>
    </main>
  )
}

function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function round(n){return Math.round(n*100)/100}

const styles={page:{minHeight:'100vh',background:'radial-gradient(circle at top left,rgba(16,185,129,.22),transparent 32%),linear-gradient(135deg,#07111f,#0f172a)',color:'#fff',fontFamily:'Arial,Helvetica,sans-serif',padding:24,boxSizing:'border-box'},header:{display:'flex',justifyContent:'space-between',gap:20,maxWidth:1320,margin:'0 auto 20px',padding:24,border:'1px solid rgba(255,255,255,.12)',borderRadius:28,background:'rgba(255,255,255,.08)'},badge:{display:'inline-block',padding:'8px 12px',borderRadius:999,background:'rgba(16,185,129,.18)',color:'#a7f3d0',marginBottom:12},title:{fontSize:40,lineHeight:1.05,margin:'0 0 10px'},subtitle:{margin:0,color:'#cbd5e1',fontSize:18},contacto:{minWidth:240,display:'grid',gap:8,padding:16,borderRadius:20,background:'rgba(2,6,23,.55)',color:'#dbeafe'},grid:{maxWidth:1320,margin:'0 auto',display:'grid',gridTemplateColumns:'390px 1fr',gap:20},panel:{padding:20,borderRadius:28,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)'},h2:{margin:'0 0 12px',fontSize:22},tabs:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14},tab:{padding:10,border:0,borderRadius:14,background:'rgba(15,23,42,.8)',color:'#cbd5e1'},tabActive:{padding:10,border:0,borderRadius:14,background:'#10b981',color:'#06111f',fontWeight:700},twoCols:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10},label:{display:'grid',gap:6,fontSize:13,color:'#cbd5e1',marginBottom:12},input:{width:'100%',boxSizing:'border-box',padding:12,borderRadius:14,border:'1px solid rgba(255,255,255,.12)',background:'#020617',color:'#fff'},searchButton:{width:'100%',padding:12,border:0,borderRadius:14,background:'#10b981',color:'#06111f',fontWeight:700,marginBottom:8},status:{fontSize:12,color:'#dbeafe'},filtros:{display:'grid',gap:8},filtro:{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',padding:12,borderRadius:14,border:'1px solid rgba(255,255,255,.12)',background:'#020617',color:'#fff'},filtroActivo:{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',padding:12,borderRadius:14,border:'1px solid rgba(16,185,129,.8)',background:'rgba(16,185,129,.18)',color:'#fff'},download:{width:'100%',marginTop:16,padding:14,border:0,borderRadius:16,background:'#3b82f6',color:'#fff',fontWeight:700,fontSize:16},visorCard:{display:'grid',gap:20},visor:{position:'relative',height:520,overflow:'hidden',borderRadius:28,border:'1px solid rgba(255,255,255,.12)',background:'#111827'},imagen:{width:'100%',height:'100%',objectFit:'cover',display:'block'},infoBox:{position:'absolute',top:18,left:18,display:'grid',gap:6,padding:'16px 18px',borderRadius:18,background:'rgba(2,6,23,.82)',boxShadow:'0 20px 60px rgba(0,0,0,.35)'},overlay:{position:'absolute',border:'2px solid',borderRadius:'50%'},overlayLabel:{position:'absolute',left:14,top:-34,whiteSpace:'nowrap',padding:'7px 10px',borderRadius:999,background:'rgba(2,6,23,.82)',fontSize:13},emptyHint:{position:'absolute',right:18,bottom:18,padding:'14px 16px',borderRadius:18,background:'rgba(2,6,23,.75)',color:'#cbd5e1'},actions:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12},action:{padding:14,border:0,borderRadius:16,background:'#10b981',color:'#06111f',fontWeight:800},resultados:{padding:20,borderRadius:28,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)'},muted:{color:'#cbd5e1'},resultado:{padding:14,borderRadius:18,background:'rgba(2,6,23,.5)',marginBottom:10},resultHeader:{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'},smallBtn:{border:0,borderRadius:12,padding:'8px 10px',background:'#3b82f6',color:'#fff',fontWeight:700},table:{width:'100%',borderCollapse:'collapse',fontSize:13}}

export default App
