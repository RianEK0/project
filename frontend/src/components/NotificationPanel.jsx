import { Bell, CheckCheck } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

const NotificationPanel = ({ items = [], onMarkRead }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Notifikasi</h3>
          <p className="muted-text">Pengingat absensi dan alert sistem</p>
        </div>
      </div>

      <div className="notification-list">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className={`notification-item ${item.isRead ? 'read' : ''}`}>
              <div className="notification-icon">
                <Bell size={18} />
              </div>
              <div className="notification-copy">
                <div className="notification-title">{item.title}</div>
                <div className="muted-text">{item.message}</div>
                <div className="notification-meta">{formatDateTime(item.createdAt)}</div>
              </div>
              {!item.isRead ? (
                <button className="ghost-btn" onClick={() => onMarkRead(item.id)}>
                  <CheckCheck size={16} />
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <div className="empty-state compact">Belum ada notifikasi.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
