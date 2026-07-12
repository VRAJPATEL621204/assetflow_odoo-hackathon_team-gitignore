import API_BASE_URL from '../config/api';
import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Trash2 } from 'lucide-react';

const ResourceBooking = () => {
  // Lists
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);

  // States
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin Resource Creator Modal
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState('ROOM');
  const [newResourceDesc, setNewResourceDesc] = useState('');

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resRes, bookRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bookings/resources`, { headers }),
        fetch(`${API_BASE_URL}/api/bookings`, { headers }),
      ]);

      const resList = await resRes.json();
      const bookList = await bookRes.json();

      if (resList.success) setResources(resList.data);
      if (bookList.success) setBookings(bookList.data);
    } catch (err) {
      setError('Failed to load shared resources or schedule logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedResourceId) {
      setError('Please select a shared resource');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError('Booking end time must be after start time');
      return;
    }

    try {
      const payload = {
        resourceId: parseInt(selectedResourceId),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Booking reservation failed');

      setSuccess('Slot reserved successfully!');
      setSelectedResourceId('');
      setStartTime('');
      setEndTime('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newResourceName.trim().length < 2) {
      setError('Resource name must be at least 2 characters');
      return;
    }

    try {
      const payload = {
        name: newResourceName,
        type: newResourceType,
        description: newResourceDesc || null,
      };

      const response = await fetch(`${API_BASE_URL}/api/bookings/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add shared resource');

      setSuccess(`Shared resource "${data.data.name}" added successfully!`);
      setShowResourceModal(false);
      setNewResourceName('');
      setNewResourceType('ROOM');
      setNewResourceDesc('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to cancel booking');

      setSuccess('Reservation cancelled successfully!');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter bookings for the currently selected resource in the form
  const resourceBookings = bookings.filter(b => b.resourceId === parseInt(selectedResourceId) && b.status !== 'CANCELLED');

  return (
    <div className="space-y-6 relative">
      {/* Alert Banners */}
      {error && (
        <div className="bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs p-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-accent-lime/10 border border-accent-lime/30 text-accent-lime text-xs p-3 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduler / Booking Form */}
        <div className="lg:col-span-2 bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-hairline-violet pb-4">
            <div>
              <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider block">Resource Scheduler</span>
              <h2 className="text-lg font-bold text-white mt-1">Reserve Shared Amenities</h2>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowResourceModal(true)}
                className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors"
              >
                + Add Resource
              </button>
            )}
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Shared Resource</label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-primary border border-hairline-violet rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                required
              >
                <option value="">Choose Resource...</option>
                {resources.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.name} ({res.type.toLowerCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-accent-lime text-primary font-bold px-4 py-2 rounded text-xs hover:bg-accent-lime/90 transition-colors"
            >
              Reserve Slot
            </button>
          </form>

          {/* Reserved slots preview for selected resource */}
          {selectedResourceId && (
            <div className="border-t border-hairline-violet pt-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Reserved Slots on this Resource</h4>
              <div className="space-y-2">
                {resourceBookings.length > 0 ? (
                  resourceBookings.map((b) => (
                    <div key={b.id} className="flex justify-between items-center bg-primary/20 border border-hairline-violet/50 p-2.5 rounded text-xs">
                      <span className="text-white">
                        {new Date(b.startTime).toLocaleString()} to {new Date(b.endTime).toLocaleString()}
                      </span>
                      <span className="text-on-dark-muted">
                        Reserved by {b.bookedBy?.name || 'Staff'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-on-dark-muted py-2">
                    No active reservations for this resource. All slots are available.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Existing Reservations Sidebar */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider">My Reservations</h3>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className="border border-hairline-violet rounded p-3 space-y-2 bg-primary/20">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs text-white">
                      {booking.resource?.name}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase ${
                      booking.status === 'CANCELLED' ? 'text-accent-pink' : 'text-accent-lime'
                    }`}>
                      {booking.status.toLowerCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-on-dark-muted">
                    {new Date(booking.startTime).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-on-dark-muted">
                    To {new Date(booking.endTime).toLocaleString()}
                  </div>
                  {booking.bookedBy && (
                    <div className="text-[10px] text-accent-violet-mid">
                      Booked by: {booking.bookedBy.name}
                    </div>
                  )}

                  {booking.status === 'UPCOMING' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-xs text-accent-pink hover:underline flex items-center gap-1 pt-1"
                    >
                      <Trash2 className="w-3 h-3" /> Cancel Slot
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-on-dark-muted text-center py-8">
                No active reservations.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ADD RESOURCE MODAL --- */}
      {showResourceModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Shared Resource</h3>
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Resource Name</label>
                <input
                  type="text"
                  maxLength={100}
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                  placeholder="e.g. Conference Room A, Pool Car 01"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Type</label>
                <select
                  value={newResourceType}
                  onChange={(e) => setNewResourceType(e.target.value)}
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                >
                  <option value="ROOM">Room / Space</option>
                  <option value="VEHICLE">Vehicle</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Description</label>
                <input
                  type="text"
                  maxLength={250}
                  value={newResourceDesc}
                  onChange={(e) => setNewResourceDesc(e.target.value)}
                  placeholder="e.g. Projector, 12 seats, whiteboard"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="flex-1 bg-primary hover:bg-primary/80 border border-hairline-violet text-on-dark-muted py-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-lime hover:bg-accent-lime/90 text-primary font-bold py-2 rounded text-sm transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceBooking;
