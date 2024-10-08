import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Sidebar from './components/Sidebar'
import SessionProvider from './components/SessionProvider'
import { getServerSession } from 'next-auth'
import Login from './components/Login'
import ClientProvider from './components/ClientProvider'
import { authOption } from '../pages/api/auth/[...nextauth]'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NeptuneGPT',
  description: 'Build networks with AI',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOption)

  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--color-bg-black)]`}>
        <SessionProvider session={session}>
          {!session ? (
            <Login />
          ) : (
            <div className="flex overflow-hidden">
              <div className="flex-shrink-0">
                <Sidebar />
              </div>
              <ClientProvider />
              <div className="flex-1 min-w-0 flex flex-col items-center ">
                {children}
              </div>
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  )
}
