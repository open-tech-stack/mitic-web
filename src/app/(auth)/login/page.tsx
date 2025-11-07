import LoginForm from './components/LoginForm'
import BackgroundAnimation from './components/BackgroundAnimation'
import { AuthGuard } from '@/components/guards/AuthGuard'

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <BackgroundAnimation />
        <LoginForm />
      </div>
    </AuthGuard>
  )
}