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

function hitungTotal() {
  const rows = document.querySelectorAll("#tabelBarang tbody tr");
  const totalEl = document.getElementById("totalKeseluruhan");

  let totalKeseluruhan = 0;

  rows.forEach(function (row, index) {
    const nomor = row.querySelector(".nomor");
    const unitInput = row.querySelector(".unit");
    const hargaInput = row.querySelector(".harga");
    const totalHargaCell = row.querySelector(".totalHarga");

    if (!nomor || !unitInput || !hargaInput || !totalHargaCell) return;

    nomor.textContent = index + 1;

    const unit = Number(unitInput.value) || 0;
    const harga = bersihkanAngka(hargaInput.value);
    const totalHarga = unit * harga;

    totalHargaCell.textContent = formatRupiah(totalHarga);
    totalKeseluruhan += totalHarga;
  });

  if (totalEl) {
    totalEl.textContent = formatRupiah(totalKeseluruhan);
  }
}

function formatInputHarga(input) {
  let value = input.value.replace(/\D/g, "");

  input.value = value === "" ? "0" : formatAngkaDenganTitik(value);

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
    input.oninput = function () {
      formatInputHarga(input);
    };
  });
}

function ambilDataTabel() {
  const rows = document.querySelectorAll("#tabelBarang tbody tr");
  const data = [];

  rows.forEach(function (row, index) {
    const nama = row.querySelector(".nama")?.value || "-";
    const unit = Number(row.querySelector(".unit")?.value) || 0;
    const hargaText = row.querySelector(".harga")?.value || "0";
    const harga = bersihkanAngka(hargaText);
    const totalHarga = unit * harga;

    data.push({
      No: index + 1,
      Nama: nama,
      Unit: unit,
      Harga: formatAngkaDenganTitik(harga),
      "Total Harga": formatAngkaDenganTitik(totalHarga)
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
    "Total Harga": formatAngkaDenganTitik(totalKeseluruhan)
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 10 },
    { wch: 18 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Tabel Harga");
  XLSX.writeFile(workbook, "tabel-harga.xlsx");
}

function exportPDF() {
  if (typeof html2pdf === "undefined") {
    alert("Library PDF belum terbaca. Pastikan CDN html2pdf sudah dipasang.");
    return;
  }

  hitungTotal();

  const element = document.querySelector(".card");
  const aksiButtons = document.querySelectorAll(".btn-delete");
  const actionArea = document.querySelector(".actions");

  if (!element) {
    alert("Area PDF tidak ditemukan.");
    return;
  }

  aksiButtons.forEach(function (button) {
    button.style.display = "none";
  });

  if (actionArea) {
    actionArea.style.display = "none";
  }

  const options = {
    margin: 10,
    filename: "tabel-harga.pdf",
    image: {
      type: "jpeg",
      quality: 0.98
    },
    html2canvas: {
      scale: 2
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "landscape"
    }
  };

  html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(function () {
      aksiButtons.forEach(function (button) {
        button.style.display = "";
      });

      if (actionArea) {
        actionArea.style.display = "";
      }
    });
}