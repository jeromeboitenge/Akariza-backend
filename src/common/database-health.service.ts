import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);
  private isHealthy = true;
  private lastCheckTime: Date | null = null;
  private consecutiveFailures = 0;
  private readonly maxConsecutiveFailures = 3;

  constructor(private prisma: PrismaService) {
    // Start periodic health checks
    this.startHealthChecks();
  }

  private startHealthChecks() {
    // Check database health every 30 seconds
    setInterval(() => {
      this.checkDatabaseHealth();
    }, 30000);
  }

  async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Simple query to check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      this.lastCheckTime = new Date();
      
      // Reset failure counter on success
      if (this.consecutiveFailures > 0) {
        this.logger.log('✅ Database connection restored');
        this.consecutiveFailures = 0;
      }
      
      this.isHealthy = true;
      return true;
    } catch (error) {
      this.consecutiveFailures++;
      this.logger.error(
        `❌ Database health check failed (${this.consecutiveFailures}/${this.maxConsecutiveFailures}): ${error.message}`
      );

      // Mark as unhealthy after consecutive failures
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        this.isHealthy = false;
        this.logger.error('🚨 Database marked as unhealthy - multiple consecutive failures');
      }

      return false;
    }
  }

  async getDatabaseStats() {
    try {
      // Get connection pool stats
      const stats = await this.prisma.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      return {
        healthy: this.isHealthy,
        lastCheck: this.lastCheckTime,
        consecutiveFailures: this.consecutiveFailures,
        connectionStats: stats[0] || null,
      };
    } catch (error) {
      this.logger.error(`Failed to get database stats: ${error.message}`);
      return {
        healthy: false,
        lastCheck: this.lastCheckTime,
        consecutiveFailures: this.consecutiveFailures,
        error: error.message,
      };
    }
  }

  getHealthStatus() {
    return {
      healthy: this.isHealthy,
      lastCheck: this.lastCheckTime,
      consecutiveFailures: this.consecutiveFailures,
    };
  }
}
