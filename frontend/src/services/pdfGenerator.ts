import { jsPDF } from 'jspdf';
import { PolicyRecord } from './api';

export const generatePolicyPDF = (policy: PolicyRecord) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [16, 185, 129]; // Emerald
  const darkBlue = [14, 116, 144]; // Cyan 700

  // Border & Header Frame
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 194, 281);

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, 190, 277);

  // Top Bar Accent
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(10, 10, 190, 22, 'F');

  // Emblem / Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(policy.insurer_name.toUpperCase(), 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('IRDAI Regn No. 158 / 2017 | CIN: U66010PN2016PLC167410 | Toll-Free: 1800-258-4242', 15, 26);

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CERTIFICATE OF INSURANCE CUM POLICY SCHEDULE', 105, 40, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('(Issued in accordance with Section 146 & 147 of the Motor Vehicles Act, 1988 read with Rule 51 of CMVR, 1989)', 105, 45, { align: 'center' });

  // Policy Reference Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 50, 182, 20, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Policy Number:', 18, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(policy.policy_number, 45, 57);

  doc.setFont('helvetica', 'bold');
  doc.text('Issue Date:', 125, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(policy.issued_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 145, 57);

  doc.setFont('helvetica', 'bold');
  doc.text('Period of Cover:', 18, 65);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text(`${policy.start_date} (00:00 hrs) to ${policy.end_date} (Midnight)`, 45, 65);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Plan Type:', 125, 65);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive 2-Wheeler', 145, 65);

  // Section 1: Insured Details
  let y = 78;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('1. INSURED & VEHICLE DETAILS', 17, y + 4.5);

  y += 10;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Insured Name:', 17, y);
  doc.setFont('helvetica', 'normal');
  doc.text(policy.owner_name, 45, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Regn No:', 110, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(policy.vehicle_reg_no, 140, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Contact Phone:', 17, y);
  doc.setFont('helvetica', 'normal');
  doc.text(policy.owner_phone, 45, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Engine Capacity:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${policy.engine_capacity_cc} CC`, 140, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Email Address:', 17, y);
  doc.setFont('helvetica', 'normal');
  doc.text(policy.owner_email, 45, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Class:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.text('Motorized Two-Wheeler (2WN)', 140, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Geographical Area:', 17, y);
  doc.setFont('helvetica', 'normal');
  doc.text('Anywhere within the Republic of India', 45, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Insured Declared Value:', 110, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${Number(policy.idv_amount).toLocaleString('en-IN')}`, 145, y);

  // Section 2: Premium Computation Schedule
  y += 12;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('2. IRDAI PREMIUM COMPUTATION BREAKDOWN (INR)', 17, y + 4.5);

  y += 10;
  // Table headers
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Coverage Description', 18, y + 4.5);
  doc.text('Tariff Basis / Rate', 110, y + 4.5);
  doc.text('Amount (INR)', 165, y + 4.5);

  const addRow = (label: string, basis: string, amount: string | number, isBold = false) => {
    y += 6.5;
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(isBold ? primaryColor[0] : 71, isBold ? primaryColor[1] : 85, isBold ? primaryColor[2] : 105);
    doc.text(label, 18, y + 4);
    doc.text(basis, 110, y + 4);
    doc.text(Number(amount).toFixed(2), 180, y + 4, { align: 'right' });
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 6, 196, y + 6);
  };

  addRow('Basic Own Damage (OD) Cover', `IDV x Multiplier`, policy.od_premium);
  addRow(`Less: No Claim Bonus (NCB)`, `${policy.ncb_percent}% NCB Discount`, `-${(Number(policy.od_premium) * (policy.ncb_percent / 100)).toFixed(2)}`);
  addRow('Basic Third Party (TP) Liability', `Displacement (${policy.engine_capacity_cc} cc)`, policy.tp_premium);

  const addons = Array.isArray(policy.selected_addons) ? policy.selected_addons : [];
  if (addons.length > 0) {
    addRow(`Add-on Covers (${addons.length} opted)`, addons.join(', '), policy.addons_total);
  }

  y += 3;
  addRow('NET PREMIUM (A)', 'OD + TP + Add-ons', policy.net_premium, true);
  addRow('Integrated Goods & Services Tax (IGST) (B)', '18.0% Mandated Tax', policy.gst_amount, false);

  // Total Row
  y += 7;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TOTAL PREMIUM PAYABLE (A + B)', 18, y + 5);
  doc.setTextColor(16, 185, 129);
  doc.text(`INR ${Number(policy.total_premium).toFixed(2)}`, 180, y + 5, { align: 'right' });

  // Section 3: Statutory Clauses & Limitations
  y += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('3. STATUTORY NOTICE & LIMITATIONS AS TO USE', 17, y + 4.5);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const clauses = [
    '• Limitation as to Use: The policy covers use for any purpose other than hire or reward, racing, pace-making, reliability trial, or speed testing.',
    '• Driver Clause: Any person including the insured provided that a person driving holds an effective driving licence at the time of the accident.',
    '• Compulsory Personal Accident Cover for Owner-Driver: CSI ₹15,00,000 for death or permanent total disability.',
    '• Jurisdiction: In the event of a dispute arising out of this policy, it shall be subject to the exclusive jurisdiction of the Courts in India.',
  ];
  clauses.forEach((line) => {
    doc.text(line, 17, y);
    y += 4.2;
  });

  // Stamp & Signatures Box
  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 28);

  // Mock QR Representation
  doc.setFillColor(15, 23, 42);
  doc.rect(20, y + 4, 20, 20);
  doc.setFillColor(255, 255, 255);
  doc.rect(23, y + 7, 5, 5, 'F');
  doc.rect(32, y + 7, 5, 5, 'F');
  doc.rect(23, y + 16, 5, 5, 'F');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('IRDAI VERIFIED', 30, y + 26, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Digitally Signed by Authorized Signatory', 80, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Digital Seal ID: VINFO-${policy.policy_number}`, 80, y + 13);
  doc.text(`Timestamp: ${new Date().toISOString()}`, 80, y + 18);
  doc.text('This is a computer generated certificate and does not require physical signature.', 80, y + 23);

  // Save PDF
  const filename = `${policy.policy_number}_Insurance_Certificate.pdf`;
  doc.save(filename);
  return filename;
};

export const generateInsuranceStatusPDF = (vehicle: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [37, 99, 235]; // Blue 600
  const darkSlate = [15, 23, 42];

  // Outer border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);

  // Top header background
  doc.setFillColor(37, 99, 235);
  doc.rect(10, 10, 190, 26, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PARIVAHAN SEWA - VEHICLE INSURANCE VALIDITY RECORD', 15, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Ministry of Road Transport & Highways, Govt. of India | National Vahan e-Register', 15, 28);

  // Status Badge
  const isValid = vehicle.insurance_status === 'ACTIVE' || vehicle.insurance_status === 'EXPIRING_SOON';
  const badgeColor = isValid ? [16, 185, 129] : [239, 68, 68];
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(140, 15, 52, 10, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`STATUS: ${vehicle.insurance_status || 'ACTIVE'}`, 166, 21.5, { align: 'center' });

  // Summary box
  let y = 46;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 36, 2, 2, 'FD');

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Registration Details', 18, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Registration Plate: ${vehicle.registration_number}`, 18, y + 16);
  doc.text(`Maker & Model: ${vehicle.maker_model}`, 18, y + 23);
  doc.text(`Registered Owner: ${vehicle.masked_owner || vehicle.owner_name}`, 18, y + 30);

  doc.text(`RTO Authority: ${vehicle.rto_office}`, 110, y + 16);
  doc.text(`Displacement: ${vehicle.engine_capacity_cc} CC`, 110, y + 23);
  doc.text(`Class & Fuel: ${vehicle.vehicle_class || '2WN'} (${vehicle.fuel_type || 'PETROL'})`, 110, y + 30);

  // Insurance validity detail section
  y = 90;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('INSURANCE POLICY & STATUTORY COMPLIANCE', 18, y + 5.5);

  y += 14;
  const rows = [
    ['Insurance Valid Upto', vehicle.insurance_upto || 'N/A', 'Insurance Company', 'Registered Parivahan Insurer'],
    ['Days to Expiry', `${vehicle.days_to_insurance_expiry || 0} Days Remaining`, 'Coverage Category', 'Comprehensive / Mandatory Third Party'],
    ['Registration Date', vehicle.registration_date || 'N/A', 'Fitness Valid Upto', vehicle.fitness_upto || 'N/A'],
    ['PUCC Status', vehicle.pucc_upto ? `Valid upto ${vehicle.pucc_upto}` : 'Active / Certified', 'Chassis / Engine', `${vehicle.chassis_number_masked || 'N/A'} / ${vehicle.engine_number_masked || 'N/A'}`],
    ['Pending Challans', vehicle.pending_challans_count === 0 ? 'No Pending Fines (Clean Record)' : `${vehicle.pending_challans_count} Pending Fines (\u20B9${vehicle.pending_fines_total})`, 'MV Act 1988 Compliance', isValid ? 'Compliant with Section 146' : 'Non-Compliant (Renewal Required)'],
  ];

  rows.forEach((r) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 182, 10, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(r[0] + ':', 18, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(String(r[1]), 58, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(r[2] + ':', 110, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(String(r[3]), 145, y + 6.5);

    y += 10;
  });

  // Statutory note
  y += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Note: As per Section 146 of the Motor Vehicles Act, 1988, holding valid third-party motor insurance is mandatory for all vehicles plying in public places across India.', 14, y, { maxWidth: 182 });

  // Verification stamp
  y += 16;
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Certified Parivahan E-Verification Record', 20, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Generated on: ${new Date().toLocaleString()} | Digital Seal: VINFO-${vehicle.registration_number}`, 20, y + 14);
  doc.text('This electronic status verification is valid for official checking and traffic clearance.', 20, y + 19);

  const filename = `${vehicle.registration_number}_Insurance_Verification.pdf`;
  doc.save(filename);
  return filename;
};
