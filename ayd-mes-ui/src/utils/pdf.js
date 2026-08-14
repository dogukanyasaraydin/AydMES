export function pdfRaporuOlustur({ baslik, altBaslik, veriler, sutunlar, kpiListesi = [], gosterBildirim }) {
  try {
    const tarihStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const aktifKullanici = localStorage.getItem('username') || 'Doğukan Aydın';
    const aktifRol = localStorage.getItem('role') || 'Yazılım Stajyeri';

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      if (gosterBildirim) gosterBildirim('Pop-up engelleyiciyi kaldırıp tekrar deneyiniz.', 'error');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>MES PLATFORM - ${baslik}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #2D3748;
            margin: 0;
            padding: 20px;
            background: #fff;
            -webkit-print-color-adjust: exact;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .brand-text strong {
            font-size: 20px;
            letter-spacing: 1px;
            color: #1A202C;
            display: block;
          }
          .brand-text small {
            font-size: 11px;
            color: #718096;
            letter-spacing: 1.5px;
            font-weight: 600;
          }
          .meta-info {
            text-align: right;
            font-size: 12px;
            color: #4A5568;
            line-height: 1.5;
          }
          .report-title {
            margin-bottom: 20px;
          }
          .report-title h1 {
            margin: 0 0 4px 0;
            font-size: 22px;
            color: #1A202C;
          }
          .report-title p {
            margin: 0;
            font-size: 13px;
            color: #718096;
          }
          .kpi-row {
            display: flex;
            gap: 15px;
            margin-bottom: 24px;
          }
          .kpi-box {
            flex: 1;
            padding: 12px 16px;
            background-color: #F7FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
          }
          .kpi-box span {
            font-size: 11px;
            color: #718096;
            text-transform: uppercase;
            font-weight: bold;
            display: block;
          }
          .kpi-box strong {
            font-size: 18px;
            color: #2D3748;
            margin-top: 4px;
            display: block;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 12px;
          }
          th {
            background-color: #EDF2F7;
            color: #2D3748;
            text-align: left;
            padding: 10px 12px;
            border-bottom: 2px solid #CBD5E0;
            font-weight: bold;
          }
          td {
            padding: 9px 12px;
            border-bottom: 1px solid #E2E8F0;
            color: #4A5568;
          }
          tr:nth-child(even) {
            background-color: #F7FAFC;
          }
          .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sig-box {
            width: 28%;
            border-top: 1px dashed #CBD5E0;
            padding-top: 10px;
            text-align: center;
            font-size: 12px;
          }
          .sig-box strong {
            display: block;
            margin-bottom: 4px;
            color: #2D3748;
          }
          .sig-box span {
            font-size: 11px;
            color: #A0AEC0;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #A0AEC0;
            border-top: 1px solid #EDF2F7;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-text">
            <strong>MES PLATFORM</strong>
            <small>ÜRETİM YÖNETİM SİSTEMİ</small>
          </div>
          <div class="meta-info">
            <div><strong>Rapor Tarihi:</strong> ${tarihStr}</div>
            <div><strong>Düzenleyen:</strong> ${aktifKullanici} (${aktifRol})</div>
            <div><strong>Doküman Kodu:</strong> FR-MES-${Math.floor(100000 + Math.random() * 900000)}</div>
          </div>
        </div>

        <div class="report-title">
          <h1>${baslik}</h1>
          <p>${altBaslik || 'Üretim Yönetim Sistemi Resmi Vardiya Rapor Dökümü'}</p>
        </div>

        ${kpiListesi.length > 0 ? `
          <div class="kpi-row">
            ${kpiListesi.map(kpi => `
              <div class="kpi-box">
                <span>${kpi.label}</span>
                <strong>${kpi.value}</strong>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <table>
          <thead>
            <tr>
              ${sutunlar.map(col => `<th>${col.header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${veriler.length === 0 ? `
              <tr><td colSpan="${sutunlar.length}" style="text-align:center; padding:20px; color:#A0AEC0;">Kayıt bulunamadı.</td></tr>
            ` : veriler.map(row => `
              <tr>
                ${sutunlar.map(col => `<td>${row[col.key] !== undefined ? row[col.key] : '-'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <strong>Hazırlayan</strong>
            <span>${aktifKullanici}</span>
          </div>
          <div class="sig-box">
            <strong>Vardiya Amiri Onayı</strong>
            <span>İmza / Onay Tarihi</span>
          </div>
          <div class="sig-box">
            <strong>Fabrika Müdürü</strong>
            <span>Ahmet Yılmaz</span>
          </div>
        </div>

        <div class="footer">
          Bu rapor MES Platform (Üretim Yönetim Sistemi) tarafından otomatik olarak oluşturulmuştur. © ${new Date().getFullYear()}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    if (gosterBildirim) {
      gosterBildirim('PDF Rapor dökümü hazırlandı! (Yazdır / PDF kaydet penceresi açıldı)', 'success');
    }
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    if (gosterBildirim) gosterBildirim('PDF oluşturulurken bir hata oluştu.', 'error');
  }
}
