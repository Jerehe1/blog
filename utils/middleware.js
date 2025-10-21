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
  if(!request.token) {
    return response.status(401).json({error: 'token missing or invalid'});
  }
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if(!decodedToken.id) {
        return response.status(401).json({error: 'token missing or invalid'});
    }
    request.user = await user.findById(decodedToken.id);
} catch (error) {
    return response.status(401).json({error: 'token missing or invalid'});
}
    next();
}

module.exports = {
    tokenExtractor,
    userExtractor
}