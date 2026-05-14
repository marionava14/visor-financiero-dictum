using Microsoft.AspNetCore.Mvc;
using CuentasApi.Services;

namespace CuentasApi.Controllers;

[ApiController]
[Route("api/cuentas")]
public class CuentasController : ControllerBase
{
    private readonly CuentasService _service;

    public CuentasController(CuentasService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var cuentas = await _service.GetAllAsync();
            return Ok(cuentas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al obtener las cuentas: {ex.Message}");
        }
    }
}