// src/order/dto/create-order.dto.ts
export class CreateOrderDto {
  customerEmail: string;
  items: string[];
  totalPrice: number;
 delayInSeconds?: number; // Optional delay for simulating processing time
}
