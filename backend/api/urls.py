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
)

urlpatterns = [
    path('quotes/', QuoteCalculatorView.as_view(), name='quote-calculator'),
    path('vehicle/<str:reg_no>/', VehicleRCView.as_view(), name='vehicle-rc-status'),
    path('challans/', ChallanListView.as_view(), name='challan-list'),
    path('challan/<int:pk>/pay/', ChallanPayView.as_view(), name='challan-pay'),
    path('checkout/', CheckoutPolicyView.as_view(), name='policy-checkout'),
    path('vault/', PolicyVaultView.as_view(), name='policy-vault'),
    path('vault/<str:reg_no>/', PolicyVaultView.as_view(), name='policy-vault-by-reg'),
    path('mock-test/questions/', RTOMockExamQuestionsView.as_view(), name='mock-test-questions'),
    path('mock-test/submit/', RTOMockExamSubmitView.as_view(), name='mock-test-submit'),
]
