"use client"

import type React from "react"

import { useState } from "react"
import Papa from "papaparse" // Import PapaParse
import { useToast } from "@/hooks/use-toast" // Import useToast hook
import {
  Package,
  Users,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  Home,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Types
interface User {
  id: number
  username: string
  name: string
  email: string
  role: "admin" | "manager" | "staff"
  status: "active" | "inactive"
  lastLogin: string
  avatar?: string
}

interface Item {
  id: number
  code: string
  name: string
  category: string
  description: string
  unit: string
  minStock: number
  currentStock: number
  location: string
  supplierId: number
  price: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  imageUrl?: string // New field for image URL
}

interface Supplier {
  id: number
  code: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  status: "active" | "inactive"
  createdAt: string
}

interface Transaction {
  id: number
  type: "in" | "out" | "borrow" | "return"
  itemId: number
  quantity: number
  userId: number
  supplierId?: number
  borrowerId?: string
  notes: string
  status: "pending" | "approved" | "completed" | "cancelled"
  date: string
  dueDate?: string
  returnDate?: string
}

interface Depreciation {
  id: number
  itemId: number
  quantity: number
  date: string
  reason: string
  userId: number
  status: "completed" | "pending"
}

// Initial Mock Data (moved outside for state initialization)
const initialMockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    name: "Ahmad Jhony",
    email: "admin@hotel.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-15 09:30:00",
  },
  {
    id: 2,
    username: "manager1",
    name: "Sarah Manager",
    email: "sarah@hotel.com",
    role: "manager",
    status: "active",
    lastLogin: "2024-01-15 08:15:00",
  },
  {
    id: 3,
    username: "staff1",
    name: "Budi Staff",
    email: "budi@hotel.com",
    role: "staff",
    status: "active",
    lastLogin: "2024-01-14 16:45:00",
  },
]

const initialMockItems: Item[] = [
  {
    id: 1,
    code: "TWL001",
    name: "Handuk Mandi Besar",
    category: "Linen",
    description: "Handuk mandi ukuran besar 70x140cm",
    unit: "pcs",
    minStock: 20,
    currentStock: 45,
    location: "Gudang A-1",
    supplierId: 1,
    price: 75000,
    status: "active",
    createdAt: "2024-01-01 10:00:00",
    updatedAt: "2024-01-15 11:30:00",
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    code: "SHT001",
    name: "Seprai Kasur King Size",
    category: "Linen",
    description: "Seprai kasur king size 200x200cm",
    unit: "set",
    minStock: 15,
    currentStock: 12,
    location: "Gudang A-2",
    supplierId: 1,
    price: 150000,
    status: "active",
    createdAt: "2024-01-01 10:05:00",
    updatedAt: "2024-01-15 11:35:00",
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    code: "CLN001",
    name: "Pembersih Lantai",
    category: "Cleaning Supplies",
    description: "Cairan pembersih lantai 1 liter",
    unit: "botol",
    minStock: 10,
    currentStock: 8,
    location: "Gudang B-1",
    supplierId: 2,
    price: 25000,
    status: "active",
    createdAt: "2024-01-01 10:10:00",
    updatedAt: "2024-01-15 11:40:00",
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
]

const initialMockSuppliers: Supplier[] = [
  {
    id: 1,
    code: "SUP001",
    name: "PT Linen Indonesia",
    contact: "John Doe",
    phone: "021-1234567",
    email: "contact@linen.co.id",
    address: "Jl. Industri No. 123, Jakarta",
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    code: "SUP002",
    name: "CV Cleaning Supply",
    contact: "Jane Smith",
    phone: "021-7654321",
    email: "info@cleaning.co.id",
    address: "Jl. Kimia No. 456, Jakarta",
    status: "active",
    createdAt: "2024-01-01",
  },
]

const initialMockTransactions: Transaction[] = [
  {
    id: 1,
    type: "in",
    itemId: 1,
    quantity: 50,
    userId: 1,
    supplierId: 1,
    notes: "Pembelian rutin bulanan",
    status: "completed",
    date: "2024-01-10",
  },
  {
    id: 2,
    type: "borrow",
    itemId: 2,
    quantity: 5,
    userId: 2,
    borrowerId: "Room 101",
    notes: "Untuk kamar tamu VIP",
    status: "pending",
    date: "2024-01-15",
    dueDate: "2024-01-20",
  },
]

const initialMockDepreciations: Depreciation[] = [
  {
    id: 1,
    itemId: 3,
    quantity: 1,
    date: "2024-01-12",
    reason: "Botol pecah saat pengiriman",
    userId: 1,
    status: "completed",
  },
]

// Helper function to download CSV
const downloadCsv = (data: any[], filename: string, headers: string[], toast: ReturnType<typeof useToast>["toast"]) => {
  try {
    const csv = Papa.unparse(data, {
      header: true,
      columns: headers, // Ensure order and inclusion of headers
    })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "Export Berhasil",
        description: `Data berhasil diekspor ke ${filename}`,
      })
    }
  } catch (error: any) {
    toast({
      title: "Export Gagal",
      description: `Terjadi kesalahan saat mengekspor: ${error.message}`,
      variant: "destructive",
    })
  }
}

// Navigation items with permissions
const getNavigationItems = (userRole: string) => {
  const allItems = [
    { title: "DASHBOARD", icon: Home, key: "dashboard", roles: ["admin", "manager", "staff"] },
    { title: "DATA BARANG", icon: Package, key: "items", roles: ["admin", "manager", "staff"] },
    { title: "DATA SUPPLIER", icon: Truck, key: "suppliers", roles: ["admin", "manager"] },
    { title: "PEMINJAMAN", icon: ArrowUpRight, key: "borrowing", roles: ["admin", "manager", "staff"] },
    { title: "PENYUSUTAN BARANG", icon: ArrowDownLeft, key: "depreciation", roles: ["admin", "manager"] }, // New menu item
    { title: "BARANG MASUK", icon: ArrowDownLeft, key: "items-in", roles: ["admin", "manager"] },
    { title: "BARANG KELUAR", icon: ArrowUpRight, key: "items-out", roles: ["admin", "manager"] },
    { title: "DATA PENGGUNA", icon: Users, key: "users", roles: ["admin"] },
    { title: "LAPORAN", icon: BarChart3, key: "reports", roles: ["admin", "manager"] },
    { title: "PENGATURAN", icon: Settings, key: "settings", roles: ["admin", "manager", "staff"] },
  ]

  return allItems.filter((item) => item.roles.includes(userRole))
}

// Login Component
function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = initialMockUsers.find((u) => u.username === username) // Use initialMockUsers for login

    if (user && password === "password") {
      onLogin(user)
    } else {
      setError("Username atau password salah")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#25282A] to-[#25282A]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-48 h-24 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 overflow-hidden p-2">
            <img src="/images/ramayana-logo.png" alt="Ramayana Hotel Logo" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold">Inventaris HK</CardTitle>
          <p className="text-gray-600">Hotel Management System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Admin:</strong> admin / password
              </p>
              <p>
                <strong>Manager:</strong> manager1 / password
              </p>
              <p>
                <strong>Staff:</strong> staff1 / password
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard Component
function Dashboard({
  user,
  items,
  users,
  suppliers,
  transactions,
}: { user: User; items: Item[]; users: User[]; suppliers: Supplier[]; transactions: Transaction[] }) {
  const dashboardStats = [
    {
      title: "Model Barang",
      value: items.length.toString(),
      color: "bg-gradient-to-br from-green-500 to-green-600",
      icon: Package,
    },
    {
      title: "Pengguna",
      value: users.length.toString(),
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      icon: Users,
    },
    {
      title: "Supplier",
      value: suppliers.length.toString(),
      color: "bg-gradient-to-br from-red-500 to-red-600",
      icon: Truck,
    },
    {
      title: "Transaksi Peminjaman",
      value: transactions.filter((t) => t.type === "borrow").length.toString(),
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: ArrowUpRight,
    },
  ]

  const transactionStats = [
    {
      title: "Total Barang Masuk",
      value: transactions
        .filter((t) => t.type === "in")
        .reduce((sum, t) => sum + t.quantity, 0)
        .toString(),
      color: "bg-gradient-to-br from-blue-600 to-blue-700",
    },
    {
      title: "Total Barang Keluar",
      value: transactions
        .filter((t) => t.type === "out")
        .reduce((sum, t) => sum + t.quantity, 0)
        .toString(),
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "Total Transaksi Barang Masuk",
      value: transactions.filter((t) => t.type === "in").length.toString(),
      color: "bg-gradient-to-br from-orange-600 to-orange-700",
    },
    {
      title: "Total Transaksi Barang Keluar",
      value: transactions.filter((t) => t.type === "out").length.toString(),
      color: "bg-gradient-to-br from-blue-700 to-blue-800",
    },
  ]

  const loanStats = [
    {
      title: "Peminjaman Dikembalikan",
      value: transactions.filter((t) => t.type === "return").length.toString(),
      color: "bg-gradient-to-br from-green-600 to-green-700",
    },
    {
      title: "Peminjaman Belum Dikembalikan",
      value: transactions.filter((t) => t.type === "borrow" && t.status !== "completed").length.toString(),
      color: "bg-gradient-to-br from-red-600 to-red-700",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-[#F0D58D] text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Selamat Datang, {user.name}!</h2>
        <p className="opacity-90">
          Role: {user.role.toUpperCase()} | Last Login: {user.lastLogin}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <CardContent className="p-0">
              <div className={`${stat.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <stat.icon className="w-8 h-8 mb-4" />
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {transactionStats.map((stat, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <CardContent className="p-0">
              <div className={`${stat.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loanStats.map((stat, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <CardContent className="p-0">
              <div className={`${stat.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => {
              const item = items.find((i) => i.id === transaction.itemId)
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        transaction.type === "in"
                          ? "bg-green-500"
                          : transaction.type === "out"
                            ? "bg-red-500"
                            : transaction.type === "borrow"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium">{item?.name}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.type === "in"
                          ? "Barang Masuk"
                          : transaction.type === "out"
                            ? "Barang Keluar"
                            : transaction.type === "borrow"
                              ? "Peminjaman"
                              : "Pengembalian"}{" "}
                        - {transaction.quantity} {item?.unit}
                      </p>
                    </div>
                  </div>
                  <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                    {transaction.status}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Items Management Component
function ItemsManagement({
  user,
  items,
  setItems,
  suppliers,
}: { user: User; items: Item[]; setItems: React.Dispatch<React.SetStateAction<Item[]>>; suppliers: Supplier[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null) // State for selected image file
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null) // State for image preview URL
  const { toast } = useToast()

  const categories = ["all", ...Array.from(new Set(items.map((item) => item.category)))]

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImageFile(file)
      setPreviewImageUrl(URL.createObjectURL(file))
    } else {
      setSelectedImageFile(null)
      setPreviewImageUrl(null)
    }
  }

  const handleAddItem = (formData: FormData) => {
    const now = new Date().toLocaleString() // Get current date and time

    const newItem: Item = {
      id: items.length + 1,
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      unit: formData.get("unit") as string,
      minStock: Number.parseInt(formData.get("minStock") as string),
      currentStock: Number.parseInt(formData.get("currentStock") as string),
      location: formData.get("location") as string,
      supplierId: Number.parseInt(formData.get("supplierId") as string),
      price: Number.parseInt(formData.get("price") as string),
      status: "active",
      createdAt: now, // Set current date and time
      updatedAt: now, // Set current date and time
      imageUrl: previewImageUrl || undefined, // Add image URL
    }
    setItems([...items, newItem])
    setIsAddDialogOpen(false)
    setSelectedImageFile(null) // Clear file input state
    setPreviewImageUrl(null) // Clear preview URL
    toast({
      title: "Barang Ditambahkan",
      description: `Barang "${newItem.name}" berhasil ditambahkan.`,
    })
  }

  const handleDeleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
    toast({
      title: "Barang Dihapus",
      description: "Barang berhasil dihapus.",
      variant: "destructive",
    })
  }

  const getStockStatus = (item: Item) => {
    if (item.currentStock <= item.minStock) return "low"
    if (item.currentStock <= item.minStock * 1.5) return "medium"
    return "high"
  }

  const handleExportItems = () => {
    const headers = [
      "id",
      "code",
      "name",
      "category",
      "description",
      "unit",
      "minStock",
      "currentStock",
      "location",
      "supplierId",
      "price",
      "status",
      "createdAt",
      "updatedAt",
      "imageUrl", // Include imageUrl in export
    ]
    downloadCsv(items, "items_data.csv", headers, toast)
  }

  const handleImportItems = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          toast({
            title: "Import Gagal",
            description: `Ada kesalahan dalam parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          })
          return
        }

        const importedData = results.data as Record<string, string>[]
        const newItems: Item[] = []
        let hasError = false

        for (const row of importedData) {
          // Validate required fields based on the provided template
          const requiredFields = [
            "Code",
            "Name",
            "Category",
            "Unit",
            "MinStock",
            "CurrentStock",
            "Location",
            "SupplierID",
            "Price",
          ]
          const missingFields = requiredFields.filter((field) => !row[field])

          if (missingFields.length > 0) {
            toast({
              title: "Import Gagal",
              description: `CSV tidak memiliki kolom yang diperlukan: ${missingFields.join(", ")}.`,
              variant: "destructive",
            })
            hasError = true
            break
          }

          const parsedItem: Item = {
            id: items.length + newItems.length + 1, // Generate new ID
            code: row.Code,
            name: row.Name,
            category: row.Category,
            description: row.Description || "",
            unit: row.Unit,
            minStock: Number(row.MinStock),
            currentStock: Number(row.CurrentStock),
            location: row.Location,
            supplierId: Number(row.SupplierID),
            price: Number(row.Price),
            status: (row.Status as "active" | "inactive") || "active", // Default to active if not provided
            createdAt: row.CreatedAt || new Date().toLocaleString(), // Use toLocaleString for consistency
            updatedAt: row.UpdatedAt || new Date().toLocaleString(), // Use toLocaleString for consistency
            imageUrl: row.ImageUrl || undefined, // Include imageUrl if present in CSV
          }

          // More robust type checking for numbers
          if (
            isNaN(parsedItem.minStock) ||
            isNaN(parsedItem.currentStock) ||
            isNaN(parsedItem.supplierId) ||
            isNaN(parsedItem.price)
          ) {
            toast({
              title: "Import Gagal",
              description: `Data numerik tidak valid di baris untuk item: ${parsedItem.name}.`,
              variant: "destructive",
            })
            hasError = true
            break
          }

          newItems.push(parsedItem)
        }

        if (!hasError) {
          setItems((prevItems) => [...prevItems, ...newItems])
          toast({
            title: "Import Berhasil",
            description: `${newItems.length} barang berhasil diimpor.`,
          })
        }
      },
      error: (error) => {
        toast({
          title: "Import Gagal",
          description: `Terjadi kesalahan saat membaca file: ${error.message}`,
          variant: "destructive",
        })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Barang</h2>
          <p className="text-gray-600">Kelola inventaris barang hotel</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportItems}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <input type="file" accept=".csv" onChange={handleImportItems} className="hidden" id="import-items-csv" />
          <Button onClick={() => document.getElementById("import-items-csv")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          {(user.role === "admin" || user.role === "manager") && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Barang
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Barang Baru</DialogTitle>
                  <DialogDescription>Masukkan informasi barang baru</DialogDescription>
                </DialogHeader>
                <form action={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Kode Barang</Label>
                      <Input id="code" name="code" required />
                    </div>
                    <div>
                      <Label htmlFor="name">Nama Barang</Label>
                      <Input id="name" name="name" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Kategori</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Linen">Linen</SelectItem>
                          <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                          <SelectItem value="Amenities">Amenities</SelectItem>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="unit">Satuan</Label>
                      <Input id="unit" name="unit" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="minStock">Stok Minimum</Label>
                      <Input id="minStock" name="minStock" type="number" required />
                    </div>
                    <div>
                      <Label htmlFor="currentStock">Stok Saat Ini</Label>
                      <Input id="currentStock" name="currentStock" type="number" required />
                    </div>
                    <div>
                      <Label htmlFor="price">Harga</Label>
                      <Input id="price" name="price" type="number" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Lokasi</Label>
                      <Input id="location" name="location" required />
                    </div>
                    <div>
                      <Label htmlFor="supplierId">Supplier</Label>
                      <Select name="supplierId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="itemImage">Gambar Barang</Label>
                    <Input id="itemImage" type="file" accept="image/*" onChange={handleImageChange} />
                    {previewImageUrl && (
                      <img
                        src={previewImageUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="mt-2 h-20 w-20 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit">Simpan</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.slice(1).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status Stok</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Tgl Input</TableHead>
                {(user.role === "admin" || user.role === "manager") && <TableHead>Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item)

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs text-center p-1">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {item.currentStock} {item.unit}
                        </p>
                        <p className="text-sm text-gray-500">Min: {item.minStock}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          stockStatus === "low" ? "destructive" : stockStatus === "medium" ? "secondary" : "default"
                        }
                      >
                        {stockStatus === "low" ? "Stok Rendah" : stockStatus === "medium" ? "Stok Sedang" : "Stok Aman"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>Rp {item.price.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-gray-500">{item.createdAt}</TableCell>
                    {(user.role === "admin" || user.role === "manager") && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Suppliers Management Component
function SuppliersManagement({
  user,
  suppliers,
  setSuppliers,
}: { user: User; suppliers: Supplier[]; setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>> }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddSupplier = (formData: FormData) => {
    const newSupplier: Supplier = {
      id: suppliers.length + 1,
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      contact: formData.get("contact") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    }
    setSuppliers([...suppliers, newSupplier])
    setIsAddDialogOpen(false)
    toast({
      title: "Supplier Ditambahkan",
      description: `Supplier "${newSupplier.name}" berhasil ditambahkan.`,
    })
  }

  const handleExportSuppliers = () => {
    const headers = ["id", "code", "name", "contact", "phone", "email", "address", "status", "createdAt"]
    downloadCsv(suppliers, "suppliers_data.csv", headers, toast)
  }

  const handleImportSuppliers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          toast({
            title: "Import Gagal",
            description: `Ada kesalahan dalam parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          })
          return
        }

        const importedData = results.data as Record<string, string>[]
        const newSuppliers: Supplier[] = []
        let hasError = false

        for (const row of importedData) {
          const requiredFields = ["Code", "Name", "Contact", "Phone", "Email", "Address"]
          const missingFields = requiredFields.filter((field) => !row[field])

          if (missingFields.length > 0) {
            toast({
              title: "Import Gagal",
              description: `CSV tidak memiliki kolom yang diperlukan: ${missingFields.join(", ")}.`,
              variant: "destructive",
            })
            hasError = true
            break
          }

          const parsedSupplier: Supplier = {
            id: suppliers.length + newSuppliers.length + 1,
            code: row.Code,
            name: row.Name,
            contact: row.Contact,
            phone: row.Phone,
            email: row.Email,
            address: row.Address,
            status: (row.Status as "active" | "inactive") || "active",
            createdAt: row.CreatedAt || new Date().toISOString().split("T")[0],
          }
          newSuppliers.push(parsedSupplier)
        }

        if (!hasError) {
          setSuppliers((prevSuppliers) => [...prevSuppliers, ...newSuppliers])
          toast({
            title: "Import Berhasil",
            description: `${newSuppliers.length} supplier berhasil diimpor.`,
          })
        }
      },
      error: (error) => {
        toast({
          title: "Import Gagal",
          description: `Terjadi kesalahan saat membaca file: ${error.message}`,
          variant: "destructive",
        })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Supplier</h2>
          <p className="text-gray-600">Kelola data supplier hotel</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportSuppliers}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportSuppliers}
            className="hidden"
            id="import-suppliers-csv"
          />
          <Button onClick={() => document.getElementById("import-suppliers-csv")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          {(user.role === "admin" || user.role === "manager") && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Supplier Baru</DialogTitle>
                  <DialogDescription>Masukkan informasi supplier baru</DialogDescription>
                </DialogHeader>
                <form action={handleAddSupplier} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Kode Supplier</Label>
                      <Input id="code" name="code" required />
                    </div>
                    <div>
                      <Label htmlFor="name">Nama Supplier</Label>
                      <Input id="name" name="name" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact">Nama Kontak</Label>
                      <Input id="contact" name="contact" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telepon</Label>
                      <Input id="phone" name="phone" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea id="address" name="address" required />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit">Simpan</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Cari supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <p className="text-sm text-gray-600">{supplier.code}</p>
                </div>
                <Badge variant={supplier.status === "active" ? "default" : "secondary"}>{supplier.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Kontak:</p>
                  <p className="text-sm text-gray-600">{supplier.contact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Telepon:</p>
                  <p className="text-sm text-gray-600">{supplier.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email:</p>
                  <p className="text-sm text-gray-600">{supplier.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Alamat:</p>
                  <p className="text-sm text-gray-600">{supplier.address}</p>
                </div>
                {(user.role === "admin" || user.role === "manager") && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Borrowing Management Component
function BorrowingManagement({
  user,
  items,
  transactions,
  setTransactions,
}: {
  user: User
  items: Item[]
  transactions: Transaction[]
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleAddBorrowing = (formData: FormData) => {
    const newTransaction: Transaction = {
      id: transactions.length + 1,
      type: "borrow",
      itemId: Number.parseInt(formData.get("itemId") as string),
      quantity: Number.parseInt(formData.get("quantity") as string),
      userId: user.id,
      borrowerId: formData.get("borrowerId") as string,
      notes: formData.get("notes") as string,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      dueDate: formData.get("dueDate") as string,
    }
    setTransactions([...transactions, newTransaction])
    setIsAddDialogOpen(false)
    toast({
      title: "Peminjaman Ditambahkan",
      description: `Peminjaman untuk barang "${items.find((i) => i.id === newTransaction.itemId)?.name}" berhasil dicatat.`,
    })
  }

  const handleReturnItem = (transactionId: number) => {
    setTransactions(
      transactions.map((t) =>
        t.id === transactionId ? { ...t, status: "completed", returnDate: new Date().toISOString().split("T")[0] } : t,
      ),
    )
    toast({
      title: "Peminjaman Dikembalikan",
      description: "Barang berhasil dikembalikan.",
    })
  }

  const handleExportBorrowings = () => {
    const headers = [
      "id",
      "type",
      "itemId",
      "quantity",
      "userId",
      "borrowerId",
      "notes",
      "status",
      "date",
      "dueDate",
      "returnDate",
    ]
    // Filter only borrowing/return transactions for export
    const exportData = transactions.filter((t) => t.type === "borrow" || t.type === "return")
    downloadCsv(exportData, "borrowings_data.csv", headers, toast)
  }

  const handleImportBorrowings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          toast({
            title: "Import Gagal",
            description: `Ada kesalahan dalam parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          })
          return
        }

        const importedData = results.data as Record<string, string>[]
        const newTransactions: Transaction[] = []
        let hasError = false

        for (const row of importedData) {
          const requiredFields = ["type", "itemId", "quantity", "userId", "date", "status"]
          if (row.type === "borrow") requiredFields.push("borrowerId", "dueDate")

          const missingFields = requiredFields.filter((field) => !row[field])

          if (missingFields.length > 0) {
            toast({
              title: "Import Gagal",
              description: `CSV tidak memiliki kolom yang diperlukan: ${missingFields.join(", ")}.`,
              variant: "destructive",
            })
            hasError = true
            break
          }

          const parsedTransaction: Transaction = {
            id: transactions.length + newTransactions.length + 1,
            type: row.type as "in" | "out" | "borrow" | "return",
            itemId: Number(row.itemId),
            quantity: Number(row.quantity),
            userId: Number(row.userId),
            supplierId: row.supplierId ? Number(row.supplierId) : undefined,
            borrowerId: row.borrowerId || undefined,
            notes: row.notes || "",
            status: row.status as "pending" | "approved" | "completed" | "cancelled",
            date: row.date,
            dueDate: row.dueDate || undefined,
            returnDate: row.returnDate || undefined,
          }

          if (isNaN(parsedTransaction.itemId) || isNaN(parsedTransaction.quantity) || isNaN(parsedTransaction.userId)) {
            toast({
              title: "Import Gagal",
              description: `Data numerik tidak valid di baris untuk transaksi item ID: ${row.itemId}.`,
              variant: "destructive",
            })
            hasError = true
            break
          }

          newTransactions.push(parsedTransaction)
        }

        if (!hasError) {
          setTransactions((prevTransactions) => [...prevTransactions, ...newTransactions])
          toast({
            title: "Import Berhasil",
            description: `${newTransactions.length} transaksi peminjaman berhasil diimpor.`,
          })
        }
      },
      error: (error) => {
        toast({
          title: "Import Gagal",
          description: `Terjadi kesalahan saat membaca file: ${error.message}`,
          variant: "destructive",
        })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Peminjaman</h2>
          <p className="text-gray-600">Kelola peminjaman barang hotel</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportBorrowings}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportBorrowings}
            className="hidden"
            id="import-borrowings-csv"
          />
          <Button onClick={() => document.getElementById("import-borrowings-csv")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Peminjaman
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Peminjaman Baru</DialogTitle>
                <DialogDescription>Masukkan informasi peminjaman</DialogDescription>
              </DialogHeader>
              <form action={handleAddBorrowing} className="space-y-4">
                <div>
                  <Label htmlFor="itemId">Barang</Label>
                  <Select name="itemId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} (Stok: {item.currentStock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Jumlah</Label>
                    <Input id="quantity" name="quantity" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="borrowerId">Peminjam</Label>
                    <Input id="borrowerId" name="borrowerId" placeholder="Room 101, Dept. HK, dll" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate">Tanggal Kembali</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>
                <div>
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Borrowing Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Peminjam</TableHead>
                <TableHead>Tanggal Kembali</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const item = items.find((i) => i.id === transaction.itemId)
                const isOverdue =
                  transaction.dueDate &&
                  new Date(transaction.dueDate) < new Date() &&
                  transaction.status !== "completed"

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item?.name}</p>
                        <p className="text-sm text-gray-500">{item?.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.quantity} {item?.unit}
                    </TableCell>
                    <TableCell>{transaction.borrowerId}</TableCell>
                    <TableCell>
                      <div className={isOverdue ? "text-red-600" : ""}>
                        {transaction.dueDate}
                        {isOverdue && <p className="text-xs">Terlambat!</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                              ? "secondary"
                              : isOverdue
                                ? "destructive"
                                : "secondary"
                        }
                      >
                        {transaction.status === "completed"
                          ? "Dikembalikan"
                          : transaction.status === "pending"
                            ? "Dipinjam"
                            : transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.status !== "completed" && (
                        <Button size="sm" onClick={() => handleReturnItem(transaction.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Kembalikan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Depreciation Management Component (New)
function DepreciationManagement({
  user,
  items,
  setItems,
  depreciations,
  setDepreciations,
}: {
  user: User
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
  depreciations: Depreciation[]
  setDepreciations: React.Dispatch<React.SetStateAction<Depreciation[]>>
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleAddDepreciation = (formData: FormData) => {
    const itemId = Number.parseInt(formData.get("itemId") as string)
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const reason = formData.get("reason") as string

    const newItem: Depreciation = {
      id: depreciations.length + 1,
      itemId,
      quantity,
      date: new Date().toISOString().split("T")[0],
      reason,
      userId: user.id,
      status: "completed", // Assuming immediate completion for simplicity
    }

    setDepreciations((prev) => [...prev, newItem])

    // Update item stock
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, currentStock: item.currentStock - quantity } : item)),
    )

    setIsAddDialogOpen(false)
    toast({
      title: "Penyusutan Dicatat",
      description: `Penyusutan ${quantity} unit barang "${items.find((i) => i.id === itemId)?.name}" berhasil dicatat.`,
    })
  }

  const filteredDepreciations = depreciations.map((dep) => {
    const item = items.find((i) => i.id === dep.itemId)
    return { ...dep, itemName: item?.name, itemCode: item?.code, itemUnit: item?.unit }
  })

  const handleExportDepreciations = () => {
    const headers = ["id", "itemId", "quantity", "date", "reason", "userId", "status"]
    downloadCsv(depreciations, "depreciations_data.csv", headers, toast)
  }

  const handleImportDepreciations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          toast({
            title: "Import Gagal",
            description: `Ada kesalahan dalam parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          })
          return
        }

        const importedData = results.data as Record<string, string>[]
        const newDepreciations: Depreciation[] = []
        let hasError = false

        for (const row of importedData) {
          const requiredFields = ["itemId", "quantity", "date", "reason", "userId", "status"]
          const missingFields = requiredFields.filter((field) => !row[field])

          if (missingFields.length > 0) {
            toast({
              title: "Import Gagal",
              description: `CSV tidak memiliki kolom yang diperlukan: ${missingFields.join(", ")}.`,
              variant: "destructive",
            })
            hasError = true
            break
          }

          const parsedDepreciation: Depreciation = {
            id: depreciations.length + newDepreciations.length + 1,
            itemId: Number(row.itemId),
            quantity: Number(row.quantity),
            date: row.date,
            reason: row.reason,
            userId: Number(row.userId),
            status: row.status as "completed" | "pending",
          }

          if (
            isNaN(parsedDepreciation.itemId) ||
            isNaN(parsedDepreciation.quantity) ||
            isNaN(parsedDepreciation.userId)
          ) {
            toast({
              title: "Import Gagal",
              description: `Data numerik tidak valid di baris untuk penyusutan item ID: ${row.itemId}.`,
              variant: "destructive",
            })
            hasError = true
            break
          }

          newDepreciations.push(parsedDepreciation)
        }

        if (!hasError) {
          setDepreciations((prevDepreciations) => [...prevDepreciations, ...newDepreciations])
          toast({
            title: "Import Berhasil",
            description: `${newDepreciations.length} catatan penyusutan berhasil diimpor.`,
          })
        }
      },
      error: (error) => {
        toast({
          title: "Import Gagal",
          description: `Terjadi kesalahan saat membaca file: ${error.message}`,
          variant: "destructive",
        })
      },
    })
  }

  if (user.role !== "admin" && user.role !== "manager") {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Penyusutan Barang</h2>
          <p className="text-gray-600">Kelola pencatatan penyusutan barang</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportDepreciations}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportDepreciations}
            className="hidden"
            id="import-depreciations-csv"
          />
          <Button onClick={() => document.getElementById("import-depreciations-csv")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Catat Penyusutan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Catat Penyusutan Barang</DialogTitle>
                <DialogDescription>Masukkan detail barang yang disusutkan</DialogDescription>
              </DialogHeader>
              <form action={handleAddDepreciation} className="space-y-4">
                <div>
                  <Label htmlFor="itemId">Barang</Label>
                  <Select name="itemId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} (Stok: {item.currentStock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Jumlah</Label>
                  <Input id="quantity" name="quantity" type="number" required min="1" />
                </div>
                <div>
                  <Label htmlFor="reason">Alasan Penyusutan</Label>
                  <Textarea id="reason" name="reason" placeholder="Contoh: Rusak, Hilang, Kadaluarsa" required />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Depreciation Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepreciations.map((dep) => (
                <TableRow key={dep.id}>
                  <TableCell>{dep.date}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{dep.itemName}</p>
                      <p className="text-sm text-gray-500">{dep.itemCode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {dep.quantity} {dep.itemUnit}
                  </TableCell>
                  <TableCell>{dep.reason}</TableCell>
                  <TableCell>
                    <Badge variant={dep.status === "completed" ? "default" : "secondary"}>
                      {dep.status === "completed" ? "Selesai" : "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// User Management Component (Admin only)
function UserManagement({
  user,
  users,
  setUsers,
}: { user: User; users: User[]; setUsers: React.Dispatch<React.SetStateAction<User[]>> }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleAddUser = (formData: FormData) => {
    const newUser: User = {
      id: users.length + 1,
      username: formData.get("username") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as "admin" | "manager" | "staff",
      status: "active",
      lastLogin: "Belum pernah login",
    }
    setUsers([...users, newUser])
    setIsAddDialogOpen(false)
    toast({
      title: "Pengguna Ditambahkan",
      description: `Pengguna "${newUser.name}" berhasil ditambahkan.`,
    })
  }

  const handleExportUsers = () => {
    const headers = ["id", "username", "name", "email", "role", "status", "lastLogin"]
    downloadCsv(users, "users_data.csv", headers, toast)
  }

  const handleImportUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          toast({
            title: "Import Gagal",
            description: `Ada kesalahan dalam parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          })
          return
        }

        const importedData = results.data as Record<string, string>[]
        const newUsers: User[] = []
        let hasError = false

        for (const row of importedData) {
          const requiredFields = ["username", "name", "email", "role", "status"]
          const missingFields = requiredFields.filter((field) => !row[field])

          if (missingFields.length > 0) {
            toast({
              title: "Import Gagal",
              description: `CSV tidak memiliki kolom yang diperlukan: ${missingFields.join(", ")}.`,
              variant: "destructive",
            })
            hasError = true
            break
          }

          const parsedUser: User = {
            id: users.length + newUsers.length + 1,
            username: row.username,
            name: row.name,
            email: row.email,
            role: row.role as "admin" | "manager" | "staff",
            status: row.status as "active" | "inactive",
            lastLogin: row.lastLogin || "Belum pernah login",
          }

          if (!["admin", "manager", "staff"].includes(parsedUser.role)) {
            toast({
              title: "Import Gagal",
              description: `Role tidak valid untuk pengguna: ${parsedUser.username}.`,
              variant: "destructive",
            })
            hasError = true
            break
          }

          newUsers.push(parsedUser)
        }

        if (!hasError) {
          setUsers((prevUsers) => [...prevUsers, ...newUsers])
          toast({
            title: "Import Berhasil",
            description: `${newUsers.length} pengguna berhasil diimpor.`,
          })
        }
      },
      error: (error) => {
        toast({
          title: "Import Gagal",
          description: `Terjadi kesalahan saat membaca file: ${error.message}`,
          variant: "destructive",
        })
      },
    })
  }

  if (user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Pengguna</h2>
          <p className="text-gray-600">Kelola pengguna sistem</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <input type="file" accept=".csv" onChange={handleImportUsers} className="hidden" id="import-users-csv" />
          <Button onClick={() => document.getElementById("import-users-csv")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>Masukkan informasi pengguna baru</DialogDescription>
              </DialogHeader>
              <form action={handleAddUser} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" required />
                </div>
                <div>
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : u.role === "manager" ? "secondary" : "outline"}>
                      {u.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
                  </TableCell>
                  <TableCell>{u.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Application Component
export default function HotelInventorySystem() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // States for all main data
  const [users, setUsers] = useState<User[]>(initialMockUsers)
  const [items, setItems] = useState<Item[]>(initialMockItems)
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialMockSuppliers)
  const [transactions, setTransactions] = useState<Transaction[]>(initialMockTransactions)
  const [depreciations, setDepreciations] = useState<Depreciation[]>(initialMockDepreciations) // New state for depreciations

  if (!currentUser) {
    return <LoginForm onLogin={setCurrentUser} />
  }

  const navigationItems = getNavigationItems(currentUser.role)

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard user={currentUser} items={items} users={users} suppliers={suppliers} transactions={transactions} />
        )
      case "items":
        return <ItemsManagement user={currentUser} items={items} setItems={setItems} suppliers={suppliers} />
      case "suppliers":
        return <SuppliersManagement user={currentUser} suppliers={suppliers} setSuppliers={setSuppliers} />
      case "borrowing":
        return (
          <BorrowingManagement
            user={currentUser}
            items={items}
            transactions={transactions}
            setTransactions={setTransactions}
          />
        )
      case "depreciation": // New case for Depreciation Management
        return (
          <DepreciationManagement
            user={currentUser}
            items={items}
            setItems={setItems}
            depreciations={depreciations}
            setDepreciations={setDepreciations}
          />
        )
      case "users":
        return <UserManagement user={currentUser} users={users} setUsers={setUsers} />
      default:
        return (
          <Dashboard user={currentUser} items={items} users={users} suppliers={suppliers} transactions={transactions} />
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#25282A] to-[#25282A] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center h-16 bg-[#25282A] border-b border-[#F0D58D]">
          <div className="flex items-center space-x-2">
            <div className="w-32 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
              <img src="/images/ramayana-logo.png" alt="Ramayana Hotel Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-white">Inventaris HK</span>
          </div>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => setCurrentPage(item.key)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentPage === item.key
                      ? "bg-[#F0D58D] text-[#25282A] shadow-lg"
                      : "text-gray-300 hover:bg-[#F0D58D] hover:text-[#25282A]"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile in Sidebar */}
        <div className="absolute bottom-0 w-full p-4 bg-[#25282A] border-t border-[#F0D58D]">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs text-gray-400">{currentUser.role.toUpperCase()}</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-[#F0D58D] hover:text-[#25282A]"
            onClick={() => setCurrentUser(null)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            LOGOUT
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find((item) => item.key === currentPage)?.title || "Dashboard"}
                </h1>
                <p className="text-sm text-gray-600">Hotel Management System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search..." className="pl-10 w-64" />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {currentUser.role.toUpperCase()}
                </Badge>
                <Badge variant="outline">Online</Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{renderCurrentPage()}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}
