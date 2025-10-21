const jwt = require('jsonwebtoken');
const user = require('../models/users');

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization');
    if(authrization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization.replace('Bearer ', '');
    } else {
        request.token = null;
    }
    next();
}

const userExtractor = async (request, response, next) => {
    if (request.token) {
        const decodedToken = jwt.verify(request.token, process.env.SECRET);
        if(decodedToken.id) {
            request.user = await user.findById(decodedToken.id);
        }
    }
    next();
}

module.exports = {
    tokenExtractor,
    userExtractor
}