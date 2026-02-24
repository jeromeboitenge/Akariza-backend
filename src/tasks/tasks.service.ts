import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(data: any, organizationId: string, userId: string) {
    return this.prisma.task.create({
      data: {
        organizationId,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        assignedBy: userId,
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }

  findAll(organizationId: string, userId?: string) {
    return this.prisma.task.findMany({
      where: { organizationId, ...(userId && { assignedTo: userId }) },
      include: { comments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { comments: true },
    });
  }

  update(id: string, data: any) {
    return this.prisma.task.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  addComment(taskId: string, userId: string, comment: string) {
    return this.prisma.taskComment.create({
      data: { taskId, userId, comment },
    });
  }

  complete(id: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }
}
