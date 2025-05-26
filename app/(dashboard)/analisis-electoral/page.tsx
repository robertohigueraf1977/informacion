import { DashboardElectoral } from "@/components/analisis/dashboard-electoral"

export default function AnalisisElectoralPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Análisis Electoral</h1>
        <p className="text-muted-foreground">
          Análisis completo de resultados electorales con datos por partido, coalición y región
        </p>
      </div>

      <DashboardElectoral />
    </div>
  )
}
