import { Controller, Get } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';

@Controller('catalog')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Get('trending')
  async getTrending() {
    return await this.catalogueService.getTrendingProducts();
  }


  @Get('metrics')
async getMetrics() {
  return await this.catalogueService.getSystemMetrics();
}
}
