import { ProjectService } from '@/lib/services/ProjectService';
import { SessionService } from '@/lib/services/SessionService';
import { TemplateService } from '@/lib/services/TemplateService';
import { KnowledgeService } from '@/lib/services/KnowledgeService';

export function getServices() {
    return {
        projectService: new ProjectService(),
        sessionService: new SessionService(),
        templateService: new TemplateService(),
        knowledgeService: new KnowledgeService(),
    };
}
