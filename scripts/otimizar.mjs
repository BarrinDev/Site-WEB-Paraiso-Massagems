// 1) Converte fotos de ./imagens em WebP (640, 1280, 1920) dentro de ./imagens/otimizadas.
//    O flyer é só referência de identidade e NÃO vai pro site, então fica de fora.
// 2) Gera ./imagens/og.jpg (1200x630) desenhado a partir da identidade (lótus + nome),
//    para a prévia do link no WhatsApp.
// Uso: npm install → npm run otimizar
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join, parse } from 'node:path';

const PASTA = 'imagens';
const SAIDA = join(PASTA, 'otimizadas');
const LARGURAS = [640, 1280, 1920];
const IGNORAR = new Set(['flyer', 'og']);
const nomeLimpo = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

await mkdir(SAIDA, { recursive: true });

for (const f of await readdir(PASTA, { withFileTypes: true })) {
  if (!f.isFile() || !/\.(jpe?g|png|webp|avif|tiff?)$/i.test(f.name)) continue;
  const nome = nomeLimpo(parse(f.name).name);
  if (IGNORAR.has(nome)) continue;
  for (const w of LARGURAS) {
    await sharp(join(PASTA, f.name)).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 80 }).toFile(join(SAIDA, `${nome}-${w}.webp`));
  }
  console.log(`${f.name} → ${nome}-{${LARGURAS.join(',')}}.webp`);
}

const petala = 'M0 0C-17-28-12-68 0-92 12-68 17-28 0 0Z';
const angulos = [-76, -50, -24, 0, 24, 50, 76];
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#f6e9e4"/>
  <circle cx="900" cy="315" r="250" fill="#efd8cd"/>
  <g transform="translate(900 380) scale(2.3)" fill="none" stroke="#6e2a2c" stroke-width="1.3" stroke-linejoin="round">
    ${angulos.map((a) => `<path d="${petala}" transform="rotate(${a})"/>`).join('')}
    <path d="M-60 4C-30 16 30 16 60 4"/>
  </g>
  <text x="90" y="270" font-family="Georgia, serif" font-style="italic" font-size="110" fill="#6e2a2c">Paraíso</text>
  <text x="96" y="330" font-family="Georgia, serif" font-size="40" fill="#4a1c1f">das massagens</text>
  <text x="96" y="430" font-family="Georgia, serif" font-size="30" fill="#6b4a45">Massagem relaxante e drenagem linfática</text>
  <text x="96" y="472" font-family="Georgia, serif" font-size="30" fill="#6b4a45">em Brasília · @rf_massagem</text>
</svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 88 }).toFile(join(PASTA, 'og.jpg'));
console.log('og.jpg gerado a partir da identidade');
