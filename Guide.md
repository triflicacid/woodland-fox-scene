# Modifying the woodland fox scene

This guide covers how the project is structured and the conventions to follow when adding or modifying components.

## Project layout

```
index.html
style.css
src/
  main.ts              entry point
  config.ts            constants, palettes, probability thresholds
  utils.ts             shared helpers (lerp, rnd, shadeHex, ...)
  core/
    Scene.ts           wires everything together, runs the render loop
    SceneState.ts      shared mutable state (see below)
    Component.ts       base class for all components
    ComponentGroup.ts  ordered collection of components
    DrawComponent.ts   extends Component with ctx/W/H
    Events.ts          event name constants + factory methods
    Subscriptions.ts   subscription factory methods
  event/
    EventBus.ts        dispatches events to subscribers
    Event.ts           event wrapper
    Subscription.ts    subscription wrapper
    ValueChange.ts     payload for state-mutation events
  components/
    animals/
    backdrop/
    birthday/
    bonfire/
    ...
```

`Scene.ts` is the only place that instantiates components and binds UI buttons. Everything else is self-contained.

---

## Components

All drawable things extend `Component` (or `DrawComponent`, which adds a few properties via the constructor.)
The `DrawComponent` class provides:

- `this.eventBus` - for publishing and subscribing to events
- `this.scene` - the shared `SceneState` (read environment values from here)
- `this.ctx`, `this.W`, `this.H` - canvas context and dimensions (`DrawComponent` only)

The four lifecycle methods you can override:

```js
initialise()   // called once after the scene is set up - generate random positions, etc.
isEnabled()    // called every frame - return false to skip tick() and draw() entirely
tick()         // called every frame before draw - update internal state
draw()         // called every frame - paint to ctx
```

Note that it is also *crucial* to override `getName()` as this will be used to get the component's name.
Conventionally, this is done by declaring a static `COMPONENT_NAME` and returning `ClassName.COMPONENT_NAME`.
We hardcode this instead of `this.constructor.name` to prevent issues when the class' name is changed unexpectedly, e.g.
due to obfuscation.

A typical component looks like this:

```ts
export class SnowflakesComponent extends DrawComponent {
    private flakes = [];

    static COMPONENT_NAME = "SnowflakesComponent";

    override getName() {
        return SnowflakesComponent.COMPONENT_NAME;
    }

    override initialise() {
        this.flakes = Array.from({length: 80}, () => ({x: rnd(this.W), y: rnd(this.H), ...}));
    }

    override isEnabled() {
        return this.scene.weather === 'snow';
    }

    override tick() {
        this.flakes.forEach(f => {
            f.y += f.speed;
            if (f.y > this.H) f.y = 0;
        });
    }

    override draw() {
        this.flakes.forEach(f => { ... });
    }
}
```

Register it in `Scene.ts` by adding it to the `ComponentGroup` constructor array, then it is called automatically every
frame.

### Grouping components

`ComponentGroup` is itself a `Component`, so it may be nested inside the main group in `Scene.ts`.
It proxies `initialise`, `tick` etc. to all its children.

A `ComponentGroup` is useful to group related component, especially when they are closely related.
However, as order determines the draw order, this may not always be suitable if components need to be rendered
non-sequentially.

For example, in the code we have `GroundBackdropComponents` and `SkyBackdropComponents`, which group together backdrop
components for the ground and sky, respectively.
This works as they must be rendered sequentially; for other components, such as Halloween-0related components, no group
is used as they must be rendered at different times.

---

## The event bus

Components communicate via `EventBus` rather than calling each other directly. This keeps them decoupled - a component
that fires a lightning strike does not need to know that the fox reacts to it.

All event names are defined as constants and have factory methods in `Events`; all subscriptions have factory methods on
`Subscriptions`.

**Publishing an event:**

```ts
this.eventBus.dispatch(Events.lightningStrike('LightningComponent', superBolt));
```

**Subscribing to an event** (typically in `initialise`):

```ts
this.eventBus.subscribe(Subscriptions.onLightningStrike('MyComponent', ({superBolt}) => {
    this._startReaction(superBolt);
}));
```

**Adding a new event** requires three steps:

1. Add a constant and factory method to `Events.ts`
2. Register it with `eventBus.registerEvent(...)` inside `Events.registerAll`
3. Add a subscription factory method to `Subscriptions.ts`

This keeps all event logic in one place.

---

## Keeping logic encapsulated

The goal is that each component owns its own state. If only one component needs a value, it lives as a private field on
that component, not in `SceneState`.

`SceneState` exists for values that genuinely need to be shared, such as global weather and season data, etc.
If you find yourself adding a field to `SceneState` for a new component, ask whether another component actually needs to
read it. If not, keep it on the component.

Components should communicate via events rather than calling each other directly. This keeps them decoupled and allows
behaviour to evolve without introducing tight dependencies.
Use direct references only when components are tightly coupled and conceptually part of the same feature.

For example, a lightning strike dispatches an event, which `FoxComponent` reacts to independently.
In contrast, `FoxComponent` may hold a reference to a `MusicalNotesComponent` to spawn particles during a singing
scene - this is a dependency between closely related components.

The `isEnabled()` check is also the right place to handle conditional visibility - no need to track a separate `visible`
flag if you can derive it from scene state. For example:

```ts
override
isEnabled()
{
    return this.scene.specialEvent === 'birthday';
}
```

---

## Practical notes

- `config.ts` is the place for tuning values (probabilities, sizes, palette colours). Keep magic numbers out of
  components where possible. Also, in-line with encapsulation, only 'global' values should be kept here.
- `utils.ts` has useful helpers that are generic. If a function is tightly coupled to the component, keep it in the
  respective file.
- Draw order is the order components appear in the `ComponentGroup` array in `Scene.ts`. Background things go first,
  foreground last.
- `frame` is available on `this.scene.frame` and increments every tick. Use it (with `Math.sin`) for animation cycles
  rather than storing your own counter where possible.
- Avoid using random values in `draw()` for rendering 'random' things, such as spots - as it is called every frame,
  these will jitter