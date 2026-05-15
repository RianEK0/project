const mobileItems = [
  { id: "cashier", label: "Kasir" },
  { id: "products", label: "Barang" },
  { id: "stock-in", label: "Stok" },
  { id: "history", label: "Riwayat" },
  { id: "reports", label: "Laporan" }
];

function MobileNav({ activePage, onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="Navigasi mobile">
      {mobileItems.map((item) => {
        const isActive = item.id === "stock-in" ? activePage === "stock-in" || activePage === "stock-out" : activePage === item.id;
        return (
          <button key={item.id} className={isActive ? "active" : ""} onClick={() => onNavigate(item.id)}>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default MobileNav;
