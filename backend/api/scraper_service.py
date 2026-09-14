"""
Parivahan e-Challan & Vehicle RTO Scraper Service.
Directly communicates with official Parivahan portals without commercial API keys.
Handles session management, CAPTCHA streaming, automated query submission,
and permanent caching into MySQL database.
"""
import time
import uuid
import base64
import logging
import re
from datetime import datetime, date
import requests
from bs4 import BeautifulSoup
from django.core.cache import cache

from .rc_service import parse_datetime, parse_date, mask_string
from .rto_data import resolve_rto_office

logger = logging.getLogger(__name__)

# In-memory session store (with automatic expiration check)
_ACTIVE_SESSIONS = {}
SESSION_TTL_SECONDS = 300  # 5 minutes


def _cleanup_old_sessions():
    """Prune expired sessions older than 5 minutes."""
    now = time.time()
    expired = [k for k, v in _ACTIVE_SESSIONS.items() if now - v.get('created_at', 0) > SESSION_TTL_SECONDS]
    for k in expired:
        _ACTIVE_SESSIONS.pop(k, None)


def create_echallan_session() -> dict:
    """
    Initializes a new session on https://echallan.parivahan.gov.in/index/accused-challan.
    Extracts dateTime, randomSalt, hashKeyText, and downloads the CAPTCHA image.
    Returns session_id and Base64-encoded CAPTCHA image.
    """
    _cleanup_old_sessions()
    
    session = requests.Session()
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    url = "https://echallan.parivahan.gov.in/index/accused-challan"
    try:
        res = session.get(url, headers=headers, timeout=12)
        if res.status_code != 200:
            logger.error(f"Parivahan page returned HTTP {res.status_code}")
            return {"success": False, "error": f"Failed to load Parivahan portal (HTTP {res.status_code})"}

        soup = BeautifulSoup(res.text, 'html.parser')

        # Extract dateTime from ng-init or input
        date_time_val = None
        dt_inp = soup.find('input', {'id': 'dateTime'})
        if dt_inp and dt_inp.get('ng-init'):
            m = re.search(r"=\s*['\"]([^'\"]+)['\"]", dt_inp['ng-init'])
            if m:
                date_time_val = m.group(1)
        if not date_time_val:
            date_time_val = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Extract randomSalt from ng-init or input
        random_salt_val = None
        rs_inp = soup.find('input', {'id': 'randomSalt'})
        if rs_inp and rs_inp.get('ng-init'):
            m = re.search(r"=\s*['\"]([^'\"]+)['\"]", rs_inp['ng-init'])
            if m:
                random_salt_val = m.group(1)

        # Extract hashKeyText from inline JS
        hash_match = re.search(r"['\"]hashKeyText['\"]\s*:\s*['\"]([a-f0-9]+)['\"]", res.text)
        hash_key = hash_match.group(1) if hash_match else "c6745ad0e2edf04f00429457ebdbb58b"

        # Download CAPTCHA image using the same session
        captcha_url = "https://echallan.parivahan.gov.in/index/captcha-login"
        c_res = session.get(captcha_url, headers={**headers, 'Referer': url}, timeout=10)
        if c_res.status_code != 200 or len(c_res.content) < 100:
            return {"success": False, "error": "Failed to download CAPTCHA image"}

        # Encode image to Base64
        b64_image = f"data:image/jpeg;base64,{base64.b64encode(c_res.content).decode('utf-8')}"
        session_id = str(uuid.uuid4())

        _ACTIVE_SESSIONS[session_id] = {
            'session': session,
            'dateTime': date_time_val,
            'randomSalt': random_salt_val,
            'hashKeyText': hash_key,
            'created_at': time.time(),
        }

        return {
            "success": True,
            "session_id": session_id,
            "captcha_image": b64_image,
            "portal": "echallan.parivahan.gov.in"
        }

    except Exception as e:
        logger.error(f"Error initializing Parivahan session: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


def refresh_echallan_captcha(session_id: str) -> dict:
    """Refreshes the CAPTCHA image for an existing active session."""
    session_data = _ACTIVE_SESSIONS.get(session_id)
    if not session_data:
        # Create a new session if expired
        return create_echallan_session()

    session = session_data['session']
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://echallan.parivahan.gov.in/index/accused-challan',
    }
    try:
        captcha_url = "https://echallan.parivahan.gov.in/index/captcha-login"
        c_res = session.get(captcha_url, headers=headers, timeout=10)
        if c_res.status_code == 200 and len(c_res.content) > 100:
            b64_image = f"data:image/jpeg;base64,{base64.b64encode(c_res.content).decode('utf-8')}"
            session_data['created_at'] = time.time()
            return {
                "success": True,
                "session_id": session_id,
                "captcha_image": b64_image,
            }
    except Exception as e:
        logger.error(f"Error refreshing captcha: {e}")

    return create_echallan_session()


def query_echallan_parivahan(session_id: str, vehicle_no: str, captcha_text: str) -> dict:
    """
    Submits vehicle search with CAPTCHA to echallan.parivahan.gov.in.
    Parses and returns challan list, and automatically syncs to MySQL DB.
    """
    session_data = _ACTIVE_SESSIONS.get(session_id)
    if not session_data:
        return {
            "success": False,
            "error": "SESSION_EXPIRED",
            "message": "Verification session expired. Please refresh CAPTCHA and try again."
        }

    session = session_data['session']
    clean_plate = re.sub(r'[^A-Za-z0-9]', '', vehicle_no).upper()
    clean_captcha = captcha_text.strip()

    post_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://echallan.parivahan.gov.in',
        'Referer': 'https://echallan.parivahan.gov.in/index/accused-challan',
        'X-Requested-With': 'XMLHttpRequest',
    }

    payload = {
        'challans_no': '',
        'vehicles_no': clean_plate,
        'dl_no': '',
        'dateTime': session_data['dateTime'],
        'randomsalt': session_data['randomSalt'],
        'captcha': clean_captcha,
        'is_accussed': 'true',
        'hashKeyText': session_data['hashKeyText']
    }

    try:
        search_url = "https://echallan.parivahan.gov.in/index/search-challan"
        res = session.post(search_url, data=payload, headers=post_headers, timeout=15)
        
        if res.status_code != 200:
            return {
                "success": False,
                "error": f"Govt portal returned HTTP {res.status_code}",
                "message": "Parivahan portal temporarily busy. Please retry in a moment."
            }

        try:
            rdata = res.json()
        except Exception:
            return {
                "success": False,
                "error": "INVALID_RESPONSE",
                "message": "Unexpected response format from Parivahan portal."
            }

        status = rdata.get('status')
        msg = rdata.get('message', '')

        # 1. No Challans Found (Clean Record)
        if status == 'Failed' and msg == 'CHALLAN_NOT_FOUND':
            # Remove session as it was consumed
            _ACTIVE_SESSIONS.pop(session_id, None)
            return {
                "success": True,
                "status": "CLEAN",
                "vehicle_number": clean_plate,
                "total_challans": 0,
                "challans": [],
                "message": f"Great news! No pending or disposed challans found for {clean_plate} in Parivahan database."
            }

        # 2. Invalid CAPTCHA
        if status == 'Failed' and ('INVALID_CAPTCHA' in msg or 'captcha' in msg.lower()):
            # Refresh captcha for user retry
            refreshed = refresh_echallan_captcha(session_id)
            return {
                "success": False,
                "error": "INVALID_CAPTCHA",
                "message": "Incorrect CAPTCHA entered. Please enter the characters shown.",
                "new_captcha": refreshed.get('captcha_image')
            }

        # 3. Direct Results or Token Flow ('common')
        results = []
        if status == 'common' and rdata.get('token'):
            token = rdata.get('token')
            # Fetch detailed challan list
            detail_url = "https://echallan.parivahan.gov.in/api/get-challan-detail"
            param_data = {'randomSalt': token, 'is_accussed': True}
            d_res = session.post(
                detail_url,
                params={'data': param_data},
                headers=post_headers,
                timeout=15
            )
            if d_res.status_code == 200:
                d_json = d_res.json()
                results = d_json.get('results', [])
        elif isinstance(rdata.get('results'), list):
            results = rdata.get('results')

        # Parse and sync challans
        parsed_challans = []
        for item in results:
            parsed = parse_parivahan_result_item(item, clean_plate)
            if parsed:
                parsed_challans.append(parsed)

        # Sync to MySQL database
        if parsed_challans:
            save_scraped_challans_to_db(clean_plate, parsed_challans)

        _ACTIVE_SESSIONS.pop(session_id, None)
        return {
            "success": True,
            "status": "FOUND" if parsed_challans else "CLEAN",
            "vehicle_number": clean_plate,
            "total_challans": len(parsed_challans),
            "challans": parsed_challans,
            "message": f"Successfully retrieved {len(parsed_challans)} live challans from Parivahan."
        }

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": "TIMEOUT",
            "message": "Parivahan government server timed out. Please try again."
        }
    except Exception as e:
        logger.error(f"Error querying Parivahan eChallan: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


def parse_parivahan_result_item(item: dict, clean_plate: str) -> dict | None:
    """Parses single row returned from Parivahan portal."""
    if not isinstance(item, dict):
        return None

    challan_no = (item.get("challan_no") or item.get("challan_number") or "").strip()
    if not challan_no:
        return None

    raw_status = (item.get("challan_status") or item.get("status") or "").strip().lower()
    final_status = "PAID" if raw_status in ["disposed", "paid", "settled"] else "PENDING"

    offence_details = item.get("offence_details") or []
    names = []
    acts = []
    if isinstance(offence_details, list):
        for off in offence_details:
            if isinstance(off, dict):
                n = off.get("name", "").strip()
                a = off.get("act", "").strip()
                if n:
                    names.append(n.capitalize())
                if a:
                    acts.append(a)

    violation_title = ", ".join(names) if names else (item.get("remark") or "Traffic Rule Violation")
    violation_desc = " | ".join([f"{n} ({a})" for n, a in zip(names, acts)]) if len(names) == len(acts) and names else violation_title

    off_dt = parse_datetime(item.get("challan_date_time") or item.get("challan_date"))
    place = item.get("challan_place") or item.get("place") or "Traffic Police Jurisdiction"

    raw_fine = item.get("fine_imposed") or item.get("amount") or item.get("received_amount") or 500
    try:
        fine_digits = re.sub(r"[^\d.]", "", str(raw_fine))
        fine_amount = float(fine_digits) if fine_digits else 500.0
    except Exception:
        fine_amount = 500.0

    return {
        "challan_number": challan_no,
        "vehicle_reg_no": clean_plate,
        "violation_title": violation_title[:200],
        "violation_description": violation_desc,
        "offense_date": off_dt,
        "offense_place": place[:200],
        "fine_amount": fine_amount,
        "status": final_status,
        "payment_reference": item.get("receipt_no") if final_status == "PAID" else None,
        "paid_at": off_dt if final_status == "PAID" else None,
    }


def save_scraped_challans_to_db(reg_no: str, challan_list: list):
    """Finds or creates Vehicle, and saves scraped challans to MySQL."""
    from .models import Vehicle, Challan
    from .rc_service import fetch_original_vehicle_details

    vehicle = Vehicle.objects.filter(registration_number=reg_no).first()
    if not vehicle:
        v_details = fetch_original_vehicle_details(reg_no)
        if v_details:
            vehicle = Vehicle.objects.create(**v_details)

    if not vehicle:
        return

    for c in challan_list:
        try:
            Challan.objects.update_or_create(
                challan_number=c["challan_number"],
                defaults={
                    "vehicle": vehicle,
                    "violation_title": c["violation_title"],
                    "violation_description": c["violation_description"],
                    "offense_date": c["offense_date"],
                    "offense_place": c["offense_place"],
                    "fine_amount": c["fine_amount"],
                    "status": c["status"],
                    "paid_at": c.get("paid_at"),
                    "payment_reference": c.get("payment_reference"),
                }
            )
        except Exception as e:
            logger.error(f"Failed to save scraped challan to DB: {e}")
