import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionClient } from '@/components/SessionClient'
import { Session } from '@/lib/types'

// Mock child components
vi.mock('@/components/InputManager', () => ({
    InputManager: ({ inputs, onAdd, onDelete }: any) => (
        <div data-testid="input-manager">
            {/* InputManager strictly handles NEW inputs, not existing ones in SessionClient logic */}
            <button onClick={() => onAdd(new FormData())} data-testid="add-input">Add Input</button>
        </div>
    )
}))

vi.mock('@/components/sections', () => ({
    SessionAnalysisSection: () => <div data-testid="analysis-section">Analysis</div>,
    SessionStrategySection: () => <div data-testid="strategy-section">Strategy</div>
}))

// Mock server actions
const mockAddInput = vi.fn().mockResolvedValue({ success: true, data: { sessionId: 's1' } })
const mockDeleteInput = vi.fn().mockResolvedValue({ success: true, data: { inputId: 'i1', deletedCount: 1 } })

vi.mock('@/app/actions/session', () => ({
    addSessionInput: (...args: any[]) => mockAddInput(...args),
    deleteSessionInputAction: (...args: any[]) => mockDeleteInput(...args),
    updateSessionDateAction: vi.fn(),
    updateSessionAction: vi.fn(),
    generateVoiceSession: vi.fn()
}))

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn()
    })
}))

// Mock ArtifactCard if used (it is imported in SessionClient but not used in this test scenario directly, but good to mock)
vi.mock('@/components/ArtifactCard', () => ({
    ArtifactCard: () => <div>Artifact</div>
}))

describe('SessionClient', () => {
    const mockSession: Session = {
        id: 's1',
        projectId: 'p1',
        sessionNumber: 1,
        title: 'Test Session',
        inputs: [
            { id: 'i1', title: 'Existing Input', type: 'text', sessionId: 's1', content: 'Some content', createdAt: new Date().toISOString() }
        ],
        outputs: [],
        knowledgeItems: []
    }

    const mockProject = {
        id: 'p1',
        title: 'Test Project',
        sessions: [],
        type: 'classic' as const,
        createdAt: ''
    }

    it('should render session title and inputs (S-01)', () => {
        render(<SessionClient session={mockSession} project={mockProject} />)
        expect(screen.getByDisplayValue('Test Session')).toBeInTheDocument()
    })

    it('should call delete action when input is deleted (S-02)', async () => {
        render(<SessionClient session={mockSession} project={mockProject} />)

        // InputCard is rendered directly. Find the delete ("✕") button.
        const deleteBtn = screen.getByText('✕')
        fireEvent.click(deleteBtn)

        // Now it should show confirmation text
        const confirmBtn = screen.getByText('CONFIRM DELETE')
        fireEvent.click(confirmBtn)


        // Wait for server action call
        await waitFor(() => {
            expect(mockDeleteInput).toHaveBeenCalledWith('p1', 's1', 'i1')
        })
    })

    it('should show analysis and strategy sections (S-04)', () => {
        render(<SessionClient session={mockSession} project={mockProject} />)
        expect(screen.getByTestId('analysis-section')).toBeInTheDocument()
        expect(screen.getByTestId('strategy-section')).toBeInTheDocument()
    })
})
