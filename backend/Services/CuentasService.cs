using Microsoft.Data.SqlClient;
using CuentasApi.Models;

namespace CuentasApi.Services;

public class CuentasService
{
    private readonly string _connectionString;

    public CuentasService(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<List<CuentaDto>> GetAllAsync()
    {
        var cuentas = new Dictionary<string, CuentaDto>();
        var orden = new List<string>();

        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        var query = @"
            SELECT c.Clave, c.Descripcion, c.Tipo, c.Orden,
                   v.Periodo, v.Monto
            FROM Cuentas c
            LEFT JOIN CuentaValores v ON c.Clave = v.Clave
            ORDER BY c.Orden";

        using var cmd = new SqlCommand(query, conn);
        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var clave = reader.GetString(0);

            if (!cuentas.ContainsKey(clave))
            {
                cuentas[clave] = new CuentaDto
                {
                    Clave = clave,
                    Descripcion = reader.GetString(1),
                    Tipo = reader.GetString(2)
                };
                orden.Add(clave);
            }

            if (!reader.IsDBNull(4))
            {
                var periodo = reader.GetString(4);
                var monto = reader.GetDecimal(5);
                cuentas[clave].Periodos[periodo] = monto;
            }
        }

        return orden.Select(c => cuentas[c]).ToList();
    }
}