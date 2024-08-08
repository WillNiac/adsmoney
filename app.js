const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const { google } = require('googleapis');

const app = express();

// Configuração do middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração das sessões
app.use(session({
    secret: 'maktatus45', // Troque por uma string secreta de sua escolha
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como false para testes em HTTP
}));

// Carregar credenciais
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json')));

// Configurar autenticação
const oAuth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris[0]
);
oAuth2Client.setCredentials({ refresh_token: credentials.refresh_token });

const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/ads', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ads.html'));
});

app.post('/login', (req, res) => {
    const email = req.body['paypalEmail'];
    const name = req.body['fullname'];

    // Armazenando os dados na sessão
    req.session.email = email;
    req.session.name = name;

    res.redirect('/ads');
});

app.post('/withdraw', async (req, res) => {
    const email = req.session.email;
    const name = req.session.name;
    const amount = req.body.amount;

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: '11h0-hghVBh2dracRerQlUalGXrPe9mQhlBMZ7yhzv6o', // Substitua pelo ID da sua planilha
            range: 'Página1!A1', // Substitua pelo intervalo da sua planilha
            valueInputOption: 'RAW',
            resource: {
                values: [[email, name, amount]],
            },
        });

        res.json({ message: 'Saque realizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao processar o saque:', error);
        res.status(500).json({ message: 'Erro ao processar o saque.' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
