import { jsPDF } from 'jspdf';
import { ClaimAssessment, ClaimRecord } from './api';

export const generateClaimAssessmentPDF = (
  assessment: ClaimAssessment,
  claimInfo?: Partial<ClaimRecord>
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const regNo = claimInfo?.vehicle_reg_no || assessment.vehicle_details?.registration_number || 'VEHICLE';
  const claimNo = claimInfo?.claim_number || `CLM-2026-${regNo}-EST`;
  const model = assessment.vehicle_details?.maker_model || 'Two Wheeler / Private Vehicle';
  const owner = claimInfo?.driver_name || assessment.vehicle_details?.owner_name || 'Registered Policyholder';
  const policyNo = assessment.vehicle_details?.policy_number || `POL-${regNo}-ACTIVE`;
  const surveyor = claimInfo?.surveyor_name || 'K. Srinivasan (IRDAI Surveyor Lic #77419)';

  const primaryDark = [15, 23, 42];    // Slate 900
  const bannerBlue = [30, 58, 138];    // Blue 900
  const emeraldGreen = [16, 185, 129]; // Green 500
  const amberOrange = [217, 119, 6];   // Amber 600
  const crimsonRed = [220, 38, 38];    // Red 600

  // Outer Decorative Borders
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 194, 281);

  doc.setDrawColor(bannerBlue[0], bannerBlue[1], bannerBlue[2]);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, 190, 277);

  // Top Header Banner
  doc.setFillColor(bannerBlue[0], bannerBlue[1], bannerBlue[2]);
  doc.rect(10, 10, 190, 24, 'F');

  // Insurer / IRDAI Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('MOTOR VEHICLE INSURANCE CLAIM ASSESSMENT & SETTLEMENT SLIP', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Issued in compliance with IRDAI (Insurance Regulatory & Development Authority of India) Motor Tariff Rules', 15, 25);
  doc.text('Generated Date: ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 145, 25);

  let y = 42;

  // Title Box & Status Badge
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`CLAIM REFERENCE: ${claimNo}`, 15, y);

  // Status Pill
  const isApproved = assessment.approval_status === 'APPROVED';
  const isPending = assessment.approval_status === 'DOCUMENTS_PENDING';
  const statusBg = isApproved ? emeraldGreen : isPending ? amberOrange : crimsonRed;
  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.roundedRect(140, y - 5, 55, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isApproved ? 'STATUS: APPROVED' : isPending ? 'DOCS PENDING' : 'STATUS: REJECTED',
    144,
    y
  );

  y += 8;

  // Key Metadata Table (2 columns)
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, y, 186, 32, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE REGISTRATION:', 16, y + 6);
  doc.text('POLICY NUMBER:', 16, y + 13);
  doc.text('POLICY VALIDITY:', 16, y + 20);
  doc.text('ZERO-DEP ADDON:', 16, y + 27);

  doc.text('CLAIM SETTLEMENT MODE:', 105, y + 6);
  doc.text('OWNER / DRIVER NAME:', 105, y + 13);
  doc.text('VEHICLE AGE / CC:', 105, y + 20);
  doc.text('IRDAI SURVEYOR:', 105, y + 27);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(regNo + ` (${model})`, 55, y + 6);
  doc.text(policyNo, 55, y + 13);
  doc.text(
    (assessment.vehicle_details?.policy_start || 'Active') + ' to ' + (assessment.vehicle_details?.policy_end || 'Valid'),
    55,
    y + 20
  );
  doc.text(assessment.has_zero_dep ? 'YES (0% Depreciation Waived)' : 'NO (Standard IRDAI Scale)', 55, y + 27);

  doc.text(assessment.claim_type === 'CASHLESS' ? 'CASHLESS (Garage Direct)' : 'REIMBURSEMENT (Bank)', 148, y + 6);
  doc.text(owner, 148, y + 13);
  doc.text(`${assessment.vehicle_age_years} Years / Two Wheeler`, 148, y + 20);
  doc.text(surveyor, 148, y + 27);

  y += 38;

  // Itemized Parts Assessment Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('ITEMIZED DAMAGE ESTIMATE & DEPRECIATION BREAKDOWN', 15, y);

  y += 4;
  // Table Header
  doc.setFillColor(bannerBlue[0], bannerBlue[1], bannerBlue[2]);
  doc.rect(12, y, 186, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PART / COMPONENT DESCRIPTION', 16, y + 5);
  doc.text('CATEGORY', 80, y + 5);
  doc.text('CLAIMED (INR)', 110, y + 5);
  doc.text('DEP %', 140, y + 5);
  doc.text('DEP DEDUCTED', 155, y + 5);
  doc.text('NET APPROVED', 180, y + 5);

  y += 7;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  const parts = assessment.processed_parts || [];
  if (parts.length === 0) {
    doc.text('No damaged parts listed. General repair assessment only.', 16, y + 5);
    y += 7;
  } else {
    parts.slice(0, 8).forEach((p, idx) => {
      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(12, y, 186, 6.5, 'F');
      }

      doc.text(p.name.substring(0, 36), 16, y + 4.5);
      doc.text(p.category, 80, y + 4.5);
      doc.text(Number(p.claimed_amount).toLocaleString('en-IN'), 110, y + 4.5);
      doc.text(`${p.depreciation_percent}%`, 140, y + 4.5);
      doc.text(Number(p.depreciation_amount).toLocaleString('en-IN'), 155, y + 4.5);
      doc.text(Number(p.approved_amount).toLocaleString('en-IN'), 180, y + 4.5);

      y += 6.5;
    });
  }

  // Labour & Painting Row
  doc.setFillColor(241, 245, 249);
  doc.rect(12, y, 186, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Labour Charges (Tinkering, Dismantling & Painting Work)', 16, y + 4.5);
  doc.text('LABOUR', 80, y + 4.5);
  doc.text(Number(assessment.claimed_labour).toLocaleString('en-IN'), 110, y + 4.5);
  doc.text('0%', 140, y + 4.5);
  doc.text('0.00', 155, y + 4.5);
  doc.text(Number(assessment.approved_labour).toLocaleString('en-IN'), 180, y + 4.5);

  y += 10;

  // Financial Assessment Summary Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, y, 186, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('FINAL SETTLEMENT SUMMARY & DEDUCTION AUDIT', 16, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  // Left Column
  doc.text(`Total Gross Claimed (Parts + Labour):`, 16, y + 14);
  doc.text(`Total Material Depreciation Deducted:`, 16, y + 21);
  doc.text(`Compulsory Excess / Deductible (IRDAI Tariff):`, 16, y + 28);
  doc.text(`Goods & Services Tax (18% GST on Net):`, 16, y + 35);

  const totalGross = assessment.total_parts_claimed + assessment.claimed_labour;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${totalGross.toLocaleString('en-IN')}`, 85, y + 14);
  doc.text(`- Rs. ${assessment.total_parts_depreciation.toLocaleString('en-IN')}`, 85, y + 21);
  doc.text(`- Rs. ${assessment.excess_deducted.toLocaleString('en-IN')}`, 85, y + 28);
  doc.text(`+ Rs. ${assessment.gst_amount.toLocaleString('en-IN')}`, 85, y + 35);

  // Right Column Highlights
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(115, y + 10, 78, 28, 2, 2, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.rect(115, y + 10, 78, 28);

  doc.setTextColor(30, 58, 138);
  doc.setFontSize(8);
  doc.text('FINAL APPROVED SETTLEMENT (INSURER PAYABLE):', 118, y + 16);
  doc.setFontSize(14);
  doc.text(`Rs. ${assessment.final_settlement_amount.toLocaleString('en-IN')}`, 118, y + 24);

  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  doc.text(`Customer Liability (Dep + Deductible): Rs. ${assessment.customer_liability.toLocaleString('en-IN')}`, 118, y + 32);

  y += 48;

  // Statutory Notes & Rejection Warning
  if (assessment.approval_status === 'REJECTED') {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(252, 165, 165);
    doc.roundedRect(12, y, 186, 16, 2, 2, 'FD');
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('REJECTION NOTICE:', 16, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const reasonText = assessment.rejection_reasons.join(' ');
    doc.text(reasonText.substring(0, 110), 16, y + 10);
    y += 20;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Notice: Under Section 146 & 166 of Motor Vehicles Act 1988, claim settlement is subject to physical verification of chassis/engine numbers by the surveyor. Any misrepresentation of accident timeline or driver license invalidity voids the policy.',
      12,
      y,
      { maxWidth: 186 }
    );
    y += 14;
  }

  // Surveyor Signatures & Authorizations
  y = 250;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(15, y, 65, y);
  doc.line(80, y, 130, y);
  doc.line(145, y, 190, y);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Signature of Insured / Claimant', 15, y + 4);
  doc.text('Authorized Workshop / Dealer Stamp', 80, y + 4);
  doc.text('IRDAI Surveyor Seal & Signature', 145, y + 4);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Date: ' + new Date().toLocaleDateString('en-IN'), 15, y + 9);
  doc.text('Network Workshop Code: TN92-WS01', 80, y + 9);
  doc.text(surveyor, 145, y + 9);

  // Download Trigger
  const safeFilename = `IRDAI_Claim_Assessment_${regNo}_${claimNo}.pdf`;
  doc.save(safeFilename);
};
