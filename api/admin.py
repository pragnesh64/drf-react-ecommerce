from django.contrib import admin
from api.models import *


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'isRead', 'createdAt')
    list_filter = ('isRead',)
    search_fields = ('name', 'email', 'subject')
    list_editable = ('isRead',)


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount', 'expiryDate', 'isActive')
    list_filter = ('isActive',)
    list_editable = ('isActive',)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'addedAt')


admin.site.register(Category)
admin.site.register(Brand)
admin.site.register(Product)
admin.site.register(Review)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(ShippingAddress)
