from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CustomerViewSet, DeliveryViewSet, PlatformViewSet, UploadCSVView

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'platforms', PlatformViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/upload-csv/', UploadCSVView.as_view(), name='upload_csv'),
]
