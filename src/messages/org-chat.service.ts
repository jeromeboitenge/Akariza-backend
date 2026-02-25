import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class OrgChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(organizationId: string, senderId: string, message: string, recipientId?: string) {
    return this.prisma.message.create({
      data: {
        organizationId,
        senderId,
        receiverId: recipientId,
        message,
        isRead: false,
      },
      include: {
        sender: { select: { fullName: true, email: true } },
        receiver: { select: { fullName: true, email: true } },
      },
    });
  }

  async getOrgMessages(organizationId: string, limit = 50) {
    return this.prisma.message.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: { select: { fullName: true, email: true, role: true } },
        receiver: { select: { fullName: true, email: true } },
      },
    });
  }

  async getConversation(organizationId: string, userId: string, otherUserId: string) {
    return this.prisma.message.findMany({
      where: {
        organizationId,
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { fullName: true, email: true } },
        receiver: { select: { fullName: true, email: true } },
      },
    });
  }

  async getOrgUsers(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (message?.receiverId === userId) {
      return this.prisma.message.update({
        where: { id: messageId },
        data: { isRead: true },
      });
    }
    return message;
  }

  async getUnreadCount(organizationId: string, userId: string) {
    return this.prisma.message.count({
      where: {
        organizationId,
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (message?.senderId === userId) {
      return this.prisma.message.delete({ where: { id: messageId } });
    }
    throw new Error('Unauthorized');
  }
}
