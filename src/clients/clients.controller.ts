import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ClientsService } from './clients.service.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.clientsService.findOne(email);
  }

  @Patch(':email')
  update(@Param('email') email: string, @Body() dto: UpdateClientDto) {
    dto.email = email;
    return this.clientsService.update(dto);
  }

  @Delete(':email')
  remove(@Param('email') email: string) {
    return this.clientsService.remove(email);
  }
}
