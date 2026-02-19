'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold hover:opacity-80">
          総務管理システム
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="hover:underline">トップ</Link>
          <Link href="/parking" className="hover:underline">駐車場管理</Link>
        </nav>
      </div>
    </header>
  )
}
