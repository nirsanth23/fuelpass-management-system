import React, { useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

export async function generateMonthlyReportPDF() {
  const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
  ).replace(/\/$/, "");

  const formatNumber = (num, decimals = 2) => {
    if (isNaN(num)) return "0.00";
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatDate = (dateValue) => {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return d.toLocaleDateString();
  };

  try {
    const [statsResp, stationsResp, analyticsResp] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/stats`),
      fetch(`${API_BASE_URL}/api/admin/stations`),
      fetch(`${API_BASE_URL}/api/admin/analytics`),
    ]);

    const stats = statsResp.ok ? await statsResp.json() : {};
    const stations = stationsResp.ok ? await stationsResp.json() : [];
    const analytics = analyticsResp.ok ? await analyticsResp.json() : {};

    const summaryTable = [
      [
        { text: "Total Petrol Supplied (L)", bold: true },
        formatNumber(stats.total_petrol_stock),
      ],
      [
        { text: "Total Diesel Supplied (L)", bold: true },
        formatNumber(stats.total_diesel_stock),
      ],
      [
        { text: "Total Fuel Issued (L)", bold: true },
        formatNumber(
          (stats.total_petrol_stock || 0) + (stats.total_diesel_stock || 0)
        ),
      ],
      [
        { text: "Number of Active Stations", bold: true },
        stats.active_stations || 0,
      ],
    ];

    const stationTableBody = [
      [
        { text: "Station", bold: true },
        { text: "Petrol (L)", bold: true },
        { text: "Diesel (L)", bold: true },
        { text: "Total (L)", bold: true },
      ],
      ...stations.map((s) => [
        s.name || "-",
        formatNumber(s.petrol_stock),
        formatNumber(s.diesel_stock),
        formatNumber((s.petrol_stock || 0) + (s.diesel_stock || 0)),
      ]),
    ];

    const lowStockRows = (analytics.lowStockStations || []).map((s) => [
      s.station_name || "-",
      s.station_id || "-",
      formatNumber(s.petrol_stock),
      formatNumber(s.diesel_stock),
    ]);

    const lowStockTable = [
      [
        { text: "Station", bold: true },
        { text: "ID", bold: true },
        { text: "Petrol (L)", bold: true },
        { text: "Diesel (L)", bold: true },
      ],
      ...(lowStockRows.length
        ? lowStockRows
        : [["No low stock stations", "-", "-", "-"]]),
    ];

    const inactiveStations =
      stations
        .filter((s) => s.status !== "Active")
        .map((s) => `${s.name} (${s.station_id})`)
        .join(", ") || "None";

    const weeklyTrendsTable = [
      [
        { text: "Date", bold: true },
        { text: "Petrol (L)", bold: true },
        { text: "Diesel (L)", bold: true },
      ],
      ...(analytics.dailyUsage || []).map((day) => [
        formatDate(day.date),
        formatNumber(day.petrol),
        formatNumber(day.diesel),
      ]),
    ];

    let peakDay = "N/A";
    if (analytics.dailyUsage && analytics.dailyUsage.length) {
      const peak = analytics.dailyUsage.reduce((max, d) =>
        (Number(d.petrol || 0) + Number(d.diesel || 0)) >
        (Number(max.petrol || 0) + Number(max.diesel || 0))
          ? d
          : max
      );

      const peakTotal = Number(peak.petrol || 0) + Number(peak.diesel || 0);

      if (peakTotal > 0) {
        peakDay = `${formatDate(peak.date)} (${formatNumber(peakTotal)}L)`;
      }
    }

    let petrolTotal = 0;
    let dieselTotal = 0;

    (analytics.fuelTypeUsage || []).forEach((f) => {
      if (f.fuel_type === "Petrol") petrolTotal = Number(f.total) || 0;
      if (f.fuel_type === "Diesel") dieselTotal = Number(f.total) || 0;
    });

    const totalFuel = petrolTotal + dieselTotal;
    const petrolPct =
      totalFuel > 0 ? ((petrolTotal / totalFuel) * 100).toFixed(1) : "0.0";
    const dieselPct =
      totalFuel > 0 ? ((dieselTotal / totalFuel) * 100).toFixed(1) : "0.0";

    let mostActiveStation = "";
    if (analytics.activeStations && analytics.activeStations.length) {
      mostActiveStation = `${analytics.activeStations[0].name} (${formatNumber(
        analytics.activeStations[0].total_fuel
      )}L)`;
    }

    const recommendations = [
      "Ensure timely supply to low stock stations.",
      "Monitor inactive stations for reactivation.",
      "Optimize supply chain for peak days.",
    ];

    const docDefinition = {
      content: [
        {
          text: "Government of Sri Lanka",
          style: "govHeader",
          alignment: "center",
          margin: [0, 0, 0, 8],
        },
        {
          text: "Ministry of Power & Energy",
          style: "govSubHeader",
          alignment: "center",
          margin: [0, 0, 0, 8],
        },
        {
          text: "Monthly Fuel Supply Report",
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 16],
        },
        {
          text: `Date: ${formatDate(new Date())}`,
          alignment: "right",
          margin: [0, 0, 0, 16],
        },

        { text: "Section 1: Summary", style: "sectionHeader", margin: [0, 0, 0, 8] },
        {
          table: {
            widths: ["*", "*"],
            body: summaryTable.map((row) =>
              row.map((cell, j) =>
                typeof cell === "object" && cell.bold
                  ? {
                      ...cell,
                      fillColor: "#f3e8ff",
                      color: "#6d28d9",
                      margin: [0, 2, 0, 2],
                      alignment: "left",
                    }
                  : {
                      text: String(cell),
                      alignment: j === 1 ? "right" : "left",
                      margin: [0, 2, 0, 2],
                    }
              )
            ),
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#ede9fe" : null),
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
          margin: [0, 0, 0, 18],
        },

        {
          text: "Section 2: Station-wise Distribution",
          style: "sectionHeader",
          margin: [0, 0, 0, 8],
          pageBreak: "before",
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: stationTableBody.map((row) =>
              row.map((cell, j) =>
                typeof cell === "object" && cell.bold
                  ? {
                      ...cell,
                      fillColor: "#f3e8ff",
                      color: "#6d28d9",
                      alignment: "center",
                      margin: [0, 2, 0, 2],
                    }
                  : {
                      text: String(cell),
                      alignment: j > 0 ? "right" : "left",
                      margin: [0, 2, 0, 2],
                    }
              )
            ),
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#ede9fe" : null),
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
          margin: [0, 0, 0, 18],
        },

        {
          text: "Section 3: Low Stock",
          style: "sectionHeader",
          margin: [0, 0, 0, 8],
          pageBreak: "before",
        },
        { text: "Stations with frequent low stock:", margin: [0, 0, 0, 2] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: lowStockTable.map((row) =>
              row.map((cell, j) =>
                typeof cell === "object" && cell.bold
                  ? {
                      ...cell,
                      fillColor: "#fee2e2",
                      color: "#b91c1c",
                      alignment: "center",
                      margin: [0, 2, 0, 2],
                    }
                  : {
                      text: String(cell),
                      alignment: j > 1 ? "right" : "left",
                      margin: [0, 2, 0, 2],
                    }
              )
            ),
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#fee2e2" : null),
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
          margin: [0, 0, 0, 8],
        },
        { text: `Inactive stations: ${inactiveStations}`, margin: [0, 0, 0, 2] },
        { text: "Supply delays: N/A", margin: [0, 0, 0, 12] },

        {
          text: "Section 4: Daily / Weekly Trends",
          style: "sectionHeader",
          margin: [0, 0, 0, 8],
          pageBreak: "before",
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto"],
            body: weeklyTrendsTable.map((row) =>
              row.map((cell, j) =>
                typeof cell === "object" && cell.bold
                  ? {
                      ...cell,
                      fillColor: "#e0f2fe",
                      color: "#0369a1",
                      alignment: "center",
                      margin: [0, 2, 0, 2],
                    }
                  : {
                      text: String(cell),
                      alignment: j > 0 ? "right" : "left",
                      margin: [0, 2, 0, 2],
                    }
              )
            ),
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#e0f2fe" : null),
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
          margin: [0, 0, 0, 8],
        },
        { text: `Peak usage day: ${peakDay}`, margin: [0, 0, 0, 12] },
        {
          text:
            analytics.dailyUsage && analytics.dailyUsage.length > 0
              ? ""
              : "No daily/weekly trend data available for this period.",
          italics: true,
          color: "#64748b",
          margin: [0, 0, 0, 24],
        },

        {
          text: "Section 5: Fuel Type Comparison",
          style: "sectionHeader",
          margin: [0, 0, 0, 8],
          pageBreak: "before",
        },
        {
          text: `Petrol: ${petrolPct}%   Diesel: ${dieselPct}%`,
          style: "comparison",
          margin: [0, 0, 0, 12],
        },
        {
          text:
            totalFuel > 0
              ? `Total Petrol: ${formatNumber(petrolTotal)} L\nTotal Diesel: ${formatNumber(dieselTotal)} L\nTotal Fuel: ${formatNumber(totalFuel)} L`
              : "No fuel type data available for this period.",
          italics: totalFuel <= 0,
          color: totalFuel <= 0 ? "#64748b" : undefined,
          margin: [0, 0, 0, 24],
        },

        {
          text: "Section 6: Insights",
          style: "sectionHeader",
          margin: [0, 0, 0, 8],
          pageBreak: "before",
        },
        {
          ul: [
            { text: `Most active station: ${mostActiveStation || "N/A"}` },
            { text: `Highest demand day: ${peakDay}` },
            { text: "Recommendations:" },
            ...recommendations.map((r) => ({ text: r })),
          ],
        },
        {
          text:
            mostActiveStation || peakDay !== "N/A"
              ? ""
              : "No insights available for this period. Please ensure data is available for the selected month.",
          italics: true,
          color: "#64748b",
          margin: [0, 0, 0, 24],
        },
      ],
      styles: {
        govHeader: {
          fontSize: 16,
          bold: true,
          color: "#6d28d9",
          margin: [0, 0, 0, 2],
        },
        govSubHeader: {
          fontSize: 13,
          bold: true,
          color: "#6366f1",
          margin: [0, 0, 0, 2],
        },
        header: {
          fontSize: 20,
          bold: true,
          color: "#0f172a",
          margin: [0, 0, 0, 8],
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: "#6d28d9",
          margin: [0, 10, 0, 4],
        },
        comparison: {
          fontSize: 13,
          bold: true,
          color: "#0e7490",
        },
      },
      defaultStyle: { fontSize: 11 },
    };

    pdfMake.createPdf(docDefinition).download("Monthly_Fuel_Report.pdf");
  } catch (err) {
    alert("Failed to generate report.");
    console.error(err);
  }
}

export default function MonthlyReportGenerator() {
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    await generateMonthlyReportPDF();
    setLoading(false);
  };

}