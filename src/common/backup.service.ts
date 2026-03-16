import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(private prisma: PrismaService) {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(organizationId: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${organizationId}-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);

      this.logger.log(`Creating backup for organization ${organizationId}...`);

      // Fetch all organization data
      const data = {
        organization: await this.prisma.organization.findUnique({
          where: { id: organizationId },
        }),
        branches: await this.prisma.branch.findMany({
          where: { organizationId },
        }),
        users: await this.prisma.user.findMany({
          where: { organizationId },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            branchId: true,
            isActive: true,
            createdAt: true,
          },
        }),
        products: await this.prisma.product.findMany({
          where: { organizationId },
        }),
        customers: await this.prisma.customer.findMany({
          where: { organizationId },
        }),
        suppliers: await this.prisma.supplier.findMany({
          where: { organizationId },
        }),
        sales: await this.prisma.sale.findMany({
          where: { organizationId },
          include: { items: true },
        }),
        purchases: await this.prisma.purchase.findMany({
          where: { organizationId },
          include: { items: true },
        }),
        stockTransactions: await this.prisma.stockTransaction.findMany({
          where: { organizationId },
        }),
        expenses: await this.prisma.expense.findMany({
          where: { organizationId },
        }),
        metadata: {
          backupDate: new Date().toISOString(),
          version: '1.0',
          organizationId,
        },
      };

      // Write to file
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

      this.logger.log(`✅ Backup created successfully: ${filename}`);
      return filepath;
    } catch (error) {
      this.logger.error(`❌ Backup failed: ${error.message}`);
      throw error;
    }
  }

  async listBackups(organizationId?: string): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.backupDir);
      
      if (organizationId) {
        return files.filter(file => 
          file.startsWith(`backup-${organizationId}-`) && file.endsWith('.json')
        );
      }

      return files.filter(file => 
        file.startsWith('backup-') && file.endsWith('.json')
      );
    } catch (error) {
      this.logger.error(`Failed to list backups: ${error.message}`);
      return [];
    }
  }

  async getBackupInfo(filename: string): Promise<any> {
    try {
      const filepath = path.join(this.backupDir, filename);
      
      if (!fs.existsSync(filepath)) {
        throw new Error('Backup file not found');
      }

      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      
      return {
        filename,
        metadata: data.metadata,
        stats: {
          products: data.products?.length || 0,
          customers: data.customers?.length || 0,
          suppliers: data.suppliers?.length || 0,
          sales: data.sales?.length || 0,
          purchases: data.purchases?.length || 0,
          users: data.users?.length || 0,
          branches: data.branches?.length || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get backup info: ${error.message}`);
      throw error;
    }
  }

  async deleteOldBackups(daysToKeep: number = 30): Promise<number> {
    try {
      const files = fs.readdirSync(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let deletedCount = 0;

      for (const file of files) {
        if (!file.startsWith('backup-') || !file.endsWith('.json')) {
          continue;
        }

        const filepath = path.join(this.backupDir, file);
        const stats = fs.statSync(filepath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filepath);
          deletedCount++;
          this.logger.log(`Deleted old backup: ${file}`);
        }
      }

      this.logger.log(`Cleanup complete: ${deletedCount} old backups deleted`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to delete old backups: ${error.message}`);
      throw error;
    }
  }
}
