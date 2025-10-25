import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private readonly svcModel: Model<ServiceDocument>) {}

  async create(dto: CreateServiceDto) {
    try {
      const created = await this.svcModel.create({ ...dto, departmentId: new Types.ObjectId(dto.departmentId) });
      return created;
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Service already exists in department');
      throw e;
    }
  }

  async findAll(filter?: { departmentId?: string }) {
    const q: any = {};
    if (filter?.departmentId) q.departmentId = new Types.ObjectId(filter.departmentId);
    return this.svcModel.find(q).sort({ name: 1 }).lean();
  }

  async findOne(id: string) {
    const doc = await this.svcModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Service not found');
    return doc;
  }

  async update(id: string, dto: UpdateServiceDto) {
    try {
      const payload: any = { ...dto };
      if (dto.departmentId) payload.departmentId = new Types.ObjectId(dto.departmentId);
      const doc = await this.svcModel.findByIdAndUpdate(id, payload, { new: true });
      if (!doc) throw new NotFoundException('Service not found');
      return doc;
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Service already exists in department');
      throw e;
    }
  }

  async remove(id: string) {
    const res = await this.svcModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Service not found');
    return { deleted: true };
  }
}


