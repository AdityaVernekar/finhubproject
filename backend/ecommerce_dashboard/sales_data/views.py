import csv
import logging
from datetime import datetime
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import Customer, Product, Order, Delivery, Platform
from .serializers import OrderSerializer, CustomerSerializer, DeliverySerializer, PlatformSerializer

# Set up logging
logger = logging.getLogger('sales_data')

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

class UploadCSVView(APIView):
    """
    API to upload a CSV file and populate the database.
    """

    def post(self, request):
        csv_file = request.FILES.get('file')

        if not csv_file:
            return Response({"error": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode the file and parse it
            decoded_file = csv_file.read().decode('utf-8').splitlines()
            csv_reader = csv.DictReader(decoded_file)
            
            # Log the CSV headers (optional)
            logger.info(f"CSV Headers: {', '.join(csv_reader.fieldnames)}")
            

            with transaction.atomic():  # Ensures all-or-nothing execution
                for row in csv_reader:
                    # Log each row
                    logger.info(f"Processing row: {row}")
                    

                    # Create or get Customer
                    customer, _ = Customer.objects.get_or_create(
                        customer_id=row['CustomerID'],
                        defaults={
                            'customer_name': row['CustomerName'],
                            'contact_email': row['ContactEmail'],
                            'phone_number': row['PhoneNumber'],
                        }
                    )

                    # Create or get Product
                    product, _ = Product.objects.get_or_create(
                        product_id=row['ProductID'],
                        defaults={
                            'product_name': row['ProductName'],
                            'category': row['Category'],
                            'price': float(row['SellingPrice']),
                        }
                    )

                    # Create Order
                    order = Order.objects.create(
                        order_id=row['OrderID'],
                        product=product,
                        customer=customer,
                        quantity_sold=int(row['QuantitySold']),
                        total_sale_value=float(row['SellingPrice']) * int(row['QuantitySold']),
                        date_of_sale=datetime.strptime(row['DateOfSale'], '%Y-%m-%d').date(),
                    )

                    # Create Delivery
                    Delivery.objects.create(
                        order=order,
                        delivery_address=row['DeliveryAddress'],
                        delivery_date=datetime.strptime(row['DeliveryDate'], '%Y-%m-%d').date(),
                        delivery_status=row['DeliveryStatus']
                    )

                    # Create Platform
                    Platform.objects.create(
                        order=order,
                        platform_name=row['Platform'],
                    )

            return Response({"message": "Data successfully imported!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error processing file: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class DeliveryListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        # Apply filters based on query parameters
        filters = {}
        if 'city' in request.query_params:
            filters['city__icontains'] = request.query_params['city']
        if 'state' in request.query_params:
            filters['state__icontains'] = request.query_params['state']
        if 'delivery_status' in request.query_params:
            filters['delivery_status'] = request.query_params['delivery_status']
        if 'start_date' in request.query_params and 'end_date' in request.query_params:
            filters['delivery_date__range'] = [request.query_params['start_date'], request.query_params['end_date']]
        
        deliveries = Delivery.objects.filter(**filters)
        serializer = DeliverySerializer(deliveries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)