export const excelIndir = (data, dosyaAdi, gosterBildirim) => {
  if (!data || data.length === 0) {
    if (gosterBildirim) gosterBildirim("Dışa aktarılacak veri bulunamadı!", "warning");
    return;
  }
  
  const basliklar = Object.keys(data[0]);
  const csvIcerik = [
    basliklar.join(";"),
    ...data.map(row => 
      basliklar.map(b => `"${String(row[b] !== null && row[b] !== undefined ? row[b] : '').replace(/"/g, '""')}"`).join(";")
    )
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvIcerik], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${dosyaAdi}_Raporu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (gosterBildirim) gosterBildirim(`${dosyaAdi} başarıyla Excel'e aktarıldı!`, "success");
};
