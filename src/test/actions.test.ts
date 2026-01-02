import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProjectSafe } from '@/app/actions/project'
import { deleteSessionSafe } from '@/app/actions/session'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock utils module directly
const mockProjectService = {
    createProject: vi.fn().mockResolvedValue({ id: 'test-project-id', title: 'Test Project' }),
}
const mockSessionService = {
    deleteSession: vi.fn().mockResolvedValue({ deleted: 1 }),
}

vi.mock('@/app/actions/utils', () => ({
    getServices: () => ({
        projectService: mockProjectService,
        sessionService: mockSessionService,
        templateService: {},
        knowledgeService: {}
    })
}))

describe('Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createProjectSafe', () => {
        it('should create a project successfully (A-01)', async () => {
            const result = await createProjectSafe({ title: 'Test Project', type: 'classic' })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data?.id).toBe('test-project-id')
            }
            expect(mockProjectService.createProject).toHaveBeenCalled()
        })

        it('should return validation error for empty title (A-02)', async () => {
            const result = await createProjectSafe({ title: '', type: 'classic' })
            // Debugging
            if (result.success) console.log("A-02 Failed: Validation passed incorrectly", result)

            expect(result.success).toBe(false)
            expect(result.fieldErrors).toBeDefined()
            expect(result.fieldErrors?.title).toBeDefined()
            expect(mockProjectService.createProject).not.toHaveBeenCalled()
        })
    })

    describe('deleteSessionSafe', () => {
        it('should return deleted count on success (A-03)', async () => {
            const input = {
                projectId: 'e012c41c-b17f-432d-933e-001234567890',
                sessionId: 'c86b0e7f-f8f9-4958-9b20-b56221d05c33'
            }
            const result = await deleteSessionSafe(input)

            if (!result.success) console.log("A-03 Failed: Action returned error", result)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data?.deletedCount).toBe(1)
            }
            expect(mockSessionService.deleteSession).toHaveBeenCalledWith(
                'e012c41c-b17f-432d-933e-001234567890',
                'c86b0e7f-f8f9-4958-9b20-b56221d05c33'
            )
        })
    })
})
