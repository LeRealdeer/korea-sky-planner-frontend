// none → planned → owned → none 순환
export function cycleNodeState(current) {
  if (current === 'planned') return 'owned';
  if (current === 'owned') return 'none';
  return 'planned';
}
