import os
import sys
import uuid
from datetime import datetime

# Set python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db
from app.models.database import User, UMKM, MenuItem
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    print("Initializing database...")
    init_db()
    
    db: Session = SessionLocal()
    try:
        # Check if we already have UMKMs
        if db.query(UMKM).count() > 0:
            print("Database already seeded with UMKMs. Skipping...")
            return
            
        print("Seeding users...")
        hashed_password = pwd_context.hash("password123")
        
        # Create some owners
        owners_data = [
            ("tini@gmail.com", "Bu Tini", "08123456789"),
            ("joko@gmail.com", "Pak Joko", "08123456780"),
            ("mahmud@gmail.com", "H. Mahmud", "08123456781"),
            ("rizky@gmail.com", "Rizky Pratama", "08123456782"),
            ("andi@gmail.com", "Mas Andi", "08123456783"),
            ("dewi@gmail.com", "Dewi Lestari", "08123456784"),
            ("sugianto@gmail.com", "Pak Sugianto", "08123456785"),
        ]
        
        owners = {}
        for email, name, phone in owners_data:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    id=str(uuid.uuid4()),
                    email=email,
                    full_name=name,
                    role="umkm_owner",
                    phone=phone,
                    hashed_password=hashed_password
                )
                db.add(user)
            owners[name] = user
            
        # Create an admin if not exists
        admin = db.query(User).filter(User.email == "admin@ipb.ac.id").first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@ipb.ac.id",
                full_name="Admin IPB",
                role="admin",
                phone="08111111111",
                hashed_password=hashed_password
            )
            db.add(admin)

        # Create additional users (students)
        for i in range(1, 20):
            email = f"student{i}@apps.ipb.ac.id"
            student = db.query(User).filter(User.email == email).first()
            if not student:
                student = User(
                    id=str(uuid.uuid4()),
                    email=email,
                    full_name=f"Student IPB {i}",
                    role="customer",
                    phone=f"0822334455{i:02d}",
                    hashed_password=hashed_password
                )
                db.add(student)

        # Create an explicit customer account as used by the user
        revandra_customer = db.query(User).filter(User.email == "revandraarevandra@apps.ipb.ac.id").first()
        if not revandra_customer:
            revandra_customer = User(
                id="f289e437-81ed-4578-a177-427d96a7004e",
                email="revandraarevandra@apps.ipb.ac.id",
                full_name="Revandra Athaya Rizkika",
                role="customer",
                phone="08123456789",
                hashed_password=hashed_password
            )
            db.add(revandra_customer)

        db.commit()
        
        # Reload owners
        for name in owners:
            owners[name] = db.query(User).filter(User.full_name == name).first()
            
        print("Seeding UMKMs...")
        
        # Approved UMKMs
        umkms_data = [
            {
                "id": "1",
                "name": "Warung Nasi Bakar Bu Tini",
                "description": "Nasi bakar dengan berbagai pilihan lauk, cita rasa tradisional Sunda yang autentik.",
                "owner": "Bu Tini",
                "location": "Kantin Fakultas Pertanian",
                "rating": 4.8,
                "status": "approved",
                "phone": "08123456789",
                "image_url": "/stores/warung-nasi-bakar.jpg",
                "menu": [
                    {"name": "Nasi Bakar Ayam", "description": "Nasi bakar dengan ayam suwir bumbu pedas", "price": 18000.0, "is_available": True, "category": "Makanan Utama", "image_url": "/food/nasi-bakar.jpg"},
                    {"name": "Nasi Bakar Ikan Peda", "description": "Nasi bakar dengan ikan peda sambal", "price": 20000.0, "is_available": True, "category": "Makanan Utama", "image_url": "/food/nasi-bakar-ikan.jpg"},
                    {"name": "Es Teh Manis", "description": "Teh manis segar", "price": 5000.0, "is_available": True, "category": "Minuman", "image_url": "/food/es-teh.jpg"}
                ]
            },
            {
                "id": "2",
                "name": "Mie Ayam Pak Joko",
                "description": "Mie ayam legendaris kampus sejak 2010, dengan kuah kaldu spesial.",
                "owner": "Pak Joko",
                "location": "Kantin Pusat IPB",
                "rating": 4.9,
                "status": "approved",
                "phone": "08123456780",
                "image_url": "/stores/mie-ayam-pak-joko.jpg",
                "menu": [
                    {"name": "Mie Ayam Biasa", "description": "Mie ayam dengan topping ayam cincang", "price": 15000.0, "is_available": True, "category": "Makanan Utama", "image_url": "/food/mie-ayam.jpg"},
                    {"name": "Mie Ayam Komplit", "description": "Mie ayam dengan bakso dan pangsit", "price": 22000.0, "is_available": True, "category": "Makanan Utama", "image_url": "/food/mie-ayam-komplit.jpg"},
                    {"name": "Bakso Urat", "description": "Bakso urat premium", "price": 12000.0, "is_available": False, "category": "Makanan Utama", "image_url": "/food/bakso.jpg"}
                ]
            },
            {
                "id": "3",
                "name": "Sate Kambing Madura",
                "description": "Sate kambing asli Madura dengan bumbu kacang khas.",
                "owner": "H. Mahmud",
                "location": "Food Court Dramaga",
                "rating": 4.7,
                "status": "approved",
                "phone": "08123456781",
                "image_url": "/stores/sate-kambing-madura.jpg",
                "menu": [
                    {"name": "Sate Kambing (10 tusuk)", "description": "Sate kambing empuk dengan bumbu kacang", "price": 35000.0, "is_available": True, "category": "Makanan Utama", "image_url": "/food/sate-kambing.jpg"},
                    {"name": "Sate Ayam (10 tusuk)", "description": "Sate ayam dengan bumbu kacang", "price": 25000.0, "is_available": True, "category": "Makanan Utama", "image_url": "/food/sate-ayam.jpg"},
                    {"name": "Lontong", "description": "Lontong untuk pelengkap sate", "price": 5000.0, "is_available": True, "category": "Pelengkap", "image_url": "/food/lontong.jpg"}
                ]
            },
            {
                "id": "4",
                "name": "Kedai Kopi Mahasiswa",
                "description": "Kopi specialty dengan harga mahasiswa, tempat nongkrong favorit.",
                "owner": "Rizky Pratama",
                "location": "Gedung Rektorat",
                "rating": 4.6,
                "status": "approved",
                "phone": "08123456782",
                "image_url": "/stores/kedai-kopi.jpg",
                "menu": [
                    {"name": "Kopi Arabica", "description": "Kopi arabica single origin", "price": 18000.0, "is_available": True, "category": "Minuman", "image_url": "/food/kopi-arabica.jpg"},
                    {"name": "Es Kopi Susu", "description": "Kopi susu dengan gula aren", "price": 15000.0, "is_available": True, "category": "Minuman", "image_url": "/food/es-kopi-susu.jpg"},
                    {"name": "Roti Bakar", "description": "Roti bakar dengan various toppings", "price": 12000.0, "is_available": True, "category": "Makanan Ringan", "image_url": "/food/roti-bakar.jpg"}
                ]
            },
            # Pending UMKMs
            {
                "id": "5",
                "name": "Ayam Geprek Mas Andi",
                "description": "Ayam geprek dengan level pedas yang bisa dipilih, cocok untuk pecinta pedas.",
                "owner": "Mas Andi",
                "location": "Kantin FMIPA",
                "rating": 0.0,
                "status": "pending",
                "phone": "08123456783",
                "image_url": "/stores/ayam-geprek.jpg",
                "menu": [
                    {"name": "Ayam Geprek Original", "description": "Ayam geprek dengan sambal bawang", "price": 17000.0, "is_available": True, "category": "Makanan Utama", "image_url": "/food/ayam-geprek.jpg"}
                ]
            },
            {
                "id": "6",
                "name": "Juice Corner Sehat",
                "description": "Berbagai jus buah segar untuk gaya hidup sehat mahasiswa.",
                "owner": "Dewi Lestari",
                "location": "GKU IPB",
                "rating": 0.0,
                "status": "pending",
                "phone": "08123456784",
                "image_url": "/stores/juice-corner.jpg",
                "menu": [
                    {"name": "Jus Alpukat", "description": "Jus alpukat segar dengan susu", "price": 12000.0, "is_available": True, "category": "Minuman", "image_url": "/food/jus-alpukat.jpg"}
                ]
            },
            {
                "id": "7",
                "name": "Martabak Mini Enak",
                "description": "Martabak mini dengan berbagai topping, pas untuk camilan.",
                "owner": "Pak Sugianto",
                "location": "Asrama Mahasiswa",
                "rating": 0.0,
                "status": "pending",
                "phone": "08123456785",
                "image_url": "/stores/martabak-mini.jpg",
                "menu": [
                    {"name": "Martabak Coklat Keju", "description": "Martabak mini dengan topping coklat dan keju", "price": 15000.0, "is_available": True, "category": "Makanan Ringan", "image_url": "/food/martabak.jpg"}
                ]
            }
        ]
        
        for umkm_info in umkms_data:
            owner_user = owners.get(umkm_info["owner"])
            if not owner_user:
                continue
                
            umkm = UMKM(
                id=umkm_info["id"],
                owner_id=owner_user.id,
                name=umkm_info["name"],
                description=umkm_info["description"],
                location=umkm_info["location"],
                rating=umkm_info["rating"],
                status=umkm_info["status"],
                phone=umkm_info["phone"],
                image_url=umkm_info["image_url"]
            )
            db.add(umkm)
            
            # Seed menu items
            for m in umkm_info["menu"]:
                menu_item = MenuItem(
                    id=str(uuid.uuid4()),
                    umkm_id=umkm.id,
                    name=m["name"],
                    description=m["description"],
                    price=m["price"],
                    is_available=m["is_available"],
                    category=m["category"],
                    image_url=m["image_url"]
                )
                db.add(menu_item)
                
        db.commit()
        print("Successfully seeded UMKMs and menu items!")
        
    except Exception as e:
        print(f"Failed to seed database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
