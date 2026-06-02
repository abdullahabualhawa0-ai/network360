/**
 * BFS to find a path between two nodes through existing connections.
 * Returns array of node IDs forming the path, or null if no path exists.
 */
export function findPath(fromId, toId, connections) {
  if (fromId === toId) return [fromId];
  
  const adj = {};
  for (const c of connections) {
    if (!adj[c.from]) adj[c.from] = [];
    if (!adj[c.to]) adj[c.to] = [];
    adj[c.from].push({ neighbor: c.to, connId: c.id });
    adj[c.to].push({ neighbor: c.from, connId: c.id });
  }

  const visited = new Set([fromId]);
  const queue = [{ nodeId: fromId, path: [fromId], connPath: [] }];

  while (queue.length > 0) {
    const { nodeId, path, connPath } = queue.shift();
    for (const { neighbor, connId } of (adj[nodeId] || [])) {
      if (neighbor === toId) {
        return { nodePath: [...path, neighbor], connPath: [...connPath, connId] };
      }
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ nodeId: neighbor, path: [...path, neighbor], connPath: [...connPath, connId] });
      }
    }
  }
  return null;
}

/**
 * Check if two nodes are connected (directly or via intermediary)
 */
export function isReachable(fromId, toId, connections) {
  return findPath(fromId, toId, connections) !== null;
}