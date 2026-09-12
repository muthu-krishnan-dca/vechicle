from rest_framework import serializers
from .models import Vehicle, Challan, Policy, RTOQuestion


class ChallanSerializer(serializers.ModelSerializer):
    vehicle_reg_no = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model = Challan
        fields = [
            'id',
            'challan_number',
            'vehicle_reg_no',
            'violation_title',
            'violation_description',
            'offense_date',
            'offense_place',
            'fine_amount',
            'status',
            'paid_at',
            'payment_reference',
            'created_at',
        ]


class VehicleSerializer(serializers.ModelSerializer):
    challans = ChallanSerializer(many=True, read_only=True)
    insurance_status = serializers.ReadOnlyField()
    days_to_insurance_expiry = serializers.ReadOnlyField()
    pending_fines_total = serializers.SerializerMethodField()
    pending_challans_count = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id',
            'registration_number',
            'owner_name',
            'masked_owner',
            'maker_model',
            'vehicle_class',
            'fuel_type',
            'engine_capacity_cc',
            'registration_date',
            'fitness_upto',
            'insurance_upto',
            'pucc_upto',
            'rto_office',
            'chassis_number_masked',
            'engine_number_masked',
            'status',
            'insurance_status',
            'days_to_insurance_expiry',
            'pending_fines_total',
            'pending_challans_count',
            'challans',
            'created_at',
        ]

    def get_pending_fines_total(self, obj):
        pending = obj.challans.filter(status='PENDING')
        return sum(float(c.fine_amount) for c in pending)

    def get_pending_challans_count(self, obj):
        return obj.challans.filter(status='PENDING').count()


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = '__all__'


class RTOQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RTOQuestion
        fields = [
            'id',
            'question_text',
            'sign_code',
            'category',
            'options',
            'order',
        ]


class RTOQuestionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = RTOQuestion
        fields = [
            'id',
            'question_text',
            'sign_code',
            'category',
            'options',
            'correct_index',
            'explanation',
            'order',
        ]


class QuoteRequestSerializer(serializers.Serializer):
    engine_capacity_cc = serializers.IntegerField(default=150, min_value=50, max_value=2500)
    idv = serializers.FloatField(default=65000, min_value=25000, max_value=150000)
    ncb_percent = serializers.IntegerField(default=20)
    selected_addons = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )


class CheckoutRequestSerializer(serializers.Serializer):
    vehicle_reg_no = serializers.CharField(max_length=20)
    owner_name = serializers.CharField(max_length=100)
    owner_email = serializers.EmailField()
    owner_phone = serializers.CharField(max_length=20)
    insurer_name = serializers.CharField(max_length=80)
    plan_name = serializers.CharField(default="Comprehensive Two-Wheeler Insurance")
    engine_capacity_cc = serializers.IntegerField(default=150)
    idv_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    ncb_percent = serializers.IntegerField(default=0)
    od_premium = serializers.DecimalField(max_digits=10, decimal_places=2)
    tp_premium = serializers.DecimalField(max_digits=10, decimal_places=2)
    addons_total = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    selected_addons = serializers.ListField(child=serializers.CharField(), default=list)
    net_premium = serializers.DecimalField(max_digits=10, decimal_places=2)
    gst_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_premium = serializers.DecimalField(max_digits=10, decimal_places=2)
