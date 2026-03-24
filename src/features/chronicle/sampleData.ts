/**
 * Sample chronicle answers for testing and demo purposes.
 * Character: Alex Morgan — born and raised in northside Brisbane.
 *
 * Keys follow the convention `${chapterId}_${questionId}` matching
 * the IDs defined in the chapters configuration.
 */

export function getSampleAnswers(): Record<string, { value: string }> {
  return {
    // ─── Chapter 1: Birth ───────────────────────────────────────────
    'birth_birth-name': {
      value: 'Alexander James Morgan',
    },
    'birth_birth-date': {
      value: '1985-03-15',
    },
    'birth_birth-location': {
      value: 'Royal Brisbane Hospital — Mum always said the air conditioning was broken that day and the ward felt like a sauna. March in Brisbane, forty degrees and thick humidity.',
    },
    'birth_birth-weight': {
      value: '3.6 kg — apparently a solid starting loadout',
    },
    'birth_birth-parents': {
      value: 'David Morgan (Dad) and Karen Morgan, née Sullivan (Mum). Dad was a chippie — spent thirty years building houses around the northside. Mum was a nurse at The Prince Charles Hospital, worked in the cardiac ward.',
    },
    'birth_birth-story': {
      value: 'Mum reckons I took my sweet time. Dad drove the old Kingswood from Sandgate in the dark, windows down because the car had no aircon either. He said the whole drive smelt of frangipani and cut grass from the neighbours who had been mowing that evening. I was born right as the kookaburras started up outside the hospital window.',
    },
    'birth_birth-siblings': {
      value: 'One older sister, Rebecca (Bec). Born in 1982. She was three when I arrived and reportedly not impressed about sharing her Vegemite toast at breakfast.',
    },

    // ─── Chapter 2: Early Years (0–5) ──────────────────────────────
    'early-years_early-first-memory': {
      value: 'Sitting on the cool lino floor in the kitchen, pressing my hands flat against it because it felt cold and smooth on a stinking hot day. Mum was making pikelets and the whole house smelt of butter and vanilla. I remember the sticky texture of golden syrup on my fingers.',
    },
    'early-years_early-home': {
      value: 'A fibro house on Yundah Street in Sandgate, two blocks from the waterfront. The stumps were always a bit wonky and the floors creaked. You could smell the salt off Moreton Bay from the back steps, mixed with the rust from the old Hills Hoist.',
    },
    'early-years_early-favourite-toy': {
      value: 'A battered Tonka dump truck, bright yellow with scratched-up paint. I used to fill it with sand from the backyard and tip it out on the concrete path.',
    },
    'early-years_early-pet': {
      value: 'Rusty — a golden retriever with fur that always smelt like warm dirt and salt water. We got him from a family in Bracken Ridge when I was about two. He used to lie on the cool tiles under the house in summer and groan when you tried to move him.',
    },
    'early-years_early-food': {
      value: 'Mum\'s golden syrup dumplings. Heavy, sticky, sweet — the kind of dessert that sits in your stomach like a warm brick.',
    },
    'early-years_early-personality': {
      value: 'Quiet but stubborn, apparently. Mum said I\'d watch everything before joining in, but once I decided to do something there was no talking me out of it. Dad said I was "an observer" which was his polite way of saying I stared at people too long.',
    },

    // ─── Chapter 3: Primary School ─────────────────────────────────
    'primary-school_primary-school-name': {
      value: 'St Patrick\'s Primary School, Shorncliffe. Walked there most days — about fifteen minutes through the back streets, past the Shorncliffe train station.',
    },
    'primary-school_primary-best-friend': {
      value: 'Danny Nguyen. His family ran the bakery on Loudon Street. We used to get Vietnamese rolls after school — the bread was always warm and the pork crackled between your teeth. Danny and I were inseparable from Year 3 through to Year 7.',
    },
    'primary-school_primary-favourite-subject': {
      value: 'Science — Mr Callahan in Year 6 let us do proper experiments with bottle rockets on the oval.',
    },
    'primary-school_primary-teacher': {
      value: 'Mr Callahan, Year 6. He had a beard that smelt like coffee and he let us do proper experiments instead of just reading from textbooks. He built bottle rockets with us on the oval and the whole class stank of vinegar and bicarb soda for weeks.',
    },
    'primary-school_primary-achievement': {
      value: 'Won the cross-country in Year 5. The course went around the school oval and down through the park near the waterfront. I remember the taste of salt and the burning in my lungs and the weight of the ribbon they put around my neck.',
    },
    'primary-school_primary-hobby': {
      value: 'Rugby league. Played halfback for the Sandgate Hawks from Under 8s through to Under 12s. Tuesday and Thursday training at Cribb Park — the grass was always patchy and hard in the dry season.',
    },

    // ─── Chapter 4: Teens ──────────────────────────────────────────
    'teens_teens-high-school': {
      value: 'Sandgate District State High School. Caught the train from Sandgate station every morning — the platform bench was always warm by 7:30.',
    },
    'teens_teens-identity': {
      value: 'Sporty but not loud about it. I played rugby league and did athletics but wasn\'t the alpha in the group. More the reliable one — the bloke who\'d turn up to training even when it was raining sideways.',
    },
    'teens_teens-music': {
      value: 'Powderfinger, Silverchair, Regurgitator — anything triple j played. I saved up from the fish and chip shop to buy Internationalist on CD from Sanity at Toombul Shoppingtown.',
    },
    'teens_teens-friendship': {
      value: 'Still Danny, plus Macca (Josh McAllister), Thommo (Ben Thompson), and Wirra (David Wirrapunda). We spent most weekends at someone\'s house playing PlayStation or down at the Sandgate pool. The chlorine from that pool was so strong your eyes stung for hours.',
    },
    'teens_teens-hardest-moment': {
      value: 'Year 10 camp in the Bunya Mountains. We did a night walk through the bush — no torches, just moonlight. The ground was soft with leaf litter and you could feel sticks snapping under your boots. Standing there in the dark, away from the city, I felt properly small for the first time. Something shifted.',
    },
    'teens_teens-discovery': {
      value: 'First job at "The Golden Catch" fish and chip shop in Sandgate. Started at fourteen. The fryer oil got into everything — my school bag, my hair, my pillow. But I learned I could work hard and liked earning my own money.',
    },
  };
}
