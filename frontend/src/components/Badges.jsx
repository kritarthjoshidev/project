import { getPriorityClass, getStatusClass } from '../data/mockData';

export function PriorityBadge({ priority }) {
  const cls = getPriorityClass(priority);
  return (
    <span className={`badge badge-${cls}`}>
      <span className="badge-dot" />
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const cls = getStatusClass(status);
  return (
    <span className={`badge badge-${cls}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

export function AssigneeAvatar({ assignee, size = 28 }) {
  return (
    <div
      className="assignee-avatar"
      title={assignee.name}
      style={{ background: assignee.color, width: size, height: size }}
    >
      {assignee.initials}
    </div>
  );
}
