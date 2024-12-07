from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CustomerViewSet, DeliveryViewSet, PlatformViewSet, UploadCSVView,Dashboard,OrdersAndSalesByPlatformAPIView,TopSellingProductsAPIView

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'platforms', PlatformViewSet)

class DashboardView:
    def monthly_sales_volume(self, request):
        return Dashboard().monthly_sales_volume(request)

    def monthly_revenue(self, request):
        return Dashboard().monthly_revenue(request)

    def summary_metrics(self, request):
        return Dashboard().summary_metrics(request)

    def filterable_data_table(self, request):
        return Dashboard().filterable_data_table(request)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/upload-csv/', UploadCSVView.as_view(), name='upload_csv'),
    path('api/sales/monthly/', DashboardView().monthly_sales_volume, name='monthly_sales_volume'),
    path('api/revenue/monthly/', DashboardView().monthly_revenue, name='monthly_revenue'),
    path('api/summary/', DashboardView().summary_metrics, name='summary_metrics'),
    path('api/table/', DashboardView().filterable_data_table, name='filterable_data_table'),
    path('api/orderbyplatform',OrdersAndSalesByPlatformAPIView.as_view(),name="orders_sales_by_platform"),
    path('api/topsp',TopSellingProductsAPIView.as_view(),name="topsp")
]

