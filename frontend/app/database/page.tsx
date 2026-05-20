"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Database, Key, Link2, Code, Copy, Check, TableIcon, GitBranch } from "lucide-react"
import Link from "next/link"

// Database Schema Data
const tables = [
  {
    name: "users",
    description: "User profiles linked to auth.users",
    columns: [
      { name: "id", type: "UUID", nullable: false, pk: true, fk: "auth.users(id)" },
      { name: "email", type: "TEXT", nullable: false, pk: false, fk: null },
      { name: "full_name", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "phone", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "role", type: "TEXT", nullable: false, pk: false, fk: null, default: "'mahasiswa'" },
      { name: "avatar_url", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "created_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
      { name: "updated_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
    ],
  },
  {
    name: "umkm",
    description: "UMKM/Store information",
    columns: [
      { name: "id", type: "UUID", nullable: false, pk: true, fk: null, default: "gen_random_uuid()" },
      { name: "owner_id", type: "UUID", nullable: false, pk: false, fk: "users(id)" },
      { name: "name", type: "TEXT", nullable: false, pk: false, fk: null },
      { name: "description", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "location", type: "TEXT", nullable: false, pk: false, fk: null },
      { name: "image_url", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "rating", type: "DECIMAL(2,1)", nullable: true, pk: false, fk: null, default: "0" },
      { name: "total_reviews", type: "INTEGER", nullable: true, pk: false, fk: null, default: "0" },
      { name: "is_approved", type: "BOOLEAN", nullable: true, pk: false, fk: null, default: "false" },
      { name: "is_pending", type: "BOOLEAN", nullable: true, pk: false, fk: null, default: "true" },
      { name: "rejection_reason", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "created_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
      { name: "updated_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
    ],
  },
  {
    name: "menu_items",
    description: "Menu items for each UMKM",
    columns: [
      { name: "id", type: "UUID", nullable: false, pk: true, fk: null, default: "gen_random_uuid()" },
      { name: "umkm_id", type: "UUID", nullable: false, pk: false, fk: "umkm(id)" },
      { name: "name", type: "TEXT", nullable: false, pk: false, fk: null },
      { name: "description", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "price", type: "INTEGER", nullable: false, pk: false, fk: null },
      { name: "stock", type: "INTEGER", nullable: true, pk: false, fk: null, default: "0" },
      { name: "category", type: "TEXT", nullable: false, pk: false, fk: null },
      { name: "image_url", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "is_available", type: "BOOLEAN", nullable: true, pk: false, fk: null, default: "true" },
      { name: "created_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
      { name: "updated_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
    ],
  },
  {
    name: "orders",
    description: "Customer orders",
    columns: [
      { name: "id", type: "UUID", nullable: false, pk: true, fk: null, default: "gen_random_uuid()" },
      { name: "order_number", type: "TEXT", nullable: false, pk: false, fk: null, unique: true },
      { name: "customer_id", type: "UUID", nullable: false, pk: false, fk: "users(id)" },
      { name: "umkm_id", type: "UUID", nullable: false, pk: false, fk: "umkm(id)" },
      { name: "customer_name", type: "TEXT", nullable: false, pk: false, fk: null },
      { name: "pickup_time", type: "TIMESTAMPTZ", nullable: false, pk: false, fk: null },
      { name: "total_price", type: "INTEGER", nullable: false, pk: false, fk: null },
      { name: "status", type: "TEXT", nullable: false, pk: false, fk: null, default: "'pending'" },
      { name: "notes", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "created_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
      { name: "updated_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
    ],
  },
  {
    name: "order_items",
    description: "Items within an order",
    columns: [
      { name: "id", type: "UUID", nullable: false, pk: true, fk: null, default: "gen_random_uuid()" },
      { name: "order_id", type: "UUID", nullable: false, pk: false, fk: "orders(id)" },
      { name: "menu_item_id", type: "UUID", nullable: false, pk: false, fk: "menu_items(id)" },
      { name: "quantity", type: "INTEGER", nullable: false, pk: false, fk: null },
      { name: "price_at_time", type: "INTEGER", nullable: false, pk: false, fk: null },
      { name: "subtotal", type: "INTEGER", nullable: false, pk: false, fk: null },
      { name: "created_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
    ],
  },
  {
    name: "reviews",
    description: "Customer reviews for orders",
    columns: [
      { name: "id", type: "UUID", nullable: false, pk: true, fk: null, default: "gen_random_uuid()" },
      { name: "order_id", type: "UUID", nullable: false, pk: false, fk: "orders(id)", unique: true },
      { name: "customer_id", type: "UUID", nullable: false, pk: false, fk: "users(id)" },
      { name: "umkm_id", type: "UUID", nullable: false, pk: false, fk: "umkm(id)" },
      { name: "rating", type: "INTEGER", nullable: false, pk: false, fk: null },
      { name: "comment", type: "TEXT", nullable: true, pk: false, fk: null },
      { name: "created_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
      { name: "updated_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
    ],
  },
  {
    name: "transactions",
    description: "Payment transactions",
    columns: [
      { name: "id", type: "UUID", nullable: false, pk: true, fk: null, default: "gen_random_uuid()" },
      { name: "order_id", type: "UUID", nullable: false, pk: false, fk: "orders(id)", unique: true },
      { name: "amount", type: "INTEGER", nullable: false, pk: false, fk: null },
      { name: "payment_method", type: "TEXT", nullable: false, pk: false, fk: null },
      { name: "payment_status", type: "TEXT", nullable: false, pk: false, fk: null, default: "'pending'" },
      { name: "paid_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null },
      { name: "created_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
      { name: "updated_at", type: "TIMESTAMPTZ", nullable: true, pk: false, fk: null, default: "NOW()" },
    ],
  },
]

const sampleQueries = [
  {
    title: "Get all approved UMKMs with owner info",
    description: "Fetch all approved UMKM stores with their owner details",
    query: `SELECT u.*, usr.full_name as owner_name, usr.email as owner_email
FROM umkm u
JOIN users usr ON u.owner_id = usr.id
WHERE u.is_approved = true
ORDER BY u.rating DESC;`,
  },
  {
    title: "Get UMKM with menu items",
    description: "Fetch a specific UMKM with all its menu items",
    query: `SELECT 
  u.id, u.name, u.description, u.location, u.rating,
  json_agg(
    json_build_object(
      'id', m.id,
      'name', m.name,
      'price', m.price,
      'category', m.category,
      'is_available', m.is_available
    )
  ) as menu_items
FROM umkm u
LEFT JOIN menu_items m ON u.id = m.umkm_id
WHERE u.id = 'your-umkm-id'
GROUP BY u.id;`,
  },
  {
    title: "Get orders with items for customer",
    description: "Fetch all orders for a customer with order items",
    query: `SELECT 
  o.*,
  u.name as umkm_name,
  json_agg(
    json_build_object(
      'menu_name', m.name,
      'quantity', oi.quantity,
      'subtotal', oi.subtotal
    )
  ) as items
FROM orders o
JOIN umkm u ON o.umkm_id = u.id
JOIN order_items oi ON o.id = oi.order_id
JOIN menu_items m ON oi.menu_item_id = m.id
WHERE o.customer_id = auth.uid()
GROUP BY o.id, u.name
ORDER BY o.created_at DESC;`,
  },
  {
    title: "Get UMKM statistics for owner",
    description: "Get statistics for UMKM owner dashboard",
    query: `SELECT 
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total_price) as total_revenue,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_orders,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'completed') as completed_orders,
  AVG(r.rating) as average_rating
FROM umkm u
LEFT JOIN orders o ON u.id = o.umkm_id
LEFT JOIN reviews r ON u.id = r.umkm_id
WHERE u.owner_id = auth.uid()
GROUP BY u.id;`,
  },
  {
    title: "Get pending UMKMs for admin",
    description: "Fetch all pending UMKM registrations for admin approval",
    query: `SELECT 
  u.*,
  usr.full_name as owner_name,
  usr.email as owner_email,
  usr.phone as owner_phone
FROM umkm u
JOIN users usr ON u.owner_id = usr.id
WHERE u.is_pending = true
ORDER BY u.created_at ASC;`,
  },
  {
    title: "Create new order with items",
    description: "Insert a new order with order items",
    query: `-- Create order
INSERT INTO orders (customer_id, umkm_id, customer_name, pickup_time, total_price, notes)
VALUES (auth.uid(), 'umkm-id', 'Customer Name', NOW() + INTERVAL '1 hour', 50000, 'No spicy')
RETURNING id;

-- Add order items (use returned order_id)
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time, subtotal)
VALUES 
  ('order-id', 'menu-item-1', 2, 15000, 30000),
  ('order-id', 'menu-item-2', 1, 20000, 20000);`,
  },
]

const relationships = [
  { from: "users", to: "auth.users", type: "1:1", via: "id" },
  { from: "umkm", to: "users", type: "N:1", via: "owner_id" },
  { from: "menu_items", to: "umkm", type: "N:1", via: "umkm_id" },
  { from: "orders", to: "users", type: "N:1", via: "customer_id" },
  { from: "orders", to: "umkm", type: "N:1", via: "umkm_id" },
  { from: "order_items", to: "orders", type: "N:1", via: "order_id" },
  { from: "order_items", to: "menu_items", type: "N:1", via: "menu_item_id" },
  { from: "reviews", to: "orders", type: "1:1", via: "order_id" },
  { from: "reviews", to: "users", type: "N:1", via: "customer_id" },
  { from: "reviews", to: "umkm", type: "N:1", via: "umkm_id" },
  { from: "transactions", to: "orders", type: "1:1", via: "order_id" },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}

function ClassDiagram() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <Card key={table.name} className="border-2">
            <CardHeader className="pb-2 bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-primary" />
                {table.name}
              </CardTitle>
              <CardDescription className="text-xs">{table.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-1 text-sm">
                {table.columns.map((col) => (
                  <div key={col.name} className="flex items-center gap-2 py-0.5">
                    {col.pk && <Key className="h-3 w-3 text-yellow-500" />}
                    {col.fk && <Link2 className="h-3 w-3 text-blue-500" />}
                    <span className={col.pk ? "font-semibold" : ""}>{col.name}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {col.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Relationships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Table</TableHead>
                <TableHead>To Table</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Foreign Key</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relationships.map((rel, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-sm">{rel.from}</TableCell>
                  <TableCell className="font-mono text-sm">{rel.to}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rel.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{rel.via}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function TablesView() {
  const [selectedTable, setSelectedTable] = useState(tables[0].name)
  const currentTable = tables.find((t) => t.name === selectedTable)!

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm">Tables</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-1">
              {tables.map((table) => (
                <Button
                  key={table.name}
                  variant={selectedTable === table.name ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setSelectedTable(table.name)}
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  {table.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            {currentTable.name}
          </CardTitle>
          <CardDescription>{currentTable.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Nullable</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>References</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTable.columns.map((col) => (
                <TableRow key={col.name}>
                  <TableCell className="font-mono">{col.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{col.type}</Badge>
                  </TableCell>
                  <TableCell>{col.nullable ? "YES" : "NO"}</TableCell>
                  <TableCell>
                    {col.pk && <Badge className="bg-yellow-500">PK</Badge>}
                    {col.fk && <Badge className="bg-blue-500 ml-1">FK</Badge>}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {col.default || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{col.fk || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function QueriesView() {
  return (
    <div className="space-y-6">
      {sampleQueries.map((q, idx) => (
        <Card key={idx}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{q.title}</CardTitle>
                <CardDescription>{q.description}</CardDescription>
              </div>
              <CopyButton text={q.query} />
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{q.query}</code>
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DatabasePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Database Documentation</h1>
            </div>
            <Badge variant="outline" className="ml-auto">
              Supabase PostgreSQL
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="diagram" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="diagram" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Class Diagram
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="queries" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Queries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagram">
            <ClassDiagram />
          </TabsContent>

          <TabsContent value="tables">
            <TablesView />
          </TabsContent>

          <TabsContent value="queries">
            <QueriesView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
