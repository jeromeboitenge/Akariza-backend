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
    description: 'Customer is optional for cash sales. Customer is REQUIRED for credit/loan sales (paymentStatus: UNPAID or PARTIAL)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['items', 'paymentMethod'],
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
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
          example: 'CASH' 
        },
        paymentStatus: { 
          type: 'string', 
          enum: ['PAID', 'UNPAID', 'PARTIAL'],
          example: 'PAID',
          description: 'PAID = cash sale (no customer needed), UNPAID/PARTIAL = credit sale (customer required)'
        },
        customerId: { 
          type: 'string', 
          example: 'customer-id',
          description: 'Required only for credit/loan sales (paymentStatus: UNPAID or PARTIAL)'
        },
        customerName: { 
          type: 'string', 
          example: 'Walk-in Customer',
          description: 'Optional. Defaults to "Walk-in Customer" if not provided'
        },
        discount: { type: 'number', example: 2000, default: 0 },
        tax: { type: 'number', example: 0, default: 0 }
      },
      examples: {
        cashSale: {
          summary: 'Cash Sale (No customer needed)',
          value: {
            items: [
              { productId: 'product-id', quantity: 2, sellingPrice: 22000 }
            ],
            paymentMethod: 'CASH',
            paymentStatus: 'PAID'
          }
        },
        creditSale: {
          summary: 'Credit/Loan Sale (Customer required)',
          value: {
            items: [
              { productId: 'product-id', quantity: 2, sellingPrice: 22000 }
            ],
            paymentMethod: 'CASH',
            paymentStatus: 'UNPAID',
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
