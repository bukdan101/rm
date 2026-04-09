'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, TrendingUp, TrendingDown, Activity, Coins, Loader2, Edit, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

interface CreditTransaction {
  id: string
  userId: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string | null
  referenceType: string | null
  referenceId: string | null
  createdAt: string
  profile: {
    name: string | null
    email: string
  }
}

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  bonusCredits: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const getTypeBadge = (type: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    purchase: { label: 'Pembelian', variant: 'default' },
    usage: { label: 'Penggunaan', variant: 'destructive' },
    use: { label: 'Penggunaan', variant: 'destructive' },
    bonus: { label: 'Bonus', variant: 'secondary' },
    refund: { label: 'Refund', variant: 'default' },
    expire: { label: 'Kadaluarsa', variant: 'destructive' },
  }
  const { label, variant } = config[type] || { label: type, variant: 'secondary' }
  return <Badge variant={variant}>{label}</Badge>
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

export default function AdminCreditsPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editPkg, setEditPkg] = useState<CreditPackage | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    credits: 0,
    price: 0,
    bonusCredits: 0,
    isActive: true,
    sortOrder: 0,
  })

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/credits')
      const data = await response.json()
      if (data.success) {
        setTransactions(data.transactions || [])
        setTotalRevenue(data.totalRevenue || 0)
      }
    } catch (error) {
      console.error('Error fetching credit transactions:', error)
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/credit-packages')
      const data = await response.json()
      if (data.success) {
        setPackages(data.packages || [])
      }
    } catch (error) {
      console.error('Error fetching credit packages:', error)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchTransactions(), fetchPackages()])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openEdit = (pkg: CreditPackage) => {
    setEditPkg(pkg)
    setForm({
      name: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      bonusCredits: pkg.bonusCredits || 0,
      isActive: pkg.isActive !== false,
      sortOrder: pkg.sortOrder || 0,
    })
  }

  const openCreate = () => {
    setShowCreateDialog(true)
    setForm({
      name: '',
      credits: 0,
      price: 0,
      bonusCredits: 0,
      isActive: true,
      sortOrder: packages.length,
    })
  }

  const saveEdit = async () => {
    if (!editPkg) return
    setSaving(true)

    try {
      const response = await fetch('/api/admin/credit-packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editPkg.id,
          ...form,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: 'Paket kredit diperbarui' })
        setEditPkg(null)
        fetchPackages()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan' })
    } finally {
      setSaving(false)
    }
  }

  const createPackage = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/credit-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: 'Paket kredit dibuat' })
        setShowCreateDialog(false)
        fetchPackages()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal membuat paket' })
    } finally {
      setSaving(false)
    }
  }

  const stats = useMemo(() => {
    const totalTransactions = transactions.length
    const totalCreditsIn = transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0)
    const totalCreditsOut = Math.abs(transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0))
    const netCredits = totalCreditsIn - totalCreditsOut

    return {
      totalTransactions,
      totalCreditsIn,
      totalCreditsOut,
      netCredits,
      totalRevenue,
    }
  }, [transactions, totalRevenue])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Coins className="h-8 w-8 text-orange-500" />
          Manajemen Kredit
        </h1>
        <p className="text-gray-400 mt-1">Kelola paket kredit dan transaksi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gray-900 border-gray-800 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Total Transaksi</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Kredit Masuk</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">+{stats.totalCreditsIn}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Kredit Keluar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">-{stats.totalCreditsOut}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">Net Kredit</CardTitle>
            <Coins className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netCredits >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              {stats.netCredits >= 0 ? '+' : ''}{stats.netCredits}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-400">Total Pendapatan</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-400">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="packages">Paket Kredit</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Paket Kredit ({packages.length})
              </CardTitle>
              <Button onClick={openCreate} className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-700 hover:via-orange-700 hover:to-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Paket
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Coins className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Belum ada paket kredit</p>
                  <p className="text-sm mt-1">Klik "Tambah Paket" untuk membuat paket baru</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-400">Nama</TableHead>
                        <TableHead className="text-gray-400">Kredit</TableHead>
                        <TableHead className="text-gray-400">Bonus</TableHead>
                        <TableHead className="text-gray-400">Harga</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-right text-gray-400">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map((p) => (
                        <TableRow key={p.id} className="border-gray-800 hover:bg-gray-800/50">
                          <TableCell className="font-medium text-white">{p.name}</TableCell>
                          <TableCell className="text-gray-300">{p.credits}</TableCell>
                          <TableCell>
                            {p.bonusCredits > 0 && (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                                +{p.bonusCredits}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-300">{formatCurrency(p.price)}</TableCell>
                          <TableCell>
                            <Badge variant={p.isActive ? 'default' : 'secondary'}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="text-gray-400 hover:text-white">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Transaksi Kredit
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Belum ada transaksi kredit</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-400">Pengguna</TableHead>
                        <TableHead className="text-gray-400">Tipe</TableHead>
                        <TableHead className="text-gray-400">Jumlah</TableHead>
                        <TableHead className="text-gray-400">Deskripsi</TableHead>
                        <TableHead className="text-gray-400">Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id} className="border-gray-800 hover:bg-gray-800/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">{tx.profile?.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{tx.profile?.email || ''}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(tx.type)}</TableCell>
                          <TableCell className={`font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </TableCell>
                          <TableCell className="text-gray-400">{tx.description || '-'}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editPkg} onOpenChange={() => setEditPkg(null)}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Paket Kredit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Nama Paket</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-400">Kredit</Label>
                <Input
                  type="number"
                  value={form.credits}
                  onChange={e => setForm({ ...form, credits: +e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Bonus Kredit</Label>
                <Input
                  type="number"
                  value={form.bonusCredits}
                  onChange={e => setForm({ ...form, bonusCredits: +e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-400">Harga (IDR)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: +e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Urutan</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm({ ...form, sortOrder: +e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-400">Status Active</Label>
              <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPkg(null)} className="border-gray-700 text-gray-300">Batal</Button>
            <Button onClick={saveEdit} disabled={saving} className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Tambah Paket Kredit Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Nama Paket</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Paket Starter"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-400">Kredit</Label>
                <Input
                  type="number"
                  value={form.credits}
                  onChange={e => setForm({ ...form, credits: +e.target.value })}
                  placeholder="50"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Bonus Kredit</Label>
                <Input
                  type="number"
                  value={form.bonusCredits}
                  onChange={e => setForm({ ...form, bonusCredits: +e.target.value })}
                  placeholder="0"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-400">Harga (IDR)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: +e.target.value })}
                  placeholder="50000"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Urutan</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm({ ...form, sortOrder: +e.target.value })}
                  placeholder="0"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-400">Status Active</Label>
              <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-gray-700 text-gray-300">Batal</Button>
            <Button onClick={createPackage} disabled={saving} className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Buat Paket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
