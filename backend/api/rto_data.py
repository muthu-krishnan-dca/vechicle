"""
Indian RTO (Regional Transport Office) Directory & Code Resolver.
Maps state and district codes (e.g., TN-69, MH-01, DL-01, KA-05) to official RTO locations.
"""

RTO_CODES = {
    # Tamil Nadu (TN)
    "TN01": "TN-01 RTO Chennai Central (Ayanavaram), Tamil Nadu",
    "TN02": "TN-02 RTO Chennai North West (Anna Nagar), Tamil Nadu",
    "TN03": "TN-03 RTO Chennai North East (Tondiarpet), Tamil Nadu",
    "TN04": "TN-04 RTO Chennai East (Royapuram), Tamil Nadu",
    "TN05": "TN-05 RTO Chennai North (Kolathur), Tamil Nadu",
    "TN06": "TN-06 RTO Chennai South East (Mandaveli), Tamil Nadu",
    "TN07": "TN-07 RTO Chennai South (Thiruvanmiyur), Tamil Nadu",
    "TN09": "TN-09 RTO Chennai West (K.K. Nagar), Tamil Nadu",
    "TN10": "TN-10 RTO Chennai South West (Virugambakkam), Tamil Nadu",
    "TN11": "TN-11 RTO Tambaram, Chengalpattu, Tamil Nadu",
    "TN12": "TN-12 RTO Poonamallee, Chennai, Tamil Nadu",
    "TN14": "TN-14 RTO Sholinganallur, Chennai, Tamil Nadu",
    "TN18": "TN-18 RTO Red Hills, Chennai, Tamil Nadu",
    "TN20": "TN-20 RTO Tiruvallur, Tamil Nadu",
    "TN21": "TN-21 RTO Kanchipuram, Tamil Nadu",
    "TN22": "TN-22 RTO Meenambakkam, Chennai, Tamil Nadu",
    "TN23": "TN-23 RTO Vellore, Tamil Nadu",
    "TN24": "TN-24 RTO Krishnagiri, Tamil Nadu",
    "TN25": "TN-25 RTO Tiruvannamalai, Tamil Nadu",
    "TN28": "TN-28 RTO Namakkal North, Tamil Nadu",
    "TN29": "TN-29 RTO Dharmapuri, Tamil Nadu",
    "TN30": "TN-30 RTO Salem West, Tamil Nadu",
    "TN31": "TN-31 RTO Cuddalore, Tamil Nadu",
    "TN32": "TN-32 RTO Villupuram, Tamil Nadu",
    "TN33": "TN-33 RTO Erode East, Tamil Nadu",
    "TN34": "TN-34 RTO Tiruchengode, Tamil Nadu",
    "TN36": "TN-36 RTO Gobichettipalayam, Tamil Nadu",
    "TN37": "TN-37 RTO Coimbatore South, Tamil Nadu",
    "TN38": "TN-38 RTO Coimbatore North, Tamil Nadu",
    "TN39": "TN-39 RTO Tirupur North, Tamil Nadu",
    "TN40": "TN-40 RTO Mettupalayam, Tamil Nadu",
    "TN41": "TN-41 RTO Pollachi, Tamil Nadu",
    "TN42": "TN-42 RTO Tirupur South, Tamil Nadu",
    "TN43": "TN-43 RTO Ooty (Udhagamandalam), Nilgiris, Tamil Nadu",
    "TN45": "TN-45 RTO Tiruchirappalli West, Tamil Nadu",
    "TN46": "TN-46 RTO Perambalur, Tamil Nadu",
    "TN47": "TN-47 RTO Karur, Tamil Nadu",
    "TN48": "TN-48 RTO Srirangam (Trichy), Tamil Nadu",
    "TN49": "TN-49 RTO Thanjavur, Tamil Nadu",
    "TN50": "TN-50 RTO Tiruvarur, Tamil Nadu",
    "TN51": "TN-51 RTO Nagapattinam, Tamil Nadu",
    "TN52": "TN-52 RTO Sankari, Salem, Tamil Nadu",
    "TN54": "TN-54 RTO Salem East, Tamil Nadu",
    "TN55": "TN-55 RTO Pudukkottai, Tamil Nadu",
    "TN56": "TN-56 RTO Perundurai, Erode, Tamil Nadu",
    "TN57": "TN-57 RTO Dindigul, Tamil Nadu",
    "TN58": "TN-58 RTO Madurai South, Tamil Nadu",
    "TN59": "TN-59 RTO Madurai North, Tamil Nadu",
    "TN60": "TN-60 RTO Theni, Tamil Nadu",
    "TN61": "TN-61 RTO Ariyalur, Tamil Nadu",
    "TN63": "TN-63 RTO Sivagangai, Tamil Nadu",
    "TN64": "TN-64 RTO Madurai Central, Tamil Nadu",
    "TN65": "TN-65 RTO Ramanathapuram, Tamil Nadu",
    "TN66": "TN-66 RTO Coimbatore Central, Tamil Nadu",
    "TN67": "TN-67 RTO Virudhunagar, Tamil Nadu",
    "TN68": "TN-68 RTO Kumbakonam, Thanjavur, Tamil Nadu",
    "TN69": "TN-69 RTO Kovilpatti, Thoothukudi District, Tamil Nadu",
    "TN70": "TN-70 RTO Hosur, Krishnagiri, Tamil Nadu",
    "TN72": "TN-72 RTO Tirunelveli, Tamil Nadu",
    "TN73": "TN-73 RTO Ranipet, Tamil Nadu",
    "TN74": "TN-74 RTO Nagercoil, Kanyakumari, Tamil Nadu",
    "TN75": "TN-75 RTO Marthandam, Kanyakumari, Tamil Nadu",
    "TN76": "TN-76 RTO Tenkasi, Tamil Nadu",
    "TN77": "TN-77 RTO Attur, Salem, Tamil Nadu",
    "TN78": "TN-78 RTO Dharapuram, Tirupur, Tamil Nadu",
    "TN79": "TN-79 RTO Sankarankovil, Tenkasi, Tamil Nadu",
    "TN81": "TN-81 RTO Tiruchirappalli East, Tamil Nadu",
    "TN82": "TN-82 RTO Mayiladuthurai, Tamil Nadu",
    "TN83": "TN-83 RTO Vaniyambadi, Tirupattur, Tamil Nadu",
    "TN84": "TN-84 RTO Srivilliputhur, Virudhunagar, Tamil Nadu",
    "TN85": "TN-85 RTO Kundrathur, Chennai, Tamil Nadu",
    "TN86": "TN-86 RTO Erode West, Tamil Nadu",
    "TN88": "TN-88 RTO Namakkal South, Tamil Nadu",
    "TN90": "TN-90 RTO Melur, Madurai, Tamil Nadu",
    "TN91": "TN-91 RTO Virugambakkam (South West), Chennai, Tamil Nadu",
    "TN92": "TN-92 RTO Thiruchendur, Thoothukudi, Tamil Nadu",
    "TN93": "TN-93 RTO Mettur, Salem, Tamil Nadu",
    "TN94": "TN-94 RTO Palani, Dindigul, Tamil Nadu",
    "TN95": "TN-95 RTO Sivakasi, Virudhunagar, Tamil Nadu",
    "TN96": "TN-96 RTO Manapparai, Tiruchirappalli, Tamil Nadu",
    "TN99": "TN-99 RTO Coimbatore West, Tamil Nadu",

    # Maharashtra (MH)
    "MH01": "MH-01 RTO Mumbai Central (Tardeo), Maharashtra",
    "MH02": "MH-02 RTO Mumbai West (Andheri), Maharashtra",
    "MH03": "MH-03 RTO Mumbai East (Wadala), Maharashtra",
    "MH04": "MH-04 RTO Thane, Maharashtra",
    "MH05": "MH-05 RTO Kalyan, Maharashtra",
    "MH12": "MH-12 RTO Pune, Maharashtra",
    "MH14": "MH-14 RTO Pimpri-Chinchwad, Maharashtra",
    "MH43": "MH-43 RTO Navi Mumbai (Vashi), Maharashtra",
    "MH46": "MH-46 RTO Navi Mumbai (Panvel), Maharashtra",
    "MH47": "MH-47 RTO Mumbai North (Borivali), Maharashtra",

    # Delhi (DL)
    "DL01": "DL-01 RTO Mall Road, North Delhi",
    "DL02": "DL-02 RTO IP Estate, New Delhi",
    "DL03": "DL-03 RTO Sheikh Sarai, South Delhi",
    "DL04": "DL-04 RTO Janakpuri, West Delhi",
    "DL05": "DL-05 RTO Loni Road, North East Delhi",
    "DL06": "DL-06 RTO Sarai Kale Khan, Central Delhi",
    "DL07": "DL-07 RTO Mayur Vihar, East Delhi",
    "DL08": "DL-08 RTO Wazirpur, North West Delhi",
    "DL09": "DL-09 RTO Palam, South West Delhi",
    "DL10": "DL-10 RTO Raja Garden, West Delhi",

    # Karnataka (KA)
    "KA01": "KA-01 RTO Koramangala (Bangalore Central), Karnataka",
    "KA02": "KA-02 RTO Rajajinagar (Bangalore West), Karnataka",
    "KA03": "KA-03 RTO Indiranagar (Bangalore East), Karnataka",
    "KA04": "KA-04 RTO Yeshwanthpur (Bangalore North), Karnataka",
    "KA05": "KA-05 RTO Jayanagar (Bangalore South), Karnataka",
    "KA51": "KA-51 RTO Electronics City (Bangalore South East), Karnataka",
    "KA53": "KA-53 RTO K.R. Puram (Bangalore East), Karnataka",

    # Kerala (KL)
    "KL01": "KL-01 RTO Thiruvananthapuram, Kerala",
    "KL07": "KL-07 RTO Ernakulam (Kochi), Kerala",
    "KL11": "KL-11 RTO Kozhikode (Calicut), Kerala",

    # Andhra Pradesh & Telangana
    "AP09": "AP-09 RTO Vijayawada, Andhra Pradesh",
    "AP39": "AP-39 RTO Visakhapatnam, Andhra Pradesh",
    "TS09": "TS-09 RTO Hyderabad Central (Khairatabad), Telangana",
    "TS10": "TS-10 RTO Secunderabad, Telangana",
}

STATE_NAMES = {
    "TN": "Tamil Nadu",
    "MH": "Maharashtra",
    "DL": "Delhi",
    "KA": "Karnataka",
    "KL": "Kerala",
    "AP": "Andhra Pradesh",
    "TS": "Telangana",
    "GJ": "Gujarat",
    "RJ": "Rajasthan",
    "UP": "Uttar Pradesh",
    "WB": "West Bengal",
    "MP": "Madhya Pradesh",
    "HR": "Haryana",
    "PB": "Punjab",
    "CH": "Chandigarh",
    "OD": "Odisha",
    "AS": "Assam",
    "BR": "Bihar",
    "JH": "Jharkhand",
    "GA": "Goa",
    "UK": "Uttarakhand",
    "HP": "Himachal Pradesh",
}


def resolve_rto_office(reg_no: str) -> str:
    """Extracts RTO office string from vehicle registration plate."""
    cleaned = reg_no.replace(" ", "").replace("-", "").upper().strip()
    if len(cleaned) >= 4:
        code = cleaned[:4]
        if code in RTO_CODES:
            return RTO_CODES[code]
    if len(cleaned) >= 2:
        st_code = cleaned[:2]
        st_name = STATE_NAMES.get(st_code, "India")
        num = cleaned[2:4] if len(cleaned) >= 4 and cleaned[2:4].isdigit() else "01"
        return f"{st_code}-{num} RTO Transport Authority, {st_name}"
    return "National RTO Transport Authority, India"
