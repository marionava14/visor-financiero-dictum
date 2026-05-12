import * as XLSX from "xlsx";

export async function obtenerCuentas() {
  const response = await fetch("/datos_financieros_ejercicio.xlsx");
  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const hoja = workbook.Sheets["datos"];
  const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: null });

  // Fila 0 y 1 son título y subtítulo — la fila 2 es el encabezado
  const encabezado = filas[2];

  const cuentas = [];

  for (let i = 3; i < filas.length; i++) {
    const fila = filas[i];
    if (!fila || !fila[2]) continue;

    const obj = {};
    encabezado.forEach((col, idx) => {
      if (col !== null && col !== undefined) {
        obj[col] = fila[idx] ?? null;
      }
    });

    cuentas.push(obj);
  }

  return cuentas;
}