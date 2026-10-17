# Personagens Infantis (5-12 anos)

Ao criar personagens infantis, aplique os ajustes anatômicos abaixo. Eles são **obrigatórios**: sem eles o modelo tende a renderizar "adultos em miniatura", que caem no uncanny valley.

## Ajustes anatômicos

| Atributo | Ajuste para criança |
|---|---|
| **Proporção da cabeça** | Relativamente maior em relação ao corpo (1:5 a 1:6, vs 1:7.5 no adulto) |
| **Testa** | Mais alta e proeminente |
| **Olhos** | Proporcionalmente maiores, íris mais visível |
| **Queixo** | Mais curto e arredondado |
| **Nariz** | Menor, ponte mais baixa |
| **Pele** | Mais lisa, menos textura de poros, mais subsurface scattering (translucência) |
| **Bochechas** | Mais cheias e arredondadas |
| **Expressão** | Mais aberta e espontânea; evitar poses adultas |

Dentro da faixa, gradue: aos 5-7 anos as proporções acima são mais acentuadas (cabeça ~1:5, dentes de leite); aos 10-12 o rosto começa a alongar, a ponte nasal sobe e a cabeça tende a 1:6.5.

## Injection obrigatória (entra no bloco de identidade do template)

```
child-appropriate proportions: larger head-to-body ratio (1:5.5), prominent forehead,
proportionally larger eyes with more visible iris, shorter rounded chin, smaller nose
with lower bridge, smoother skin with more subsurface translucency, fuller rounded cheeks,
natural spontaneous expression, age-appropriate clothing and context
```

## Negative Injection adicional (anexar à negative da direção escolhida)

```
adult proportions, mature features, adult pose, sexualized, provocative,
adult facial structure, heavy makeup, adult clothing style, uncanny valley
```

## Regras de contexto

- Cenário e vestuário sempre apropriados à idade: escola, parque, casa, esporte infantil, família.
- Expressão espontânea: riso aberto, curiosidade, concentração em brincadeira. Nunca olhar "sedutor" ou pose de moda adulta.
- Direção cinematográfica preferencial: **C** (institucional) ou **D** (social/educação). A direção **A** só com vestuário e pose infantis explícitos.
- Se o pedido do usuário envolver qualquer elemento que sexualize ou adultize a criança, recuse a parte problemática e proponha a versão apropriada.
