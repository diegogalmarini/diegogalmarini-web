import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { ModalProvider } from '../contexts/ModalContext'
import { PlansProvider } from '../contexts/PlansContext'
import { LoginModal } from '../components/LoginModal'
import { BookingModal } from '../components/BookingModal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Diego Galmarini - Socio Tecnológico Estratégico',
  description: 'Transformando ideas en productos tecnológicos escalables, rentables y desplegados.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <PlansProvider>
            <ModalProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
              <LoginModal />
              <BookingModal />
            </ModalProvider>
          </PlansProvider>
        </AuthProvider>
      </body>
    </html>
  )
}