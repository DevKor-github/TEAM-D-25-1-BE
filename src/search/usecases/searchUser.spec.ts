import { Test, TestingModule } from '@nestjs/testing';
import { SearchUserUseCase } from './searchUser';
import { SearchUserTagRepository } from '../repositories/searchUserTag';
import { UserRepository } from '@/user/repositories/user';
import { UserParam } from '@/user/params/user';

describe('SearchUserUseCase', () => {
  let useCase: SearchUserUseCase;
  let searchUserTagRepository: jest.Mocked<SearchUserTagRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUserParam: UserParam = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    nickname: 'Test User',
    password: 'hashedPassword',
    socialProvider: 'GOOGLE',
    socialId: 'social-123',
    isPrivate: false,
    createdAt: new Date(),
  };

  const mockUserParam2: UserParam = {
    id: 'user-2',
    email: 'test2@example.com',
    username: 'testuser2',
    nickname: 'Test User 2',
    password: 'hashedPassword2',
    socialProvider: 'APPLE',
    socialId: 'social-456',
    isPrivate: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockSearchUserTagRepository = {
      getIdList: jest.fn(),
    };

    const mockUserRepository = {
      findByIdList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchUserUseCase,
        {
          provide: SearchUserTagRepository,
          useValue: mockSearchUserTagRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<SearchUserUseCase>(SearchUserUseCase);
    searchUserTagRepository = module.get(SearchUserTagRepository);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return users when search query matches', async () => {
      // Arrange
      const query = 'test';
      const page = 1;
      const perPage = 10;
      const userIds = ['user-1', 'user-2'];
      const expectedUsers = [mockUserParam, mockUserParam2];

      searchUserTagRepository.getIdList.mockResolvedValue(userIds);
      userRepository.findByIdList.mockResolvedValue(expectedUsers);

      // Act
      const result = await useCase.execute(query, page, perPage);

      // Assert
      expect(searchUserTagRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(userRepository.findByIdList).toHaveBeenCalledWith(userIds);
      expect(result).toEqual(expectedUsers);
    });

    it('should return empty array when no users match search query', async () => {
      // Arrange
      const query = 'nonexistent';
      const page = 1;
      const perPage = 10;
      const userIds: string[] = [];

      searchUserTagRepository.getIdList.mockResolvedValue(userIds);
      userRepository.findByIdList.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(query, page, perPage);

      // Assert
      expect(searchUserTagRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(userRepository.findByIdList).toHaveBeenCalledWith(userIds);
      expect(result).toEqual([]);
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const query = 'test';
      const page = 2;
      const perPage = 5;
      const userIds = ['user-1'];

      searchUserTagRepository.getIdList.mockResolvedValue(userIds);
      userRepository.findByIdList.mockResolvedValue([mockUserParam]);

      // Act
      const result = await useCase.execute(query, page, perPage);

      // Assert
      expect(searchUserTagRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(userRepository.findByIdList).toHaveBeenCalledWith(userIds);
      expect(result).toEqual([mockUserParam]);
    });

    it('should handle case when some users are not found', async () => {
      // Arrange
      const query = 'test';
      const page = 1;
      const perPage = 10;
      const userIds = ['user-1', 'user-2', 'user-3'];
      const foundUsers = [mockUserParam, mockUserParam2]; // user-3 is not found

      searchUserTagRepository.getIdList.mockResolvedValue(userIds);
      userRepository.findByIdList.mockResolvedValue(foundUsers);

      // Act
      const result = await useCase.execute(query, page, perPage);

      // Assert
      expect(searchUserTagRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(userRepository.findByIdList).toHaveBeenCalledWith(userIds);
      expect(result).toEqual(foundUsers);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const query = 'test';
      const page = 1;
      const perPage = 10;
      const error = new Error('Database connection failed');

      searchUserTagRepository.getIdList.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(query, page, perPage)).rejects.toThrow(
        'Database connection failed',
      );
      expect(searchUserTagRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(userRepository.findByIdList).not.toHaveBeenCalled();
    });

    it('should handle empty query string', async () => {
      // Arrange
      const query = '';
      const page = 1;
      const perPage = 10;
      const userIds = ['user-1'];

      searchUserTagRepository.getIdList.mockResolvedValue(userIds);
      userRepository.findByIdList.mockResolvedValue([mockUserParam]);

      // Act
      const result = await useCase.execute(query, page, perPage);

      // Assert
      expect(searchUserTagRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(userRepository.findByIdList).toHaveBeenCalledWith(userIds);
      expect(result).toEqual([mockUserParam]);
    });

    it('should handle zero page number', async () => {
      // Arrange
      const query = 'test';
      const page = 0;
      const perPage = 10;
      const userIds: string[] = [];

      searchUserTagRepository.getIdList.mockResolvedValue(userIds);
      userRepository.findByIdList.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(query, page, perPage);

      // Assert
      expect(searchUserTagRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(userRepository.findByIdList).toHaveBeenCalledWith(userIds);
      expect(result).toEqual([]);
    });

    it('should handle large perPage value', async () => {
      // Arrange
      const query = 'test';
      const page = 1;
      const perPage = 1000;
      const userIds = ['user-1', 'user-2'];

      searchUserTagRepository.getIdList.mockResolvedValue(userIds);
      userRepository.findByIdList.mockResolvedValue([
        mockUserParam,
        mockUserParam2,
      ]);

      // Act
      const result = await useCase.execute(query, page, perPage);

      // Assert
      expect(searchUserTagRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(userRepository.findByIdList).toHaveBeenCalledWith(userIds);
      expect(result).toEqual([mockUserParam, mockUserParam2]);
    });
  });
});
