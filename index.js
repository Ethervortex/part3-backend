require('dotenv').config() // ympäristömuuttuja
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person') // tietokanta

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

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
const errorHandler = (error, request, response, next) => {
    //console.log(error.name)
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
}

app.use(errorHandler)
/*
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
] */

/*
app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p></p><p>${new Date()}</p>`)
}) */
app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p></p><p>${new Date()}</p>`)
    })
})

/*
app.get('/api/persons', (req, res) => {
    res.json(persons)
}) */
// Tietokantaa käyttävä muoto:
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

/*
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
      
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
}) */
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }        
        })
        //lisäys 3c:
        .catch(error => next(error))
})
/*
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
}) */
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

/*
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
}) */
app.post('/api/persons', (request, response, next) => {
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
    const { name, number } = request.body
    const sallittuNro = /^\d{2,3}-\d{6,}$/

    if (!sallittuNro.test(number)) {
        return response.status(400).json({ error: 'Invalid number format' })
  }
    
    Person.findOne({ name })
        .then(person => {
        if (person) {
            person.number = number;
            person.save()
            .then(updatedPerson => {
                response.json(updatedPerson);
            })
            .catch(error => next(error));
        } else {
            const newPerson = new Person({ name, number });

            newPerson.save()
            .then(savedPerson => {
                response.json(savedPerson);
            })
            .catch(error => next(error));
      }
    }) 
    .catch(error => next(error))
    /*
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
    
    Person.findOneAndUpdate(
        { name: uusi.name },
        { number: uusi.number },
        { new: true, upsert: true }
    )
        .then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error))
    */  
})



//const PORT = process.env.PORT || 3001 // teht3.9
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})