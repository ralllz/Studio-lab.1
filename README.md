# Photobooth App

Proyek photobooth sederhana dengan fitur:

- Kelola template (tambah, tampilkan, hapus) disimpan ke tabel `Photobox` Supabase.
- Pemotretan menggunakan kamera web dan pilih template.
- Editor dasar menggunakan `react-konva` (layer: foto, template, stiker, teks).
- Download hasil akhir dengan pilihan resolusi.

Instal dan jalankan:

```bash
npm install
npm run dev
```

Catatan penting:
- File ini menggunakan Supabase anon key dan URL yang kamu berikan di `src/lib/supabase.js`.
- Pastikan tabel `Photobox` ada di Supabase dengan kolom minimal: `id` (serial/uuid), `name` (text), `frames` (int), `template_data` (text), `thumbnail` (text), `created_at` (timestamp with time zone default now()).
- Jika menggunakan bucket storage, sesuaikan implementasi untuk upload file ke storage.
