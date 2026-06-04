import os
import sys
import uuid

# Set python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db
from app.models.database import User, UMKM, MenuItem
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_role_users():
    print("Connecting to database...")
    db: Session = SessionLocal()
    try:
        # Hashing correct passwords
        pw_mahasiswa = pwd_context.hash("MahasiswaIPB123")
        pw_butini = pwd_context.hash("WarungBuTini123")
        pw_admin = pwd_context.hash("AdminIPB123")
        pw_revandra = pwd_context.hash("Inirepan12345")
        
        print("Checking/Creating role users...")
        
        # 1. Mahasiswa
        mahasiswa = db.query(User).filter(User.email == "mahasiswa@apps.ipb.ac.id").first()
        if not mahasiswa:
            mahasiswa = User(
                id="11111111-2222-3333-4444-555555555555",
                email="mahasiswa@apps.ipb.ac.id",
                full_name="Mahasiswa IPB",
                role="customer",
                phone="082211111111",
                hashed_password=pw_mahasiswa
            )
            db.add(mahasiswa)
            print("Mahasiswa user created.")
        else:
            mahasiswa.hashed_password = pw_mahasiswa
            print("Mahasiswa user password updated.")
 
        # 2. Bu Tini (UMKM Owner)
        butini = db.query(User).filter(User.email == "butini@apps.ipb.ac.id").first()
        if not butini:
            butini = User(
                id="22222222-3333-4444-5555-666666666666",
                email="butini@apps.ipb.ac.id",
                full_name="Bu Tini",
                role="umkm_owner",
                phone="082222222222",
                hashed_password=pw_butini
            )
            db.add(butini)
            print("Bu Tini user created.")
        else:
            butini.hashed_password = pw_butini
            print("Bu Tini user password updated.")
 
        # 3. Admin
        admin = db.query(User).filter(User.email == "admin@apps.ipb.ac.id").first()
        if not admin:
            admin = User(
                id="33333333-4444-5555-6666-777777777777",
                email="admin@apps.ipb.ac.id",
                full_name="Admin IPB",
                role="admin",
                phone="082233333333",
                hashed_password=pw_admin
            )
            db.add(admin)
            print("Admin user created.")
        else:
            admin.hashed_password = pw_admin
            print("Admin user password updated.")
            
        # 4. Developer / Super Admin
        revandra = db.query(User).filter(User.email == "revandraarevandra@apps.ipb.ac.id").first()
        if not revandra:
            revandra = User(
                id="f289e437-81ed-4578-a177-427d96a7004e",
                email="revandraarevandra@apps.ipb.ac.id",
                full_name="Revandra Athaya Rizkika",
                role="customer",
                phone="08123456789",
                hashed_password=pw_revandra
            )
            db.add(revandra)
            print("Revandra developer user created.")
        else:
            revandra.hashed_password = pw_revandra
            print("Revandra developer user password updated.")
            
        db.commit()
        
        # Reload users to get IDs
        mahasiswa = db.query(User).filter(User.email == "mahasiswa@apps.ipb.ac.id").first()
        butini = db.query(User).filter(User.email == "butini@apps.ipb.ac.id").first()
        admin = db.query(User).filter(User.email == "admin@apps.ipb.ac.id").first()
        
        print("Checking/Updating UMKM for Bu Tini...")
        # Check if "Warung Nasi Bakar Bu Tini" or similar exists, if so associate it with Bu Tini's ID
        umkm = db.query(UMKM).filter(UMKM.name.like("%Bu Tini%")).first()
        if umkm:
            umkm.owner_id = butini.id
            print(f"Associated UMKM '{umkm.name}' with owner Bu Tini ({butini.id}).")
        else:
            # Create "Warung Nasi Bakar Bu Tini"
            umkm = UMKM(
                id="11111111-1111-1111-1111-111111111111",
                owner_id=butini.id,
                name="Warung Nasi Bakar Bu Tini",
                description="Nasi bakar dengan berbagai pilihan lauk, cita rasa tradisional Sunda yang autentik.",
                location="Kantin Fakultas Pertanian",
                rating=4.8,
                status="approved",
                phone="08123456789",
                image_url="/stores/warung-nasi-bakar.jpg"
            )
            db.add(umkm)
            print("Created UMKM 'Warung Nasi Bakar Bu Tini' for Bu Tini.")
            
            # Add some menu items
            menu_items = [
                {"name": "Nasi Bakar Ayam", "description": "Nasi bakar dengan ayam suwir bumbu pedas", "price": 18000.0, "is_available": True, "category": "Makanan Utama", "image_url": "/food/nasi-bakar.jpg"},
                {"name": "Nasi Bakar Ikan Peda", "description": "Nasi bakar dengan ikan peda sambal", "price": 20000.0, "is_available": True, "category": "Makanan Utama", "image_url": "/food/nasi-bakar-ikan.jpg"},
                {"name": "Es Teh Manis", "description": "Teh manis segar", "price": 5000.0, "is_available": True, "category": "Minuman", "image_url": "/food/es-teh.jpg"}
            ]
            for m in menu_items:
                mi = MenuItem(
                    id=str(uuid.uuid4()),
                    umkm_id=umkm.id,
                    name=m["name"],
                    description=m["description"],
                    price=m["price"],
                    is_available=m["is_available"],
                    category=m["category"],
                    image_url=m["image_url"]
                )
                db.add(mi)
            print("Added menu items for Warung Nasi Bakar Bu Tini.")
            
        db.commit()
        print("Database seed completed successfully!")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_role_users()
