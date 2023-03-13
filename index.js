const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()


app.use(express.json())
app.use(cors())
app.use(express.static('build'))
//app.use(morgan('tiny'))

//const PORT = 3001

const postaus = ':method :url :status :res[content-length] - :response-time ms :post-data'
const muut = ':method :url :status :res[content-length] - :response-time ms'
morgan.token('post-data', (request, response) => {
    if (request.method === 'POST') {
        const { id, ...rest } = request.body
        return JSON.stringify(rest)
    }
})

app.use(morgan((tokens, request, response) => {
    if (request.method === 'POST') {
        return morgan.compile(postaus)(tokens, request, response)
    } else {
        return morgan.compile(muut)(tokens, request, response)
    }
}))

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122"
  },
]


app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p></p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})
  
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
      
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const id = Math.floor(Math.random() * 10000)
    const uusi = request.body
    
    if (!uusi.name) {
        return response.status(400).json({ 
            error: 'name missing' 
        })
    } else if (!uusi.number) {
        return response.status(400).json({ 
            error: 'number missing' 
        })
    }
    const personExists = persons.some(person => person.name === uusi.name)
    if (personExists) {
        return response.status(400).json({ error: 'name is already in list' });
    }
    
    uusi.id = id
    persons = persons.concat(uusi)  
    response.json(uusi)
})

const PORT = process.env.PORT || 3001 // teht3.9

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})