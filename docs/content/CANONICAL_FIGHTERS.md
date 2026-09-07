# Canonical fighter definitions

Status: **M1 data baseline pending gameplay integration**

`src/content/fighters.ts` is the validated source for the eight canonical fighters.

| Fighter | Archetype | Stage | Theme | Height | Specials |
| --- | --- | --- | --- | ---: | --- |
| Saja | Whip | Titicaca | `SajaTheme.mp3` | 306 | Braid Lash; Saya Wave |
| Benita | Heavy | Prison | `BenitaTheme.mp3` | 312 | Beer Bath; Hidden Shot |
| Mariachay | Rush | Machu Picchu | `MariachayTheme.mp3` | 288 | Rolling Rush; Sky Slap |
| Asunta | Stretch | Lima traffic light | `AsuntaTheme.mp3` | 315 | Baby Shriek; Diaper Toss |
| Shabuka | Power | Circus | `ShabukaTheme.mp3` | 337 | Pom Power; Rising Cheer |
| Bella | Staff | Cumbia concert | `BellaTheme.mp3` | 321 | High Note; Mic Return |
| Jarjacha | Odd | Mercado Central | `JarjachaTheme.mp3` | 321 | Dizzy Hands; Sandal Return |
| Coraima | Balanced | Arequipa | `CoraimaTheme.mp3` | 318 | Flying Kiss; Tornado Heel |

Legacy speed and jump values use the 1,000-unit fixed scale; power and defense use integer permille. Health uses the production 1,000-point scale. Damage preserves prototype values, while explicit frame windows are the first M1 data pass and remain disconnected from legacy combat until integration review. Facing and attached shadows remain renderer responsibilities.
