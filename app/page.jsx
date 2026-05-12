"use client";

import { useEffect, useState } from "react";
import { obtenerCuentas } from "../services/cuentas";
import TablaCuentas from "../components/TablaCuentas";

// Suma todas las CUENTA cuya Clave empiece con el prefijo dado
function calcularSubtotal(datos, prefijo, periodo) {
  return datos
    .filter((f) => f.Tipo === "CUENTA" && f["Clave"]?.startsWith(prefijo + "."))
    .reduce((suma, f) => suma + (parseFloat(f[periodo]) || 0), 0);
}

export default function Page() {
  const [datos, setDatos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    obtenerCuentas().then((cuentas) => {
      if (cuentas.length > 0) {
        const cols = Object.keys(cuentas[0]).filter(
          (k) => k !== "Clave" && k !== "Cuenta / Descripción" && k !== "Tipo"
        );
        setPeriodos(cols);
      }
      setDatos(cuentas);
      setCargando(false);
    });
  }, []);

  // Actualizar valor de una CUENTA al editar
  function handleEditar(clave, periodo, nuevoValor) {
    setDatos((prev) =>
      prev.map((f) =>
        f["Clave"] === clave ? { ...f, [periodo]: nuevoValor } : f
      )
    );
  }

  // Calcular subtotales y totales en cada render
  function obtenerValor(fila, periodo) {
    const tipo = fila.Tipo?.trim().toUpperCase();
    const clave = fila["Clave"];

    if (tipo === "CUENTA") return parseFloat(fila[periodo]) || 0;

    if (tipo === "SUBTOTAL") return calcularSubtotal(datos, clave, periodo);

    if (tipo === "TOTAL") {
      if (clave === "1") return calcularSubtotal(datos, "1", periodo);
      if (clave === "2") return calcularSubtotal(datos, "2", periodo);
      if (clave === "3") return calcularSubtotal(datos, "3", periodo);
      if (clave === "23")
        return (
          calcularSubtotal(datos, "2", periodo) +
          calcularSubtotal(datos, "3", periodo)
        );
    }

    return null;
  }

  // Filtrar por búsqueda
  const datosFiltrados = datos.filter((fila) => {
    const texto = busqueda.toLowerCase();
    return (
      fila["Cuenta / Descripción"]?.toLowerCase().includes(texto) ||
      fila["Clave"]?.toLowerCase().includes(texto)
    );
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Cargando...
      </div>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        DICTUM — Estado de Situación Financiera
      </h1>
      <p className="text-sm text-gray-500 mb-6">Cifras en pesos mexicanos (MXN)</p>

      {/* Buscador */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o clave..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <span className="text-sm text-gray-400">
          Mostrando {datosFiltrados.length} de {datos.length} cuentas
        </span>
      </div>

      {/* Tabla */}
      {datosFiltrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No se encontraron cuentas con esa búsqueda.
        </div>
      ) : (
        <TablaCuentas
          datos={datosFiltrados}
          periodos={periodos}
          onEditar={handleEditar}
          obtenerValor={obtenerValor}
        />
      )}
    </main>
  );
}