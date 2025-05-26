"use client"

import type React from "react"
import { useState, useEffect } from "react"
import GoalsAnalyzer from "./goals-analyzer"
import { parse } from "papaparse"

interface ElectionData {
  DISTRITO_F: string
  DISTRITO_L: string
  MUNICIPIO: string
  SECCION: string
  [key: string]: string
}

interface ElectionAnalyzerProps {
  csvData: string
}

const ElectionAnalyzer: React.FC<ElectionAnalyzerProps> = ({ csvData }) => {
  const [electionData, setElectionData] = useState<ElectionData[]>([])
  const [filteredData, setFilteredData] = useState<ElectionData[]>([])
  const [selectedDistritoF, setSelectedDistritoF] = useState<string>("")
  const [selectedDistritoL, setSelectedDistritoL] = useState<string>("")
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("")
  const [selectedSeccion, setSelectedSeccion] = useState<string>("")
  const [uniqueDistritosF, setUniqueDistritosF] = useState<string[]>([])
  const [uniqueDistritosL, setUniqueDistritosL] = useState<string[]>([])
  const [uniqueMunicipios, setUniqueMunicipios] = useState<string[]>([])
  const [uniqueSecciones, setUniqueSecciones] = useState<string[]>([])

  useEffect(() => {
    const parseCSVData = async () => {
      parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as ElectionData[]
          setElectionData(data)
          setFilteredData(data)

          // Extract unique values for dropdowns
          const distritosF = [...new Set(data.map((item) => item.DISTRITO_F))].sort()
          const distritosL = [...new Set(data.map((item) => item.DISTRITO_L))].sort()
          const municipios = [...new Set(data.map((item) => item.MUNICIPIO))].sort()
          const secciones = [...new Set(data.map((item) => item.SECCION))].sort()

          setUniqueDistritosF(distritosF)
          setUniqueDistritosL(distritosL)
          setUniqueMunicipios(municipios)
          setUniqueSecciones(secciones)
        },
      })
    }

    parseCSVData()
  }, [csvData])

  useEffect(() => {
    let newData = [...electionData]

    if (selectedDistritoF) {
      newData = newData.filter((item) => item.DISTRITO_F === selectedDistritoF)
    }

    if (selectedDistritoL) {
      newData = newData.filter((item) => item.DISTRITO_L === selectedDistritoL)
    }

    if (selectedMunicipio) {
      newData = newData.filter((item) => item.MUNICIPIO === selectedMunicipio)
    }

    if (selectedSeccion) {
      newData = newData.filter((item) => item.SECCION === selectedSeccion)
    }

    setFilteredData(newData)
  }, [selectedDistritoF, selectedDistritoL, selectedMunicipio, selectedSeccion, electionData])

  const handleDistritoFChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistritoF(e.target.value)
  }

  const handleDistritoLChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistritoL(e.target.value)
  }

  const handleMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMunicipio(e.target.value)
  }

  const handleSeccionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeccion(e.target.value)
  }

  return (
    <div>
      <div>
        <label htmlFor="distritoF">Distrito Federal:</label>
        <select id="distritoF" value={selectedDistritoF} onChange={handleDistritoFChange}>
          <option value="">Todos</option>
          {uniqueDistritosF.map((distrito) => (
            <option key={distrito} value={distrito}>
              {distrito}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="distritoL">Distrito Local:</label>
        <select id="distritoL" value={selectedDistritoL} onChange={handleDistritoLChange}>
          <option value="">Todos</option>
          {uniqueDistritosL.map((distrito) => (
            <option key={distrito} value={distrito}>
              {distrito}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="municipio">Municipio:</label>
        <select id="municipio" value={selectedMunicipio} onChange={handleMunicipioChange}>
          <option value="">Todos</option>
          {uniqueMunicipios.map((municipio) => (
            <option key={municipio} value={municipio}>
              {municipio}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="seccion">Sección:</label>
        <select id="seccion" value={selectedSeccion} onChange={handleSeccionChange}>
          <option value="">Todos</option>
          {uniqueSecciones.map((seccion) => (
            <option key={seccion} value={seccion}>
              {seccion}
            </option>
          ))}
        </select>
      </div>

      <GoalsAnalyzer data={filteredData} />
    </div>
  )
}

export default ElectionAnalyzer
