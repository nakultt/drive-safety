from __future__ import annotations

"""
PACER Report Service
Generates PDF reports using ReportLab with embedded matplotlib charts.
"""

import io
import logging
from datetime import datetime, timezone

import os
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib_cache")

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    Image as RLImage,
)

logger = logging.getLogger(__name__)


def _create_trend_chart(daily_counts: list[dict]) -> io.BytesIO:
    """Create a daily trend line chart and return as bytes buffer."""
    if not daily_counts:
        # Empty chart
        fig, ax = plt.subplots(figsize=(6, 3))
        ax.text(0.5, 0.5, "No data available", ha="center", va="center", fontsize=12)
        ax.set_title("Daily Violation Trend")
    else:
        dates = [d["date"] for d in daily_counts]
        counts = [d["count"] for d in daily_counts]

        fig, ax = plt.subplots(figsize=(6, 3))
        ax.plot(dates, counts, marker="o", linewidth=2, color="#2196F3", markersize=4)
        ax.fill_between(dates, counts, alpha=0.15, color="#2196F3")
        ax.set_title("Daily Violation Trend", fontsize=12, fontweight="bold")
        ax.set_xlabel("Date")
        ax.set_ylabel("Violations")
        ax.grid(True, alpha=0.3)

        # Rotate x labels if many dates
        if len(dates) > 7:
            plt.xticks(rotation=45, ha="right")

    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150)
    plt.close(fig)
    buf.seek(0)
    return buf


def generate_pdf_report(
    report_data: dict,
    output_buffer: io.BytesIO,
) -> io.BytesIO:
    """
    Generate a PDF report with summary stats, violation tables, top vehicles, and trend chart.
    
    Args:
        report_data: Dict containing start_date, end_date, total_violations, by_type,
                     by_status, top_vehicles, daily_counts
        output_buffer: BytesIO buffer to write the PDF to
    
    Returns:
        The output_buffer with PDF content written
    """
    doc = SimpleDocTemplate(
        output_buffer,
        pagesize=A4,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=18,
        textColor=colors.HexColor("#1a237e"),
        spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#283593"),
        spaceBefore=15,
        spaceAfter=8,
    )
    body_style = styles["Normal"]

    elements = []

    # Title
    elements.append(Paragraph("PACER Violation Report", title_style))
    elements.append(Paragraph(
        f"Period: {report_data.get('start_date', 'N/A')} to {report_data.get('end_date', 'N/A')}",
        body_style,
    ))
    elements.append(Paragraph(
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        body_style,
    ))
    elements.append(Spacer(1, 15))

    # Summary stats table
    elements.append(Paragraph("Summary Statistics", heading_style))
    total = report_data.get("total_violations", 0)
    by_type = report_data.get("by_type", {})
    by_status = report_data.get("by_status", {})

    summary_data = [
        ["Metric", "Value"],
        ["Total Violations", str(total)],
    ]
    for vtype, count in sorted(by_type.items(), key=lambda x: -x[1]):
        summary_data.append([vtype.replace("_", " ").title(), str(count)])

    summary_table = Table(summary_data, colWidths=[3.5 * inch, 2 * inch])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f5f5f5")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 15))

    # Status breakdown
    if by_status:
        elements.append(Paragraph("Status Breakdown", heading_style))
        status_data = [["Status", "Count"]]
        for status, count in sorted(by_status.items(), key=lambda x: -x[1]):
            status_data.append([status.title(), str(count)])

        status_table = Table(status_data, colWidths=[3.5 * inch, 2 * inch])
        status_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#283593")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(status_table)
        elements.append(Spacer(1, 15))

    # Top vehicles by risk
    top_vehicles = report_data.get("top_vehicles", [])
    if top_vehicles:
        elements.append(Paragraph("Top Vehicles by Risk Score", heading_style))
        vehicle_data = [["Number Plate", "Risk Score", "Risk Level", "Total Violations"]]
        for v in top_vehicles[:10]:
            vehicle_data.append([
                v.get("number_plate", "N/A"),
                str(v.get("risk_score", 0)),
                v.get("risk_level", "N/A").title(),
                str(v.get("total_violations", 0)),
            ])

        vehicle_table = Table(vehicle_data, colWidths=[2 * inch, 1.2 * inch, 1.2 * inch, 1.5 * inch])
        vehicle_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#283593")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(vehicle_table)
        elements.append(Spacer(1, 15))

    # Daily trend chart
    daily_counts = report_data.get("daily_counts", [])
    elements.append(Paragraph("Daily Trend", heading_style))
    chart_buf = _create_trend_chart(daily_counts)
    chart_img = RLImage(chart_buf, width=5.5 * inch, height=2.75 * inch)
    elements.append(chart_img)

    # Build PDF
    doc.build(elements)
    output_buffer.seek(0)
    return output_buffer
