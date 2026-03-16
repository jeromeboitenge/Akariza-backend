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
   * The product's costPrice field will be updated to reflect the new average cost
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

    const currentCost = product.costPrice; // This is the current average cost
    const currentStock = product.currentStock;

    // Calculate new weighted average cost
    // Formula: ((Current Stock × Current Average Cost) + (New Quantity × New Purchase Cost)) / (Current Stock + New Quantity)
    const totalCurrentValue = currentStock * currentCost;
    const newPurchaseValue = newPurchaseQuantity * newPurchaseCost;
    const totalQuantity = currentStock + newPurchaseQuantity;
    
    let newAverageCost = currentCost; // Default to current average cost
    
    if (totalQuantity > 0) {
      newAverageCost = (totalCurrentValue + newPurchaseValue) / totalQuantity;
    }

    // Round to 2 decimal places for currency
    newAverageCost = Math.round(newAverageCost * 100) / 100;

    // Check if cost has changed significantly (more than 1 RWF difference)
    const costDifference = Math.abs(newAverageCost - currentCost);
    const significantChange = costDifference >= 1;

    if (significantChange) {
      // Update product's cost price with the new average cost
      await tx.product.update({
        where: { id: productId },
        data: { costPrice: newAverageCost }, // costPrice now equals the new average cost
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

      console.log(`📊 Average cost updated for ${product.name}: ${currentCost} → ${newAverageCost} RWF (Product cost price updated)`);
      
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
        description: 'Product cost price updated using weighted average cost method. The cost price now reflects the average cost of all inventory.',
        formula: '((Current Stock × Current Cost) + (New Quantity × New Cost)) / Total Quantity',
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
   * Note: The product's costPrice field represents the current weighted average cost
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

    // Get current product to show current average cost
    const product = await this.prisma.product.findFirst({
      where: { id: productId, organizationId },
      select: { costPrice: true, name: true },
    });

    const costs = recentPurchases.map(p => p.costPrice);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;

    return {
      recentPurchases: recentPurchases.length,
      currentAverageCost: product?.costPrice || 0, // This is the actual average cost used by the system
      purchaseAvgCost: Math.round(avgCost * 100) / 100, // Average of recent purchase costs
      minCost: Math.round(minCost * 100) / 100,
      maxCost: Math.round(maxCost * 100) / 100,
      costVariation: Math.round((maxCost - minCost) * 100) / 100,
      lastPurchase: recentPurchases[0],
    };
  }
}