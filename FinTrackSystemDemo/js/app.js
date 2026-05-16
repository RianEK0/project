(function () {
  "use strict";

  const STORAGE = {
    SESSION: "fintrack_session",
    CUSTOMERS: "fintrack_customers",
    TRANSACTIONS: "fintrack_transactions",
    APPROVALS: "fintrack_approvals",
    AUDIT_LOGS: "fintrack_audit_logs"
  };

  const USERS = [
    { username: "admin", password: "password", name: "Nadia Putri", role: "Super Admin" },
    { username: "finance", password: "password", name: "Rizky Finance", role: "Finance Staff" },
    { username: "manager", password: "password", name: "Dimas Manager", role: "Manager" },
    { username: "auditor", password: "password", name: "Sari Auditor", role: "Auditor" }
  ];

  const MENU_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "DB" },
    { id: "customers", label: "Customer", icon: "CU" },
    { id: "transactions", label: "Transaction", icon: "TR" },
    { id: "approval", label: "Approval", icon: "AP" },
    { id: "import", label: "ETL Import", icon: "ET" },
    { id: "reports", label: "Reports", icon: "RP" },
    { id: "audit", label: "Audit Log", icon: "AL" },
    { id: "api", label: "API Documentation", icon: "API" }
  ];

  const ROLE_ACCESS = {
    "Super Admin": ["dashboard", "customers", "transactions", "approval", "import", "reports", "audit", "api"],
    "Finance Staff": ["dashboard", "customers", "transactions", "import", "reports"],
    Manager: ["dashboard", "transactions", "approval", "reports", "audit"],
    Auditor: ["dashboard", "reports", "audit", "api"]
  };

  const TRANSACTION_TYPES = ["Transfer", "Deposit", "Withdrawal", "Payment", "Refund"];
  const TRANSACTION_STATUSES = ["Pending", "Success", "Failed", "Rejected"];
  const CUSTOMER_STATUSES = ["Active", "Inactive"];
  const TEMPLATE_CSV = "CustomerName,AccountNumber,TransactionType,Amount,TransactionDate,Description\nAndi Wijaya,100110012001,Transfer,2500000,2026-05-01,Transfer vendor bulanan\nSiti Rahma,100110012002,Deposit,5000000,2026-05-02,Setoran dana operasional\nBudi Santoso,100110012003,Payment,750000,2026-05-03,Pembayaran invoice layanan\n";

  const state = {
    currentUser: null,
    page: "dashboard",
    customerSearch: "",
    transactionSearch: "",
    transactionStatus: "All",
    transactionType: "All",
    auditSearch: "",
    reportFilters: {
      dateFrom: "",
      dateTo: "",
      status: "All",
      type: "All"
    },
    importResult: null
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    seedData();
    state.currentUser = readStorage(STORAGE.SESSION, null);
    render();
  }

  function seedData() {
    if (!localStorage.getItem(STORAGE.CUSTOMERS)) {
      writeStorage(STORAGE.CUSTOMERS, [
        {
          id: "cust-001",
          customerCode: "CUS-1001",
          fullName: "Andi Wijaya",
          accountNumber: "100110012001",
          email: "andi.wijaya@example.com",
          phoneNumber: "081234567801",
          address: "Jl. Sudirman No. 21, Jakarta",
          status: "Active",
          createdAt: "2026-04-18T09:15:00"
        },
        {
          id: "cust-002",
          customerCode: "CUS-1002",
          fullName: "Siti Rahma",
          accountNumber: "100110012002",
          email: "siti.rahma@example.com",
          phoneNumber: "081234567802",
          address: "Jl. Asia Afrika No. 12, Bandung",
          status: "Active",
          createdAt: "2026-04-18T10:20:00"
        },
        {
          id: "cust-003",
          customerCode: "CUS-1003",
          fullName: "Budi Santoso",
          accountNumber: "100110012003",
          email: "budi.santoso@example.com",
          phoneNumber: "081234567803",
          address: "Jl. Pemuda No. 44, Surabaya",
          status: "Active",
          createdAt: "2026-04-19T08:40:00"
        },
        {
          id: "cust-004",
          customerCode: "CUS-1004",
          fullName: "Maya Lestari",
          accountNumber: "100110012004",
          email: "maya.lestari@example.com",
          phoneNumber: "081234567804",
          address: "Jl. Diponegoro No. 8, Semarang",
          status: "Active",
          createdAt: "2026-04-20T13:30:00"
        },
        {
          id: "cust-005",
          customerCode: "CUS-1005",
          fullName: "Raka Prasetyo",
          accountNumber: "100110012005",
          email: "raka.prasetyo@example.com",
          phoneNumber: "081234567805",
          address: "Jl. Malioboro No. 17, Yogyakarta",
          status: "Inactive",
          createdAt: "2026-04-21T11:05:00"
        },
        {
          id: "cust-006",
          customerCode: "CUS-1006",
          fullName: "Dewi Kartika",
          accountNumber: "100110012006",
          email: "dewi.kartika@example.com",
          phoneNumber: "081234567806",
          address: "Jl. Gatot Subroto No. 30, Medan",
          status: "Active",
          createdAt: "2026-04-22T15:10:00"
        },
        {
          id: "cust-007",
          customerCode: "CUS-1007",
          fullName: "Fajar Nugroho",
          accountNumber: "100110012007",
          email: "fajar.nugroho@example.com",
          phoneNumber: "081234567807",
          address: "Jl. Pahlawan No. 51, Makassar",
          status: "Active",
          createdAt: "2026-04-23T09:50:00"
        },
        {
          id: "cust-008",
          customerCode: "CUS-1008",
          fullName: "Lina Permata",
          accountNumber: "100110012008",
          email: "lina.permata@example.com",
          phoneNumber: "081234567808",
          address: "Jl. Ahmad Yani No. 6, Denpasar",
          status: "Active",
          createdAt: "2026-04-24T14:22:00"
        },
        {
          id: "cust-009",
          customerCode: "CUS-1009",
          fullName: "Hendra Saputra",
          accountNumber: "100110012009",
          email: "hendra.saputra@example.com",
          phoneNumber: "081234567809",
          address: "Jl. Imam Bonjol No. 93, Palembang",
          status: "Inactive",
          createdAt: "2026-04-25T16:12:00"
        },
        {
          id: "cust-010",
          customerCode: "CUS-1010",
          fullName: "Nina Oktaviani",
          accountNumber: "100110012010",
          email: "nina.oktaviani@example.com",
          phoneNumber: "081234567810",
          address: "Jl. Veteran No. 27, Balikpapan",
          status: "Active",
          createdAt: "2026-04-26T10:35:00"
        }
      ]);
    }

    if (!localStorage.getItem(STORAGE.TRANSACTIONS)) {
      writeStorage(STORAGE.TRANSACTIONS, [
        seedTransaction("trx-001", "TRX-2026-0001", "cust-001", "Andi Wijaya", "Transfer", 2500000, "Success", "2026-05-01", "Transfer vendor bulanan", "finance", "manager", "2026-05-01T14:25:00", "2026-05-01T09:02:00"),
        seedTransaction("trx-002", "TRX-2026-0002", "cust-002", "Siti Rahma", "Deposit", 5000000, "Success", "2026-05-01", "Setoran dana operasional", "finance", "manager", "2026-05-01T15:10:00", "2026-05-01T10:12:00"),
        seedTransaction("trx-003", "TRX-2026-0003", "cust-003", "Budi Santoso", "Payment", 750000, "Pending", "2026-05-02", "Pembayaran invoice layanan", "finance", "", "", "2026-05-02T09:44:00"),
        seedTransaction("trx-004", "TRX-2026-0004", "cust-004", "Maya Lestari", "Withdrawal", 1500000, "Failed", "2026-05-02", "Penarikan tunai cabang", "finance", "", "", "2026-05-02T13:11:00"),
        seedTransaction("trx-005", "TRX-2026-0005", "cust-005", "Raka Prasetyo", "Refund", 320000, "Rejected", "2026-05-03", "Refund biaya layanan", "finance", "manager", "2026-05-03T16:02:00", "2026-05-03T11:18:00"),
        seedTransaction("trx-006", "TRX-2026-0006", "cust-006", "Dewi Kartika", "Transfer", 8800000, "Success", "2026-05-04", "Transfer antar rekening perusahaan", "admin", "admin", "2026-05-04T12:24:00", "2026-05-04T08:20:00"),
        seedTransaction("trx-007", "TRX-2026-0007", "cust-007", "Fajar Nugroho", "Payment", 2100000, "Pending", "2026-05-05", "Pembayaran subscription tahunan", "finance", "", "", "2026-05-05T09:40:00"),
        seedTransaction("trx-008", "TRX-2026-0008", "cust-008", "Lina Permata", "Deposit", 12500000, "Success", "2026-05-05", "Top up akun prioritas", "finance", "manager", "2026-05-05T13:04:00", "2026-05-05T10:50:00"),
        seedTransaction("trx-009", "TRX-2026-0009", "cust-009", "Hendra Saputra", "Withdrawal", 670000, "Failed", "2026-05-06", "Penarikan melebihi limit", "finance", "", "", "2026-05-06T15:12:00"),
        seedTransaction("trx-010", "TRX-2026-0010", "cust-010", "Nina Oktaviani", "Transfer", 4500000, "Success", "2026-05-06", "Transfer pembelian aset", "finance", "manager", "2026-05-06T16:33:00", "2026-05-06T12:03:00"),
        seedTransaction("trx-011", "TRX-2026-0011", "cust-001", "Andi Wijaya", "Payment", 930000, "Rejected", "2026-05-07", "Pembayaran invoice duplikat", "finance", "manager", "2026-05-07T11:58:00", "2026-05-07T09:26:00"),
        seedTransaction("trx-012", "TRX-2026-0012", "cust-002", "Siti Rahma", "Refund", 480000, "Pending", "2026-05-08", "Refund transaksi marketplace", "finance", "", "", "2026-05-08T08:37:00"),
        seedTransaction("trx-013", "TRX-2026-0013", "cust-003", "Budi Santoso", "Deposit", 7300000, "Success", "2026-05-08", "Deposit payroll klien", "admin", "admin", "2026-05-08T12:46:00", "2026-05-08T10:01:00"),
        seedTransaction("trx-014", "TRX-2026-0014", "cust-004", "Maya Lestari", "Transfer", 1840000, "Pending", "2026-05-09", "Transfer pemasok regional", "finance", "", "", "2026-05-09T09:20:00"),
        seedTransaction("trx-015", "TRX-2026-0015", "cust-005", "Raka Prasetyo", "Payment", 640000, "Success", "2026-05-09", "Pembayaran tagihan bulanan", "finance", "manager", "2026-05-09T15:02:00", "2026-05-09T11:46:00"),
        seedTransaction("trx-016", "TRX-2026-0016", "cust-006", "Dewi Kartika", "Withdrawal", 990000, "Pending", "2026-05-10", "Penarikan kas operasional", "finance", "", "", "2026-05-10T08:56:00"),
        seedTransaction("trx-017", "TRX-2026-0017", "cust-007", "Fajar Nugroho", "Transfer", 3100000, "Failed", "2026-05-10", "Transfer gagal validasi bank tujuan", "finance", "", "", "2026-05-10T13:29:00"),
        seedTransaction("trx-018", "TRX-2026-0018", "cust-008", "Lina Permata", "Refund", 540000, "Success", "2026-05-11", "Refund klaim transaksi", "admin", "manager", "2026-05-11T12:17:00", "2026-05-11T09:32:00"),
        seedTransaction("trx-019", "TRX-2026-0019", "cust-009", "Hendra Saputra", "Deposit", 4100000, "Pending", "2026-05-12", "Deposit pembukaan kembali akun", "finance", "", "", "2026-05-12T10:16:00"),
        seedTransaction("trx-020", "TRX-2026-0020", "cust-010", "Nina Oktaviani", "Payment", 1750000, "Success", "2026-05-13", "Pembayaran settlement merchant", "finance", "manager", "2026-05-13T14:02:00", "2026-05-13T09:14:00")
      ]);
    }

    if (!localStorage.getItem(STORAGE.APPROVALS)) {
      writeStorage(STORAGE.APPROVALS, [
        seedApproval("apr-001", "trx-001", "Approve", "Dokumen transaksi lengkap.", "manager", "2026-05-01T14:25:00"),
        seedApproval("apr-002", "trx-002", "Approve", "Nominal sesuai instruksi treasury.", "manager", "2026-05-01T15:10:00"),
        seedApproval("apr-003", "trx-005", "Reject", "Data refund belum sesuai bukti pendukung.", "manager", "2026-05-03T16:02:00"),
        seedApproval("apr-004", "trx-006", "Approve", "Disetujui oleh admin untuk kebutuhan prioritas.", "admin", "2026-05-04T12:24:00"),
        seedApproval("apr-005", "trx-011", "Reject", "Invoice terdeteksi duplikat.", "manager", "2026-05-07T11:58:00")
      ]);
    }

    if (!localStorage.getItem(STORAGE.AUDIT_LOGS)) {
      writeStorage(STORAGE.AUDIT_LOGS, []);
    }
  }

  function seedTransaction(id, transactionCode, customerId, customerName, transactionType, amount, status, transactionDate, description, createdBy, approvedBy, approvedAt, createdAt) {
    return {
      id,
      transactionCode,
      customerId,
      customerName,
      transactionType,
      amount,
      status,
      transactionDate,
      description,
      createdBy,
      approvedBy,
      approvedAt,
      createdAt
    };
  }

  function seedApproval(id, transactionId, action, note, approvedBy, createdAt) {
    return { id, transactionId, action, note, approvedBy, createdAt };
  }

  function render() {
    const session = readStorage(STORAGE.SESSION, null);
    state.currentUser = session;

    if (!session) {
      renderLogin();
      return;
    }

    if (!canAccess(state.page)) {
      state.page = accessibleMenus()[0].id;
    }

    renderShell();
  }

  function renderLogin(errorMessage) {
    const app = document.getElementById("app");
    app.innerHTML = `
      <main class="login-page">
        <section class="login-panel">
          <div class="login-brand">
            <div class="brand-mark">FT</div>
            <div class="brand-copy">
              <h1>FinTrack System</h1>
              <p>Financial Transaction Management System</p>
            </div>
          </div>

          <div class="login-card">
            <h2>Masuk</h2>
            <p class="muted">Gunakan akun demo sesuai role portfolio .NET Developer.</p>
            ${errorMessage ? `<div class="alert error">${escapeHtml(errorMessage)}</div>` : ""}
            <form id="loginForm" class="stack">
              <div class="form-field">
                <label for="username">Username</label>
                <input id="username" name="username" autocomplete="username" required>
              </div>
              <div class="form-field">
                <label for="password">Password</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required>
              </div>
              <button class="btn" type="submit">Masuk ke Dashboard</button>
            </form>

            <div class="demo-account-list">
              ${USERS.map((user) => `
                <div class="demo-account">
                  <strong>${escapeHtml(user.username)} / password</strong>
                  <span>${escapeHtml(user.role)}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </section>
        <section class="login-showcase">
          <div class="showcase-inner">
            <h2>FinTrack System</h2>
            <p>Dashboard demo untuk customer management, transaksi, approval, import CSV, laporan, audit log, dan dokumentasi API dalam satu aplikasi frontend offline.</p>
          </div>
        </section>
      </main>
    `;

    document.getElementById("loginForm").addEventListener("submit", handleLogin);
  }

  function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "").trim();
    const found = USERS.find((user) => user.username === username && user.password === password);

    if (!found) {
      renderLogin("Username atau password tidak valid.");
      return;
    }

    const session = {
      username: found.username,
      name: found.name,
      role: found.role,
      loginAt: nowIso()
    };

    writeStorage(STORAGE.SESSION, session);
    state.currentUser = session;
    state.page = "dashboard";
    logAudit("Login", "Authentication", `${found.name} login sebagai ${found.role}.`, session);
    render();
  }

  function renderShell() {
    const app = document.getElementById("app");
    const menus = accessibleMenus();
    const pageMeta = MENU_ITEMS.find((item) => item.id === state.page) || menus[0];

    app.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="brand-mark">FT</div>
            <div>
              <h1 class="sidebar-title">FinTrack System</h1>
              <p class="sidebar-subtitle">Finance Operations</p>
            </div>
          </div>
          <nav class="side-nav" aria-label="Menu utama">
            ${menus.map((item) => `
              <button class="nav-item ${item.id === state.page ? "active" : ""}" data-page="${item.id}" type="button">
                <span class="nav-icon">${escapeHtml(item.icon)}</span>
                <span>${escapeHtml(item.label)}</span>
              </button>
            `).join("")}
          </nav>
          <div class="sidebar-footer">
            <div class="session-card">
              <strong>${escapeHtml(state.currentUser.name)}</strong>
              <span>${escapeHtml(state.currentUser.role)}</span>
            </div>
          </div>
        </aside>

        <main class="main">
          <header class="topbar">
            <div>
              <h2>${escapeHtml(pageMeta.label)}</h2>
              <p>${escapeHtml(topbarSubtitle(state.page))}</p>
            </div>
            <div class="topbar-actions">
              <div class="user-pill">
                <div class="avatar">${escapeHtml(initials(state.currentUser.name))}</div>
                <div class="user-meta">
                  <strong>${escapeHtml(state.currentUser.name)}</strong>
                  <span>${escapeHtml(state.currentUser.role)}</span>
                </div>
              </div>
              <button class="btn secondary" id="logoutBtn" type="button">Logout</button>
            </div>
          </header>
          <section class="content" id="view"></section>
        </main>
      </div>
    `;

    document.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        state.page = button.dataset.page;
        state.importResult = null;
        render();
      });
    });

    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
    renderPage();
  }

  function handleLogout() {
    logAudit("Logout", "Authentication", `${state.currentUser.name} logout dari sistem.`);
    localStorage.removeItem(STORAGE.SESSION);
    state.currentUser = null;
    state.page = "dashboard";
    render();
  }

  function renderPage() {
    const view = document.getElementById("view");
    if (!view) return;

    if (!canAccess(state.page)) {
      state.page = accessibleMenus()[0].id;
    }

    if (state.page === "dashboard") renderDashboard(view);
    if (state.page === "customers") renderCustomers(view);
    if (state.page === "transactions") renderTransactions(view);
    if (state.page === "approval") renderApproval(view);
    if (state.page === "import") renderImport(view);
    if (state.page === "reports") renderReports(view);
    if (state.page === "audit") renderAuditLog(view);
    if (state.page === "api") renderApiDocs(view);
  }

  function renderDashboard(view) {
    const transactions = getTransactions();
    const customers = getCustomers();
    const total = transactions.length;
    const success = transactions.filter((trx) => trx.status === "Success").length;
    const pending = transactions.filter((trx) => trx.status === "Pending").length;
    const failed = transactions.filter((trx) => trx.status === "Failed").length;
    const activeCustomers = customers.filter((customer) => customer.status === "Active").length;
    const latest = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

    view.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan transaksi dan customer aktif untuk operasional finansial.</p>
        </div>
      </div>

      <div class="grid stats-grid">
        ${statCard("Total Transaksi", total, "Semua transaksi tersimpan")}
        ${statCard("Berhasil", success, "Status Success")}
        ${statCard("Pending", pending, "Menunggu approval")}
        ${statCard("Gagal", failed, "Status Failed")}
        ${statCard("Customer Aktif", activeCustomers, "Dari total customer")}
      </div>

      <div class="grid two-column" style="margin-top: 18px;">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h3>Transaksi Terbaru</h3>
              <p>Data terbaru berdasarkan waktu dibuat.</p>
            </div>
          </div>
          ${transactionTable(latest, { compact: true })}
        </div>

        <div class="panel">
          <div class="panel-header">
            <div>
              <h3>Ringkasan Status</h3>
              <p>Distribusi transaksi berdasarkan status.</p>
            </div>
          </div>
          <div class="panel-body">
            ${statusSummary(transactions)}
          </div>
        </div>
      </div>
    `;
  }

  function renderCustomers(view) {
    const customers = filterCustomers();

    view.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Customer Management</h1>
          <p>Kelola data customer, rekening, kontak, status, dan detail profil.</p>
        </div>
        <button class="btn" data-customer-action="add" type="button">+ Tambah Customer</button>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h3>Daftar Customer</h3>
            <p>${customers.length} data ditampilkan.</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="toolbar">
            <div class="filters">
              <input class="input-sm" id="customerSearch" placeholder="Cari customer..." value="${escapeAttr(state.customerSearch)}">
            </div>
          </div>
          ${customerTable(customers)}
        </div>
      </div>
    `;

    view.querySelector("[data-customer-action='add']").addEventListener("click", () => openCustomerModal("add"));
    view.querySelector("#customerSearch").addEventListener("input", (event) => {
      state.customerSearch = event.target.value;
      renderPage();
      focusField("customerSearch");
    });
    bindCustomerTableActions(view);
  }

  function customerTable(customers) {
    if (!customers.length) {
      return `<div class="empty-state">Tidak ada customer yang cocok.</div>`;
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th>No. Rekening</th>
              <th>Email</th>
              <th>Telepon</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map((customer) => `
              <tr>
                <td><strong>${escapeHtml(customer.customerCode)}</strong></td>
                <td>${escapeHtml(customer.fullName)}</td>
                <td>${escapeHtml(customer.accountNumber)}</td>
                <td>${escapeHtml(customer.email)}</td>
                <td>${escapeHtml(customer.phoneNumber)}</td>
                <td>${statusBadge(customer.status)}</td>
                <td>${formatDate(customer.createdAt)}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn secondary icon-only" title="Detail" data-customer-action="detail" data-id="${escapeAttr(customer.id)}" type="button">i</button>
                    <button class="btn ghost icon-only" title="Edit" data-customer-action="edit" data-id="${escapeAttr(customer.id)}" type="button">E</button>
                    <button class="btn danger icon-only" title="Hapus" data-customer-action="delete" data-id="${escapeAttr(customer.id)}" type="button">X</button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function bindCustomerTableActions(view) {
    view.querySelectorAll("[data-customer-action]").forEach((button) => {
      const action = button.dataset.customerAction;
      if (action === "add") return;
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        if (action === "detail") openCustomerModal("detail", id);
        if (action === "edit") openCustomerModal("edit", id);
        if (action === "delete") deleteCustomer(id);
      });
    });
  }

  function openCustomerModal(mode, id) {
    const customers = getCustomers();
    const customer = customers.find((item) => item.id === id);

    if (mode === "detail" && customer) {
      showModal({
        title: "Detail Customer",
        size: "",
        body: `
          <div class="detail-grid">
            ${detailItem("ID", customer.id)}
            ${detailItem("Kode Customer", customer.customerCode)}
            ${detailItem("Nama Lengkap", customer.fullName)}
            ${detailItem("No. Rekening", customer.accountNumber)}
            ${detailItem("Email", customer.email)}
            ${detailItem("Telepon", customer.phoneNumber)}
            ${detailItem("Alamat", customer.address)}
            ${detailItem("Status", customer.status)}
            ${detailItem("Dibuat", formatDate(customer.createdAt))}
          </div>
        `,
        footer: `<button class="btn secondary" data-close-modal type="button">Tutup</button>`
      });
      return;
    }

    const isEdit = mode === "edit";
    const data = customer || {
      customerCode: nextCustomerCode(),
      fullName: "",
      accountNumber: "",
      email: "",
      phoneNumber: "",
      address: "",
      status: "Active"
    };

    showModal({
      title: isEdit ? "Edit Customer" : "Tambah Customer",
      body: `
        <form id="customerForm" class="form-grid">
          <div class="form-field">
            <label for="customerCode">Kode Customer</label>
            <input id="customerCode" name="customerCode" value="${escapeAttr(data.customerCode)}" required>
          </div>
          <div class="form-field">
            <label for="status">Status</label>
            <select id="status" name="status">
              ${CUSTOMER_STATUSES.map((status) => `<option value="${status}" ${data.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
          </div>
          <div class="form-field">
            <label for="fullName">Nama Lengkap</label>
            <input id="fullName" name="fullName" value="${escapeAttr(data.fullName)}" required>
          </div>
          <div class="form-field">
            <label for="accountNumber">No. Rekening</label>
            <input id="accountNumber" name="accountNumber" value="${escapeAttr(data.accountNumber)}" required>
          </div>
          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" value="${escapeAttr(data.email)}" required>
          </div>
          <div class="form-field">
            <label for="phoneNumber">Telepon</label>
            <input id="phoneNumber" name="phoneNumber" value="${escapeAttr(data.phoneNumber)}" required>
          </div>
          <div class="form-field full">
            <label for="address">Alamat</label>
            <textarea id="address" name="address" required>${escapeHtml(data.address)}</textarea>
          </div>
        </form>
      `,
      footer: `
        <button class="btn secondary" data-close-modal type="button">Batal</button>
        <button class="btn" form="customerForm" type="submit">${isEdit ? "Simpan Perubahan" : "Tambah Customer"}</button>
      `
    });

    document.getElementById("customerForm").addEventListener("submit", (event) => {
      event.preventDefault();
      saveCustomerForm(isEdit ? customer.id : null, new FormData(event.currentTarget));
    });
  }

  function saveCustomerForm(id, form) {
    const customers = getCustomers();
    const data = {
      customerCode: clean(form.get("customerCode")),
      fullName: clean(form.get("fullName")),
      accountNumber: clean(form.get("accountNumber")),
      email: clean(form.get("email")),
      phoneNumber: clean(form.get("phoneNumber")),
      address: clean(form.get("address")),
      status: clean(form.get("status"))
    };

    if (!data.customerCode || !data.fullName || !data.accountNumber || !data.email) {
      alert("Kode customer, nama, rekening, dan email wajib diisi.");
      return;
    }

    const duplicate = customers.find((customer) => customer.accountNumber === data.accountNumber && customer.id !== id);
    if (duplicate) {
      alert("Nomor rekening sudah digunakan customer lain.");
      return;
    }

    if (id) {
      const index = customers.findIndex((customer) => customer.id === id);
      if (index < 0) return;
      customers[index] = { ...customers[index], ...data };
      writeStorage(STORAGE.CUSTOMERS, customers);
      syncTransactionCustomerName(id, data.fullName);
      logAudit("Edit customer", "Customer", `Mengubah data customer ${data.fullName}.`);
    } else {
      const newCustomer = {
        id: uid("cust"),
        ...data,
        createdAt: nowIso()
      };
      customers.push(newCustomer);
      writeStorage(STORAGE.CUSTOMERS, customers);
      logAudit("Tambah customer", "Customer", `Menambahkan customer ${data.fullName}.`);
    }

    closeModal();
    renderPage();
  }

  function deleteCustomer(id) {
    const customers = getCustomers();
    const customer = customers.find((item) => item.id === id);
    if (!customer) return;
    if (!confirm(`Hapus customer ${customer.fullName}?`)) return;

    writeStorage(STORAGE.CUSTOMERS, customers.filter((item) => item.id !== id));
    logAudit("Hapus customer", "Customer", `Menghapus customer ${customer.fullName}.`);
    renderPage();
  }

  function renderTransactions(view) {
    const transactions = filterTransactions();

    view.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Transaction Management</h1>
          <p>Kelola transaksi transfer, deposit, withdrawal, payment, dan refund.</p>
        </div>
        <button class="btn" data-transaction-action="add" type="button">+ Tambah Transaksi</button>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h3>Daftar Transaksi</h3>
            <p>${transactions.length} data ditampilkan.</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="toolbar">
            <div class="filters">
              <input class="input-sm" id="transactionSearch" placeholder="Cari transaksi..." value="${escapeAttr(state.transactionSearch)}">
              <select class="select-sm" id="transactionStatus">
                <option value="All">Semua Status</option>
                ${TRANSACTION_STATUSES.map((status) => `<option value="${status}" ${state.transactionStatus === status ? "selected" : ""}>${status}</option>`).join("")}
              </select>
              <select class="select-sm" id="transactionType">
                <option value="All">Semua Jenis</option>
                ${TRANSACTION_TYPES.map((type) => `<option value="${type}" ${state.transactionType === type ? "selected" : ""}>${type}</option>`).join("")}
              </select>
            </div>
          </div>
          ${transactionTable(transactions, { actions: true })}
        </div>
      </div>
    `;

    view.querySelector("[data-transaction-action='add']").addEventListener("click", () => openTransactionModal("add"));
    view.querySelector("#transactionSearch").addEventListener("input", (event) => {
      state.transactionSearch = event.target.value;
      renderPage();
      focusField("transactionSearch");
    });
    view.querySelector("#transactionStatus").addEventListener("change", (event) => {
      state.transactionStatus = event.target.value;
      renderPage();
    });
    view.querySelector("#transactionType").addEventListener("change", (event) => {
      state.transactionType = event.target.value;
      renderPage();
    });
    bindTransactionTableActions(view);
  }

  function transactionTable(transactions, options) {
    const settings = { actions: false, compact: false, ...options };

    if (!transactions.length) {
      return `<div class="empty-state">Tidak ada transaksi yang cocok.</div>`;
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Customer</th>
              <th>Jenis</th>
              <th>Nominal</th>
              <th>Status</th>
              <th>Tanggal</th>
              ${settings.compact ? "" : "<th>Dibuat Oleh</th>"}
              ${settings.actions ? "<th>Aksi</th>" : ""}
            </tr>
          </thead>
          <tbody>
            ${transactions.map((transaction) => `
              <tr>
                <td><strong>${escapeHtml(transaction.transactionCode)}</strong></td>
                <td>${escapeHtml(transaction.customerName)}</td>
                <td>${escapeHtml(transaction.transactionType)}</td>
                <td>${formatCurrency(transaction.amount)}</td>
                <td>${statusBadge(transaction.status)}</td>
                <td>${formatDate(transaction.transactionDate, "date")}</td>
                ${settings.compact ? "" : `<td>${escapeHtml(transaction.createdBy || "-")}</td>`}
                ${settings.actions ? `
                  <td>
                    <div class="table-actions">
                      <button class="btn secondary icon-only" title="Detail" data-transaction-action="detail" data-id="${escapeAttr(transaction.id)}" type="button">i</button>
                      <button class="btn ghost icon-only" title="Edit" data-transaction-action="edit" data-id="${escapeAttr(transaction.id)}" type="button">E</button>
                      <button class="btn danger icon-only" title="Hapus" data-transaction-action="delete" data-id="${escapeAttr(transaction.id)}" type="button">X</button>
                    </div>
                  </td>
                ` : ""}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function bindTransactionTableActions(view) {
    view.querySelectorAll("[data-transaction-action]").forEach((button) => {
      const action = button.dataset.transactionAction;
      if (action === "add") return;
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        if (action === "detail") openTransactionModal("detail", id);
        if (action === "edit") openTransactionModal("edit", id);
        if (action === "delete") deleteTransaction(id);
      });
    });
  }

  function openTransactionModal(mode, id) {
    const transactions = getTransactions();
    const customers = getCustomers();
    const transaction = transactions.find((item) => item.id === id);

    if (mode === "detail" && transaction) {
      showModal({
        title: "Detail Transaksi",
        body: `
          <div class="detail-grid">
            ${detailItem("ID", transaction.id)}
            ${detailItem("Kode Transaksi", transaction.transactionCode)}
            ${detailItem("Customer", transaction.customerName)}
            ${detailItem("Jenis", transaction.transactionType)}
            ${detailItem("Nominal", formatCurrency(transaction.amount))}
            ${detailItem("Status", transaction.status)}
            ${detailItem("Tanggal Transaksi", formatDate(transaction.transactionDate, "date"))}
            ${detailItem("Deskripsi", transaction.description)}
            ${detailItem("Dibuat Oleh", transaction.createdBy || "-")}
            ${detailItem("Disetujui Oleh", transaction.approvedBy || "-")}
            ${detailItem("Waktu Approval", transaction.approvedAt ? formatDate(transaction.approvedAt) : "-")}
            ${detailItem("Dibuat", formatDate(transaction.createdAt))}
          </div>
        `,
        footer: `<button class="btn secondary" data-close-modal type="button">Tutup</button>`
      });
      return;
    }

    if (!customers.length) {
      alert("Tambahkan customer terlebih dahulu sebelum membuat transaksi.");
      return;
    }

    const isEdit = mode === "edit";
    const data = transaction || {
      transactionCode: nextTransactionCode(),
      customerId: customers[0].id,
      transactionType: "Transfer",
      amount: "",
      status: "Pending",
      transactionDate: todayDate(),
      description: ""
    };

    showModal({
      title: isEdit ? "Edit Transaksi" : "Tambah Transaksi",
      body: `
        <form id="transactionForm" class="form-grid">
          <div class="form-field">
            <label for="transactionCode">Kode Transaksi</label>
            <input id="transactionCode" name="transactionCode" value="${escapeAttr(data.transactionCode)}" required>
          </div>
          <div class="form-field">
            <label for="customerId">Customer</label>
            <select id="customerId" name="customerId" required>
              ${customers.map((customer) => `<option value="${escapeAttr(customer.id)}" ${data.customerId === customer.id ? "selected" : ""}>${escapeHtml(customer.fullName)} - ${escapeHtml(customer.accountNumber)}</option>`).join("")}
            </select>
          </div>
          <div class="form-field">
            <label for="transactionType">Jenis Transaksi</label>
            <select id="transactionType" name="transactionType">
              ${TRANSACTION_TYPES.map((type) => `<option value="${type}" ${data.transactionType === type ? "selected" : ""}>${type}</option>`).join("")}
            </select>
          </div>
          <div class="form-field">
            <label for="amount">Nominal</label>
            <input id="amount" name="amount" type="number" min="1" step="1" value="${escapeAttr(data.amount)}" required>
          </div>
          <div class="form-field">
            <label for="status">Status</label>
            <select id="status" name="status">
              ${TRANSACTION_STATUSES.map((status) => `<option value="${status}" ${data.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
          </div>
          <div class="form-field">
            <label for="transactionDate">Tanggal Transaksi</label>
            <input id="transactionDate" name="transactionDate" type="date" value="${escapeAttr(data.transactionDate)}" required>
          </div>
          <div class="form-field full">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" required>${escapeHtml(data.description)}</textarea>
          </div>
        </form>
      `,
      footer: `
        <button class="btn secondary" data-close-modal type="button">Batal</button>
        <button class="btn" form="transactionForm" type="submit">${isEdit ? "Simpan Perubahan" : "Tambah Transaksi"}</button>
      `
    });

    document.getElementById("transactionForm").addEventListener("submit", (event) => {
      event.preventDefault();
      saveTransactionForm(isEdit ? transaction.id : null, new FormData(event.currentTarget));
    });
  }

  function saveTransactionForm(id, form) {
    const transactions = getTransactions();
    const customers = getCustomers();
    const selectedCustomer = customers.find((customer) => customer.id === clean(form.get("customerId")));
    const amount = Number(form.get("amount"));
    const status = clean(form.get("status"));

    if (!selectedCustomer || !amount || amount <= 0) {
      alert("Customer dan nominal transaksi wajib valid.");
      return;
    }

    const payload = {
      transactionCode: clean(form.get("transactionCode")),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.fullName,
      transactionType: clean(form.get("transactionType")),
      amount,
      status,
      transactionDate: clean(form.get("transactionDate")),
      description: clean(form.get("description"))
    };

    if (!payload.transactionCode || !payload.transactionDate || !payload.description) {
      alert("Kode transaksi, tanggal, dan deskripsi wajib diisi.");
      return;
    }

    const duplicate = transactions.find((transaction) => transaction.transactionCode === payload.transactionCode && transaction.id !== id);
    if (duplicate) {
      alert("Kode transaksi sudah digunakan.");
      return;
    }

    if (id) {
      const index = transactions.findIndex((transaction) => transaction.id === id);
      if (index < 0) return;
      const previous = transactions[index];
      let approvedBy = previous.approvedBy || "";
      let approvedAt = previous.approvedAt || "";
      if (status !== previous.status && ["Success", "Rejected"].includes(status)) {
        approvedBy = state.currentUser.username;
        approvedAt = nowIso();
      }
      if (["Pending", "Failed"].includes(status)) {
        approvedBy = "";
        approvedAt = "";
      }
      transactions[index] = { ...previous, ...payload, approvedBy, approvedAt };
      writeStorage(STORAGE.TRANSACTIONS, transactions);
      logAudit("Edit transaksi", "Transaction", `Mengubah transaksi ${payload.transactionCode}.`);
    } else {
      const approved = ["Success", "Rejected"].includes(status);
      const newTransaction = {
        id: uid("trx"),
        ...payload,
        createdBy: state.currentUser.username,
        approvedBy: approved ? state.currentUser.username : "",
        approvedAt: approved ? nowIso() : "",
        createdAt: nowIso()
      };
      transactions.push(newTransaction);
      writeStorage(STORAGE.TRANSACTIONS, transactions);
      logAudit("Tambah transaksi", "Transaction", `Menambahkan transaksi ${payload.transactionCode}.`);
    }

    closeModal();
    renderPage();
  }

  function deleteTransaction(id) {
    const transactions = getTransactions();
    const transaction = transactions.find((item) => item.id === id);
    if (!transaction) return;
    if (!confirm(`Hapus transaksi ${transaction.transactionCode}?`)) return;

    writeStorage(STORAGE.TRANSACTIONS, transactions.filter((item) => item.id !== id));
    writeStorage(STORAGE.APPROVALS, getApprovals().filter((approval) => approval.transactionId !== id));
    logAudit("Hapus transaksi", "Transaction", `Menghapus transaksi ${transaction.transactionCode}.`);
    renderPage();
  }

  function renderApproval(view) {
    const pendingTransactions = getTransactions().filter((transaction) => transaction.status === "Pending");
    const approvals = [...getApprovals()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    view.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Approval Transaction</h1>
          <p>Manager dan Super Admin dapat approve atau reject transaksi pending.</p>
        </div>
      </div>

      <div class="grid two-column">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h3>Menunggu Approval</h3>
              <p>${pendingTransactions.length} transaksi pending.</p>
            </div>
          </div>
          ${approvalTable(pendingTransactions)}
        </div>

        <div class="panel">
          <div class="panel-header">
            <div>
              <h3>Riwayat Approval</h3>
              <p>Catatan approve dan reject terbaru.</p>
            </div>
          </div>
          <div class="panel-body">
            ${approvalHistory(approvals)}
          </div>
        </div>
      </div>
    `;

    view.querySelectorAll("[data-approval-action]").forEach((button) => {
      button.addEventListener("click", () => openApprovalModal(button.dataset.approvalAction, button.dataset.id));
    });
  }

  function approvalTable(transactions) {
    if (!transactions.length) {
      return `<div class="empty-state">Tidak ada transaksi pending.</div>`;
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Customer</th>
              <th>Jenis</th>
              <th>Nominal</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map((transaction) => `
              <tr>
                <td><strong>${escapeHtml(transaction.transactionCode)}</strong></td>
                <td>${escapeHtml(transaction.customerName)}</td>
                <td>${escapeHtml(transaction.transactionType)}</td>
                <td>${formatCurrency(transaction.amount)}</td>
                <td>${formatDate(transaction.transactionDate, "date")}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn success" data-approval-action="Approve" data-id="${escapeAttr(transaction.id)}" type="button">Approve</button>
                    <button class="btn danger" data-approval-action="Reject" data-id="${escapeAttr(transaction.id)}" type="button">Reject</button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function openApprovalModal(action, transactionId) {
    const transaction = getTransactions().find((item) => item.id === transactionId);
    if (!transaction) return;

    showModal({
      title: `${action} Transaksi`,
      size: "small",
      body: `
        <form id="approvalForm" class="stack">
          <div class="alert">
            <strong>${escapeHtml(transaction.transactionCode)}</strong><br>
            ${escapeHtml(transaction.customerName)} - ${formatCurrency(transaction.amount)}
          </div>
          <div class="form-field">
            <label for="note">Catatan Approval</label>
            <textarea id="note" name="note" required>${action === "Approve" ? "Transaksi valid dan disetujui." : "Transaksi ditolak karena data belum sesuai."}</textarea>
          </div>
        </form>
      `,
      footer: `
        <button class="btn secondary" data-close-modal type="button">Batal</button>
        <button class="btn ${action === "Approve" ? "success" : "danger"}" form="approvalForm" type="submit">${action}</button>
      `
    });

    document.getElementById("approvalForm").addEventListener("submit", (event) => {
      event.preventDefault();
      processApproval(action, transactionId, clean(new FormData(event.currentTarget).get("note")));
    });
  }

  function processApproval(action, transactionId, note) {
    if (!["Super Admin", "Manager"].includes(state.currentUser.role)) {
      alert("Role Anda tidak memiliki akses approval.");
      return;
    }

    const transactions = getTransactions();
    const index = transactions.findIndex((transaction) => transaction.id === transactionId);
    if (index < 0) return;

    transactions[index] = {
      ...transactions[index],
      status: action === "Approve" ? "Success" : "Rejected",
      approvedBy: state.currentUser.username,
      approvedAt: nowIso()
    };

    const approvals = getApprovals();
    approvals.push({
      id: uid("apr"),
      transactionId,
      action,
      note,
      approvedBy: state.currentUser.username,
      createdAt: nowIso()
    });

    writeStorage(STORAGE.TRANSACTIONS, transactions);
    writeStorage(STORAGE.APPROVALS, approvals);
    logAudit(action === "Approve" ? "Approve transaksi" : "Reject transaksi", "Approval", `${action} transaksi ${transactions[index].transactionCode}.`);
    closeModal();
    renderPage();
  }

  function approvalHistory(approvals) {
    if (!approvals.length) {
      return `<div class="empty-state">Belum ada riwayat approval.</div>`;
    }

    const transactions = getTransactions();
    return `
      <div class="summary-list">
        ${approvals.slice(0, 12).map((approval) => {
          const transaction = transactions.find((item) => item.id === approval.transactionId);
          return `
            <div class="detail-item">
              <span>${formatDate(approval.createdAt)} - ${escapeHtml(approval.approvedBy)}</span>
              <strong>${escapeHtml(approval.action)} ${escapeHtml(transaction ? transaction.transactionCode : approval.transactionId)}</strong>
              <p class="muted" style="margin: 6px 0 0;">${escapeHtml(approval.note)}</p>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderImport(view) {
    const result = state.importResult;

    view.innerHTML = `
      <div class="page-header">
        <div>
          <h1>ETL Import CSV</h1>
          <p>Import transaksi dari file CSV dengan validasi data sebelum masuk LocalStorage.</p>
        </div>
        <button class="btn secondary" id="downloadTemplateBtn" type="button">Download Template CSV</button>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h3>Upload File Transaksi</h3>
            <p>Format: CustomerName, AccountNumber, TransactionType, Amount, TransactionDate, Description.</p>
          </div>
        </div>
        <div class="panel-body stack">
          <div class="drop-zone">
            <strong>Pilih file CSV transaksi</strong>
            <input id="csvFile" type="file" accept=".csv,text/csv">
            <button class="btn" id="processCsvBtn" type="button">Import CSV</button>
          </div>
          ${result ? importResultHtml(result) : ""}
        </div>
      </div>
    `;

    view.querySelector("#downloadTemplateBtn").addEventListener("click", () => {
      downloadCsv("template-transactions.csv", TEMPLATE_CSV);
    });

    view.querySelector("#processCsvBtn").addEventListener("click", () => {
      const file = view.querySelector("#csvFile").files[0];
      if (!file) {
        state.importResult = { total: 0, success: 0, failed: 1, errors: ["File CSV belum dipilih."] };
        renderPage();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => importTransactionsFromCsv(String(reader.result || ""));
      reader.onerror = () => {
        state.importResult = { total: 0, success: 0, failed: 1, errors: ["File tidak dapat dibaca."] };
        renderPage();
      };
      reader.readAsText(file);
    });
  }

  function importTransactionsFromCsv(text) {
    const expectedHeaders = ["CustomerName", "AccountNumber", "TransactionType", "Amount", "TransactionDate", "Description"];
    const rows = parseCsv(text);

    if (rows.length < 2) {
      state.importResult = { total: 0, success: 0, failed: 1, errors: ["CSV kosong atau tidak memiliki data transaksi."] };
      logAudit("Import CSV", "ETL", "Import CSV gagal: file kosong atau tidak memiliki data transaksi.");
      renderPage();
      return;
    }

    const headers = rows[0].map((item) => item.replace(/^\uFEFF/, "").trim());
    const headerValid = expectedHeaders.every((header, index) => headers[index] === header);
    if (!headerValid) {
      state.importResult = { total: rows.length - 1, success: 0, failed: rows.length - 1, errors: ["Header CSV tidak sesuai template."] };
      logAudit("Import CSV", "ETL", "Import CSV gagal: header CSV tidak sesuai template.");
      renderPage();
      return;
    }

    const customers = getCustomers();
    const transactions = getTransactions();
    const errors = [];
    const imported = [];

    rows.slice(1).forEach((row, rowIndex) => {
      const line = rowIndex + 2;
      const [customerName, accountNumber, transactionType, amountRaw, transactionDate, description] = row.map((item) => item.trim());
      const amount = Number(amountRaw);
      const customer = customers.find((item) => item.accountNumber === accountNumber);

      if (!customerName || !accountNumber || !transactionType || !amountRaw || !transactionDate || !description) {
        errors.push(`Baris ${line}: semua kolom wajib diisi.`);
        return;
      }

      if (!customer) {
        errors.push(`Baris ${line}: customer dengan rekening ${accountNumber} tidak ditemukan.`);
        return;
      }

      if (customer.fullName.toLowerCase() !== customerName.toLowerCase()) {
        errors.push(`Baris ${line}: nama customer tidak cocok dengan nomor rekening.`);
        return;
      }

      if (!TRANSACTION_TYPES.includes(transactionType)) {
        errors.push(`Baris ${line}: jenis transaksi ${transactionType} tidak valid.`);
        return;
      }

      if (!amount || amount <= 0) {
        errors.push(`Baris ${line}: nominal harus lebih dari 0.`);
        return;
      }

      if (!isValidDate(transactionDate)) {
        errors.push(`Baris ${line}: tanggal transaksi tidak valid.`);
        return;
      }

      imported.push({
        id: uid("trx"),
        transactionCode: nextTransactionCode(transactions.concat(imported)),
        customerId: customer.id,
        customerName: customer.fullName,
        transactionType,
        amount,
        status: "Pending",
        transactionDate,
        description,
        createdBy: state.currentUser.username,
        approvedBy: "",
        approvedAt: "",
        createdAt: nowIso()
      });
    });

    if (imported.length) {
      writeStorage(STORAGE.TRANSACTIONS, transactions.concat(imported));
    }

    state.importResult = {
      total: rows.length - 1,
      success: imported.length,
      failed: errors.length,
      errors
    };

    logAudit("Import CSV", "ETL", `Import CSV transaksi: ${imported.length} berhasil, ${errors.length} gagal.`);
    renderPage();
  }

  function importResultHtml(result) {
    return `
      <div class="import-result">
        <div class="result-box"><span>Total Data</span><strong>${result.total}</strong></div>
        <div class="result-box"><span>Berhasil</span><strong>${result.success}</strong></div>
        <div class="result-box"><span>Gagal</span><strong>${result.failed}</strong></div>
      </div>
      ${result.errors.length ? `
        <div class="alert error">
          <strong>Data gagal diproses</strong>
          <ul class="error-list">
            ${result.errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}
          </ul>
        </div>
      ` : `<div class="alert success">Semua data valid berhasil masuk ke transaksi dengan status Pending.</div>`}
    `;
  }

  function renderReports(view) {
    const rows = reportRows();
    const totalAmount = rows.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    view.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Reports</h1>
          <p>Laporan transaksi dengan filter tanggal, status, jenis transaksi, dan export CSV.</p>
        </div>
        <button class="btn" id="exportReportBtn" type="button">Export CSV</button>
      </div>

      <div class="grid stats-grid" style="grid-template-columns: repeat(2, minmax(220px, 1fr)); margin-bottom: 18px;">
        ${statCard("Total Data Transaksi", rows.length, "Sesuai filter laporan")}
        ${statCard("Total Nominal", formatCurrency(totalAmount), "Akumulasi nominal transaksi")}
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h3>Laporan Semua Transaksi</h3>
            <p>${rows.length} data ditampilkan.</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="toolbar">
            <div class="filters">
              <input class="input-sm" id="reportDateFrom" type="date" value="${escapeAttr(state.reportFilters.dateFrom)}">
              <input class="input-sm" id="reportDateTo" type="date" value="${escapeAttr(state.reportFilters.dateTo)}">
              <select class="select-sm" id="reportStatus">
                <option value="All">Semua Status</option>
                ${TRANSACTION_STATUSES.map((status) => `<option value="${status}" ${state.reportFilters.status === status ? "selected" : ""}>${status}</option>`).join("")}
              </select>
              <select class="select-sm" id="reportType">
                <option value="All">Semua Jenis</option>
                ${TRANSACTION_TYPES.map((type) => `<option value="${type}" ${state.reportFilters.type === type ? "selected" : ""}>${type}</option>`).join("")}
              </select>
            </div>
          </div>
          ${transactionTable(rows, { actions: false })}
        </div>
      </div>
    `;

    view.querySelector("#exportReportBtn").addEventListener("click", exportReport);
    view.querySelector("#reportDateFrom").addEventListener("change", (event) => {
      state.reportFilters.dateFrom = event.target.value;
      renderPage();
    });
    view.querySelector("#reportDateTo").addEventListener("change", (event) => {
      state.reportFilters.dateTo = event.target.value;
      renderPage();
    });
    view.querySelector("#reportStatus").addEventListener("change", (event) => {
      state.reportFilters.status = event.target.value;
      renderPage();
    });
    view.querySelector("#reportType").addEventListener("change", (event) => {
      state.reportFilters.type = event.target.value;
      renderPage();
    });
  }

  function exportReport() {
    const rows = reportRows();
    const headers = [
      "TransactionCode",
      "CustomerName",
      "TransactionType",
      "Amount",
      "Status",
      "TransactionDate",
      "Description",
      "CreatedBy",
      "ApprovedBy",
      "ApprovedAt"
    ];

    const csvRows = rows.map((transaction) => [
      transaction.transactionCode,
      transaction.customerName,
      transaction.transactionType,
      transaction.amount,
      transaction.status,
      transaction.transactionDate,
      transaction.description,
      transaction.createdBy,
      transaction.approvedBy,
      transaction.approvedAt
    ]);

    const content = [headers, ...csvRows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
    downloadCsv("fintrack-report-transactions.csv", content);
    logAudit("Export laporan", "Reports", `Export laporan transaksi ${rows.length} data.`);
  }

  function renderAuditLog(view) {
    const logs = filterAuditLogs();

    view.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Audit Log</h1>
          <p>Jejak aktivitas login, CRUD, approval, import, dan export laporan.</p>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h3>Aktivitas Sistem</h3>
            <p>${logs.length} log ditampilkan.</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="toolbar">
            <div class="filters">
              <input class="input-sm" id="auditSearch" placeholder="Cari log..." value="${escapeAttr(state.auditSearch)}">
            </div>
          </div>
          ${auditTable(logs)}
        </div>
      </div>
    `;

    view.querySelector("#auditSearch").addEventListener("input", (event) => {
      state.auditSearch = event.target.value;
      renderPage();
      focusField("auditSearch");
    });
  }

  function auditTable(logs) {
    if (!logs.length) {
      return `<div class="empty-state">Belum ada audit log yang cocok.</div>`;
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map((log) => `
              <tr>
                <td>${formatDate(log.createdAt)}</td>
                <td>${escapeHtml(log.user)}</td>
                <td>${roleBadge(log.role)}</td>
                <td><strong>${escapeHtml(log.action)}</strong></td>
                <td>${escapeHtml(log.module)}</td>
                <td>${escapeHtml(log.description)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderApiDocs(view) {
    const groups = [
      {
        title: "Authentication",
        endpoints: [
          ["POST", "/api/auth/login"],
          ["POST", "/api/auth/register"]
        ]
      },
      {
        title: "Customer",
        endpoints: [
          ["GET", "/api/customers"],
          ["GET", "/api/customers/{id}"],
          ["POST", "/api/customers"],
          ["PUT", "/api/customers/{id}"],
          ["DELETE", "/api/customers/{id}"]
        ]
      },
      {
        title: "Transaction",
        endpoints: [
          ["GET", "/api/transactions"],
          ["GET", "/api/transactions/{id}"],
          ["POST", "/api/transactions"],
          ["PUT", "/api/transactions/{id}"],
          ["DELETE", "/api/transactions/{id}"],
          ["PUT", "/api/transactions/{id}/approve"],
          ["PUT", "/api/transactions/{id}/reject"]
        ]
      },
      {
        title: "Report",
        endpoints: [["GET", "/api/reports/transactions"]]
      },
      {
        title: "ETL",
        endpoints: [["POST", "/api/import/transactions"]]
      }
    ];

    const sampleResponse = {
      success: true,
      message: "Transaction fetched successfully",
      data: {
        id: "trx-001",
        transactionCode: "TRX-2026-0001",
        customerName: "Andi Wijaya",
        transactionType: "Transfer",
        amount: 2500000,
        status: "Success",
        transactionDate: "2026-05-01",
        approvedBy: "manager"
      }
    };

    view.innerHTML = `
      <div class="page-header">
        <div>
          <h1>API Documentation Demo</h1>
          <p>Daftar endpoint REST API demo untuk rancangan backend .NET Web API.</p>
        </div>
      </div>

      <div class="api-grid">
        ${groups.map((group) => `
          <div class="panel">
            <div class="panel-header">
              <div>
                <h3>${escapeHtml(group.title)}</h3>
                <p>${group.endpoints.length} endpoint.</p>
              </div>
            </div>
            <div class="panel-body endpoint-list">
              ${group.endpoints.map(([method, path]) => endpointItem(method, path)).join("")}
            </div>
          </div>
        `).join("")}
        <div class="panel">
          <div class="panel-header">
            <div>
              <h3>Contoh JSON Response</h3>
              <p>Struktur response sukses standar.</p>
            </div>
          </div>
          <div class="panel-body">
            <pre>${escapeHtml(JSON.stringify(sampleResponse, null, 2))}</pre>
          </div>
        </div>
      </div>
    `;
  }

  function endpointItem(method, path) {
    return `
      <div class="endpoint">
        <span class="method ${method.toLowerCase()}">${escapeHtml(method)}</span>
        <code>${escapeHtml(path)}</code>
      </div>
    `;
  }

  function statCard(label, value, note) {
    return `
      <div class="stat-card">
        <div>
          <p class="stat-label">${escapeHtml(label)}</p>
          <div class="stat-value">${escapeHtml(value)}</div>
        </div>
        <span class="stat-note">${escapeHtml(note)}</span>
      </div>
    `;
  }

  function statusSummary(transactions) {
    const total = Math.max(transactions.length, 1);
    return `
      <div class="summary-list">
        ${TRANSACTION_STATUSES.map((status) => {
          const count = transactions.filter((transaction) => transaction.status === status).length;
          const percent = Math.round((count / total) * 100);
          return `
            <div class="summary-item">
              <div class="summary-label">
                <span>${statusBadge(status)}</span>
                <strong>${count} data</strong>
              </div>
              <div class="progress ${status.toLowerCase()}"><span style="width: ${percent}%;"></span></div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function showModal(options) {
    closeModal();
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
      <div class="modal ${options.size || ""}" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>${escapeHtml(options.title)}</h3>
          <button class="btn secondary icon-only" data-close-modal type="button" aria-label="Tutup">X</button>
        </div>
        <div class="modal-body">${options.body}</div>
        <div class="modal-footer">${options.footer || `<button class="btn secondary" data-close-modal type="button">Tutup</button>`}</div>
      </div>
    `;

    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop || event.target.closest("[data-close-modal]")) {
        closeModal();
      }
    });

    document.body.appendChild(backdrop);
  }

  function closeModal() {
    const modal = document.querySelector(".modal-backdrop");
    if (modal) modal.remove();
  }

  function detailItem(label, value) {
    return `
      <div class="detail-item">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value || "-")}</strong>
      </div>
    `;
  }

  function statusBadge(status) {
    const cls = String(status || "").toLowerCase();
    return `<span class="badge ${escapeAttr(cls)}">${escapeHtml(status || "-")}</span>`;
  }

  function roleBadge(role) {
    return `<span class="badge role">${escapeHtml(role || "-")}</span>`;
  }

  function getCustomers() {
    return readStorage(STORAGE.CUSTOMERS, []);
  }

  function getTransactions() {
    return readStorage(STORAGE.TRANSACTIONS, []);
  }

  function getApprovals() {
    return readStorage(STORAGE.APPROVALS, []);
  }

  function getAuditLogs() {
    return readStorage(STORAGE.AUDIT_LOGS, []);
  }

  function filterCustomers() {
    const query = state.customerSearch.trim().toLowerCase();
    const customers = getCustomers();
    if (!query) return customers;
    return customers.filter((customer) => [
      customer.customerCode,
      customer.fullName,
      customer.accountNumber,
      customer.email,
      customer.phoneNumber,
      customer.status
    ].some((value) => String(value).toLowerCase().includes(query)));
  }

  function filterTransactions() {
    const query = state.transactionSearch.trim().toLowerCase();
    return getTransactions().filter((transaction) => {
      const queryMatch = !query || [
        transaction.transactionCode,
        transaction.customerName,
        transaction.transactionType,
        transaction.status,
        transaction.description,
        transaction.createdBy
      ].some((value) => String(value).toLowerCase().includes(query));
      const statusMatch = state.transactionStatus === "All" || transaction.status === state.transactionStatus;
      const typeMatch = state.transactionType === "All" || transaction.transactionType === state.transactionType;
      return queryMatch && statusMatch && typeMatch;
    });
  }

  function reportRows() {
    const filters = state.reportFilters;
    return getTransactions().filter((transaction) => {
      const statusMatch = filters.status === "All" || transaction.status === filters.status;
      const typeMatch = filters.type === "All" || transaction.transactionType === filters.type;
      const fromMatch = !filters.dateFrom || transaction.transactionDate >= filters.dateFrom;
      const toMatch = !filters.dateTo || transaction.transactionDate <= filters.dateTo;
      return statusMatch && typeMatch && fromMatch && toMatch;
    });
  }

  function filterAuditLogs() {
    const query = state.auditSearch.trim().toLowerCase();
    const logs = [...getAuditLogs()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!query) return logs;
    return logs.filter((log) => [
      log.user,
      log.role,
      log.action,
      log.module,
      log.description,
      log.createdAt
    ].some((value) => String(value).toLowerCase().includes(query)));
  }

  function syncTransactionCustomerName(customerId, fullName) {
    const transactions = getTransactions().map((transaction) => {
      if (transaction.customerId !== customerId) return transaction;
      return { ...transaction, customerName: fullName };
    });
    writeStorage(STORAGE.TRANSACTIONS, transactions);
  }

  function logAudit(action, module, description, actorOverride) {
    const actor = actorOverride || state.currentUser || readStorage(STORAGE.SESSION, null) || {
      username: "system",
      role: "System"
    };
    const logs = getAuditLogs();
    logs.push({
      id: uid("log"),
      user: actor.username,
      role: actor.role,
      action,
      module,
      description,
      createdAt: nowIso()
    });
    writeStorage(STORAGE.AUDIT_LOGS, logs);
  }

  function canAccess(page) {
    if (!state.currentUser) return false;
    return (ROLE_ACCESS[state.currentUser.role] || []).includes(page);
  }

  function accessibleMenus() {
    if (!state.currentUser) return [];
    const allowed = ROLE_ACCESS[state.currentUser.role] || [];
    return MENU_ITEMS.filter((item) => allowed.includes(item.id));
  }

  function topbarSubtitle(page) {
    const subtitles = {
      dashboard: "Monitor performa transaksi dan customer.",
      customers: "CRUD customer dengan penyimpanan LocalStorage.",
      transactions: "CRUD transaksi dan filter operasional.",
      approval: "Approve atau reject transaksi pending.",
      import: "Import CSV transaksi dengan validasi.",
      reports: "Filter laporan dan export CSV.",
      audit: "Aktivitas sistem tercatat otomatis.",
      api: "Endpoint demo untuk rancangan backend."
    };
    return subtitles[page] || "FinTrack System";
  }

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(`Gagal membaca ${key}`, error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function nextCustomerCode() {
    const numbers = getCustomers()
      .map((customer) => Number(String(customer.customerCode || "").replace(/\D/g, "")))
      .filter(Boolean);
    return `CUS-${Math.max(1000, ...numbers) + 1}`;
  }

  function nextTransactionCode(source) {
    const transactions = source || getTransactions();
    const numbers = transactions
      .map((transaction) => Number(String(transaction.transactionCode || "").replace(/\D/g, "").slice(4)))
      .filter(Boolean);
    const next = Math.max(0, ...numbers) + 1;
    return `TRX-${new Date().getFullYear()}-${String(next).padStart(4, "0")}`;
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"' && inQuotes && next === '"') {
        cell += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === "," && !inQuotes) {
        row.push(cell);
        cell = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(cell);
        if (row.some((item) => item.trim() !== "")) rows.push(row);
        row = [];
        cell = "";
        continue;
      }

      cell += char;
    }

    row.push(cell);
    if (row.some((item) => item.trim() !== "")) rows.push(row);
    return rows;
  }

  function downloadCsv(filename, content) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function escapeCsvCell(value) {
    const text = String(value ?? "");
    if (/[",\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function formatDate(value, mode) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    if (mode === "date") {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(date);
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function isValidDate(value) {
    return Boolean(value) && !Number.isNaN(new Date(value).getTime());
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function todayDate() {
    return new Date().toISOString().slice(0, 10);
  }

  function clean(value) {
    return String(value ?? "").trim();
  }

  function focusField(id) {
    requestAnimationFrame(() => {
      const field = document.getElementById(id);
      if (!field) return;
      field.focus();
      if (typeof field.setSelectionRange === "function") {
        const end = field.value.length;
        field.setSelectionRange(end, end);
      }
    });
  }

  function initials(name) {
    return String(name || "FT")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
