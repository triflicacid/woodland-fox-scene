# Woodland Fox Scene

A canvas-based animated scene of a fox resting in a woodland clearing. The scene is interactive: you can change the
season, weather, time of day, trigger special events, and bring in visiting animals. The fox has idle animations and can
be woken up, made to wander, or receive a visitor.

Built with TypeScript and [Vite](https://vitejs.dev/).

This was made as a Birthday gift to my boyfriend, Theo.

Read `TODO` to get an idea of future changes, and `Guide` for a quick run-down of the code and architecture, as well as
governing principles.
While developed as a gift, effort has been made to keep the code clean, readable, and maintainable.

---

## Running the Project

```
npm install
npm run dev
```

### Building the Project

```
npm run build
```

This outputs a single file, `dist/index.html`, which may be run without a webserver etc.

---

## Page Layout

`index.html` contains the following layout:

```
h1                     scene title
#canvas-wrap > canvas  the rendered scene
.ctrl-panel
  .btn-row             main action buttons (always visible)
  #tab-bar             tab navigation
  #tab-content         tab panels (one visible at a time)
#status                one-line description of what the fox is doing
```

The control panel is split into two parts: the main action buttons at the top, and a tabbed panel below.

---

## Main Actions

These buttons are always visible above the tabs.

| Button       | Effect                                                 |
|--------------|--------------------------------------------------------|
| Wake the Fox | Toggles the fox between asleep and awake               |
| Wander       | Sends the fox on a walk across the scene               |
| Visitor      | Triggers the bunny to hop in and interact with the fox |

---

## Tabs

### Season

Controls the season.

- **Season** - spring, summer, autumn, winter. Changes the colour palette, foliage, and ground cover. Some special
  events are locked to specific seasons.

### Time

Controls the current time of day.

- **Time Period** - transitions the lighting between daytime, nighttime, dusk, and dawn.
- **Moon Phase** - eight phases from new moon to waning crescent. Only visible at night.

### Weather

- **Clear** - default, no weather effects.
- **Rain** - falling rain, puddles form on the ground, the fox tucks in.
- **Wind** - leaves and debris blow across the scene.
- **Fog** - low-lying mist across the ground.
- **Snow** - snowfall, snow accumulates on the fox and surroundings. Winter only.
- **Storm** - rain and lightning. The fox reacts to lightning strikes.
- **Aurora** - northern lights in the night sky.
- **Stargaze** - clears the scene for a clear stargazing night sky. Night only.

### Events

Special events layer additional components over the scene.
Events are locked to a specific season and/or time of day - the button will be disabled if the current conditions do not
match.

| Event         | Conditions    |
|---------------|---------------|
| Halloween     | Autumn, night |
| Christmas     | Winter        |
| Bonfire Night | Autumn, night |
| Birthday      | Any           |
| Easter        | Spring, day   |
| Solar Eclipse | Day           |

**Halloween** - jack-o-lanterns, bats, and spooky decorations appear across the scene.

**Christmas** - presents, fairy lights, and a festive atmosphere.

**Bonfire Night** - a bonfire burns in the clearing with fireworks being set off.

**Birthday** - balloons, bunting, a cake, and cupcakes appear around the scene.

**Easter** - decorated eggs are scattered across the ground in clusters while the Easter bunny presides over them.

**Solar Eclipse** - the moon eclipses the sun, the solar corona visible. Monsters inspired from Terraria wander across
the screen.

### Animals

Spawns visiting animals into the scene. These are separate from the bunny visitor triggered by the main action button.

- **Deer** - a deer wanders through the background.
- **Hedgehog** - a hedgehog trundles across the scene.
- **Owl / Bats** - an owl and bats appear in the trees.
- **Guy Fawkes** - a distinctive figure walks through and salutes the bonfire. Bonfire Night only.
- **Chicks** - a group of chicks peck at and wander across the ground. Easter only.
- **Mothron** - a large moth that swoops toward the fox (from Terraria).

### Fox

Manual triggers for individual fox animations.

- **Yawn** - the fox yawns.
- **Ear Twitch** - one ear flicks.
- **Grumble** - the fox grumbles, with a visible sound effect.
- **Blink** - the fox blinks.
