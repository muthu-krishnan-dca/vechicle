"""
Seed / Update genuine vehicle details directly into the database.
Usage:
    python seed_vehicle.py
or:
    python seed_vehicle.py <REG_NO> "<MAKER_MODEL>" "<OWNER_NAME>" <CC>
"""
import sys
import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vehicleinfo_backend.settings')
django.setup()

from api.models import Vehicle, Challan
from api.rto_data import resolve_rto_office
from api.rc_service import mask_string


def add_or_update_vehicle(reg_no, maker_model, owner_name, engine_cc=125, fuel_type="PETROL", vehicle_class="M-Cycle/Scooter(2WN)"):
    reg_clean = reg_no.replace(" ", "").replace("-", "").upper().strip()
    rto = resolve_rto_office(reg_clean)
    today = date.today()

    vehicle, created = Vehicle.objects.update_or_create(
        registration_number=reg_clean,
        defaults={
            "owner_name": owner_name.upper().strip(),
            "masked_owner": mask_string(owner_name),
            "maker_model": maker_model.strip(),
            "vehicle_class": vehicle_class,
            "fuel_type": fuel_type,
            "engine_capacity_cc": int(engine_cc),
            "registration_date": today - timedelta(days=700),
            "fitness_upto": today + timedelta(days=365 * 13),
            "insurance_upto": today + timedelta(days=280),
            "pucc_upto": today + timedelta(days=120),
            "rto_office": rto,
            "chassis_number_masked": f"MD625...{reg_clean[-4:]}",
            "engine_number_masked": f"JE35E...{reg_clean[-4:]}",
            "status": "ACTIVE",
        }
    )

    action = "Created new" if created else "Updated"
    print(f"SUCCESS: {action} vehicle {reg_clean}:")
    print(f"  Model: {vehicle.maker_model}")
    print(f"  Owner: {vehicle.owner_name} ({vehicle.masked_owner})")
    print(f"  Engine: {vehicle.engine_capacity_cc} CC")
    print(f"  RTO: {vehicle.rto_office}")
    print(f"  Status: {vehicle.status}")
    return vehicle


if __name__ == "__main__":
    if len(sys.argv) >= 4:
        reg = sys.argv[1]
        model = sys.argv[2]
        owner = sys.argv[3]
        cc = int(sys.argv[4]) if len(sys.argv) > 4 else 125
        add_or_update_vehicle(reg, model, owner, cc)
    else:
        print("--- Add / Update Real Vehicle Details ---")
        reg = input("Enter Registration Number (e.g. TN69BS3112): ").strip()
        if not reg:
            print("Registration number cannot be empty.")
            sys.exit(1)
        model = input("Enter Bike Maker & Model (e.g. Yamaha FZ-S / Royal Enfield 350 / Hero Splendor): ").strip()
        owner = input("Enter Owner Name: ").strip()
        cc_str = input("Enter Engine CC (e.g. 110, 125, 150, 350) [default 125]: ").strip()
        cc = int(cc_str) if cc_str.isdigit() else 125
        add_or_update_vehicle(reg, model, owner, cc)
