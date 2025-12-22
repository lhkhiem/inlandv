import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to login if not authenticated, or dashboard if authenticated
  redirect('/login')
}

