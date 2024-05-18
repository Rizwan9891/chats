const chat = require('../_controllers/chat.controller');
module.exports = (app) => {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
        res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Acc' + 'ess-Control-Request-Method, Access-Control-Request-Headers');
        res.header('Cache-Control', 'no-cache');
        next();
    });
    app.post("/api/chat/get", chat.getChats);
    app.get("/api/chat/getChatList/:userId", chat.getChatList);
    app.get("/api/chat/getChatListWithChat/:userId", chat.getChatListWithChat);
}