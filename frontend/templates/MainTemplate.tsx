import React from 'react'
import Header from '../components/molecules/Header'

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  )
}
