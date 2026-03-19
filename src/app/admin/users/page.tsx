'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Loader2,
  Filter,
  Download,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: string
  is_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  last_login: string | null
  listing_count: number
  token_balance: number
}

const mockUsers: User[] = [
  { id: '1', email: 'john@example.com', full_name: 'John Doe', phone: '081234567890', avatar_url: null, role: 'user', is_verified: true, email_verified: true, phone_verified: true, created_at: '2024-01-15', last_login: '2024-03-20', listing_count: 5, token_balance: 150 },
  { id: '2', email: 'jane@example.com', full_name: 'Jane Smith', phone: '082345678901', avatar_url: null, role: 'seller', is_verified: true, email_verified: true, phone_verified: false, created_at: '2024-02-10', last_login: '2024-03-19', listing_count: 12, token_balance: 320 },
  { id: '3', email: 'dealer@auto.com', full_name: 'Auto Dealer Jakarta', phone: '083456789012', avatar_url: null, role: 'dealer', is_verified: true, email_verified: true, phone_verified: true, created_at: '2024-01-05', last_login: '2024-03-20', listing_count: 45, token_balance: 1250 },
  { id: '4', email: 'mike@test.com', full_name: 'Mike Wilson', phone: '084567890123', avatar_url: null, role: 'user', is_verified: false, email_verified: false, phone_verified: false, created_at: '2024-03-18', last_login: null, listing_count: 0, token_balance: 0 },
  { id: '5', email: 'sarah@mail.com', full_name: 'Sarah Connor', phone: '085678901234', avatar_url: null, role: 'seller', is_verified: true, email_verified: true, phone_verified: true, created_at: '2024-02-20', last_login: '2024-03-15', listing_count: 8, token_balance: 75 },
]

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setUsers(mockUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data user',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (user.phone?.includes(searchQuery) ?? false)

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'verified' && user.is_verified) ||
      (statusFilter === 'unverified' && !user.is_verified)

    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    verified: users.filter(u => u.is_verified).length,
    activeToday: users.filter(u => {
      if (!u.last_login) return false
      const lastLogin = new Date(u.last_login)
      const today = new Date()
      return lastLogin.toDateString() === today.toDateString()
    }).length,
    newThisMonth: users.filter(u => {
      const created = new Date(u.created_at)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      user: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      seller: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      dealer: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    }
    return styles[role] || styles.user
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Users className="h-5 w-5 text-white" />
            </div>
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola semua pengguna platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua pengguna</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground mt-1">Terverifikasi</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
            <TrendingUp className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Login hari ini</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
            <UserPlus className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">Pendaftaran baru</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="dealer">Dealer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Listings</TableHead>
                  <TableHead className="text-center">Tokens</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm">
                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_verified ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono">{user.listing_count}</TableCell>
                    <TableCell className="text-center font-mono">{user.token_balance}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.last_login)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setDetailDialog(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Verify User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <UserX className="h-4 w-4 mr-2" />
                            Block User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xl">
                    {selectedUser.full_name?.[0] || selectedUser.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <Badge className={getRoleBadge(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone || '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Listings</p>
                  <p className="font-medium">{selectedUser.listing_count}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Token Balance</p>
                  <p className="font-medium">{selectedUser.token_balance}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Verification Status</p>
                <div className="flex gap-2">
                  <Badge variant={selectedUser.email_verified ? 'default' : 'secondary'}>
                    {selectedUser.email_verified ? '✓' : '✗'} Email
                  </Badge>
                  <Badge variant={selectedUser.phone_verified ? 'default' : 'secondary'}>
                    {selectedUser.phone_verified ? '✓' : '✗'} Phone
                  </Badge>
                  <Badge variant={selectedUser.is_verified ? 'default' : 'secondary'}>
                    {selectedUser.is_verified ? '✓' : '✗'} KYC
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(false)}>
              Close
            </Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
