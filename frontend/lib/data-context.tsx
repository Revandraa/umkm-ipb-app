"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { mockUMKMs, pendingUMKMs, type UMKM, type MenuItem } from "./mock-data"

export interface Order {
  id: string
  menuItem: MenuItem & { vendorName: string; vendorId: string; vendorLocation?: string }
  quantity: number
  pickupTime: string
  totalPrice: number
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled"
  createdAt: string
  customerName: string
  paymentProof?: string
  notes?: string
  promoCode?: string
}

export interface Promo {
  id: string
  title: string
  description: string | null
  code: string
  discount_type: "percent" | "fixed"
  discount_value: number
  min_order: number
  max_discount: number | null
  umkm_id: string | null
  image_url: string | null
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface DataContextType {
  approvedUMKMs: UMKM[]
  pendingUMKMs: UMKM[]
  suspendedUMKMs: UMKM[]
  orders: Order[]
  promos: Promo[]
  activeUsersCount: number
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCreatedAt: string
  totalOrdersCount: number
  completedOrdersCount: number
  totalSpent: number
  approveUMKM: (umkmId: string) => void
  rejectUMKM: (umkmId: string) => void
  suspendUMKM: (umkmId: string, reason: string) => void
  reactivateUMKM: (umkmId: string) => void
  updateMenuItem: (umkmId: string, menuItemId: string, updates: Partial<MenuItem>) => void
  deleteMenuItem: (umkmId: string, menuItemId: string) => void
  addMenuItem: (umkmId: string, menuItem: Omit<MenuItem, "id">) => void
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => Promise<Order>
  uploadPaymentProof: (orderId: string, file: File) => Promise<boolean>
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  updateMenuStock: (vendorId: string, menuItemId: string, quantity: number) => void
  addPromo: (promo: Omit<Promo, "id" | "created_at" | "updated_at">) => Promise<Promo>
  updatePromo: (promoId: string, updates: Partial<Omit<Promo, "id">>) => Promise<Promo>
  deletePromo: (promoId: string) => Promise<boolean>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [approvedUMKMs, setApprovedUMKMs] = useState<UMKM[]>(mockUMKMs.filter(u => u.isApproved))
  const [pending, setPending] = useState<UMKM[]>(pendingUMKMs)
  const [suspendedUMKMs, setSuspendedUMKMs] = useState<UMKM[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [promos, setPromos] = useState<Promo[]>([])
  const [activeUsersCount, setActiveUsersCount] = useState(1234)
  const [customerId, setCustomerId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerCreatedAt, setCustomerCreatedAt] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial data from backend
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const mapBackendUMKMToFrontend = (u: any): UMKM => ({
      id: u.id,
      name: u.name,
      description: u.description || "",
      owner: "Pemilik Toko",
      location: u.location,
      rating: u.rating || 0,
      isApproved: u.status === "approved",
      isPending: u.status === "pending",
      createdAt: u.created_at || new Date().toISOString(),
      image: u.image_url || "/placeholder.jpg",
      menu: (u.menu_items || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        description: m.description || "",
        price: parseFloat(m.price) || 0,
        stock: 99,
        category: m.category || "Umum",
        image: m.image_url || "/placeholder.jpg",
        isAvailable: m.is_available ?? true,
      })),
      suspensionReason: u.rejection_reason || undefined,
    });

    const fetchData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        
        // Fetch Approved
        const approvedRes = await fetch(`${backendUrl}/umkm?limit=50`, { signal: controller.signal });
        let approvedResData: any = [];
        if (approvedRes.ok) {
          const data = await approvedRes.json();
          if (isMounted && Array.isArray(data)) {
            setApprovedUMKMs(data.map(mapBackendUMKMToFrontend));
            approvedResData = data;
          }
        }

        // Fetch Pending (Admin only)
        const pendingRes = await fetch(`${backendUrl}/umkm/admin/pending`, { signal: controller.signal });
        if (pendingRes.ok) {
          const data = await pendingRes.json();
          if (isMounted && Array.isArray(data)) {
            setPending(data.map(mapBackendUMKMToFrontend));
          }
        }

        // Fetch Suspended (Admin only)
        const suspendedRes = await fetch(`${backendUrl}/umkm/admin/suspended`, { signal: controller.signal });
        if (suspendedRes.ok) {
          const data = await suspendedRes.json();
          if (isMounted && Array.isArray(data)) {
            setSuspendedUMKMs(data.map(mapBackendUMKMToFrontend));
          }
        }

        // Fetch Active Users Count
        const usersCountRes = await fetch(`${backendUrl}/users/count`, { signal: controller.signal });
        if (usersCountRes.ok) {
          const count = await usersCountRes.json();
          if (isMounted && typeof count === "number") {
            setActiveUsersCount(count);
          }
        }

        // Fetch Customer from localStorage (real user dari auth)
        let currentCustomerId = "";
        const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (isMounted) {
            setCustomerId(userData.id || "");
            setCustomerName(userData.full_name || "");
            setCustomerEmail(userData.email || "");
            setCustomerPhone(userData.phone || "");
            setCustomerCreatedAt(userData.created_at || "");
            currentCustomerId = userData.id || "";
          }
        } else {
          // Fallback ke mock student
          const mockStudentEmail = "student1@apps.ipb.ac.id";
          const customerRes = await fetch(`${backendUrl}/users/email/${mockStudentEmail}`, { signal: controller.signal });
          if (customerRes.ok) {
            const customerData = await customerRes.json();
            if (isMounted) {
              setCustomerId(customerData.id);
              setCustomerName(customerData.full_name);
              setCustomerEmail(customerData.email || "");
              setCustomerPhone(customerData.phone || "");
              setCustomerCreatedAt(customerData.created_at || "");
              currentCustomerId = customerData.id;
            }
          }
        }

        // Fetch Promos (try all first for admin/management, fallback to active)
        let promosRes = await fetch(`${backendUrl}/promos/all`, { signal: controller.signal });
        if (!promosRes.ok) {
          promosRes = await fetch(`${backendUrl}/promos`, { signal: controller.signal });
        }
        if (promosRes.ok) {
          const promosData = await promosRes.json();
          if (isMounted && Array.isArray(promosData)) {
            setPromos(promosData);
          }
        }

        // Fetch All Orders
        const ordersRes = await fetch(`${backendUrl}/orders/all`, { signal: controller.signal });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (isMounted && Array.isArray(ordersData)) {
            // Map backend OrderResponse to frontend Order
            // Wait, we need to lookup UMKM and MenuItem
            // We'll do this in a separate state update or inside a function
            const mappedOrders: Order[] = ordersData.map((o: any) => {
              // Find UMKM and MenuItem
              let matchedMenuItem: MenuItem | undefined = undefined;
              let vendorName = "Unknown Vendor";
              let vendorLocation = "";
              
              if (o.items && o.items.length > 0) {
                 const firstItem = o.items[0];
                 // Find from approvedRes data
                 approvedResData?.forEach((u: any) => {
                    const m = u.menu_items?.find((mi: any) => mi.id === firstItem.menu_item_id);
                    if (m) {
                       matchedMenuItem = {
                          id: m.id,
                          name: m.name,
                          description: m.description || "",
                          price: parseFloat(m.price),
                          stock: 99, // mock stock
                          category: m.category,
                          image: m.image_url || "/food/placeholder.jpg",
                          isAvailable: m.is_available
                       };
                       vendorName = u.name;
                       vendorLocation = u.location;
                    }
                 });
              }

              return {
                id: o.id,
                menuItem: matchedMenuItem ? {
                  ...(matchedMenuItem as MenuItem),
                  vendorName,
                  vendorId: o.umkm_id,
                  vendorLocation
                } : {
                  id: "unknown", name: "Unknown Item", description: "", price: 0, stock: 0, category: "", image: "", isAvailable: false, vendorName: "Unknown", vendorId: o.umkm_id
                },
                quantity: o.items && o.items.length > 0 ? o.items[0].quantity : 1,
                pickupTime: new Date(o.pickup_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                totalPrice: parseFloat(o.total_price),
                status: o.status,
                createdAt: o.created_at,
                customerName: currentCustomerId === o.customer_id ? (currentCustomerId ? "Student IPB 1" : "Customer") : "Customer",
                paymentProof: o.payment_proof || undefined,
                notes: o.notes || undefined,
              };
            });
            setOrders(mappedOrders);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn("Backend unreachable, using mock data", err.message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const approveUMKM = (umkmId: string) => {
    const umkm = pending.find(u => u.id === umkmId)
    if (umkm) {
      const approvedUMKM: UMKM = {
        ...umkm,
        isApproved: true,
        isPending: false,
        rating: 0,
      }
      setPending(items => items.filter(item => item.id !== umkmId))
      setApprovedUMKMs(items => [...items, approvedUMKM])
    }
  }

  const rejectUMKM = (umkmId: string) => {
    setPending(items => items.filter(item => item.id !== umkmId))
  }

  const suspendUMKM = (umkmId: string, reason: string) => {
    const umkm = approvedUMKMs.find(u => u.id === umkmId)
    if (umkm) {
      const suspendedUMKM: UMKM = {
        ...umkm,
        isApproved: false,
        suspensionReason: reason,
        suspendedAt: new Date().toISOString(),
      }
      setApprovedUMKMs(items => items.filter(item => item.id !== umkmId))
      setSuspendedUMKMs(items => [...items, suspendedUMKM])
    }
  }

  const reactivateUMKM = (umkmId: string) => {
    const umkm = suspendedUMKMs.find(u => u.id === umkmId)
    if (umkm) {
      const reactivatedUMKM: UMKM = {
        ...umkm,
        isApproved: true,
        suspensionReason: undefined,
        suspendedAt: undefined,
      }
      setSuspendedUMKMs(items => items.filter(item => item.id !== umkmId))
      setApprovedUMKMs(items => [...items, reactivatedUMKM])
    }
  }

  const updateMenuItem = (umkmId: string, menuItemId: string, updates: Partial<MenuItem>) => {
    setApprovedUMKMs(umkms => 
      umkms.map(umkm => {
        if (umkm.id === umkmId) {
          return {
            ...umkm,
            menu: umkm.menu.map(item => 
              item.id === menuItemId ? { ...item, ...updates } : item
            )
          }
        }
        return umkm
      })
    )
  }

  const deleteMenuItem = (umkmId: string, menuItemId: string) => {
    setApprovedUMKMs(umkms => 
      umkms.map(umkm => {
        if (umkm.id === umkmId) {
          return {
            ...umkm,
            menu: umkm.menu.filter(item => item.id !== menuItemId)
          }
        }
        return umkm
      })
    )
  }

  const addMenuItem = (umkmId: string, menuItem: Omit<MenuItem, "id">) => {
    setApprovedUMKMs(umkms => 
      umkms.map(umkm => {
        if (umkm.id === umkmId) {
          const newItem: MenuItem = {
            ...menuItem,
            id: `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }
          return {
            ...umkm,
            menu: [...umkm.menu, newItem]
          }
        }
        return umkm
      })
    )
  }

  const updateMenuStock = (vendorId: string, menuItemId: string, quantity: number) => {
    setApprovedUMKMs(umkms => 
      umkms.map(umkm => {
        if (umkm.id === vendorId) {
          return {
            ...umkm,
            menu: umkm.menu.map(item => {
              if (item.id === menuItemId) {
                const newStock = item.stock - quantity
                return { 
                  ...item, 
                  stock: newStock,
                  isAvailable: newStock > 0
                }
              }
              return item
            })
          }
        }
        return umkm
      })
    )
  }

  const addOrder = async (orderData: Omit<Order, "id" | "createdAt" | "status">): Promise<Order> => {
    const tempId = `ORD-TEMP-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: tempId,
      status: "pending",
      createdAt: new Date().toISOString(),
      customerName: customerName || orderData.customerName,
    }
    
    // Add optimistic order to state
    setOrders(prev => [newOrder, ...prev])
    
    // Calculate pickup time as a future date to match backend schema (datetime)
    const today = new Date();
    const [hours, minutes] = orderData.pickupTime.split(':');
    today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    const payload = {
      umkm_id: orderData.menuItem.vendorId,
      pickup_time: today.toISOString(),
      notes: orderData.notes || "",
      promo_code: orderData.promoCode || null,
      items: [
        {
          menu_item_id: orderData.menuItem.id,
          quantity: orderData.quantity
        }
      ]
    };

    // Update stock locally
    updateMenuStock(orderData.menuItem.vendorId, orderData.menuItem.id, orderData.quantity)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${backendUrl}/orders?customer_id=${customerId || "default"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        const serverOrder: Order = {
          ...newOrder,
          id: data.id,
          status: data.status,
          totalPrice: data.total_price ? parseFloat(data.total_price) : newOrder.totalPrice,
          notes: data.notes || newOrder.notes,
          createdAt: data.created_at,
          paymentProof: data.payment_proof || undefined
        };
        // Replace temp order with actual order from server
        setOrders(prev => prev.map(o => o.id === tempId ? serverOrder : o));
        return serverOrder;
      }
    } catch (err) {
      console.error("Failed to submit order to backend:", err);
    }
    
    // Fallback to local order if backend fails
    return newOrder;
  }

  const uploadPaymentProof = async (orderId: string, file: File): Promise<boolean> => {
    // Update status locally immediately for optimistic UI
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: "confirmed" } : order
      )
    )

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${backendUrl}/orders/${orderId}/payment-proof`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        // Update local state with actual path
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId 
              ? { 
                  ...order, 
                  status: updatedOrder.status, 
                  paymentProof: updatedOrder.payment_proof 
                } 
              : order
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to upload payment proof:", err);
      // Fallback: simulate local upload with base64 for fallback/offline mode
      return new Promise<boolean>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setOrders(prev =>
            prev.map(order =>
              order.id === orderId 
                ? { 
                    ...order, 
                    status: "confirmed", 
                    paymentProof: base64Data 
                  } 
                : order
            )
          );
          resolve(true);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    )

    // Send update to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    fetch(`${backendUrl}/orders/${orderId}/status?status=${status}`, {
      method: "PATCH",
    }).catch(err => console.error("Failed to update order status:", err));
  }

  const addPromo = async (promoData: Omit<Promo, "id" | "created_at" | "updated_at">): Promise<Promo> => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const res = await fetch(`${backendUrl}/promos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...promoData,
        discount_value: Number(promoData.discount_value),
        min_order: Number(promoData.min_order),
        max_discount: promoData.max_discount ? Number(promoData.max_discount) : null,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Gagal membuat promo baru");
    }
    const newPromo = await res.json();
    setPromos(prev => [newPromo, ...prev]);
    return newPromo;
  };

  const updatePromo = async (promoId: string, updates: Partial<Omit<Promo, "id">>): Promise<Promo> => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const formattedUpdates = { ...updates };
    if (updates.discount_value !== undefined) formattedUpdates.discount_value = Number(updates.discount_value);
    if (updates.min_order !== undefined) formattedUpdates.min_order = Number(updates.min_order);
    if (updates.max_discount !== undefined) formattedUpdates.max_discount = updates.max_discount ? Number(updates.max_discount) : null;

    const res = await fetch(`${backendUrl}/promos/${promoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedUpdates),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Gagal memperbarui promo");
    }
    const updatedPromo = await res.json();
    setPromos(prev => prev.map(p => p.id === promoId ? updatedPromo : p));
    return updatedPromo;
  };

  const deletePromo = async (promoId: string): Promise<boolean> => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const res = await fetch(`${backendUrl}/promos/${promoId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Gagal menghapus promo");
    }
    setPromos(prev => prev.filter(p => p.id !== promoId));
    return true;
  };

  return (
    <DataContext.Provider value={{ 
      approvedUMKMs, 
      pendingUMKMs: pending,
      suspendedUMKMs,
      orders,
      promos,
      activeUsersCount,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerCreatedAt,
      totalOrdersCount: orders.length,
      completedOrdersCount: orders.filter(o => o.status === "completed").length,
      totalSpent: orders.filter(o => o.status === "completed").reduce((acc, o) => acc + o.totalPrice, 0),
      approveUMKM, 
      rejectUMKM,
      suspendUMKM,
      reactivateUMKM,
      updateMenuItem,
      deleteMenuItem,
      addMenuItem,
      addOrder,
      uploadPaymentProof,
      updateOrderStatus,
      updateMenuStock,
      addPromo,
      updatePromo,
      deletePromo
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
