const https = require('https');

exports.sendWhatsApp = async (req, res) => {
    try {
        const payload = req.body;
        const authKey = req.headers['authkey'];

        if (!authKey) {
            return res.status(400).json({ error: 'Missing authkey header' });
        }

        const data = JSON.stringify(payload);

        const options = {
            hostname: 'api.msg91.com',
            port: 443,
            path: '/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
            method: 'POST',
            headers: {
                'authkey': authKey,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const request = https.request(options, (response) => {
            let responseData = '';

            response.on('data', (chunk) => {
                responseData += chunk;
            });

            response.on('end', () => {
                console.log('MSG91 API Status:', response.statusCode);
                console.log('MSG91 API Response:', responseData);

                try {
                    const json = JSON.parse(responseData);
                    res.status(response.statusCode).json(json);
                } catch (e) {
                    res.status(response.statusCode).send(responseData);
                }
            });
        });

        request.on('error', (error) => {
            console.error('MSG91 Request Error:', error);
            res.status(500).json({ error: error.message });
        });

        request.write(data);
        request.end();

    } catch (error) {
        console.error('WhatsApp Controller Error:', error);
        res.status(500).json({ error: error.message });
    }
};