"""
IRDAI-Compliant Motor Vehicle Insurance Claim Assessment Engine.

Implements all standard business rules:
1. Policy Continuity & Validity Check (Accident date vs Active Coverage range)
2. Document Completeness Check (RC, DL, Policy, Estimate)
3. Depreciation Deductions:
   - Vehicle Age Scale (Metal parts): 0% to 50%
   - Material Type: Plastic/Rubber/Nylon/Battery/Tyre (50%), Fibre glass (30%), Glass (0%)
   - Zero-Depreciation Add-on: 0% deduction on all parts
4. Compulsory Excess / Deductible Deduction (Two-wheeler ₹100, Four-wheeler ₹1,000/₹2,000, Commercial ₹1,500)
5. 18% GST on Net Payable Parts & Labour
6. Settlement Amount (Insurer Payable) vs Customer Out-of-Pocket Liability
7. Cashless vs Reimbursement Claim Distribution
8. Previous Claim & Accident History Tracking
"""
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


# IRDAI Material-Based Depreciation Rates
MATERIAL_RATES = {
    'GLASS': Decimal('0.00'),       # Nil depreciation on glass
    'FIBRE': Decimal('0.30'),       # 30% on fibre glass components
    'PLASTIC': Decimal('0.50'),     # 50% on plastic parts
    'RUBBER': Decimal('0.50'),      # 50% on rubber / nylon
    'NYLON': Decimal('0.50'),       # 50%
    'BATTERY': Decimal('0.50'),     # 50% on battery
    'TYRE': Decimal('0.50'),        # 50% on tyres & tubes
}


def get_age_depreciation_rate(vehicle_age_years: float) -> Decimal:
    """
    Standard IRDAI scale for metal parts / chassis based on vehicle age.
    """
    if vehicle_age_years < 0.5:
        return Decimal('0.00')
    elif vehicle_age_years <= 1.0:
        return Decimal('0.05')
    elif vehicle_age_years <= 2.0:
        return Decimal('0.10')
    elif vehicle_age_years <= 3.0:
        return Decimal('0.15')
    elif vehicle_age_years <= 4.0:
        return Decimal('0.25')
    elif vehicle_age_years <= 5.0:
        return Decimal('0.35')
    elif vehicle_age_years <= 10.0:
        return Decimal('0.40')
    else:
        return Decimal('0.50')


def get_compulsory_excess(vehicle_class: str = "M-Cycle/Scooter(2WN)", engine_cc: int = 150) -> Decimal:
    """
    Returns standard compulsory excess (deductible) in INR according to IRDAI tariff.
    - Two-wheelers: ₹100
    - Private Cars / Four-wheelers (<= 1500cc): ₹1,000
    - Private Cars / Four-wheelers (> 1500cc): ₹2,000
    - Commercial / Heavy Goods / Passenger: ₹1,500
    """
    vclass = str(vehicle_class or '').upper()
    if 'CYCLE' in vclass or 'SCOOTER' in vclass or '2WN' in vclass or 'TWO WHEELER' in vclass or 'BIKE' in vclass:
        return Decimal('100.00')
    elif 'COMMERCIAL' in vclass or 'BUS' in vclass or 'TRUCK' in vclass or 'GOODS' in vclass:
        return Decimal('1500.00')
    else:
        # Four-wheelers / Cars
        if engine_cc > 1500:
            return Decimal('2000.00')
        return Decimal('1000.00')


def parse_date_safe(d: Any) -> Optional[date]:
    if not d:
        return None
    if isinstance(d, date):
        return d
    if isinstance(d, datetime):
        return d.date()
    d_str = str(d).strip()
    for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d'):
        try:
            return datetime.strptime(d_str, fmt).date()
        except ValueError:
            pass
    return None


def calculate_vehicle_age_years(reg_date: Optional[date], accident_date: date) -> float:
    if not reg_date or reg_date > accident_date:
        return 2.0  # Safe average fallback
    days = (accident_date - reg_date).days
    return max(0.0, days / 365.25)


def evaluate_claim_assessment(
    accident_date: date,
    policy_start_date: Optional[date],
    policy_end_date: Optional[date],
    has_zero_dep: bool,
    vehicle_class: str,
    engine_cc: int,
    vehicle_reg_date: Optional[date],
    claimed_parts: List[Dict[str, Any]],
    claimed_labour: Decimal,
    is_rc_submitted: bool = True,
    is_dl_submitted: bool = True,
    is_policy_submitted: bool = True,
    is_estimate_submitted: bool = True,
    claim_type: str = "CASHLESS",
    previous_claims_count: int = 0
) -> Dict[str, Any]:
    """
    Core calculation function for claim assessment.
    Returns status, itemized depreciation, compulsory deductible, GST, and final payout.
    """
    today = date.today()

    # 1. Policy Continuity & Validity Check
    rejection_reasons = []
    continuity_status = "VALID"

    if not policy_start_date or not policy_end_date:
        rejection_reasons.append("No active policy found covering this vehicle.")
        continuity_status = "POLICY_NOT_FOUND"
    elif accident_date < policy_start_date:
        rejection_reasons.append(
            f"Policy not in force at accident time. Accident occurred on {accident_date}, but policy coverage started on {policy_start_date}."
        )
        continuity_status = "ACCIDENT_BEFORE_POLICY_START"
    elif accident_date > policy_end_date:
        rejection_reasons.append(
            f"Policy was expired at the time of accident! Policy expired on {policy_end_date}, but incident happened on {accident_date}. As per Section 64VB of Insurance Act, no claim is payable on an expired policy."
        )
        continuity_status = "POLICY_EXPIRED"

    # 2. Document Verification Check
    missing_docs = []
    if not is_rc_submitted:
        missing_docs.append("Vehicle Registration Certificate (RC Copy)")
    if not is_dl_submitted:
        missing_docs.append("Valid Driver's License (DL Copy)")
    if not is_policy_submitted:
        missing_docs.append("Insurance Policy Document Copy")
    if not is_estimate_submitted:
        missing_docs.append("Authorized Workshop Repair Estimate")

    if missing_docs:
        rejection_reasons.append(f"Mandatory documents missing: {', '.join(missing_docs)}.")

    # 3. Decision Status
    if continuity_status in ("POLICY_EXPIRED", "ACCIDENT_BEFORE_POLICY_START", "POLICY_NOT_FOUND"):
        approval_status = "REJECTED"
    elif missing_docs:
        approval_status = "DOCUMENTS_PENDING"
    else:
        approval_status = "APPROVED"

    # 4. Depreciation Deductions Calculation
    vehicle_age_years = calculate_vehicle_age_years(vehicle_reg_date, accident_date)
    metal_dep_rate = get_age_depreciation_rate(vehicle_age_years)

    processed_parts = []
    total_parts_claimed = Decimal('0.00')
    total_parts_depreciation = Decimal('0.00')
    total_parts_approved = Decimal('0.00')

    for part in claimed_parts:
        part_name = part.get('name', 'Automotive Part')
        category = str(part.get('category', 'METAL')).upper()
        amount = Decimal(str(part.get('amount', 0)))
        total_parts_claimed += amount

        # Determine rate
        if has_zero_dep:
            dep_rate = Decimal('0.00')
            applied_rule = "Zero-Depreciation Add-on (0% Deducted)"
        elif category in ('PLASTIC', 'RUBBER', 'NYLON', 'BATTERY', 'TYRE'):
            dep_rate = MATERIAL_RATES.get(category, Decimal('0.50'))
            applied_rule = f"IRDAI Material Standard: {int(dep_rate * 100)}%"
        elif category == 'FIBRE':
            dep_rate = MATERIAL_RATES['FIBRE']
            applied_rule = "IRDAI Fibre Glass Standard: 30%"
        elif category == 'GLASS':
            dep_rate = MATERIAL_RATES['GLASS']
            applied_rule = "IRDAI Glass Standard: Nil (0%)"
        else:
            # Metal / Paint / Mechanical
            dep_rate = metal_dep_rate
            applied_rule = f"Vehicle Age Scale ({round(vehicle_age_years, 1)} yrs): {int(dep_rate * 100)}%"

        dep_amount = (amount * dep_rate).quantize(Decimal('0.01'))
        approved_amount = (amount - dep_amount).quantize(Decimal('0.01'))

        total_parts_depreciation += dep_amount
        total_parts_approved += approved_amount

        processed_parts.append({
            'name': part_name,
            'category': category,
            'claimed_amount': float(amount),
            'depreciation_percent': float(dep_rate * 100),
            'depreciation_amount': float(dep_amount),
            'approved_amount': float(approved_amount),
            'rule': applied_rule,
        })

    # Labour & Painting
    claimed_labour = Decimal(str(claimed_labour or 0))
    approved_labour = claimed_labour  # Standard labour is approved in full subject to excess

    # Subtotal Net
    net_assessed_before_excess = total_parts_approved + approved_labour

    # 5. Compulsory Excess / Deductible
    compulsory_excess = get_compulsory_excess(vehicle_class, engine_cc)
    if net_assessed_before_excess < compulsory_excess:
        excess_deducted = net_assessed_before_excess
    else:
        excess_deducted = compulsory_excess

    net_after_excess = max(Decimal('0.00'), net_assessed_before_excess - excess_deducted)

    # 6. GST (18%)
    gst_rate = Decimal('0.18')
    gst_amount = (net_after_excess * gst_rate).quantize(Decimal('0.01'))

    # Final Settlement
    if approval_status == "REJECTED":
        final_settlement = Decimal('0.00')
        customer_liability = total_parts_claimed + claimed_labour
    else:
        final_settlement = (net_after_excess + gst_amount).quantize(Decimal('0.01'))
        total_gross_claimed = total_parts_claimed + claimed_labour
        customer_liability = max(Decimal('0.00'), total_gross_claimed - final_settlement)

    # Previous claims & NCB impact
    ncb_loss_warning = None
    if previous_claims_count > 0:
        ncb_loss_warning = (
            f"Vehicle has {previous_claims_count} previous claim(s). "
            f"Filing this claim will reset the No Claim Bonus (NCB) to 0% upon next policy renewal."
        )

    # Cashless vs Reimbursement details
    if claim_type == "CASHLESS":
        settlement_mode_text = (
            "Cashless Settlement: The insurer pays the approved settlement amount directly to the "
            "authorized network garage. The customer only pays the compulsory excess and depreciation at vehicle delivery."
        )
    else:
        settlement_mode_text = (
            "Reimbursement Settlement: The customer pays the garage repair bill in full upfront and submits "
            "final bills & receipts. The insurer transfers the approved settlement directly to the customer's bank account."
        )

    return {
        'approval_status': approval_status,
        'continuity_status': continuity_status,
        'rejection_reasons': rejection_reasons,
        'claim_type': claim_type,
        'settlement_mode_text': settlement_mode_text,
        'vehicle_age_years': round(vehicle_age_years, 2),
        'has_zero_dep': has_zero_dep,
        'compulsory_excess': float(compulsory_excess),
        'excess_deducted': float(excess_deducted),
        'total_parts_claimed': float(total_parts_claimed),
        'total_parts_depreciation': float(total_parts_depreciation),
        'total_parts_approved': float(total_parts_approved),
        'claimed_labour': float(claimed_labour),
        'approved_labour': float(approved_labour),
        'net_assessed_before_excess': float(net_assessed_before_excess),
        'net_after_excess': float(net_after_excess),
        'gst_percent': 18,
        'gst_amount': float(gst_amount),
        'final_settlement_amount': float(final_settlement),
        'customer_liability': float(customer_liability),
        'processed_parts': processed_parts,
        'previous_claims_count': previous_claims_count,
        'ncb_loss_warning': ncb_loss_warning,
    }
