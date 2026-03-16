import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditLoggerService } from '../common/audit-logger.service';

@Injectable()
export class CostManagementService {
  constructor(
    private prisma: PrismaService,
    private auditLogger: AuditLoggerService,
  ) {}

  /**
   * Calculate and update product cost based on purchase history
   * Uses weighted average cost method (AVCO)
   */
  async updateProductCostFromPurchase(
    tx: any, // Prisma transaction
    organizationId: string,
    productId: string,
    newPurchaseQuantity: number,
    newPurchaseCost: number,
    userId: string,
    purchaseId: string,
  ) {
    // Get current product data
    const product = await tx.product.findFirst({
      where: { id: productId, organizationId },
    });

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const currentCost = product.costPrice;
    const currentStock = product.currentStock;

    // Calculate new average cost using weighted average method
    // Formula: ((Current Stock × Current Cost) + (New Quantity × New Cost)) / (Current Stock + New Quantity)
    const totalCurrentValue = currentStock * currentCost;
    const newPurchaseValue = newPurchaseQuantity * newPurchaseCost;
    const totalQuantity = currentStock + newPurchaseQuantity;
    
    let newAverageCost = currentCost; // Default to current cost
    
    if (totalQuantity > 0) {
      newAverageCost = (totalCurrentValue + newPurchaseValue) / totalQuantity;
    }

    // Round to 2 decimal places for currency
    newAverageCost = Math.round(newAverageCost * 100) / 100;

    // Check if cost has changed significantly (more than 1 RWF difference)
    const costDifference = Math.abs(newAverageCost - currentCost);
    const significantChange = costDifference >= 1;

    if (significantChange) {
      // Update product cost
      await tx.product.update({
        where: { id: productId },
        data: { costPrice: newAverageCost },
      });

      // Log the cost change
      await this.logCostChange(
        tx,
        organizationId,
        productId,
        product.name,
        currentCost,
        newAverageCost,
        newPurchaseQuantity,
        newPurchaseCost,
        userId,
        purchaseId,
      );

      console.log(`📊 Cost updated for ${product.name}: ${currentCost} → ${newAverageCost} RWF`);
      
      return {
        updated: true,
        oldCost: currentCost,
        newCost: newAverageCost,
        difference: newAverageCost - currentCost,
      };
    }

    return {
      updated: false,
      oldCost: currentCost,
      newCost: currentCost,
      difference: 0,
    };
  }

  /**
   * Log cost changes to audit log
   */
  private async logCostChange(
    tx: any,
    organizationId: string,
    productId: string,
    productName: string,
    oldCost: number,
    newCost: number,
    purchaseQuantity: number,
    purchaseCost: number,
    userId: string,
    purchaseId: string,
  ) {
    const details = {
      productId,
      productName,
      costChange: {
        from: oldCost,
        to: newCost,
        difference: newCost - oldCost,
        percentageChange: oldCost > 0 ? ((newCost - oldCost) / oldCost * 100).toFixed(2) : 0,
      },
      trigger: {
        type: 'PURCHASE',
        purchaseId,
        purchaseQuantity,
        purchaseCost,
      },
      calculation: {
        method: 'WEIGHTED_AVERAGE',
        description: 'Cost updated using weighted average cost method based on purchase history',
      },
      timestamp: new Date().toISOString(),
    };

    await tx.auditLog.create({
      data: {
        organizationId,
        userId,
        action: 'COST_UPDATE',
        resource: 'PRODUCT',
        resourceId: productId,
        details,
      },
    });
  }

  /**
   * Get cost history for a product
   */
  async getProductCostHistory(organizationId: string, productId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        organizationId,
        resource: 'PRODUCT',
        resourceId: productId,
        action: 'COST_UPDATE',
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Last 50 cost changes
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
  }

  /**
   * Calculate cost statistics for a product
   */
  async getProductCostStatistics(organizationId: string, productId: string) {
    // Get recent purchase items for this product
    const recentPurchases = await this.prisma.purchaseItem.findMany({
      where: {
        productId,
        purchase: { organizationId },
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Last 10 purchases
      include: {
        purchase: {
          select: { createdAt: true, supplier: { select: { name: true } } },
        },
      },
    });

    if (recentPurchases.length === 0) {
      return null;
    }

    const costs = recentPurchases.map(p => p.costPrice);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;

    return {
      recentPurchases: recentPurchases.length,
      minCost: Math.round(minCost * 100) / 100,
      maxCost: Math.round(maxCost * 100) / 100,
      avgCost: Math.round(avgCost * 100) / 100,
      costVariation: Math.round((maxCost - minCost) * 100) / 100,
      lastPurchase: recentPurchases[0],
    };
  }
}