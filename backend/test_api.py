import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vehicleinfo_backend.settings')
django.setup()

from rest_framework.test import APIClient
from api.models import Vehicle, Challan, Policy

client = APIClient()

print("--- Testing /api/quotes/ ---")
res = client.post('/api/quotes/', {
    'engine_capacity_cc': 349,
    'idv': 75000,
    'ncb_percent': 20,
    'selected_addons': ['zero_dep', 'pa_cover']
}, format='json')
assert res.status_code == 200, f"Quotes failed: {res.status_code} {res.data}"
print(f"Quotes received for {len(res.data['quotes'])} insurers. Base TP: ₹{res.data['tp_base_rate']}")
for q in res.data['quotes']:
    print(f" - {q['insurer_name']}: Net ₹{q['net_premium']}, GST ₹{q['gst_amount']}, Total ₹{q['total_premium']}")

print("\n--- Testing /api/vehicle/MH01AE8055/ ---")
res = client.get('/api/vehicle/MH01AE8055/')
assert res.status_code == 200, f"Vehicle failed: {res.status_code}"
print(f"Found vehicle: {res.data['maker_model']}, Masked Owner: {res.data['masked_owner']}, Insurance Status: {res.data['insurance_status']}")
print(f"Pending Challans: {res.data['pending_challans_count']}, Fine Total: ₹{res.data['pending_fines_total']}")

print("\n--- Testing /api/challans/ ---")
res = client.get('/api/challans/?reg_no=MH01AE8055')
assert res.status_code == 200
challans = res.data
print(f"Found {len(challans)} challans for MH01AE8055")
pending_id = next(c['id'] for c in challans if c['status'] == 'PENDING')

print(f"\n--- Testing /api/challan/{pending_id}/pay/ ---")
pay_res = client.put(f'/api/challan/{pending_id}/pay/')
assert pay_res.status_code == 200, f"Pay failed: {pay_res.status_code}"
print(f"Settled! Status: {pay_res.data['challan']['status']}, Ref: {pay_res.data['payment_reference']}")

print("\n--- Testing /api/checkout/ ---")
checkout_res = client.post('/api/checkout/', {
    'vehicle_reg_no': 'MH01AE8055',
    'owner_name': 'Rohit Sharma',
    'owner_email': 'rohit@example.com',
    'owner_phone': '+91 98200 99887',
    'insurer_name': 'Digit Insurance',
    'engine_capacity_cc': 349,
    'idv_amount': 75000.0,
    'ncb_percent': 20,
    'od_premium': 1092.0,
    'tp_premium': 1366.0,
    'addons_total': 892.5,
    'selected_addons': ['zero_dep', 'pa_cover'],
    'net_premium': 3350.5,
    'gst_amount': 603.09,
    'total_premium': 3953.59,
}, format='json')
assert checkout_res.status_code == 201, f"Checkout failed: {checkout_res.status_code} {checkout_res.data}"
print(f"Policy issued: {checkout_res.data['policy']['policy_number']}")

print("\n--- Testing /api/vault/ ---")
vault_res = client.get('/api/vault/')
assert vault_res.status_code == 200
print(f"Vault contains {len(vault_res.data)} policies")

print("\n--- Testing /api/mock-test/questions/ ---")
q_res = client.get('/api/mock-test/questions/')
assert q_res.status_code == 200
print(f"Received {len(q_res.data)} RTO questions")

print("\n--- Testing /api/mock-test/submit/ ---")
sub_res = client.post('/api/mock-test/submit/', {
    'submissions': [
        {'question_id': q_res.data[0]['id'], 'selected_index': 1},
        {'question_id': q_res.data[1]['id'], 'selected_index': 1},
        {'question_id': q_res.data[2]['id'], 'selected_index': 1},
    ]
}, format='json')
assert sub_res.status_code == 200
print(f"Exam Result: Score {sub_res.data['correct_answers']}/{sub_res.data['total_questions']} ({sub_res.data['percentage']}%), Result: {sub_res.data['result_status']}")

print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
