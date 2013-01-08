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
}

Chunker.prototype.generateMissingChunks = function(position) {
  var current = this.chunkAtPosition(position)
  var x = current[0]
  var y = current[1]
  var z = current[2]
  var dist = this.distance
  for (var cx = (x - dist); cx !== (x + dist); ++cx) {
    for (var cy = (y - dist); cy !== (y + dist); ++cy) {
      for (var cz = (z - dist); cz !== (z + dist); ++cz) {
        if (!this.chunks[[cx, cy, cz].join('|')]) {
          this.generateChunk(cx, cy, cz)
        }
      }
    }
  }
  return this.chunks
}

Chunker.prototype.getBounds = function(x, y, z) {
  var size = this.chunkSize
  var low = [x * size, y * size, z * size]
  var high = [low[0] + size, low[1] + size, low[2] + size]
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

Chunker.prototype.chunkAtPosition = function(position) {
  var chunkSize = this.chunkSize
  var cubeSize = this.cubeSize
  var cx = position.x / cubeSize / chunkSize
  var cy = position.y / cubeSize / chunkSize
  var cz = position.z / cubeSize / chunkSize
  var chunkPos = [Math.floor(cx), Math.floor(cy), Math.floor(cz)]
  return chunkPos
};

Chunker.prototype.voxelIndex = function(pos) {
  var size = this.chunkSize
  var v = this.voxelVector(pos)
  var vidx = v.x + v.y*size + v.z*size*size
  return vidx
}

Chunker.prototype.voxelAtPosition = function(pos, val) {
  var ckey = this.chunkAtPosition(pos).join('|')
  var chunk = this.chunks[ckey]
  if (!chunk) return false
  var vidx = this.voxelIndex(pos)
  if (!vidx) return false
  if (typeof val !== 'undefined') {
    chunk.voxels[vidx] = val
  }
  var v = chunk.voxels[vidx]
  return v
}

Chunker.prototype.voxelVector = function(pos) {
  var size = this.chunkSize
  var cubeSize = this.cubeSize
  var vx = (size + Math.floor(pos.x / cubeSize) % size) % size
  var vy = (size + Math.floor(pos.y / cubeSize) % size) % size
  var vz = (size + Math.floor(pos.z / cubeSize) % size) % size
  return {x: Math.abs(vx), y: Math.abs(vy), z: Math.abs(vz)}
};
