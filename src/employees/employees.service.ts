import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(data: any, organizationId: string) {
    return this.prisma.employee.create({
      data: { ...data, organizationId },
      include: { user: true },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.employee.findMany({
      where: { user: { organizationId }, isActive: true },
      include: { user: { select: { fullName: true, email: true } } },
    });
  }

  findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: { user: true, attendance: true, targets: true },
    });
  }

  update(id: string, data: any) {
    return this.prisma.employee.update({ where: { id }, data });
  }

  async recordAttendance(employeeId: string, date: Date, checkIn?: Date, checkOut?: Date) {
    return this.prisma.employeeAttendance.upsert({
      where: { employeeId_date: { employeeId, date } },
      create: { employeeId, date, checkIn, checkOut, status: 'PRESENT' },
      update: { checkIn, checkOut },
    });
  }

  async setTarget(employeeId: string, month: Date, target: number) {
    return this.prisma.employeeTarget.upsert({
      where: { employeeId_month: { employeeId, month } },
      create: { employeeId, month, target },
      update: { target },
    });
  }

  async updateAchievement(employeeId: string, month: Date, achieved: number, commission: number) {
    return this.prisma.employeeTarget.update({
      where: { employeeId_month: { employeeId, month } },
      data: { achieved, commission },
    });
  }
}
