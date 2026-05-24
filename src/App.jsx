function App() {
  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#07111f,#0f2b3d)',color:'#ffffff',fontFamily:'Arial,Helvetica,sans-serif',padding:'40px',boxSizing:'border-box'}}>
      <section style={{maxWidth:'980px',margin:'0 auto',padding:'32px',border:'1px solid rgba(255,255,255,.18)',borderRadius:'24px',background:'rgba(255,255,255,.08)',boxShadow:'0 20px 70px rgba(0,0,0,.35)'}}>
        <p style={{display:'inline-block',padding:'8px 12px',borderRadius:'999px',background:'rgba(16,185,129,.18)',color:'#a7f3d0',margin:'0 0 18px'}}>MmarcoSeguridad</p>
        <h1 style={{fontSize:'42px',lineHeight:'1.1',margin:'0 0 16px'}}>Portal Satelital MmarcoSeguridad</h1>
        <p style={{fontSize:'20px',lineHeight:'1.5',color:'#dbeafe',margin:'0 0 24px'}}>La aplicacion React esta funcionando correctamente en Vercel.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'16px'}}>
          <article style={{padding:'18px',borderRadius:'18px',background:'rgba(15,23,42,.75)',border:'1px solid rgba(255,255,255,.12)'}}>
            <h2 style={{margin:'0 0 8px',fontSize:'20px'}}>Imagen satelital</h2>
            <p style={{margin:0,color:'#cbd5e1'}}>Base preparada para Copernicus Sentinel.</p>
          </article>
          <article style={{padding:'18px',borderRadius:'18px',background:'rgba(15,23,42,.75)',border:'1px solid rgba(255,255,255,.12)'}}>
            <h2 style={{margin:'0 0 8px',fontSize:'20px'}}>Capas</h2>
            <p style={{margin:0,color:'#cbd5e1'}}>Incendios, agua, cultivos, carbono y compliance.</p>
          </article>
          <article style={{padding:'18px',borderRadius:'18px',background:'rgba(15,23,42,.75)',border:'1px solid rgba(255,255,255,.12)'}}>
            <h2 style={{margin:'0 0 8px',fontSize:'20px'}}>Estado</h2>
            <p style={{margin:0,color:'#a7f3d0'}}>Despliegue activo.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
