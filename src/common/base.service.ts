import { PrismaService } from './prisma.service';

export abstract class BaseService<T> {
  constructor(
    protected prisma: PrismaService,
    protected modelName: string,
  ) {}

  async findAll(organizationId: string, options?: any) {
    return this.prisma[this.modelName].findMany({
      where: { organizationId, ...options?.where },
      ...options,
    });
  }

  async findOne(id: string, organizationId?: string) {
    const where: any = { id };
    if (organizationId) where.organizationId = organizationId;
    
    return this.prisma[this.modelName].findFirst({ where });
  }

  async create(data: any, organizationId: string, createdById?: string) {
    return this.prisma[this.modelName].create({
      data: {
        ...data,
        organizationId,
        ...(createdById && { createdById }),
      },
    });
  }

  async update(id: string, data: any, organizationId?: string) {
    const where: any = { id };
    if (organizationId) where.organizationId = organizationId;

    return this.prisma[this.modelName].update({
      where,
      data,
    });
  }

  async delete(id: string, organizationId?: string) {
    const where: any = { id };
    if (organizationId) where.organizationId = organizationId;

    return this.prisma[this.modelName].delete({ where });
  }

  async deactivate(id: string, organizationId?: string) {
    return this.update(id, { isActive: false }, organizationId);
  }

  async activate(id: string, organizationId?: string) {
    return this.update(id, { isActive: true }, organizationId);
  }
}
