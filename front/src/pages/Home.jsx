import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleUserClick = () => {
    navigate('/user');
  };

  return (
    <>
      {/* Navigation - Outside app container */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon-wrapper">
            <img src="/ensight.png" alt="Ensight" className="logo-icon-img" />
          </div>
          <span className="logo-text">Ensight</span>
        </div>
      </nav>

      <div className="app">
        {/* Hero Section */}
        <main className="hero">
          {/* Glowing background effect */}
          <div className="glow-effect"></div>
          
          <h1 className="hero-title">Ensight Studio.</h1>
          <p className="hero-slogan">
            Discover smarter. Search deeper.
          </p>
          <p className="hero-highlight">
            <span className="highlight-text">Find what matters.</span>
          </p>

          {/* Role Buttons */}
          <div className="role-buttons">
            <button className="role-btn admin-btn" onClick={handleAdminClick}>
              Administrateur
            </button>
            <button className="role-btn user-btn" onClick={handleUserClick}>
              Utilisateur
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <span>Powered by Ensight</span>
        </footer>
      </div>
    </>
  );
}

export default Home;
