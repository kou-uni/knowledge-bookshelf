import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProjectDetailClient } from '@/components/ProjectDetailClient'
import { Project } from '@/lib/types'

// Mock Server Actions
const mockCreateSession = vi.fn().mockResolvedValue({ success: true, data: {} })
const mockDeleteSession = vi.fn().mockResolvedValue({ success: true })
const mockUpdateProject = vi.fn().mockResolvedValue({ success: true })
const mockUpdateSession = vi.fn().mockResolvedValue({ success: true }) // Used in SessionTile

vi.mock('@/app/actions', () => ({
    createSessionAction: (...args: any[]) => mockCreateSession(...args),
    deleteSessionAction: (...args: any[]) => mockDeleteSession(...args),
    updateProjectAction: (...args: any[]) => mockUpdateProject(...args),
    updateSessionAction: (...args: any[]) => mockUpdateSession(...args),
}))

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn()
    })
}))

// Mock Sections
vi.mock('@/components/sections', () => ({
    ProjectStrategySection: () => <div data-testid="project-strategy">Project Strategy</div>,
    ProjectAnalyticsSection: () => <div data-testid="project-analytics">Project Analytics</div>
}))

// Mock InlineTextEdit to simplify testing save triggers
vi.mock('@/components/InlineTextEdit', () => ({
    InlineTextEdit: ({ initialValue, onSave, placeholder }: any) => (
        <div data-testid="inline-edit">
            <span>{initialValue || placeholder}</span>
            <button onClick={() => onSave && onSave('Updated Value')}>Save</button>
        </div>
    )
}))

// Mock UI components
vi.mock('@/components/ui', () => ({
    NavButton: ({ label }: any) => <button>{label}</button>
}))

describe('ProjectDetailClient', () => {
    const mockCreatedDate = new Date('2024-01-01T00:00:00Z').toISOString()

    const mockProject: Project = {
        id: 'p1',
        title: 'Test Project',
        type: 'classic',
        description: 'Desc',
        createdAt: mockCreatedDate,
        sessions: [
            { id: 's1', projectId: 'p1', sessionNumber: 1, title: 'Session 1', inputs: [], outputs: [] },
            { id: 's2', projectId: 'p1', sessionNumber: 2, title: 'Session 2', inputs: [], outputs: [] }
        ],
        outputs: []
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render project title and creation date (P-01)', () => {
        render(<ProjectDetailClient project={mockProject} />)
        expect(screen.getByText('Test Project')).toBeInTheDocument()

        expect(screen.getByText(/STARTED/)).toBeInTheDocument()
        expect(screen.getByText('2 SESSIONS')).toBeInTheDocument()
    })

    it('should render session tiles (P-02)', () => {
        render(<ProjectDetailClient project={mockProject} />)
        expect(screen.getByText('Session 1')).toBeInTheDocument()
        expect(screen.getByText('Session 2')).toBeInTheDocument()
    })

    it('should call createSessionAction when new session button is clicked (P-03)', async () => {
        render(<ProjectDetailClient project={mockProject} />)
        const createBtn = screen.getByText('+ NEW SESSION')
        fireEvent.click(createBtn)

        await waitFor(() => {
            expect(mockCreateSession).toHaveBeenCalledWith('p1')
        })
    })

    it('should call deleteSessionAction when delete button is clicked and confirmed (P-04)', async () => {
        // Mock window.confirm
        const originalConfirm = window.confirm
        window.confirm = vi.fn(() => true)

        render(<ProjectDetailClient project={mockProject} />)

        const deleteButtons = screen.getAllByTitle('Delete Session')
        expect(deleteButtons.length).toBe(2)

        fireEvent.click(deleteButtons[0]) // Delete Session 1

        expect(window.confirm).toHaveBeenCalled()
        await waitFor(() => {
            expect(mockDeleteSession).toHaveBeenCalledWith('p1', 's1')
        })

        window.confirm = originalConfirm
    })

    it('should call updateProjectAction when title is edited', async () => {
        render(<ProjectDetailClient project={mockProject} />)

        const saveButtons = screen.getAllByText('Save')
        fireEvent.click(saveButtons[0])

        await waitFor(() => {
            expect(mockUpdateProject).toHaveBeenCalledWith('p1', { title: 'Updated Value' })
        })
    })
})
