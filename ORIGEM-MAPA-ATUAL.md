# Mapa atual — bases e reprodução

O mapa atual mantém a composição visual original em **SIRGAS 2000 / Brazil
Polyconic (EPSG:5880)**, mas sua malha de rodovias BR e ERS passou a usar o
cadastro vetorial oficial do Estado do Rio Grande do Sul.

## Fontes

- **Rodovias estaduais e federais:** camada `Sistema Viário` do DAER/RS,
  publicada na Infraestrutura Estadual de Dados Espaciais e identificada como
  base de abril de 2026.
- **Limites municipais:** malha municipal do IBGE de 2024 presente no mapa-base.
- **Hidrografia:** colaboradores do OpenStreetMap / Geofabrik, preservada do
  mapa-base após conferência visual dos cursos narrados na apresentação.

Serviço oficial usado para a malha viária:

`https://zee.rs.gov.br/server/rest/services/1_RSAGUAS/Mapa_basico_SIGRSAGUA/FeatureServer/32`

A extração local contém apenas `RODOVIAS ESTADUAIS`, `RODOVIAS FEDERAIS` e
`RODOVIAS ESTADUAIS COINCIDENTES`. Foram mantidas as classificações físicas do
DAER; trechos planejados, implantados ou em obras recebem diferenciação
tracejada no desenho.

## Atualização e geração

1. `tools/update_official_roads.py` baixa e valida a camada oficial, já projetada
   em EPSG:5880 e simplificada com tolerância de três metros.
2. `tools/remove_city_labels.py` remove a antiga malha OSM e seus rótulos,
   aplica a geometria oficial do DAER, preserva limites e hidrografia e gera o
   PNG, a prévia e as pirâmides de blocos WebP.
3. Os níveis de 16.000 e 32.000 pixels são renderizados diretamente do PDF
   vetorial. Eles não são ampliações do PNG de 8.000 pixels.

Revisão de dados adotada: **DAER/RS, abril de 2026**.
