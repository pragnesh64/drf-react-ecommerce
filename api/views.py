from datetime import datetime
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.views import APIView
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, CreateModelMixin, DestroyModelMixin
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from api.models import Brand, Category, Order, OrderItem, Product, Review, ShippingAddress, Coupon, Wishlist, ContactMessage
from api.permissions import IsAdminUserOrReadOnly
from api.serializers import (BrandSerializer, CategorySerializer, OrderSerializer,
                              ProductSerializer, ReviewSerializer, CouponSerializer,
                              WishlistSerializer, ContactMessageSerializer)
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
import io


class BrandViewSet(ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminUserOrReadOnly]


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]


class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.all()
        keyword = self.request.query_params.get('keyword', '')
        category = self.request.query_params.get('category', '')
        min_price = self.request.query_params.get('min_price', '')
        max_price = self.request.query_params.get('max_price', '')

        if keyword:
            queryset = queryset.filter(name__icontains=keyword)
        if category:
            queryset = queryset.filter(category__title__icontains=category)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        return queryset


class ReviewView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        product = get_object_or_404(Product, id=pk)
        reviews = product.review_set.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        data = request.data
        user = request.user
        product = get_object_or_404(Product, id=pk)

        if product.review_set.filter(user=user).exists():
            return Response({'detail': 'Product Already Reviewed!'}, status=status.HTTP_400_BAD_REQUEST)

        if not data.get('rating') or int(data['rating']) == 0:
            return Response({'detail': 'Please select a rating from 1 to 5!'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            review = Review.objects.create(
                product=product, user=user, name=user.username,
                rating=data['rating'], comment=data['comment'],
            )
            current_rating = float(product.rating) if product.rating else 0
            current_count = product.numReviews if product.numReviews else 0
            product.rating = round(
                (current_rating * current_count + float(data['rating'])) / (current_count + 1), 2
            )
            product.numReviews = current_count + 1
            product.save()
            serializer = ReviewSerializer(review)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def placeOrder(request):
    user = request.user
    data = request.data
    orderItems = data['orderItems']

    if not orderItems or len(orderItems) == 0:
        return Response({'detail': 'No order items provided.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        order = Order.objects.create(
            user=user,
            paymentMethod=data['paymentMethod'],
            taxPrice=data['taxPrice'],
            shippingPrice=data['shippingPrice'],
            totalPrice=data['totalPrice']
        )
        ShippingAddress.objects.create(
            order=order,
            address=data['shippingAddress']['address'],
            city=data['shippingAddress']['city'],
            postalCode=data['shippingAddress']['postalCode'],
            country=data['shippingAddress']['country'],
        )
        for item in orderItems:
            try:
                product = Product.objects.get(id=item['id'])
            except Product.DoesNotExist:
                name = item.get('name') or ('ID ' + str(item['id']))
                return Response(
                    {'detail': 'Product "' + name + '" no longer exists. Please remove it from your cart.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if product.countInStock < item['qty']:
                return Response(
                    {'detail': f'"{product.name}" has only {product.countInStock} item(s) left in stock.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            OrderItem.objects.create(
                product=product, order=order,
                productName=product.name, qty=item['qty'],
                price=product.price, image=product.image.name
            )
            product.countInStock -= item['qty']
            product.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class OrderViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        mine = self.request.query_params.get('mine', False)
        if mine:
            return Order.objects.filter(user=self.request.user)
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)


class CouponViewSet(ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUserOrReadOnly]


@api_view(['POST'])
@permission_classes([AllowAny])
def applyCoupon(request):
    code = request.data.get('code', '').strip().upper()
    try:
        coupon = Coupon.objects.get(code__iexact=code)
        if not coupon.is_valid():
            return Response({'detail': 'Coupon is expired or inactive.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'discount': coupon.discount, 'code': coupon.code})
    except Coupon.DoesNotExist:
        return Response({'detail': 'Invalid coupon code.'}, status=status.HTTP_404_NOT_FOUND)


class WishlistViewSet(GenericViewSet, ListModelMixin, CreateModelMixin, DestroyModelMixin):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')

    def get_serializer_context(self):
        return {'request': self.request}


class ContactMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Message sent successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactMessageListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        messages = ContactMessage.objects.all()
        serializer = ContactMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def patch(self, request, pk):
        msg = get_object_or_404(ContactMessage, id=pk)
        msg.isRead = True
        msg.save()
        return Response({'detail': 'Marked as read.'})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboardStats(request):
    from django.db.models import Sum
    total_users = User.objects.count()
    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    total_revenue = Order.objects.filter(isPaid=True).aggregate(total=Sum('totalPrice'))['total'] or 0
    pending_orders = Order.objects.filter(isPaid=False).count()
    delivered_orders = Order.objects.filter(isDelivered=True).count()
    unread_messages = ContactMessage.objects.filter(isRead=False).count()
    recent_orders = Order.objects.order_by('-createdAt')[:5]

    return Response({
        'totalUsers': total_users,
        'totalProducts': total_products,
        'totalOrders': total_orders,
        'totalRevenue': float(total_revenue),
        'pendingOrders': pending_orders,
        'deliveredOrders': delivered_orders,
        'unreadMessages': unread_messages,
        'recentOrders': OrderSerializer(recent_orders, many=True).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def downloadInvoice(request, pk):
    order = get_object_or_404(Order, id=pk)

    if not request.user.is_staff and order.user != request.user:
        return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.enums import TA_CENTER

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm,
                                leftMargin=2*cm, rightMargin=2*cm)
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle('title', parent=styles['Heading1'], alignment=TA_CENTER,
                                     fontSize=22, textColor=colors.HexColor('#2c3e50'))
        sub_style = ParagraphStyle('sub', parent=styles['Normal'], alignment=TA_CENTER,
                                   fontSize=10, textColor=colors.grey)
        section_style = ParagraphStyle('section', parent=styles['Heading2'],
                                       fontSize=13, textColor=colors.HexColor('#2c3e50'))

        story.append(Paragraph("ShopSphere", title_style))
        story.append(Paragraph("Your trusted online store", sub_style))
        story.append(Spacer(1, 0.5*cm))
        story.append(Paragraph("<b>INVOICE</b>", section_style))
        story.append(Spacer(1, 0.3*cm))

        info_data = [
            ['Order ID:', f'#{order.id}'],
            ['Customer:', order.user.username if order.user else 'N/A'],
            ['Email:', order.user.email if order.user else 'N/A'],
            ['Date:', order.createdAt.strftime('%d %B %Y')],
            ['Payment Status:', 'Paid' if order.isPaid else 'Pending'],
            ['Delivery Status:', 'Delivered' if order.isDelivered else 'Pending'],
        ]
        info_table = Table(info_data, colWidths=[5*cm, 12*cm])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2c3e50')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 0.5*cm))

        sa = order.shippingAddress
        story.append(Paragraph("Shipping Address", section_style))
        story.append(Paragraph(f"{sa.address}, {sa.city}, {sa.postalCode}, {sa.country}", styles['Normal']))
        story.append(Spacer(1, 0.5*cm))

        story.append(Paragraph("Order Items", section_style))
        item_data = [['#', 'Product', 'Qty', 'Unit Price', 'Total']]
        for i, item in enumerate(order.orderitem_set.all(), 1):
            item_data.append([
                str(i), item.productName, str(item.qty),
                f"Rs.{item.price}", f"Rs.{(item.qty * item.price):.2f}",
            ])

        items_table = Table(item_data, colWidths=[1*cm, 9*cm, 2*cm, 3*cm, 3*cm])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f2f2f2')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(items_table)
        story.append(Spacer(1, 0.5*cm))

        summary_data = [
            ['Subtotal:', f"Rs.{float(order.totalPrice) - float(order.taxPrice) - float(order.shippingPrice):.2f}"],
            ['Shipping:', f"Rs.{order.shippingPrice}"],
            ['Tax (5%):', f"Rs.{order.taxPrice}"],
            ['TOTAL:', f"Rs.{order.totalPrice}"],
        ]
        summary_table = Table(summary_data, colWidths=[13*cm, 4*cm])
        summary_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#2c3e50')),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LINEABOVE', (0, -1), (-1, -1), 1, colors.HexColor('#2c3e50')),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 1*cm))
        story.append(Paragraph("Thank you for shopping with ShopSphere!", sub_style))

        doc.build(story)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="ShopSphere_Invoice_{order.id}.pdf"'
        return response

    except ImportError:
        return Response({'detail': 'PDF generation not available.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
