'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Download,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  is_verified: boolean
  created_at: string
  listings_count: number
  favorites_count: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  dealer: 'Dealer',
  admin: 'Admin',
  inspector: 'Inspector',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailDialog, setDetailDialog] = useState(false)
  const [editRoleDialog, setEditRoleDialog] = useState(false)
  const [verifyDialog, setVerifyDialog] = useState(false)
  const [newRole, setNewRole] = useState<string>('')
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (roleFilter !== 'all') {
        params.append('role', roleFilter)
      }
      if (statusFilter !== 'all') {
        params.append('is_verified', statusFilter === 'verified' ? 'true' : 'false')
      }
      
      const offset = (pagination.page - 1) * pagination.limit
      params.append('limit', pagination.limit.toString())
      params.append('offset', offset.toString())
      
      const response = await fetch(`/api/admin/users?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.users || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit),
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memuat data user',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, roleFilter, statusFilter, pagination.page, pagination.limit, toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchQuery, roleFilter, statusFilter])

  const updateUserRole = async (userId: string, role: string) => {
    try {
      setUpdating(userId)
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user role')
      }
      
      toast({
        title: 'Berhasil',
        description: 'Role user berhasil diubah',
      })
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
      
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role })
      }
      
      setEditRoleDialog(false)
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal mengubah role user',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const updateUserVerification = async (userId: string, isVerified: boolean) => {
    try {
      setUpdating(userId)
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_verified: isVerified }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user verification')
      }
      
      toast({
        title: 'Berhasil',
        description: isVerified ? 'User berhasil diverifikasi' : 'Verifikasi user dibatalkan',
      })
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: isVerified } : u))
      
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, is_verified: isVerified })
      }
      
      setVerifyDialog(false)
    } catch (error) {
      console.error('Error updating user verification:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal mengubah verifikasi user',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const stats = {
    total: pagination.total,
    verified: users.filter(u => u.is_verified).length,
    dealers: users.filter(u => u.role === 'dealer').length,
    sellers: users.filter(u => u.role === 'seller').length,
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      buyer: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      seller: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      dealer: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      inspector: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    }
    return styles[role] || styles.buyer
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setEditRoleDialog(true)
  }

  const openVerifyDialog = (user: User) => {
    setSelectedUser(user)
    setVerifyDialog(true)
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
          <Button variant="outline" className="gap-2" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
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
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold">{pagination.total}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Semua pengguna</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dealers</CardTitle>
            <Shield className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats.dealers}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Dealer terdaftar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sellers</CardTitle>
            <TrendingUp className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats.sellers}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Penjual aktif</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats.verified}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Terverifikasi (halaman ini)</p>
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
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="dealer">Dealer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="inspector">Inspector</SelectItem>
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
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Tidak ada user</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Coba ubah filter pencarian'
                  : 'Belum ada user terdaftar'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Listings</TableHead>
                  <TableHead className="text-center">Favorites</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
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
                        {ROLE_LABELS[user.role] || user.role}
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
                    <TableCell className="text-center font-mono">{user.listings_count}</TableCell>
                    <TableCell className="text-center font-mono">{user.favorites_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={updating === user.id}>
                            {updating === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
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
                          <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openVerifyDialog(user)}>
                            {user.is_verified ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Unverify User
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Verify User
                              </>
                            )}
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
        
        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} user
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{pagination.page}</span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{pagination.totalPages || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xl">
                    {selectedUser.full_name?.[0] || selectedUser.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.full_name || 'No name'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <Badge className={getRoleBadge(selectedUser.role)}>
                    {ROLE_LABELS[selectedUser.role] || selectedUser.role}
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
                  <p className="font-medium">{selectedUser.listings_count}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Favorites</p>
                  <p className="font-medium">{selectedUser.favorites_count}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Verification Status</p>
                <div className="flex gap-2">
                  <Badge variant={selectedUser.is_verified ? 'default' : 'secondary'}>
                    {selectedUser.is_verified ? '✓' : '✗'} KYC Verified
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setDetailDialog(false)
              if (selectedUser) {
                openRoleDialog(selectedUser)
              }
            }}>
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleDialog} onOpenChange={setEditRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role untuk {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="inspector">Inspector</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedUser && updateUserRole(selectedUser.id, newRole)}
              disabled={updating === selectedUser?.id || newRole === selectedUser?.role}
            >
              {updating === selectedUser?.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify/Unverify Dialog */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.is_verified ? 'Unverify User' : 'Verify User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.is_verified
                ? `Batalkan verifikasi untuk ${selectedUser?.full_name || selectedUser?.email}?`
                : `Verifikasi ${selectedUser?.full_name || selectedUser?.email}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {selectedUser?.is_verified
                ? 'User akan kehilangan akses ke fitur yang memerlukan verifikasi.'
                : 'User akan mendapat akses penuh ke fitur yang memerlukan verifikasi.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedUser && updateUserVerification(selectedUser.id, !selectedUser.is_verified)}
              disabled={updating === selectedUser?.id}
              variant={selectedUser?.is_verified ? 'destructive' : 'default'}
            >
              {updating === selectedUser?.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedUser?.is_verified ? 'Unverify' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
