voxel = require('./')
var chunker = voxel({distance: 2, chunkSize: 32, cubeSize: 25})
console.log(chunker)