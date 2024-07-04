const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const natural = require('natural');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/pdf-qa-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const DocumentSchema = new mongoose.Schema({
    filename: String,
    content: String,
    uploadDate: { type: Date, default: Date.now },
});

const Document = mongoose.model('Document', DocumentSchema);

// File Upload Configuration
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Upload PDF Endpoint
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const dataBuffer = req.file.path;
        const data = await pdfParse(dataBuffer);
        const document = new Document({
            filename: req.file.filename,
            content: data.text,
        });
        await document.save();
        res.status(200).json({ message: 'File uploaded and text extracted successfully.', document });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ask Question Endpoint
app.post('/ask', async (req, res) => {
    try {
        const { documentId, question } = req.body;
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(document.content);

        const tfidf = new natural.TfIdf();
        tfidf.addDocument(tokens);

        tfidf.tfidfs(question, (i, measure) => {
            res.json({ answer: `Relevance score for document: ${measure}` });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
