from django.urls import path
from rest_framework.routers import DefaultRouter

from api.views import (
    BrandViewSet, CategoryViewSet, OrderViewSet, ProductViewSet,
    ReviewView, StripePaymentView, placeOrder, updateOrderToPaid,
    CouponViewSet, applyCoupon,
    WishlistViewSet,
    ContactMessageView, ContactMessageListView,
    dashboardStats, downloadInvoice,
)

router = DefaultRouter()
router.register('brands', BrandViewSet, basename='brands')
router.register('category', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='products')
router.register('orders', OrderViewSet, basename='orders')
router.register('coupons', CouponViewSet, basename='coupons')
router.register('wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    *router.urls,
    path('placeorder/', placeOrder, name='create-order'),
    path('orders/<str:pk>/pay/', updateOrderToPaid, name='pay'),
    path('orders/<str:pk>/invoice/', downloadInvoice, name='invoice'),
    path('stripe-payment/', StripePaymentView.as_view(), name='stripe-payment'),
    path('products/<str:pk>/reviews/', ReviewView.as_view(), name='product-reviews'),
    path('apply-coupon/', applyCoupon, name='apply-coupon'),
    path('contact/', ContactMessageView.as_view(), name='contact'),
    path('contact/messages/', ContactMessageListView.as_view(), name='contact-messages'),
    path('contact/messages/<int:pk>/read/', ContactMessageListView.as_view(), name='contact-read'),
    path('dashboard/', dashboardStats, name='dashboard'),
]
