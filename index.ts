if (process.env.NODE_ENV !== 'production'){
   require('dotenv').config();
}
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require ('express-flash');
const session = require ('express-session');
const methodOverride = require('method-override');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    (email: string) => users.find(user => user.email === email),
    (id: string) => users.find(user => user.id === id)
);

type Users = {
    id: string,
    name: string,
    password: string,
    email: string
}

const users:Array<Users> = [];

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', checkAuthenticated, (req: { user: { name: any; }; }, res: { render: (arg0: string, arg1: Object) => void; }) => {
    res.render('index.ejs', {name: req.user.name });
});

app.get('/login', checkNotAuthenticated,  (req: Express.Request, res: { render: (arg0: string) => void; }) => {
    res.render('login.ejs');
});

app.get('/register', checkNotAuthenticated, (req: Express.Request, res: { render: (arg0: string) => void; }) => {
    res.render('register.ejs');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/register', async (req: { body: { name: string, email: string, password: any }; },  res: { render: (arg0: string) => void;
    redirect(url: string): void;
}) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        console.log(users);
        res.redirect('/login');
    } catch(e) {
       console.log(e);
       res.redirect('/register');
    }
    req.body.email
});

function checkAuthenticated(req: { isAuthenticated: () => Boolean; }, res: { redirect: (arg0: string) => void; },
                            next: () => Function) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('./login');
}

function checkNotAuthenticated(req: { isAuthenticated: () => Boolean; }, res: { redirect: (arg0: string) => void; },
                            next: () => Function) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next();
}

app.delete('/logout', (req: { logOut: () => void; redirect: (arg0: string) => void; }, res: any) => {
    req.logOut();
    res.redirect('/login');
});

app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`)
});

