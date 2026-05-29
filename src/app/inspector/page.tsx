'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar, Clock, MapPin, Car, CheckCircle2, AlertTriangle,
  Navigation, Phone, FileCheck, Loader2, Star
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface InspectionTask {
  id: string
  booking_number: string
  scheduled_date: string
  location_address: string
  status: string
  car_listing: {
    id: string
    title: string
    year: number
    brands?: { name: string }
    car_models?: { name: string }
  }
  user?: {
    id: string
    name: string
    phone: string
  }
}

export default function InspectorDashboard() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<InspectionTask[]>([])
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    completed: 0,
    rating: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch inspector's tasks
      const res = await fetch('/api/inspections/bookings?inspector_id=current&status=scheduled')
      const data = await res.json()
      
      if (data.success) {
        setTasks(data.data || [])
      }

      // Calculate stats
      setStats({
        today: tasks.filter(t => {
          const taskDate = new Date(t.scheduled_date).toDateString()
          return taskDate === new Date().toDateString()
        }).length,
        pending: tasks.filter(t => t.status === 'scheduled' || t.status === 'confirmed').length,
        completed: 45, // Demo data
        rating: 4.8
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Terjadwal</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Dikonfirmasi</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Sedang Berlangsung</Badge>
      case 'completed':
        return <Badge className="bg-green-500">Selesai</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="text-xl">IN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Dashboard Inspector</h1>
            <p className="text-muted-foreground">
              Selamat datang kembali, Inspector
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Tersedia
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.today}</div>
                <div className="text-sm text-muted-foreground">Inspeksi Hari Ini</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Menunggu</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Total Selesai</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.rating}</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Hari Ini</TabsTrigger>
          <TabsTrigger value="upcoming">Mendatang</TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4 space-y-4">
          {tasks.filter(t => {
            const taskDate = new Date(t.scheduled_date).toDateString()
            return taskDate === new Date().toDateString()
          }).length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Tidak ada jadwal hari ini</h3>
                  <p className="text-sm text-muted-foreground">
                    Inspeksi yang dijadwalkan akan muncul di sini
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            tasks.filter(t => {
              const taskDate = new Date(t.scheduled_date).toDateString()
              return taskDate === new Date().toDateString()
            }).map((task) => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Car className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{task.car_listing?.title}</h3>
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.car_listing?.brands?.name} {task.car_listing?.car_models?.name} - {task.car_listing?.year}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(task.scheduled_date), 'HH:mm', { locale: id })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{task.location_address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigasi
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/inspector/task/${task.id}`}>
                          Mulai Inspeksi
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {tasks.filter(t => new Date(t.scheduled_date) > new Date()).map((task) => (
            <Card key={task.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{task.car_listing?.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(task.scheduled_date), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{task.location_address}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                Riwayat inspeksi yang telah selesai akan muncul di sini
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Akses fitur inspector dengan cepat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/inspector/schedule">
                <Calendar className="h-5 w-5" />
                <span>Jadwal</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/inspector/history">
                <FileCheck className="h-5 w-5" />
                <span>Riwayat</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/inspector/profile">
                <Star className="h-5 w-5" />
                <span>Profil</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/inspector/help">
                <AlertTriangle className="h-5 w-5" />
                <span>Bantuan</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
