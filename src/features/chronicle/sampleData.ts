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
    'birth_full-name': {
      value: 'Alexander James Morgan',
    },
    'birth_date-of-birth': {
      value: '1985-03-15',
    },
    birth_birthplace: {
      value:
        'Royal Brisbane Hospital — Mum always said the air conditioning was broken that day and the ward felt like a sauna. March in Brisbane, forty degrees and thick humidity.',
    },
    'birth_birth-story': {
      value:
        'Mum reckons I took my sweet time. Dad drove the old Kingswood from Sandgate in the dark, windows down because the car had no aircon either. He said the whole drive smelt of frangipani and cut grass from the neighbours who had been mowing that evening. I was born right as the kookaburras started up outside the hospital window.',
    },
    birth_parents: {
      value:
        'David Morgan (Dad) and Karen Morgan, née Sullivan (Mum). Dad was a chippie — spent thirty years building houses around the northside. Mum was a nurse at The Prince Charles Hospital, worked in the cardiac ward.',
    },
    birth_siblings: {
      value:
        'One older sister, Rebecca (Bec). Born in 1982. She was three when I arrived and reportedly not impressed about sharing her Vegemite toast at breakfast.',
    },
    'birth_name-meaning': {
      value:
        'Named after Dad\'s grandfather, Alexander Morgan, who came out from Wales in the 1920s. James was Mum\'s dad. "We figured if we gave you two old blokes\' names you might get some of their sense," Dad said.',
    },

    // ─── Chapter 2: Early Years (0–5) ──────────────────────────────
    'early-years_first-home': {
      value:
        'A fibro house on Yundah Street in Sandgate, two blocks from the waterfront. The stumps were always a bit wonky and the floors creaked. You could smell the salt off Moreton Bay from the back steps, mixed with the rust from the old Hills Hoist.',
    },
    'early-years_earliest-memory': {
      value:
        'Sitting on the cool lino floor in the kitchen, pressing my hands flat against it because it felt cold and smooth on a stinking hot day. Mum was making pikelets and the whole house smelt of butter and vanilla. I remember the sticky texture of golden syrup on my fingers.',
    },
    'early-years_comfort-item': {
      value:
        'A battered Tonka dump truck, bright yellow with scratched-up paint. I used to fill it with sand from the backyard and tip it out on the concrete path.',
    },
    'early-years_first-pet': {
      value:
        'Rusty — a golden retriever with fur that always smelt like warm dirt and salt water. We got him from a family in Bracken Ridge when I was about two. He used to lie on the cool tiles under the house in summer and groan when you tried to move him.',
    },
    'early-years_family-tradition': {
      value:
        'Sunday morning walks along the Sandgate foreshore. Dad would get a coffee from the kiosk near the pool and Bec and I would climb on the rocks by the water. The rocks were always warm underfoot and covered in tiny barnacles that scratched your feet. Then fish and chips from the shop on Brighton Road, eaten on the bench with the seagulls circling.',
    },
    'early-years_favourite-food-kid': {
      value:
        'Mum\'s golden syrup dumplings. Heavy, sticky, sweet — the kind of dessert that sits in your stomach like a warm brick.',
    },
    'early-years_kindergarten': {
      value:
        'Sandgate Community Kindergarten on Rainbow Street. I remember the red vinyl chairs that stuck to the backs of your legs in the heat, and the sandpit that always had ants in it. Mrs Henderson was the teacher — she had a whistle that could cut through any amount of noise.',
    },

    // ─── Chapter 3: Primary School (5–12) ──────────────────────────
    'primary-school_school-name': {
      value: 'St Patrick\'s Primary School, Shorncliffe.',
    },
    'primary-school_best-friend': {
      value:
        'Danny Nguyen. His family ran the bakery on Loudon Street. We used to get Vietnamese rolls after school — the bread was always warm and the pork crackled between your teeth. Danny and I were inseparable from Year 3 through to Year 7.',
    },
    'primary-school_favourite-subject': {
      value: 'Science — Mr Callahan in Year 6 let us do proper experiments.',
    },
    'primary-school_playground-memory': {
      value:
        'Riding bikes to the Redcliffe jetty with Danny on a Saturday. The timber planks of the jetty were sun-bleached and splintery under bare feet. We\'d buy fish and chips from Morgans (no relation) and sit at the end with our legs dangling over the edge. The chips were salty and the batter crunched, and the Moreton Bay breeze would cool the sweat on the back of your neck.',
    },
    'primary-school_school-sport': {
      value:
        'Rugby league. Played halfback for the Sandgate Hawks from Under 8s through to Under 12s.',
    },
    'primary-school_family-holiday': {
      value:
        'Every Easter we drove up to Coolum Beach. Dad packed the Kingswood until the boot wouldn\'t close. Bec and I bodyboarded until our stomachs were raw from the wax. The sand got into everything — sleeping bags, cornflakes, the car seats for months afterwards.',
    },

    // ─── Chapter 4: Teens (13–17) ───────────────────────────────────
    'teens_high-school': {
      value:
        'Sandgate District State High School. Caught the train from Sandgate station every morning — the platform bench was always warm by 7:30.',
    },
    'teens_teen-identity': {
      value:
        'Sporty but not loud about it. I played rugby league and did athletics but wasn\'t the alpha in the group. More the reliable one — the bloke who\'d turn up to training even when it was raining sideways.',
    },
    'teens_first-job': {
      value:
        'Fish and chip shop on the main drag in Sandgate, "The Golden Catch." Started at fourteen. The fryer oil got into everything — my school bag, my hair, my pillow at home.',
    },
    'teens_teen-music': {
      value:
        'Powderfinger, Silverchair, Regurgitator — anything triple j played. I saved up from the fish and chip shop to buy Internationalist on CD.',
    },
    'teens_hardest-lesson': {
      value:
        'Year 10 camp in the Bunya Mountains. We did a night walk through the bush — no torches, just moonlight. Standing there in the dark, away from the city, I felt properly small for the first time. Something shifted — I started thinking about what I actually wanted, not just what was expected.',
    },
    'teens_teen-hangout': {
      value:
        'Sandgate foreshore or the Shorncliffe pier. We\'d sit on the concrete wall near the wading pool, legs swinging, talking rubbish. In summer the concrete held the heat from the day and was warm through your shorts even after dark.',
    },
  };
}
