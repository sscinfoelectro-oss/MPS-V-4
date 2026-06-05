import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import heroBg from './assets/garage-bg.jpeg'
import logo from './assets/ssc-logo.png'
import Footer from './components/Footer.jsx'

const navItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Garages', to: '/garages' },
  { label: 'Services', to: '/services' },
  { label: 'Diagnostic', to: '/diagnostic' },
  { label: 'Connexion', to: '/connexion' },
  { label: "S'inscrire", to: '/inscription' },
  { label: 'À propos', to: '/about' },
]

const AppHeader = ({ subTitle, hideAccueil = false }) => {
  const [userData, setUserData] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user_data')
    if (savedUser) {
      setUserData(JSON.parse(savedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_data')
    setUserData(null)
    navigate('/')
    window.location.reload()
  }

  const activeStyle = {
    color: '#ff0000',
    fontWeight: 'bold',
    textShadow: '0 0 8px #ff0000, 0 0 15px #ff0000'
  }

  return (
    <header className="header-bar">
      <div className="brand-card">
        <span className="brand-logo">MechanicSmart</span>
        {subTitle && <span className="brand-sub">{subTitle}</span>}
      </div>
      <nav className="nav-links">
        {userData ? (
          <>
            {!hideAccueil && <Link to="/" style={location.pathname === '/' ? activeStyle : {}}>Accueil</Link>}
            <Link to="/garages" style={location.pathname === '/garages' ? activeStyle : {}}>Garages</Link>
            <Link to="/services" style={location.pathname === '/services' ? activeStyle : {}}>Services</Link>
            <Link to="/diagnostic" style={location.pathname === '/diagnostic' ? activeStyle : {}}>Diagnostic</Link>
            <Link to="/repairs" style={location.pathname === '/repairs' ? activeStyle : {}}>Suivi</Link>
            <Link to="/appointments" style={location.pathname === '/appointments' ? activeStyle : {}}>Rendez-vous</Link>
            <span style={{color: '#f87171', fontWeight: 'bold', marginLeft: '10px', marginRight: '10px'}}>
              🚗 {userData.vehicle_type}
            </span>
            <button onClick={handleLogout} style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0',
              fontSize: '1rem'
            }}>
              Déconnexion
            </button>
            <Link to="/about" style={{marginLeft: '5px', ...(location.pathname === '/about' ? activeStyle : {})}}>À propos</Link>
          </>
        ) : (
          navItems.map((item) => {
            if (hideAccueil && item.label === 'Accueil') return null;
            return item.to ? (
              <Link key={item.label} to={item.to} style={location.pathname === item.to ? activeStyle : {}}>{item.label}</Link>
            ) : (
              <a key={item.label} href={item.href}>{item.label}</a>
            )
          })
        )}
      </nav>
    </header>
  )
}

// =======
// 🏠 Page d'accueil
// =======
function HomePage({ stats, garages, services }) {
  const navigate = useNavigate()
  const userData = JSON.parse(localStorage.getItem('user_data') || 'null')

  return (
    <div className="page-shell">
      <AppHeader hideAccueil={true} />

      <section className="hero-section" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay" />
        <div className="hero-copy">
          <div className="hero-logo-wrap">
            <img src={logo} alt="SSC Maintenance logo" className="hero-logo" />
          </div>

          <h1 className="hero-title" data-text="Entretienez votre véhicule en toute simplicité">Entretienez votre véhicule en toute simplicité</h1>
          <p className="hero-description">
            Réservez un garage, suivez le diagnostic en temps réel et profitez d'un service automobile fiable près de chez vous.
            {userData && ` - Connecté en tant que ${userData.vehicle_type}`}
          </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/garages">
                <button className="button">
                    <span className="button_lg">
                        <span className="button_sl"></span>
                        <span className="button_text">🔧 TROUVER UN GARAGE</span>
                    </span>
                </button>
              </Link>
              
              <Link to="/services">
                <button className="button">
                    <span className="button_lg">
                        <span className="button_sl"></span>
                        <span className="button_text">🏠 SERVICES À DOMICILE</span>
                    </span>
                </button>
              </Link>

              <Link to="/diagnostic">
                <button className="button">
                    <span className="button_lg">
                        <span className="button_sl"></span>
                        <span className="button_text">🔍 DIAGNOSTIC EN LIGNE</span>
                    </span>
                </button>
              </Link>

              {userData && (
                <Link to="/repairs">
                  <button className="button">
                      <span className="button_lg">
                          <span className="button_sl"></span>
                          <span className="button_text">📋 MES RÉPARATIONS</span>
                      </span>
                  </button>
                </Link>
              )}
            </div>
        </div>
      </section>

         <section className="diagnostic-section">
           <div className="section-heading">
             <h2>Chiffres clés de MechanicSmart</h2>
             <p>Découvrez les statistiques en temps réel de notre plateforme automobile.</p>
           </div>
           <div className="cards-grid">
             <div className="stats-card">
               <h3>{stats.totalUsers || 0}</h3>
               <p>Utilisateurs</p>
             </div>
             <div className="stats-card">
               <h3>{garages.length}</h3>
               <p>Garages enregistrés</p>
             </div>
             <div className="stats-card">
               <h3>{services.length}</h3>
               <p>Services à domicile</p>
             </div>
           </div>
      </section>

      <section className="about-section">
        <div className="about-card" style={{textAlign: 'center'}}>
          <h2>🚀 Fonctionnalités disponibles</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '30px'}}>
            <div className="feature-item">
              <span style={{fontSize: '2.5rem'}}>🔧</span>
              <h3>Réserver un Garage</h3>
              <p>Trouvez et réservez le meilleur garage près de chez vous</p>
            </div>
            <div className="feature-item">
              <span style={{fontSize: '2.5rem'}}>🏠</span>
              <h3>Services à Domicile</h3>
              <p>Des techniciens qualifiés se déplacent jusqu'à vous</p>
            </div>
            <div className="feature-item">
              <span style={{fontSize: '2.5rem'}}>🔍</span>
              <h3>Diagnostic en Ligne</h3>
              <p>Analysez les symptômes de votre véhicule en temps réel</p>
            </div>
            <div className="feature-item">
              <span style={{fontSize: '2.5rem'}}>📋</span>
              <h3>Suivi des Réparations</h3>
              <p>Suivez l'avancement de vos réparations en direct</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// =======
// 🔍 Diagnostic en ligne
// =======
function DiagnosticPage() {
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [vehicleType, setVehicleType] = useState('')
  const navigate = useNavigate()

  const commonSymptoms = [
    'Bruit moteur anormal',
    'Fumée (noire/blanche)',
    'Vibrations',
    'Problème de freinage',
    'Ne démarre pas',
    'Batterie faible',
    'Climatisation défaillante',
    'Surchauffe moteur',
    'Vidange / huile'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!symptoms.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/diagnostics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptoms: symptoms,
          vehicle_type: vehicleType
        })
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ 
        success: false, 
        error: 'Erreur de connexion au serveur',
        diagnostic: {
          code: 'ERR',
          description: 'Impossible d\'analyser les symptômes',
          severity: 'unknown',
          recommendation: 'Veuillez réessayer ou consulter un garage directement.'
        }
      })
    }
    setLoading(false)
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#dc2626'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#22c55e'
      default: return '#64748b'
    }
  }

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '🔶'
      case 'low': return '✅'
      default: return '🔍'
    }
  }

  return (
    <div className="page-shell">
      <AppHeader subTitle="DIAGNOSTIC" />

      <section className="about-section">
        <div className="about-card">
          <h2>🔍 Diagnostic en ligne</h2>
          <p style={{ color: '#f8fafc', marginBottom: '20px' }}>
            Décrivez les symptômes de votre véhicule et obtenez une analyse préliminaire instantanée.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type de véhicule (optionnel)</label>
              <input
                type="text"
                className="form-input"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="Ex: Dacia Logan 2023"
              />
            </div>

            <div style={{marginBottom: '15px'}}>
              <label>Symptômes courants :</label>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px'}}>
                {commonSymptoms.map(s => (
                  <button
                    key={s}
                    type="button"
                    className="btn btn-secondary btn-compact"
                    onClick={() => setSymptoms(prev => prev ? `${prev}, ${s.toLowerCase()}` : s.toLowerCase())}
                    style={{fontSize: '0.75rem', padding: '5px 10px', background: '#1e293b'}}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Décrivez les symptômes</label>
              <textarea
                className="form-input"
                rows="4"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Ex: Bruit anormal au niveau du moteur, fumée blanche à l'échappement..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading || !symptoms.trim()}>
              {loading ? '🔍 Analyse en cours...' : '🔍 Analyser'}
            </button>
          </form>

          {result && result.diagnostic && (
            <div style={{
              marginTop: '30px',
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${getSeverityColor(result.diagnostic.severity)}`,
              background: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px'}}>
                <span style={{fontSize: '2rem'}}>{getSeverityIcon(result.diagnostic.severity)}</span>
                <div>
                  <h3 style={{color: 'white', margin: 0}}>Résultat du diagnostic</h3>
                  <span style={{
                    display: 'inline-block',
                    background: getSeverityColor(result.diagnostic.severity),
                    color: 'white',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    marginTop: '5px'
                  }}>
                    {result.diagnostic.severity.toUpperCase()} - Code: {result.diagnostic.code}
                  </span>
                </div>
              </div>

              <p style={{color: '#e2e8f0', lineHeight: '1.6'}}>{result.diagnostic.description}</p>
              
              <div style={{
                marginTop: '15px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.3)',
                borderLeft: `4px solid ${getSeverityColor(result.diagnostic.severity)}`
              }}>
                <strong style={{color: '#94a3b8'}}>Recommandation :</strong>
                <p style={{color: '#e2e8f0', margin: '5px 0 0'}}>{result.diagnostic.recommendation}</p>
              </div>

              <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                <button className="btn btn-primary" onClick={() => navigate('/garages')}>
                  🔧 Trouver un garage
                </button>
                <button className="btn btn-secondary" onClick={() => { setResult(null); setSymptoms('') }}>
                  🔄 Nouveau diagnostic
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

// =======
// 📅 Page des rendez-vous
// =======
function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const userToken = localStorage.getItem('user_token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!userToken) return navigate('/connexion')
    
    fetch('/api/appointments', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    })
    .then(res => res.json())
    .then(data => {
      setAppointments(data.appointments || [])
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }, [userToken, navigate])

  const handleCancel = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return
    
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      if (res.ok) {
        setAppointments(appointments.map(a => 
          a.id === id ? {...a, status: 'cancelled'} : a
        ))
      }
    } catch (err) {
      alert('Erreur lors de l\'annulation')
    }
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return { color: '#f59e0b', text: '⏳ En attente' }
      case 'confirmed': return { color: '#3b82f6', text: '✅ Confirmé' }
      case 'in_progress': return { color: '#22c55e', text: '🔧 En cours' }
      case 'completed': return { color: '#64748b', text: '✔️ Terminé' }
      case 'cancelled': return { color: '#dc2626', text: '❌ Annulé' }
      default: return { color: '#64748b', text: status }
    }
  }

  return (
    <div className="page-shell">
      <AppHeader subTitle="RENDEZ-VOUS" />

      <section className="about-section">
        <div className="about-card">
          <h2>📅 Mes rendez-vous</h2>
          <p style={{ color: '#f8fafc', marginBottom: '20px' }}>
            Gérez vos rendez-vous de réparation automobile.
          </p>

          {loading ? (
            <p style={{textAlign: 'center', color: '#94a3b8'}}>Chargement...</p>
          ) : appointments.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px 0'}}>
              <p style={{color: '#94a3b8', marginBottom: '20px'}}>Aucun rendez-vous pour le moment.</p>
              <button className="btn btn-primary" onClick={() => navigate('/garages')}>
                🔧 Prendre rendez-vous
              </button>
            </div>
          ) : (
            <div style={{display: 'grid', gap: '15px'}}>
              {appointments.map(appt => {
                const statusInfo = getStatusStyle(appt.status)
                return (
                  <div key={appt.id} style={{
                    background: '#0f172a',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid rgba(255,255,255,0.1)`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px'}}>
                        <strong style={{color: 'white'}}>{appt.garage_name}</strong>
                        <span style={{color: statusInfo.color, fontWeight: 'bold', fontSize: '0.85rem'}}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <p style={{color: '#94a3b8', fontSize: '0.85rem', margin: '3px 0'}}>
                        📍 {appt.garage_location} | 🚗 {appt.vehicle_type}
                      </p>
                      <p style={{color: '#94a3b8', fontSize: '0.85rem', margin: '3px 0'}}>
                        🗓️ {appt.appointment_date} à {appt.appointment_time}
                      </p>
                      <p style={{color: '#64748b', fontSize: '0.8rem'}}>
                        🔧 {appt.service_required}
                      </p>
                    </div>
                    {appt.status === 'pending' || appt.status === 'confirmed' ? (
                      <button 
                        className="btn btn-primary btn-compact"
                        onClick={() => handleCancel(appt.id)}
                        style={{background: '#dc2626'}}
                      >
                        ❌ Annuler
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

// =======
// 📋 Suivi des réparations
// =======
function RepairsPage() {
  const [repairs, setRepairs] = useState([])
  const [selectedRepair, setSelectedRepair] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const userToken = localStorage.getItem('user_token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!userToken) return navigate('/connexion')
    
    fetch('/api/repairs', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    })
    .then(res => res.json())
    .then(data => {
      setRepairs(data.repairs || [])
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }, [userToken, navigate])

  const loadUpdates = async (repairId) => {
    try {
      const res = await fetch(`/api/repairs/${repairId}/updates`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      const data = await res.json()
      setUpdates(data.updates || [])
    } catch (err) {
      setUpdates([])
    }
  }

  const handleSelectRepair = (repair) => {
    setSelectedRepair(repair)
    loadUpdates(repair.id)
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳'
      case 'diagnosing': return '🔍'
      case 'in_progress': return '🔧'
      case 'waiting_parts': return '📦'
      case 'completed': return '✅'
      case 'cancelled': return '❌'
      default: return '📋'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b'
      case 'diagnosing': return '#3b82f6'
      case 'in_progress': return '#22c55e'
      case 'waiting_parts': return '#f97316'
      case 'completed': return '#64748b'
      case 'cancelled': return '#dc2626'
      default: return '#64748b'
    }
  }

  return (
    <div className="page-shell">
      <AppHeader subTitle="SUIVI" />

      <section className="about-section">
        <div className="about-card">
          <h2>📋 Suivi des réparations en temps réel</h2>
          <p style={{ color: '#f8fafc', marginBottom: '20px' }}>
            Suivez l'avancement de vos réparations directement depuis votre espace.
          </p>

          {loading ? (
            <p style={{textAlign: 'center', color: '#94a3b8'}}>Chargement...</p>
          ) : repairs.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px 0'}}>
              <p style={{color: '#94a3b8', marginBottom: '20px'}}>Aucune réparation en cours.</p>
              <button className="btn btn-primary" onClick={() => navigate('/diagnostic')}>
                🔍 Faire un diagnostic
              </button>
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: selectedRepair ? '1fr 1fr' : '1fr', gap: '20px'}}>
              {/* Liste des réparations */}
              <div style={{display: 'grid', gap: '12px'}}>
                <h3 style={{color: 'white'}}>Mes réparations</h3>
                {repairs.map(repair => (
                  <div key={repair.id} 
                    onClick={() => handleSelectRepair(repair)}
                    style={{
                      background: selectedRepair?.id === repair.id ? '#1e293b' : '#0f172a',
                      padding: '15px',
                      borderRadius: '10px',
                      border: selectedRepair?.id === repair.id ? '2px solid #E31837' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <strong style={{color: 'white'}}>{repair.garage_name}</strong>
                      <span style={{
                        color: getStatusColor(repair.status),
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}>
                        {getStatusIcon(repair.status)} {repair.status}
                      </span>
                    </div>
                    <p style={{color: '#94a3b8', fontSize: '0.85rem', margin: '5px 0'}}>
                      🚗 {repair.vehicle_info}
                    </p>
                    <p style={{color: '#64748b', fontSize: '0.8rem', margin: '3px 0'}}>
                      🔧 {repair.problem_description}
                    </p>
                    {repair.estimated_cost && (
                      <p style={{color: '#22c55e', fontSize: '0.9rem', fontWeight: 'bold', margin: '5px 0'}}>
                        💰 Estimation: {repair.estimated_cost} DA
                      </p>
                    )}
                    {repair.final_cost && (
                      <p style={{color: '#f59e0b', fontSize: '0.9rem', fontWeight: 'bold', margin: '5px 0'}}>
                        💰 Coût final: {repair.final_cost} DA
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Timeline de la réparation sélectionnée */}
              {selectedRepair && (
                <div>
                  <h3 style={{color: 'white', marginBottom: '15px'}}>
                    {getStatusIcon(selectedRepair.status)} Suivi en temps réel
                  </h3>
                  
                  {selectedRepair.diagnosis_notes && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      marginBottom: '15px'
                    }}>
                      <strong style={{color: '#3b82f6'}}>Notes de diagnostic :</strong>
                      <p style={{color: '#e2e8f0', margin: '5px 0 0'}}>{selectedRepair.diagnosis_notes}</p>
                    </div>
                  )}

                  {selectedRepair.garage_phone && (
                    <div style={{marginBottom: '15px'}}>
                      <button className="btn btn-secondary btn-compact" 
                        onClick={() => window.location.href = `tel:${selectedRepair.garage_phone}`}>
                        📞 Contacter le garage
                      </button>
                    </div>
                  )}

                  <div style={{position: 'relative'}}>
                    {updates.length === 0 ? (
                      <p style={{color: '#94a3b8', textAlign: 'center', padding: '20px'}}>
                        Aucune mise à jour pour le moment.
                      </p>
                    ) : (
                      updates.map((update, index) => (
                        <div key={update.id} style={{
                          display: 'flex',
                          gap: '15px',
                          marginBottom: '15px',
                          position: 'relative',
                          paddingLeft: '30px'
                        }}>
                          {/* Ligne verticale */}
                          {index < updates.length - 1 && (
                            <div style={{
                              position: 'absolute',
                              left: '12px',
                              top: '24px',
                              bottom: '-15px',
                              width: '2px',
                              background: 'rgba(227,24,55,0.3)'
                            }} />
                          )}
                          {/* Point */}
                          <div style={{
                            position: 'absolute',
                            left: '5px',
                            top: '4px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: getStatusColor(update.status),
                            border: '3px solid #0f172a',
                          }} />
                          {/* Contenu */}
                          <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            padding: '12px',
                            borderRadius: '8px',
                            flex: 1
                          }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <strong style={{
                                color: getStatusColor(update.status),
                                fontSize: '0.85rem'
                              }}>
                                {getStatusIcon(update.status)} {update.status}
                              </strong>
                              <span style={{color: '#64748b', fontSize: '0.75rem'}}>
                                {update.created_at}
                              </span>
                            </div>
                            {update.message && (
                              <p style={{color: '#cbd5e1', margin: '5px 0 0', fontSize: '0.9rem'}}>
                                {update.message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

// =======
// 🏪 Services Finder (existant)
// =======
function ServicesFinder() {
  const [search, setSearch] = useState('')
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data.services)
        setFilteredServices(data.services)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur lors du chargement des services:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (services.length === 0) return
    setFilteredServices(services.filter(s => {
      const serviceList = JSON.parse(s.services_list || '[]')
      return s.name.toLowerCase().includes(search.toLowerCase()) || 
             s.location.toLowerCase().includes(search.toLowerCase()) ||
             serviceList.some(service => service.toLowerCase().includes(search.toLowerCase()))
    }))
  }, [search, services])

  const handleVoteService = async (serviceId, type) => {
    try {
      const response = await fetch(`/api/services/${serviceId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        const result = await response.json();
        setServices(prevServices => prevServices.map(s => {
          if (s.id === serviceId) {
            return {
              ...s,
              rating: result.rating,
              votes_up: result.votes_up,
              votes_down: result.votes_down,
              reviews_count: result.reviews_count
            }
          }
          return s;
        }));
        
        const votedServices = JSON.parse(localStorage.getItem('voted_services') || '{}');
        votedServices[serviceId] = type;
        localStorage.setItem('voted_services', JSON.stringify(votedServices));
        
        alert('✅ Merci pour votre vote!');
      }
    } catch (err) {
      alert('❌ Erreur lors du vote');
    }
  }

  const formatWorkingDays = (daysText) => {
    if (!daysText) return '';
    
    const dayNames = {
      'lun': 'lundi',
      'mar': 'mardi',
      'mer': 'mercredi',
      'jeu': 'jeudi',
      'ven': 'vendredi',
      'sam': 'samedi',
      'dim': 'dimanche'
    };
    
    return daysText.split(',')
      .map(dayKey => dayKey.trim())
      .map(dayKey => dayNames[dayKey.toLowerCase()] || dayKey)
      .join(', ');
  };

  const handleContactService = (service) => {
    if (!service.phone) {
      alert('❌ Numéro de téléphone non disponible pour ce service.');
      return;
    }

    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `tel:${service.phone}`;
    } else {
      if (confirm(`📞 Numéro de téléphone:\n${service.phone}\n\n✅ Appuyez sur OK pour copier le numéro`)) {
        navigator.clipboard.writeText(service.phone).then(() => {
          alert('✅ Numéro copié avec succès !');
        }).catch(() => {
          alert(`📞 Numéro de téléphone: ${service.phone}`);
        });
      }
    }
  }

  return (
    <div className="page-shell">
      <AppHeader subTitle="SERVICES" />

      <section className="about-section">
        <div className="about-card">
          <h2>Services à domicile</h2>
          <p style={{ color: '#f8fafc', marginBottom: '20px' }}>Trouvez des techniciens qualifiés qui se déplacent jusqu'à vous !</p>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher par nom, ville ou service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {filteredServices.map(service => {
              const serviceList = JSON.parse(service.services_list || '[]')
              return (
                <div key={service.id} className="service-card">
                  <div className="card-header">
                    {service.image_url ? (
                      <img 
                        src={service.image_url} 
                        alt={service.name} 
                        className="card-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="card-image-placeholder" style={service.image_url ? {display: 'none'} : {}}>
                      📷
                    </div>
                    <div className="card-info">
                      <h3 className="card-name">{service.name}</h3>
                      <p className="card-location">📍 {service.location}</p>
                      <div className="card-rating">
                        <span className="rating-stars">⭐ {parseFloat(service.rating) % 1 === 0 ? parseInt(service.rating) : parseFloat(service.rating).toFixed(1)}/5</span>
                        <span className="rating-text">💬 {service.reviews_count || 0} avis</span>
                        <span className="vote-count">👍 {service.votes_up || 0} | 👎 {service.votes_down || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-details">
                    {service.working_hours && (
                      <p>⏰ Horaires: {service.working_hours}</p>
                    )}
                    {service.working_days && (
                      <p>📅 Jours: {formatWorkingDays(service.working_days)}</p>
                    )}
                    <p className="card-description">{service.description}</p>
                  </div>

                  <div>
                    <strong style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Services proposés:</strong>
                    <ul className="services-list">
                      {serviceList.map((serv, index) => (
                        <li key={index}>{serv}</li>
                      ))}
                    </ul>
                  </div>

                  {localStorage.getItem('user_token') && (
                    <div className="vote-buttons">
                      <button 
                        className="btn btn-secondary btn-compact"
                        onClick={() => handleVoteService(service.id, 'up')}
                      >👍 J'aime</button>
                      <button 
                        className="btn btn-primary btn-compact"
                        onClick={() => handleVoteService(service.id, 'down')}
                      >👎 Je n'aime pas</button>
                    </div>
                  )}

                  <div className="card-actions">
                    <button className="btn btn-primary btn-compact" onClick={() => handleContactService(service)}>📞 Contacter</button>
                    {service.latitude && service.longitude && (
                      <button className="btn btn-secondary btn-compact" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${service.latitude},${service.longitude}`, '_blank')}>📍 Google Maps</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// =======
// 🏪 Garage Finder (existant avec bouton réserver)
// =======
function GarageFinder() {
  const [search, setSearch] = useState('')
  const [garages, setGarages] = useState([])
  const [filteredGarages, setFilteredGarages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(null)
  const [bookingData, setBookingData] = useState({
    service_required: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  })
  const userToken = localStorage.getItem('user_token')
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/garages')
      .then(res => res.json())
      .then(data => {
        setGarages(data.garages)
        setFilteredGarages(data.garages)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur lors du chargement des garages:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (garages.length === 0) return
    setFilteredGarages(garages.filter(g => 
      g.name.toLowerCase().includes(search.toLowerCase()) || 
      g.location.toLowerCase().includes(search.toLowerCase())
    ))
  }, [search, garages])

  const handleVoteGarage = async (garageId, type) => {
    try {
      const response = await fetch(`/api/garages/${garageId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        const result = await response.json();
        setGarages(prevGarages => prevGarages.map(g => {
          if (g.id === garageId) {
            return {
              ...g,
              rating: result.rating,
              votes_up: result.votes_up,
              votes_down: result.votes_down,
              reviews_count: result.reviews_count
            }
          }
          return g;
        }));
        
        const votedGarages = JSON.parse(localStorage.getItem('voted_garages') || '{}');
        votedGarages[garageId] = type;
        localStorage.setItem('voted_garages', JSON.stringify(votedGarages));
        
        alert('✅ Merci pour votre vote!');
      }
    } catch (err) {
      alert('❌ Erreur lors du vote');
    }
  }

  const handleContactGarage = (garage) => {
    if (!garage.phone) {
      alert('❌ Numéro de téléphone non disponible pour ce garage.');
      return;
    }

    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `tel:${garage.phone}`;
    } else {
      if (confirm(`📞 Numéro du garage:\n${garage.phone}\n\n✅ Appuyez sur OK pour copier le numéro`)) {
        navigator.clipboard.writeText(garage.phone).then(() => {
          alert('✅ Numéro copié avec succès !');
        }).catch(() => {
          alert(`📞 Numéro du garage: ${garage.phone}`);
        });
      }
    }
  }

  const handleBookingSubmit = async (garageId) => {
    if (!bookingData.service_required || !bookingData.appointment_date || !bookingData.appointment_time) {
      alert('❌ Veuillez remplir tous les champs obligatoires.')
      return
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          garage_id: garageId,
          ...bookingData
        })
      })

      const data = await res.json()
      if (res.ok) {
        alert('✅ Rendez-vous créé avec succès!')
        setShowBooking(null)
        setBookingData({ service_required: '', appointment_date: '', appointment_time: '', notes: '' })
      } else {
        alert(`❌ Erreur: ${data.error}`)
      }
    } catch (err) {
      alert('❌ Erreur de connexion')
    }
  }

  return (
    <div className="page-shell">
      <AppHeader subTitle="GARAGE" />

      <section className="about-section">
        <div className="about-card">
          <h2>Trouver un garage</h2>
          <p style={{ color: '#f8fafc', marginBottom: '20px' }}>Trouvez des garages certifiés et réservez votre rendez-vous en ligne !</p>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher par nom ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 700px)', gap: '20px', justifyContent: 'center', maxWidth: '700px', margin: '0 auto' }}>
            {filteredGarages.map(garage => {
              const garageServices = JSON.parse(garage.services || '[]');
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              const minDate = tomorrow.toISOString().split('T')[0]

              return (
                <div key={garage.id} className="garage-card">
                  <div className="card-header">
                    {garage.image_url ? (
                      <img 
                        src={garage.image_url} 
                        alt={garage.name} 
                        className="card-image"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          if (e.target.nextElementSibling) {
                            e.target.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="card-image-placeholder" style={garage.image_url ? {display: 'none'} : {}}>
                      🏪
                    </div>
                    <div className="card-info">
                      <h3 className="card-name">{garage.name}</h3>
                      <p className="card-location">📍 {garage.location}</p>
                      <div className="card-rating">
                        <span className="rating-stars">⭐ {parseFloat(garage.rating) % 1 === 0 ? parseInt(garage.rating) : parseFloat(garage.rating).toFixed(1)}/5</span>
                        <span className="rating-text">💬 {garage.reviews_count || 0} avis</span>
                        <span className="vote-count">👍 {garage.votes_up || 0} | 👎 {garage.votes_down || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-details">
                    {garage.working_hours && (
                      <p>⏰ Horaires: {garage.working_hours}</p>
                    )}
                    {garage.working_days && (
                      <p>📅 Jours: {garage.working_days}</p>
                    )}
                    {garage.description && (
                      <p className="card-description">{garage.description}</p>
                    )}
                  </div>

                  <div>
                    <strong style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Services proposés:</strong>
                    <ul className="services-list">
                      {garageServices.map((serv, index) => (
                        <li key={index}>✔ {serv}</li>
                      ))}
                    </ul>
                  </div>

                  {localStorage.getItem('user_token') && (
                    <div className="vote-buttons">
                      <button 
                        className="btn btn-secondary btn-compact"
                        onClick={() => handleVoteGarage(garage.id, 'up')}
                      >👍 J'aime</button>
                      <button 
                        className="btn btn-primary btn-compact"
                        onClick={() => handleVoteGarage(garage.id, 'down')}
                      >👎 Je n'aime pas</button>
                    </div>
                  )}

                  <div className="card-actions">
                    <button className="btn btn-primary btn-compact" onClick={() => handleContactGarage(garage)}>📞 Appeler</button>
                    {userToken && (
                      <button className="btn btn-secondary btn-compact" onClick={() => setShowBooking(showBooking === garage.id ? null : garage.id)}>
                        📅 Réserver
                      </button>
                    )}
                    {garage.latitude && garage.longitude && (
                      <button className="btn btn-secondary btn-compact" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${garage.latitude},${garage.longitude}`, '_blank')}>📍 Google Maps</button>
                    )}
                  </div>

                  {/* Formulaire de réservation */}
                  {showBooking === garage.id && (
                    <div style={{
                      marginTop: '15px',
                      padding: '15px',
                      background: '#1e293b',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <h4 style={{color: 'white', marginBottom: '12px'}}>📅 Réserver chez {garage.name}</h4>
                      
                      <div className="form-group" style={{marginBottom: '10px'}}>
                        <label>Service requis *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={bookingData.service_required}
                          onChange={e => setBookingData({...bookingData, service_required: e.target.value})}
                          placeholder="Ex: Vidange, Réparation freins..."
                        />
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                        <div className="form-group">
                          <label>Date *</label>
                          <input
                            type="date"
                            className="form-input"
                            min={minDate}
                            value={bookingData.appointment_date}
                            onChange={e => setBookingData({...bookingData, appointment_date: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Heure *</label>
                          <input
                            type="time"
                            className="form-input"
                            value={bookingData.appointment_time}
                            onChange={e => setBookingData({...bookingData, appointment_time: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{marginBottom: '12px'}}>
                        <label>Notes (optionnel)</label>
                        <textarea
                          className="form-input"
                          rows="2"
                          value={bookingData.notes}
                          onChange={e => setBookingData({...bookingData, notes: e.target.value})}
                          placeholder="Décrivez votre problème..."
                        />
                      </div>

                      <div style={{display: 'flex', gap: '10px'}}>
                        <button className="btn btn-primary" onClick={() => handleBookingSubmit(garage.id)} style={{flex: 1, background: '#16a34a'}}>
                          ✅ Confirmer la réservation
                        </button>
                        <button className="btn btn-secondary" onClick={() => {setShowBooking(null); setBookingData({ service_required: '', appointment_date: '', appointment_time: '', notes: '' })}}>
                          ❌ Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// =======
// 🔐 Connexion (existant)
// =======
function ConnexionPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone || !password) {
      setMessage('Veuillez remplir tous les champs')
      return
    }

    setMessage('Connexion en cours...')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('user_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        setMessage('✅ Connexion réussie ! Bienvenue.')
        
        setTimeout(() => {
          navigate('/')
          window.location.reload()
        }, 1500)
      } else {
        setMessage('❌ Non inscrit ! Vous pouvez créer un compte ci-dessous.')
      }
    } catch (err) {
      setMessage('❌ Erreur de connexion au serveur.')
    }
  }

  return (
    <div className="page-shell">
      <header className="header-bar">
        <div className="brand-card">
          <span className="brand-logo">MechanicSmart</span>
        </div>
        <nav className="nav-links">
          <Link to="/">Accueil</Link>
          <Link to="/about">À propos</Link>
        </nav>
      </header>

      <section className="connexion-section">
        <div className="connexion-card">
          <h2>Connexion</h2>
          <form onSubmit={handleSubmit} className="connexion-form">
            <div className="form-group">
              <label htmlFor="phone">Numéro de téléphone</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Entrez votre numéro de téléphone"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="form-input"
              />
            </div>
            {message && <div className="message">{message}</div>}
            <button type="submit" className="btn btn-primary">Se connecter</button>
            
            {message.includes('Non inscrit') && (
              <div style={{marginTop: '20px', textAlign: 'center'}}>
                <Link to="/inscription" className="btn btn-primary">
                  🆕 S'inscrire
                </Link>
              </div>
            )}
          </form>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// =======
// 📝 Inscription (existant)
// =======
function InscriptionPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [carType, setCarType] = useState('')
  const [otherCar, setOtherCar] = useState('')
  const [message, setMessage] = useState('')
  const [customCars, setCustomCars] = useState([])

  const popularCars = [
    'Dacia Logan', 'Dacia Sandero', 'Dacia Duster',
    'Renault Clio', 'Renault Megane', 'Renault Kwid',
    'Peugeot 208', 'Peugeot 301', 'Peugeot 2008',
    'Citroën C3', 'Citroën C4',
    'Toyota Corolla', 'Toyota Hilux',
    'Hyundai Tucson', 'Hyundai Accent',
    'Kia Picanto', 'Kia Sportage',
    'Fiat Panda', 'Fiat 500'
  ]

  const allCars = [...popularCars, ...customCars]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone || !password || (!carType && !otherCar)) {
      setMessage('Veuillez remplir tous les champs')
      return
    }

    setMessage('Création du compte en cours...')

    try {
      const selectedVehicle = carType === 'Autre' ? otherCar : carType;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          password: password,
          carType: selectedVehicle
        })
      })

      const data = await response.json()

      if (response.ok) {
        if (carType === 'Autre' && otherCar.trim()) {
          setCustomCars(prev => [...prev, otherCar.trim()])
          setMessage(`✅ Inscription réussie ! Votre véhicule "${otherCar.trim()}" a été ajouté à la liste.`)
        } else {
          setMessage('✅ Inscription réussie ! Bienvenue.')
        }
        
        console.log('✅ Utilisateur créé avec succès dans la base de données:', data.user)
        
        setPhone('')
        setPassword('')
        setCarType('')
        setOtherCar('')
      } else {
        setMessage(`❌ Erreur: ${data.error}`)
      }
    } catch (err) {
      setMessage('❌ Erreur de connexion au serveur.')
    }
  }

  const handleCarTypeChange = (e) => {
    const value = e.target.value
    setCarType(value)
    if (value !== 'Autre') {
      setOtherCar('')
    }
  }

  return (
    <div className="page-shell">
      <header className="header-bar">
        <div className="brand-card">
          <span className="brand-logo">MechanicSmart</span>
        </div>
        <nav className="nav-links">
          <Link to="/">Accueil</Link>
          <Link to="/connexion">Connexion</Link>
          <Link to="/about">À propos</Link>
        </nav>
      </header>

      <section className="inscription-section">
        <div className="inscription-card">
          <h2>S'inscrire</h2>
          <form onSubmit={handleSubmit} className="inscription-form">
            <div className="form-group">
              <label htmlFor="phone">Numéro de téléphone</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Entrez votre numéro de téléphone"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="carType">Type de véhicule</label>
              <select
                id="carType"
                value={carType}
                onChange={handleCarTypeChange}
                className="form-input"
              >
                <option value="">Sélectionnez votre véhicule</option>
                {allCars.map(car => (
                  <option key={car} value={car}>{car}</option>
                ))}
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            {carType === 'Autre' && (
              <div className="form-group">
                <label htmlFor="otherCar">Nom de votre véhicule</label>
                <input
                  type="text"
                  id="otherCar"
                  value={otherCar}
                  onChange={(e) => setOtherCar(e.target.value)}
                  placeholder="Entrez le nom de votre véhicule"
                  className="form-input"
                />
              </div>
            )}
            {message && <div className="message">{message}</div>}
            <button type="submit" className="btn btn-primary">S'inscrire</button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// =======
// ℹ️ À propos (existant)
// =======
function AboutPage({ stats, garages, services }) {
  return (
    <div className="page-shell">
      <AppHeader />

      <main className="about-main">
        <section className="about-section">
          <div className="about-card">
            <h2>À propos de MechanicSmart</h2>
            <p>MechanicSmart est une plateforme innovante qui connecte les propriétaires de véhicules aux meilleurs garages et services d'entretien automobile.</p>
            <p>Nous facilitons la réservation des services de maintenance, le suivi des réparations en temps réel et l'accès à des prestations de qualité.</p>
            <p>Notre mission est d'améliorer l'expérience d'entretien automobile en Algérie grâce à la technologie et à un réseau de garages partenaires fiables.</p>
            
            <div style={{marginTop: '25px', padding: '15px', background: 'rgba(227,24,55,0.1)', borderRadius: '10px', border: '1px solid rgba(227,24,55,0.2)'}}>
              <h3 style={{color: '#E31837', marginBottom: '10px'}}>🚀 Fonctionnalités réelles :</h3>
              <ul style={{color: '#cbd5e1', lineHeight: '2', listStyle: 'none', padding: 0}}>
                <li>✅ <strong>Réservation de rendez-vous</strong> - Prenez rendez-vous en ligne chez nos garages partenaires</li>
                <li>✅ <strong>Diagnostic en ligne</strong> - Analysez les symptômes de votre véhicule avant de vous déplacer</li>
                <li>✅ <strong>Suivi des réparations</strong> - Suivez l'avancement de vos réparations en temps réel</li>
                <li>✅ <strong>Services à domicile</strong> - Des techniciens qualifiés se déplacent jusqu'à vous</li>
                <li>✅ <strong>Réseau de garages</strong> - Plus de 30 garages partenaires certifiés</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="diagnostic-section">
          <div className="section-heading">
            <h2>Chiffres clés de MechanicSmart</h2>
            <p>Découvrez les statistiques en temps réel de notre plateforme automobile.</p>
          </div>
          <div className="cards-grid">
            <div className="stats-card">
              <h3>{stats.totalUsers || 0}</h3>
              <p>Utilisateurs</p>
            </div>
            <div className="stats-card">
              <h3>{garages.length}</h3>
              <p>Garages enregistrés</p>
            </div>
            <div className="stats-card">
              <h3>{services.length}</h3>
              <p>Services à domicile</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

// =======
// 👑 Admin Dashboard (existant)
// =======
function AdminDashboard() {
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [message, setMessage] = useState('')

  // ✅ متغيرات الحالة لاقسام الجراجات والخدمات الجديدة
  const [garages, setGarages] = useState([])
  const [services, setServices] = useState([])
  const [showGarageForm, setShowGarageForm] = useState(false)
  const [editingGarage, setEditingGarage] = useState(null)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [newGarage, setNewGarage] = useState({name: '', location: '', rating: '5.0', reviews_count: '0', phone: '', address: '', working_hours: '', working_days: '', image_url: '', latitude: '', longitude: '', services: ''})
  const [newService, setNewService] = useState({name: '', location: '', rating: '5.0', reviews_count: '0', phone: '', description: '', working_hours: '', working_days: '', image_url: '', latitude: '', longitude: '', services_list: ''})
  
  // ✅ حالة أيام العمل لأزرار الاختيار
  const [workingDays, setWorkingDays] = useState([])
  const [editWorkingDays, setEditWorkingDays] = useState([])
  
  // ✅ حالة مواعيد العمل
  const [openingTime, setOpeningTime] = useState('08:00')
  const [closingTime, setClosingTime] = useState('18:00')
  const [editOpeningTime, setEditOpeningTime] = useState('08:00')
  const [editClosingTime, setEditClosingTime] = useState('18:00')
  const [sameHoursForAllDays, setSameHoursForAllDays] = useState(true)

  // ✅ متغيرات للاصلاحات والمواعيد
  const [repairs, setRepairs] = useState([])
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('garages')
  
  // ✅ قائمة بالاواقيت الزمنية لكل 30 دقيقة
  const timeSlots = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0')
      const minute = m.toString().padStart(2, '0')
      timeSlots.push(`${hour}:${minute}`)
    }
  }

  // ✅ دالة تبديل اختيار يوم واحد
  const toggleDay = (dayKey, isEdit = false) => {
    const targetState = isEdit ? editWorkingDays : workingDays
    const setTarget = isEdit ? setEditWorkingDays : setWorkingDays
    
    if (targetState.includes(dayKey)) {
      setTarget(targetState.filter(d => d !== dayKey))
    } else {
      setTarget([...targetState, dayKey])
    }
  }

  // ✅ دالة اختيار جميع الايام
  const toggleAllDays = (isEdit = false) => {
    const allDays = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']
    const setTarget = isEdit ? setEditWorkingDays : setWorkingDays
    const currentState = isEdit ? editWorkingDays : workingDays
    
    if (currentState.length === 7) {
      setTarget([])
    } else {
      setTarget(allDays)
    }
  }

  const loadAdminData = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users)
      }

      const garagesRes = await fetch('/api/garages', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (garagesRes.ok) {
        const garagesData = await garagesRes.json()
        setGarages(garagesData.garages)
      }

      const servicesRes = await fetch('/api/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData.services)
      }

      // ✅ جلب الاصلاحات والمواعيد
      const repairsRes = await fetch('/api/admin/repairs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (repairsRes.ok) {
        const repairsData = await repairsRes.json()
        setRepairs(repairsData.repairs || [])
      }

      const appointmentsRes = await fetch('/api/admin/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData.appointments || [])
      }
    } catch (err) {
      localStorage.removeItem('admin_token')
      setLoggedIn(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      setLoggedIn(true)
      loadAdminData()
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
      setMessage('Connexion en cours...')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })

      const data = await res.json()

      if (res.ok && data.user.role === 'admin') {
        localStorage.setItem('admin_token', data.token)
        localStorage.setItem('user_token', data.token)
        setLoggedIn(true)
        setMessage('✅ Connexion réussie !')
        await loadAdminData()
      } else {
        setMessage('❌ Accès non autorisé.')
      }
    } catch (err) {
      setMessage('❌ Erreur de connexion au serveur.')
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      setLoggedIn(true)
      loadAdminData()
    }
  }, [loggedIn])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setLoggedIn(false)
    setPhone('')
    setPassword('')
  }

  // ✅ دالة تحديث جراج
  const handleUpdateGarage = async () => {
    const token = localStorage.getItem('admin_token')
    if (!editingGarage.name || !editingGarage.location) {
      setMessage('❌ Nom et localisation sont obligatoires.')
      return
    }

    const servicesArray = editingGarage.services.split(',').map(s => s.trim()).filter(s => s)

    const dayNames = {
      'lun': 'lundi',
      'mar': 'mardi',
      'mer': 'mercredi',
      'jeu': 'jeudi',
      'ven': 'vendredi',
      'sam': 'samedi',
      'dim': 'dimanche'
    };
    
    let finalWorkingDays = '';
    if (editWorkingDays.length > 0) {
      finalWorkingDays = editWorkingDays.map(dayKey => dayNames[dayKey] || dayKey).join(', ');
    } else {
      finalWorkingDays = editingGarage.working_days;
    }
    
    let finalWorkingHours = '';
    if (editOpeningTime && editClosingTime) {
      finalWorkingHours = `${editOpeningTime} - ${editClosingTime}`;
    } else {
      finalWorkingHours = editingGarage.working_hours;
    }

    try {
      const res = await fetch(`/api/admin/garages/${editingGarage.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingGarage.name,
          location: editingGarage.location,
          rating: editingGarage.rating,
          reviews_count: editingGarage.reviews_count,
          services: servicesArray,
          phone: editingGarage.phone,
          address: editingGarage.address,
          working_hours: finalWorkingHours,
          working_days: finalWorkingDays,
          image_url: editingGarage.image_url,
          latitude: editingGarage.latitude,
          longitude: editingGarage.longitude,
          source: editingGarage.source,
          verified: editingGarage.verified
        })
      })

      if (res.ok) {
        setMessage('✅ Garage modifié avec succès !')
        setEditingGarage(null)
        loadAdminData()
      }
    } catch (err) {
      setMessage('❌ Erreur lors de la modification.')
    }
  }

  // ✅ دالة اضافة جراج جديد
  const handleAddGarage = async () => {
    const token = localStorage.getItem('admin_token')
    if (!newGarage.name || !newGarage.location) {
      setMessage('❌ Nom et localisation sont obligatoires.')
      return
    }

    const servicesArray = newGarage.services.split(',').map(s => s.trim()).filter(s => s)

    const dayNames = {
      'lun': 'lundi',
      'mar': 'mardi',
      'mer': 'mercredi',
      'jeu': 'jeudi',
      'ven': 'vendredi',
      'sam': 'samedi',
      'dim': 'dimanche'
    };
    
    let finalWorkingDays = '';
    if (workingDays.length > 0) {
      finalWorkingDays = workingDays.map(dayKey => dayNames[dayKey] || dayKey).join(', ');
    }
    
    let finalWorkingHours = '';
    if (openingTime && closingTime) {
      finalWorkingHours = `${openingTime} - ${closingTime}`;
    }

    try {
      const res = await fetch('/api/admin/garages', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newGarage.name,
          location: newGarage.location,
          rating: newGarage.rating,
          reviews_count: newGarage.reviews_count,
          services: servicesArray,
          phone: newGarage.phone,
          address: newGarage.address,
          working_hours: finalWorkingHours,
          working_days: finalWorkingDays,
          image_url: newGarage.image_url,
          latitude: newGarage.latitude,
          longitude: newGarage.longitude,
          source: newGarage.verified === false ? 'Google Maps' : 'local',
          verified: newGarage.verified !== false
        })
      })

      if (res.ok) {
        setMessage('✅ Garage ajouté avec succès !')
        setNewGarage({name: '', location: '', rating: '5.0', reviews_count: '0', phone: '', address: '', working_hours: '', working_days: '', image_url: '', latitude: '', longitude: '', services: ''})
        setShowGarageForm(false)
        loadAdminData()
      }
    } catch (err) {
      setMessage('❌ Erreur lors de l\'ajout.')
    }
  }

  // ✅ دالة حذف جراج
  const handleDeleteGarage = async (id) => {
    const token = localStorage.getItem('admin_token')
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce garage ?')) return

    try {
      await fetch(`/api/admin/garages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      loadAdminData()
    } catch (err) {
      setMessage('❌ Erreur lors de la suppression.')
    }
  }

  // ✅ دالة تحديث خدمة
  const handleUpdateService = async () => {
    const token = localStorage.getItem('admin_token')
    if (!editingService.name || !editingService.location) {
      setMessage('❌ Nom et localisation sont obligatoires.')
      return
    }

    let servicesArray = []
    try {
      servicesArray = editingService.services_list.split(',').map(s => s.trim()).filter(s => s)
    } catch (e) {
      console.error('❌ Erreur parsing: ' + e.message)
    }

    const dayNames = {
      'lun': 'lundi',
      'mar': 'mardi',
      'mer': 'mercredi',
      'jeu': 'jeudi',
      'ven': 'vendredi',
      'sam': 'samedi',
      'dim': 'dimanche'
    };
    
    let finalWorkingDays = '';
    if (editWorkingDays.length > 0) {
      finalWorkingDays = editWorkingDays.map(dayKey => dayNames[dayKey] || dayKey).join(', ');
    } else {
      finalWorkingDays = editingService.working_days;
    }
    
    let finalWorkingHours = '';
    if (editOpeningTime && editClosingTime) {
      finalWorkingHours = `${editOpeningTime} - ${editClosingTime}`;
    } else {
      finalWorkingHours = editingService.working_hours;
    }

    console.log('🔧 ✅ ========== FINAL VALUES BEING SENT ==========');
    console.log('✅ working_hours =', finalWorkingHours);
    console.log('✅ working_days =', finalWorkingDays);
    console.log('✅ =============================================');

    try {
      const res = await fetch(`/api/admin/services/${editingService.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingService.name,
          location: editingService.location,
          rating: parseFloat(editingService.rating) || 5.0,
          reviews_count: parseInt(editingService.reviews_count) || 0,
          description: editingService.description || '',
          services_list: servicesArray,
          phone: editingService.phone || '',
          working_hours: finalWorkingHours,
          working_days: finalWorkingDays,
          image_url: editingService.image_url,
          source: editingService.source || 'local',
          verified: editingService.verified !== 0 && editingService.verified !== false
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('✅ Service modifié avec succès !')
        setEditingService(null)
      } else {
        setMessage('❌ Erreur serveur: ' + (data.error || 'Inconnue'))
      }
    } catch (err) {
      setMessage('❌ Erreur lors de la modification: ' + err.message)
    }
  }

  // ✅ دالة اضافة خدمة جديدة
  const handleAddService = async () => {
    const token = localStorage.getItem('admin_token')
    if (!newService.name || !newService.location) {
      setMessage('❌ Nom et localisation sont obligatoires.')
      return
    }

    const servicesArray = newService.services_list.split(',').map(s => s.trim()).filter(s => s)

    const dayNames = {
      'lun': 'lundi',
      'mar': 'mardi',
      'mer': 'mercredi',
      'jeu': 'jeudi',
      'ven': 'vendredi',
      'sam': 'samedi',
      'dim': 'dimanche'
    };
    
    let finalWorkingDays = '';
    if (workingDays.length > 0) {
      finalWorkingDays = workingDays.map(dayKey => dayNames[dayKey] || dayKey).join(', ');
    }
    
    let finalWorkingHours = '';
    if (openingTime && closingTime) {
      finalWorkingHours = `${openingTime} - ${closingTime}`;
    }

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newService.name,
          location: newService.location,
          rating: newService.rating,
          reviews_count: newService.reviews_count,
          description: newService.description,
          services_list: servicesArray,
          phone: newService.phone,
          working_hours: finalWorkingHours,
          working_days: finalWorkingDays,
          image_url: newService.image_url,
          latitude: newService.latitude,
          longitude: newService.longitude,
          source: newService.verified === false ? 'Google Maps' : 'local',
          verified: newService.verified !== false
        })
      })

      if (res.ok) {
        setMessage('✅ Service ajouté avec succès !')
        setNewService({name: '', location: '', rating: '5.0', reviews_count: '0', phone: '', description: '', working_hours: '', working_days: '', image_url: '', latitude: '', longitude: '', services_list: ''})
        setShowServiceForm(false)
        loadAdminData()
      }
    } catch (err) {
      setMessage('❌ Erreur lors de l\'ajout.')
    }
  }

  // ✅ دالة حذف خدمة
  const handleDeleteService = async (id) => {
    const token = localStorage.getItem('admin_token')
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return

    try {
      await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      loadAdminData()
    } catch (err) {
      setMessage('❌ Erreur lors de la suppression.')
    }
  }

  // ✅ دالة حذف مستخدم
  const handleDeleteUser = async (id) => {
    const token = localStorage.getItem('admin_token')
    if (!window.confirm('⚠️ هل انت متاكد انك تريد حذف هذا المستخدم نهائيا؟')) return

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        setMessage('✅ تم حذف المستخدم بنجاح')
        loadAdminData()
      } else {
        const data = await res.json()
        setMessage(`❌ ${data.error}`)
      }
    } catch (err) {
      setMessage('❌ حدث خطأ اثناء الحذف')
    }
  }

  // ✅ تحديث حالة الاصلاح
  const handleUpdateRepairStatus = async (repairId, status, msg) => {
    const token = localStorage.getItem('admin_token')
    try {
      await fetch(`/api/admin/repairs/${repairId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, message: msg })
      })
      loadAdminData()
    } catch (err) {
      setMessage('❌ Erreur')
    }
  }

  if (!loggedIn) {
    return (
      <>
        <div className="page-shell">
          <header className="header-bar">
            <div className="brand-card">
              <span className="brand-logo">MechanicSmart</span>
              <span className="brand-sub">ADMIN</span>
            </div>
            <nav className="nav-links">
              <Link to="/">Accueil</Link>
              <Link to="/garages">Garages</Link>
              <Link to="/connexion">Connexion</Link>
              <Link to="/inscription">S'inscrire</Link>
            </nav>
          </header>

          <section className="connexion-section">
            <div className="connexion-card">
              <h2>🔐 Administration</h2>
              <form onSubmit={handleLogin} className="connexion-form">
                <div className="form-group">
                  <label>Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="admin"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin123"
                    className="form-input"
                  />
                </div>
                {message && <div className="message">{message}</div>}
                <button type="submit" className="btn btn-primary">Connexion</button>
              </form>
            </div>
          </section>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <div className="page-shell">
      <style>{adminResponsiveStyles}</style>
      <header className="header-bar">
        <div className="brand-card">
          <span className="brand-logo">MechanicSmart</span>
          <span className="brand-sub">ADMIN</span>
        </div>
        <nav className="nav-links">
          <button onClick={handleLogout} style={{background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'}}>Déconnexion</button>
        </nav>
      </header>

      <main className="about-main">
        <section className="diagnostic-section">
          <div className="section-heading">
            <h2>📊 Tableau de bord</h2>
            <p>Statistiques générales de la plateforme</p>
          </div>
          <div className="cards-grid">
            <div className="stats-card">
              <h3>{stats.totalVehicles || 0}</h3>
              <p>Véhicules enregistrés</p>
            </div>
            <div className="stats-card">
              <h3>{stats.totalUsers || 0}</h3>
              <p>Utilisateurs</p>
            </div>
            <div className="stats-card">
              <h3>{stats.activeDiagnostics || 0}</h3>
              <p>Défauts actifs</p>
            </div>
            <div className="stats-card">
              <h3 style={{color: 'red'}}>{stats.criticalCount || 0}</h3>
              <p>Défauts critiques</p>
            </div>
            <div className="stats-card">
              <h3 style={{color: '#22c55e'}}>{stats.activeRepairs || 0}</h3>
              <p>Réparations en cours</p>
            </div>
            <div className="stats-card">
              <h3 style={{color: '#3b82f6'}}>{stats.totalAppointments || 0}</h3>
              <p>Rendez-vous total</p>
            </div>
          </div>
        </section>

        {/* ✅ أزرار التبديل بين الأقسام */}
        <div className="admin-tab-bar">
          {[
            { key: 'garages', label: '🏪 Garages' },
            { key: 'services', label: '🔧 Services' },
            { key: 'users', label: '👥 Utilisateurs' },
            { key: 'repairs', label: '🔩 Réparations' },
            { key: 'appointments', label: '📅 Rendez-vous' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="admin-tab-btn"
              style={{
                background: activeTab === tab.key ? '#E31837' : '#1e293b',
                color: 'white'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {message && <div className="message" style={{margin: '10px auto', maxWidth: '800px'}}>{message}</div>}

        {/* ===== SECTION GARAGES ===== */}
        {activeTab === 'garages' && (
          <section className="about-section">
            <div className="about-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2>🏪 Gestion des Garages ({garages.length})</h2>
                <button className="btn btn-primary" onClick={() => setShowGarageForm(!showGarageForm)}>
                  ➕ Ajouter
                </button>
              </div>

              {showGarageForm && (
                <div style={{background: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '20px'}}>
                  <h3 style={{color: 'white', marginBottom: '15px'}}>Nouveau Garage</h3>
                  <div style={{display: 'grid', gap: '12px'}}>
                    <input placeholder="Nom du garage" value={newGarage.name} onChange={e => setNewGarage({...newGarage, name: e.target.value})} className="form-input" />
                    <input placeholder="Ville / Localisation (ex: Alger, Oran, Constantine)" value={newGarage.location} onChange={e => setNewGarage({...newGarage, location: e.target.value})} className="form-input" />
                    <input placeholder="Note (ex: 4.5)" value={newGarage.rating} onChange={e => setNewGarage({...newGarage, rating: e.target.value})} className="form-input" />
                    <input placeholder="Nombre d'avis (ex: 15)" value={newGarage.reviews_count} onChange={e => setNewGarage({...newGarage, reviews_count: e.target.value})} className="form-input" />
                    <input placeholder="Numéro de téléphone" value={newGarage.phone} onChange={e => setNewGarage({...newGarage, phone: e.target.value})} className="form-input" />
                    <input placeholder="Adresse complète (ex: 12 Rue Didouche Mourad, Alger)" value={newGarage.address} onChange={e => setNewGarage({...newGarage, address: e.target.value})} className="form-input" />
                    <div className="form-group">
                      <label>Horaires de travail</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#64748b' }}>De :</span>
                          <select 
                            value={openingTime}
                            onChange={(e) => setOpeningTime(e.target.value)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: 'white',
                              color: '#000000',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#64748b' }}>À :</span>
                          <select 
                            value={closingTime}
                            onChange={(e) => setClosingTime(e.target.value)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: 'white',
                              color: '#000000',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={sameHoursForAllDays}
                            onChange={(e) => setSameHoursForAllDays(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span style={{ color: '#475569', fontSize: '14px' }}>✓ Utiliser les mêmes horaires pour tous les jours</span>
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Jours de travail</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                        {[
                          { key: 'sam', label: 'Sam' },
                          { key: 'dim', label: 'Dim' },
                          { key: 'lun', label: 'Lun' },
                          { key: 'mar', label: 'Mar' },
                          { key: 'mer', label: 'Mer' },
                          { key: 'jeu', label: 'Jeu' },
                          { key: 'ven', label: 'Ven' }
                        ].map(day => (
                          <button
                            key={day.key}
                            type="button"
                            onClick={() => toggleDay(day.key, false)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '30px',
                              border: 'none',
                              backgroundColor: workingDays.includes(day.key) ? '#E31837' : '#e2e8f0',
                              color: workingDays.includes(day.key) ? 'white' : '#1e293b',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '55px'
                            }}
                          >
                            {day.label}
                            {workingDays.includes(day.key) && ' ✓'}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAllDays(false)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: '1px solid #E31837',
                          backgroundColor: 'transparent',
                          color: '#E31837',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginTop: '5px'
                        }}
                      >
                        ⋮ Tous les jours
                      </button>
                      <small style={{ color: '#64748b', display: 'block', marginTop: '8px' }}>
                        Cliquez sur les jours pour sélectionner/déselectionner
                      </small>
                    </div>
                    <input placeholder="URL de l'image" value={newGarage.image_url} onChange={e => setNewGarage({...newGarage, image_url: e.target.value})} className="form-input" />
                    <input placeholder="Latitude" value={newGarage.latitude} onChange={e => setNewGarage({...newGarage, latitude: e.target.value})} className="form-input" />
                    <input placeholder="Longitude" value={newGarage.longitude} onChange={e => setNewGarage({...newGarage, longitude: e.target.value})} className="form-input" />
                    <input placeholder="Services (séparés par virgule)" value={newGarage.services} onChange={e => setNewGarage({...newGarage, services: e.target.value})} className="form-input" />
                    
                    <div style={{color: 'white', marginBottom: '10px'}}>
                      <label style={{fontWeight: 'bold'}}>Statut du garage:</label>
                      <div style={{display: 'flex', gap: '20px', marginTop: '8px'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                          <input 
                            type="radio" 
                            name="garageStatus" 
                            checked={newGarage.verified !== false} 
                            onChange={() => setNewGarage({...newGarage, verified: true, source: 'local'})}
                          />
                          <span style={{background: '#64748b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>✔ vérifié | partner MechanicSmart</span>
                        </label>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                          <input 
                            type="radio" 
                            name="garageStatus" 
                            checked={newGarage.verified === false} 
                            onChange={() => setNewGarage({...newGarage, verified: false, source: 'Google Maps'})}
                          />
                          <span style={{background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>⏳ Non vérifié | Google Maps</span>
                        </label>
                      </div>
                    </div>

                    <button className="btn btn-primary" onClick={handleAddGarage}>✅ Enregistrer</button>
                  </div>
                </div>
              )}

              <div style={{display: 'grid', gap: '10px'}}>
                {garages.map(garage => (
                  <div key={garage.id} className="admin-item-card" style={{
                    background: garage.verified === 0 ? '#1a0f00' : '#0f172a',
                    padding: '15px',
                    borderRadius: '10px',
                    border: garage.verified === 0 ? '2px solid #dc2626' : '2px solid #64748b',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
                  }}>
                    <div style={{flex: '1 1 200px', minWidth: '200px'}}>
                      <strong style={{color: 'white'}}>{garage.name}</strong>
                      <p style={{color: '#94a3b8', fontSize: '0.9rem', margin: '3px 0'}}>📍 {garage.location} ⭐ {garage.rating}/5</p>
                      {garage.verified === 0 ? (
                        <span style={{background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'}}>⏳ Non vérifié | {garage.source}</span>
                      ) : (
                        <span style={{background: '#64748b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'}}>✔ vérifié | partner MechanicSmart</span>
                      )}
                    </div>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                      <button onClick={() => { setEditingGarage({ ...garage, services: JSON.parse(garage.services || '[]').join(', ') }) }} style={{background: '#dc2626', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'}}>✏️ Modifier</button>
                      {garage.verified === 0 && (
                        <button onClick={async () => {
                          const token = localStorage.getItem('admin_token');
                          try {
                            const res = await fetch(`/api/garages/external/${garage.id}/verify`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                              alert('✅ تم اعتماد الجراج بنجاح!');
                              loadAdminData();
                            } else {
                              const data = await res.text();
                              alert('❌ خطأ: ' + data);
                            }
                          } catch(err) {
                            alert('❌ خطأ في الاتصال بالخادم: ' + err.message);
                          }
                        }} style={{background: '#64748b', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'}}>✅ Approuver</button>
                      )}
                      <button onClick={() => handleDeleteGarage(garage.id)} style={{background: '#dc2626', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'}}>🗑️ Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== SECTION SERVICES ===== */}
        {activeTab === 'services' && (
          <section className="about-section">
            <div className="about-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2>🔧 Gestion des Services ({services.length})</h2>
                <button className="btn btn-primary" onClick={() => setShowServiceForm(!showServiceForm)}>➕ Ajouter</button>
              </div>
              {showServiceForm && (
                <div style={{background: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '20px'}}>
                  <h3 style={{color: 'white', marginBottom: '15px'}}>Nouveau Service à domicile</h3>
                  <div style={{display: 'grid', gap: '12px'}}>
                    <input placeholder="Nom du technicien" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="form-input" />
                    <input placeholder="Ville" value={newService.location} onChange={e => setNewService({...newService, location: e.target.value})} className="form-input" />
                    <input placeholder="Note (ex: 4.8)" value={newService.rating} onChange={e => setNewService({...newService, rating: e.target.value})} className="form-input" />
                    <input placeholder="Nombre d'avis (ex: 15)" value={newService.reviews_count} onChange={e => setNewService({...newService, reviews_count: e.target.value})} className="form-input" />
                    <input placeholder="Numéro de téléphone" value={newService.phone} onChange={e => setNewService({...newService, phone: e.target.value})} className="form-input" />
                    <textarea placeholder="Description du service" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="form-input" rows="2" />
                    <div className="form-group">
                      <label>Horaires de travail</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#64748b' }}>De :</span>
                          <select 
                            value={openingTime}
                            onChange={(e) => setOpeningTime(e.target.value)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: 'white',
                              color: '#000000',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#64748b' }}>À :</span>
                          <select 
                            value={closingTime}
                            onChange={(e) => setClosingTime(e.target.value)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: 'white',
                              color: '#000000',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={sameHoursForAllDays}
                            onChange={(e) => setSameHoursForAllDays(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span style={{ color: '#475569', fontSize: '14px' }}>✓ Utiliser les mêmes horaires pour tous les jours</span>
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Jours de travail</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                        {[
                          { key: 'sam', label: 'Sam' },
                          { key: 'dim', label: 'Dim' },
                          { key: 'lun', label: 'Lun' },
                          { key: 'mar', label: 'Mar' },
                          { key: 'mer', label: 'Mer' },
                          { key: 'jeu', label: 'Jeu' },
                          { key: 'ven', label: 'Ven' }
                        ].map(day => (
                          <button
                            key={day.key}
                            type="button"
                            onClick={() => toggleDay(day.key, false)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '30px',
                              border: 'none',
                              backgroundColor: workingDays.includes(day.key) ? '#E31837' : '#e2e8f0',
                              color: workingDays.includes(day.key) ? 'white' : '#1e293b',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '55px'
                            }}
                          >
                            {day.label}
                            {workingDays.includes(day.key) && ' ✓'}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAllDays(false)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: '1px solid #E31837',
                          backgroundColor: 'transparent',
                          color: '#E31837',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginTop: '5px'
                        }}
                      >
                        ⋮ Tous les jours
                      </button>
                      <small style={{ color: '#64748b', display: 'block', marginTop: '8px' }}>
                        Cliquez sur les jours pour sélectionner/déselectionner
                      </small>
                    </div>
                    <input placeholder="URL de l'image" value={newService.image_url} onChange={e => setNewService({...newService, image_url: e.target.value})} className="form-input" />
                    <input placeholder="Services proposés (séparés par virgule)" value={newService.services_list} onChange={e => setNewService({...newService, services_list: e.target.value})} className="form-input" />
                    
                    <div style={{color: 'white', marginBottom: '10px'}}>
                      <label style={{fontWeight: 'bold'}}>Statut du service:</label>
                      <div style={{display: 'flex', gap: '20px', marginTop: '8px'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                          <input 
                            type="radio" 
                            name="serviceStatus" 
                            checked={newService.verified !== false} 
                            onChange={() => setNewService({...newService, verified: true, source: 'local'})}
                          />
                          <span style={{background: '#64748b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>✔ vérifié | partner MechanicSmart</span>
                        </label>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                          <input 
                            type="radio" 
                            name="serviceStatus" 
                            checked={newService.verified === false} 
                            onChange={() => setNewService({...newService, verified: false, source: 'Google Maps'})}
                          />
                          <span style={{background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>⏳ Non vérifié | Google Maps</span>
                        </label>
                      </div>
                    </div>

                    <button className="btn btn-primary" onClick={handleAddService}>✅ Enregistrer</button>
                  </div>
                </div>
              )}
              <div style={{display: 'grid', gap: '10px'}}>
                {services.map(service => (
                  <div key={service.id} style={{
                    background: service.verified === 0 ? '#1a0f00' : '#0f172a',
                    padding: '15px',
                    borderRadius: '10px',
                    border: service.verified === 0 ? '2px solid #dc2626' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
                  }}>
                    <div style={{flex: '1 1 200px', minWidth: '200px'}}>
                      <strong style={{color: 'white'}}>{service.name}</strong>
                      <p style={{color: '#94a3b8', fontSize: '0.9rem', margin: '3px 0'}}>📍 {service.location} ⭐ {service.rating}/5</p>
                      {service.verified === 0 ? (
                        <span style={{background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'}}>⏳ Non vérifié | {service.source}</span>
                      ) : (
                        <span style={{background: '#64748b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'}}>✔ vérifié | partner MechanicSmart</span>
                      )}
                    </div>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                      <button onClick={() => { setEditingService({ ...service, services_list: JSON.parse(service.services_list || '[]').join(', ') }) }} style={{background: '#dc2626', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'}}>✏️ Modifier</button>
                      {service.verified === 0 && (
                        <button onClick={async () => {
                          const token = localStorage.getItem('admin_token');
                          try {
                            const res = await fetch(`/api/services/external/${service.id}/verify`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                              alert('✅ تم اعتماد الخدمة بنجاح!');
                              loadAdminData();
                            } else {
                              const data = await res.text();
                              alert('❌ خطأ: ' + data);
                            }
                          } catch(err) {
                            alert('❌ خطأ في الاتصال بالخادم: ' + err.message);
                          }
                        }} style={{background: '#64748b', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'}}>✅ Approuver</button>
                      )}
                      <button onClick={() => handleDeleteService(service.id)} style={{background: '#dc2626', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'}}>🗑️ Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== SECTION USERS ===== */}
        {activeTab === 'users' && (
          <section className="about-section">
            <div className="about-card">
              <h2>👥 Utilisateurs ({users.length})</h2>
              <div style={{display: 'grid', gap: '10px', marginTop: '15px'}}>
                {users.map(user => (
                  <div key={user.id} style={{
                    padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
                  }}>
                    <div>
                      <strong style={{color: 'white'}}>📱 {user.phone}</strong>
                      <p style={{color: '#94a3b8', fontSize: '0.85rem', margin: '3px 0'}}>🚗 {user.vehicle_type} | {user.role}</p>
                    </div>
                    {user.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(user.id)} style={{background: '#dc2626', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'}}>🗑️</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== SECTION RÉPARATIONS ===== */}
        {activeTab === 'repairs' && (
          <section className="about-section">
            <div className="about-card">
              <h2>🔩 Gestion des Réparations ({repairs.length})</h2>
              <div style={{display: 'grid', gap: '10px', marginTop: '15px'}}>
                {repairs.map(repair => (
                  <div key={repair.id} style={{
                    padding: '15px', borderRadius: '10px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#0f172a'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
                      <div>
                        <strong style={{color: 'white'}}>{repair.garage_name}</strong>
                        <p style={{color: '#94a3b8', fontSize: '0.85rem', margin: '3px 0'}}>👤 {repair.user_phone} | 🚗 {repair.vehicle_info}</p>
                        <p style={{color: '#64748b', fontSize: '0.8rem'}}>🔧 {repair.problem_description}</p>
                        {repair.estimated_cost && <p style={{color: '#22c55e', fontSize: '0.85rem'}}>💰 Estimation: {repair.estimated_cost} DA</p>}
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                          background: repair.status === 'completed' ? '#22c55e' : repair.status === 'in_progress' ? '#3b82f6' : '#f59e0b',
                          color: 'white', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px'
                        }}>{repair.status}</span>
                        <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                          <button className="btn btn-secondary btn-compact" onClick={() => handleUpdateRepairStatus(repair.id, 'diagnosing', '🔍 Diagnostic en cours...')} style={{fontSize: '0.7rem'}}>🔍 Diagnostiquer</button>
                          <button className="btn btn-secondary btn-compact" onClick={() => handleUpdateRepairStatus(repair.id, 'in_progress', '🔧 Travaux en cours...')} style={{fontSize: '0.7rem'}}>🔧 Démarrer</button>
                          <button className="btn btn-secondary btn-compact" onClick={() => handleUpdateRepairStatus(repair.id, 'completed', '✅ Réparation terminée')} style={{fontSize: '0.7rem', background: '#16a34a'}}>✅ Terminer</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== SECTION RENDEZ-VOUS ===== */}
        {activeTab === 'appointments' && (
          <section className="about-section">
            <div className="about-card">
              <h2>📅 Rendez-vous ({appointments.length})</h2>
              <div style={{display: 'grid', gap: '10px', marginTop: '15px'}}>
                {appointments.map(appt => (
                  <div key={appt.id} style={{
                    padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
                  }}>
                    <div>
                      <strong style={{color: 'white'}}>{appt.garage_name}</strong>
                      <p style={{color: '#94a3b8', fontSize: '0.85rem', margin: '3px 0'}}>
                        👤 {appt.user_phone} | 🚗 {appt.vehicle_type} | 🗓️ {appt.appointment_date} à {appt.appointment_time}
                      </p>
                      <p style={{color: '#64748b', fontSize: '0.8rem'}}>🔧 {appt.service_required}</p>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px',
                      background: appt.status === 'confirmed' ? '#22c55e' : appt.status === 'cancelled' ? '#dc2626' : '#f59e0b',
                      color: 'white', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>{appt.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

// ✅ أنماط CSS متجاوبة للأدمن
const adminResponsiveStyles = `
  @media (max-width: 480px) {
    .admin-item-card {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .admin-item-card > div:first-child {
      min-width: auto !important;
      width: 100% !important;
    }
    .admin-item-card > div:last-child {
      justify-content: stretch !important;
      width: 100% !important;
    }
    .admin-item-card > div:last-child button {
      flex: 1 1 100% !important;
      width: 100% !important;
      padding: 12px !important;
      font-size: 0.9rem !important;
    }
  }
`

export default function App() {
  const [garages, setGarages] = useState([])
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    const cacheBuster = Date.now();

    fetch(`/api/garages?${cacheBuster}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setGarages(data.garages || [])
      })
      .catch(() => {})

    fetch(`/api/services?${cacheBuster}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || [])
      })
      .catch(() => {})

    fetch(`/api/public/stats?${cacheBuster}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
      })
      .catch(() => {
        setStats({})
      })
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomePage stats={stats} garages={garages} services={services} />} />
      <Route path="/services" element={<ServicesFinder />} />
      <Route path="/garages" element={<GarageFinder />} />
      <Route path="/diagnostic" element={<DiagnosticPage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/repairs" element={<RepairsPage />} />
      <Route path="/connexion" element={<ConnexionPage />} />
      <Route path="/inscription" element={<InscriptionPage />} />
      <Route path="/about" element={<AboutPage stats={stats} garages={garages} services={services} />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}