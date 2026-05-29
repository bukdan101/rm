'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Share2,
  Facebook,
  Twitter,
  Link2,
  Check,
  Copy,
  MessageCircle,
} from 'lucide-react'

interface SocialShareButtonsProps {
  title: string
  url?: string
  variant?: 'full' | 'compact' | 'dialog'
  className?: string
}

export function SocialShareButtons({
  title,
  url,
  variant = 'full',
  className,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(shareUrl)

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
    },
  ]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link berhasil disalin!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Gagal menyalin link')
    }
  }

  const handleShare = (href: string) => {
    window.open(href, '_blank', 'width=600,height=400')
  }

  if (variant === 'compact') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className={cn("", className)}>
            <Share2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bagikan</DialogTitle>
            <DialogDescription>
              Bagikan listing ini ke media sosial atau salin link
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-4">
            {socialLinks.map((link) => (
              <Button
                key={link.name}
                className={cn("flex-1", link.color)}
                onClick={() => handleShare(link.href)}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.name}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button type="button" size="sm" className="px-3" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (variant === 'dialog') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className={cn("gap-2", className)}>
            <Share2 className="h-4 w-4" />
            Bagikan
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bagikan Iklan</DialogTitle>
            <DialogDescription>
              Bagikan listing "{title}" ke media sosial
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {socialLinks.map((link) => (
              <Button
                key={link.name}
                className={cn("h-12", link.color)}
                onClick={() => handleShare(link.href)}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.name}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <label htmlFor="link" className="text-sm font-medium">
                Atau salin link
              </label>
              <div className="flex items-center gap-2">
                <Input id="link" value={shareUrl} readOnly />
                <Button type="button" size="sm" className="px-3 shrink-0" onClick={handleCopyLink}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Disalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Salin
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Full variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {socialLinks.map((link) => (
        <Button
          key={link.name}
          variant="outline"
          size="icon"
          className={cn("h-9 w-9", link.color)}
          onClick={() => handleShare(link.href)}
        >
          <link.icon className="h-4 w-4" />
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-gray-100 hover:bg-gray-200 text-gray-600"
        onClick={handleCopyLink}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}
