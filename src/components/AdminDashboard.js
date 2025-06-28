// src/components/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import ConfirmModal from './ConfirmModal';
import './AdminDashboard.css';

export default function AdminDashboard({ currentUser }) {
  const [flags, setFlags] = useState({});
  const [users, setUsers] = useState({});
  const [posts, setPosts] = useState({});
  const [modal, setModal] = useState({ show: false, action: null, id: null });

  useEffect(() => {
    if (!currentUser) return;

    onValue(ref(db, 'flags'), snap => setFlags(snap.val() || {}));
    onValue(ref(db, 'users'), snap => setUsers(snap.val() || {}));
    onValue(ref(db, 'blogs'), snap => setPosts(snap.val() || {}));
  }, [currentUser]);

  const confirmAction = () => {
    const { action, id } = modal;
    if (action === 'remove') handleRemovePost(id, true);
    if (action === 'block') handleBlockUser(id, true);
    setModal({ show: false, action: null, id: null });
  };

  const handleRemovePost = (postId, confirmed = false) => {
    if (!confirmed) {
      setModal({ show: true, action: 'remove', id: postId });
      return;
    }
    remove(ref(db, `blogs/${postId}`));
    const entry = Object.entries(flags).find(([_, f]) => f.postId === postId);
    if (entry) remove(ref(db, `flags/${entry[0]}`));
    update(ref(db, `activityLogs/${Date.now()}`), {
      adminId: currentUser.uid,
      type: 'removePost',
      postId,
      timestamp: Date.now()
    });
  };

  const handleBlockUser = (uid, confirmed = false) => {
    if (!confirmed) {
      setModal({ show: true, action: 'block', id: uid });
      return;
    }
    update(ref(db, `users/${uid}`), { blocked: true });
    update(ref(db, `activityLogs/${Date.now()}`), {
      adminId: currentUser.uid,
      type: 'blockUser',
      userId: uid,
      timestamp: Date.now()
    });
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <section className="dashboard-section">
        <h3>Flagged Posts</h3>
        {Object.entries(flags).length === 0 && <p>No flagged posts.</p>}
        {Object.entries(flags).map(([fid, flag]) => {
          const post = posts[flag.postId];
          const author = users[post?.uid];
          const isBlocked = author?.blocked;
          return (
            <div className="flag-card" key={fid}>
              <p><strong>Reason:</strong> {flag.reason}</p>
              <p><strong>Post Title:</strong> {post?.title || '—'}</p>
              <p><strong>Author:</strong> {author?.displayName || 'Unknown'} {isBlocked && <span className="blocked-tag">(Blocked)</span>}</p>
              <div className="flag-actions">
                <button onClick={() => handleRemovePost(flag.postId)}>🗑 Remove Post</button>
                {post?.uid && <button onClick={() => handleBlockUser(post.uid)}>🚫 Block User</button>}
              </div>
            </div>
          );
        })}
      </section>

      <section className="dashboard-section analytics">
        <h3>Analytics</h3>
        <p>Total Users: {Object.keys(users).length}</p>
        <p>Total Posts: {Object.keys(posts).length}</p>
        <p>Total Flags: {Object.keys(flags).length}</p>
      </section>

      {modal.show && (
        <ConfirmModal
          message={
            modal.action === 'remove'
              ? "Are you sure you want to remove this post?"
              : "Are you sure you want to block this user?"
          }
          onConfirm={confirmAction}
          onCancel={() => setModal({ show: false, action: null, id: null })}
        />
      )}
    </div>
  );
}
