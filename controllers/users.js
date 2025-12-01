const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/users');


usersRouter.post('/', async (request, response) => {
    try {
        const { username, name, password } = request.body;

        if(!username || !name || !password) {
            return response.status(400).json({
                error: 'username, name, and password are required'
            });
        }

        if(username.length < 3 || password.length < 3) {
            return response.status(400).json({
                error: 'username and password must be at least 3 characters long'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            name,
            passwordHash
        });

        const savedUser = await user.save(); 
        response.status(201).json(savedUser);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return response.status(400).json({ error: error.message });
        }
        if (error.code === 11000) {
            return response.status(400).json({ error: 'username must be unique' });
        }
        response.status(500).json({ error: 'Internal server error' });
    }
});

usersRouter.get('/', async (request, response) => {
    try {
        const users = await User
            .find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 });
        response.json(users);
    } catch (error) {
        response.status(500).json({ error: 'error '});
    }
});


module.exports = usersRouter;

