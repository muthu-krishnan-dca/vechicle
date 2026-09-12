import uuid
from datetime import date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Vehicle, Challan, Policy, RTOQuestion
from .serializers import (
    VehicleSerializer,
    ChallanSerializer,
    PolicySerializer,
    RTOQuestionSerializer,
    RTOQuestionDetailSerializer,
    QuoteRequestSerializer,
    CheckoutRequestSerializer,
)
from .services import calculate_quotes, ADDON_DEFINITIONS
from .rto_data import resolve_rto_office


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
    Parivahan Vahan RC status lookup.
    """
    def get(self, request, reg_no):
        cleaned = clean_reg_no(reg_no)
        vehicle = Vehicle.objects.filter(registration_number=cleaned).first()

        if not vehicle:
            # Fallback generator for realistic lookup if user enters any valid format
            # e.g., MH04AB1234, DL01C7788, etc.
            today = date.today()
            reg_date = today - timedelta(days=730)
            vehicle = Vehicle.objects.create(
                registration_number=cleaned,
                owner_name="RAKESH KUMAR SHARMA",
                masked_owner="R***SH K***R SH***A",
                maker_model="Honda Activa 6G Standard",
                vehicle_class="M-Cycle/Scooter(2WN)",
                fuel_type="PETROL",
                engine_capacity_cc=109,
                registration_date=reg_date,
                fitness_upto=reg_date + timedelta(days=365 * 15),
                insurance_upto=today + timedelta(days=45),
                pucc_upto=today + timedelta(days=90),
                rto_office=resolve_rto_office(cleaned),
                chassis_number_masked="ME4JF50...9821",
                engine_number_masked="JF50E...3304",
                status="ACTIVE",
            )
            # Add a demo challan for rich testing
            Challan.objects.create(
                vehicle=vehicle,
                challan_number=f"CH-{cleaned[:4]}-{uuid.uuid4().hex[:6].upper()}",
                violation_title="Riding Without Helmet (Section 194D)",
                violation_description="Two-wheeler rider found operating motor vehicle without protective headgear conforming to BIS standards.",
                offense_date=timezone.now() - timedelta(days=12),
                offense_place="Main Traffic Junction, Ring Road",
                fine_amount=1000.00,
                status="PENDING",
            )

        serializer = VehicleSerializer(vehicle)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChallanListView(APIView):
    """
    GET /api/challans/?reg_no=...&status=...
    Lists traffic challans.
    """
    def get(self, request):
        reg_no = request.query_params.get('reg_no')
        status_param = request.query_params.get('status')
        queryset = Challan.objects.all().order_by('-offense_date')

        if reg_no:
            cleaned = clean_reg_no(reg_no)
            queryset = queryset.filter(vehicle__registration_number=cleaned)

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
