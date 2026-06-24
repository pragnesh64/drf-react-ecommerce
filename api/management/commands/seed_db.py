from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Category, Brand, Product, Coupon, Review
from decimal import Decimal
from datetime import date, timedelta
import random


CATEGORIES = [
    ("Electronics", "Latest gadgets and electronic devices"),
    ("Clothing", "Trendy fashion and apparel"),
    ("Books", "Wide range of books and educational material"),
    ("Home & Kitchen", "Essential home and kitchen products"),
    ("Sports", "Sports and fitness equipment"),
]

BRANDS = [
    ("Samsung", "Global electronics brand"),
    ("Nike", "Leading sportswear brand"),
    ("Apple", "Premium consumer electronics"),
    ("Penguin", "Popular book publisher"),
    ("Philips", "Trusted home appliances brand"),
]

PRODUCTS = [
    ("Samsung Galaxy S23", 0, 0, 7599.99, 15, "Latest flagship smartphone with 200MP camera."),
    ("Samsung 55in QLED TV", 0, 0, 8999.99, 8, "4K QLED Smart TV with Alexa built-in."),
    ("Apple iPhone 15 Pro", 0, 2, 9999.99, 10, "Apple's most powerful iPhone with A17 Pro chip."),
    ("Apple MacBook Air M2", 0, 2, 9999.00, 7, "Ultra-thin laptop with M2 chip, 18hr battery."),
    ("Philips Air Fryer", 0, 4, 8999.00, 25, "Digital air fryer, 6.2L, rapid air technology."),
    ("Philips Smart Bulb", 0, 4, 1499.00, 50, "Wi-Fi enabled smart LED bulb, 16M colors."),
    ("Nike Air Max 270", 0, 1, 5999.00, 20, "Lightweight running shoes with Air cushioning."),
    ("Nike Dri-FIT T-Shirt", 0, 1, 1999.00, 40, "Moisture-wicking athletic T-shirt."),
    ("Nike Sports Bag", 0, 1, 3499.00, 18, "Large capacity gym bag with shoe pocket."),
    ("Clean Code Book", 0, 3, 799.00, 30, "A handbook of agile software craftsmanship."),
    ("Django for Beginners", 0, 3, 699.00, 22, "Step-by-step guide to building Django web apps."),
    ("React JS Complete Guide", 0, 3, 749.00, 28, "Comprehensive React.js guide from basics to advanced."),
    ("Stainless Steel Water Bottle", 0, 4, 599.00, 60, "BPA-free 1L insulated water bottle."),
    ("Yoga Mat", 0, 4, 1299.00, 35, "Non-slip TPE yoga mat with carry strap."),
    ("Resistance Bands Set", 0, 4, 899.00, 45, "Set of 5 resistance bands for home workouts."),
    ("Wireless Earbuds", 0, 0, 2499.00, 30, "True wireless earbuds with 30hr playtime."),
    ("Mechanical Keyboard", 0, 0, 4999.00, 12, "RGB mechanical keyboard with blue switches."),
    ("USB-C Hub 7-in-1", 0, 0, 1999.00, 25, "Multiport USB-C hub with HDMI, USB, SD card."),
    ("Linen Formal Shirt", 0, 1, 1299.00, 35, "Premium linen formal shirt, multiple colors."),
    ("Running Track Pants", 0, 1, 1499.00, 30, "Lightweight track pants with zip pockets."),
]

COUPONS = [
    ("WELCOME10", 10, date.today() + timedelta(days=90)),
    ("SAVE20", 20, date.today() + timedelta(days=60)),
    ("FLASH15", 15, date.today() + timedelta(days=30)),
    ("FESTIVE25", 25, date.today() + timedelta(days=45)),
    ("STUDENT5", 5, date.today() + timedelta(days=120)),
]


class Command(BaseCommand):
    help = 'Seed database with sample ShopSphere data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('Seeding ShopSphere database...'))

        # Create superuser if not exists
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@shopsphere.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('  Created admin user (admin / admin123)'))

        # Create test users
        for i in range(1, 11):
            username = f'user{i}'
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(username, f'user{i}@shopsphere.com', 'pass1234')
        self.stdout.write(self.style.SUCCESS('  Created 10 test users (pass: pass1234)'))

        # Create categories
        cat_objs = []
        for title, desc in CATEGORIES:
            cat, _ = Category.objects.get_or_create(title=title, defaults={'description': desc})
            cat_objs.append(cat)
        self.stdout.write(self.style.SUCCESS('  Created 5 categories'))

        # Create brands
        brand_objs = []
        for title, desc in BRANDS:
            brand, _ = Brand.objects.get_or_create(title=title, defaults={'description': desc})
            brand_objs.append(brand)
        self.stdout.write(self.style.SUCCESS('  Created 5 brands'))

        # Create products
        admin_user = User.objects.get(username='admin')
        for name, brand_idx, cat_idx, price, stock, desc in PRODUCTS:
            if not Product.objects.filter(name=name).exists():
                Product.objects.create(
                    user=admin_user,
                    name=name,
                    brand=brand_objs[brand_idx],
                    category=cat_objs[cat_idx],
                    description=desc,
                    price=Decimal(str(price)),
                    countInStock=stock,
                    rating=Decimal(str(round(random.uniform(3.5, 5.0), 1))),
                    numReviews=random.randint(5, 50),
                )
        self.stdout.write(self.style.SUCCESS('  Created 20 products'))

        # Create coupons
        for code, discount, expiry in COUPONS:
            Coupon.objects.get_or_create(code=code, defaults={
                'discount': discount, 'expiryDate': expiry, 'isActive': True
            })
        self.stdout.write(self.style.SUCCESS('  Created 5 coupons'))

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write('')
        self.stdout.write('  Admin Login: admin / admin123')
        self.stdout.write('  Test Users:  user1–user10 / pass1234')
        self.stdout.write('  Coupon Codes: WELCOME10, SAVE20, FLASH15, FESTIVE25, STUDENT5')
