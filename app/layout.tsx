import "./globals.css"

import type { Metadata } from "next"

import { Layout } from "./components"
import Navbar from "./components/Navbar/Navbar"

export const metadata: Metadata = {
  title: "23_store",
  description: "Something better than amazon",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
