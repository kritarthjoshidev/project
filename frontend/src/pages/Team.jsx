import { Users, Mail, Briefcase } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/mockData';
import Topbar from '../components/Topbar';
import { useTasks } from '../hooks/useTasks';

export default function Team() {
  const { tasks, loading } = useTasks();

  return (
    <>
      <Topbar title="Team" subtitle="Your project collaborators" onCreateTask={() => {}} searchValue="" onSearchChange={() => {}} />
      <main className="page-content" id="team-page">
        <div style={{ marginBottom: 24 }}>
          <div className="section-title">Team Members</div>
          <div className="section-subtitle">
            {loading ? 'Loading team stats…' : `${TEAM_MEMBERS.length} active members`}
          </div>
        </div>

        {tasks.length === 0 && !loading && (
          <div
            style={{
              padding: '14px 20px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              marginBottom: 20,
              fontSize: '0.85rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>💡</span>
            <span>
              No tasks have been assigned to team members in your workspace yet. Create tasks on the Dashboard or load sample demo tasks to track member workload and completion rates.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {TEAM_MEMBERS.map((member) => {
            const memberTasks = tasks.filter((t) => t.assignee?.id === member.id);
            const done = memberTasks.filter((t) => t.status === 'Done').length;
            return (
              <div key={member.id} className="stat-card" style={{ '--card-accent': member.color, cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', background: member.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                    boxShadow: `0 4px 12px ${member.color}44`
                  }}>
                    {member.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display:'flex', alignItems:'center', gap:4 }}>
                      <Briefcase size={11} /> Developer
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:16, marginBottom:12 }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--text-primary)' }}>{memberTasks.length}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)' }}>Assigned</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.2rem', fontWeight:800, color:'#10b981' }}>{done}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)' }}>Completed</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--color-primary)' }}>
                      {memberTasks.length ? Math.round((done / memberTasks.length) * 100) : 0}%
                    </div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)' }}>Rate</div>
                  </div>
                </div>
                <div style={{ height:4, background:'#f1f5f9', borderRadius:2 }}>
                  <div style={{
                    height:'100%', background: member.color, borderRadius:2,
                    width: `${memberTasks.length ? Math.round((done/memberTasks.length)*100) : 0}%`,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
