import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { LogsService } from './logs.service.js';
import { CreateLogDto } from './dto/create-log.dto.js';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Body() dto: CreateLogDto) {
    return this.logsService.create(dto);
  }

  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.logsService.findByClientId(clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logsService.remove(id);
  }
}
