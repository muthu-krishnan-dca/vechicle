from django.contrib import admin
from .models import Vehicle, Challan, Policy, RTOQuestion, Claim


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        'registration_number',
        'owner_name',
        'maker_model',
        'fuel_type',
        'engine_capacity_cc',
        'rto_office',
        'insurance_upto',
        'status',
        'created_at',
    )
    search_fields = (
        'registration_number',
        'owner_name',
        'maker_model',
        'rto_office',
        'chassis_number_masked',
    )
    list_filter = (
        'fuel_type',
        'status',
        'vehicle_class',
        'registration_date',
    )
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


@admin.register(Challan)
class ChallanAdmin(admin.ModelAdmin):
    list_display = (
        'challan_number',
        'get_vehicle_reg',
        'violation_title',
        'fine_amount',
        'status',
        'offense_date',
        'offense_place',
        'paid_at',
    )
    search_fields = (
        'challan_number',
        'vehicle__registration_number',
        'violation_title',
        'offense_place',
        'payment_reference',
    )
    list_filter = (
        'status',
        'offense_date',
    )
    ordering = ('-offense_date',)
    readonly_fields = ('created_at',)

    @admin.display(description='Vehicle Reg Plate', ordering='vehicle__registration_number')
    def get_vehicle_reg(self, obj):
        return obj.vehicle.registration_number


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = (
        'policy_number',
        'vehicle_reg_no',
        'owner_name',
        'insurer_name',
        'total_premium',
        'idv_amount',
        'start_date',
        'end_date',
        'issued_at',
    )
    search_fields = (
        'policy_number',
        'vehicle_reg_no',
        'owner_name',
        'owner_email',
        'owner_phone',
        'insurer_name',
    )
    list_filter = (
        'insurer_name',
        'start_date',
        'end_date',
    )
    ordering = ('-issued_at',)
    readonly_fields = ('issued_at',)


@admin.register(RTOQuestion)
class RTOQuestionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'order',
        'question_text_short',
        'category',
        'sign_code',
        'correct_index',
    )
    search_fields = (
        'question_text',
        'category',
        'sign_code',
        'explanation',
    )
    list_filter = (
        'category',
    )
    ordering = ('order', 'id')

    @admin.display(description='Question Text')
    def question_text_short(self, obj):
        return obj.question_text[:75] + '...' if len(obj.question_text) > 75 else obj.question_text


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = (
        'claim_number',
        'vehicle_reg_no',
        'claim_type',
        'status',
        'driver_name',
        'total_claimed_amount',
        'approved_settlement_amount',
        'surveyor_name',
        'accident_date',
        'created_at',
    )
    search_fields = (
        'claim_number',
        'vehicle_reg_no',
        'driver_name',
        'driver_license_no',
        'accident_place',
        'workshop_name',
    )
    list_filter = (
        'status',
        'claim_type',
        'accident_date',
    )
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')


# Customize Django Admin Site Header & Title
admin.site.site_header = "VehicleInfo Master Administration"
admin.site.site_title = "VehicleInfo Admin Portal"
admin.site.index_title = "Vehicle Operations & Database Control"
