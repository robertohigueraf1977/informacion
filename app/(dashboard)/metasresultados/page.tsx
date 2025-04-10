"use client"

import { ElectionAnalyzer } from "@/components/metasresultados/election-analyzer"

export default function MetasResultadosPage() {
  const csvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/resultados%20presidencia-cNnVj2vfLnshNgRFm1mV9Q5ymUyRiy.csv"

  return (
    <div className="space-y-6">
      <ElectionAnalyzer csvUrl={csvUrl} />
    </div>
  )
}
