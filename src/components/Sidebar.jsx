function Sidebar({ items, activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">KW</div>
        <div>
          <strong>Kasir Warung</strong>
          <span>Pintar</span>
        </div>
      </div>

      <nav className="side-nav" aria-label="Navigasi utama">
        {items.map((item) => (
          <button
            key={item.id}
            className={activePage === item.id ? "active" : ""}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
