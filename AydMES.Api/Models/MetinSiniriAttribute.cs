using System.ComponentModel.DataAnnotations;

namespace AydMES.Api.Models
{
    /// <summary>
    /// API'ye gelen metin alanları için en fazla uzunluk doğrulaması.
    /// [StringLength]'ten farklı olarak EF Core bunu görmez, yani veritabanı kolon tiplerini değiştirmez.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public sealed class MetinSiniriAttribute : ValidationAttribute
    {
        public int EnFazla { get; }

        public MetinSiniriAttribute(int enFazla) : base("{0} en fazla {1} karakter olabilir.")
        {
            EnFazla = enFazla;
        }

        public override bool IsValid(object? value) => value is not string s || s.Length <= EnFazla;

        public override string FormatErrorMessage(string name) => string.Format(ErrorMessageString, name, EnFazla);
    }
}
