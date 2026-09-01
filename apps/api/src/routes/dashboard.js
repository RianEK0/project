import { Router } from "express";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler, parseOptionalInt } from "../utils/http.js";
import { archiveSelectSql, buildArchiveFilters } from "../services/archiveQueries.js";

const router = Router();
const GLOBAL_ROLES = new Set(["Admin", "Inspektur", "Sekretaris", "Umpeg"]);

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const filters = buildArchiveFilters({ filters: req.query, user: req.user });
    const requestedUnitId = parseOptionalInt(req.query.unitId);
    const isGlobalRole = GLOBAL_ROLES.has(req.user.role);

    const totals = await query(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'Menunggu Review')::int AS waiting_review,
        COUNT(*) FILTER (WHERE status = 'Terverifikasi')::int AS verified,
        COUNT(*) FILTER (WHERE status = 'Draft')::int AS draft,
        COUNT(*) FILTER (WHERE status = 'Ditolak')::int AS rejected,
        COUNT(*) FILTER (WHERE status = 'Diarsipkan')::int AS archived,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Aktif')::int AS active_archives,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Inaktif')::int AS inactive_archives,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Statis')::int AS static_archives,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Musnah')::int AS destroyed_archives,
        
        -- New Stats:
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS new_archives,
        COUNT(*) FILTER (WHERE lifecycle_status = 'Aktif' AND status = 'Diarsipkan' AND CURRENT_DATE >= (archive_date + (active_retention * INTERVAL '1 year')))::int AS eligible_disposal,
        COUNT(*) FILTER (WHERE lifecycle_status = 'Usulan Penyusutan')::int AS in_disposal,
        COUNT(*) FILTER (WHERE lifecycle_status = 'Inaktif' AND status = 'Diarsipkan' AND CURRENT_DATE >= (archive_date + ((active_retention + inactive_retention) * INTERVAL '1 year')))::int AS eligible_destruction,
        COUNT(*) FILTER (WHERE lifecycle_status IN ('Usulan Pemusnahan', 'Verifikasi Pemusnahan', 'Disetujui Pemusnahan'))::int AS in_destruction,
        COUNT(*) FILTER (WHERE lifecycle_status = 'Musnah' AND destruction_date >= DATE_TRUNC('month', CURRENT_DATE))::int AS destroyed_this_month
       FROM archives a
       ${filters.whereSql}`,
      filters.values
    );

    const unitCounts = await query(
      `SELECT ou.id, ou.name, COUNT(a.id)::int AS total
       FROM archives a
       JOIN organization_units ou ON a.unit_id = ou.id
       ${filters.whereSql}
       GROUP BY ou.id, ou.name
       ORDER BY total DESC, ou.name ASC`,
      filters.values
    );

    const recentArchives = await query(
      `${archiveSelectSql()}
       ${filters.whereSql}
       ORDER BY a.created_at DESC
       LIMIT 6`,
      filters.values
    );

    const activities = await query(
      `SELECT al.id, al.action, al.entity, al.entity_id, al.metadata, al.created_at,
              u.name AS user_name, u.role AS user_role
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${isGlobalRole ? "" : "WHERE al.user_id = $1"}
       ORDER BY al.created_at DESC
       LIMIT 8`,
      isGlobalRole ? [] : [req.user.id]
    );

    // Chart Queries
    // 1. Penciptaan per Bulan (current year)
    const creationFilter = buildArchiveFilters({ filters: req.query, user: req.user, alias: 'a' });
    const creationResult = await query(
      `SELECT DATE_PART('month', a.created_at)::int AS month, COUNT(*)::int AS count
       FROM archives a
       ${creationFilter.whereSql ? creationFilter.whereSql + " AND" : "WHERE"} a.created_at >= DATE_TRUNC('year', CURRENT_DATE)
       GROUP BY DATE_PART('month', a.created_at)
       ORDER BY month`,
      creationFilter.values
    );

    // 2. Penyusutan per Tahun
    const disposalResult = await query(
      `SELECT DATE_PART('year', l.action_date)::int AS year, COUNT(DISTINCT l.archive_id)::int AS count
       FROM archive_lifecycle_logs l
       JOIN archives a ON l.archive_id = a.id
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} l.stage IN ('Menjadi Arsip Inaktif', 'Menjadi Arsip Statis', 'Diusulkan Musnah')
       GROUP BY DATE_PART('year', l.action_date)
       ORDER BY year ASC`,
      filters.values
    );

    // 3. Pemusnahan per Tahun
    const destructionResult = await query(
      `SELECT DATE_PART('year', a.destruction_date)::int AS year, COUNT(*)::int AS count
       FROM archives a
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.lifecycle_status = 'Musnah' AND a.destruction_date IS NOT NULL
       GROUP BY DATE_PART('year', a.destruction_date)
       ORDER BY year ASC`,
      filters.values
    );

    // 4. Klasifikasi
    const classificationResult = await query(
      `SELECT a.classification, COUNT(*)::int AS count
       FROM archives a
       ${filters.whereSql}
       GROUP BY a.classification
       ORDER BY count DESC
       LIMIT 10`,
      filters.values
    );

    // 5. Pengarsipan per Bulan (current year, status='Diarsipkan')
    const archivingByMonthResult = await query(
      `SELECT DATE_PART('month', a.updated_at)::int AS month, COUNT(*)::int AS count
       FROM archives a
       ${creationFilter.whereSql ? creationFilter.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
         AND a.updated_at >= DATE_TRUNC('year', CURRENT_DATE)
       GROUP BY DATE_PART('month', a.updated_at)
       ORDER BY month`,
      creationFilter.values
    );

    // 6. Pengarsipan per Jenis Dokumen
    const archivingByTypeResult = await query(
      `SELECT a.document_type, COUNT(*)::int AS count
       FROM archives a
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
       GROUP BY a.document_type
       ORDER BY count DESC`,
      filters.values
    );

    // 7. Pengarsipan per Kategori Arsip
    const archivingByCategoryResult = await query(
      `SELECT a.archive_category, COUNT(*)::int AS count
       FROM archives a
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
       GROUP BY a.archive_category
       ORDER BY count DESC`,
      filters.values
    );

    // 8. Pengarsipan per Unit
    const archivingByUnitResult = await query(
      `SELECT ou.name AS unit_name, COUNT(a.id)::int AS total
       FROM archives a
       JOIN organization_units ou ON ou.id = a.unit_id
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
       GROUP BY ou.name
       ORDER BY total DESC
       LIMIT 10`,
      filters.values
    );

    // 9. Arsip terbaru yang diarsipkan
    const recentArchivedResult = await query(
      `SELECT a.id, a.title, a.document_number, a.year, a.archive_category, a.document_type,
              a.file_type, a.security_level, a.updated_at, a.verified_at,
              ou.name AS unit_name,
              u.name AS verifier_name
       FROM archives a
       JOIN organization_units ou ON ou.id = a.unit_id
       LEFT JOIN users u ON u.id = a.verified_by
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
       ORDER BY a.updated_at DESC
       LIMIT 8`,
      filters.values
    );

    // Rekap stat pengarsipan bulan ini
    const archivingStatsResult = await query(
      `SELECT
        COUNT(*)::int AS total_archived,
        COUNT(*) FILTER (WHERE updated_at >= DATE_TRUNC('month', CURRENT_DATE))::int AS archived_this_month,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Aktif')::int AS archived_aktif,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Inaktif')::int AS archived_inaktif,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Statis')::int AS archived_statis
       FROM archives a
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'`,
      filters.values
    );

    const reviewScopeSql = isGlobalRole
      ? requestedUnitId
        ? "AND a.unit_id = $1"
        : ""
      : "AND a.unit_id = $1";
    const reviewScopeValues = isGlobalRole
      ? requestedUnitId
        ? [requestedUnitId]
        : []
      : [req.user.unitId];

    const pendingReviewResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM archives a
       WHERE a.deleted_at IS NULL
         AND a.status = 'Menunggu Review'
         ${reviewScopeSql}`,
      reviewScopeValues
    );

    const trashFilters = buildArchiveFilters({
      filters: { trash: "only", unitId: req.query.unitId },
      user: req.user
    });
    const trashCountResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM archives a
       ${trashFilters.whereSql}`,
      trashFilters.values
    );

    const pendingLoansResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM archive_loans l
       JOIN archives a ON a.id = l.archive_id
       WHERE a.deleted_at IS NULL
         AND l.status = 'Menunggu Persetujuan'
         ${
           isGlobalRole
             ? requestedUnitId
               ? "AND a.unit_id = $1"
               : ""
             : "AND l.user_id = $1"
         }`,
      isGlobalRole ? (requestedUnitId ? [requestedUnitId] : []) : [req.user.id]
    );

    const pendingExtensionsResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM archive_loan_extensions e
       JOIN archive_loans l ON l.id = e.loan_id
       JOIN archives a ON a.id = l.archive_id
       WHERE a.deleted_at IS NULL
         AND e.status = 'Menunggu Persetujuan'
         ${
           isGlobalRole
             ? requestedUnitId
               ? "AND a.unit_id = $1"
               : ""
             : "AND e.requested_by = $1"
         }`,
      isGlobalRole ? (requestedUnitId ? [requestedUnitId] : []) : [req.user.id]
    );

    const overdueLoansResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM archive_loans l
       JOIN archives a ON a.id = l.archive_id
       WHERE a.deleted_at IS NULL
         AND l.status = 'Disetujui'
         AND l.loan_deadline < CURRENT_DATE
         ${
           isGlobalRole
             ? requestedUnitId
               ? "AND a.unit_id = $1"
               : ""
             : "AND l.user_id = $1"
         }`,
      isGlobalRole ? (requestedUnitId ? [requestedUnitId] : []) : [req.user.id]
    );

    const dueDispositionsResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM dispositions d
       JOIN archives a ON a.id = d.archive_id
       WHERE a.deleted_at IS NULL
         AND d.status NOT IN ('Selesai', 'Dibatalkan')
         AND d.deadline <= CURRENT_DATE
         ${
           isGlobalRole
             ? requestedUnitId
               ? "AND a.unit_id = $1"
               : ""
             : "AND (d.to_user_id = $1 OR d.to_unit_id = $2)"
         }`,
      isGlobalRole ? (requestedUnitId ? [requestedUnitId] : []) : [req.user.id, req.user.unitId || null]
    );

    const systemJobResult = await query(
      `SELECT job_name, last_run_at, last_status, last_message
       FROM system_jobs
       WHERE job_name = 'daily_notifications'
       LIMIT 1`
    );

    const pendingReview = Number(pendingReviewResult.rows[0]?.total || 0);
    const pendingLoans = Number(pendingLoansResult.rows[0]?.total || 0);
    const pendingExtensions = Number(pendingExtensionsResult.rows[0]?.total || 0);
    const overdueLoans = Number(overdueLoansResult.rows[0]?.total || 0);
    const dueDispositions = Number(dueDispositionsResult.rows[0]?.total || 0);
    const trashedArchives = Number(trashCountResult.rows[0]?.total || 0);
    const retentionDue = Number(totals.rows[0].eligible_disposal || 0) + Number(totals.rows[0].eligible_destruction || 0);

    const todayTasks = isGlobalRole
      ? [
          {
            key: "pending-loan-approvals",
            label: "Approval peminjaman",
            count: pendingLoans,
            href: "/peminjaman",
            tone: "amber",
            description: "Permohonan peminjaman yang menunggu persetujuan."
          },
          {
            key: "pending-loan-extensions",
            label: "Approval perpanjangan",
            count: pendingExtensions,
            href: "/peminjaman",
            tone: "indigo",
            description: "Permintaan extend deadline yang belum ditinjau."
          },
          {
            key: "overdue-loans",
            label: "Peminjaman terlambat",
            count: overdueLoans,
            href: "/peminjaman",
            tone: "red",
            description: "Arsip pinjam yang sudah melewati deadline."
          },
          {
            key: "due-dispositions",
            label: "Disposisi jatuh tempo",
            count: dueDispositions,
            href: "/dispositions",
            tone: "amber",
            description: "Disposisi yang perlu tindak lanjut segera."
          },
          {
            key: "retention-due",
            label: "Retensi perlu tindakan",
            count: retentionDue,
            href: "/archives?retentionStatus=active_expired",
            tone: "blue",
            description: "Arsip yang siap disusutkan atau dimusnahkan."
          },
          {
            key: "trash-archives",
            label: "Arsip di sampah",
            count: trashedArchives,
            href: "/archives?trash=1",
            tone: "slate",
            description: "Arsip yang masih bisa direstore."
          }
        ]
      : [
          {
            key: "my-pending-loans",
            label: "Permohonan saya",
            count: pendingLoans,
            href: "/peminjaman",
            tone: "amber",
            description: "Permohonan pinjam Anda yang masih menunggu."
          },
          {
            key: "my-pending-extensions",
            label: "Extend menunggu",
            count: pendingExtensions,
            href: "/peminjaman",
            tone: "indigo",
            description: "Permintaan perpanjangan Anda yang belum dijawab."
          },
          {
            key: "my-overdue-loans",
            label: "Pinjaman saya terlambat",
            count: overdueLoans,
            href: "/peminjaman",
            tone: "red",
            description: "Peminjaman aktif Anda yang sudah lewat deadline."
          },
          {
            key: "my-due-dispositions",
            label: "Disposisi saya",
            count: dueDispositions,
            href: "/dispositions",
            tone: "amber",
            description: "Disposisi yang ditujukan ke Anda atau unit Anda."
          },
          {
            key: "my-unit-reviews",
            label: "Arsip menunggu review",
            count: pendingReview,
            href: "/archives?status=Menunggu%20Review",
            tone: "blue",
            description: "Arsip unit Anda yang belum selesai diverifikasi."
          }
        ];

    res.json({
      stats: {
        totalArchives: totals.rows[0].total,
        divisionArchives: unitCounts.rows.find((unit) => unit.id === Number(req.query.unitId))?.total || totals.rows[0].total,
        waitingReview: totals.rows[0].waiting_review,
        verified: totals.rows[0].verified,
        draft: totals.rows[0].draft,
        rejected: totals.rows[0].rejected,
        archived: totals.rows[0].archived,
        activeArchives: totals.rows[0].active_archives,
        inactiveArchives: totals.rows[0].inactive_archives,
        staticArchives: totals.rows[0].static_archives,
        destroyedArchives: totals.rows[0].destroyed_archives,

        // New stats
        newArchives: totals.rows[0].new_archives,
        eligibleDisposal: totals.rows[0].eligible_disposal,
        inDisposal: totals.rows[0].in_disposal,
        eligibleDestruction: totals.rows[0].eligible_destruction,
        inDestruction: totals.rows[0].in_destruction,
        destroyedThisMonth: totals.rows[0].destroyed_this_month,

        // Rekap pengarsipan
        totalArchived: archivingStatsResult.rows[0].total_archived,
        archivedThisMonth: archivingStatsResult.rows[0].archived_this_month,
        archivedAktif: archivingStatsResult.rows[0].archived_aktif,
        archivedInaktif: archivingStatsResult.rows[0].archived_inaktif,
        archivedStatis: archivingStatsResult.rows[0].archived_statis,
        trashedArchives
      },
      unitCounts: unitCounts.rows,
      recentArchives: recentArchives.rows,
      activities: activities.rows,
      todayTasks,
      roleSummary: {
        mode: isGlobalRole ? "global" : "unit",
        role: req.user.role
      },
      automation: systemJobResult.rows[0] || null,
      charts: {
        creationByMonth: creationResult.rows,
        disposalByYear: disposalResult.rows,
        destructionByYear: destructionResult.rows,
        byClassification: classificationResult.rows,
        archivingByMonth: archivingByMonthResult.rows,
        archivingByType: archivingByTypeResult.rows,
        archivingByCategory: archivingByCategoryResult.rows,
        archivingByUnit: archivingByUnitResult.rows
      },
      recentArchived: recentArchivedResult.rows
    });
  })
);

export default router;
