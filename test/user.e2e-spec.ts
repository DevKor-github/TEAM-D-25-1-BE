import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users/me (PATCH)', () => {
    it('should update user profile', () => {
      const updateProfileDto = {
        email: 'updated@example.com',
        nickname: 'Updated Nickname',
        description: 'Updated description',
        isPrivate: true,
        status: 'ACTIVE',
      };

      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', 'Bearer mock-token')
        .send(updateProfileDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('nickname');
        });
    });

    it('should return 401 when no token provided', () => {
      const updateProfileDto = {
        nickname: 'Updated Nickname',
      };

      return request(app.getHttpServer())
        .patch('/users/me')
        .send(updateProfileDto)
        .expect(401);
    });
  });

  describe('/users/me/preferences (PATCH)', () => {
    it('should update user preferences (mbti and tags)', () => {
      const updatePreferencesDto = {
        mbti: 'ENFP',
        tags: ['DRINKER', 'SPICY_FOOD_LOVER', 'DESSERT_LOVER'],
      };

      return request(app.getHttpServer())
        .patch('/users/me/preferences')
        .set('Authorization', 'Bearer mock-token')
        .send(updatePreferencesDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('mbti');
          expect(res.body).toHaveProperty('tag');
        });
    });

    it('should return 401 when no token provided', () => {
      const updatePreferencesDto = {
        mbti: 'ENFP',
        tags: ['DRINKER'],
      };

      return request(app.getHttpServer())
        .patch('/users/me/preferences')
        .send(updatePreferencesDto)
        .expect(401);
    });

    it('should update only mbti when tags not provided', () => {
      const updatePreferencesDto = {
        mbti: 'INTJ',
      };

      return request(app.getHttpServer())
        .patch('/users/me/preferences')
        .set('Authorization', 'Bearer mock-token')
        .send(updatePreferencesDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('mbti');
        });
    });

    it('should update only tags when mbti not provided', () => {
      const updatePreferencesDto = {
        tags: ['VEGAN_OR_VEGETARIAN', 'HEALTH_CONSCIOUS'],
      };

      return request(app.getHttpServer())
        .patch('/users/me/preferences')
        .set('Authorization', 'Bearer mock-token')
        .send(updatePreferencesDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tag');
        });
    });
  });
});


