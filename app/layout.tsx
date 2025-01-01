import { ChakraProvider } from '@chakra-ui/react'
import { Inter } from 'next/font/google'
import Header from './components/Header'
import { Providers } from './providers'
import './styles/markdown.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MX Copilot',
  description: 'Mendix Development Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
