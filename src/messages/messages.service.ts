import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  create(senderId: string, receiverId: string, message: string, organizationId: string) {
    return this.prisma.message.create({
      data: { organizationId, senderId, receiverId, message },
    });
  }

  findAll(organizationId: string, userId: string) {
    return this.prisma.message.findMany({
      where: {
        organizationId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  findConversation(userId1: string, userId2: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  markAsRead(id: string) {
    return this.prisma.message.update({
      where: { id },
      data: { isRead: true },
    });
  }

  getUnreadCount(userId: string) {
    return this.prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });
  }
}
