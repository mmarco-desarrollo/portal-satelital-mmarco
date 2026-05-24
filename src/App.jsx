import React, { useMemo, useState } from 'react'

const filtros = [
  { id: 'incendios', nombre: 'Prevencion de incendios', color: 'rgba(239,68,68,.35)', borde: 'rgba(252,165,165,.9)', texto: 'Riesgo por vegetacion seca, pendiente y clima.' },
  { id: 'cultivos', nombre: 'Estado de cultivos', color: 'rgba(16,185,129,.32)', borde: 'rgba(110,231,183,.9)', texto: 'Vigor vegetal, NDVI y posible estres hidrico.' },
  { id: 'agua', nombre: 'Zonas con agua', color: 'rgba(59,130,246,.35)', borde: 'rgba(147,197,253,.9)', texto: 'Laminas de agua, cauces y humedad superficial.' },
  { id: 'carbono', nombre: 'Carbono / biomasa', color: 'rgba(132,204,22,.30)', borde: 'rgba(190,242,100,.9)', texto: 'Estimacion de captura y oportunidad de compensacion.' },
  { id: 'fauna', nombre: 'Caza mayor', color: 'rgba(245,158,11,.30)', borde: 'rgba(252,211,77,.9)', texto: 'Corredores naturales, agua y masas forestales.' },
  { id: 'empresas', nombre: 'Empresas contaminantes', color: 'rgba(249,115,22,.32)', borde: 'rgba(253,186,116,.9)', texto: 'Industria cercana y necesidades de compliance CO2.' }
]

function App() {
  const [modo, setModo] = useState('coords')
  const [lugar, setLugar] = useState('Guadalajara, Espana')
  const [lat, setLat] = useState('40.6325')
  const [lng, setLng] = useState('-3.1602')
  const [instanceId, setInstanceId] = useState('')
  const [capaCopernicus, setCapaCopernicus] = useState('TRUE_COLOR')
  const [nubosidad, setNubosidad] = useState('20')
  const [zoom, setZoom] = useState('14')
  const [activas, setActivas] = useState([])

  const parsedLat = Number.parseFloat(lat) || 40.6325
  const parsedLng = Number.parseFloat(lng) || -3.1602
  const ubicacion = modo === 'coords' ? `${parsedLat.toFixed(5)}, ${parsedLng.toFixed(5)}` : lugar

  const imagenUrl = useMemo(() => {
    const delta = Number(0.08 / Math.max(Number(zoom) - 8, 1))
    const bbox = `${parsedLat - delta},${parsedLng - delta},${parsedLat + delta},${parsedLng + delta}`
    if (instanceId.trim()) {
      return `https://sh.dataspace.copernicus.eu/ogc/wms/${instanceId.trim()}?SERVICE=WMS&REQUEST=GetMap&LAYERS=${capaCopernicus}&MAXCC=${nubosidad}&FORMAT=image/jpeg&WIDTH=1400&HEIGHT=850&CRS=EPSG:4326&BBOX=${bbox}&TIME=${new Date().toISOString().slice(0, 10)}`
    }
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${parsedLng - delta},${parsedLat - delta},${parsedLng + delta},${parsedLat + delta}&bboxSR=4326&imageSR=4326&size=1400,850&format=jpg&f=image`
  }, [parsedLat, parsedLng, instanceId, capaCopernicus, nubosidad, zoom])

  function toggleFiltro(id) {
    setActivas(actual => actual.includes(id) ? actual.filter(x => x !== id) : [...actual, id])
  }

  function descargarImagen() {
    window.open(imagenUrl, '_blank')
  }

  const filtrosActivos = filtros.filter(f => activas.includes(f.id))

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.badge}>MmarcoSeguridad · Portal Satelital</div>
          <h1 style={styles.title}>Observatorio satelital con Copernicus y capas ambientales</h1>
          <p style={styles.subtitle}>Consulta cualquier coordenada, carga imagen satelital real, aplica capas cuando quieras y descarga la vista generada.</p>
        </div>
        <div style={styles.contacto}>
          <strong>Manuel Marco Sanchez</strong>
          <span>Guadalajara · Espana</span>
          <span>soporte@mmarcoseguridad.com</span>
        </div>
      </header>

      <section style={styles.grid}>
        <aside style={styles.panel}>
          <h2 style={styles.h2}>Consulta</h2>
          <div style={styles.tabs}>
            <button onClick={() => setModo('coords')} style={modo === 'coords' ? styles.tabActive : styles.tab}>Coordenadas</button>
            <button onClick={() => setModo('lugar')} style={modo === 'lugar' ? styles.tabActive : styles.tab}>Lugar</button>
          </div>

          {modo === 'coords' ? (
            <div style={styles.twoCols}>
              <label style={styles.label}>Latitud<input style={styles.input} value={lat} onChange={e => setLat(e.target.value)} /></label>
              <label style={styles.label}>Longitud<input style={styles.input} value={lng} onChange={e => setLng(e.target.value)} /></label>
            </div>
          ) : (
            <label style={styles.label}>Poblacion, finca o direccion<input style={styles.input} value={lugar} onChange={e => setLugar(e.target.value)} placeholder="Ej: Orea, Guadalajara" /></label>
          )}

          <label style={styles.label}>Copernicus Instance ID<input style={styles.input} value={instanceId} onChange={e => setInstanceId(e.target.value)} placeholder="Pega aqui tu INSTANCE_ID" /></label>

          <div style={styles.twoCols}>
            <label style={styles.label}>Capa<select style={styles.input} value={capaCopernicus} onChange={e => setCapaCopernicus(e.target.value)}>
              <option value="TRUE_COLOR">Color real</option>
              <option value="FALSE_COLOR">Falso color</option>
              <option value="NDVI">NDVI cultivos</option>
              <option value="NDWI">NDWI agua</option>
              <option value="MOISTURE_INDEX">Humedad</option>
              <option value="NBR">NBR incendios</option>
            </select></label>
            <label style={styles.label}>Nubosidad<select style={styles.input} value={nubosidad} onChange={e => setNubosidad(e.target.value)}>
              <option value="10">10%</option><option value="20">20%</option><option value="40">40%</option><option value="80">80%</option><option value="100">Sin filtro</option>
            </select></label>
          </div>

          <label style={styles.label}>Zoom {zoom}<input type="range" min="9" max="18" value={zoom} onChange={e => setZoom(e.target.value)} style={{width:'100%'}} /></label>

          <h2 style={styles.h2}>Capas aplicables</h2>
          <div style={styles.filtros}>{filtros.map(f => <button key={f.id} onClick={() => toggleFiltro(f.id)} style={activas.includes(f.id) ? styles.filtroActivo : styles.filtro}>{f.nombre}<span>{activas.includes(f.id) ? 'Activa' : 'Aplicar'}</span></button>)}</div>

          <button onClick={descargarImagen} style={styles.download}>Descargar imagen</button>
        </aside>

        <section style={styles.visorCard}>
          <div style={styles.visor}>
            <img src={imagenUrl} alt="Imagen satelital" style={styles.imagen} onError={e => { e.currentTarget.style.display = 'none' }} />
            <div style={styles.infoBox}><small>Zona seleccionada</small><strong>{ubicacion}</strong><span>{instanceId.trim() ? `Copernicus ${capaCopernicus}` : 'Satélite base Esri'} · Nubosidad {nubosidad}% · Zoom {zoom}</span></div>
            {filtrosActivos.map((f, i) => <div key={f.id} title={f.nombre} style={{...styles.overlay, background:f.color, borderColor:f.borde, left:`${12 + (i*13)%62}%`, top:`${22 + (i*11)%48}%`, width:`${180 + (i*40)%180}px`, height:`${90 + (i*25)%120}px`, transform:`rotate(${i*13}deg)`}}><span style={styles.overlayLabel}>{f.nombre}</span></div>)}
            {filtrosActivos.length === 0 && <div style={styles.emptyHint}>Imagen limpia. Activa capas desde el panel izquierdo.</div>}
          </div>

          <div style={styles.resultados}>
            <h2 style={styles.h2}>Resultados</h2>
            {filtrosActivos.length === 0 ? <p style={styles.muted}>No hay capas aplicadas.</p> : filtrosActivos.map(f => <article key={f.id} style={styles.resultado}><strong>{f.nombre}</strong><p>{f.texto}</p></article>)}
          </div>
        </section>
      </section>
    </main>
  )
}

const styles = {
  page:{minHeight:'100vh',background:'radial-gradient(circle at top left,rgba(16,185,129,.22),transparent 32%),linear-gradient(135deg,#07111f,#0f172a)',color:'#fff',fontFamily:'Arial,Helvetica,sans-serif',padding:'24px',boxSizing:'border-box'},
  header:{display:'flex',justifyContent:'space-between',gap:'20px',alignItems:'stretch',maxWidth:'1320px',margin:'0 auto 20px',padding:'24px',border:'1px solid rgba(255,255,255,.12)',borderRadius:'28px',background:'rgba(255,255,255,.08)'},
  badge:{display:'inline-block',padding:'8px 12px',borderRadius:'999px',background:'rgba(16,185,129,.18)',color:'#a7f3d0',marginBottom:'12px'}, title:{fontSize:'42px',lineHeight:1.05,margin:'0 0 10px'}, subtitle:{margin:0,color:'#cbd5e1',fontSize:'18px'}, contacto:{minWidth:'240px',display:'grid',gap:'8px',padding:'16px',borderRadius:'20px',background:'rgba(2,6,23,.55)',color:'#dbeafe'},
  grid:{maxWidth:'1320px',margin:'0 auto',display:'grid',gridTemplateColumns:'390px 1fr',gap:'20px'}, panel:{padding:'20px',borderRadius:'28px',background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)'}, h2:{margin:'0 0 12px',fontSize:'22px'}, tabs:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'14px'}, tab:{padding:'10px',border:0,borderRadius:'14px',background:'rgba(15,23,42,.8)',color:'#cbd5e1'}, tabActive:{padding:'10px',border:0,borderRadius:'14px',background:'#10b981',color:'#06111f',fontWeight:700}, twoCols:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}, label:{display:'grid',gap:'6px',fontSize:'13px',color:'#cbd5e1',marginBottom:'12px'}, input:{width:'100%',boxSizing:'border-box',padding:'12px',borderRadius:'14px',border:'1px solid rgba(255,255,255,.12)',background:'#020617',color:'#fff'}, filtros:{display:'grid',gap:'8px'}, filtro:{display:'flex',justifyContent:'space-between',gap:'8px',alignItems:'center',padding:'12px',borderRadius:'14px',border:'1px solid rgba(255,255,255,.12)',background:'#020617',color:'#fff',textAlign:'left'}, filtroActivo:{display:'flex',justifyContent:'space-between',gap:'8px',alignItems:'center',padding:'12px',borderRadius:'14px',border:'1px solid rgba(16,185,129,.8)',background:'rgba(16,185,129,.18)',color:'#fff',textAlign:'left'}, download:{width:'100%',marginTop:'16px',padding:'14px',border:0,borderRadius:'16px',background:'#3b82f6',color:'#fff',fontWeight:700,fontSize:'16px'},
  visorCard:{display:'grid',gap:'20px'}, visor:{position:'relative',height:'520px',overflow:'hidden',borderRadius:'28px',border:'1px solid rgba(255,255,255,.12)',background:'#111827'}, imagen:{width:'100%',height:'100%',objectFit:'cover',display:'block'}, infoBox:{position:'absolute',top:'18px',left:'18px',display:'grid',gap:'6px',padding:'16px 18px',borderRadius:'18px',background:'rgba(2,6,23,.82)',backdropFilter:'blur(10px)',boxShadow:'0 20px 60px rgba(0,0,0,.35)'}, overlay:{position:'absolute',border:'2px solid',borderRadius:'50%',boxShadow:'0 0 30px rgba(0,0,0,.22)'}, overlayLabel:{position:'absolute',left:'14px',top:'-34px',whiteSpace:'nowrap',padding:'7px 10px',borderRadius:'999px',background:'rgba(2,6,23,.82)',fontSize:'13px'}, emptyHint:{position:'absolute',right:'18px',bottom:'18px',padding:'14px 16px',borderRadius:'18px',background:'rgba(2,6,23,.75)',color:'#cbd5e1'}, resultados:{padding:'20px',borderRadius:'28px',background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)'}, muted:{color:'#cbd5e1'}, resultado:{padding:'14px',borderRadius:'18px',background:'rgba(2,6,23,.5)',marginBottom:'10px'},
}

export default App
