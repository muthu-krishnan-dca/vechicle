from django.db import models
from django.utils import timezone
from datetime import timedelta, date


class Vehicle(models.Model):
    registration_number = models.CharField(max_length=20, unique=True, db_index=True)
    owner_name = models.CharField(max_length=100)
    masked_owner = models.CharField(max_length=100)
    maker_model = models.CharField(max_length=120)
    vehicle_class = models.CharField(max_length=60, default="M-Cycle/Scooter(2WN)")
    fuel_type = models.CharField(max_length=30, default="PETROL")
    engine_capacity_cc = models.PositiveIntegerField(help_text="Displacement in Cubic Centimeters")
    registration_date = models.DateField()
    fitness_upto = models.DateField()
    insurance_upto = models.DateField()
    pucc_upto = models.DateField(null=True, blank=True)
    rto_office = models.CharField(max_length=120)
    chassis_number_masked = models.CharField(max_length=50, default="MD625...8841")
    engine_number_masked = models.CharField(max_length=50, default="JE35E...2190")
    status = models.CharField(max_length=20, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.registration_number} - {self.maker_model}"

    @property
    def insurance_status(self):
        today = date.today()
        if not self.insurance_upto:
            return "EXPIRED"
        if self.insurance_upto < today:
            return "EXPIRED"
        elif self.insurance_upto <= today + timedelta(days=30):
            return "EXPIRING_SOON"
        return "ACTIVE"

    @property
    def days_to_insurance_expiry(self):
        if not self.insurance_upto:
            return 0
        return (self.insurance_upto - date.today()).days


class Challan(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
    )

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='challans')
    challan_number = models.CharField(max_length=40, unique=True, db_index=True)
    violation_title = models.CharField(max_length=200)
    violation_description = models.TextField()
    offense_date = models.DateTimeField()
    offense_place = models.CharField(max_length=200)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=80, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.challan_number} - {self.vehicle.registration_number} ({self.status})"


class Policy(models.Model):
    policy_number = models.CharField(max_length=50, unique=True, db_index=True)
    vehicle_reg_no = models.CharField(max_length=20, db_index=True)
    owner_name = models.CharField(max_length=100)
    owner_email = models.EmailField()
    owner_phone = models.CharField(max_length=20)
    insurer_name = models.CharField(max_length=80)
    plan_name = models.CharField(max_length=100, default="Comprehensive 2-Wheeler Package")
    engine_capacity_cc = models.PositiveIntegerField()
    idv_amount = models.DecimalField(max_digits=12, decimal_places=2)
    ncb_percent = models.PositiveIntegerField(default=0)
    od_premium = models.DecimalField(max_digits=10, decimal_places=2)
    tp_premium = models.DecimalField(max_digits=10, decimal_places=2)
    addons_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    selected_addons = models.JSONField(default=list)
    net_premium = models.DecimalField(max_digits=10, decimal_places=2)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_premium = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-issued_at']

    def __str__(self):
        return f"{self.policy_number} - {self.insurer_name} ({self.vehicle_reg_no})"


class RTOQuestion(models.Model):
    question_text = models.TextField()
    sign_code = models.CharField(max_length=60, blank=True, null=True)
    category = models.CharField(max_length=60, default="Mandatory Signs")
    options = models.JSONField(help_text="List of 4 answer options")
    correct_index = models.PositiveIntegerField(help_text="0-indexed position of correct answer")
    explanation = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.id}: {self.question_text[:50]}"
