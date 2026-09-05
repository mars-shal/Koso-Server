import { Database } from '../model/database';
import { logger } from '../utils/logger';

export interface Milestone {
  id?: string;
  projectId: string;
  name: string;
  dueDate: string;
  status: 'complete' | 'incomplete';
  description?: string;
}

class MilestoneController {
  private db: Database = new Database();

  public async createMilestone(milestone: Milestone) {
    try {
      const res = await this.db.insert({
        table: 'Milestones',
        data: {
          project_id: milestone.projectId,
          name: milestone.name,
          due_date: milestone.dueDate,
          status: milestone.status,
          description: milestone.description,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async updateMilestone(milestone: Milestone) {
    try {
      const res = await this.db.insert({
        table: 'Milestones',
        data: {
          id: milestone.id,
          project_id: milestone.projectId,
          name: milestone.name,
          due_date: milestone.dueDate,
          status: milestone.status,
          description: milestone.description,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async deleteMilestone(milestone: Milestone) {
    try {
      const res = await this.db.delete({
        table: 'Milestones',
        data: {
          id: milestone.id,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getMilestone(milestone: Milestone) {
    try {
      const res = await this.db.read({
        table: 'Milestones',
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getAllMilestones() {
    try {
      const res = await this.db.read({
        table: 'Milestones',
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getMilestonesByProjectId(projectId: string) {
    try {
      const res = await this.db.read({
        table: 'Milestones',
        data: { project_id: projectId },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }
}

export default MilestoneController;
