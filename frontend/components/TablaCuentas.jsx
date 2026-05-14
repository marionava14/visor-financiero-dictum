const estilosPorTipo = {
  GRUPO:    "bg-blue-900 text-white font-bold text-sm uppercase tracking-wide",
  SUBGRUPO: "bg-blue-200 text-blue-900 font-semibold text-sm",
  CUENTA:   "bg-white hover:bg-blue-50 text-gray-800 text-sm",
  SUBTOTAL: "bg-blue-100 text-blue-900 font-semibold text-sm",
  TOTAL:    "bg-blue-900 text-white font-bold text-sm uppercase",
};

function formatearMonto(valor) {
  if (valor === null || valor === undefined || isNaN(Number(valor))) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(Number(valor));
}

export default function TablaCuentas({ datos, periodos, onEditar, obtenerValor }) {
  return (
    <div className="overflow-x-auto rounded-xl shadow border border-gray-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200 sticky top-0">
            <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs w-24">
              Clave
            </th>
            <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs">
              Cuenta
            </th>
            {periodos.map((p) => (
              <th
                key={p}
                className="text-right px-4 py-3 font-semibold text-gray-500 uppercase text-xs whitespace-nowrap"
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, idx) => {
            const tipo = fila["Tipo"]?.trim().toUpperCase();
            const esCuenta = tipo === "CUENTA";
            const estilo = estilosPorTipo[tipo] ?? "bg-white text-gray-800 text-sm";

            return (
              <tr
                key={fila["Clave"] ?? idx}
                className={`border-b border-gray-100 transition-colors ${estilo}`}
              >
                <td className="px-4 py-2 font-mono text-xs opacity-60">
                  {fila["Clave"]}
                </td>
                <td className="px-4 py-2">
                  {fila["Cuenta / Descripción"]}
                </td>
                {periodos.map((p) => {
                  const valor = obtenerValor(fila, p);
                  return (
                    <td
                      key={p}
                      className={`px-4 py-2 text-right tabular-nums ${
                        valor < 0 ? "text-red-400" : ""
                      }`}
                    >
                     {esCuenta ? (
  <input
    type="text"
    value={formatearMonto(fila[p])}
    onFocus={(e) => {
      e.target.value = fila[p] ?? "";
      e.target.type = "number";
    }}
    onBlur={(e) => {
      onEditar(fila["Clave"], p, e.target.value);
      e.target.type = "text";
      e.target.value = formatearMonto(fila[p]);
    }}
    onChange={(e) =>
      onEditar(fila["Clave"], p, e.target.value)
    }
    className="w-28 text-right bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none tabular-nums"
  />
) : (
  formatearMonto(valor)
)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}