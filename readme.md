# voxel

voxel geometry generation and meshing algorithms in javascript. written by @mikolalysenko and put on npm by me.

original repo: https://github.com/mikolalysenko/mikolalysenko.github.com/tree/master/MinecraftMeshes2
blog post: http://0fps.wordpress.com/2012/07/07/meshing-minecraft-part-2/
webgl demo: http://mikolalysenko.github.com/MinecraftMeshes2/

# installation

in node:
```
npm install voxel
```
in a browser:
```
npm install voxel
npm install browserify -g
browserify -r voxel -o voxel.js
```

# usage

## require('voxel').generate(low, high, iterator)

where `low` and `high` are `[x, y, z]` start and end positions to iterate over and `iterator` is the function that visits each voxel

returns an object like this: `{ "voxels": "a 1D Int32Array filled with voxel data", "dims": [x, y, z] }`

example that creates randomly colored voxels:

```javascript
require('voxel').generate([0,0,0], [16,16,16], function(x,y,z) {
  return Math.round(Math.random() * 0xffffff);
});
```

a sphere:

```javascript
require('voxel').generate([0,0,0], [32,32,32], function(x,y,z) {
  return x*x+y*y+z*z <= 16*16 ? 0x113344 : 0;
});
```

## require('voxel').meshers

`meshers` is an object with `stupid`, `culled`, `monotone` and `greedy` mesher functions. you probably want to just use `greedy`. all mesher functions accept voxel data in the format the gets returned by the `generate` function.

## require('voxel').geometry

`geometry` is an object with a bunch of pre-generated voxel geometries to play with, from http://mikolalysenko.github.com/MinecraftMeshes2/

# license

MIT