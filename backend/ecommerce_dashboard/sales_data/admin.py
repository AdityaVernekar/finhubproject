from django.contrib import admin
from .models import Order, Customer, Delivery, Platform, Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('product_id', 'product_name', 'category', 'price')
    search_fields = ('product_id', 'product_name', 'category')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('customer_id', 'customer_name', 'contact_email', 'phone_number')
    search_fields = ('customer_id', 'customer_name', 'contact_email')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'customer', 'product', 'quantity_sold', 'total_sale_value', 'date_of_sale')
    search_fields = ('order_id', 'customer__customer_name', 'product__product_name')
    list_filter = ('date_of_sale',)

@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('order', 'delivery_date', 'delivery_status','state')
    search_fields = ('order__order_id','state')
    list_filter = ('delivery_status', 'delivery_date','state')

@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    list_display = ('order', 'platform_name')
    search_fields = ('order__order_id', 'platform_name')
    list_filter = ('platform_name',)
