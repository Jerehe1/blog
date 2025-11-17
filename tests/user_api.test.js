const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('assert')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const User = require('../models/users')

const api = supertest(app)

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({});
        
        const passwordHash = await bcrypt.hash('sekret', 10);
        const user = new User({ 
            username: 'root', 
            name: 'Root User',
            passwordHash 
        });
        await user.save();
    });

    test('creation fails with proper statuscode and message if username already taken', 
        async () => {
            const usersAtStart = await helper.usersInDb();

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'sekret'
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/);
            
            const usersAtEnd = await helper.usersInDb();
            assert(
  result.body.error.toLowerCase().includes('unique') ||
  result.body.error.toLowerCase().includes('duplicate'),
  `Expected error message about username uniqueness, got: ${result.body.error}`
); 

            assert.strictEqual(usersAtEnd.length, usersAtStart.length);
        });

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'Tester',
            name: 'Test User',
            password: 'sekret'
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

        const usernames = usersAtEnd.map(u => u.username);
        assert(usernames.includes(newUser.username));
    });
})

after(() => {
    mongoose.connection.close()
})