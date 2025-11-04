import { Test, TestingModule } from '@nestjs/testing';
import { TelexController } from './telex.controller';

describe('TelexController', () => {
  let controller: TelexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelexController],
    }).compile();

    controller = module.get<TelexController>(TelexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
