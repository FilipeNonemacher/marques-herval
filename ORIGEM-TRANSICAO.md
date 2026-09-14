# Fundo da transição entre mapas

Os dois mapas são os arquivos originais do projeto, apresentados lado a lado sem redesenhar seu conteúdo. O recorte é uma composição editorial de trechos da mesma região, não uma sobreposição georreferenciada.

Para reduzir o processamento durante a animação, a composição estática foi exportada em `public/assets/transicao-mapas.jpg` (1920 × 1280 pixels). Após os cinco segundos da ampulheta, uma passagem de 1,3 segundo anima somente esse fundo leve, uma faixa abstrata de luz e a opacidade da tela. As imagens dos mapas interativos continuam na resolução original; não recebem desfoque nem animação de deslocamento na passagem entre telas. Com redução de movimento ativada, a revelação é uma dissolução de 300 ms, sem varredura lateral.

Somente a textura de papel rasgado foi produzida pelo gerador integrado de imagens (imagegen), em uma única geração, sem edição posterior do PNG. A transparência original foi preservada. O desenho da ampulheta e a contagem de cinco segundos foram mantidos.

## Arquivo final

[Textura de papel rasgado](public/assets/transicao-papel-rasgado.png) — PNG, 1536 × 1024 pixels.

Caminho nesta estação: `C:\Users\SisTEx\Documents\Codex\2026-09-02\cha\work\expedicao-site\public\assets\transicao-papel-rasgado.png`.

## Prompt utilizado

```text
Use case: product-mockup
Asset type: a single landscape PNG paper texture with genuine transparent alpha for a website transition mask and narrow exposed torn edge.
Primary request: create exactly ONE 1536x1024 image, top-down flat scan of a single flat opaque warm ivory paper sheet filling the LEFT approximately 50% of the entire canvas. The paper continues all the way to and beyond the canvas's left, top, and bottom borders: no visible top, bottom, or left paper perimeter and no padding there. Its one visible RIGHT edge runs vertically near the canvas center, uninterrupted from the top border to the bottom border, organically hand-torn with subtle irregular lateral changes confined between x=47% and x=53% of canvas width. To the right of this edge is genuine fully transparent alpha, continuing all the way to the right canvas border. All sheet body on the left is fully opaque, unbroken, with no holes.
Style/medium: photorealistic flat archival scan, minimal elegant high-end editorial paper material.
Materials/textures: nearly plain warm ivory paper body with extremely fine believable paper grain; natural tiny fibers and a slim layered offwhite ripped edge; subtle deckled hand-tear with restrained organic variation.
Composition/framing: landscape 1536x1024 pixels; paper left, transparent area right; straight-on top-down view with no perspective, curl, fold, or depth. The vertical torn edge touches both top and bottom image borders.
Lighting: flat even neutral scan lighting, no cast shadow and no backdrop.
Constraints: true alpha transparency outside the sheet, no rendered checkerboard, no opaque background anywhere to the right of the paper edge. No maps, text, logos, graphics, watermarks, holes, rounded perimeter, margins, cropped-off top or bottom gaps, extra objects, backdrop or background shadow. No dramatic jagged spikes or mountain-like silhouette. Deliver only one PNG asset.
```
