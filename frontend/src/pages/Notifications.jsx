import API_BASE_URL from '../config/api';
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckSquare, 
  Calendar, 
  Plus, 
  Send, 
  RefreshCw, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('GENERAL');
  const [alertUserId, setAlertUserId] = useState('');
  const [sendingAlert, setSendingAlert] = useState(false);
  const [scanning, setScanning] = useState(false);

  const token = localStorage.getItem('token');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      setError('Failed to fetch system notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const handleMarkAllRead = async () => {
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Action failed');

      setSuccessMsg('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkSingleRead = async (id) => {
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Action failed');

      fetchNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!alertMsg.trim()) return;

    setSendingAlert(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: alertMsg,
          type: alertType,
          targetUserId: alertUserId ? parseInt(alertUserId) : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send alert');

      setSuccessMsg(data.message || 'Alert sent successfully');
      setAlertMsg('');
      setAlertUserId('');
      setIsModalOpen(false);
      fetchNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingAlert(false);
    }
  };

  const handleAutoScan = async () => {
    setScanning(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications/seed-contextual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to auto-scan');

      const { overdue, pendingMaintenance, todayBookings } = data.data;
      setSuccessMsg(`Scan Complete! Generated ${overdue} overdue alert(s), ${pendingMaintenance} pending maintenance request alert(s), and ${todayBookings} booking alert(s).`);
      fetchNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  // Map backend notification types to filter types
  const getFilterType = (type) => {
    if (type === 'OVERDUE') return 'alerts';
    if (type === 'REQUEST_PENDING') return 'approvals';
    if (type === 'BOOKING_START') return 'bookings';
    return 'general';
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'OVERDUE':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          colorClass: 'bg-accent-pink/15 text-accent-pink border-accent-pink/30',
          label: 'Overdue Alert',
        };
      case 'REQUEST_PENDING':
        return {
          icon: <Clock className="w-4 h-4" />,
          colorClass: 'bg-accent-violet/15 text-accent-violet border-accent-violet/30',
          label: 'Approval Pending',
        };
      case 'BOOKING_START':
        return {
          icon: <Calendar className="w-4 h-4" />,
          colorClass: 'bg-accent-lime/15 text-accent-lime border-accent-lime/30',
          label: 'Booking Alert',
        };
      default:
        return {
          icon: <Bell className="w-4 h-4" />,
          colorClass: 'bg-white/10 text-on-dark-muted border-hairline-violet/30',
          label: 'System Notification',
        };
    }
  };

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => getFilterType(n.type) === activeFilter);

  return (
    <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6 relative">
      
      {/* Alert & Success Banners */}
      {error && (
        <div className="bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs p-3 rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {successMsg && (
        <div className="bg-accent-lime/10 border border-accent-lime/30 text-accent-lime text-xs p-3 rounded flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header with Title and Control Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">System Notifications</h2>
          <p className="text-xs text-on-dark-muted">Manage system alerts, overdue triggers, and custom notifications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAutoScan}
            disabled={scanning}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/40 border border-hairline-violet text-xs text-white hover:bg-primary transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Auto-Scan Alerts'}
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-accent-lime text-primary font-bold text-xs hover:bg-accent-lime/90 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            Send Alert
          </button>
        </div>
      </div>

      {/* Filters header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-hairline-violet/30 pb-1">
        <div className="flex gap-6">
          {['all', 'alerts', 'approvals', 'bookings'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-all ${
                activeFilter === filter ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-accent-lime font-bold hover:underline pb-3"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredNotifications.map((n) => {
          const styles = getNotificationStyles(n.type);
          return (
            <div 
              key={n.id} 
              className={`flex justify-between items-center p-4 border rounded-md transition-all ${
                n.isRead 
                  ? 'bg-primary/10 border-hairline-violet/20 hover:border-hairline-violet/50' 
                  : 'bg-accent-violet-deep/10 border-accent-violet/50 hover:border-accent-violet/80 shadow-[0_0_15px_rgba(91,63,212,0.05)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded mt-0.5 border ${styles.colorClass}`}>
                  {styles.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${styles.colorClass}`}>
                      {styles.label}
                    </span>
                    {!n.isRead && (
                      <span className="text-[9px] bg-accent-lime text-primary px-1 rounded font-bold uppercase">
                        Unread
                      </span>
                    )}
                    {n.userCount > 1 && (
                      <span 
                        title={`Sent to: ${n.recipients.join(', ')}`}
                        className="text-[9px] bg-primary/40 border border-hairline-violet text-on-dark-muted px-1.5 py-0.5 rounded font-semibold cursor-help"
                      >
                        👥 Sent to {n.userCount} users
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1.5 text-white/95 leading-relaxed ${!n.isRead ? 'font-semibold' : ''}`}>
                    {n.message}
                  </p>
                  <span className="text-[10px] text-on-dark-muted block mt-1">
                    {new Date(n.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              
              {!n.isRead && (
                <button
                  onClick={() => handleMarkSingleRead(n.id)}
                  title="Mark as read"
                  className="p-1.5 rounded-full border border-hairline-violet text-on-dark-muted hover:text-accent-lime hover:border-accent-lime transition-all ml-4"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-16 text-sm text-on-dark-muted border border-dashed border-hairline-violet/20 rounded-md bg-primary/5">
            <Bell className="w-8 h-8 text-hairline-violet/60 mx-auto mb-3" />
            <p className="font-semibold text-white/70">No matching notifications</p>
            <p className="text-xs mt-1 text-on-dark-muted">Click "Auto-Scan Alerts" to generate live notifications from allocations and maintenance requests.</p>
          </div>
        )}
      </div>

      {/* Custom Alert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-hairline-violet flex justify-between items-center bg-primary/20">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-accent-lime" />
                <h3 className="font-bold text-sm">Send Custom System Alert</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-on-dark-muted hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendAlert} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-dark-muted uppercase mb-1.5">Alert Message</label>
                <textarea
                  required
                  rows="3"
                  value={alertMsg}
                  onChange={(e) => setAlertMsg(e.target.value)}
                  placeholder="Enter the alert notification text..."
                  className="w-full bg-primary/30 border border-hairline-violet text-white text-sm rounded p-2.5 focus:outline-none focus:border-accent-lime placeholder-white/35 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-dark-muted uppercase mb-1.5">Alert Type</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full bg-primary/30 border border-hairline-violet text-white text-xs rounded p-2 focus:outline-none focus:border-accent-lime"
                  >
                    <option value="GENERAL" className="bg-ink-deep">General Info</option>
                    <option value="OVERDUE" className="bg-ink-deep">Overdue / Warning</option>
                    <option value="REQUEST_PENDING" className="bg-ink-deep">Pending Approval</option>
                    <option value="BOOKING_START" className="bg-ink-deep">Resource Booking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-dark-muted uppercase mb-1.5">Target User ID (Optional)</label>
                  <input
                    type="number"
                    value={alertUserId}
                    onChange={(e) => setAlertUserId(e.target.value)}
                    placeholder="All Users"
                    className="w-full bg-primary/30 border border-hairline-violet text-white text-xs rounded p-2 focus:outline-none focus:border-accent-lime placeholder-white/35"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-hairline-violet/30 flex justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-hairline-violet rounded text-white font-medium hover:bg-primary/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingAlert}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-lime text-primary font-bold rounded hover:bg-accent-lime/90 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingAlert ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Notifications;
