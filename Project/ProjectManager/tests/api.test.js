import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Set test environment variables before importing app
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_antigravity_pm_2026';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MAX_FILE_SIZE = '2097152';

import app from '../src/app.js';
import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import Task from '../src/models/Task.js';
import Comment from '../src/models/Comment.js';
import Activity from '../src/models/Activity.js';

describe('Project Management REST API - Complete Verification Suite', () => {
  let mongoServer;
  let userToken;
  let adminToken;
  let otherUserToken;
  let userId;
  let adminId;
  let otherUserId;
  let projectId;
  let taskId;
  let commentId;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // 1. Health check & 404 Route
  test('Health check endpoint returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  test('Unknown route returns 404 with standard JSON format', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Route not found');
  });

  // 2. Authentication: Registration
  test('POST /api/auth/register fails on invalid input', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'not-an-email',
      password: '123',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
    assert.ok(res.body.errors.length >= 2);
  });

  test('POST /api/auth/register creates user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'user@example.com');
    assert.equal(res.body.data.user.role, 'user');
    assert.equal(res.body.data.user.password, undefined);

    userToken = res.body.data.token;
    userId = res.body.data.user._id;
  });

  test('POST /api/auth/register rejects duplicate email with 409', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: 'user@example.com',
      password: 'password123',
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  // Create an Admin user and Another user for permission testing
  test('Create Admin and Second User', async () => {
    // Register another user
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Second User',
      email: 'second@example.com',
      password: 'password123',
    });
    assert.equal(res2.status, 201);
    otherUserToken = res2.body.data.token;
    otherUserId = res2.body.data.user._id;

    // Create admin user directly in DB
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminId = admin._id.toString();

    // Login as admin
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });
    assert.equal(loginRes.status, 200);
    adminToken = loginRes.body.data.token;
  });

  // 3. Authentication: Login & Me
  test('POST /api/auth/login succeeds with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
  });

  test('POST /api/auth/login fails with invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'wrongpassword',
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('GET /api/auth/me requires valid token', async () => {
    const noTokenRes = await request(app).get('/api/auth/me');
    assert.equal(noTokenRes.status, 401);

    const invalidTokenRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.value');
    assert.equal(invalidTokenRes.status, 401);

    const validRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(validRes.status, 200);
    assert.equal(validRes.body.data.user.email, 'user@example.com');
  });

  // 4. User Profile & Avatar Upload
  test('GET /api/users/me returns authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.name, 'Regular User');
  });

  test('PATCH /api/users/me updates profile information', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Updated Name',
        bio: 'Fullstack developer & tech enthusiast',
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.name, 'Updated Name');
    assert.equal(res.body.data.user.bio, 'Fullstack developer & tech enthusiast');
  });

  test('POST /api/users/me/avatar rejects non-image files', async () => {
    const tempTxt = path.join(process.cwd(), 'temp_test.txt');
    fs.writeFileSync(tempTxt, 'This is a text file, not an image');

    const res = await request(app)
      .post('/api/users/me/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('avatar', tempTxt);

    if (fs.existsSync(tempTxt)) fs.unlinkSync(tempTxt);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/users/me/avatar uploads valid image', async () => {
    const tempImg = path.join(process.cwd(), 'test_avatar.png');
    // Minimal valid PNG buffer
    const pngBuffer = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d0000000049454e44ae426082',
      'hex'
    );
    fs.writeFileSync(tempImg, pngBuffer);

    const res = await request(app)
      .post('/api/users/me/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('avatar', tempImg);

    if (fs.existsSync(tempImg)) fs.unlinkSync(tempImg);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.avatarUrl);
    assert.ok(res.body.data.avatarUrl.includes('/uploads/avatars/avatar-'));
  });

  // 5. Project CRUD
  test('POST /api/projects creates project with authenticated user as owner', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Website Redesign',
        description: 'Redesign company website',
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.project.name, 'Website Redesign');
    assert.equal(res.body.data.project.owner._id, userId);

    projectId = res.body.data.project._id;
  });

  test('GET /api/projects lists projects accessible to user', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.projects.length, 1);
  });

  test('GET /api/projects/:projectId succeeds for member and fails for non-member', async () => {
    // Member access
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);

    // Non-member access
    const failRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    assert.equal(failRes.status, 403);
  });

  // 6. Project Members
  test('POST /api/projects/:projectId/members/:userId allows owner to add member', async () => {
    // Non-owner cannot add member
    const forbiddenRes = await request(app)
      .post(`/api/projects/${projectId}/members/${otherUserId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    assert.equal(forbiddenRes.status, 403);

    // Owner adds member
    const res = await request(app)
      .post(`/api/projects/${projectId}/members/${otherUserId}`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);

    // Cannot add member twice
    const dupRes = await request(app)
      .post(`/api/projects/${projectId}/members/${otherUserId}`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(dupRes.status, 400);
  });

  test('GET /api/projects/:projectId/members returns member list to project members', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.members.length >= 2);
  });

  // 7. Tasks CRUD & Business Rules
  test('POST /api/projects/:projectId/tasks rejects non-member assignee', async () => {
    const nonMemberId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task with invalid assignee',
        assignee: nonMemberId,
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/projects/:projectId/tasks creates task successfully', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Implement authentication',
        description: 'Create JWT authentication',
        status: 'todo',
        priority: 'high',
        assignee: otherUserId,
        dueDate: '2026-10-15',
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.task.title, 'Implement authentication');
    assert.equal(res.body.data.task.status, 'todo');
    assert.equal(res.body.data.task.priority, 'high');

    taskId = res.body.data.task._id;
  });

  test('GET /api/projects/:projectId/tasks supports pagination, search, and filtering', async () => {
    // Create additional tasks
    await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Database indexing',
        description: 'Add compound indexes to MongoDB schemas',
        status: 'in-progress',
        priority: 'medium',
      });

    // Test search
    const searchRes = await request(app)
      .get(`/api/projects/${projectId}/tasks?search=authentication`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.body.data.tasks.length, 1);
    assert.equal(searchRes.body.data.tasks[0].title, 'Implement authentication');

    // Test filter
    const filterRes = await request(app)
      .get(`/api/projects/${projectId}/tasks?status=in-progress&priority=medium`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(filterRes.status, 200);
    assert.equal(filterRes.body.data.tasks.length, 1);
    assert.equal(filterRes.body.data.tasks[0].title, 'Database indexing');

    // Test pagination metadata
    const pageRes = await request(app)
      .get(`/api/projects/${projectId}/tasks?page=1&limit=1`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(pageRes.status, 200);
    assert.equal(pageRes.body.data.tasks.length, 1);
    assert.equal(pageRes.body.meta.page, 1);
    assert.equal(pageRes.body.meta.limit, 1);
    assert.ok(pageRes.body.meta.total >= 2);
  });

  test('PATCH /api/tasks/:taskId updates task and logs activity', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        status: 'in-progress',
        priority: 'low',
        description: 'Updated task description',
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.task.status, 'in-progress');
    assert.equal(res.body.data.task.priority, 'low');
  });

  test('GET /api/tasks/:taskId/activity returns chronological activity log', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}/activity`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.activities.length >= 2);
    assert.equal(res.body.data.activities[0].action, 'Task created');
  });

  // 8. Task Comments
  test('POST /api/tasks/:taskId/comments adds a comment', async () => {
    const res = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        content: 'I have started working on this task.',
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.comment.content, 'I have started working on this task.');
    commentId = res.body.data.comment._id;
  });

  test('GET /api/tasks/:taskId/comments retrieves task comments', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.comments.length, 1);
  });

  test('DELETE /api/comments/:commentId allows author or admin, denies other users', async () => {
    // Third user cannot delete other user's comment
    const thirdUser = await User.create({
      name: 'Third User',
      email: 'third@example.com',
      password: 'password123',
    });
    const loginThird = await request(app).post('/api/auth/login').send({
      email: 'third@example.com',
      password: 'password123',
    });
    const thirdToken = loginThird.body.data.token;

    const forbiddenRes = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${thirdToken}`);
    assert.equal(forbiddenRes.status, 403);

    // Comment author can delete
    const deleteRes = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    assert.equal(deleteRes.status, 200);
  });

  // 9. Soft Delete & Restoration
  test('DELETE /api/tasks/:taskId performs soft deletion', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);

    // Normal query excludes deleted task
    const listRes = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${userToken}`);
    const found = listRes.body.data.tasks.find((t) => t._id === taskId);
    assert.equal(found, undefined);
  });

  test('PATCH /api/tasks/:taskId restores soft-deleted task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ restore: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.task.deletedAt, null);

    // Activity has 'Task restored'
    const actRes = await request(app)
      .get(`/api/tasks/${taskId}/activity`)
      .set('Authorization', `Bearer ${userToken}`);
    const restoreAct = actRes.body.data.activities.find((a) => a.action === 'Task restored');
    assert.ok(restoreAct);
  });

  // 10. Overdue Tasks
  test('GET /api/tasks/overdue returns past due tasks that are not done', async () => {
    // Create an overdue task
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Overdue task testing',
        dueDate: pastDate,
        status: 'todo',
      });

    const res = await request(app)
      .get('/api/tasks/overdue')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.tasks.length >= 1);
    const overdue = res.body.data.tasks.find((t) => t.title === 'Overdue task testing');
    assert.ok(overdue);
  });

  // 11. Dashboard Statistics
  test('GET /api/projects/:projectId/dashboard returns project statistics', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/dashboard`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.totalTasks >= 3);
    assert.ok(typeof res.body.data.completedPercentage === 'number');
    assert.ok(res.body.data.todo >= 1);
  });

  // 12. Remove Member
  test('DELETE /api/projects/:projectId/members/:userId removes member', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}/members/${otherUserId}`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);

    // Removed user can no longer access project
    const accessRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    assert.equal(accessRes.status, 403);
  });

  // 13. Update & Delete Project
  test('PATCH /api/projects/:projectId updates project details', async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Brand New Portal',
        description: 'Updated project description',
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.project.name, 'Brand New Portal');
  });

  // 14. Alternative Dashboard route & Invalid ID format handling
  test('GET /api/dashboard/:projectId returns 400 on invalid projectId format', async () => {
    const res = await request(app)
      .get('/api/dashboard/invalid-mongo-id')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors);
  });

  // 15. Task validation checks
  test('POST /api/projects/:projectId/tasks fails on invalid status and priority enum', async () => {
    // Create a temporary project for testing
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Validation Test Project' });
    const tempProjectId = projRes.body.data.project._id;

    const res = await request(app)
      .post(`/api/projects/${tempProjectId}/tasks`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task with invalid enums',
        status: 'invalid_status_enum',
        priority: 'super_ultra_high',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((e) => e.field === 'status'));
    assert.ok(res.body.errors.some((e) => e.field === 'priority'));

    // Clean up
    await request(app)
      .delete(`/api/projects/${tempProjectId}`)
      .set('Authorization', `Bearer ${userToken}`);
  });

  // 16. Admin permissions across projects
  test('Admin can access any project and perform operations', async () => {
    // Regular user creates a project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'User Secret Project' });
    const userProjId = projRes.body.data.project._id;

    // Admin accesses it
    const adminAccessRes = await request(app)
      .get(`/api/projects/${userProjId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(adminAccessRes.status, 200);
    assert.equal(adminAccessRes.body.data.project.name, 'User Secret Project');

    // Admin can delete it
    const adminDeleteRes = await request(app)
      .delete(`/api/projects/${userProjId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(adminDeleteRes.status, 200);
  });

  // 18. Delete Project & cascade cleanup
  test('DELETE /api/projects/:projectId deletes project and cascade cleans up', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);

    const checkProj = await Project.findById(projectId);
    assert.equal(checkProj, null);

    const checkTasks = await Task.find({ project: projectId });
    assert.equal(checkTasks.length, 0);
  });
});

