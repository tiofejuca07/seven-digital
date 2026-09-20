# Seven Digital — site (HTML + CSS + JS puro)

Sem framework, sem build, sem dependências. É só publicar a pasta inteira.

## Estrutura
```
index.html              página única (seções comentadas como "COMPONENTE · …")
css/tokens.css          paleta, tipografia, espaçamentos (edite cores aqui)
css/base.css            reset, acessibilidade, reveal, movimento reduzido
css/components.css      header, menu mobile, botões, chips, WhatsApp flutuante
css/sections.css        estilos de cada seção + breakpoints (mobile first)
js/main.js              menu, animações de scroll, filtro, timeline, partículas
assets/img/             logos (header/footer), favicons, imagem de compartilhamento, mockups (SVG)
_backup/                index.html ORIGINAL do site anterior, intocado (não precisa ir ao servidor)
robots.txt · sitemap.xml
```

## Publicar
Envie todo o conteúdo desta pasta para a raiz do domínio (GitHub Pages, Netlify, Vercel, hospedagem comum).
Os caminhos são relativos: funciona na raiz do domínio e também em subpasta.

## Pontos de edição rápidos
- **Número do WhatsApp**: buscar e substituir `5511914425820` no `index.html` (19 links).
- **Google Forms**: buscar e substituir `https://forms.gle/KtNwPCZXfM6QrTa49` (4 links).
- **Preços e características dos planos**: seção `#planos` no `index.html`.
- **Links do portfólio**: cada card em `#portfolio` (atributo `href` do botão "Ver projeto").
- **Logo**: versão vetorial limpa da marca atual (barra inclinada + "7", wordmark convertido em curvas, sem depender de fonte):
  `assets/img/logo-header.svg` (horizontal), `assets/img/logo-footer.svg` (empilhada), `assets/img/logo-mark.svg` (símbolo),
  `assets/img/favicon.svg` / `favicon-32.png` / `apple-touch-icon.png` e `og-image.png` (1200×630).
  Para usar o arquivo oficial da logo, basta substituir esses arquivos mantendo os nomes.
- **Fontes**: Sora + DM Sans via Google Fonts (com fallback de sistema). Para hospedar localmente, baixe os .woff2 e use `@font-face`.

## Animações
CSS + SVG + JavaScript leve (~14 KB), sem Lottie e sem GIFs: cada efeito (mockups que rolam, cards flutuantes, timeline, marquee,
partículas em canvas, parallax) roda com CSS/SVG, o que é mais leve e nítido que uma biblioteca ou GIF.

## Acessibilidade e performance
Navegação por teclado, foco visível, link "pular para o conteúdo", `aria-*` no menu, `prefers-reduced-motion` respeitado
(animações, partículas e parallax são desligados). Sem bibliotecas; mockups em SVG; imagens abaixo da dobra com `loading="lazy"`.
