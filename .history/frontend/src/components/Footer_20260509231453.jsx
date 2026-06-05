import { Link } from 'react-router-dom';

const footerStyle = {
  backgroundColor: '#0a0a0f',
  color: '#94a3b8',
  padding: '50px 20px 20px',
  marginTop: '60px',
  borderTop: '1px solid rgba(255,255,255,0.06)'
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const cardStyle = {
  background: '#111118',
  padding: '24px 20px',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.06)',
  textAlign: 'center',
  transition: 'transform 0.2s ease, border-color 0.2s ease'
};

const titleStyle = {
  fontSize: '2rem',
  fontWeight: 800,
  color: '#E31837',
  margin: '0 0 8px'
};

const subtitleStyle = {
  fontSize: '0.9rem',
  color: '#94a3b8',
  fontWeight: 500,
  margin: 0,
  lineHeight: 1.5
};

const linkItemStyle = {
  marginBottom: '10px'
};

const linkStyle = {
  color: '#94a3b8',
  textDecoration: 'none',
  fontSize: '0.9rem',
  transition: 'color 0.2s ease'
};

const socialTagStyle = {
  display: 'inline-block',
  background: 'rgba(227,24,55,0.1)',
  color: '#94a3b8',
  padding: '6px 14px',
  borderRadius: '20px',
  border: '1px solid rgba(227,24,55,0.15)',
  fontSize: '0.82rem',
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'all 0.2s ease'
};

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        
        {/* القسم 1: logo + description */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '1.6rem', 
            fontWeight: 800, 
            color: '#E31837', 
            margin: '0 0 12px',
            background: 'linear-gradient(135deg, #E31837, #ff4d6a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            MechanicSmart
          </h3>
          <p style={{...subtitleStyle, fontSize: '0.82rem'}}>
            Plateforme innovante qui connecte les propriétaires de véhicules 
            aux meilleurs garages et services d'entretien automobile en Algérie.
          </p>
        </div>

        {/* القسم 2: liens rapides */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Liens</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={linkItemStyle}><Link to="/" onClick={() => window.scrollTo(0, 0)} style={linkStyle}>🏠 Accueil</Link></li>
            <li style={linkItemStyle}><Link to="/garages" onClick={() => window.scrollTo(0, 0)} style={linkStyle}>🏪 Garages</Link></li>
            <li style={linkItemStyle}><Link to="/services" onClick={() => window.scrollTo(0, 0)} style={linkStyle}>🔧 Services</Link></li>
            <li style={linkItemStyle}><Link to="/diagnostic" onClick={() => window.scrollTo(0, 0)} style={linkStyle}>🔍 Diagnostic</Link></li>
            <li style={linkItemStyle}><Link to="/about" onClick={() => window.scrollTo(0, 0)} style={linkStyle}>📖 À propos</Link></li>
          </ul>
        </div>

        {/* القسم 3: contact */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Contact</h4>
          <p style={{...subtitleStyle, fontSize: '0.82rem', marginBottom: '6px'}}>📧 ssc.info.electro@gmail.com</p>
          <p style={{...subtitleStyle, fontSize: '0.82rem', marginBottom: '6px'}}>📱 0552656275</p>
          <p style={{...subtitleStyle, fontSize: '0.82rem'}}>📍 Alger, Algérie</p>
        </div>

        {/* القسم 4: suivez-nous */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Suivez-nous</h4>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="https://www.linkedin.com/in/ssc-m-aa721734b" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={socialTagStyle}
            >
              LinkedIn
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=100088798015485" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={socialTagStyle}
            >
              Facebook
            </a>
            <a 
              href="https://www.tiktok.com/@sscmaintenenceinfoelectr" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={socialTagStyle}
            >
              TikTok
            </a>
          </div>
        </div>
      </div>

      {/* copyright */}
      <div style={{
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        © {new Date().getFullYear()} MechanicSmart. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;