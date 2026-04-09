'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Radio, Plus, Edit, Trash2, Send, Loader2, ChevronLeft, ChevronRight,
  Calendar, Users, Mail, Bell, Smartphone, Globe, Clock, CheckCircle,
  XCircle, AlertCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface Broadcast {
  id: string
  title: string
  message: string
  type: 'notification' | 'email' | 'push' | 'all'
  target: 'all' | 'users' | 'dealers' | 'admins'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  scheduled_at: string | null
  sent_at: string | null
  recipients: number
  created_at: string
  updated_at: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const typeConfig = {
  notification: { icon: Bell, color: 'bg-blue-500', label: 'Notification' },
  email: { icon: Mail, color: 'bg-green-500', label: 'Email' },
  push: { icon: Smartphone, color: 'bg-purple-500', label: 'Push' },
  all: { icon: Globe, color: 'bg-orange-500', label: 'All Channels' },
}

const targetConfig = {
  all: { icon: Users, color: 'text-gray-400', label: 'All Users' },
  users: { icon: Users, color: 'text-blue-400', label: 'Users' },
  dealers: { icon: Users, color: 'text-orange-400', label: 'Dealers' },
  admins: { icon: Users, color: 'text-red-400', label: 'Admins' },
}

const statusConfig = {
  draft: { icon: Edit, color: 'bg-gray-500', label: 'Draft' },
  scheduled: { icon: Clock, color: 'bg-blue-500', label: 'Scheduled' },
  sending: { icon: Loader2, color: 'bg-yellow-500', label: 'Sending' },
  sent: { icon: CheckCircle, color: 'bg-green-500', label: 'Sent' },
  failed: { icon: XCircle, color: 'bg-red-500', label: 'Failed' },
}

export default function AdminBroadcastPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'notification' as Broadcast['type'],
    target: 'all' as Broadcast['target'],
    scheduled_at: '',
  })

  useEffect(() => {
    fetchBroadcasts()
  }, [pagination.page, statusFilter, typeFilter])

  const fetchBroadcasts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)

      const res = await fetch(`/api/admin/broadcast?${params}`)
      const data = await res.json()

      if (data.success) {
        setBroadcasts(data.data || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching broadcasts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load broadcast data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: 'Error',
        description: 'Title and message are required',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduled_at: formData.scheduled_at || null,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Broadcast created successfully',
        })
        setShowCreateDialog(false)
        resetForm()
        fetchBroadcasts()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedBroadcast) return
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: 'Error',
        description: 'Title and message are required',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBroadcast.id,
          updates: {
            ...formData,
            scheduled_at: formData.scheduled_at || null,
          },
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Broadcast updated successfully',
        })
        setShowEditDialog(false)
        resetForm()
        fetchBroadcasts()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBroadcast) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/broadcast?id=${selectedBroadcast.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Broadcast deleted successfully',
        })
        setShowDeleteDialog(false)
        setSelectedBroadcast(null)
        fetchBroadcasts()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSendNow = async (broadcast: Broadcast) => {
    setSending(true)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: broadcast.id,
          updates: {
            status: 'sending',
          },
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Broadcast sending initiated',
        })
        fetchBroadcasts()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'notification',
      target: 'all',
      scheduled_at: '',
    })
    setSelectedBroadcast(null)
  }

  const openEditDialog = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast)
    setFormData({
      title: broadcast.title,
      message: broadcast.message,
      type: broadcast.type,
      target: broadcast.target,
      scheduled_at: broadcast.scheduled_at ? new Date(broadcast.scheduled_at).toISOString().slice(0, 16) : '',
    })
    setShowEditDialog(true)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: Broadcast['status']) => {
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge className={cn(config.color, 'gap-1')}>
        <Icon className={cn('h-3 w-3', status === 'sending' && 'animate-spin')} />
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type: Broadcast['type']) => {
    const config = typeConfig[type]
    const Icon = config.icon
    return (
      <Badge variant="outline" className="border-gray-700 gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radio className="h-6 w-6 text-orange-500" />
            Broadcast Messages
          </h1>
          <p className="text-gray-400 mt-1">Manage broadcast messages to users</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowCreateDialog(true)
          }}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Broadcast
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="all">All Channels</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="border-orange-500/30 text-orange-400 w-fit">
              {pagination.total} Total Broadcasts
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Broadcasts Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No broadcasts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-gray-400 font-medium">Title</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Target</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Scheduled At</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Sent At</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Recipients</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map((broadcast) => (
                    <tr key={broadcast.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{broadcast.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">{broadcast.message}</p>
                        </div>
                      </td>
                      <td className="p-4">{getTypeBadge(broadcast.type)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-300">{targetConfig[broadcast.target].label}</span>
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(broadcast.status)}</td>
                      <td className="p-4 text-gray-400 text-sm">
                        {broadcast.scheduled_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(broadcast.scheduled_at)}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{formatDate(broadcast.sent_at)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-white">{broadcast.recipients}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {broadcast.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleSendNow(broadcast)}
                              disabled={sending}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                              {sending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {broadcast.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(broadcast)}
                              className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {broadcast.status !== 'sending' && broadcast.status !== 'sent' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBroadcast(broadcast)
                                setShowDeleteDialog(true)
                              }}
                              className="border-red-800 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} broadcasts
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="border-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="border-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Broadcast</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new broadcast message to send to users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter broadcast title"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Message</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter broadcast message"
                rows={4}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as Broadcast['type'] }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="all">All Channels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Target</Label>
                <Select
                  value={formData.target}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, target: v as Broadcast['target'] }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="dealers">Dealers</SelectItem>
                    <SelectItem value="admins">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Scheduled At (Optional)</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">Leave empty to save as draft</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                resetForm()
              }}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Broadcast</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update broadcast details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter broadcast title"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Message</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter broadcast message"
                rows={4}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as Broadcast['type'] }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="all">All Channels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Target</Label>
                <Select
                  value={formData.target}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, target: v as Broadcast['target'] }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="dealers">Dealers</SelectItem>
                    <SelectItem value="admins">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Scheduled At (Optional)</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">Leave empty to save as draft</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false)
                resetForm()
              }}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={saving}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Broadcast</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedBroadcast?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
