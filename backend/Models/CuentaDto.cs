namespace CuentasApi.Models;

public class CuentaDto
{
    public string Clave { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public Dictionary<string, decimal> Periodos { get; set; } = new();
}