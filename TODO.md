# TODO

Things desired to work on/that should be done.

## New Features

- Werewolves event, maybe during a full moon?
- Mouse animal
- Volcano eruption scene

## Tweaks

## Bug Fixes

- Currently, shows sun rays in clear+summer mode all the time - should only do this when `todBlend` is 1.

## Tech Debt

- Aim: move most things out of `SceneState`.
  For instance, `bunny` and `fox` (but they'd still need a way to know of each other's state, for example in the
  `Visitor` sequence)
