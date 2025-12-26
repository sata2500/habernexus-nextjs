// Commitlint Configuration
// Ensures commit messages follow Conventional Commits standard
// https://www.conventionalcommits.org/

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Yeni özellik
        'fix',      // Hata düzeltmesi
        'docs',     // Dokümantasyon
        'style',    // Kod formatı (boşluk, noktalama vb.)
        'refactor', // Kod iyileştirmesi
        'perf',     // Performans iyileştirmesi
        'test',     // Test ekleme/düzeltme
        'build',    // Build sistemi değişiklikleri
        'ci',       // CI konfigürasyonu
        'chore',    // Genel bakım
        'revert',   // Geri alma
      ],
    ],
    'subject-case': [0], // Türkçe karakterler için devre dışı
    'body-max-line-length': [0], // Uzun açıklamalar için devre dışı
  },
};
