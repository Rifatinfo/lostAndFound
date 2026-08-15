import { Suspense } from 'react'
import { LoginLayout } from '@/components/modules/auth/LoginLayout'
import LogoutSuccessToast from '@/components/modules/auth/LogoutSuccessToast'

export default function LoginPage() {
  return (
    <Suspense>
      <LogoutSuccessToast />
      <LoginLayout />
    </Suspense>
  )
}
