export async function obtenerCuentas() {
  const response = await fetch("http://localhost:5169/api/cuentas");
  const data = await response.json();

  return data.map((cuenta) => {
    const obj = {
      Clave: cuenta.clave,
      "Cuenta / Descripción": cuenta.descripcion,
      Tipo: cuenta.tipo,
    };

    Object.entries(cuenta.periodos).forEach(([periodo, monto]) => {
      obj[periodo] = monto;
    });

    return obj;
  });
}