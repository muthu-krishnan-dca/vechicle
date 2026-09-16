from decimal import Decimal
import uuid
from datetime import date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404

from django.db.models import Q, Sum
from .models import Vehicle, Challan, Policy, RTOQuestion, Claim
from .serializers import (
    VehicleSerializer,
    ChallanSerializer,
    PolicySerializer,
    RTOQuestionSerializer,
    RTOQuestionDetailSerializer,
    QuoteRequestSerializer,
    CheckoutRequestSerializer,
    ClaimSerializer,
    ClaimCalculationRequestSerializer,
)
from .services import calculate_quotes, ADDON_DEFINITIONS
from .rto_data import resolve_rto_office
from .rc_service import (
    fetch_original_vehicle_details,
    fetch_live_challans,
    sync_challans_to_db,
    mask_string,
    parse_date,
)
from .claim_service import evaluate_claim_assessment, parse_date_safe
from .scraper_service import (
    create_echallan_session,
    refresh_echallan_captcha,
    query_echallan_parivahan,
)


def clean_reg_no(reg_no: str) -> str:
    """Normalize Indian registration number plate: strip spaces, hyphens, uppercase."""
    return reg_no.replace(" ", "").replace("-", "").upper().strip()


class QuoteCalculatorView(APIView):
    """
    POST /api/quotes/
    Calculates live quotes across 4 insurers based on IRDAI two-wheeler standards.
    """
    def post(self, request):
        serializer = QuoteRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        result = calculate_quotes(
            engine_capacity_cc=data['engine_capacity_cc'],
            idv=data['idv'],
            ncb_percent=data['ncb_percent'],
            selected_addons=data.get('selected_addons', []),
        )
        return Response(result, status=status.HTTP_200_OK)


class VehicleRCView(APIView):
    """
    GET /api/vehicle/<reg_no>/
    Parivahan Vahan RC status lookup. Connects to live external Parivahan API if configured,
    or retrieves from database cache.

    POST /api/vehicle/ or PUT /api/vehicle/<reg_no>/
    Add or update original vehicle details directly.
    """
    def get(self, request, reg_no=None):
        if not reg_no:
            search = request.query_params.get('search', '').strip()
            qs = Vehicle.objects.all()
            if search:
                clean_s = clean_reg_no(search)
                qs = qs.filter(
                    Q(registration_number__icontains=clean_s) |
                    Q(owner_name__icontains=search) |
                    Q(maker_model__icontains=search) |
                    Q(rto_office__icontains=search)
                )
            vehicles = qs.order_by('-created_at')[:150]
            serializer = VehicleSerializer(vehicles, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        cleaned = clean_reg_no(reg_no)
        refresh = request.query_params.get('refresh', '').lower() == 'true'

        vehicle = Vehicle.objects.filter(registration_number=cleaned).first()

        # If not in database or live refresh requested, attempt live Parivahan RTO API lookup
        if not vehicle or refresh:
            live_details = fetch_original_vehicle_details(cleaned)
            if live_details:
                if vehicle:
                    for attr, val in live_details.items():
                        setattr(vehicle, attr, val)
                    vehicle.save()
                else:
                    vehicle = Vehicle.objects.create(**live_details)

        if not vehicle:
            return Response(
                {
                    "error": f"Original vehicle details for {cleaned} not found.",
                    "registration_number": cleaned,
                    "rto_office": resolve_rto_office(cleaned),
                    "message": "To fetch 100% original live data for ANY vehicle in India, add your RAPIDAPI_KEY to backend settings or enter vehicle details.",
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if vehicle and (vehicle.challans.count() == 0 or refresh):
            live_challans = fetch_live_challans(cleaned)
            if live_challans:
                sync_challans_to_db(vehicle, live_challans)

        serializer = VehicleSerializer(vehicle)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, reg_no):
        cleaned = clean_reg_no(reg_no)
        vehicle = Vehicle.objects.filter(registration_number=cleaned).first()
        if not vehicle:
            return Response({"error": f"Vehicle {cleaned} not found."}, status=status.HTTP_404_NOT_FOUND)
        vehicle.delete()
        return Response({"message": f"Vehicle {cleaned} deleted successfully."}, status=status.HTTP_200_OK)

    def post(self, request, reg_no=None):
        """Register or update genuine vehicle details manually."""
        return self._save_vehicle(request, reg_no)

    def put(self, request, reg_no=None):
        """Update genuine vehicle details manually."""
        return self._save_vehicle(request, reg_no)

    def _save_vehicle(self, request, reg_no=None):
        data = request.data.copy()
        if reg_no:
            data['registration_number'] = clean_reg_no(reg_no)
        elif 'registration_number' in data:
            data['registration_number'] = clean_reg_no(data['registration_number'])

        reg = data.get('registration_number')
        if not reg or len(reg) < 4:
            return Response({"error": "A valid registration_number plate is required."}, status=status.HTTP_400_BAD_REQUEST)

        today = date.today()

        def safe_parse_date(val, default):
            if not val or not str(val).strip():
                return default
            try:
                if isinstance(val, date):
                    return val
                return parse_date(str(val).strip())
            except Exception:
                return default

        owner_name = (data.get('owner_name') or 'REGISTERED OWNER').strip().upper()
        masked_owner = data.get('masked_owner')
        if not masked_owner or not str(masked_owner).strip():
            masked_owner = mask_string(owner_name)

        try:
            engine_cc = int(data.get('engine_capacity_cc') or 125)
            if engine_cc <= 0:
                engine_cc = 125
        except (ValueError, TypeError):
            engine_cc = 125

        reg_date = safe_parse_date(data.get('registration_date'), today - timedelta(days=365))
        fitness_date = safe_parse_date(data.get('fitness_upto'), today + timedelta(days=365 * 14))
        ins_date = safe_parse_date(data.get('insurance_upto'), today + timedelta(days=180))
        pucc_date = safe_parse_date(data.get('pucc_upto'), today + timedelta(days=90))

        rto = (data.get('rto_office') or '').strip()
        if not rto:
            rto = resolve_rto_office(reg)

        chassis = (data.get('chassis_number_masked') or '').strip()
        if not chassis:
            chassis = f"MD625{reg[:4] if len(reg) >= 4 else 'TN01'}8841"

        engine = (data.get('engine_number_masked') or '').strip()
        if not engine:
            engine = f"JE35E{reg[-4:] if len(reg) >= 4 else '1234'}2190"

        maker_model = (data.get('maker_model') or '').strip()
        if not maker_model:
            maker_model = 'Two Wheeler'

        veh_class = (data.get('vehicle_class') or '').strip()
        if not veh_class:
            veh_class = 'M-Cycle/Scooter(2WN)'

        fuel_type = (data.get('fuel_type') or 'PETROL').strip().upper()
        if fuel_type not in ['PETROL', 'DIESEL', 'ELECTRIC', 'CNG', 'HYBRID']:
            fuel_type = 'PETROL'

        status_val = (data.get('status') or 'ACTIVE').strip().upper()

        defaults = {
            'owner_name': owner_name,
            'masked_owner': masked_owner,
            'maker_model': maker_model,
            'vehicle_class': veh_class,
            'fuel_type': fuel_type,
            'engine_capacity_cc': engine_cc,
            'registration_date': reg_date,
            'fitness_upto': fitness_date,
            'insurance_upto': ins_date,
            'pucc_upto': pucc_date,
            'rto_office': rto,
            'chassis_number_masked': chassis,
            'engine_number_masked': engine,
            'status': status_val,
        }

        vehicle, created = Vehicle.objects.update_or_create(
            registration_number=reg,
            defaults=defaults
        )

        serializer = VehicleSerializer(vehicle)
        return Response(
            {
                "message": f"Vehicle {reg} saved successfully to database.",
                "created": created,
                "vehicle": serializer.data
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class ChallanListView(APIView):
    """
    GET /api/challans/?reg_no=...&status=...
    Lists traffic challans.
    Connects to Masters India SBT ECHALLAN API (and RapidAPI fallback) to fetch live challans
    when vehicle has no cached records or refresh=true.
    """
    def get(self, request):
        reg_no = request.query_params.get('reg_no')
        status_param = request.query_params.get('status')
        refresh = request.query_params.get('refresh', '').lower() == 'true'

        if reg_no:
            cleaned = clean_reg_no(reg_no)
            vehicle = Vehicle.objects.filter(registration_number=cleaned).first()
            if not vehicle:
                v_details = fetch_original_vehicle_details(cleaned)
                if v_details:
                    vehicle = Vehicle.objects.create(**v_details)

            existing_count = Challan.objects.filter(vehicle__registration_number=cleaned).count() if vehicle else 0
            if (existing_count == 0 or refresh) and vehicle:
                live_challans = fetch_live_challans(cleaned)
                if live_challans:
                    sync_challans_to_db(vehicle, live_challans)

            queryset = Challan.objects.filter(vehicle__registration_number=cleaned).order_by('-offense_date')
        else:
            queryset = Challan.objects.all().order_by('-offense_date')

        if status_param and status_param.upper() in ['PENDING', 'PAID']:
            queryset = queryset.filter(status=status_param.upper())

        serializer = ChallanSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChallanPayView(APIView):
    """
    PUT /api/challan/<id>/pay/
    Instant traffic fine online payment settlement.
    """
    def put(self, request, pk):
        challan = get_object_or_404(Challan, pk=pk)
        if challan.status == 'PAID':
            return Response(
                {
                    "message": "This challan has already been paid and settled.",
                    "challan": ChallanSerializer(challan).data
                },
                status=status.HTTP_200_OK
            )

        payment_ref = f"PAY-VINFO-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        challan.status = 'PAID'
        challan.paid_at = timezone.now()
        challan.payment_reference = payment_ref
        challan.save()

        serializer = ChallanSerializer(challan)
        return Response(
            {
                "message": "Traffic fine settled successfully. Official Parivahan receipt generated.",
                "payment_reference": payment_ref,
                "paid_at": challan.paid_at,
                "challan": serializer.data,
            },
            status=status.HTTP_200_OK
        )


class CheckoutPolicyView(APIView):
    """
    POST /api/checkout/
    Issues an instant digital policy, stores in Vault, and updates vehicle insurance status.
    """
    def post(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        reg_no = clean_reg_no(data['vehicle_reg_no'])
        insurer_prefix = data['insurer_name'].split()[0].upper()[:4]
        policy_num = f"POL-{insurer_prefix}-{timezone.now().year}-{uuid.uuid4().hex[:8].upper()}"

        start_date = date.today()
        end_date = start_date + timedelta(days=365)

        policy = Policy.objects.create(
            policy_number=policy_num,
            vehicle_reg_no=reg_no,
            owner_name=data['owner_name'],
            owner_email=data['owner_email'],
            owner_phone=data['owner_phone'],
            insurer_name=data['insurer_name'],
            plan_name=data.get('plan_name', 'Comprehensive Two-Wheeler Insurance'),
            engine_capacity_cc=data['engine_capacity_cc'],
            idv_amount=data['idv_amount'],
            ncb_percent=data['ncb_percent'],
            od_premium=data['od_premium'],
            tp_premium=data['tp_premium'],
            addons_total=data['addons_total'],
            selected_addons=data['selected_addons'],
            net_premium=data['net_premium'],
            gst_amount=data['gst_amount'],
            total_premium=data['total_premium'],
            start_date=start_date,
            end_date=end_date,
        )

        # Synchronize vehicle insurance validity in Vehicle database if vehicle exists
        vehicle = Vehicle.objects.filter(registration_number=reg_no).first()
        if vehicle:
            vehicle.insurance_upto = end_date
            vehicle.save()

        return Response(
            {
                "message": "Policy issued successfully! Digital certificate saved in your Vault.",
                "policy": PolicySerializer(policy).data,
            },
            status=status.HTTP_201_CREATED
        )


class PolicyVaultView(APIView):
    """
    GET /api/vault/
    GET /api/vault/<reg_no>/
    Retrieves stored policies from the digital vault.
    """
    def get(self, request, reg_no=None):
        if reg_no:
            cleaned = clean_reg_no(reg_no)
            policies = Policy.objects.filter(vehicle_reg_no=cleaned)
        else:
            q = request.query_params.get('search')
            if q:
                clean_q = clean_reg_no(q)
                policies = Policy.objects.filter(vehicle_reg_no__icontains=clean_q) | Policy.objects.filter(policy_number__icontains=q)
            else:
                policies = Policy.objects.all()

        serializer = PolicySerializer(policies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RTOMockExamQuestionsView(APIView):
    """
    GET /api/mock-test/questions/
    Returns official RTO questions for practice test.
    """
    def get(self, request):
        questions = RTOQuestion.objects.all()
        serializer = RTOQuestionDetailSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RTOMockExamSubmitView(APIView):
    """
    POST /api/mock-test/submit/
    Evaluates exam answers according to Parivahan 60% passing criterion.
    """
    def post(self, request):
        submissions = request.data.get('submissions', [])
        # submissions format: [{"question_id": 1, "selected_index": 2}, ...]

        total = len(submissions)
        if total == 0:
            return Response({"error": "No answers provided."}, status=status.HTTP_400_BAD_REQUEST)

        score = 0
        detailed_results = []
        for item in submissions:
            qid = item.get('question_id')
            chosen = item.get('selected_index')
            question = RTOQuestion.objects.filter(pk=qid).first()
            if not question:
                continue

            is_correct = (chosen == question.correct_index)
            if is_correct:
                score += 1

            detailed_results.append({
                "question_id": question.id,
                "question_text": question.question_text,
                "sign_code": question.sign_code,
                "category": question.category,
                "options": question.options,
                "selected_index": chosen,
                "correct_index": question.correct_index,
                "is_correct": is_correct,
                "explanation": question.explanation,
            })

        percentage = round((score / total) * 100, 1)
        # Official Parivahan Sarathi criterion: Minimum 60% passing mark
        is_passed = percentage >= 60.0

        return Response(
            {
                "total_questions": total,
                "correct_answers": score,
                "percentage": percentage,
                "passing_percentage": 60.0,
                "is_passed": is_passed,
                "result_status": "PASS" if is_passed else "NEEDS_IMPROVEMENT",
                "detailed_results": detailed_results,
            },
            status=status.HTTP_200_OK
        )


class ClaimCalculateView(APIView):
    """
    Simulate and calculate claim assessment in real-time.
    Validates policy continuity, material depreciation, compulsory excess, GST, and final payout.
    """
    def post(self, request):
        serializer = ClaimCalculationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        clean_plate = clean_reg_no(data['vehicle_reg_no'])
        accident_date = data['accident_date']

        # 1. Fetch Vehicle
        vehicle = Vehicle.objects.filter(registration_number=clean_plate).first()
        vehicle_class = vehicle.vehicle_class if vehicle else "M-Cycle/Scooter(2WN)"
        engine_cc = vehicle.engine_capacity_cc if vehicle else 150
        reg_date = vehicle.registration_date if vehicle else (date.today() - timedelta(days=365 * 2))

        # 2. Fetch Active Policy for this vehicle
        policy = Policy.objects.filter(vehicle_reg_no=clean_plate).order_by('-issued_at').first()
        if not policy and vehicle and vehicle.insurance_upto:
            # Synthetic policy envelope based on vehicle RC record
            policy_start = vehicle.registration_date or (date.today() - timedelta(days=365))
            policy_end = vehicle.insurance_upto
            has_zero_dep = False
        elif policy:
            policy_start = policy.start_date
            policy_end = policy.end_date
            addons_str = " ".join([str(a).lower() for a in policy.selected_addons])
            has_zero_dep = 'zero' in addons_str or 'bumper' in addons_str
        else:
            policy_start = None
            policy_end = None
            has_zero_dep = False

        # 3. Check Previous Claims Count
        prev_claims_count = Claim.objects.filter(vehicle_reg_no=clean_plate).count()

        assessment = evaluate_claim_assessment(
            accident_date=accident_date,
            policy_start_date=policy_start,
            policy_end_date=policy_end,
            has_zero_dep=has_zero_dep,
            vehicle_class=vehicle_class,
            engine_cc=engine_cc,
            vehicle_reg_date=reg_date,
            claimed_parts=data.get('claimed_parts', []),
            claimed_labour=data.get('claimed_labour_amount', 0),
            is_rc_submitted=data.get('is_rc_submitted', True),
            is_dl_submitted=data.get('is_dl_submitted', True),
            is_policy_submitted=data.get('is_policy_submitted', True),
            is_estimate_submitted=data.get('is_estimate_submitted', True),
            claim_type=data.get('claim_type', 'CASHLESS'),
            previous_claims_count=prev_claims_count
        )

        assessment['vehicle_details'] = {
            'registration_number': clean_plate,
            'maker_model': vehicle.maker_model if vehicle else 'Unknown Model',
            'owner_name': vehicle.owner_name if vehicle else data.get('driver_name', 'Registered Owner'),
            'policy_number': policy.policy_number if policy else (f"POL-{clean_plate}-ACT" if vehicle else "N/A"),
            'policy_start': str(policy_start) if policy_start else None,
            'policy_end': str(policy_end) if policy_end else None,
        }

        return Response(assessment, status=status.HTTP_200_OK)


class ClaimSubmitView(APIView):
    """
    Submit and register a formal insurance claim.
    """
    def post(self, request):
        clean_plate = clean_reg_no(request.data.get('vehicle_reg_no', ''))
        if not clean_plate:
            return Response({"error": "vehicle_reg_no is required"}, status=status.HTTP_400_BAD_REQUEST)

        accident_date = parse_date_safe(request.data.get('accident_date'))
        if not accident_date:
            accident_date = date.today()

        vehicle = Vehicle.objects.filter(registration_number=clean_plate).first()
        policy = Policy.objects.filter(vehicle_reg_no=clean_plate).order_by('-issued_at').first()

        vehicle_class = vehicle.vehicle_class if vehicle else "M-Cycle/Scooter(2WN)"
        engine_cc = vehicle.engine_capacity_cc if vehicle else 150
        reg_date = vehicle.registration_date if vehicle else (date.today() - timedelta(days=365 * 2))

        if policy:
            policy_start = policy.start_date
            policy_end = policy.end_date
            addons_str = " ".join([str(a).lower() for a in policy.selected_addons])
            has_zero_dep = 'zero' in addons_str or 'bumper' in addons_str
        elif vehicle and vehicle.insurance_upto:
            policy_start = vehicle.registration_date or (date.today() - timedelta(days=365))
            policy_end = vehicle.insurance_upto
            has_zero_dep = False
        else:
            policy_start = None
            policy_end = None
            has_zero_dep = False

        prev_claims_count = Claim.objects.filter(vehicle_reg_no=clean_plate).count()

        claimed_parts = request.data.get('claimed_parts', [])
        claimed_labour = request.data.get('claimed_labour_amount', 0)

        assessment = evaluate_claim_assessment(
            accident_date=accident_date,
            policy_start_date=policy_start,
            policy_end_date=policy_end,
            has_zero_dep=has_zero_dep,
            vehicle_class=vehicle_class,
            engine_cc=engine_cc,
            vehicle_reg_date=reg_date,
            claimed_parts=claimed_parts,
            claimed_labour=claimed_labour,
            is_rc_submitted=request.data.get('is_rc_submitted', True),
            is_dl_submitted=request.data.get('is_dl_submitted', True),
            is_policy_submitted=request.data.get('is_policy_submitted', True),
            is_estimate_submitted=request.data.get('is_estimate_submitted', True),
            claim_type=request.data.get('claim_type', 'CASHLESS'),
            previous_claims_count=prev_claims_count
        )

        # Generate unique claim reference
        year = date.today().year
        suffix = uuid.uuid4().hex[:6].upper()
        claim_number = f"CLM-{year}-{clean_plate}-{suffix}"

        initial_status = "PENDING"
        if assessment['approval_status'] == 'REJECTED':
            initial_status = 'REJECTED'

        claim = Claim.objects.create(
            claim_number=claim_number,
            policy=policy,
            vehicle=vehicle,
            vehicle_reg_no=clean_plate,
            claim_type=request.data.get('claim_type', 'CASHLESS'),
            status=initial_status,
            accident_date=accident_date,
            accident_place=request.data.get('accident_place', 'Accident Site'),
            accident_description=request.data.get('accident_description', 'Frontal collision damage'),
            driver_name=request.data.get('driver_name', vehicle.owner_name if vehicle else 'Registered Driver'),
            driver_license_no=request.data.get('driver_license_no', f"DL-{clean_plate[:4]}-2020"),
            fir_filed=request.data.get('fir_filed', False),
            fir_number=request.data.get('fir_number'),
            workshop_name=request.data.get('workshop_name', 'TVS & Royal Enfield Authorized Service Centre'),
            workshop_type=request.data.get('workshop_type', 'NETWORK_CASHLESS'),
            is_rc_submitted=request.data.get('is_rc_submitted', True),
            is_dl_submitted=request.data.get('is_dl_submitted', True),
            is_policy_submitted=request.data.get('is_policy_submitted', True),
            is_estimate_submitted=request.data.get('is_estimate_submitted', True),
            claimed_parts=assessment['processed_parts'],
            claimed_labour_amount=assessment['claimed_labour'],
            total_claimed_amount=assessment['total_parts_claimed'] + assessment['claimed_labour'],
            depreciation_deduction=assessment['total_parts_depreciation'],
            compulsory_excess=assessment['excess_deducted'],
            net_approved_parts=assessment['total_parts_approved'],
            net_approved_labour=assessment['approved_labour'],
            gst_amount=assessment['gst_amount'],
            approved_settlement_amount=assessment['final_settlement_amount'],
            customer_liability=assessment['customer_liability'],
            rejection_reason="; ".join(assessment['rejection_reasons']) if assessment['rejection_reasons'] else None,
            surveyor_notes="Initial automated IRDAI algorithmic assessment completed."
        )

        serializer = ClaimSerializer(claim)
        resp_data = serializer.data
        resp_data['assessment'] = assessment
        return Response(resp_data, status=status.HTTP_201_CREATED)


class ClaimListView(APIView):
    """
    List all claims or filter by registration number / status.
    """
    def get(self, request):
        reg = request.query_params.get('vehicle_reg_no')
        claim_status = request.query_params.get('status')
        queryset = Claim.objects.all()

        if reg:
            clean = clean_reg_no(reg)
            queryset = queryset.filter(vehicle_reg_no=clean)
        if claim_status:
            queryset = queryset.filter(status=claim_status.upper())

        serializer = ClaimSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClaimDetailView(APIView):
    """
    Get claim detail by claim_number.
    """
    def get(self, request, claim_number):
        claim = get_object_or_404(Claim, claim_number=claim_number)
        serializer = ClaimSerializer(claim)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClaimSurveyorActionView(APIView):
    """
    Action endpoint for Surveyor/Insurer: Approve, Reject, or Adjust settlement.
    """
    def patch(self, request, claim_number):
        claim = get_object_or_404(Claim, claim_number=claim_number)
        new_status = request.data.get('status')
        surveyor_notes = request.data.get('surveyor_notes')
        approved_amount = request.data.get('approved_settlement_amount')

        if new_status and new_status in ('PENDING', 'APPROVED', 'REJECTED', 'SETTLED'):
            claim.status = new_status
        if surveyor_notes:
            claim.surveyor_notes = surveyor_notes
        if approved_amount is not None:
            claim.approved_settlement_amount = Decimal(str(approved_amount))
            claim.customer_liability = max(Decimal('0.00'), claim.total_claimed_amount - claim.approved_settlement_amount)

        claim.save()
        serializer = ClaimSerializer(claim)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EChallanCaptchaView(APIView):
    """
    GET /api/scraper/echallan/captcha/
    Initializes a session with the official Parivahan e-Challan portal (100% free)
    and delivers the CAPTCHA image as Base64.
    If `session_id` query param is provided, refreshes the CAPTCHA image for that session.
    """
    def get(self, request):
        session_id = request.query_params.get('session_id')
        if session_id:
            res = refresh_echallan_captcha(session_id)
        else:
            res = create_echallan_session()

        if not res.get('success'):
            return Response(res, status=status.HTTP_502_BAD_GATEWAY)

        return Response(res, status=status.HTTP_200_OK)


class EChallanSearchView(APIView):
    """
    POST /api/scraper/echallan/search/
    Submits vehicle search with CAPTCHA code to official Parivahan e-Challan portal.
    Syncs results to MySQL and returns formatted challans.
    Payload: { "session_id": "...", "vehicle_no": "...", "captcha_text": "..." }
    """
    def post(self, request):
        session_id = request.data.get('session_id')
        vehicle_no = request.data.get('vehicle_no')
        captcha_text = request.data.get('captcha_text')

        if not session_id or not vehicle_no or not captcha_text:
            return Response(
                {"error": "session_id, vehicle_no, and captcha_text are all required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = query_echallan_parivahan(session_id, vehicle_no, captcha_text)

        if not result.get('success'):
            if result.get('error') == 'INVALID_CAPTCHA':
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            if result.get('error') == 'SESSION_EXPIRED':
                return Response(result, status=status.HTTP_410_GONE)
            return Response(result, status=status.HTTP_502_BAD_GATEWAY)

        return Response(result, status=status.HTTP_200_OK)


class AdminStatsView(APIView):
    """
    GET /api/admin/stats/
    Returns aggregate stats for the Admin Dashboard.
    """
    def get(self, request):
        total_vehicles = Vehicle.objects.count()
        total_challans = Challan.objects.count()
        pending_challans = Challan.objects.filter(status='PENDING').count()
        paid_challans = Challan.objects.filter(status='PAID').count()
        fines_pending = Challan.objects.filter(status='PENDING').aggregate(total=Sum('fine_amount'))['total'] or 0
        fines_collected = Challan.objects.filter(status='PAID').aggregate(total=Sum('fine_amount'))['total'] or 0

        total_policies = Policy.objects.count()
        premiums_total = Policy.objects.aggregate(total=Sum('total_premium'))['total'] or 0

        total_claims = Claim.objects.count()
        pending_claims = Claim.objects.filter(status='PENDING').count()
        approved_claims = Claim.objects.filter(status='APPROVED').count()
        settled_claims = Claim.objects.filter(status='SETTLED').count()
        rejected_claims = Claim.objects.filter(status='REJECTED').count()

        total_questions = RTOQuestion.objects.count()

        return Response({
            "vehicles": {
                "total": total_vehicles,
            },
            "challans": {
                "total": total_challans,
                "pending": pending_challans,
                "paid": paid_challans,
                "fines_pending": float(fines_pending),
                "fines_collected": float(fines_collected),
            },
            "policies": {
                "total": total_policies,
                "total_premium": float(premiums_total),
            },
            "claims": {
                "total": total_claims,
                "pending": pending_claims,
                "approved": approved_claims,
                "settled": settled_claims,
                "rejected": rejected_claims,
            },
            "rto_questions": total_questions,
            "status": "OPERATIONAL",
            "server_time": timezone.now().isoformat(),
        }, status=status.HTTP_200_OK)


