from rest_framework import serializers
from api.models import Brand, Category, Product, Review, ShippingAddress, Order, OrderItem, Coupon, Wishlist, ContactMessage
from django.contrib.auth.models import User


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('id', 'product', 'name', 'rating', 'comment', 'createdAt', )


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'title', 'description', 'featured_product', 'image')


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ('id', 'title', 'description', 'featured_product', 'image')


class ProductSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(read_only=True, many=True, source='review_set')

    class Meta:
        model = Product
        fields = ('id', 'name', 'image', 'brand', 'category', 'description',
                  'rating', 'numReviews', 'price', 'countInStock', 'createdAt', 'reviews', )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    orderItems = serializers.SerializerMethodField(read_only=True)
    shippingAddress = serializers.SerializerMethodField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_orderItems(self, obj):
        items = obj.orderitem_set.all()
        serializer = OrderItemSerializer(items, many=True)
        return serializer.data

    def get_shippingAddress(self, obj):
        item = obj.shippingAddress
        serializer = ShippingAddressSerializer(item)
        return serializer.data

    def get_user(self, obj):
        user = obj.user
        serializer = UserSerializer(user)
        return serializer.data


class CouponSerializer(serializers.ModelSerializer):
    isValid = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Coupon
        fields = ('id', 'code', 'discount', 'expiryDate', 'isActive', 'createdAt', 'isValid')

    def get_isValid(self, obj):
        return obj.is_valid()


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'product', 'product_id', 'addedAt')

    def create(self, validated_data):
        user = self.context['request'].user
        product_id = validated_data.pop('product_id')
        wishlist_item, _ = Wishlist.objects.get_or_create(user=user, product_id=product_id)
        return wishlist_item


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'subject', 'message', 'isRead', 'createdAt')
