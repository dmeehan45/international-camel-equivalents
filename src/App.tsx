import { NavLink, Route, Routes } from 'react-router-dom';
import { HomeView } from './views/HomeView';
import { ReferenceView } from './views/ReferenceView';
import { CustomizerView } from './views/CustomizerView';
import { FormalizerView } from './views/FormalizerView';
import { ShareView } from './views/ShareView';
import { ArchiveView } from './views/ArchiveView';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/reference', label: 'Reference' },
  { to: '/customizer', label: 'Customizer' },
  { to: '/formalizer', label: 'Formalizer' },
  { to: '/share', label: 'Share' },
  { to: '/archive', label: 'Archive' },
];

export function App() {
  return (
    <main className="card" style={{ maxWidth: '62rem', margin: '2rem auto' }}>
      <h1>International Camel Equivalents</h1>
      <p>Quick calculator powered by the repository&apos;s core conversion engine.</p>
      <nav className="row" aria-label="Primary views">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/reference" element={<ReferenceView />} />
        <Route path="/customizer" element={<CustomizerView />} />
        <Route path="/formalizer" element={<FormalizerView />} />
        <Route path="/share" element={<ShareView />} />
        <Route path="/archive" element={<ArchiveView />} />
      </Routes>
    </main>
  );
}
