using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Authorization;

namespace AydMES.Api.Security
{
    /// <summary>
    /// GET dışındaki (ekleme/güncelleme/silme) tüm action'lara "Duzenleyici" politikasını uygular.
    /// Böylece yeni bir yazma ucu eklendiğinde [Authorize] unutulsa bile Operatör gibi
    /// salt-okunur roller veri değiştiremez. Kendi [Authorize]/[AllowAnonymous] etiketi olanlara dokunulmaz.
    /// </summary>
    public class YazmaYetkisiKurali : IApplicationModelConvention
    {
        public const string Politika = "Duzenleyici";

        public void Apply(ApplicationModel application)
        {
            foreach (var controller in application.Controllers)
            {
                var controllerKendiYetkisi = controller.Attributes.Any(a => a is IAuthorizeData or IAllowAnonymous);

                foreach (var action in controller.Actions)
                {
                    if (controllerKendiYetkisi || action.Attributes.Any(a => a is IAuthorizeData or IAllowAnonymous))
                        continue;

                    var yazmaIslemi = action.Selectors
                        .SelectMany(s => s.EndpointMetadata.OfType<Microsoft.AspNetCore.Routing.HttpMethodMetadata>())
                        .SelectMany(m => m.HttpMethods)
                        .Any(m => !HttpMethods.IsGet(m) && !HttpMethods.IsHead(m));

                    if (yazmaIslemi)
                        action.Filters.Add(new AuthorizeFilter(Politika));
                }
            }
        }
    }
}
