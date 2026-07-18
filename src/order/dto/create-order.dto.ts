// src/order/dto/create-order.dto.ts
export class CreateOrderDto {
  customerEmail: string;
  items: string[];
  totalPrice: number;
}
