"""URL routes for payments API endpoints."""

from django.urls import path

from .views import InitializePaymentView, MemberPaymentTransactionsView, PaystackWebhookView, VerifyPaymentView

app_name = 'payments'

urlpatterns = [
    path('my-transactions/', MemberPaymentTransactionsView.as_view(), name='member-payment-transactions'),
    path('initialize/', InitializePaymentView.as_view(), name='initialize-payment'),
    path('verify/<str:reference>/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('webhook/paystack/', PaystackWebhookView.as_view(), name='paystack-webhook'),
]
