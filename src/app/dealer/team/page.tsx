'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  UserPlus,
  Search,
  Crown,
  Briefcase,
  Eye,
  MessageSquare,
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'owner' | 'admin' | 'sales'
  status: 'active' | 'pending' | 'inactive'
  avatar_url: string | null
  joined_at: string
  stats: {
    listings: number
    sales: number
    inquiries: number
  }
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Ahmad Susanto',
    email: 'ahmad@autoprima.com',
    phone: '08123456789',
    role: 'owner',
    status: 'active',
    avatar_url: null,
    joined_at: '2023-01-15',
    stats: { listings: 45, sales: 12, inquiries: 156 },
  },
  {
    id: '2',
    name: 'Rina Dewi',
    email: 'rina@autoprima.com',
    phone: '08198765432',
    role: 'admin',
    status: 'active',
    avatar_url: null,
    joined_at: '2023-03-20',
    stats: { listings: 28, sales: 8, inquiries: 98 },
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi@autoprima.com',
    phone: '08156789123',
    role: 'sales',
    status: 'active',
    avatar_url: null,
    joined_at: '2023-06-10',
    stats: { listings: 15, sales: 5, inquiries: 67 },
  },
  {
    id: '4',
    name: 'Sari Wulandari',
    email: 'sari@autoprima.com',
    phone: '08212345678',
    role: 'sales',
    status: 'pending',
    avatar_url: null,
    joined_at: '2024-01-05',
    stats: { listings: 0, sales: 0, inquiries: 0 },
  },
]

const roleConfig = {
  owner: {
    label: 'Owner',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Crown,
    permissions: ['Semua akses', 'Kelola tim', 'Pengaturan dealer'],
  },
  admin: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    icon: Shield,
    permissions: ['Kelola iklan', 'Lihat statistik', 'Kelola tim'],
  },
  sales: {
    label: 'Sales',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Briefcase,
    permissions: ['Kelola iklan sendiri', 'Lihat statistik sendiri'],
  },
}

const statusConfig = {
  active: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  inactive: { label: 'Nonaktif', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
}

export default function DealerTeamPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('sales')

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-500" />
            Tim & Staf
          </h1>
          <p className="text-muted-foreground">
            Kelola anggota tim dealer Anda
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Undang Anggota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Undang Anggota Tim</DialogTitle>
              <DialogDescription>
                Kirim undangan untuk bergabung ke tim dealer Anda
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">Permission:</p>
                <ul className="text-sm text-muted-foreground">
                  {roleConfig[newMemberRole as keyof typeof roleConfig].permissions.map((perm, i) => (
                    <li key={i}>• {perm}</li>
                  ))}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={() => setInviteDialogOpen(false)}>
                Kirim Undangan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari anggota..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{teamMembers.length}</p>
          <p className="text-sm text-muted-foreground">Total Anggota</p>
        </Card>
        <Card className="p-4 text-center bg-emerald-50 dark:bg-emerald-950/30">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {teamMembers.filter(m => m.status === 'active').length}
          </p>
          <p className="text-sm text-muted-foreground">Aktif</p>
        </Card>
        <Card className="p-4 text-center bg-amber-50 dark:bg-amber-950/30">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {teamMembers.filter(m => m.status === 'pending').length}
          </p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </Card>
        <Card className="p-4 text-center bg-purple-50 dark:bg-purple-950/30">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {teamMembers.reduce((sum, m) => sum + m.stats.sales, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Penjualan</p>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Anggota</CardTitle>
          <CardDescription>Semua anggota tim dealer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembers.map((member) => {
              const roleInfo = roleConfig[member.role]
              const statusInfo = statusConfig[member.status]
              const RoleIcon = roleInfo.icon
              
              return (
                <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url || ''} />
                    <AvatarFallback className={`bg-gradient-to-br ${
                      member.role === 'owner' ? 'from-amber-400 to-amber-600' :
                      member.role === 'admin' ? 'from-purple-400 to-purple-600' :
                      'from-blue-400 to-blue-600'
                    } text-white font-medium`}>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      <Badge className={roleInfo.color}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleInfo.label}
                      </Badge>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {member.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {member.stats.listings} iklan
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {member.stats.inquiries} inquiries
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {member.stats.sales} terjual
                      </span>
                    </div>
                  </div>
                  
                  {member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Kirim Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permission per Role</CardTitle>
          <CardDescription>Akses yang dimiliki setiap role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(roleConfig).map(([key, config]) => {
              const Icon = config.icon
              return (
                <div key={key} className="p-4 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {config.permissions.map((perm, i) => (
                      <li key={i}>• {perm}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
