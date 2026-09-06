# Story and boss framework

This document establishes structure, not final canon. Character dialogue, cultural details and the three boss identities require a dedicated approval pass before production.

## Campaign structure

Each fighter receives a compact arcade route:

1. Personal inciting scene
2. Three standard matches with short pre/post dialogue
3. Designated rival match
4. Personal revelation or reversal
5. Boss I — the gatekeeper
6. Boss II — the human architect of the conflict
7. Boss III — the final transformation or supernatural threat
8. Character-specific ending and shared epilogue hook

Stages remain assigned to their home fighters: Saja/Titicaca, Benita/Prison, Mariachay/Machu Picchu, Asunta/Lima traffic light, Shabuka/Circus, Bella/Cumbia concert, Jarjacha/Mercado Central, and Coraima/Arequipa.

## Playable-fighter story seeds

These are prompts for the writers’ room, not locked biographies.

| Fighter | Core dramatic question | Route seed |
| --- | --- | --- |
| Saja | Is performance a mask, a weapon, or both? | A public scandal draws her into the tournament; she turns ridicule into control while deciding who deserves to see the person behind the persona. |
| Benita | Can strength protect without becoming domination? | Prison rumors connect the tournament to an old betrayal. Her route tests whether she seeks truth, revenge, or the safety of people who now depend on her. |
| Mariachay | What does speed conceal? | She races toward an answer tied to the highlands, only to discover that the shortest path would cost someone else their future. |
| Asunta | What does a fighter owe the family she carries? | The tournament threatens her household and turns care work into visible power; her choices define whether victory means escape or reform. |
| Shabuka | Who owns a performer’s image? | The ruined circus holds evidence of an exploitative past. Her spectacle becomes a challenge to the people who profited from it. |
| Bella | When does a voice become leadership? | A concert tour and the tournament converge. She must choose between a manufactured triumph and using her stage to expose the competition’s hidden sponsor. |
| Jarjacha | Is an unsettling reputation a curse or camouflage? | Market gossip makes her the first to notice a pattern others dismiss. Her apparently erratic path is the route that uncovers the conspiracy. |
| Coraima | What remains when confidence is tested publicly? | Celebrated as the balanced favorite, she faces evidence that her ascent was manipulated and must decide how to rebuild earned trust. |

## Boss slots

| Boss | Narrative role | Gameplay purpose | Constraint |
| --- | --- | --- | --- |
| Boss I | Gatekeeper | Tests fundamentals and mastery of defensive systems | Difficult but legible; no rule-breaking damage spikes |
| Boss II | Architect | Reveals who organized or exploited the tournament | Uses information/control mechanics and adapts to repeated habits |
| Boss III | Final threat | Resolves the shared mystery while personal endings stay distinct | Multi-phase spectacle; still obeys readable hit/hurtbox and counterplay rules |

Bosses are non-playable at launch. Their mechanics do not need to be balanced for mirror matches, but they must remain learnable and fair.

## Story data format

Dialogue should live outside game logic in versioned data with stable IDs:

- route, scene and line ID
- speaker and portrait expression
- localized text key
- stage/music cue
- entry condition and next scene
- accessibility notes for non-verbal/audio events

## Approval checklist

- Character motivation and ending are distinct.
- Indigenous and regional references are researched and reviewed in context.
- Humor targets power and situation, not identity or poverty.
- Baby/family-related attacks remain stylized and non-graphic.
- Story can be localized without editing combat code.
- Each boss has a readable silhouette, counterplay plan and narrative function.
