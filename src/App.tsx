import { NavLink, Route, Routes } from 'react-router-dom';

function ShellView({ title, description }: { title: string; description: string }) {
  return (
    <section className="view-card" aria-label={`${title} view`}>
      <h1>{title}</h1>
      <p>{description}</p>
      <p className="phase-note">Phase 1 shell is active. Feature wiring lands in subsequent phases.</p>
    </section>
  );
}

export function App() {
  return (
    <main className="app-shell">
      <header>
        <h1>International Camel Equivalents</h1>
        <p>React + TypeScript app shell</p>
      </header>
      <nav aria-label="Primary" className="route-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/reference">Reference</NavLink>
        <NavLink to="/customizer">Customizer</NavLink>
        <NavLink to="/formalizer">Formalizer</NavLink>
        <NavLink to="/share">Share</NavLink>
        <NavLink to="/archive">Archive</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<ShellView title="Home" description="Calculator and dashboard route scaffold." />} />
        <Route
          path="/reference"
          element={<ShellView title="Reference" description="Reference library route scaffold." />}
        />
        <Route
          path="/customizer"
          element={<ShellView title="Customizer" description="Bid customizer and proxy generator route scaffold." />}
        />
        <Route
          path="/formalizer"
          element={<ShellView title="Formalizer" description="Message formalizer route scaffold." />}
        />
        <Route path="/share" element={<ShellView title="Share" description="Share/export route scaffold." />} />
        <Route path="/archive" element={<ShellView title="Archive" description="Historical archive route scaffold." />} />
      </Routes>
    </main>
  );
}
