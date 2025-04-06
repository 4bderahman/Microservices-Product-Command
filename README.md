# Architecture de Microservices

Un projet simple démontrant une architecture de microservices avec Node.js, Express et MongoDB.

## Description

Ce projet est composé de quatre microservices indépendants:

1. **Service d'Authentification** (Port 4002) - Gère l'inscription et la connexion des utilisateurs avec JWT
2. **Service de Commandes** (Port 4001) - Gère la création et la récupération des commandes
3. **Service de Produits** (Port 4000) - Gère les produits et leur information
4. **Service de Livraison** (Port 4003) - Gère la livraison des commandes

## Installation

1. Clonez le dépôt:
```bash
git clone https://github.com/4bderahman/Microservices-Product-Command.git
cd Microservices-Product-Command
```

2. Installez les dépendances pour chaque service:
```bash
# Pour le service d'authentification
cd auth-service
npm init -y
npm install express mongoose jsonwebtoken bcryptjs

# Pour le service de commandes
cd ../commande-service
npm init -y
npm install express mongoose jsonwebtoken axios

# Pour le service de produits
cd ../produit-service
npm init -y
npm install express mongoose jsonwebtoken

# Pour le service de livraison
cd ../livraison-service
npm init -y
npm install express mongoose jsonwebtoken axios
```

## Utilisation

1. Démarrez chaque service dans un terminal séparé:

```bash
# Terminal 1 (Service d'Authentification)
cd auth-service
node index.js

# Terminal 2 (Service de Commandes)
cd commande-service
node index.js

# Terminal 3 (Service de Produits)
cd produit-service
node index.js

# Terminal 4 (Service de Livraison)
cd livraison-service
node index.js
```

2. Testez les API avec Postman:

### Service d'Authentification (Port 4002)

- Inscription: `POST http://localhost:4002/auth/register`
- Connexion: `POST http://localhost:4002/auth/login`
- Profil utilisateur: `GET http://localhost:4002/auth/profil`

### Service de Produits (Port 4000)

- Créer un produit: `POST http://localhost:4000/produit/ajouter`
- Obtenir un produit: `GET http://localhost:4000/produit/:id`
- Mettre à jour le stock: `PATCH http://localhost:4000/produit/:id/stock`

### Service de Commandes (Port 4001)

- Créer une commande: `POST http://localhost:4001/commande/ajouter`
- Obtenir une commande par ID: `GET http://localhost:4001/commande/:id`
- Mettre à jour le statut: `PATCH http://localhost:4001/commande/:id/statut`

### Service de Livraison (Port 4003)

- Créer une livraison: `POST http://localhost:4003/livraison/ajouter`
- Mettre à jour le statut: `PUT http://localhost:4003/livraison/:id`
- Obtenir les livraisons: `GET http://localhost:4003/livraison/list`
- Obtenir une livraison: `GET http://localhost:4003/livraison/:id`

