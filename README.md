# Ocean simulator

![Person playing the ocean simulator](sketch.jpeg)

The ocean simulator will be a video game that will let the player use their body to "swim" through a simulated ocean (or river, lake, or pond), complete with fish, whales, sharks, rays, etc., and a coral reef.

I hope this project could have a free version and a paid version, maybe just selling encounters with rare animals, for example: deep down at the bottom of the ocean, or at a coral reef or river modeled after a real, existing place.

## To do

### Project decisions

- [ ] What parts of project will be open soure and which for profit?
  - [ ] What licensing limitations will the simulator be under?
- [ ] What is the scope of the project?
  - [ ] What animals to include?
- [ ] What work contract will we agree on, so if we want to profit from it we can? Or if we want to just get a good grade we can?

### Development

- [ ] Learn about PlayCanvas
- [ ] Set up source repository
  - [ ] possibly with private repositor ([sync with local git so it can be edited in TypeScript with VS Code](https://github.com/playcanvas/playcanvas-sync))
  - [ ] or consider implementing the project [just using the PlayCanvas engine](https://developer.playcanvas.com/en/user-manual/engine-only/)
- [ ] Add scenes
  - [ ] Simulator
  - [ ] Set up camera
- [ ] Add player
  - [ ] 3D model & texture
    - [ ] (or dynamically generate)
  - [ ] control with keyboard / mouse
  - [ ] control with motion
- [ ] Add generic fish:
  - [ ] 3D model & texture
    - [ ] (or dynamically generate)
  - [ ] behavoir
- [ ] Work at making physics realistic for being underwater
- [ ] Add other creatures:
  - [ ] whales
  - [ ] sharks
  - [ ] manta rays
- [ ] Dynamic content generation
  - [ ] Think about how this could be done
  - [ ] Modify marine animals to be dynamically generated (so they can be bigger or smaller, slower or faster, and vary in other parameters)
  - [ ] Add dynamically generated corals and sponges to make reefs
- [ ] Add sound
  - [ ] marine animals

### Research

#### Science

- [ ] Behavoirs of whales and other marine animals
- [ ] Variety - parameters - of marine creatures
- [ ] Fluid simulation / physics for underwater
- [ ] What risks are there in playing motion-controlled video games?
  - [ ] Should VR not get added?

#### Technology

- [ ] General PlayCanvas features
  - [ ] Detect when one object touches another
- [ ] How to use soft body physics with ammo.js in PlayCanvas?
- [ ] How to implemnt the water simulator? (So if a whale swims, the water that gets pushed back from its flipper will also push you or fish swimming nearby)
- [ ] Pose detection API
