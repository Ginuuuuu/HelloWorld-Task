import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

describe('Authentication Rate Limiting Verification', () => {
  test('Returns 429 Too Many Requests when rate limit is exceeded', async () => {
    const testApp = express();
    testApp.use(express.json());

    const limiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many authentication attempts. Please try again after 15 minutes.',
        });
      },
    });

    testApp.post('/api/auth/login', limiter, (req, res) => {
      res.status(200).json({ success: true, message: 'Login allowed' });
    });

    // Request 1: OK
    const res1 = await request(testApp).post('/api/auth/login').send({});
    assert.equal(res1.status, 200);

    // Request 2: OK
    const res2 = await request(testApp).post('/api/auth/login').send({});
    assert.equal(res2.status, 200);

    // Request 3: Exceeded -> 429
    const res3 = await request(testApp).post('/api/auth/login').send({});
    assert.equal(res3.status, 429);
    assert.equal(res3.body.success, false);
    assert.ok(res3.body.message.includes('Too many authentication attempts'));
  });
});
