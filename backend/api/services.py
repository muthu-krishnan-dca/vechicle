"""
IRDAI Standard Two-Wheeler Insurance Calculation Engine & Business Services.
"""
from decimal import Decimal, ROUND_HALF_UP


def get_third_party_premium(engine_capacity_cc: int) -> Decimal:
    """
    IRDAI Standard Mandated Third Party (TP) Motor Rates for Two-Wheelers:
    - Below 75 cc: ₹538
    - 75 cc to 150 cc: ₹714
    - 150 cc to 350 cc: ₹1,366
    - Exceeding 350 cc: ₹2,804
    """
    cc = int(engine_capacity_cc or 150)
    if cc < 75:
        return Decimal("538.00")
    elif 75 <= cc <= 150:
        return Decimal("714.00")
    elif 150 < cc <= 350:
        return Decimal("1366.00")
    else:
        return Decimal("2804.00")


INSURER_CONFIGS = [
    {
        "id": "digit",
        "name": "Digit Insurance",
        "short_name": "Digit",
        "multiplier": Decimal("0.0182"),
        "claim_settlement_ratio": "98.4%",
        "cashless_garages": "4,200+",
        "highlight": "Paperless instant claims & zero physical inspection",
        "tag": "Most Popular",
        "brand_color": "#ffaa00",
        "rating": 4.8,
    },
    {
        "id": "hdfc-ergo",
        "name": "HDFC ERGO General Insurance",
        "short_name": "HDFC ERGO",
        "multiplier": Decimal("0.0195"),
        "claim_settlement_ratio": "99.1%",
        "cashless_garages": "7,800+",
        "highlight": "Overnight repair guarantee & 24x7 roadside assist",
        "tag": "Highest Claim Ratio",
        "brand_color": "#004b87",
        "rating": 4.9,
    },
    {
        "id": "icici-lombard",
        "name": "ICICI Lombard General Insurance",
        "short_name": "ICICI Lombard",
        "multiplier": Decimal("0.0205"),
        "claim_settlement_ratio": "98.8%",
        "cashless_garages": "6,500+",
        "highlight": "Doorstep pickup & cashless claim settlement in 4 hours",
        "tag": "Fastest Settlement",
        "brand_color": "#e05a10",
        "rating": 4.7,
    },
    {
        "id": "bajaj-allianz",
        "name": "Bajaj Allianz General Insurance",
        "short_name": "Bajaj Allianz",
        "multiplier": Decimal("0.0188"),
        "claim_settlement_ratio": "98.6%",
        "cashless_garages": "5,900+",
        "highlight": "Motor OTS instant digital payout under 20 minutes",
        "tag": "Best Value",
        "brand_color": "#005691",
        "rating": 4.8,
    },
]

ADDON_DEFINITIONS = {
    "zero_dep": {
        "key": "zero_dep",
        "name": "Zero Depreciation",
        "tagline": "100% payout for fiber, glass, rubber and plastic parts with 0 deduction",
        "type": "percentage",
        "rate": Decimal("0.0075"),
        "min_fee": Decimal("450.00"),
    },
    "pa_cover": {
        "key": "pa_cover",
        "name": "Personal Accident Cover",
        "tagline": "Mandatory ₹15 Lakh accidental death & permanent disability cover",
        "type": "flat",
        "flat_price": Decimal("330.00"),
    },
    "rti": {
        "key": "rti",
        "name": "Return to Invoice (RTI)",
        "tagline": "Get full on-road purchase price back in case of total loss or theft",
        "type": "percentage",
        "rate": Decimal("0.0040"),
        "min_fee": Decimal("260.00"),
    },
    "engine_protect": {
        "key": "engine_protect",
        "name": "Engine Protection",
        "tagline": "Shields against water ingression, hydrostatic lock, and lube oil leakage",
        "type": "percentage",
        "rate": Decimal("0.0035"),
        "min_fee": Decimal("225.00"),
    },
    "consumables": {
        "key": "consumables",
        "name": "Consumables Cover",
        "tagline": "Covers engine oils, nuts, bolts, bearings, coolants and grease replacement",
        "type": "percentage",
        "rate": Decimal("0.0025"),
        "min_fee": Decimal("160.00"),
    },
    "ncb_retention": {
        "key": "ncb_retention",
        "name": "NCB Retention Protect",
        "tagline": "Retain up to 50% No Claim Bonus even after making a single claim",
        "type": "percentage",
        "rate": Decimal("0.0020"),
        "min_fee": Decimal("130.00"),
    },
}


def compute_addon_price(addon_key: str, idv: Decimal) -> Decimal:
    conf = ADDON_DEFINITIONS.get(addon_key)
    if not conf:
        return Decimal("0.00")
    if conf["type"] == "flat":
        return conf["flat_price"]
    val = (idv * conf["rate"]).quantize(Decimal("1.00"), rounding=ROUND_HALF_UP)
    return max(val, conf["min_fee"])


def calculate_quotes(engine_capacity_cc: int, idv: float, ncb_percent: int, selected_addons: list):
    """
    Computes quotes across all 4 insurers based on IRDAI standards.
    """
    idv_dec = Decimal(str(max(25000, min(150000, float(idv or 65000)))))
    ncb_pct = int(ncb_percent if ncb_percent in [0, 20, 35, 50] else 0)
    selected_addons = selected_addons or []

    tp_amount = get_third_party_premium(engine_capacity_cc)

    # Compute addons breakdown
    addons_breakdown = []
    addons_total = Decimal("0.00")
    for key, spec in ADDON_DEFINITIONS.items():
        price = compute_addon_price(key, idv_dec)
        is_selected = key in selected_addons
        if is_selected:
            addons_total += price
        addons_breakdown.append({
            "key": key,
            "name": spec["name"],
            "tagline": spec["tagline"],
            "price": float(price),
            "selected": is_selected,
        })

    quotes = []
    for insurer in INSURER_CONFIGS:
        # Own Damage Gross = IDV * Insurer Multiplier
        od_gross = (idv_dec * insurer["multiplier"]).quantize(Decimal("1.00"), rounding=ROUND_HALF_UP)
        # NCB Discount = OD Gross * (NCB% / 100)
        ncb_discount = (od_gross * Decimal(str(ncb_pct)) / Decimal("100")).quantize(Decimal("1.00"), rounding=ROUND_HALF_UP)
        od_net = max(Decimal("100.00"), od_gross - ncb_discount)

        net_premium = od_net + tp_amount + addons_total
        gst = (net_premium * Decimal("0.18")).quantize(Decimal("1.00"), rounding=ROUND_HALF_UP)
        total_premium = net_premium + gst

        quotes.append({
            "insurer_id": insurer["id"],
            "insurer_name": insurer["name"],
            "short_name": insurer["short_name"],
            "tag": insurer["tag"],
            "brand_color": insurer["brand_color"],
            "rating": insurer["rating"],
            "claim_settlement_ratio": insurer["claim_settlement_ratio"],
            "cashless_garages": insurer["cashless_garages"],
            "highlight": insurer["highlight"],
            "idv": float(idv_dec),
            "ncb_percent": ncb_pct,
            "od_gross": float(od_gross),
            "ncb_discount": float(ncb_discount),
            "od_net": float(od_net),
            "tp_amount": float(tp_amount),
            "addons_total": float(addons_total),
            "net_premium": float(net_premium),
            "gst_amount": float(gst),
            "total_premium": float(total_premium),
            "selected_addons": selected_addons,
        })

    return {
        "engine_capacity_cc": int(engine_capacity_cc),
        "idv": float(idv_dec),
        "ncb_percent": ncb_pct,
        "selected_addons": selected_addons,
        "addons_breakdown": addons_breakdown,
        "tp_base_rate": float(tp_amount),
        "quotes": quotes,
    }
