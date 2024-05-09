const calculatorApp = require('./calculator-app');
const logger = require('./utils/logger');
const config = require('./config');
calculatorApp.get('/healthz', (req, res) => {
    res.send('OK');
});
const port = config.calculatorPort;
calculatorApp.listen(port, () => {
    logger.info(`Calculator service listening on port ${port}`);
});
