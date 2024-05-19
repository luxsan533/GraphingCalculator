// ------------------------------SETUP--------------------------------------------

const express = require('express')
const path = require('path')
const app = express()
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const {spawn} = require('child_process');
const bcrypt = require('bcrypt')
const session = require('express-session')

// app.use = does code every time an incoming request like accessing the site
// req = a javascript object that parses the http request so that you can use its information
// res = a javascript object that represent the http response. Sends the http response with res.send. res.send when used in app.use will send the http response on all pages in tthis server

mongoose.connect('mongodb://127.0.0.1:27017/Datasci', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO AN ERROR!!!")
        console.log(err)
    })

// models

const User = require('./models/user')

// app.get sends a http response to only the specific page listed, / is the page without any path, 

// res.render looks for a file in the views folder and sends an html page with the inputed name

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// this allows this file to access any of the files within the public folder. This is where you can put css, js, image files and more.
// You dont need to specify the public path because it is served by this function. If your file is in a folder within public, you will need to specify that folder in the path
app.use(express.static('public'))

// this parses req.body into json, normally it is undefined
app.use(express.urlencoded({extended: true}))

// This allows you to use express methods like put, paths and delete
app.use(methodOverride('_method'))

app.use(session({secret: 'Not a good secret'}))

// --------------------------Middleware---------------------------------------------------------------

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next()
}

// --------------------------------------------------------------------------------------------

// --------------------------Login Page and Creating Users------------------------------------------

app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req, res) => {
    // res.send(req.body)
    const {password, username} = req.body
    const hash = await bcrypt.hash(password, 12)
    const user = new User({
        username,
        hashPassword: hash,
        graphs: []
    })
    await user.save()
    res.render('login.ejs')
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({username})
    console.log(user)
    const validPass = await bcrypt.compare(password, user.hashPassword)
    console.log(user._id)
    console.log(req.session.user_id)
    if (validPass) {
        req.session.user_id = user._id
        res.redirect('/createplot')
    }
    else {
        res.send('Incorrect login or password')
    }
})

app.get('/logout', async (req, res) => {
    req.session.user_id = null
    res.redirect('/')
})

// --------------------------------------------------------------------------------------------

// --------------------------Home Page, Creating and Saving Plots--------------------------------------------

app.get('/', async (req, res) => {
    res.render('home.ejs')
})

app.get('/createplot', async (req, res) => {
    res.render('createplot.ejs')
})

app.post('/createplot', (req, res) => {
    let {xlim, func, name} = req.body
    console.log(func)
    var dataToSend;
    // spawn new child process to call the python script
    // list after, python states the python file to be sent to, and the following items are data we send to the python file
    const python = spawn('python', ['createplot.py', xlim, func, name]);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
       });
    python.stderr.on('data', data => {
        console.error(`stderr: ${data}`)
    })
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    dataToSend = eval(dataToSend)
    dataToSend.push(func)
    console.log(dataToSend)
    console.log(dataToSend[0])
    res.render('plot.ejs' , {dataToSend: dataToSend, func: func})
    });
    
   })

app.post('/savegraph', requireLogin, async (req, res) => {
    let {graph} = req.body
    graph = graph.split(',')
    const user = await User.findById(req.session.user_id)
    user.graphs.push(graph)
    await user.save()
    console.log(user)    
    res.redirect('/graphs')
    // console.log(graph)
})


// --------------------------------------------------------------------------------------------

// --------------------------Showing And Deleting Saved Graphs----------------------------

app.get('/graphs', requireLogin, async (req, res) => {
    const user = await User.findById(req.session.user_id)
    // console.log(user)
    let graphs = user.graphs
    // console.log(graphs)
    res.render('graphs.ejs', {graphs: graphs})
})


app.post('/gotoplot', requireLogin, async (req, res) => {
    console.log(req.body)
    let {graph_data} = req.body
    graph_data = graph_data.split(',')
    console.log(graph_data)
    // res.send(graph_data)
    res.render('showplot.ejs', {graph_data: graph_data})
})

app.post('/deletegraph', requireLogin, async (req, res) => {  
    let {graph_name} = req.body
    graph_name = graph_name.trim()
    const user = await User.findById(req.session.user_id)

    let graphs = user.graphs
    user.graphs = graphs.filter(function(item) {
        let buff = new Buffer.from(graph_name)
        let base64data = buff.toString('base64');
        let buff_2 = new Buffer.from(item[1])
        let base64data_2 = buff_2.toString('base64');
        return base64data !== base64data_2
    })
    await user.save()
    res.redirect('/graphs')
})


// --------------------------------------------------------------------------------------------

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
})