from django.urls import path
from .views import (
    QuoteCalculatorView,
    VehicleRCView,
    ChallanListView,
    ChallanPayView,
    CheckoutPolicyView,
    PolicyVaultView,
    RTOMockExamQuestionsView,
    RTOMockExamSubmitView,
    ClaimCalculateView,
    ClaimSubmitView,
    ClaimListView,
    ClaimDetailView,
    ClaimSurveyorActionView,
    EChallanCaptchaView,
    EChallanSearchView,
    AdminStatsView,
)

urlpatterns = [
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('quotes/', QuoteCalculatorView.as_view(), name='quote-calculator'),
    path('vehicle/', VehicleRCView.as_view(), name='vehicle-rc-create'),
    path('vehicle/<str:reg_no>/', VehicleRCView.as_view(), name='vehicle-rc-status'),
    path('challans/', ChallanListView.as_view(), name='challan-list'),
    path('challan/<int:pk>/pay/', ChallanPayView.as_view(), name='challan-pay'),
    path('checkout/', CheckoutPolicyView.as_view(), name='policy-checkout'),
    path('vault/', PolicyVaultView.as_view(), name='policy-vault'),
    path('vault/<str:reg_no>/', PolicyVaultView.as_view(), name='policy-vault-by-reg'),
    path('mock-test/questions/', RTOMockExamQuestionsView.as_view(), name='mock-test-questions'),
    path('mock-test/submit/', RTOMockExamSubmitView.as_view(), name='mock-test-submit'),
    # Claim Assessment & Management System Routes
    path('claims/calculate/', ClaimCalculateView.as_view(), name='claim-calculate'),
    path('claims/submit/', ClaimSubmitView.as_view(), name='claim-submit'),
    path('claims/', ClaimListView.as_view(), name='claim-list'),
    path('claims/<str:claim_number>/', ClaimDetailView.as_view(), name='claim-detail'),
    path('claims/<str:claim_number>/status/', ClaimSurveyorActionView.as_view(), name='claim-surveyor-action'),
    # Free Parivahan e-Challan Scraper Routes
    path('scraper/echallan/captcha/', EChallanCaptchaView.as_view(), name='scraper-echallan-captcha'),
    path('scraper/echallan/search/', EChallanSearchView.as_view(), name='scraper-echallan-search'),
]


