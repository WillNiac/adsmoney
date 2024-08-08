const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const workbook = new ExcelJS.Workbook();
const filePath = path.join(__dirname, 'AdsMoney', 'banco_de_dados.xlsx');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/ads', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ads.html'));
});

app.post('/login', (req, res) => {
    const email = req.body['paypalEmail'];
    const name = req.body['fullname'];
    // Aqui, você pode armazenar os dados de login se necessário
    res.redirect('/ads');
});

app.post('/withdraw', async (req, res) => {
    const email = req.body.paypalEmail;
    const name = req.body.fullName;
    const amount = req.body.amount;

    try {
        // Verificando se o arquivo existe e lendo o arquivo existente ou criando um novo se não existir
        if (fs.existsSync(filePath)) {
            await workbook.xlsx.readFile(filePath);
        } else {
            const sheet = workbook.addWorksheet('Planilha1');
            sheet.columns = [
                { header: 'Email', key: 'email' },
                { header: 'Nome', key: 'name' },
                { header: 'Valor', key: 'amount' }
            ];
        }

        const sheet = workbook.getWorksheet('Planilha1');
        // Adicionando nova linha
        sheet.addRow({ email, name, amount });

        // Salvando a planilha
        await workbook.xlsx.writeFile(filePath);

        res.json({ message: 'Saque realizado com sucesso. Em até 48h seus ganhos estarão disponíveis.' });
    } catch (error) {
        console.error('Erro ao processar o saque:', error);
        res.status(500).json({ message: 'Erro ao processar o saque.' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
