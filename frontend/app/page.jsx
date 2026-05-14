"use client";

import { useEffect, useState } from "react";
import { obtenerCuentas } from "../services/cuentas";
import TablaCuentas from "../components/TablaCuentas";

function calcularSubtotal(datos, prefijo, periodo) {
  return datos
    .filter((f) => f.Tipo === "CUENTA" && f["Clave"]?.startsWith(prefijo + "."))
    .reduce((suma, f) => suma + (parseFloat(f[periodo]) || 0), 0);
}

export default function Page() {
  const [datos, setDatos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  function cargarDatos() {
    setCargando(true);
    setError(null);
    obtenerCuentas()
      .then((cuentas) => {
        if (cuentas.length === 0) {
          setDatos([]);
          setCargando(false);
          return;
        }
        const primeraCuenta = cuentas.find((c) => c.Tipo === "CUENTA");
        if (primeraCuenta) {
          const cols = Object.keys(primeraCuenta).filter(
            (k) => k !== "Clave" && k !== "Cuenta / Descripción" && k !== "Tipo"
          );
          setPeriodos(cols);
        }
        setDatos(cuentas);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudieron cargar las cuentas. Verifica que la API esté activa.");
        setCargando(false);
      });
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function handleEditar(clave, periodo, nuevoValor) {
    setDatos((prev) =>
      prev.map((f) =>
        f["Clave"] === clave ? { ...f, [periodo]: nuevoValor } : f
      )
    );
  }

  function obtenerValor(fila, periodo) {
    const tipo = fila.Tipo?.trim().toUpperCase();
    const clave = fila["Clave"];
    if (tipo === "CUENTA") return parseFloat(fila[periodo]) || 0;
    if (tipo === "SUBTOTAL") {
      const prefijo = clave.replace("STL-", "");
      return calcularSubtotal(datos, prefijo, periodo);
    }
    if (tipo === "TOTAL") {
      if (clave === "TOT-1") return calcularSubtotal(datos, "1", periodo);
      if (clave === "TOT-2") return calcularSubtotal(datos, "2", periodo);
      if (clave === "TOT-3") return calcularSubtotal(datos, "3", periodo);
      if (clave === "TOT-23")
        return calcularSubtotal(datos, "2", periodo) + calcularSubtotal(datos, "3", periodo);
    }
    return null;
  }

  const datosFiltrados = datos.filter((fila) => {
    const texto = busqueda.toLowerCase();
    return (
      fila["Cuenta / Descripción"]?.toLowerCase().includes(texto) ||
      fila["Clave"]?.toLowerCase().includes(texto)
    );
  });

  // Estado: cargando
  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Cargando cuentas...</p>
      </div>
    );
  }

  // Estado: error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={cargarDatos}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Estado: sin datos
  if (datos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">No hay cuentas disponibles.</p>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        DICTUM — Estado de Situación Financiera
      </h1>
      <p className="text-sm text-gray-500 mb-6">Cifras en pesos mexicanos (MXN)</p>

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