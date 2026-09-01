import { Router } from "express";
import PDFDocument from "pdfkit";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler, createHttpError } from "../utils/http.js";
import { logActivity } from "../services/audit.js";
import { enforceDataEgressPolicy } from "../services/dataEgressProtection.js";
import { archiveSelectSql, buildArchiveFilters } from "../services/archiveQueries.js";

const router = Router();

async function reportRows(req, limit = 500) {
  const filters = buildArchiveFilters({ filters: req.query, user: req.user });
  const result = await query(
    `${archiveSelectSql()}
     ${filters.whereSql}
     ORDER BY a.year DESC, a.created_at DESC
     LIMIT $${filters.nextIndex}`,
    [...filters.values, limit]
  );
  return result.rows;
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function excelXml(rows) {
  const header = ["Nomor Dokumen", "Judul", "Unit", "Jenis", "Klasifikasi", "Kategori Arsip", "Tipe File", "Tahun", "Status"];
  const keys = ["document_number", "title", "unit_name", "document_type", "classification", "archive_category", "file_type", "year", "status"];
  const bodyRows = [
    header.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join(""),
    ...rows.map((row) =>
      keys
        .map((key) => {
          const type = key === "year" ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${escapeXml(row[key])}</Data></Cell>`;
        })
        .join("")
    )
  ]
    .map((cells) => `<Row>${cells}</Row>`)
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Laporan Arsip">
  <Table>${bodyRows}</Table>
 </Worksheet>
</Workbook>`;
}

router.get(
  "/archives",
  authenticate,
  asyncHandler(async (req, res) => {
    const filters = buildArchiveFilters({ filters: req.query, user: req.user });
    const summary = await query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'Draft')::int AS draft,
         COUNT(*) FILTER (WHERE status = 'Menunggu Review')::int AS waiting_review,
         COUNT(*) FILTER (WHERE status = 'Terverifikasi')::int AS verified,
         COUNT(*) FILTER (WHERE status = 'Ditolak')::int AS rejected,
         COUNT(*) FILTER (WHERE status = 'Diarsipkan')::int AS archived,
         COUNT(*) FILTER (WHERE archive_category = 'Arsip Aktif')::int AS active_archives,
         COUNT(*) FILTER (WHERE archive_category = 'Arsip Inaktif')::int AS inactive_archives,
         COUNT(*) FILTER (WHERE archive_category = 'Arsip Statis')::int AS static_archives,
         COUNT(*) FILTER (WHERE archive_category = 'Arsip Musnah')::int AS destroyed_archives
       FROM archives a
       ${filters.whereSql}`,
      filters.values
    );

    const byUnit = await query(
      `SELECT ou.name AS unit_name, COUNT(a.id)::int AS total
       FROM archives a
       JOIN organization_units ou ON ou.id = a.unit_id
       ${filters.whereSql}
       GROUP BY ou.name
       ORDER BY total DESC`,
      filters.values
    );

    const byYear = await query(
      `SELECT a.year, COUNT(*)::int AS total
       FROM archives a
       ${filters.whereSql}
       GROUP BY a.year
       ORDER BY a.year DESC`,
      filters.values
    );

    const rows = await reportRows(req, 50);

    res.json({
      summary: summary.rows[0],
      byUnit: byUnit.rows,
      byYear: byYear.rows,
      data: rows
    });
  })
);

// Rekap khusus pengarsipan
router.get(
  "/archiving-recap",
  authenticate,
  asyncHandler(async (req, res) => {
    const filters = buildArchiveFilters({ filters: req.query, user: req.user });

    // Stat utama
    const statsResult = await query(
      `SELECT
        COUNT(*)::int AS total_archived,
        COUNT(*) FILTER (WHERE updated_at >= DATE_TRUNC('month', CURRENT_DATE))::int AS archived_this_month,
        COUNT(*) FILTER (WHERE updated_at >= DATE_TRUNC('year', CURRENT_DATE))::int AS archived_this_year,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Aktif')::int AS archived_aktif,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Inaktif')::int AS archived_inaktif,
        COUNT(*) FILTER (WHERE archive_category = 'Arsip Statis')::int AS archived_statis,
        COUNT(*) FILTER (WHERE security_level = 'Biasa')::int AS security_biasa,
        COUNT(*) FILTER (WHERE security_level = 'Terbatas')::int AS security_terbatas,
        COUNT(*) FILTER (WHERE security_level = 'Rahasia')::int AS security_rahasia
       FROM archives a
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'`,
      filters.values
    );

    // Per unit
    const byUnitResult = await query(
      `SELECT ou.name AS unit_name, COUNT(a.id)::int AS total
       FROM archives a
       JOIN organization_units ou ON ou.id = a.unit_id
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
       GROUP BY ou.name
       ORDER BY total DESC`,
      filters.values
    );

    // Per jenis dokumen
    const byTypeResult = await query(
      `SELECT a.document_type, COUNT(*)::int AS total
       FROM archives a
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
       GROUP BY a.document_type
       ORDER BY total DESC`,
      filters.values
    );

    // Per tahun
    const byYearResult = await query(
      `SELECT a.year, COUNT(*)::int AS total
       FROM archives a
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
       GROUP BY a.year
       ORDER BY a.year DESC`,
      filters.values
    );

    // Per tipe file
    const byFileTypeResult = await query(
      `SELECT a.file_type, COUNT(*)::int AS total
       FROM archives a
       ${filters.whereSql ? filters.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
       GROUP BY a.file_type
       ORDER BY total DESC`,
      filters.values
    );

    // Daftar arsip diarsipkan (preview, max 100)
    const filters2 = buildArchiveFilters({ filters: req.query, user: req.user });
    const archivedListResult = await query(
      `SELECT a.id, a.title, a.document_number, a.year, a.archive_category, a.document_type,
              a.file_type, a.security_level, a.updated_at, a.verified_at, a.letter_number,
              ou.name AS unit_name, u.name AS verifier_name
       FROM archives a
       JOIN organization_units ou ON ou.id = a.unit_id
       LEFT JOIN users u ON u.id = a.verified_by
       ${filters2.whereSql ? filters2.whereSql + " AND" : "WHERE"} a.status = 'Diarsipkan'
       ORDER BY a.updated_at DESC
       LIMIT 100`,
      filters2.values
    );

    res.json({
      stats: statsResult.rows[0],
      byUnit: byUnitResult.rows,
      byType: byTypeResult.rows,
      byYear: byYearResult.rows,
      byFileType: byFileTypeResult.rows,
      data: archivedListResult.rows
    });
  })
);



router.get(
  "/archives/export",
  authenticate,
  asyncHandler(async (req, res) => {
    const format = String(req.query.format || "xls").toLowerCase();
    const rows = await reportRows(req);
    const egressWeight = Math.max(1, Math.ceil(rows.length / 25));
    const egress = await enforceDataEgressPolicy(req, {
      operation: "archive_report_export",
      weight: egressWeight
    });

    await logActivity({
      userId: req.user.id,
      action: "EXPORT",
      entity: "report",
      metadata: { format, rows: rows.length, egressWeight, projectedEgressCount: egress.projected }
    });

    if (["xls", "xlsx", "excel"].includes(format)) {
      res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="laporan-arsip-sipadi.xls"');
      return res.send(excelXml(rows));
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="laporan-arsip-sipadi.pdf"');

      const doc = new PDFDocument({ margin: 42, size: "A4" });
      doc.pipe(res);
      doc.fontSize(16).text("Laporan Arsip SIPADI", { underline: false });
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor("#555").text(`Total data: ${rows.length}`);
      doc.moveDown();

      rows.forEach((row, index) => {
        if (doc.y > 740) doc.addPage();
        doc.fillColor("#111").fontSize(10).text(`${index + 1}. ${row.document_number} - ${row.title}`);
        doc.fillColor("#555").fontSize(8).text(`${row.unit_name} | ${row.document_type} | ${row.classification} | ${row.archive_category} | ${row.file_type} | ${row.year} | ${row.status}`);
        doc.moveDown(0.45);
      });

      doc.end();
      return;
    }

    throw createHttpError(422, "Format export harus pdf atau xls");
  })
);

export default router;
