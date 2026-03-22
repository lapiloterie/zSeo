'use client'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface TopBarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/30">
      <div />
      <div className="flex items-center gap-3">
        {user?.image && (
          <Image src={user.image} alt={user.name || ''} width={32} height={32} className="rounded-full" />
        )}
        <div className="text-sm">
          <p className="font-medium leading-none">{user?.name}</p>
          <p className="text-muted-foreground text-xs mt-0.5">{user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors text-xs border border-border rounded-lg px-3 py-1.5">
          Déconnexion
        </button>
      </div>
    </header>
  )
}
