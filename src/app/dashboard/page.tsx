import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyIdToken } from '@/lib/firebase/verify-session'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  // Check authentication
  const cookieStore = cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/')
  }

  try {
    await verifyIdToken(session)
  } catch (error) {
    console.error('Session verification failed:', error)
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard de Administración
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona consultas y citas de clientes
          </p>
        </div>
        
        <DashboardClient />
      </div>
    </div>
  )
}