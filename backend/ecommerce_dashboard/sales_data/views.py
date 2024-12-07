import csv
import logging
from datetime import datetime
from django.db import transaction
from django.http import JsonResponse
from django.db.models import Sum, F, Func
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Customer, Product, Order, Delivery, Platform
from .serializers import (
    OrderSerializer,
    CustomerSerializer,
    DeliverySerializer,
    PlatformSerializer,
)
from django.core.cache import cache
from django.db.models.functions import TruncMonth

# Set up logging
logger = logging.getLogger('sales_data')


# Custom Function for Date Truncation by Month
class MonthYear(Func):
    function = 'DATE_TRUNC'
    template = "%(function)s('month', %(expressions)s)"


# Utility Function for Parsing Dates
def parse_date(date_str, date_format='%Y-%m-%d'):
    try:
        return datetime.strptime(date_str, date_format).date()
    except ValueError as e:
        raise ValueError(f"Invalid date format: {date_str}. Use {date_format}.") from e


# ViewSets
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer


class PlatformViewSet(viewsets.ModelViewSet):
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer


# API for CSV Upload
class UploadCSVView(APIView):
    """
    API to upload a CSV file and populate the database.
    """

    def post(self, request):
        csv_file = request.FILES.get('file')

        if not csv_file:
            return Response(
                {"error": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Decode and parse the CSV file
            decoded_file = csv_file.read().decode('utf-8').splitlines()
            csv_reader = csv.DictReader(decoded_file)
            logger.info(f"CSV Headers: {', '.join(csv_reader.fieldnames)}")

            with transaction.atomic():
                for row in csv_reader:
                    self.process_row(row)

            return Response(
                {"message": "Data successfully imported!"}, status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f"Error processing CSV file: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def process_row(self, row):
        """Process a single row from the CSV file."""
        logger.info(f"Processing row: {row}")

        # Create or get Customer
        customer, _ = Customer.objects.get_or_create(
            customer_id=row['CustomerID'],
            defaults={
                'customer_name': row['CustomerName'],
                'contact_email': row['ContactEmail'],
                'phone_number': row['PhoneNumber'],
            },
        )

        # Create or get Product
        product, _ = Product.objects.get_or_create(
            product_id=row['ProductID'],
            defaults={
                'product_name': row['ProductName'],
                'category': row['Category'],
                'price': float(row['SellingPrice']),
            },
        )

        # Create Order
        order = Order.objects.create(
            order_id=row['OrderID'],
            product=product,
            customer=customer,
            quantity_sold=int(row['QuantitySold']),
            total_sale_value=float(row['SellingPrice']) * int(row['QuantitySold']),
            date_of_sale=parse_date(row['DateOfSale']),
        )

        # Create Delivery
        Delivery.objects.create(
            order=order,
            delivery_address=row['DeliveryAddress'],
            delivery_date=parse_date(row['DeliveryDate']),
            delivery_status=row['DeliveryStatus'],
        )

        # Create Platform
        Platform.objects.create(
            order=order,
            platform_name=row['Platform'],
        )


# API for Delivery Filters
class DeliveryListAPIView(APIView):
    """
    API to list deliveries with optional filtering.
    """

    def get(self, request, *args, **kwargs):
        filters = self.build_filters(request.query_params)
        deliveries = Delivery.objects.filter(**filters)
        serializer = DeliverySerializer(deliveries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def build_filters(query_params):
        """Build filters from query parameters."""
        filters = {}
        if 'city' in query_params:
            filters['city__icontains'] = query_params['city']
        if 'state' in query_params:
            filters['state__icontains'] = query_params['state']
        if 'delivery_status' in query_params:
            filters['delivery_status'] = query_params['delivery_status']
        if 'start_date' in query_params and 'end_date' in query_params:
            filters['delivery_date__range'] = [
                parse_date(query_params['start_date']),
                parse_date(query_params['end_date']),
            ]
        return filters


def monthly_sales_volume(request):
    """
    API to calculate monthly sales volume within a date range.
    """
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    if not start_date or not end_date:
        return JsonResponse(
            {'error': 'start_date and end_date are required parameters.'}, status=400
        )

    try:
        start_date = parse_date(start_date)
        end_date = parse_date(end_date)
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)

    # Generate cache key using start_date and end_date
    cache_key = f"monthly_sales_volume_{start_date}_{end_date}"
    cached_data = cache.get(cache_key)

    if cached_data:
        # Return cached response if available
        return JsonResponse({'data': cached_data}, status=200)

    # Query database and aggregate sales by month
    sales_data = (
        Order.objects.filter(date_of_sale__range=[start_date, end_date])
        .annotate(month_year=MonthYear(F('date_of_sale')))
        .values('month_year')
        .annotate(total_quantity=Sum('quantity_sold'))
        .order_by('month_year')
    )

    # Format response data
    response_data = [
        {'month': entry['month_year'].strftime('%Y-%m'), 'quantity_sold': entry['total_quantity']}
        for entry in sales_data
    ]

    # Cache the response data
    cache.set(cache_key, response_data, timeout=60 * 60)  # Cache for 1 hour

    return JsonResponse({'data': response_data}, status=200)


def monthly_revenue(request):
    """
    API to calculate monthly revenue (total sale value) within a date range.
    """
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    if not start_date or not end_date:
        return JsonResponse(
            {'error': 'start_date and end_date are required parameters.'}, status=400
        )

    try:
        # Parse dates
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse(
            {'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400
        )

    # Generate cache key
    cache_key = f"monthly_revenue_{start_date}_{end_date}"
    cached_data = cache.get(cache_key)

    if cached_data:
        # Return cached response if available
        return JsonResponse({'data': cached_data}, status=200)

    # Query database to calculate total sale value grouped by month
    revenue_data = (
        Order.objects.filter(date_of_sale__range=[start_date, end_date])
        .annotate(month=TruncMonth('date_of_sale'))
        .values('month')
        .annotate(total_revenue=Sum('total_sale_value'))
        .order_by('month')
    )

    # Format the response
    response_data = [
        {'month': entry['month'].strftime('%Y-%m'), 'total_revenue': entry['total_revenue']}
        for entry in revenue_data
    ]

    # Cache the response data
    cache.set(cache_key, response_data, timeout=60 * 60)  # Cache for 1 hour

    return JsonResponse({'data': response_data}, status=200)
