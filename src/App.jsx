import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import Cashier from "./components/Cashier.jsx";
import ProductList from "./components/ProductList.jsx";
import StockIn from "./components/StockIn.jsx";
import StockOut from "./components/StockOut.jsx";
import TransactionHistory from "./components/TransactionHistory.jsx";
import Reports from "./components/Reports.jsx";
import BackupData from "./components/BackupData.jsx";
import Receipt from "./components/Receipt.jsx";
import MobileNav from "./components/MobileNav.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { buildTransactionNumber, calculateCartProfit, calculateCartTotal, validateCartStock } from "./utils/calculations.js";
import { createDefaultData, createId } from "./utils/storage.js";
import { isSupabaseConfigured } from "./utils/supabaseClient.js";
import {
  completeCloudTransaction,
  deleteCloudProduct,
  fetchCloudData,
  replaceCloudData,
  resetCloudData,
  saveCloudProduct,
  saveCloudSettings,
  saveCloudStockMovement,
  subscribeCloudChanges
} from "./utils/cloudData.js";

const navItems = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Home" },
  { id: "cashier", label: "Kasir", shortLabel: "Kasir" },
  { id: "products", label: "Barang", shortLabel: "Barang" },
  { id: "stock-in", label: "Stok Masuk", shortLabel: "Stok" },
  { id: "stock-out", label: "Stok Keluar", shortLabel: "Keluar" },
  { id: "history", label: "Riwayat", shortLabel: "Riwayat" },
  { id: "reports", label: "Laporan", shortLabel: "Laporan" },
  { id: "backup", label: "Pengaturan", shortLabel: "Backup" }
];

function getErrorMessage(error) {
  const message = error?.message || String(error || "Terjadi kesalahan.");

  if (message.includes("products_barcode_key") || message.includes("duplicate key")) {
    return "Barcode sudah dipakai barang lain.";
  }

  if (message.includes("relation") && message.includes("does not exist")) {
    return "Tabel Supabase belum dibuat. Jalankan database/supabase.sql di SQL Editor Supabase.";
  }

  return message;
}

function CloudGate({ title, message, onRetry }) {
  return (
    <main className="cloud-gate">
      <section className="panel cloud-gate-panel">
        <div className="brand-block gate-brand">
          <div className="brand-mark">KW</div>
          <div>
            <strong>Kasir Warung</strong>
            <span>Pintar</span>
          </div>
        </div>
        <h1>{title}</h1>
        <p>{message}</p>
        <ol>
          <li>Buat project Supabase.</li>
          <li>Jalankan file SQL di database/supabase.sql melalui SQL Editor Supabase.</li>
          <li>Salin .env.example menjadi .env, lalu isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.</li>
          <li>Jalankan ulang npm run dev, atau deploy ke hosting HTTPS seperti Vercel/Netlify/Cloudflare Pages.</li>
        </ol>
        {onRetry && (
          <button className="primary-btn" onClick={onRetry}>
            Coba Muat Ulang
          </button>
        )}
      </section>
    </main>
  );
}

function App() {
  const [data, setData] = useState(() => createDefaultData());
  const [activePage, setActivePage] = useState("cashier");
  const [cart, setCart] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [productDraftBarcode, setProductDraftBarcode] = useState("");
  const [toast, setToast] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncState, setSyncState] = useState(() => ({
    status: isSupabaseConfigured ? "loading" : "missing-config",
    message: isSupabaseConfigured ? "Menghubungkan ke Supabase..." : "Supabase belum dikonfigurasi."
  }));
  const toastTimerRef = useRef(null);
  const realtimeTimerRef = useRef(null);

  const refreshCloudData = useCallback(async ({ silent = false, message = "Tersinkron dengan Supabase." } = {}) => {
    if (!isSupabaseConfigured) return null;

    if (!silent) {
      setSyncState({ status: "loading", message: "Mengambil data dari Supabase..." });
    }

    try {
      const remoteData = await fetchCloudData();
      setData(remoteData);
      setCloudReady(true);
      setSyncState({ status: "online", message });
      return remoteData;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setSyncState({ status: "error", message: errorMessage });
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let mounted = true;

    async function loadInitialData() {
      try {
        const remoteData = await fetchCloudData();
        if (!mounted) return;
        setData(remoteData);
        setCloudReady(true);
        setSyncState({ status: "online", message: "Data cloud siap." });
      } catch (error) {
        if (!mounted) return;
        setSyncState({ status: "error", message: getErrorMessage(error) });
      }
    }

    loadInitialData();

    const unsubscribe = subscribeCloudChanges(() => {
      window.clearTimeout(realtimeTimerRef.current);
      realtimeTimerRef.current = window.setTimeout(async () => {
        try {
          const remoteData = await fetchCloudData();
          if (!mounted) return;
          setData(remoteData);
          setCloudReady(true);
          setSyncState({ status: "online", message: "Update realtime diterima." });
        } catch (error) {
          if (!mounted) return;
          setSyncState({ status: "error", message: getErrorMessage(error) });
        }
      }, 450);
    });

    return () => {
      mounted = false;
      window.clearTimeout(realtimeTimerRef.current);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  function notify(message, type = "info") {
    setToast({ message, type });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  async function runCloudAction(action, successMessage) {
    setSyncState({ status: "saving", message: "Menyimpan ke Supabase..." });

    try {
      const result = await action();
      await refreshCloudData({ silent: true, message: "Data tersinkron." });
      notify(successMessage, "success");
      return result || true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setSyncState({ status: "error", message: errorMessage });
      notify(errorMessage, "danger");
      return false;
    }
  }

  function navigate(pageId) {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openProductFormWithBarcode(barcode = "") {
    setProductDraftBarcode(barcode);
    navigate("products");
  }

  function clearProductDraftBarcode() {
    setProductDraftBarcode("");
  }

  function addToCart(product, qty = 1) {
    const quantity = Number(qty || 1);
    if (!product || quantity <= 0) return false;

    const existingQty = cart.find((item) => item.productId === product.id)?.qty || 0;
    if (existingQty + quantity > Number(product.stock || 0)) {
      notify(`Stok ${product.name} tidak cukup.`, "danger");
      return false;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.productId === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + quantity } : item
        );
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          name: product.name,
          barcode: product.barcode,
          category: product.category,
          unit: product.unit,
          qty: quantity,
          costPrice: Number(product.costPrice || 0),
          sellPrice: Number(product.sellPrice || 0)
        }
      ];
    });

    notify(`${product.name} masuk keranjang.`, "success");
    return true;
  }

  function changeCartQty(productId, nextQty) {
    const product = data.products.find((item) => item.id === productId);
    const qty = Number(nextQty || 0);

    if (qty <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.productId !== productId));
      return;
    }

    if (product && qty > Number(product.stock || 0)) {
      notify(`Stok ${product.name} hanya ${product.stock}.`, "danger");
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) => (item.productId === productId ? { ...item, qty } : item))
    );
  }

  function removeCartItem(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.productId !== productId));
  }

  async function completePayment(paymentAmount) {
    const total = calculateCartTotal(cart);
    const payment = Number(paymentAmount || 0);
    const stockErrors = validateCartStock(cart, data.products);

    if (!cart.length) {
      notify("Keranjang masih kosong.", "danger");
      return false;
    }

    if (stockErrors.length) {
      notify(stockErrors[0], "danger");
      return false;
    }

    if (payment < total) {
      notify("Uang bayar masih kurang.", "danger");
      return false;
    }

    const transaction = {
      id: createId("trx"),
      number: buildTransactionNumber(data.transactions),
      date: new Date().toISOString(),
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        barcode: item.barcode,
        unit: item.unit,
        qty: Number(item.qty || 0),
        price: Number(item.sellPrice || 0),
        costPrice: Number(item.costPrice || 0),
        subtotal: Number(item.sellPrice || 0) * Number(item.qty || 0),
        profit: (Number(item.sellPrice || 0) - Number(item.costPrice || 0)) * Number(item.qty || 0)
      })),
      total,
      payment,
      change: payment - total,
      profit: calculateCartProfit(cart)
    };

    const result = await runCloudAction(() => completeCloudTransaction(transaction), "Pembayaran berhasil.");
    if (!result) return false;

    setCart([]);
    setReceipt(transaction);
    return true;
  }

  async function saveProduct(productInput) {
    const isEditing = Boolean(productInput.id);
    const normalizedBarcode = String(productInput.barcode || "").trim();
    const duplicateBarcode = normalizedBarcode
      ? data.products.find((product) => product.barcode === normalizedBarcode && product.id !== productInput.id)
      : null;

    if (duplicateBarcode) {
      notify(`Barcode sudah dipakai oleh ${duplicateBarcode.name}.`, "danger");
      return false;
    }

    const product = {
      ...productInput,
      id: productInput.id || createId("prd"),
      barcode: normalizedBarcode,
      stock: Number(productInput.stock || 0),
      costPrice: Number(productInput.costPrice || 0),
      sellPrice: Number(productInput.sellPrice || 0),
      minStock: Number(productInput.minStock || data.settings.lowStockThreshold || 10),
      unit: productInput.unit || "pcs",
      category: productInput.category || "Umum",
      updatedAt: new Date().toISOString()
    };

    const result = await runCloudAction(
      () => saveCloudProduct(product),
      isEditing ? "Barang diperbarui." : "Barang baru ditambahkan."
    );
    return Boolean(result);
  }

  async function deleteProduct(productId) {
    const inCart = cart.some((item) => item.productId === productId);
    if (inCart) {
      notify("Barang masih ada di keranjang.", "danger");
      return false;
    }

    const result = await runCloudAction(() => deleteCloudProduct(productId), "Barang dihapus.");
    return Boolean(result);
  }

  async function addStockMovement({ type, productId, qty, note, costPrice }) {
    const product = data.products.find((item) => item.id === productId);
    const quantity = Number(qty || 0);
    if (!product || quantity <= 0) {
      notify("Pilih barang dan isi jumlah yang benar.", "danger");
      return false;
    }

    if (type === "out" && quantity > Number(product.stock || 0)) {
      notify(`Stok ${product.name} hanya ${product.stock}.`, "danger");
      return false;
    }

    const movement = {
      id: createId(type === "in" ? "stin" : "stout"),
      type,
      productId,
      qty: quantity,
      note: note || "",
      costPrice: type === "in" && costPrice ? Number(costPrice) : Number(product.costPrice || 0)
    };

    const result = await runCloudAction(
      () => saveCloudStockMovement(movement),
      type === "in" ? "Stok masuk tersimpan." : "Stok keluar tersimpan."
    );
    return Boolean(result);
  }

  async function updateSettings(settings) {
    const result = await runCloudAction(
      () =>
        saveCloudSettings({
          ...settings,
          lowStockThreshold: Number(settings.lowStockThreshold || data.settings.lowStockThreshold || 10)
        }),
      "Pengaturan disimpan."
    );
    return Boolean(result);
  }

  async function replaceData(nextData) {
    const result = await runCloudAction(() => replaceCloudData(nextData), "Data berhasil diimpor.");
    if (result) {
      setCart([]);
      setReceipt(null);
    }
    return Boolean(result);
  }

  async function resetAllData() {
    const result = await runCloudAction(() => resetCloudData(), "Data berhasil direset.");
    if (result) {
      setCart([]);
      setReceipt(null);
    }
    return Boolean(result);
  }

  const activeTitle = useMemo(
    () => navItems.find((item) => item.id === activePage)?.label || "Kasir",
    [activePage]
  );

  const pageProps = {
    data,
    products: data.products,
    transactions: data.transactions,
    stockMovements: data.stockMovements,
    settings: data.settings,
    syncState,
    notify
  };

  if (!isSupabaseConfigured) {
    return (
      <CloudGate
        title="Supabase belum dikonfigurasi"
        message="Aplikasi ini sekarang memakai database cloud. Isi environment Supabase terlebih dahulu agar stok dan transaksi tersimpan online dan sinkron antar perangkat."
      />
    );
  }

  if (!cloudReady && syncState.status === "loading") {
    return (
      <CloudGate
        title="Menghubungkan ke database cloud"
        message="Aplikasi sedang mengambil data stok, transaksi, dan pengaturan dari Supabase."
      />
    );
  }

  if (!cloudReady && syncState.status === "error") {
    return (
      <CloudGate
        title="Database cloud belum siap"
        message={syncState.message}
        onRetry={() => refreshCloudData().catch(() => {})}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar items={navItems} activePage={activePage} onNavigate={navigate} />

      <main className="app-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Kasir Warung Pintar</span>
            <h1>{activeTitle}</h1>
          </div>
          <div className="topbar-actions">
            <span className={`sync-pill ${syncState.status}`}>{syncState.message}</span>
            <button className="ghost-btn desktop-hidden" onClick={() => navigate("dashboard")}>
              Dashboard
            </button>
            <button className="ghost-btn" onClick={() => navigate("backup")}>
              Backup
            </button>
          </div>
        </header>

        {activePage === "dashboard" && <Dashboard {...pageProps} onNavigate={navigate} />}
        {activePage === "cashier" && (
          <Cashier
            {...pageProps}
            cart={cart}
            onAddToCart={addToCart}
            onChangeQty={changeCartQty}
            onRemoveItem={removeCartItem}
            onCompletePayment={completePayment}
            onAddNewProduct={openProductFormWithBarcode}
          />
        )}
        {activePage === "products" && (
          <ProductList
            {...pageProps}
            draftBarcode={productDraftBarcode}
            onClearDraftBarcode={clearProductDraftBarcode}
            onSaveProduct={saveProduct}
            onDeleteProduct={deleteProduct}
          />
        )}
        {activePage === "stock-in" && (
          <StockIn
            {...pageProps}
            onNavigate={navigate}
            onSaveMovement={(payload) => addStockMovement({ ...payload, type: "in" })}
          />
        )}
        {activePage === "stock-out" && (
          <StockOut
            {...pageProps}
            onNavigate={navigate}
            onSaveMovement={(payload) => addStockMovement({ ...payload, type: "out" })}
          />
        )}
        {activePage === "history" && <TransactionHistory {...pageProps} storeName={data.settings.storeName} />}
        {activePage === "reports" && <Reports {...pageProps} />}
        {activePage === "backup" && (
          <BackupData
            data={data}
            settings={data.settings}
            onImportData={replaceData}
            onResetData={resetAllData}
            onUpdateSettings={updateSettings}
          />
        )}
      </main>

      <MobileNav activePage={activePage} onNavigate={navigate} />

      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.message}
        </div>
      )}

      {receipt && (
        <Receipt
          transaction={receipt}
          storeName={data.settings.storeName}
          onClose={() => {
            setReceipt(null);
            navigate("cashier");
          }}
        />
      )}
    </div>
  );
}

export default App;
