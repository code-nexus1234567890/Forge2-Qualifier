import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [boardDetails, setBoardDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Modal States
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardListId, setCardListId] = useState(null); // Used when creating new card
  const [cardForm, setCardForm] = useState({
    title: '',
    description: '',
    due_date: '',
    member_id: '',
    tags: []
  });

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', avatar_color: '#6366f1' });

  // Initial Fetches
  useEffect(() => {
    fetchBoards();
    fetchMembers();
    fetchTags();
  }, []);

  // Fetch Board Details when selection changes
  useEffect(() => {
    if (selectedBoardId) {
      fetchBoardDetails(selectedBoardId);
    } else {
      setBoardDetails(null);
    }
  }, [selectedBoardId]);

  const fetchBoards = async () => {
    try {
      const res = await fetch(`${API_BASE}/boards`);
      const data = await res.json();
      setBoards(data);
      if (data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  };

  const fetchBoardDetails = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/boards/${id}`);
      const data = await res.json();
      setBoardDetails(data);
    } catch (err) {
      console.error("Error fetching board details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/members`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_BASE}/tags`);
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  // Seed Data Trigger
  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${API_BASE}/seed-demo`, { method: 'POST' });
      await res.json();
      await fetchBoards();
      await fetchMembers();
      await fetchTags();
    } catch (err) {
      console.error("Error seeding demo:", err);
      alert("Failed to connect to backend server. Make sure your Laravel server is running on http://localhost:8000!");
    } finally {
      setSeeding(false);
    }
  };

  // Create Board
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBoardName })
      });
      const data = await res.json();
      setBoards([...boards, data]);
      setSelectedBoardId(data.id);
      setNewBoardName('');
      setShowBoardModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Create List
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim() || !selectedBoardId) return;
    try {
      const res = await fetch(`${API_BASE}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName, board_id: selectedBoardId })
      });
      await res.json();
      fetchBoardDetails(selectedBoardId);
      setNewListName('');
      setShowListModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Board
  const handleDeleteBoard = async () => {
    if (!selectedBoardId || !window.confirm("Are you sure you want to delete this board and all its tasks?")) return;
    try {
      await fetch(`${API_BASE}/boards/${selectedBoardId}`, { method: 'DELETE' });
      const remaining = boards.filter(b => b.id !== selectedBoardId);
      setBoards(remaining);
      setSelectedBoardId(remaining.length > 0 ? remaining[0].id : null);
    } catch (err) {
      console.error(err);
    }
  };

  // Save/Create Card
  const handleSaveCard = async (e) => {
    e.preventDefault();
    try {
      const url = selectedCard 
        ? `${API_BASE}/cards/${selectedCard.id}`
        : `${API_BASE}/cards`;
      
      const payload = {
        title: cardForm.title,
        description: cardForm.description,
        due_date: cardForm.due_date || null,
        member_id: cardForm.member_id || null,
        tags: cardForm.tags
      };

      if (!selectedCard) {
        payload.board_list_id = cardListId;
      }

      const res = await fetch(url, {
        method: selectedCard ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await res.json();
      fetchBoardDetails(selectedBoardId);
      setShowCardModal(false);
      setSelectedCard(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Card
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      await fetch(`${API_BASE}/cards/${cardId}`, { method: 'DELETE' });
      fetchBoardDetails(selectedBoardId);
      setShowCardModal(false);
      setSelectedCard(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Card Trigger
  const openEditCardModal = (card) => {
    setSelectedCard(card);
    setCardForm({
      title: card.title,
      description: card.description || '',
      due_date: card.due_date ? card.due_date.substring(0, 16) : '',
      member_id: card.member_id || '',
      tags: card.tags ? card.tags.map(t => t.id) : []
    });
    setShowCardModal(true);
  };

  // Create Card Trigger
  const openCreateCardModal = (listId) => {
    setSelectedCard(null);
    setCardListId(listId);
    setCardForm({
      title: '',
      description: '',
      due_date: '',
      member_id: '',
      tags: []
    });
    setShowCardModal(true);
  };

  // Create Member
  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm)
      });
      if (res.ok) {
        await fetchMembers();
        setShowMemberModal(false);
        setMemberForm({ name: '', email: '', avatar_color: '#6366f1' });
      } else {
        const errData = await res.json();
        alert(errData.message || "Error creating member");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Tag selection in form
  const handleToggleFormTag = (tagId) => {
    const current = [...cardForm.tags];
    const index = current.indexOf(tagId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(tagId);
    }
    setCardForm({ ...cardForm, tags: current });
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      cardId: card.id,
      oldListId: card.board_list_id
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    try {
      const rawData = e.dataTransfer.getData('text/plain');
      if (!rawData) return;
      const { cardId, oldListId } = JSON.parse(rawData);
      
      if (oldListId === targetListId) return; // Dropped in same column, ignored for brevity

      // Move card to target list at the bottom (position is max + 1)
      const list = boardDetails.lists.find(l => l.id === targetListId);
      const newPos = list.cards ? list.cards.length + 1 : 1;

      // Optimistic state update for fluid visual drag
      const updatedLists = boardDetails.lists.map(l => {
        if (l.id === oldListId) {
          return { ...l, cards: l.cards.filter(c => c.id !== cardId) };
        }
        if (l.id === targetListId) {
          const cardToMove = boardDetails.lists.flatMap(lst => lst.cards).find(c => c.id === cardId);
          if (cardToMove) {
            const moved = { ...cardToMove, board_list_id: targetListId, position: newPos };
            return { ...l, cards: [...(l.cards || []), moved] };
          }
        }
        return l;
      });
      setBoardDetails({ ...boardDetails, lists: updatedLists });

      // Save to server
      await fetch(`${API_BASE}/cards/${cardId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_list_id: targetListId,
          position: newPos
        })
      });
      
      fetchBoardDetails(selectedBoardId); // Refresh state to be safe
    } catch (err) {
      console.error("Drop handling failed:", err);
    }
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const due = new Date(dateStr);
    return due < new Date();
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="kanban-app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-logo">AgileBoard</span>
          <span className="brand-tag">Forge 2 Qualifier</span>
        </div>
        <div className="header-actions">
          {boards.length === 0 && (
            <button className="btn btn-secondary" onClick={handleSeedDemo} disabled={seeding}>
              {seeding ? 'Seeding...' : '👉 Seed Demo Workspace'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
            + Add Member
          </button>
          <button className="btn btn-primary" onClick={() => setShowBoardModal(true)}>
            Create Board
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Board Selection */}
        <div className="board-select-bar">
          <div className="board-picker">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Active Board:</span>
            {boards.length > 0 ? (
              <select 
                className="select-dropdown" 
                value={selectedBoardId || ''} 
                onChange={(e) => setSelectedBoardId(Number(e.target.value))}
              >
                {boards.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No boards created yet</span>
            )}
          </div>
          {selectedBoardId && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowListModal(true)}>+ Add Column</button>
              <button className="btn btn-danger" onClick={handleDeleteBoard}>Delete Board</button>
            </div>
          )}
        </div>

        {/* Board Canvas */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Loading board swimlanes...</span>
          </div>
        ) : boardDetails ? (
          <div className="board-canvas">
            {boardDetails.lists && boardDetails.lists.map(list => (
              <div 
                key={list.id} 
                className="board-list"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, list.id)}
              >
                <div className="list-header">
                  <div className="list-title-area">
                    <h3 className="list-title">{list.name}</h3>
                    <span className="card-count-badge">{list.cards ? list.cards.length : 0}</span>
                  </div>
                  <button 
                    className="close-btn" 
                    style={{ fontSize: '1rem' }} 
                    onClick={async () => {
                      if (window.confirm(`Delete column "${list.name}" and all its cards?`)) {
                        await fetch(`${API_BASE}/lists/${list.id}`, { method: 'DELETE' });
                        fetchBoardDetails(selectedBoardId);
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="list-cards-container">
                  {list.cards && list.cards.map(card => {
                    const overdue = isOverdue(card.due_date);
                    return (
                      <div 
                        key={card.id} 
                        className={`kanban-card ${overdue ? 'overdue' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card)}
                        onClick={() => openEditCardModal(card)}
                      >
                        {card.tags && card.tags.length > 0 && (
                          <div className="card-tags">
                            {card.tags.map(t => (
                              <span 
                                key={t.id} 
                                className="tag-badge"
                                style={{ backgroundColor: t.color + '22', color: t.color, border: `1px solid ${t.color}44` }}
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <h4 className="card-title">{card.title}</h4>
                        {card.description && (
                          <p className="card-desc-preview">{card.description}</p>
                        )}
                        <div className="card-meta">
                          <div className={`card-due-date ${overdue ? 'alert' : ''}`}>
                            {card.due_date ? (
                              <>
                                <span>📅</span>
                                <span>{new Date(card.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                {overdue && <span style={{ marginLeft: '4px', fontSize: '0.65rem', textTransform: 'uppercase' }}>(Overdue)</span>}
                              </>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>No due date</span>
                            )}
                          </div>
                          {card.member && (
                            <div 
                              className="member-avatar" 
                              style={{ backgroundColor: card.member.avatar_color }}
                              title={card.member.name}
                            >
                              {getInitials(card.member.name)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(!list.cards || list.cards.length === 0) && (
                    <div className="placeholder-card kanban-card">
                      Drop cards here
                    </div>
                  )}
                </div>
                <div className="list-footer">
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => openCreateCardModal(list.id)}>
                    + Add Card
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Welcome to AgileBoard</h2>
            <p>Click "Create Board" to start a new workspace or click the button below to populate the workspace with pre-designed tasks and members.</p>
            <button className="btn btn-primary" onClick={handleSeedDemo} disabled={seeding}>
              {seeding ? 'Seeding...' : '🚀 Seed Demo Board'}
            </button>
          </div>
        )}
      </div>

      {/* Board Create Modal */}
      {showBoardModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCreateBoard}>
            <div className="modal-header">
              <h3 className="modal-title">Create Board</h3>
              <button type="button" className="close-btn" onClick={() => setShowBoardModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Board Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Sprint Planning, Project Beta" 
                value={newBoardName} 
                onChange={(e) => setNewBoardName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowBoardModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Board</button>
            </div>
          </form>
        </div>
      )}

      {/* List Create Modal */}
      {showListModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCreateList}>
            <div className="modal-header">
              <h3 className="modal-title">Add Column</h3>
              <button type="button" className="close-btn" onClick={() => setShowListModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Column Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Quality Assurance, Deployed" 
                value={newListName} 
                onChange={(e) => setNewListName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowListModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Column</button>
            </div>
          </form>
        </div>
      )}

      {/* Card Edit/Create Modal */}
      {showCardModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSaveCard}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedCard ? 'Edit Card' : 'Create Card'}</h3>
              <button type="button" className="close-btn" onClick={() => setShowCardModal(false)}>✕</button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={cardForm.title} 
                onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-textarea" 
                rows="3" 
                value={cardForm.description} 
                onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={cardForm.due_date} 
                onChange={(e) => setCardForm({ ...cardForm, due_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select 
                className="form-select"
                value={cardForm.member_id}
                onChange={(e) => setCardForm({ ...cardForm, member_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tag-selector-grid">
                {tags.map(t => {
                  const isSelected = cardForm.tags.includes(t.id);
                  return (
                    <div 
                      key={t.id} 
                      className={`tag-select-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleFormTag(t.id)}
                    >
                      <span className="tag-color-circle" style={{ backgroundColor: t.color }} />
                      <span>{t.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <div>
                {selectedCard && (
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={() => handleDeleteCard(selectedCard.id)}
                  >
                    Delete Card
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCardModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{selectedCard ? 'Save Changes' : 'Create Card'}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Member Create Modal */}
      {showMemberModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCreateMember}>
            <div className="modal-header">
              <h3 className="modal-title">Add Board Member</h3>
              <button type="button" className="close-btn" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. John Doe"
                value={memberForm.name} 
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="e.g. john@example.com"
                value={memberForm.email} 
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Avatar Color</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'].map(color => (
                  <div 
                    key={color} 
                    onClick={() => setMemberForm({ ...memberForm, avatar_color: color })}
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      backgroundColor: color, 
                      cursor: 'pointer',
                      border: memberForm.avatar_color === color ? '2px solid white' : '2px solid transparent',
                      boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                    }} 
                  />
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Member</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
