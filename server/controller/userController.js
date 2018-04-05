module.exports = {
  getUsers: (req, res) => {
    app.get('db').getAllUsers()
    .then(users => res.status(200).json(users))
    .catch(err => console.error(err))
  }

}