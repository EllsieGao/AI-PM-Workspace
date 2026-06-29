import NavBar from "@/components/layout/NavBar"
import GlobalFloatingMemo from "@/components/memos/GlobalFloatingMemo"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', background: '#FDFBF7' }}>
      <NavBar />
      <main style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {children}
      </main>
      <GlobalFloatingMemo />
    </div>
  )
}
