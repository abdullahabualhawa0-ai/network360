import { useRef, useCallback } from "react";

/**
 * Full Undo/Redo history system.
 * Usage: const { pushHistory, undo, redo, canUndo, canRedo } = useHistory(setNodes, setConnections);
 */
export function useHistory(setNodes, setConnections) {
  const history = useRef([]);
  const idx = useRef(-1);

  const pushHistory = useCallback((nodes, connections) => {
    // Remove any redo states after current position
    history.current = history.current.slice(0, idx.current + 1);
    history.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
    });
    // Cap history at 50 states
    if (history.current.length > 50) {
      history.current.shift();
    } else {
      idx.current = history.current.length - 1;
    }
  }, []);

  const undo = useCallback(() => {
    if (idx.current <= 0) return false;
    idx.current--;
    const snap = history.current[idx.current];
    setNodes(snap.nodes);
    setConnections(snap.connections);
    return true;
  }, [setNodes, setConnections]);

  const redo = useCallback(() => {
    if (idx.current >= history.current.length - 1) return false;
    idx.current++;
    const snap = history.current[idx.current];
    setNodes(snap.nodes);
    setConnections(snap.connections);
    return true;
  }, [setNodes, setConnections]);

  const canUndo = useCallback(() => idx.current > 0, []);
  const canRedo = useCallback(() => idx.current < history.current.length - 1, []);

  const reset = useCallback(() => {
    history.current = [];
    idx.current = -1;
  }, []);

  return { pushHistory, undo, redo, canUndo, canRedo, reset };
}