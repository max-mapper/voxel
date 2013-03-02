var events = require('events')
var inherits = require('inherits')

module.exports = function(opts) {
  return new Chunker(opts)
}

module.exports.Chunker = Chunker

function Chunker(opts) {
  this.distance = opts.chunkDistance || 2
  this.chunkSize = opts.chunkSize || 32
  this.cubeSize = opts.cubeSize || 25
  this.generateVoxelChunk = opts.generateVoxelChunk
  this.chunks = {}
  this.meshes = {}

  if (this.chunkSize & this.chunkSize-1 !== 0)
    throw new Error('chunkSize must be a power of 2')
  var bits = 0;
  for (var size = this.chunkSize; size > 0; size >>= 1) bits++;
  this.chunkBits = bits - 1;
}

inherits(Chunker, events.EventEmitter)

Chunker.prototype.nearbyChunks = function(position, distance) {
  var current = this.chunkAtPosition(position)
  var x = current[0]
  var y = current[1]
  var z = current[2]
  var dist = distance || this.distance
  var nearby = []
  for (var cx = (x - dist); cx !== (x + dist); ++cx) {
    for (var cy = (y - dist); cy !== (y + dist); ++cy) {
      for (var cz = (z - dist); cz !== (z + dist); ++cz) {
        nearby.push([cx, cy, cz])
      }
    }
  }
  return nearby
}

Chunker.prototype.requestMissingChunks = function(position) {
  var self = this
  this.nearbyChunks(position).map(function(chunk) {
    if (!self.chunks[chunk.join('|')]) {
      self.emit('missingChunk', chunk)
    }
  })
}

Chunker.prototype.getBounds = function(x, y, z) {
  var bits = this.chunkBits
  var low = [x << bits, y << bits, z << bits]
  var high = [(x+1) << bits, (y+1) << bits, (z+1) << bits]
  return [low, high]
}

Chunker.prototype.generateChunk = function(x, y, z) {
  var self = this
  var bounds = this.getBounds(x, y, z)
  var chunk = this.generateVoxelChunk(bounds[0], bounds[1], x, y, z)
  var position = [x, y, z]
  chunk.position = position
  this.chunks[position.join('|')] = chunk
  return chunk
}

Chunker.prototype.chunkAtCoordinates = function(x, y, z) {
  var bits = this.chunkBits;
  var cx = x >> bits;
  var cy = y >> bits;
  var cz = z >> bits;
  var chunkPos = [cx, cy, cz];
  return chunkPos;
}

Chunker.prototype.chunkAtPosition = function(position) {
  var cubeSize = this.cubeSize;
  var x = Math.floor(position[0] / cubeSize)
  var y = Math.floor(position[1] / cubeSize)
  var z = Math.floor(position[2] / cubeSize)
  var chunkPos = this.chunkAtCoordinates(x, y, z)
  return chunkPos
};

Chunker.prototype.voxelIndexFromCoordinates = function(x, y, z) {
  var bits = this.chunkBits
  var mask = (1 << bits) - 1
  var vidx = (x & mask) + ((y & mask) << bits) + ((z & mask) << bits * 2)
  return vidx
}

Chunker.prototype.voxelIndexFromPosition = function(pos) {
  var v = this.voxelVector(pos)
  return this.voxelIndex(v)
}

Chunker.prototype.voxelAtCoordinates = function(x, y, z, val) {
  var ckey = this.chunkAtCoordinates(x, y, z).join('|')
  var chunk = this.chunks[ckey]
  if (!chunk) return false
  var vidx = this.voxelIndexFromCoordinates(x, y, z)
  var v = chunk.voxels[vidx]
  if (typeof val !== 'undefined') {
    chunk.voxels[vidx] = val
  }
  return v
}

Chunker.prototype.voxelAtPosition = function(pos, val) {
  var cubeSize = this.cubeSize;
  var x = Math.floor(pos[0] / cubeSize)
  var y = Math.floor(pos[1] / cubeSize)
  var z = Math.floor(pos[2] / cubeSize)
  var v = this.voxelAtCoordinates(x, y, z, val)
  return v;
}

// deprecated
Chunker.prototype.voxelIndex = function(voxelVector) {
  var vidx = this.voxelIndexFromCoordinates(voxelVector[0], voxelVector[1], voxelVector[2])
  return vidx
}

// deprecated
Chunker.prototype.voxelVector = function(pos) {
  var cubeSize = this.cubeSize
  var mask = (1 << this.chunkBits) - 1
  var vx = (Math.floor(pos[0] / cubeSize)) & mask
  var vy = (Math.floor(pos[1] / cubeSize)) & mask
  var vz = (Math.floor(pos[2] / cubeSize)) & mask
  return [vx, vy, vz]
};
