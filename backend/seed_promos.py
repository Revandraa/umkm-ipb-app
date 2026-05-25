"""
Script untuk seed data promo ke database
"""
import os
import sys
import uuid
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db
from app.models.database import Promo

def seed_promos():
    print("Initializing database...")
    init_db()
    
    db: Session = SessionLocal()
    try:
        if db.query(Promo).count() > 0:
            print("Promos already seeded. Skipping...")
            return

        print("Seeding promos...")
        now = datetime.utcnow()

        promos_data = [
            {
                "id": str(uuid.uuid4()),
                "title": "Promo Makan Siang Hemat",
                "description": "Diskon 20% untuk semua pesanan makan siang! Berlaku untuk semua UMKM di kampus. Pesan sekarang dan hemat lebih banyak.",
                "code": "SIANGHEMAT20",
                "discount_type": "percent",
                "discount_value": 20,
                "min_order": 15000,
                "max_discount": 10000,
                "umkm_id": None,
                "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
                "valid_from": now - timedelta(days=1),
                "valid_until": now + timedelta(days=30),
                "is_active": True,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Gratis Ongkir Weekend",
                "description": "Nikmati gratis biaya layanan setiap Sabtu & Minggu. Berlaku untuk semua menu di seluruh UMKM IPB.",
                "code": "WEEKENDFREE",
                "discount_type": "fixed",
                "discount_value": 5000,
                "min_order": 20000,
                "max_discount": None,
                "umkm_id": None,
                "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
                "valid_from": now - timedelta(days=2),
                "valid_until": now + timedelta(days=14),
                "is_active": True,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Flash Sale Mahasiswa Baru",
                "description": "Spesial buat mahasiswa baru! Potongan langsung Rp 8.000 untuk semua pesanan pertama kamu di portal UMKM IPB.",
                "code": "MABARU8K",
                "discount_type": "fixed",
                "discount_value": 8000,
                "min_order": 25000,
                "max_discount": None,
                "umkm_id": None,
                "image_url": "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80",
                "valid_from": now - timedelta(days=5),
                "valid_until": now + timedelta(days=60),
                "is_active": True,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Double Diskon Selasa Hemat",
                "description": "Setiap Selasa adalah hari hemat! Dapatkan potongan 25% dengan minimal order Rp 30.000. Maksimal diskon Rp 15.000.",
                "code": "SELASAHEMAT",
                "discount_type": "percent",
                "discount_value": 25,
                "min_order": 30000,
                "max_discount": 15000,
                "umkm_id": None,
                "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
                "valid_from": now - timedelta(days=3),
                "valid_until": now + timedelta(days=21),
                "is_active": True,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Promo Beli 2 Gratis 1 Item",
                "description": "Beli 2 porsi, gratis 1 minuman! Potongan langsung Rp 6.000 dari tagihan kamu.",
                "code": "BELI2FREE1",
                "discount_type": "fixed",
                "discount_value": 6000,
                "min_order": 18000,
                "max_discount": None,
                "umkm_id": None,
                "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
                "valid_from": now,
                "valid_until": now + timedelta(days=7),
                "is_active": True,
            },
        ]

        for p in promos_data:
            promo = Promo(**p)
            db.add(promo)

        db.commit()
        print(f"Successfully seeded {len(promos_data)} promos!")

    except Exception as e:
        print(f"Failed to seed promos: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_promos()
