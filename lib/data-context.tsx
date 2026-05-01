"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { mockUMKMs, pendingUMKMs, type UMKM, type MenuItem } from "./mock-data"

export interface Order {
  id: string
  menuItem: MenuItem & { vendorName: string; vendorId: string; vendorLocation?: string }
  quantity: number
  pickupTime: string
  totalPrice: number
  status: "pending" | "confirmed" | "ready" | "completed"
  createdAt: string
  customerName: string
}

interface DataContextType {
  approvedUMKMs: UMKM[]
  pendingUMKMs: UMKM[]
  orders: Order[]
  approveUMKM: (umkmId: string) => void
  rejectUMKM: (umkmId: string) => void
  updateMenuItem: (umkmId: string, menuItemId: string, updates: Partial<MenuItem>) => void
  deleteMenuItem: (umkmId: string, menuItemId: string) => void
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => Order
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  updateMenuStock: (vendorId: string, menuItemId: string, quantity: number) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [approvedUMKMs, setApprovedUMKMs] = useState<UMKM[]>(mockUMKMs.filter(u => u.isApproved))
  const [pending, setPending] = useState<UMKM[]>(pendingUMKMs)
  const [orders, setOrders] = useState<Order[]>([])

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

  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "status">): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    }
    setOrders(prev => [...prev, newOrder])
    
    // Update stock
    updateMenuStock(orderData.menuItem.vendorId, orderData.menuItem.id, orderData.quantity)
    
    return newOrder
  }

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    )
  }

  return (
    <DataContext.Provider value={{ 
      approvedUMKMs, 
      pendingUMKMs: pending,
      orders,
      approveUMKM, 
      rejectUMKM,
      updateMenuItem,
      deleteMenuItem,
      addOrder,
      updateOrderStatus,
      updateMenuStock
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
