import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { Roles } from '../common/decorators';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private service: SalesService) {}

  @Post()
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ 
    summary: 'Create sale',
    description: 'Cashier workflow: 1) Select product, 2) Enter quantity, 3) Enter amount paid, 4) Select payment method (CASH/MOBILE)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['items', 'paymentMethod', 'amountPaid'],
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['productId', 'quantity', 'sellingPrice'],
            properties: {
              productId: { type: 'string', example: 'product-id' },
              quantity: { type: 'number', example: 2 },
              sellingPrice: { type: 'number', example: 22000 }
            }
          }
        },
        paymentMethod: { 
          type: 'string', 
          enum: ['CASH', 'MOBILE', 'CARD', 'BANK_TRANSFER'],
          example: 'CASH',
          description: 'CASH or MOBILE (momo)'
        },
        amountPaid: { 
          type: 'number', 
          example: 50000,
          description: 'Amount customer paid. System calculates change automatically'
        },
        discount: { 
          type: 'number', 
          example: 0, 
          default: 0,
          description: 'Optional discount amount'
        },
        customerId: { 
          type: 'string', 
          example: 'customer-id',
          description: 'Required only if customer is buying on credit (amountPaid < total)'
        },
        customerName: { 
          type: 'string', 
          example: 'Walk-in Customer',
          description: 'Optional. Auto-set to "Walk-in Customer"'
        }
      },
      examples: {
        cashSale: {
          summary: 'Cash Sale - Customer pays exact amount',
          value: {
            items: [
              { productId: 'product-id', quantity: 2, sellingPrice: 22000 }
            ],
            paymentMethod: 'CASH',
            amountPaid: 44000
          }
        },
        cashSaleWithChange: {
          summary: 'Cash Sale - Customer pays more (with change)',
          value: {
            items: [
              { productId: 'product-id', quantity: 2, sellingPrice: 22000 }
            ],
            paymentMethod: 'CASH',
            amountPaid: 50000
          }
        },
        momoSale: {
          summary: 'Mobile Money Sale',
          value: {
            items: [
              { productId: 'product-id', quantity: 2, sellingPrice: 22000 }
            ],
            paymentMethod: 'MOBILE',
            amountPaid: 44000
          }
        },
        creditSale: {
          summary: 'Credit Sale - Customer pays less than total',
          value: {
            items: [
              { productId: 'product-id', quantity: 2, sellingPrice: 22000 }
            ],
            paymentMethod: 'CASH',
            amountPaid: 20000,
            customerId: 'customer-id',
            customerName: 'John Doe'
          }
        }
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get all sales' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get('my-sales')
  @Roles('CASHIER')
  @ApiOperation({ summary: 'Get my sales' })
  findMySales(@Request() req) {
    return this.service.findMySales(req.user.organizationId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }
}
