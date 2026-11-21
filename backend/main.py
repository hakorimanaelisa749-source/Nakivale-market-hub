# backend/main.py - Vela Backend in Python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
import os

app = FastAPI(title="VELA Uganda")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Supabase connection - put keys in .env
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
MOMO_CODE = "47852783"

def format_money(n: int):
    return f"{n:,}"

# 1. ADD PRODUCT - replaces your submitProduct()
@app.post("/add-product")
async def add_product(name: str, category: str, price: int, owner_id: str, shop: str, shop_wa: str, image: UploadFile = File(None), image_link: str = ""):
    image_url = image_link

    # If seller uploaded file, save to Supabase Storage, not Database
    if image:
        file_name = f"{owner_id}-{name}.jpg"
        content = await image.read()
        supabase.storage.from_("product-images").upload(file_name, content, {"upsert": "true"})
        image_url = supabase.storage.from_("product-images").get_public_url(file_name)

    if not image_url:
        return {"error": "Fill name, price, photo"}

    product = {
        "owner_id": owner_id, "name": name, "category": category,
        "price": price, "img": image_url, "shop": shop, "shop_wa": shop_wa
    }
    supabase.table("products").insert(product).execute()
    return {"message": f"{name} Posted!"}

# 2. GET PRODUCTS - replaces onSnapshot
@app.get("/products")
def get_products():
    res = supabase.table("products").select("*").order("created_at", desc=True).execute()
    return {"products": res.data}

# 3. CHECKOUT - replaces checkoutCart()
@app.post("/checkout")
def checkout(cart: list, buyer_id: str, buyer_email: str, buyer_phone: str, buyer_zone: str, buyer_details: str, momo_tx: str = ""):
    for item in cart:
        price = item["price"]
        commission = round(price * 0.05)  # Your 5% Vela fee
        supabase.table("orders").insert({
            "product_id": item["id"], "product_name": item["name"], "product_img": item["img"],
            "price": price, "commission": commission, "seller_earning": price - commission,
            "buyer_id": buyer_id, "buyer_email": buyer_email, "buyer_phone": buyer_phone,
            "buyer_zone": buyer_zone, "buyer_details": buyer_details, "momo_tx": momo_tx,
            "seller_id": item["owner_id"], "seller_shop": item["shop"],
            "status": "awaiting_payment", "qty": item["qty"]
        }).execute()
    return {"message": f"Order Created! Pay to VELA {MOMO_CODE}"}

# 4. ORDER STATUS - replaces markPaid / markDelivered / confirmReceived
@app.post("/order/{order_id}/status")
def update_status(order_id: str, status: str):
    # status = paid, delivered, completed
    supabase.table("orders").update({"status": status}).eq("id", order_id).execute()
    return {"message": f"Order {status}"}

# 5. MY ORDERS
@app.get("/orders/buyer/{buyer_id}")
def buyer_orders(buyer_id: str):
    res = supabase.table("orders").select("*").eq("buyer_id", buyer_id).order("created_at", desc=True).execute()
    return {"orders": res.data}

@app.get("/orders/seller/{seller_id}")
def seller_orders(seller_id: str):
    res = supabase.table("orders").select("*").eq("seller_id", seller_id).order("created_at", desc=True).execute()
    return {"orders": res.data}

# 6. SAVE SELLER PROFILE
@app.post("/save-profile")
def save_profile(user_id: str, email: str, shop_name: str, wa: str, location: str):
    supabase.table("sellers").upsert({
        "id": user_id, "email": email, "shop_name": shop_name, "wa": wa, "location": location
    }).execute()
    return {"message": "Saved! You can now sell."}
