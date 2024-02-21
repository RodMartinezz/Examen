const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const port = 5000;
//este codigo se ejecuta con npm run dev
app.use(express.json());// Middleware para parsear el body a JSON
app.use(cookieParser());// Middleware para parsear cookies

//Configuración de express-session
app.use(session({
    secret: 'contraseñasecreta',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 86400000 } //Duración de la cookie de sesión, 1 dia
}));


//Middleware para el conteo de visitas
app.use((req, res, next) => {
    if (!req.session.visitas) {
        req.session.visitas = 0;
    }
    req.session.visitas += 1;

    if (req.session.visitas === 5) {
        console.log(`Ruta ${req.originalUrl} - Visitas: ${req.session.visitas}`);
    }

    next();
});

//Ruta raíz y captura de datos del navegador
app.get('/', (req, res) => {
    const userAgent = req.headers['user-agent'];
    res.cookie('navegador', userAgent, { expires: new Date('2024-02-21T23:59:59.000Z') });
    console.log(`Cookie de navegador capturada: ${userAgent}`);

    res.send('Bienvenido a nuestra aplicación. Usa /info para obtener información del servidor y /libros/all para ver libros');
});

//Ruta para obtener información del servidor
app.get('/info', (req, res) => {
    const serverInfo = {
        serverName: 'MiServidorNodeExpress',
        port: port,
        status: 'En funcionamiento',
    };
    res.json(serverInfo);
});

//Datos de ejemplo para libros
let data = [
    { id: 1, titulo: "Renegados", autor: "Marisa Meyer", ejemplares: 3 },
    { id: 2, titulo: "Entremuros", autor: "Robert Jackson Bennett", ejemplares: 5 },
    { id: 3, titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes", ejemplares: 4 }
];

//Rutas relacionadas con los libros
app.get('/libros/all', (req, res) => {
    res.status(200).json(data);
});

app.get('/libros/:id', (req, res) => {
    const { id } = req.params;
    const libro = data.find(libro => libro.id === parseInt(id));
    if (libro) {
        res.status(200).json(libro);
    } else {
        res.status(404).send('Libro no encontrado');
    }
});
//ruta para puntos extra
app.get('/libros', (req, res) => {
    const { id } = req.query;
    if (id) {
        const libro = data.find(libro => libro.id === parseInt(id));
        if (libro) {
            res.status(200).json(libro);
        } else {
            res.status(404).send('Libro no encontrado');
        }
    } else {
        res.status(400).send('Falta el parámetro id');
    }
});

app.post('/libros/new', (req, res) => {
    const { id, titulo, autor, ejemplares } = req.body;
    if (id && titulo && autor && ejemplares) {
        data.push({ id, titulo, autor, ejemplares });
        res.status(201).json({ id, titulo, autor, ejemplares });
    } else {
        res.status(400).send('Falta alguno de los datos requeridos');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
