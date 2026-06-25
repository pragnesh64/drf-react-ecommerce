# ShopSphere — College Demo Guide

## Before You Go to College

### One-Time Setup (Do this at home once)
Open PowerShell in the project folder and run these:

```
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_db
python manage.py collectstatic --noinput
```

---

## On Demo Day — Starting the Project

### Method 1: Double-Click (Easiest)
Just double-click **`START_PROJECT.bat`** in the project folder.
- It will open the browser automatically
- Server starts at http://127.0.0.1:8000

### Method 2: Manual Command
Open PowerShell in project folder:
```
python manage.py runserver
```
Then open browser → http://127.0.0.1:8000

---

## Login Credentials

| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin    | admin123 |
| User  | user1    | pass1234 |
| User  | user2    | pass1234 |

## Coupon Codes
| Code       | Discount |
|------------|----------|
| WELCOME10  | 10% off  |
| SAVE20     | 20% off  |
| FLASH15    | 15% off  |
| FESTIVE25  | 25% off  |
| STUDENT5   | 5% off   |

---

## Demo Flow (Show This to Sir)

### Step 1 — Register / Login as User
1. Open http://127.0.0.1:8000
2. Click **Login** → Username: `user1`, Password: `pass1234`

### Step 2 — Browse Products
1. Homepage shows all products with search bar
2. Type in search box → products filter live (no button needed)
3. Click any product → see product details and reviews

### Step 3 — Add to Wishlist
1. On any product page → click **"Add to Wishlist"**
2. Click **Wishlist** in navbar → shows saved products

### Step 4 — Add to Cart & Apply Coupon
1. Add a product to cart
2. Go to Cart page
3. Enter coupon code **SAVE20** → click Apply
4. See 20% discount applied on total

### Step 5 — Place Order
1. Click **Proceed to Checkout**
2. Fill shipping address
3. Select **Cash on Delivery**
4. Click **Place Order**
5. Order is placed ✓

### Step 6 — Download Invoice PDF
1. After order is placed, you're on Order Details page
2. Click **"Download Invoice PDF"** button
3. PDF downloads automatically with order details

### Step 7 — Submit Contact Form
1. Click **Contact** in navbar
2. Fill Name, Email, Subject, Message
3. Submit → success message shown

### Step 8 — Logout and Login as Admin
1. Logout from user1
2. Login → Username: `admin`, Password: `admin123`

### Step 9 — Admin Dashboard
1. Click **Dashboard** in navbar (only visible to admin)
2. Shows: Total Users, Products, Orders, Revenue
3. Shows charts (Bar + Doughnut)
4. Shows recent orders table

### Step 10 — Manage Products
1. Click **Manage Products** in navbar
2. Add a new product → fill details → Save
3. Edit existing product
4. Delete a product

### Step 11 — Brands & Categories
1. Click **Brands & Categories** in navbar
2. Add a new brand or category
3. Edit / Delete

### Step 12 — Admin Panel (Django)
1. Open http://127.0.0.1:8000/admin
2. Login: admin / admin123
3. Show: Orders, Products, Coupons, Wishlist, Contact Messages

---

## If Something Goes Wrong

### "Site not opening" (Connection Refused)
Server is not running. Run:
```
python manage.py runserver
```

### "No products showing"
Database is empty. Run:
```
python manage.py seed_db
```

### "Login not working"
Run reset script:
Double-click **RESET_AND_SEED.bat** → type YES

### "Page looks unstyled / broken"
Static files missing. Run:
```
python manage.py collectstatic --noinput
```

### "Error on any page"
Hard refresh the browser: **Ctrl + Shift + R**

---

## Project Modules (Tell Sir These)

1. **User Module** — Register, Login, Profile, JWT Authentication
2. **Product Module** — Add, Edit, Delete, Search, Filter
3. **Order Module** — Place Order, Order History, Order Details
4. **Coupon Module** — Create coupons, Apply at checkout
5. **Wishlist Module** — Save products, Remove from wishlist
6. **Contact Module** — Contact form, Admin reads messages
7. **Dashboard Module** — Analytics with charts
8. **Invoice Module** — PDF invoice generation per order
9. **Brand & Category Module** — Full CRUD

## Tech Stack (Tell Sir These)

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React.js, React Bootstrap, Chart.js |
| Backend  | Django 4.1, Django REST Framework |
| Database | SQLite3                           |
| Auth     | JWT (JSON Web Tokens)             |
| PDF      | ReportLab                         |
| Styling  | CSS3, Bootstrap 5                 |
