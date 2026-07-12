import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const Maintenance = () => {
  const columns = [
    {
      title: 'Pending',
      cards: [{ id: 'AF-0062', name: 'Projector Bulb', desc: 'Not turning on', tagColor: 'bg-primary' }],
    },
    {
      title: 'Approved',
      cards: [{ id: 'AF-003', name: 'AC Unit', desc: 'Noisy compressor', tagColor: 'bg-primary' }],
    },
    {
      title: 'Technician Assigned',
      cards: [{ id: 'AF-0078', name: 'Forklift', desc: 'Tech: R. Varma', tagColor: 'bg-primary' }],
    },
    {
      title: 'In Progress',
      cards: [{ id: 'AF-897', name: 'Printer Jam', desc: 'Parts ordered', tagColor: 'bg-primary' }],
    },
    {
      title: 'Resolved',
      cards: [{ id: 'AF-873', name: 'Chair Repair', desc: 'Resolved 7 Jul', tagColor: 'bg-accent-lime/20 border-accent-lime text-accent-lime' }],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Informative helper banner */}
      <div className="bg-ink-deep border border-hairline-violet rounded-lg p-4 flex items-center justify-between">
        <div className="text-xs text-on-dark-muted flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-lime" />
          <span>Approving a maintenance card moves the asset status to <strong>Under Maintenance</strong>. Resolving returning it to <strong>Available</strong>.</span>
        </div>
        <button className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors">
          + Request Maintenance
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((column, idx) => (
          <div key={idx} className="bg-ink-deep border border-hairline-violet rounded-lg p-4 space-y-4">
            <div className="border-b border-hairline-violet pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">{column.title}</span>
            </div>
            
            <div className="space-y-3">
              {column.cards.map((card) => (
                <div key={card.id} className={`p-4 rounded-md border border-hairline-violet bg-primary space-y-2 hover:border-accent-violet transition-colors cursor-grab active:cursor-grabbing ${card.tagColor}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-accent-lime">{card.id}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{card.name}</h4>
                  <p className="text-xs text-on-dark-muted">{card.desc}</p>
                  
                  {column.title !== 'Resolved' && (
                    <div className="flex justify-end pt-2">
                      <button className="text-xs text-accent-violet flex items-center gap-1 hover:underline">
                        Advance <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {column.cards.length === 0 && (
                <div className="text-center py-8 text-xs text-on-dark-muted border border-dashed border-hairline-violet/30 rounded-md">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Maintenance;
