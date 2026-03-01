import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

/**
 * MessagesService - Handles organizational messaging
 * 
 * NON-REPUDIATION POLICY:
 * - Messages CANNOT be deleted (audit trail requirement)
 * - Messages CANNOT be edited (integrity requirement)
 * - All messages are permanently stored with timestamps
 * - Sender/receiver information is immutable
 * - Only mark as read is allowed
 */
@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, organizationId: string, senderId: string, senderRole: string, senderBranchId: string) {
    const { targetType, receiverId, receiverBranchId, message } = data;

    // Validate permissions based on role
    if (targetType === 'ALL_BRANCHES' && senderRole !== 'BOSS' && senderRole !== 'SYSTEM_ADMIN') {
      throw new Error('Only BOSS can message all branches');
    }

    if (targetType === 'BRANCH') {
      // Manager can only message their own branches
      if (senderRole === 'MANAGER') {
        const branch = await this.prisma.branch.findUnique({
          where: { id: receiverBranchId },
          include: { users: true }
        });
        
        // Check if manager belongs to this branch
        const managerInBranch = branch?.users.some(u => u.id === senderId);
        if (!managerInBranch) {
          throw new Error('Manager can only message their own branch');
        }
      }
    }

    return this.prisma.message.create({
      data: {
        organizationId,
        senderId,
        senderBranchId,
        receiverId: receiverId || null,
        receiverBranchId: receiverBranchId || null,
        targetType,
        message,
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
        senderBranch: { select: { id: true, name: true } },
        receiverBranch: { select: { id: true, name: true } }
      }
    });
  }

  async findAll(organizationId: string, userId: string, userRole: string, userBranchId: string) {
    // BOSS sees all messages in organization
    if (userRole === 'BOSS' || userRole === 'SYSTEM_ADMIN') {
      return this.prisma.message.findMany({
        where: { organizationId },
        include: {
          sender: { select: { id: true, fullName: true, role: true } },
          receiver: { select: { id: true, fullName: true, role: true } },
          senderBranch: { select: { id: true, name: true } },
          receiverBranch: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    // MANAGER sees messages in their branch
    if (userRole === 'MANAGER') {
      return this.prisma.message.findMany({
        where: {
          organizationId,
          OR: [
            { senderId: userId },
            { receiverId: userId },
            { receiverBranchId: userBranchId },
            { senderBranchId: userBranchId }
          ],
        },
        include: {
          sender: { select: { id: true, fullName: true, role: true } },
          receiver: { select: { id: true, fullName: true, role: true } },
          senderBranch: { select: { id: true, name: true } },
          receiverBranch: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    // CASHIER sees only their own messages
    return this.prisma.message.findMany({
      where: {
        organizationId,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
        senderBranch: { select: { id: true, name: true } },
        receiverBranch: { select: { id: true, name: true } }
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
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } }
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

  async getUnreadCount(userId: string, userRole: string, userBranchId: string) {
    if (userRole === 'CASHIER') {
      return this.prisma.message.count({
        where: { receiverId: userId, isRead: false },
      });
    }

    // Manager sees unread for their branch
    if (userRole === 'MANAGER') {
      return this.prisma.message.count({
        where: {
          OR: [
            { receiverId: userId, isRead: false },
            { receiverBranchId: userBranchId, isRead: false }
          ]
        },
      });
    }

    // Boss sees all unread
    return this.prisma.message.count({
      where: { isRead: false },
    });
  }
}
