document.addEventListener("DOMContentLoaded", function () {
  aktifkanInputOtomatis();
  hitungTotal();
});

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(angka);
}

function formatAngkaDenganTitik(angka) {
  return String(angka).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function bersihkanAngka(value) {
  return Number(String(value).replace(/\./g, "").replace(/\D/g, "")) || 0;
}

function rapikanLink(link) {
  const value = String(link).trim();

  if (value === "") {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return "https://" + value;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function hitungTotal() {
  const rows = document.querySelectorAll("#tabelBarang tbody tr");
  const totalEl = document.getElementById("totalKeseluruhan");

  let totalKeseluruhan = 0;

  rows.forEach(function (row, index) {
    const nomor = row.querySelector(".nomor");
    const unitInput = row.querySelector(".unit");
    const hargaInput = row.querySelector(".harga");
    const totalHargaCell = row.querySelector(".totalHarga");
    const linkInput = row.querySelector(".linkProduk");
    const cekLink = row.querySelector(".cekLink");

    if (!nomor || !unitInput || !hargaInput || !totalHargaCell) return;

    nomor.textContent = index + 1;

    const unit = Number(unitInput.value) || 0;
    const harga = bersihkanAngka(hargaInput.value);
    const totalHarga = unit * harga;

    totalHargaCell.textContent = formatRupiah(totalHarga);
    totalKeseluruhan += totalHarga;

    if (linkInput && cekLink) {
      const link = rapikanLink(linkInput.value);

      if (link) {
        cekLink.href = link;
        cekLink.style.pointerEvents = "auto";
        cekLink.style.opacity = "1";
      } else {
        cekLink.href = "#";
        cekLink.style.pointerEvents = "none";
        cekLink.style.opacity = "0.4";
      }
    }
  });

  if (totalEl) {
    totalEl.textContent = formatRupiah(totalKeseluruhan);
  }
}

function formatInputHarga(input) {
  let value = input.value.replace(/\D/g, "");

  // Hapus angka 0 di depan agar tidak jadi 01.231
  value = value.replace(/^0+/, "");

  if (value === "") {
    input.value = "0";
  } else {
    input.value = formatAngkaDenganTitik(value);
  }

  hitungTotal();
}

function tambahBaris() {
  const tbody = document.querySelector("#tabelBarang tbody");

  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="nomor"></td>

    <td>
      <input type="text" class="nama" placeholder="Nama barang" />
    </td>

    <td>
      <input type="number" class="unit" value="1" min="0" />
    </td>

    <td>
      <input type="text" class="harga" value="0" />
    </td>

    <td class="totalHarga">Rp 0</td>

    <td>
      <input
        type="url"
        class="linkProduk"
        placeholder="https://tokopedia.com/..."
      />
      <a href="#" class="btn-link cekLink" target="_blank">
        Cek
      </a>
    </td>

    <td class="kolom-aksi">
      <button class="btn btn-delete" onclick="hapusBaris(this)">
        Hapus
      </button>
    </td>
  `;

  tbody.appendChild(row);
  aktifkanInputOtomatis();
  hitungTotal();
}

function hapusBaris(button) {
  const tbody = document.querySelector("#tabelBarang tbody");
  const rows = tbody.querySelectorAll("tr");

  if (rows.length === 1) {
    alert("Minimal harus ada 1 baris.");
    return;
  }

  button.closest("tr").remove();
  hitungTotal();
}

function resetTabel() {
  const tbody = document.querySelector("#tabelBarang tbody");

  tbody.innerHTML = `
    <tr>
      <td class="nomor">1</td>

      <td>
        <input type="text" class="nama" placeholder="Contoh: Kaos" />
      </td>

      <td>
        <input type="number" class="unit" value="1" min="0" />
      </td>

      <td>
        <input type="text" class="harga" value="0" />
      </td>

      <td class="totalHarga">Rp 0</td>

      <td>
        <input
          type="url"
          class="linkProduk"
          placeholder="https://tokopedia.com/..."
        />
        <a href="#" class="btn-link cekLink" target="_blank">
          Cek
        </a>
      </td>

      <td class="kolom-aksi">
        <button class="btn btn-delete" onclick="hapusBaris(this)">
          Hapus
        </button>
      </td>
    </tr>
  `;

  aktifkanInputOtomatis();
  hitungTotal();
}

function aktifkanInputOtomatis() {
  document.querySelectorAll(".unit").forEach(function (input) {
    input.oninput = hitungTotal;
  });

  document.querySelectorAll(".harga").forEach(function (input) {
    input.onfocus = function () {
      if (input.value === "0") {
        input.value = "";
      }
    };

    input.onblur = function () {
      if (input.value.trim() === "") {
        input.value = "0";
      }

      formatInputHarga(input);
    };

    input.oninput = function () {
      formatInputHarga(input);
    };
  });

  document.querySelectorAll(".linkProduk").forEach(function (input) {
    input.oninput = hitungTotal;
  });
}

function ambilDataTabel() {
  const rows = document.querySelectorAll("#tabelBarang tbody tr");
  const data = [];

  rows.forEach(function (row, index) {
    const nama = row.querySelector(".nama")?.value || "-";
    const unit = Number(row.querySelector(".unit")?.value) || 0;
    const hargaText = row.querySelector(".harga")?.value || "0";
    const linkText = row.querySelector(".linkProduk")?.value || "-";

    const harga = bersihkanAngka(hargaText);
    const totalHarga = unit * harga;

    data.push({
      No: index + 1,
      Nama: nama,
      Unit: unit,
      Harga: formatAngkaDenganTitik(harga),
      "Total Harga": formatAngkaDenganTitik(totalHarga),
      "Link Produk": linkText
    });
  });

  return data;
}

function exportExcel() {
  if (typeof XLSX === "undefined") {
    alert("Library Excel belum terbaca. Pastikan CDN XLSX sudah dipasang.");
    return;
  }

  const data = ambilDataTabel();

  if (data.length === 0) {
    alert("Data masih kosong.");
    return;
  }

  const totalKeseluruhan = data.reduce(function (total, item) {
    return total + bersihkanAngka(item["Total Harga"]);
  }, 0);

  data.push({
    No: "",
    Nama: "",
    Unit: "",
    Harga: "Total Keseluruhan",
    "Total Harga": formatAngkaDenganTitik(totalKeseluruhan),
    "Link Produk": ""
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 28 },
    { wch: 10 },
    { wch: 20 },
    { wch: 22 },
    { wch: 55 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Tabel Harga");
  XLSX.writeFile(workbook, "tabel-harga.xlsx");
}

function importExcel(event) {
  if (typeof XLSX === "undefined") {
    alert("Library Excel belum terbaca. Pastikan CDN XLSX sudah dipasang.");
    return;
  }

  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);

    const workbook = XLSX.read(data, {
      type: "array"
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: ""
    });

    if (rows.length === 0) {
      alert("File Excel kosong atau format tidak sesuai.");
      return;
    }

    isiTabelDariExcel(rows);

    event.target.value = "";
  };

  reader.readAsArrayBuffer(file);
}

function isiTabelDariExcel(rows) {
  const tbody = document.querySelector("#tabelBarang tbody");

  tbody.innerHTML = "";

  rows.forEach(function (item, index) {
    const nama =
      item.Nama ||
      item.nama ||
      item["Nama Barang"] ||
      item["nama barang"] ||
      "";

    const unit =
      item.Unit ||
      item.unit ||
      item.Jumlah ||
      item.jumlah ||
      1;

    const harga =
      item.Harga ||
      item.harga ||
      item["Harga Satuan"] ||
      item["harga satuan"] ||
      0;

    const link =
      item["Link Produk"] ||
      item["link produk"] ||
      item.Link ||
      item.link ||
      item.URL ||
      item.url ||
      "";

    const hargaBersih = bersihkanAngka(String(harga));

    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="nomor">${index + 1}</td>

      <td>
        <input
          type="text"
          class="nama"
          value="${escapeHTML(nama)}"
          placeholder="Nama barang"
        />
      </td>

      <td>
        <input
          type="number"
          class="unit"
          value="${escapeHTML(unit)}"
          min="0"
        />
      </td>

      <td>
        <input
          type="text"
          class="harga"
          value="${formatAngkaDenganTitik(hargaBersih)}"
        />
      </td>

      <td class="totalHarga">Rp 0</td>

      <td>
        <input
          type="url"
          class="linkProduk"
          value="${escapeHTML(link)}"
          placeholder="https://tokopedia.com/..."
        />
        <a href="#" class="btn-link cekLink" target="_blank">
          Cek
        </a>
      </td>

      <td class="kolom-aksi">
        <button class="btn btn-delete" onclick="hapusBaris(this)">
          Hapus
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  aktifkanInputOtomatis();
  hitungTotal();
}

function exportPDF() {
  if (typeof html2pdf === "undefined") {
    alert("Library PDF belum terbaca. Pastikan CDN html2pdf sudah dipasang.");
    return;
  }

  hitungTotal();

  const data = ambilDataTabel();

  if (data.length === 0) {
    alert("Data masih kosong.");
    return;
  }

  const totalKeseluruhan = data.reduce(function (total, item) {
    return total + bersihkanAngka(item["Total Harga"]);
  }, 0);

  const tanggal = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  let rowsHTML = "";

  data.forEach(function (item) {
    const linkProduk =
      item["Link Produk"] && item["Link Produk"] !== "-"
        ? item["Link Produk"]
        : "-";

    rowsHTML += `
      <tr>
        <td>${item.No}</td>
        <td>${escapeHTML(item.Nama)}</td>
        <td>${item.Unit}</td>
        <td>Rp ${item.Harga}</td>
        <td>Rp ${item["Total Harga"]}</td>
        <td>${escapeHTML(linkProduk)}</td>
      </tr>
    `;
  });

  const pdfArea = document.createElement("div");

  pdfArea.innerHTML = `
    <style>
      .pdf-wrapper {
        width: 100%;
        background: #ffffff;
        color: #111111;
        font-family: Arial, sans-serif;
        padding: 10px;
      }

      .pdf-header {
        margin-bottom: 16px;
      }

      .pdf-header h1 {
        margin: 0;
        font-size: 28px;
        line-height: 1.2;
      }

      .pdf-header p {
        margin: 6px 0 0;
        font-size: 12px;
        color: #555555;
      }

      .pdf-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 10px;
      }

      .pdf-table th {
        background: #111111;
        color: #ffffff;
        border: 1px solid #111111;
        padding: 8px;
        text-align: left;
      }

      .pdf-table td {
        border: 1px solid #dddddd;
        padding: 8px;
        vertical-align: top;
        word-break: break-word;
      }

      .pdf-table th:nth-child(1),
      .pdf-table td:nth-child(1) {
        width: 5%;
        text-align: center;
      }

      .pdf-table th:nth-child(2),
      .pdf-table td:nth-child(2) {
        width: 27%;
      }

      .pdf-table th:nth-child(3),
      .pdf-table td:nth-child(3) {
        width: 8%;
        text-align: center;
      }

      .pdf-table th:nth-child(4),
      .pdf-table td:nth-child(4) {
        width: 14%;
      }

      .pdf-table th:nth-child(5),
      .pdf-table td:nth-child(5) {
        width: 16%;
        font-weight: bold;
      }

      .pdf-table th:nth-child(6),
      .pdf-table td:nth-child(6) {
        width: 30%;
        font-size: 9px;
        color: #1d4ed8;
      }

      .pdf-summary {
        margin-top: 16px;
        padding: 14px;
        background: #111111;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        font-weight: bold;
      }
    </style>

    <div class="pdf-wrapper">
      <div class="pdf-header">
        <h1>Tabel Harga</h1>
        <p>Dicetak pada: ${tanggal}</p>
      </div>

      <table class="pdf-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Unit</th>
            <th>Harga</th>
            <th>Total Harga</th>
            <th>Link Produk</th>
          </tr>
        </thead>

        <tbody>
          ${rowsHTML}
        </tbody>
      </table>

      <div class="pdf-summary">
        <span>Total Keseluruhan</span>
        <span>Rp ${formatAngkaDenganTitik(totalKeseluruhan)}</span>
      </div>
    </div>
  `;

  const options = {
    margin: 10,
    filename: "tabel-harga.pdf",
    image: {
      type: "jpeg",
      quality: 0.98
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "landscape"
    },
    pagebreak: {
      mode: ["css", "legacy"]
    }
  };

  html2pdf().set(options).from(pdfArea).save();
}