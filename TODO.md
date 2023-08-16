# To do

## Diver

- [ ] More realistic model / limbs

## Pose copier

- [ ] Make whole body lean direction the shoulders are inclined when hips are visible for comparison.
- [ ] Improve head rotation
  - [ ] change head to neck rotation; head doesnt rotate
- [ ] Mirror legs
- [ ] Add a more generic interface that will make it easy to generically support different entity controller modes
  - motion-controlled:
    - human upper body
    - human lower body
    - fish-like :fish::flipper: upper body (fold your arms into fins/flippers)
    - Could it support a person laying on the floor swimming?
      - Or splashing their tail? :whale:
  - AI controlled (the pose control comes after the intent to move, so that the animal could be partly player-controlled, but the actual motion is calculated from actual body movements)
    - diver legs swimming
    - fish-like fins/flippers
    - fish-like tail

## Swimming algorithm

This algorithm should let the player and animals swim. It could work by observing the motion of key entities (like arms, legs, fins/flippers and tails) against invisible collision detectors nearby to them. These invisible detectors can then give an indication of what direction the limb has been going and how fast. Or that could be determined without the PlayCanvas physics engine. If it's with the physics engine, then hopefully it can be optimized using a collision group just for that limb.

## Creature AI

- [ ] **Fish AI**: simpler to implement since just looking for intelligent school/aggregate behavoir
- [ ] **More intelligent creature AI**
  - [ ] Need to think about for theory:
    - [ ] what behavoirs would they exhibit?
    - [ ] what kind of internal state would they have?
    - [ ] how intelligent could they be?
- [ ] Consider practical aspects:
  - [ ] Where are model parameters / creature gene pools / seed DNA stored?