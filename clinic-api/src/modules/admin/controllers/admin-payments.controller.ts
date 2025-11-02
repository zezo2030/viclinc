import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../../shared/guards/admin-role.guard';
import { AdminPaymentsService } from '../services/admin-payments.service';
import { AdminPaymentsQueryDto } from '../dto/admin-payments-query.dto';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { PaginatedPaymentsDto } from '../dto/paginated-payments.dto';
import { PaymentAdminDto } from '../dto/payment-admin.dto';

@ApiTags('Admin Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly adminPaymentsService: AdminPaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List payments (admin)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'method', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ type: PaginatedPaymentsDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  async list(@Query() query: AdminPaymentsQueryDto): Promise<PaginatedPaymentsDto> {
    return this.adminPaymentsService.findAllForAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details (admin)' })
  @ApiOkResponse({ type: PaymentAdminDto })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  async getById(@Param('id') id: string): Promise<PaymentAdminDto> {
    return this.adminPaymentsService.findByIdForAdmin(id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a payment (admin)' })
  @ApiOkResponse({ type: PaymentAdminDto, description: 'Payment refunded' })
  @ApiBadRequestResponse({ description: 'Invalid id or data' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  async refund(
    @Param('id') id: string,
    @Body() body: RefundPaymentDto,
  ): Promise<PaymentAdminDto> {
    return this.adminPaymentsService.refundPayment(id, body?.reason);
  }
}


