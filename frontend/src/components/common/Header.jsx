import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3a1 1 0 0 0-1 1v4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4h4a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-4V4a1 1 0 0 0-1-1H9z" />
            </svg>
          </span>
          Med<span className="brand-accent">Report</span>
        </NavLink>
        <nav className="topbar-nav">
          <NavLink to="/" end className="nav-link">
            Reports
          </NavLink>
          <NavLink to="/xray" className="nav-link">
            X-ray 3D
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
