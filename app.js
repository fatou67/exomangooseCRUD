const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const app = express(); 

// Configuration du moteur de vue Pug
app.set('view engine', 'pug');
app.set('views', './views');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connexion à MongoDB avec Mongoose
mongoose.connect('mongodb://localhost:27017/usersDB');

// Schéma utilisateur
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  age: { type: Number, min: 1, required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/ },
  telephone: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Routes
// afficher le formulaire
app.get('/', (req, res) => {
  res.render('formulaire');
});
app.get('/formulaire', (req, res) => {
  res.render('formulaire');
});

app.get('/users/', async (req, res) => {
  try {
    const users = await User.find(); 
    res.render('users', { users: users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur du serveur");
  }
});


// Route pour gérer la soumission du formulaire
app.post('/users:id', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).redirect('/users');
  } catch (error) {
    res.status(400).send('Erreur : ' + error.message);
  }
});

// supprimer un utilisateur par ID
app.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).send("Utilisateur non trouvé");
    }
    res.redirect('/users'); // Redirige vers la liste des utilisateurs
  } catch (err) {
    res.status(500).send("Erreur lors de la suppression : " + err.message);
  }
});



app.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(updatedUser); 
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err });
  }
});


// Démarrer le serveur
app.listen(3000, () => console.log('Serveur démarré sur le port 3000'));
