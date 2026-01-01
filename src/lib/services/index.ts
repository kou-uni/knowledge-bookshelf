import { ProjectService } from './ProjectService';
import { SessionService } from './SessionService';
import { TemplateService } from './TemplateService';
import { KnowledgeService } from './KnowledgeService';

export function getServices() {
    return {
        projectService: new ProjectService(),
        sessionService: new SessionService(),
        templateService: new TemplateService(),
        knowledgeService: new KnowledgeService(),
    };
}
