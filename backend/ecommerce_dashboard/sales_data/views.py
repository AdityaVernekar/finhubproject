import csv
import logging
from datetime import datetime
from django.db import transaction
from django.http import JsonResponse
from django.db.models import Sum, F, Func ,Q,Count
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
from decimal import Decimal
from math import ceil

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


class Dashboard:
    def monthly_sales_volume(self, request):
        """
        API to calculate monthly sales volume within a date range.
        """
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not start_date or not end_date:
            return JsonResponse({'error': 'start_date and end_date are required parameters.'}, status=400)

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

    def monthly_revenue(self, request):
        """
        API to calculate monthly revenue (total sale value) within a date range.
        """
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not start_date or not end_date:
            return JsonResponse({'error': 'start_date and end_date are required parameters.'}, status=400)

        try:
            # Parse dates
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

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

    def summary_metrics(self, request):
        """
        API to calculate summary metrics:
        - Total Revenue
        - Total Orders
        - Total Products Sold
        - Canceled Order Percentage
        - Average Order Value
        - Top Selling Product
        - Delivery Success Rate
        - Total Unique Customers
        """
        # Filter parameters (optional)
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        filters = {}
        if start_date:
            filters['date_of_sale__gte'] = start_date
        if end_date:
            filters['date_of_sale__lte'] = end_date

        # Query the database
        orders = Order.objects.filter(**filters)

        # Metrics calculations
        total_revenue = orders.aggregate(total=Sum('total_sale_value'))['total'] or Decimal(0)
        total_orders = orders.count()
        total_products_sold = orders.aggregate(total=Sum('quantity_sold'))['total'] or 0
        average_order_value = (total_revenue / total_orders) if total_orders > 0 else 0

        canceled_orders = Delivery.objects.filter(
            Q(order__in=orders) & (Q(delivery_status='Cancelled') | Q(delivery_status__isnull=True))
        ).count()
        total_deliveries = Delivery.objects.filter(order__in=orders).count()
        canceled_order_percentage = (
            (canceled_orders / total_deliveries) * 100 if total_deliveries > 0 else 0
        )

        top_selling_product = orders.values('product__product_name').annotate(
            total_quantity=Sum('quantity_sold')
        ).order_by('-total_quantity').first()

        successful_deliveries = Delivery.objects.filter(
            order__in=orders, delivery_status='Delivered'
        ).count()
        delivery_success_rate = (
            (successful_deliveries / total_deliveries) * 100 if total_deliveries > 0 else 0
        )

        total_unique_customers = orders.values('customer_id').distinct().count()

        # Format response data
        response_data = {
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'total_products_sold': total_products_sold,
            'canceled_order_percentage': round(canceled_order_percentage, 2),
            'average_order_value': round(float(average_order_value), 2),
            'top_selling_product': top_selling_product['product__product_name'] if top_selling_product else None,
            'top_selling_quantity': top_selling_product['total_quantity'] if top_selling_product else 0,
            'delivery_success_rate': round(delivery_success_rate, 2),
            'total_unique_customers': total_unique_customers,
        }

        return JsonResponse({'data': response_data}, status=200)

    def filterable_data_table(self, request):
        """
        API to display rows with filters for:
        - Date Range (sales date)
        - Product Category
        - Delivery Status
        - Platform
        - State
        - Pagination support
        """

        # Extract query parameters
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        category = request.GET.get('category')
        delivery_status = request.GET.get('delivery_status')
        platform = request.GET.get('platform')
        state = request.GET.get('state')
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))

        logger.info(f"Request received with limit: {limit}, page: {page}")

        # Initialize filters
        filters = {}
        if start_date:
            filters['date_of_sale__gte'] = start_date
        if end_date:
            filters['date_of_sale__lte'] = end_date
        if category:
            filters['product__category__iexact'] = category
        if delivery_status:
            filters['deliveries__delivery_status'] = delivery_status
        if platform:
            filters['platforms__platform_name__iexact'] = platform
        if state:
            filters['deliveries__state__iexact'] = state

        # Generate cache key
        cache_key_parts = [f"{k}_{v}" for k, v in filters.items()]
        cache_key_parts.append(f"page_{page}")
        cache_key_parts.append(f"limit_{limit}")
        cache_key = f"tabular_data_{'_'.join(cache_key_parts)}" if cache_key_parts else "tabular_data_no_filters"

        # Attempt to retrieve cached data
        cached_data = cache.get(cache_key)
        if cached_data:
            logger.info("Returning cached data.")
            return JsonResponse(cached_data, status=200)

        # Query optimization: Use only relevant fields and prefetch related objects
        queryset = (
            Order.objects.filter(**filters)
            .select_related('customer', 'product')
            .prefetch_related('deliveries', 'platforms')
            .only('order_id', 'customer__customer_name', 'product__category', 'quantity_sold', 
                'total_sale_value', 'date_of_sale')
        )

        # Total count for pagination
        total_count = queryset.count()
        start_index = (page - 1) * limit
        end_index = start_index + limit

        # Paginate the queryset
        paginated_orders = queryset[start_index:end_index]
        
        logger.info(paginated_orders)

        # Prepare response data
        data = []
        for order in paginated_orders:
            delivery_status = (
                order.deliveries.first().delivery_status if order.deliveries.exists() else 'N/A'
            )
            platform_name = (
                order.platforms.first().platform_name if order.platforms.exists() else 'N/A'
            )
            row = {
                'order_id': order.order_id,
                'customer': order.customer.customer_name,
                'product': order.product.product_name,
                'category': order.product.category,
                'quantity_sold': order.quantity_sold,
                'total_sale_value': float(order.total_sale_value),
                'date_of_sale': order.date_of_sale.strftime('%Y-%m-%d'),
                'delivery_status': delivery_status,
                'platform': platform_name,
                'state': order.deliveries.first().state if order.deliveries.exists() else 'N/A',
            }
            logger.info(row)
            data.append(row)

        # Pagination info
        pagination_info = {
            'current_page': page,
            'total_pages': ceil(total_count / limit),
            'total_items': total_count,
        }

        # Cache the data for 5 minutes
        cache.set(
            cache_key, 
            {'data': data, 'pagination': pagination_info}, 
            timeout=300
        )

        # Return the response
        return JsonResponse({'data': data, 'pagination': pagination_info}, status=200)


class OrdersAndSalesByPlatformAPIView(APIView):
    def get(self, request):
        # Annotate orders delivered and total sales grouped by platform and delivery date
        data = (
            Platform.objects
            .filter(order__deliveries__delivery_date__isnull=False)  # Filter orders only with valid deliveries
            .values('platform_name', 'order__deliveries__delivery_date__month')
            .annotate(
                order_count=Count('order'),
                total_sales=Sum('order__total_sale_value')
            )
            .order_by('order__deliveries__delivery_date__month')
        )
        
        # Aggregate total sales per month across all platforms
        monthly_totals = {}
        for entry in data:
            month = entry['order__deliveries__delivery_date__month']
            if month not in monthly_totals:
                monthly_totals[month] = 0
            monthly_totals[month] += float(entry['total_sales'])
        
        # Calculate percentage for normalization
        formatted_data = []
        for entry in data:
            normalized_sales = (
                (float(entry['total_sales']) / monthly_totals[entry['order__deliveries__delivery_date__month']]) * 100
                if monthly_totals[entry['order__deliveries__delivery_date__month']] else 0
            )
            formatted_data.append({
                "platform": entry['platform_name'],
                "month": entry['order__deliveries__delivery_date__month'],
                "order_count": entry['order_count'],
                "total_sales": float(entry['total_sales']),
                "normalized_sales_percentage": normalized_sales
            })

        return Response({"data": formatted_data})



    
class TopSellingProductsAPIView(APIView):
    def get(self, request):
        data = (
            Order.objects.values('product__product_name')
            .annotate(total_units_sold=Sum('quantity_sold'))
            .order_by('-total_units_sold')[:10]  # Top 10 products
        )
        return Response({"data":data})