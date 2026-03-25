import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { Roles } from '../common/decorators';

@ApiTags('Stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private service: StockService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Get stock transactions' })
  @ApiQuery({ name: 'productId', required: false })
  getTransactions(@Query('productId') productId: string, @Request() req) {
    return this.service.getTransactions(req.user.organizationId, productId);
  }

  @Post('adjust')
  @Roles('BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Adjust stock manually' })
  @ApiBody({
    schema: {
      example: {
        productId: 'product-id',
        quantity: 10,
        notes: 'Found extra stock in warehouse'
      }
    }
  })
  adjustStock(@Body() data: any, @Request() req) {
    return this.service.adjustStock(
      req.user.organizationId,
      data.productId,
      data.quantity,
      req.user.id,
      data.notes,
    );
  }

  @Get('valuation')
  @ApiOperation({ summary: 'Get total stock valuation' })
  getValuation(@Request() req) {
    return this.service.getValuation(req.user.organizationId);
  }
}
