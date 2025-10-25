import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name) private readonly deptModel: Model<DepartmentDocument>,
  ) {}

  async create(dto: CreateDepartmentDto) {
    try {
      const created = await this.deptModel.create(dto);
      return created;
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Department name already exists');
      throw e;
    }
  }

  async findAll() {
    return this.deptModel.find().sort({ name: 1 }).lean();
  }

  async findActive() {
    return this.deptModel.find({ isActive: true }).sort({ name: 1 }).lean();
  }

  async findWithDetails(id: string) {
    const department = await this.deptModel.findById(id).lean();
    if (!department) throw new NotFoundException('Department not found');
    
    // TODO: Add doctors and services population when those modules are ready
    return {
      ...department,
      doctors: [], // Will be populated when doctors module is integrated
      services: [] // Will be populated when services module is integrated
    };
  }

  async findOne(id: string) {
    const doc = await this.deptModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Department not found');
    return doc;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    try {
      const doc = await this.deptModel.findByIdAndUpdate(id, dto, { new: true });
      if (!doc) throw new NotFoundException('Department not found');
      return doc;
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Department name already exists');
      throw e;
    }
  }

  async remove(id: string) {
    const res = await this.deptModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Department not found');
    return { deleted: true };
  }
}


