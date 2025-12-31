'use client';

import { KnowledgeItem } from '@/lib/types';
import { Type, AlertCircle, Image, MessageCircle } from '@geist-ui/icons';

interface KnowledgeListProps {
    items: KnowledgeItem[];
}

export function KnowledgeList({ items }: KnowledgeListProps) {
    if (!items || items.length === 0) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accents-5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Extracted Wisdom ({items.length})
            </div>
            {items.map(item => <KnowledgeItemCard key={item.id} item={item} />)}
        </div>
    );
}

function KnowledgeItemCard({ item }: { item: KnowledgeItem }) {
    return (
        <div className="geist-card" style={{
            padding: '12px 0px',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--accents-2)',
            borderRadius: 0,
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--geist-foreground)' }}>
                    {item.content}
                </div>
                {item.tags && item.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {item.tags.map((tag, i) => (
                            <span key={i} style={{
                                fontSize: '0.75rem',
                                color: 'var(--accents-3)',
                                letterSpacing: '0.02em',
                                fontFamily: 'var(--font-mono)'
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
