#!/usr/bin/env node
import { execSync } from 'node:child_process';

// Ambil pesan commit dari argumen terminal jika ada, atau gunakan default tanggal
const args = process.argv.slice(2);
const customMessage = args.join(' ').trim();
const now = new Date().toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});
const commitMessage = customMessage || `Update: ${now}`;

try {
  console.log('🔄 Memulai proses update otomatis ke GitHub...\n');

  console.log('1️⃣ Menambahkan semua file yang diubah (git add .)...');
  execSync('git add .', { stdio: 'inherit' });

  console.log(`\n2️⃣ Membuat commit: "${commitMessage}"...`);
  try {
    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
  } catch {
    console.log('ℹ️ Tidak ada perubahan file yang perlu di-commit.');
  }

  console.log('\n3️⃣ Mengirim perubahan ke repositori GitHub...');
  // Coba push ke branch saat ini
  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim() || 'main';
    console.log(`   Branch aktif: ${currentBranch}`);
    execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
  } catch {
    // Fallback jika rev-parse gagal
    try {
      execSync('git push origin main', { stdio: 'inherit' });
    } catch {
      execSync('git push origin master', { stdio: 'inherit' });
    }
  }

  console.log('\n✨ Berhasil! Perubahan telah terkirim ke GitHub.');
  console.log('🚀 Vercel akan secara otomatis mendeteksi dan memperbarui deploy aplikasi Anda.');
} catch (error) {
  console.error('\n❌ Terjadi kesalahan saat auto-push:', error.message);
  process.exit(1);
}
