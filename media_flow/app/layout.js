import { ClerkProvider, UserButton } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '1rem',
            gap: '1rem',
            height: '64px'
          }}>
            <UserButton />
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

