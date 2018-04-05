const express = require('express');
const bodyParser = require('body-parser');
const massive = require('massive');

const app = express();

require('dotenv').config()

app.use(bodyParser.json());

massive(process.env.CONNECTION_STRING)
  .then(db => {
    app.set('db', db)
    // Initialize user table and vehicle table.
    db.init_tables.user_create_seed().then(response => {
      console.log('User table init');
      db.init_tables.vehicle_create_seed().then(response => {
        console.log('Vehicle table init');
      })
    })
  })
  .catch(err => console.error(err))

//** User Controller end points **//

//Retrieves users from DB
app.get('/api/users', (req, res) => {
  app.get('db').get_users()
    .then(users => res.status(200).json(users))
    .catch(err => console.error(err))
});

//Creates a user and adds to DB
app.post('/api/users', (req, res) => {
  const { name, email } = req.body

  app.get('db').create_user([name, email])
    .then(newUser => {
      console.log(newUser)
      res.status(200).json(newUser)
    })
    .catch(err => console.error(err))
});

//Retrieves number of vehicles owned by a specific user
app.get('/api/user/:userId/vehiclecount', (req, res) => {
  const { userId } = req.params

  app.get('db').count_vehicles_by_user([userId])
    .then(count => {
      console.log(count)
      res.status(200).json(count)
    })
    .catch(err => console.error(err))
})

//Retrieves vehicles owned by a specific user
app.get('/api/user/:userId/vehicle', (req, res) => {
  const { userId } = req.params

  app.get('db').display_vehicles_by_user([userId])
    .then(vehicles => {
      console.log(vehicles)
      res.status(200).json(vehicles)
    })
    .catch(err => console.error(err))
})

//Removes a specific owner from a specific vehicle.
app.delete('/api/user/:userId/vehicle/:vehicleId', (req, res) => {
  const { userId, vehicleId } = req.params

  app.get('db').remove_owner([ vehicleId, userId ])
  .then(vehicle => {
    res.status(200).json(vehicle)
  })
  .catch(err => console.error(err)) 
})

//** Vehicle controller end points **//

//Retrieves all vehicles from the DB
app.get('/api/vehicles', (req, res) => {
  app.get('db').get_vehicles()
    .then(vehicles => res.status(200).json(vehicles))
    .catch(err => console.error(err))
});

//Creates a vehicle and adds it to the database
app.post('/api/vehicles', (req, res) => {
  const { make, model, year, owner_id } = req.body

  app.get('db').create_vehicle([make, model, year, owner_id])
    .then(newVehicle => {
      console.log(newVehicle)
      res.status(200).json(newVehicle)
    })
    .catch(err => console.error(err))
});

//Retrieves vehicles attached to an email or first letter of user's name.
app.get('/api/vehicle', (req, res) => {
  const { userEmail, userFirstStart } = req.query

  userEmail ? (
    app.get('db').display_vehicles_by_email([ userEmail ])
    .then(vehicles => {
      res.status(200).json(vehicles)
    })
    .catch(err => console.error(err))
  )
    :
    userFirstStart ? (
    app.get('db').display_vehicles_by_first([ 
      userFirstStart.toUpperCase().concat('%') 
    ])
    .then(vehicles => {
      res.status(200).json(vehicles)
    })
    .catch(err => console.error(err))
  ) : (
    res.status(500).json({ message: 'Wrong query' })
  )
})

//Retrieves vehicles that are earlier than the year 2000.
app.get('/api/newervehiclesbyyear', (req, res) => {
  app.get('db').display_vehicles_earlier_2000()
  .then(vehicles => {
    console.log(vehicles)
    res.status(200).json(vehicles)
  })
  .catch(err => console.error(err))
})

//Updates the owner of a specific vehicle
app.put('/api/vehicle/:vehicleId/user/:userId', (req, res) => {
  const { vehicleId, userId } = req.params

  app.get('db').change_owner([ vehicleId, userId ])
  .then(vehicle => {
    res.status(200).json(vehicle)
  })
  .catch(err => console.error(err))
})

//Removes a specific vehicle from the DB
app.delete('/api/vehicle/:vehicleId', (req, res) => {
  const { vehicleId } = req.params

  app.get('db').delete_vehicle([ vehicleId ])
  .then(vehicle => {
    res.status(200).json(vehicle)
  })
  .catch(err => console.error(err))
})



const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});